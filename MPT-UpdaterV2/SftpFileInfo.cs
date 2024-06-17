using MPTUPDATERV2Renderer;
using MPTUPDATERV2GlobalVariables;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Rebex.Net;

namespace MPTUPDATERV2SftpConnect
{
    public class SftpSyncManager
    {
        private string host;
        private string username;
        private string password;
        private Sftp sftp;

        public SftpSyncManager(string host, string username, string password)
        {
            this.host = host;
            this.username = username;
            this.password = password;
            this.sftp = new Sftp();
        }

        public void UpdateMessage(string message)
        {
            Renderer.updateMessage = message;
        }

        private void Connect()
        {
            Rebex.Licensing.Key = Renderer.key;
            sftp.Connect(host);
            sftp.Login(username, password);
        }

        private void Disconnect()
        {
            sftp.Disconnect();
        }

        public string GetRootDirectory()
        {
            try
            {
                string rootDirectory = sftp.GetCurrentDirectory();
                return rootDirectory;
            }
            catch (Exception ex)
            {
                Renderer.outputMessage = "Get Root Directory Error! - " + ex.Message;
                return null;
            }
        }

        public List<(string Path, long Size)> GetSftpFiles(string remotePath)
        {
            var fileList = new List<(string Path, long Size)>();

            try
            {
                SftpItemCollection items = sftp.GetList(remotePath);
                foreach (SftpItem item in items)
                {
                    string fullPath = Path.Combine(remotePath, item.Name).Replace("\\", "/");
                    if (item.IsFile)
                    {
                        fileList.Add((fullPath, item.Size));
                    }
                    else if (item.IsDirectory)
                    {
                        fileList.Add((fullPath + "/", 0));
                        fileList.AddRange(GetSftpFiles(fullPath)); // Recursively fetch files in subdirectories
                    }
                }
            }
            catch (Exception ex)
            {
                Renderer.outputMessage = "Get Sftp File Error! - " + ex.Message;
            }

            return fileList;
        }

        public List<(string Path, long Size)> GetLocalFiles()
        {
            var files = new List<(string Path, long Size)>();
            try
            {
                if (Directory.Exists(GlobalVariables.LocalRootdir))
                {
                    var localFiles = Directory.GetFiles(GlobalVariables.LocalRootdir, "*", SearchOption.AllDirectories);

                    foreach (var file in localFiles)
                    {
                        var fileInfo = new FileInfo(file);
                        string normalizedPath = "/" + file.Replace(GlobalVariables.LocalRootdir, "").Replace(Path.DirectorySeparatorChar, '/');
                        files.Add((normalizedPath, fileInfo.Length));
                    }
                }
                else
                {
                    Renderer.outputMessage = "Local Root Directory does not exist!";
                }
            }
            catch (Exception ex)
            {
                Renderer.outputMessage = "Error retrieving local files: " + ex.Message;
            }
            return files;
        }

        public (List<(string Path, long Size)> FilesOnlyInSftp, List<(string Path, long Size)> FilesOnlyInLocal, List<(string Path, long Size)> FilesWithDifferentSizes) CompareFiles(List<(string Path, long Size)> sftpFiles, List<(string Path, long Size)> localFiles)
        {
            var sftpDirectories = sftpFiles.Where(f => f.Path.EndsWith("/")).ToList();
            var localDirectories = localFiles.Where(f => f.Path.EndsWith("/")).ToList();

            var filesOnlyInSftp = sftpFiles.Except(localFiles).ToList();
            var filesOnlyInLocal = localFiles.Except(sftpFiles).ToList();
            filesOnlyInSftp.RemoveAll(f => sftpDirectories.Any(d => d.Path == f.Path));
            filesOnlyInLocal.RemoveAll(f => localDirectories.Any(d => d.Path == f.Path));

            var filesWithDifferentSizes = sftpFiles
                .Join(localFiles, sf => sf.Path, lf => lf.Path, (sf, lf) => new { sf.Path, sf.Size, LocalSize = lf.Size })
                .Where(f => f.Size != f.LocalSize)
                .Select(f => (f.Path, f.Size))
                .ToList();

            return (filesOnlyInSftp, filesOnlyInLocal, filesWithDifferentSizes);
        }

