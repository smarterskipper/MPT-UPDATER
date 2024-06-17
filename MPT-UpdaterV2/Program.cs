using MPTUPDATERV2Renderer;
using MPTUPDATERV2SaveData;
using MPTUPDATERV2GlobalVariables;
using System.Reflection;
// Runs on start of Program.
namespace MPTUPDATERV2App
{
    class Program
    {
        static void Main()
        {//Starts The Renderer.

            Assembly assembly = Assembly.GetExecutingAssembly();
            foreach (string resourceName in assembly.GetManifestResourceNames())
            {
                Console.WriteLine(resourceName);
            }
            if (File.Exists(GlobalVariables.SaveDataPath))
            {
                SaveData.RunRead();
            }
            Renderer renderer = new Renderer();
            Thread renderThread = new Thread(renderer.Start().Wait);
            renderThread.Start();
        }

        public static void Close()
        {
            // Clean up resources and exit the application
            Environment.Exit(0);
        }
    }
}