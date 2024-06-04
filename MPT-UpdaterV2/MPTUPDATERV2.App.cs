using MPTUPDATERV2Renderer;

// Runs on start of Program.
namespace MPTUPDATERV2App
{
    class App
    {
        static void Main()
        {
            // start imgui in a separate thread
            Renderer renderer = new Renderer();
       
            Thread renderThread = new Thread(renderer.Start().Wait);
            
            renderThread.Start();
            
        }
    }
}