        private void RemoveLocalFolder(string folderPath)
        {
            try
            {
                Directory.Delete(folderPath, true);
            }
            catch (Exception ex)
            {
                Renderer.outputMessage = "Error removing folder: " + ex.Message;
            }
        }

        public async Task<List<string>> SyncDirectoriesAsync(List<FileAction> folderActions)
        {
            var changedFiles = new List<string>();
            var sftpFiles = new List<(string Path, long Size)>();
            var localFiles = GetLocalFiles();

            try
            {
                UpdateMessage("Checking For Updates...");
                Connect();

                var rootDirectory = GetRootDirectory();
                sftpFiles = GetSftpFiles(rootDirectory);
                UpdateMessage("Received SFTP File List!");

                // Apply folder actions
                foreach (var folderAction in folderActions)
                {
                    if (folderAction.Remove)
                    {
                        // Delete local folder and its contents
                        RemoveLocalFolder(folderAction.FolderPath);
                    }
                }

                // Normalize file paths for comparison
                sftpFiles = sftpFiles.Select(f => (f.Path.Replace("\\", "/"), f.Size)).ToList();
                localFiles = localFiles.Select(f => (f.Path.Replace("\\", "/"), f.Size)).ToList();
                UpdateMessage("Normalized File Paths!");

                var (filesOnlyInSftp, filesOnlyInLocal, filesWithDifferentSizes) = CompareFiles(sftpFiles, localFiles);

                if (filesOnlyInSftp.Count == 0 && filesWithDifferentSizes.Count == 0)
                {
                    UpdateMessage("No Update Found, Files Up To Date!");
                    return changedFiles;
                }

                // Combine the files that need to be downloaded (new files + different size files)
                var filesToDownload = filesOnlyInSftp.Concat(filesWithDifferentSizes).ToList();
                UpdateMessage("Download List Created!");

                float progressStep = 1.0f / filesToDownload.Count;
                float currentProgress = 0.0f;

                foreach (var file in filesToDownload)
                {
                    UpdateMessage("Getting Update...");

                    string localPath = Path.Combine(GlobalVariables.LocalRootdir, file.Path.Substring(1));
                    var fileAction = folderActions.FirstOrDefault(fa => fa.FolderPath == localPath);

                    if (fileAction != null)
                    {
                        if (fileAction.Keep)
                        {
                            // Skip this file
                            continue;
                        }
                        else if (fileAction.Remove)
                        {
                            // Remove the local file
                            if (File.Exists(localPath))
                            {
                                File.Delete(localPath);
                            }
                            continue;
                        }
                    }

                    if (file.Path.EndsWith("/"))
                    {
                        // Create directory if it doesn't exist
                        Directory.CreateDirectory(localPath);
                    }
                    else
                    {
                        // Create directory if it doesn't exist
                        Directory.CreateDirectory(Path.GetDirectoryName(localPath));
                        using (var fileStream = new FileStream(localPath, FileMode.Create, FileAccess.Write, FileShare.None))
                        {
                            await sftp.GetFileAsync(file.Path, fileStream); // Perform file download asynchronously
                        }

                        changedFiles.Add(localPath); // Add the path to the list of changed files
                    }

                    // Update progress
                    currentProgress += progressStep;
                    Renderer.Progress = currentProgress;
                }

                UpdateMessage("Operation Completed!");
                return changedFiles;
            }
            catch (Exception e)
            {
                Renderer.outputMessage = "Sync Directories Error! - " + e.Message;
                return new List<string>();
            }
            finally
            {
                Disconnect();
            }
        }
    }
}

