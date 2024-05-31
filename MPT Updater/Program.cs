using System;
using LibGit2Sharp;
using System.Windows.Forms;
using System.IO;
namespace MPTUpdater
{

    
    
    class Program
    {
        public static void Main(string[] args)
        {
            while (true) 
            {

                Console.WriteLine("----------------------------------------------");
                Console.WriteLine("1.Configure GitHub REPO/ Install Github REPO\n");
                // current working directory
                string cWD = System.IO.Path.GetDirectoryName(System.Windows.Forms.Application.ExecutablePath);
                var userInput = "0"; // variable for user input
                userInput = Console.ReadLine(); // gather user input and store in variable

                // directories from root path.
                string rootDir = Path.GetFullPath(Path.Combine(cWD, @"..\..\"));
                string userPath = Path.Combine(rootDir, @"user\");
                string bepInExPath = Path.Combine(rootDir, @"BepInEx\");

                // directories to clean
                string userModsPath = Path.Combine(userPath, @"mods\");
                string bepInExPluginsPath = Path.Combine(bepInExPath, @"plugins\");
                string configPath = Path.Combine(bepInExPath, @"config\");


                switch (userInput) // flow after selection is made.
                {
                    case "1":
                        Console.Clear();
                        Console.WriteLine($"You Ented {userInput}\nEnter GitHub Repo Link");
                        Thread.Sleep(2000);
                        
                        string repourl = Console.ReadLine();

                        // deleting directories on local.
                        DeleteDirs(userModsPath);
                        Console.WriteLine($"Clearing Directory {userModsPath}");
                        DeleteDirs(bepInExPluginsPath);
                        Console.WriteLine($"Clearing Directory {bepInExPluginsPath}");
                        DeleteDirs(configPath);
                        Console.WriteLine($"Clearing Directory {configPath}");


                        // downloading/extracting github repo.
                        Console.WriteLine($"Saving to - {cWD} ");
                        Thread.Sleep(1500);
                        DownloadGitHubRepo(repourl, cWD);
                        break;


                }
            }
        }


        public static void DeleteDirs(string path)
        {

            Directory.Delete(path, true);
        }


        public static void DownloadGitHubRepo(string url, string path) // download github repo and extract it to directory.
        {

            string newPath = Path.GetFullPath(Path.Combine(path, @"..\..\"));
            Console.WriteLine(newPath);
            Repository.Clone(url, newPath);

        }
    }
}
