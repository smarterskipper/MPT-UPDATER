using System;
using System.IO;
using LibGit2Sharp;
using ShellProgressBar;

namespace MPTUpdater
{
    class Program
    {       
        public static void Main()
        {       
            //                                                                                  Variable declariation.
            string currentWorkingDirectory = Directory.GetCurrentDirectory();
            string githubURL = "null";
            string answer = "null";

            //                                                                                  Text Color
            Console.ForegroundColor = ConsoleColor.Green;
            
            while (true)
            {
                //                                                                              Reset userInput to reset Loop.
                int userInput = 0;

                Console.Clear();
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine("1.Configure GitHub Repo URL\n2.Update");
                Console.ForegroundColor = ConsoleColor.Green;

                try
                {
                    userInput = Int32.Parse(Console.ReadLine());
                }
                catch (FormatException)
                {
                    Console.WriteLine($"Unable to parse '{userInput}'");
                }
                
                switch (userInput)
                {
                    case 1:
                        //                                                                      Get github link from user
                        Console.Clear();
                        Console.ForegroundColor = ConsoleColor.White;
                        Console.WriteLine("Enter GitHub Repo Link");
                        Console.ForegroundColor = ConsoleColor.Green;
                        githubURL = Console.ReadLine();
                        Console.Clear();
                        Console.ForegroundColor = ConsoleColor.White;
                        Console.WriteLine($"New URL Set As - {githubURL}");
                        Console.WriteLine("Press Enter To Continue");
                        Console.ForegroundColor = ConsoleColor.Green; 
                        Console.ReadLine();
                        break;

                    case 2:
                        //                                                                      Update the directories
                        Console.Clear();
                        Console.ForegroundColor = ConsoleColor.White;
                        Console.WriteLine($"Current GitHub URL Is {githubURL}");
                        Console.WriteLine("Is this Correct? Y / N");
                        Console.ForegroundColor = ConsoleColor.Green;
                        answer = Console.ReadLine();
                        answer = answer.ToLower();
                        if ( answer == "y" || answer == "yes" )
                        {
                            //                                                                   Send for DelDIR
                            DelDir(currentWorkingDirectory);
                            //                                                                   Send for RepoDL
                            RepoDL(githubURL, currentWorkingDirectory);
                        }
                        else
                        {
                            break;
                        }
                        
                        break;
                }
            }
        }
        public static void DelDir(string path)
        {
            //                                                                                  Delete Directories 
            //                                                                                  Output deleted files and folders in console
            //                                                                                  Provide progress bar for deletion.

            //                                                                                  Root Path Within MPT Stored As A Variable.
            string rootPath = Path.GetFullPath(Path.Combine(path, @"..\..\"));
            //                                                                                  Path To Mods Folder From Dynamic Root Path
            string modsDir = Path.GetFullPath(Path.Combine(rootPath, @"user\mods\"));
            //                                                                                  Path To Plugins Folder From Dynamic Root Path
            string pluginsDir = Path.GetFullPath(Path.Combine(rootPath, @"BepInEx\plugins\"));
            //                                                                                  Path To Config Folder From Dynamic Root Path
            string configDir = Path.GetFullPath(Path.Combine(rootPath, @"BepInEx\config\"));

            if (Directory.Exists(rootPath) && Directory.Exists(modsDir) && Directory.Exists(pluginsDir) && Directory.Exists(configDir))
            {
                Console.ForegroundColor = ConsoleColor.Blue;
                const int totalTicks = 5;
                var options = new ProgressBarOptions
                {
                    ProgressCharacter = '─',
                    ProgressBarOnBottom = true
                };
                using (var pbar = new ProgressBar(totalTicks, " ", options))
                {
                    pbar.Tick();
                    //                                                                          Remove mods folder content
                    FileRemove(modsDir);
                    pbar.Tick();
                    Thread.Sleep(200);
                    //                                                                          Remove plugins folder content
                    FileRemove(pluginsDir);
                    pbar.Tick();
                    Thread.Sleep(200);
                    //                                                                          Remove config folder content
                    FileRemove(configDir);
                    pbar.Tick();
                    Thread.Sleep(200);

                }
                Console.ForegroundColor = ConsoleColor.White;
            }
            else
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.Clear();
                Console.WriteLine("Directory Error!");
                Console.ForegroundColor = ConsoleColor.White;
                Console.ReadLine();
            }
        }

        public static bool IsLocked(string filePath)
        {
            //                                                                                      Check if there is a lock on the current file for example if its currently being used by other program it will skip it
            FileInfo f = new FileInfo(filePath);
            FileStream stream = null;

            try
            {
                stream = f.Open(FileMode.Open, FileAccess.Read, FileShare.None);
            }
            catch (IOException ex)
            {
                return true;
            }
            finally
            {
                if (stream != null)
                    stream.Close();
            }
            return false;
        }


        public static void FileRemove(string folderPath)
        {//                                                                                        Remove files individually and directories individually 
            System.IO.DirectoryInfo di = new DirectoryInfo(folderPath);

            foreach (var file in Directory.GetFiles(folderPath))
            {
                
                if (!IsLocked(file))
                {
                    File.Delete(file);
                    Console.WriteLine($"Removing {file}");
                }   
            }
            foreach (DirectoryInfo dir in di.GetDirectories())
            {
                dir.Delete(true);
                Console.WriteLine($"Removing {dir}");
            }
            Console.Clear();
        }
        public static void RepoDL(string url,string path)
        {
            //                                                                                      validate repo and output error if not valid or failed.
            //                                                                                      Download Repo from github link provided by user.
            //                                                                                      Provide progress bar for download.
            string rootPath = Path.GetFullPath(Path.Combine(path, @"..\..\"));
            string savePath = Path.GetFullPath(Path.Combine(rootPath, @"TEMPREPOSAVE"));
            

            Console.ForegroundColor = ConsoleColor.Blue;
            const int totalTicks = 6;
            var options = new ProgressBarOptions
            {
                ProgressCharacter = '─',
                ProgressBarOnBottom = true
            };
            using (var pbar = new ProgressBar(totalTicks, " ", options))
            {

                //
                //     Clone repo to temp location
                FileRemove(savePath);
                Console.WriteLine($"Deleting Temp Directory {savePath}");
                pbar.Tick();
                pbar.Tick();
                Repository.Clone(url, savePath);
                Console.WriteLine($"Downloading {url} to {savePath}");
                pbar.Tick();
                Thread.Sleep(300);
                pbar.Tick();
                Thread.Sleep(300);
                //                                                                                  Copy temp data to MPT location
                CopyDirectory(savePath, rootPath, true);
                Console.WriteLine($"Copying {savePath} to {rootPath}");
                pbar.Tick();
                Thread.Sleep(300);
                pbar.Tick();
                Thread.Sleep(300);
                //                                                                                  Delete Temp data location.
                Console.WriteLine($"{savePath} path to be deleted");
                FileRemove(savePath);
                Console.WriteLine($"Deleting Temp Directory {savePath}");
                pbar.Tick();
                Thread.Sleep(300);
                Console.Clear();
                Console.WriteLine("Operation Completed.");
                Console.ReadLine();
            }
            Console.ForegroundColor = ConsoleColor.White;



        }
        static void CopyDirectory(string sourceDir, string destinationDir, bool recursive)
        {
            //                                                                                      Get information about the source directory
            var dir = new DirectoryInfo(sourceDir);

            //                                                                                      Check if the source directory exists
            if (!dir.Exists)
                throw new DirectoryNotFoundException($"Source directory not found: {dir.FullName}");

            //                                                                                      Cache directories before we start copying
            DirectoryInfo[] dirs = dir.GetDirectories();

            //                                                                                      Create the destination directory
            Directory.CreateDirectory(destinationDir);

            //                                                                                      Get the files in the source directory and copy to the destination directory
            foreach (FileInfo file in dir.GetFiles())
            {
                string targetFilePath = Path.Combine(destinationDir, file.Name);
                file.CopyTo(targetFilePath, true);
            }

            //                                                                                      If recursive and copying subdirectories, recursively call this method
            if (recursive)
            {
                foreach (DirectoryInfo subDir in dirs)
                {
                    string newDestinationDir = Path.Combine(destinationDir, subDir.Name);
                    CopyDirectory(subDir.FullName, newDestinationDir, true);
                }
            }
        }
    }    
}