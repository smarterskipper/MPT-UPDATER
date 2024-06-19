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

        public void Connect()
        {
            Rebex.Licensing.Key = Renderer.key;
            sftp.Connect(host);
            sftp.Login(username, password);
        }

        public void Disconnect()
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

        public List<string> GetSftpFilePaths(string remotePath)
        {
            var fileList = new List<string>();

            try
            {
                SftpItemCollection items = sftp.GetList(remotePath);
                foreach (SftpItem item in items)
                {
                    string fullPath = Path.Combine(remotePath, item.Name).Replace("\\", "/");
                    if (item.IsFile)
                    {
                        fileList.Add(fullPath);
                    }
                    else if (item.IsDirectory)
                    {
                        fileList.Add(fullPath + "/");
                        fileList.AddRange(GetSftpFilePaths(fullPath)); // Recursively fetch files in subdirectories
                    }
                }
            }
            catch (Exception ex)
            {
                Renderer.outputMessage = "Get Sftp File Error! - " + ex.Message;
            }

            return fileList;
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

                        // Skip files in any folder named "MPT-Updater"
                        if (!normalizedPath.Contains("/MPT-Updater/"))
                        {
                            files.Add((normalizedPath, fileInfo.Length));
                        }
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

        public (List<string> FilesOnlyInSftp, List<(string Path, long Size)> FilesWithDifferentSizes, List<string> FilesOnlyInLocal, Dictionary<string, string> FileMessages) CompareFiles(List<string> sftpFilePaths, List<(string Path, long Size)> sftpFiles, List<(string Path, long Size)> localFiles)
        {
            var sftpDirectories = sftpFiles.Where(f => f.Path.EndsWith("/")).Select(f => f.Path).ToList();
            var localDirectories = localFiles.Where(f => f.Path.EndsWith("/")).Select(f => f.Path).ToList();

            var filesOnlyInSftp = sftpFilePaths
                .Where(sf => !localFiles.Any(lf => lf.Path == sf))
                .ToList();
            var filesOnlyInLocal = localFiles
                .Where(lf => !sftpFilePaths.Contains(lf.Path))
                .Select(lf => lf.Path)
                .Where(path => path.StartsWith("/BepInEx/plugins/") || path.StartsWith("/BepInEx/config/") || path.StartsWith("/user/mods/") || path.StartsWith("/user/cache/"))
                .ToList();

            filesOnlyInSftp.RemoveAll(f => sftpDirectories.Contains(f));
            filesOnlyInLocal.RemoveAll(f => localDirectories.Contains(f));

            var filesWithDifferentSizes = sftpFiles
                .Join(localFiles, sf => sf.Path, lf => lf.Path, (sf, lf) => new { sf.Path, sf.Size, LocalSize = lf.Size })
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
                fileMessages[file] = "Exists only in the remote directory.";
            }

            foreach (var file in filesOnlyInLocal)
            {
                fileMessages[file] = "Exists only in the local directory.";
            }

            return (filesOnlyInSftp, filesWithDifferentSizes, filesOnlyInLocal, fileMessages);
        }

        public async Task<(List<string> FilesOnlyInSftp, List<(string Path, long Size)> FilesWithDifferentSizes, List<string> FilesOnlyInLocal, List<(string Path, long Size)> ExtraLocalFiles)> CollectFilesToBeChangedAsync()
        {
            var sftpFilePaths = new List<string>();
            var sftpFiles = new List<(string Path, long Size)>();
            var localFiles = GetLocalFiles();

            try
            {
                UpdateMessage("Checking For Updates...");
                Connect();

                var rootDirectory = GetRootDirectory();
                sftpFilePaths = GetSftpFilePaths(rootDirectory);
                sftpFiles = GetSftpFiles(rootDirectory);
                UpdateMessage("Received SFTP File List!");

                // Normalize file paths for comparison
                sftpFilePaths = sftpFilePaths.Select(f => f.Replace("\\", "/")).ToList();
                sftpFiles = sftpFiles.Select(f => (f.Path.Replace("\\", "/"), f.Size)).ToList();
                localFiles = localFiles.Select(f => (f.Path.Replace("\\", "/"), f.Size)).ToList();
                UpdateMessage("Normalized File Paths!");

                var (filesOnlyInSftp, filesWithDifferentSizes, filesOnlyInLocal, _) = CompareFiles(sftpFilePaths, sftpFiles, localFiles);

                var extraLocalFiles = localFiles
                    .Where(lf => !sftpFilePaths.Contains(lf.Path) &&
                                 (lf.Path.StartsWith("/user/mods/") || lf.Path.StartsWith("/BepInEx/plugins/") || lf.Path.StartsWith("/BepInEx/config/")))
                    .ToList();

                if (filesOnlyInSftp.Count == 0 && filesWithDifferentSizes.Count == 0 && extraLocalFiles.Count == 0)
                {
                    UpdateMessage("No Update Found, Files Up To Date!");
                    return (new List<string>(), new List<(string Path, long Size)>(), new List<string>(), new List<(string Path, long Size)>());
                }

                UpdateMessage("Replacement List Created!");
                return (filesOnlyInSftp, filesWithDifferentSizes, filesOnlyInLocal, extraLocalFiles);
            }
            catch (Exception e)
            {
                Renderer.outputMessage = "Collect Files To Be Changed Error! - " + e.Message;
                return (new List<string>(), new List<(string Path, long Size)>(), new List<string>(), new List<(string Path, long Size)>());
            }
            finally
            {
                Disconnect();
            }
        }

        public async Task<List<string>> SyncDirectoriesAsync(List<FileAction> folderActions)
        {
            var changedFiles = new List<string>();

            try
            {
                var sftpFiles = new List<(string Path, long Size)>();
                var localFiles = GetLocalFiles();

                UpdateMessage("Checking For Updates...");
                Connect();

                var rootDirectory = GetRootDirectory();
                sftpFiles = GetSftpFiles(rootDirectory);
                UpdateMessage("Received SFTP File List!");

                // Normalize file paths for comparison
                sftpFiles = sftpFiles.Select(f => (f.Path.Replace("\\", "/"), f.Size)).ToList();
                localFiles = localFiles.Select(f => (f.Path.Replace("\\", "/"), f.Size)).ToList();
                UpdateMessage("Normalized File Paths!");

                var (filesOnlyInSftp, filesWithDifferentSizes, _, fileMessages) = CompareFiles(sftpFiles.Select(f => f.Path).ToList(), sftpFiles, localFiles);
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
                    string localPath = Path.Combine(GlobalVariables.LocalRootdir, file.Substring(1));

                    if (file.EndsWith("/"))
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
                            await sftp.GetFileAsync(file, fileStream); // Perform file download asynchronously
                        }

                        changedFiles.Add(localPath); // Add the path to the list of changed files
                    }

                    Renderer.outputMessageList.Add($"{file}: Added (New file from remote).");

                    // Update progress
                    currentProgress += progressStep;
                    Renderer.Progress = currentProgress;
                }

                // Handle files only in local that should be removed
                foreach (var fileAction in folderActions.Where(fa => fa.RemoveLocalVersion))
                {
                    string localPath = Path.Combine(GlobalVariables.LocalRootdir, fileAction.FolderPath.Substring(1));

                    if (File.Exists(localPath))
                    {
                        File.Delete(localPath);
                        Renderer.outputMessageList.Add($"{fileAction.FolderPath}: Removed (Only exists in local).");
                        changedFiles.Add(localPath);
                    }
                    else if (Directory.Exists(localPath))
                    {
                        Directory.Delete(localPath, true);
                        Renderer.outputMessageList.Add($"{fileAction.FolderPath}: Removed (Only exists in local).");
                        changedFiles.Add(localPath);
                    }
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
