using MPTUPDATERV2Renderer;
using MPTUPDATERV2SaveData;
using MPTUPDATERV2GlobalVariables;
using System.Reflection;
using System.Threading;

namespace MPTUPDATERV2App
{
    class Program
    {
        static void Main()
        {
            // Load saved data if available
            if (File.Exists(GlobalVariables.SaveDataPath))
            {
                SaveData.RunRead();
            }

            // Initialize and start the renderer
            Renderer renderer = new Renderer();
            Thread renderThread = new Thread(() => renderer.Start().Wait());
            renderThread.Start();

            // Ensure the application doesn't exit immediately
            renderThread.Join();
        }

        public static void Close()
        {
            // Clean up resources and exit the application
            Environment.Exit(0);
        }
    }
}
