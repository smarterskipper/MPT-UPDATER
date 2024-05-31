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


                var userInput = "0"; // variable for user input
                userInput = Console.ReadLine(); // gather user input and store in variable

                // directories to clean

                string userModsPath = @"";


                switch (userInput) // flow after selection is made.
                {
                    case "1":
                        Console.Clear();
                        Console.WriteLine($"You Ented {userInput}\nEnter GitHub Repo Link");
                        Thread.Sleep(2000);
                        
                        string repourl = Console.ReadLine();
                        string pathto = System.IO.Path.GetDirectoryName(System.Windows.Forms.Application.ExecutablePath);






                        Console.WriteLine($"Saving to - {pathto} ");
                        Thread.Sleep(1500);
                        DownloadGitHubRepo(repourl, pathto);
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
