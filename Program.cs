using System;
using LibGit2Sharp;
namespace MPTUpdater
{

    
    
    class Program
    {
        public static void Main(string[] args)
        {
            
            Console.WriteLine("Welcome to the MPTUpdater...");
            Console.WriteLine("1.Configure GitHub REPO/ Install Github REPO\n");


            var userInput = "0"; // variable for user input
            userInput = Console.ReadLine(); // gather user input and store in variable


            switch (userInput) // flow after selection is made.
            {
                case "1":
                    Console.Clear();
                    Console.WriteLine("Configure/Extract Selected......");
                    Thread.Sleep(3000);
                    Console.Clear();
                    Console.WriteLine("Input Github Repo Link Below......");
                    string repourl = Console.ReadLine();
                    string pathto = @"C:\test";
                    
                    DownloadGitHubRepo(repourl, pathto);
                    break;

                
            }
        }

        public static void DownloadGitHubRepo(string url, string path) // download github repo and extract it to directory.
        {
            
            Repository.Clone(url, path);

        }
    }
}
