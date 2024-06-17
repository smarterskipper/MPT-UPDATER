using MPTUPDATERV2Renderer;
using MPTUPDATERV2GlobalVariables;

namespace MPTUPDATERV2SaveData
{
    public class SaveData
    {
        public static void RunSave()
        {
            if (File.Exists(GlobalVariables.SaveDataPath))
            {
                File.Delete(GlobalVariables.SaveDataPath);
            }
            
            TextWriter tw = new StreamWriter(GlobalVariables.SaveDataPath);

            // write lines of text to the file
            tw.WriteLine(Renderer.host);
            tw.WriteLine(Renderer.port);
            tw.WriteLine(Renderer.pass);
            tw.WriteLine(Renderer.user);
            tw.WriteLine(Renderer.key);
            
            // close the stream     
            tw.Close();
        }
        public static void RunRead()
        {
            // create reader & open file
            TextReader tr = new StreamReader(GlobalVariables.SaveDataPath);

            // read lines of text
            if (File.Exists(GlobalVariables.SaveDataPath))
            {
                Renderer.host = tr.ReadLine();
                Renderer.port = tr.ReadLine();
                Renderer.pass = tr.ReadLine();
                Renderer.user = tr.ReadLine();
                Renderer.key = tr.ReadLine();
            }
            // close the stream
            tr.Close();
        }
    }
}
