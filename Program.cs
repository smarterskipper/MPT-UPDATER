using System;
using System.IO;
namespace mptUpdate;

class Program
{

    static void Main(string[] args)
    {
        var driveIncrom = 0;
        var driveSelect = "null";
        DriveInfo[] allDrives = DriveInfo.GetDrives();

        Console.WriteLine("Welcome to MPT Updater!");
        Console.WriteLine("Press Enter to Continue...");
        Console.Read();

        Console.Clear();

        Console.WriteLine("Do you have the Official Tarkov Installed and Updated?");
        Console.WriteLine("Y for Yes, N for No");
        var answer = Console.ReadLine();

        if (answer == "Y")
        {
            Console.Clear();
            Console.WriteLine("What Drive would you like to install MPT on?");
            foreach (DriveInfo d in allDrives)
            {
                Console.WriteLine($"{driveIncrom}");
                Console.WriteLine("Drive {0}", d.Name);
                if (d.IsReady == true)
                {
                    driveIncrom++;
                    
                    Console.WriteLine("Total available space:{0, 15} bytes", d.TotalFreeSpace);
                    Console.WriteLine("\b");
                }
            }
            driveSelect = Console.ReadLine();

            

            
        }
        else
        {
            Console.Clear();
            Console.WriteLine($"You entered {answer}");
            Console.WriteLine("You must have tarkov installed and updated to use this program....");
            Console.Read();
        }

   



    }
}
