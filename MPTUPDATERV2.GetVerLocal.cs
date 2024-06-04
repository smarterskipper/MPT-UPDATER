//Gets File Version Info From Local MPT Dir
using System.Diagnostics;
namespace MPTUPDATERV2.GetVerLocal
{
    class GetVerLocal
    {
        
        public static List<string> GVL(string path)
        {
            
            string[] files = Directory.GetFiles(path, "*", SearchOption.AllDirectories);
            List<string> versionFiles = new List<string>();


            
            foreach (string file in files)
            {
                FileVersionInfo verFile = FileVersionInfo.GetVersionInfo(file);
                versionFiles.Add(verFile.FileName + verFile.FileVersion);
            }


            
            return versionFiles;
        }
    }
}