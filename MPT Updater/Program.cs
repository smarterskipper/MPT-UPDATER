using System;
using System.IO;
using System.Net;
using System.Security.AccessControl;
using System.Security.Principal;
using System.Security.Permissions;
using LibGit2Sharp;
using ShellProgressBar;
using CG.Web.MegaApiClient;
using System.ComponentModel;

namespace MPTUpdater
{
    class Program
    {

        public const int totalTicks = 28;


        
        public static void Main()
        {

            var options = new ProgressBarOptions
            {
                ForegroundColor = ConsoleColor.Red,
                ProgressCharacter = '-',
                ProgressBarOnBottom = true,
                DisplayTimeInRealTime = false,
                CollapseWhenFinished = true,
            };
            

            //Variable declariation.
            string currentWorkingDirectory = Directory.GetCurrentDirectory();

            //Root Path Within MPT Stored As A Variable.
            string rootPath = Path.GetFullPath(Path.Combine(currentWorkingDirectory, @"..\..\"));

            //Path To .git Folder From Dynamic Root Path
            string gitDir = Path.GetFullPath(Path.Combine(rootPath, @".git\"));

            //Path To TempRepo Folder From Dynmaic Root Path
            string tempDir = Path.GetFullPath(Path.Combine(rootPath, @"TempRepo\"));

            string githubURL = "null";
            string answer;
            string megaURL = "null";
             




            //Text Color
            Console.ForegroundColor = ConsoleColor.Red;

            //Main Slection loop
            while (true)
            {
                Console.Clear();

                Console.WriteLine("\r\n███    ███ ██████  ████████               ██    ██ ██████  ██████   █████  ████████ ███████ ██████  \r\n████  ████ ██   ██    ██                  ██    ██ ██   ██ ██   ██ ██   ██    ██    ██      ██   ██ \r\n██ ████ ██ ██████     ██        █████     ██    ██ ██████  ██   ██ ███████    ██    █████   ██████  \r\n██  ██  ██ ██         ██                  ██    ██ ██      ██   ██ ██   ██    ██    ██      ██   ██ \r\n██      ██ ██         ██                   ██████  ██      ██████  ██   ██    ██    ███████ ██   ██ \r\n                                                                                                    \r\n                                                                                                    \r\n");
                if (githubURL != "null")
                {
                    Console.WriteLine($"\nCurrent Source URL: {githubURL}");
                }
                if (megaURL != "null")
                {
                    Console.WriteLine($"\nCurrent Source URL: {megaURL}");
                }

                
                int userInput = 0;
                Console.ForegroundColor = ConsoleColor.Red; Console.WriteLine("\nMake Sure This EXE Is In Your Mods Folder!\n"); Console.ForegroundColor = ConsoleColor.Red;
                Console.ForegroundColor = ConsoleColor.White; Console.WriteLine("\n1.Configure Source URL (files to be downloaded)\n\n2.Update MPT Client\n"); Console.ForegroundColor = ConsoleColor.Red;

                // error handling for userinput
                try
                {
                    userInput = Int32.Parse(Console.ReadLine());
                }
                catch (FormatException)
                {
                    Console.WriteLine($"Unable to parse '{userInput}'"); Console.ReadLine();
                }

                // switch case for selection of user input
                switch (userInput)
                {
                    case 1:
                        //Get github link from user
                        Console.Clear(); Console.ForegroundColor = ConsoleColor.White; Console.WriteLine("\n1.Enter GitHub Repo Link\n2.Enter Mega.nz Drive Link\n3.Use Skippers Server Preset.\n\n\n"); Console.ForegroundColor = ConsoleColor.Red;
                        int userInput2 = 0;
                        try
                        {
                            userInput2 = Int32.Parse(Console.ReadLine());
                        }
                        catch (FormatException)
                        {
                            Console.WriteLine($"Unable to parse '{userInput}'"); Console.ReadLine();
                        }
                        
                        if (userInput2 == 1)
                        {
                            Console.ForegroundColor = ConsoleColor.White;
                            Console.Clear();
                            Console.WriteLine("Enter GitHub URL:");
                            githubURL = Console.ReadLine();
                            Console.ForegroundColor = ConsoleColor.Red;
                            Console.Clear(); Console.ForegroundColor = ConsoleColor.White; Console.WriteLine($"\nNew URL Set As - {githubURL}"); Thread.Sleep(1000); Console.ForegroundColor = ConsoleColor.Red;
                        }
                        if (userInput2 == 2)
                        {
                            Console.ForegroundColor = ConsoleColor.White;
                            Console.Clear();
                            Console.WriteLine("Enter mega Drive URL:");
                            megaURL = Console.ReadLine();
                            Console.ForegroundColor = ConsoleColor.Red;
                            Console.Clear(); Console.ForegroundColor = ConsoleColor.White; Console.WriteLine($"\nNew URL Set As - {megaURL}"); Thread.Sleep(1000); Console.ForegroundColor = ConsoleColor.Red;
                        }
                        if (userInput == 2)
                        {
                            Console.ForegroundColor = ConsoleColor.White;
                            githubURL = @"https://github.com/smarterskipper/MPT-Skipper";
                            Console.ForegroundColor = ConsoleColor.Red;
                        }
                        break;


                    case 2:

                        
                        //temp save path for copies repo
                        string savePath = Path.GetFullPath(Path.Combine(rootPath, @"TempRepo\"));
                        //Update the directories
                        Console.Clear(); Console.ForegroundColor = ConsoleColor.White; Console.WriteLine($"\nCurrent GitHub URL Is {githubURL}\nCurrent Mega.nz Drive URL Is {megaURL}"); Console.WriteLine("\n\nIs this Correct? Y / N"); Console.ForegroundColor = ConsoleColor.Red;

                        //Variable to store userinput
                        answer = Console.ReadLine(); answer = answer.ToLower();
                        int sourceAnswer = 0;
                        string sourceURL = "null";
                        

                        //Answer check
                        if (answer == "y" || answer == "yes")
                        {
                            Console.Clear();
                            Console.WriteLine($"Which Source Are We Using Today? \n1.Github {githubURL} \n2.Mega.nz {megaURL}");
                            try
                            {
                                sourceAnswer = Int32.Parse(Console.ReadLine());
                                
                            }
                            catch (FormatException)
                            {
                                Console.WriteLine($"Unable to parse '{sourceAnswer}'"); Console.ReadLine();
                            }
                            switch (sourceAnswer)
                            {
                                case 1:
                                    if (sourceAnswer == 1)
                                    {

                                        sourceURL = githubURL;
                                    }
                                    break;
                                case 2:
                                    if (sourceAnswer == 2)
                                    {
                                        sourceURL = megaURL;
                                    }

                                    break;
                            }

                            Console.Clear();
                            Console.WriteLine("\r\n███    ███ ██████  ████████               ██    ██ ██████  ██████   █████  ████████ ███████ ██████  \r\n████  ████ ██   ██    ██                  ██    ██ ██   ██ ██   ██ ██   ██    ██    ██      ██   ██ \r\n██ ████ ██ ██████     ██        █████     ██    ██ ██████  ██   ██ ███████    ██    █████   ██████  \r\n██  ██  ██ ██         ██                  ██    ██ ██      ██   ██ ██   ██    ██    ██      ██   ██ \r\n██      ██ ██         ██                   ██████  ██      ██████  ██   ██    ██    ███████ ██   ██ \r\n                                                                                                    \r\n                                                                                                    \r\n");
                            Console.WriteLine("Starting Up...");
                            Thread.Sleep(1000);
                            Console.Clear();
                            Console.WriteLine("\r\n███    ███ ██████  ████████               ██    ██ ██████  ██████   █████  ████████ ███████ ██████  \r\n████  ████ ██   ██    ██                  ██    ██ ██   ██ ██   ██ ██   ██    ██    ██      ██   ██ \r\n██ ████ ██ ██████     ██        █████     ██    ██ ██████  ██   ██ ███████    ██    █████   ██████  \r\n██  ██  ██ ██         ██                  ██    ██ ██      ██   ██ ██   ██    ██    ██      ██   ██ \r\n██      ██ ██         ██                   ██████  ██      ██████  ██   ██    ██    ███████ ██   ██ \r\n                                                                                                    \r\n                                                                                                    \r\n");
                            using var pbar = new ProgressBar(totalTicks, "-", options);
                            pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500);
                            Console.ForegroundColor = ConsoleColor.White;
                            pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500);
                            Console.WriteLine($"Deleting Mods/Plugins/Configs...");
                            Thread.Sleep(1000);
                            //Send for DelDIR
                            DelRepo(currentWorkingDirectory);
                            pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500);
                            //Send for RepoDL
                            Console.WriteLine($"Downloading Mods/Plugins/Configs...");
                            Thread.Sleep(1000);
                            if(sourceAnswer == 1)
                            {
                                try
                                {
                                    RepoDL(sourceURL, currentWorkingDirectory);
                                    Console.WriteLine("Download-Completed!");
                                    Thread.Sleep(1000);
                                }
                                catch (Exception j)
                                {
                                    Console.Clear();
                                    Console.WriteLine("An Error Has Occured For GitHub Download Function...");
                                    Console.WriteLine(j.Message);
                                    Console.Read();
                                    break;
                                }
                                pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500);
                            }
                            if(sourceAnswer == 2)
                            {
                                try
                                {

                                    MegaDL(sourceURL, savePath);
                                    Console.WriteLine("Download-Completed!");
                                    Thread.Sleep(1000);
                                }
                                catch (Exception e)
                                {
                                    Console.Clear();
                                    Console.WriteLine("An Error Has Occured For Mega.nz Download Function...");
                                    Console.WriteLine(e.Message);
                                    Console.Read();
                                    break;
                                }
                                CopyDirectory(savePath, rootPath);
                                pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500);
                            }
                            
                            pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500);
                            //Send for CleanUp
                            Console.WriteLine($"Cleaning Up...\n");
                            Thread.Sleep(1000);
                            CleanUP(currentWorkingDirectory);
                            pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500); pbar.Tick(); Thread.Sleep(500);
                            Console.WriteLine("Operation Completed Successfully...\n");

                        }
                        else
                        {
                            break;
                        }

                        break;
                }
            }
        }
        static string GetParents(INode node, IEnumerable<INode> nodes)
        {
            List<string> parents = new List<string>();
            while (node.ParentId != null)
            {
                INode parentNode = nodes.Single(x => x.Id == node.ParentId);
                parents.Insert(0, parentNode.Name);
                node = parentNode;
            }

            return string.Join('\\', parents);
        }

        public static void MegaDL(string url, string path)
        {
            MegaApiClient client = new MegaApiClient();
            client.LoginAnonymous();

            Uri folderLink = new Uri(url);
            IEnumerable<INode> nodes = client.GetNodesFromLink(folderLink);
            foreach (INode node in nodes.Where(x => x.Type == NodeType.File))
            {
                string parents = GetParents(node, nodes);
                Directory.CreateDirectory(parents);
                Console.WriteLine($"Downloading {parents}\\{node.Name}");
                client.DownloadFile(node, Path.Combine(parents, node.Name));
            }

            client.Logout();
        }


        public static void CleanUP(string path)
        {

            string rootPath = Path.GetFullPath(Path.Combine(path, @"..\..\"));
            string gitPath = Path.GetFullPath(Path.Combine(rootPath, @".git\"));
            string savePath = Path.GetFullPath(Path.Combine(rootPath, @"TempRepo\"));

            if (Directory.Exists(savePath))
            {
                try
                {
                    ForceDeleteDirectory(savePath);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.ToString());
                    Console.Read();
                }
                
                
            }
            if (Directory.Exists(gitPath))
            {
                try
                {
                    ForceDeleteDirectory(gitPath);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.ToString());
                    Console.Read();
                }
            }



        }

        public static void ForceDeleteDirectory(string path)
        {
            var directory = new DirectoryInfo(path) { Attributes = FileAttributes.Normal };

            foreach (var info in directory.GetFileSystemInfos("*", SearchOption.AllDirectories))
            {
                info.Attributes = FileAttributes.Normal;
            }

            directory.Delete(true);
        }

        public static void DelRepo(string path)
        {
            
            //Root Path Within MPT Stored As A Variable.
            string rootPath = Path.GetFullPath(Path.Combine(path, @"..\..\"));

            //Path To Mods Folder From Dynamic Root Path
            string modsDir = Path.GetFullPath(Path.Combine(rootPath, @"user\mods\"));

            //Path To Plugins Folder From Dynamic Root Path
            string pluginsDir = Path.GetFullPath(Path.Combine(rootPath, @"BepInEx\plugins\"));

            //Path To Config Folder From Dynamic Root Path
            string configDir = Path.GetFullPath(Path.Combine(rootPath, @"BepInEx\config\"));

            

            //Check if neccisary directories exist
            if (Directory.Exists(rootPath) && Directory.Exists(modsDir) && Directory.Exists(pluginsDir) && Directory.Exists(configDir))
            {
                
                //Remove mods folder content
                FileRemove(modsDir);
                

                //Remove plugins folder content
                FileRemove(pluginsDir);
                

                //Remove config folder content
                FileRemove(configDir);
                    
                
            }

            else
            {
                //Error output for missing directories
                Console.ForegroundColor = ConsoleColor.Red; Console.Clear(); Console.WriteLine("Directory Error! Missing folders error."); Console.ForegroundColor = ConsoleColor.White; Console.ReadLine();
            }
        }

        public static bool IsLocked(string filePath)
        {
            
            //Check if there is a lock on the current file for example if its currently being used by other program it will skip it
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
        {
            //Remove files individually and directories individually 
            
            DirectoryInfo di = new DirectoryInfo(folderPath);

            foreach (var file in Directory.GetFiles(folderPath))
            {

                if (!IsLocked(file))
                {
                    File.Delete(file);
                }
            }
            foreach (DirectoryInfo dir in di.GetDirectories())
            {
                dir.Delete(true);
            }
            
        }
        public static void RepoDL(string url, string path)
        {
            
            //path to root of mpt folder                                                                                     
            string rootPath = Path.GetFullPath(Path.Combine(path, @"..\..\"));
            //temp save path for copies repo
            string savePath = Path.GetFullPath(Path.Combine(rootPath, @"TempRepo\"));
            

            Console.ForegroundColor = ConsoleColor.White;

            //Clone repo to temp location
            Repository.Clone(url, savePath);

            
            //Copy temp data to MPT location
            CopyDirectory(savePath, rootPath); 
        }


        private static void CopyDirectory(string sourcePath, string targetPath)
        {
            //Now Create all of the directories
            foreach (string dirPath in Directory.GetDirectories(sourcePath, "*", SearchOption.AllDirectories))
            {
                Directory.CreateDirectory(dirPath.Replace(sourcePath, targetPath));
            }

            //Copy all the files & Replaces any files with the same name
            foreach (string newPath in Directory.GetFiles(sourcePath, "*.*", SearchOption.AllDirectories))
            {
                File.Copy(newPath, newPath.Replace(sourcePath, targetPath), true);
            }
        }
    }
}