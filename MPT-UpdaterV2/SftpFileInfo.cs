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

        public (List<(string Path, long Size)> FilesOnlyInSftp, List<(string Path, long Size)> FilesWithDifferentSizes, List<(string Path, long Size)> FilesOnlyInLocal, Dictionary<string, string> FileMessages) CompareFiles(List<(string Path, long Size)> sftpFiles, List<(string Path, long Size)> localFiles)
        {
            // Normalize paths for comparison
            var normalizedSftpFiles = sftpFiles.Select(f => (Path: f.Path.Trim().ToLowerInvariant(), f.Size)).ToList();
            var normalizedLocalFiles = localFiles.Select(f => (Path: f.Path.Trim().ToLowerInvariant(), f.Size)).ToList();

            // Separate directories and files
            var sftpDirectories = normalizedSftpFiles.Where(f => f.Path.EndsWith("/")).ToList();
            var localDirectories = normalizedLocalFiles.Where(f => f.Path.EndsWith("/")).ToList();
            var sftpFilesOnly = normalizedSftpFiles.Except(sftpDirectories).ToList();
            var localFilesOnly = normalizedLocalFiles.Except(localDirectories).ToList();

            // Files that exist only in SFTP
            var filesOnlyInSftp = sftpFilesOnly.Where(sf => !localFilesOnly.Any(lf => lf.Path == sf.Path)).ToList();
            // Files that exist only in Local
            var filesOnlyInLocal = localFilesOnly.Where(lf => !sftpFilesOnly.Any(sf => sf.Path == lf.Path)).ToList();
            // Files with different sizes
            var filesWithDifferentSizes = sftpFilesOnly
                .Join(localFilesOnly, sf => sf.Path, lf => lf.Path, (sf, lf) => new { sf.Path, sf.Size, LocalSize = lf.Size })
                .Where(f => f.Size != f.LocalSize)
                .Select(f => (f.Path, f.Size))
                .ToList();

            var fileMessages = new Dictionary<string, string>();
            foreach (var file in filesWithDifferentSizes)
            {
                fileMessages[file.Path] = "Different size from remote file.";
            }

            foreach (var file in filesOnlyInSftp)
            {
                fileMessages[file.Path] = "Exists only in the remote directory.";
            }

            foreach (var file in filesOnlyInLocal)
            {
                fileMessages[file.Path] = "Exists only in the local directory.";
            }

            // Debug output to verify the logic
            Console.WriteLine("SFTP Files:");
            foreach (var file in normalizedSftpFiles)
            {
                Console.WriteLine(file.Path);
            }
            Console.WriteLine("Local Files:");
            foreach (var file in normalizedLocalFiles)
            {
                Console.WriteLine(file.Path);
            }
            Console.WriteLine("Files Only in SFTP:");
            foreach (var file in filesOnlyInSftp)
            {
                Console.WriteLine(file.Path);
            }
            Console.WriteLine("Files Only in Local:");
            foreach (var file in filesOnlyInLocal)
            {
                Console.WriteLine(file.Path);
            }
            Console.WriteLine("Files with Different Sizes:");
            foreach (var file in filesWithDifferentSizes)
            {
                Console.WriteLine(file.Path);
            }

            return (filesOnlyInSftp, filesWithDifferentSizes, filesOnlyInLocal, fileMessages);
        }

        public async Task<(List<(string Path, long Size)> FilesOnlyInSftp, List<(string Path, long Size)> FilesWithDifferentSizes, List<(string Path, long Size)> FilesOnlyInLocal)> CollectFilesToBeChangedAsync()
        {
            var sftpFiles = new List<(string Path, long Size)>();
            var localFiles = GetLocalFiles();

            try
            {
                UpdateMessage("Checking For Updates...");
                Connect();

                var rootDirectory = GetRootDirectory();
                sftpFiles = GetSftpFiles(rootDirectory);
                UpdateMessage("Received SFTP File List!");

                // Normalize file paths for comparison
                sftpFiles = sftpFiles.Select(f => (f.Path.Replace("\\", "/"), f.Size)).ToList();
                localFiles = localFiles.Select(f => (f.Path.Replace("\\", "/"), f.Size)).ToList();
                UpdateMessage("Normalized File Paths!");

                var (filesOnlyInSftp, filesWithDifferentSizes, filesOnlyInLocal, _) = CompareFiles(sftpFiles, localFiles);

                if (filesOnlyInSftp.Count == 0 && filesWithDifferentSizes.Count == 0)
                {
                    UpdateMessage("No Update Found, Files Up To Date!");
                    return (new List<(string Path, long Size)>(), new List<(string Path, long Size)>(), new List<(string Path, long Size)>());
                }

                UpdateMessage("Replacement List Created!");
                return (filesOnlyInSftp, filesWithDifferentSizes, filesOnlyInLocal);
            }
            catch (Exception e)
            {
                Renderer.outputMessage = "Collect Files To Be Changed Error! - " + e.Message;
                return (new List<(string Path, long Size)>(), new List<(string Path, long Size)>(), new List<(string Path, long Size)>());
            }
            finally
            {
                Disconnect();
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

                // Normalize file paths for comparison
                sftpFiles = sftpFiles.Select(f => (f.Path.Replace("\\", "/"), f.Size)).ToList();
                localFiles = localFiles.Select(f => (f.Path.Replace("\\", "/"), f.Size)).ToList();
                UpdateMessage("Normalized File Paths!");

                var (filesOnlyInSftp, filesWithDifferentSizes, _, fileMessages) = CompareFiles(sftpFiles, localFiles);

                UpdateMessage("File comparison completed!");

                float progressStep = 1.0f / (filesWithDifferentSizes.Count + filesOnlyInSftp.Count);
                float currentProgress = 0.0f;

                // Handle files with different sizes
                foreach (var file in filesWithDifferentSizes)
                {
                    string localPath = Path.Combine(GlobalVariables.LocalRootdir, file.Path.Substring(1));
                    var fileAction = folderActions.FirstOrDefault(fa => fa.FolderPath == file.Path);

                    if (fileAction != null)
                    {
                        if (fileAction.KeepLocalVersion)
                        {
                            Renderer.outputMessageList.Add($"{file.Path}: Skipped (Keep Local Version).");
                            // Skip this file
                            continue;
                        }

                        if (fileAction.UpdateToNew)
                        {
                            // Update the local file with the new one from SFTP
                            using (var fileStream = new FileStream(localPath, FileMode.Create, FileAccess.Write, FileShare.None))
                            {
                                await sftp.GetFileAsync(file.Path, fileStream); // Perform file download asynchronously
                            }

                            changedFiles.Add(localPath); // Add the path to the list of changed files
                        }
                    }

                    // Update progress
                    currentProgress += progressStep;
                    Renderer.Progress = currentProgress;
                }

                // Handle files only in SFTP (new files)
                foreach (var file in filesOnlyInSftp)
                {
                    string localPath = Path.Combine(GlobalVariables.LocalRootdir, file.Path.Substring(1));

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

                    Renderer.outputMessageList.Add($"{file.Path}: Added (New file from remote).");

                    // Update progress
                    currentProgress += progressStep;
                    Renderer.Progress = currentProgress;
                }

                // Add detailed messages to the output
                foreach (var message in fileMessages)
                {
                    Renderer.outputMessageList.Add($"{message.Key}: {message.Value}");
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
