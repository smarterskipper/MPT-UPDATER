using System;
using System.IO;
using ShellProgressBar;

namespace MPTUpdater
{
    class Program
    {       
        public static void Main()
        {       
            // Variable declariation.
            string currentWorkingDirectory = Directory.GetCurrentDirectory();
            string githubURL = "null";
            string answer = "null";

            // Text Color
            Console.ForegroundColor = ConsoleColor.Green;
            
            while (true)
            {
                // Reset userInput to reset Loop.
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
                        // Get github link from user
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
                        // Update the directories
                        Console.Clear();
                        Console.ForegroundColor = ConsoleColor.White;
                        Console.WriteLine($"Current GitHub URL Is {githubURL}");
                        Console.WriteLine("Is this Correct? Y / N");
                        Console.ForegroundColor = ConsoleColor.Green;
                        answer = Console.ReadLine();
                        answer = answer.ToLower();
                        if ( answer == "y" || answer == "yes" )
                        {
                            // Send for DelDIR
                            DelDir(currentWorkingDirectory);
                            // Send for RepoDL
                            RepoDL(githubURL);
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
            // Delete Directories 
            // Output deleted files and folders in console
            // Provide progress bar for deletion.

            // Root Path Within MPT Stored As A Variable.
            string rootPath = Path.GetFullPath(Path.Combine(path, @"..\..\"));
            // Path To Mods Folder From Dynamic Root Path
            string modsDir = Path.GetFullPath(Path.Combine(rootPath, @"user\mods\"));
            // Path To Plugins Folder From Dynamic Root Path
            string pluginsDir = Path.GetFullPath(Path.Combine(rootPath, @"BepInEx\plugins\"));
            // Path To Config Folder From Dynamic Root Path
            string configDir = Path.GetFullPath(Path.Combine(rootPath, @"BepInEx\config\"));

            if (Directory.Exists(rootPath) && Directory.Exists(modsDir) && Directory.Exists(pluginsDir) && Directory.Exists(configDir))
            {
                Console.ForegroundColor = ConsoleColor.Blue;
                const int totalTicks = 4;
                var options = new ProgressBarOptions
                {
                    ProgressCharacter = '─',
                    ProgressBarOnBottom = true
                };
                using (var pbar = new ProgressBar(totalTicks, " ", options))
                {
                    pbar.Tick();
                    // Remove mods folder content
                    FileRemove(modsDir);
                    pbar.Tick();
                    Thread.Sleep(200);
                    // Remove plugins folder content
                    FileRemove(pluginsDir);
                    pbar.Tick();
                    Thread.Sleep(200);
                    // Remove config folder content
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
            System.IO.DirectoryInfo di = new DirectoryInfo(folderPath);

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
        public static void RepoDL(string url)
        {
            // validate repo and output error if not valid or failed.
            // Download Repo from github link provided by user.
            // Provide progress bar for download.
        }
    }    
}