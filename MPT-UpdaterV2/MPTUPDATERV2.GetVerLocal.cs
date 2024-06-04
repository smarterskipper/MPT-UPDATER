using System.Diagnostics;

//Gets File Version Info From Local MPT Dir
//Outputs: List<string> versionFiles i.E path/path/path/path/pathx.x.x.x < path merged with version number
namespace MPTUPDATERV2GetVerLocal
{
    class GetVerLocal
    {
        public static List<string> GVL(string path)
        {
            
            string[] files = Directory.GetFiles(path, "*", SearchOption.AllDirectories);
            List<string> LocalversionFiles = new List<string>();


            
            foreach (string file in files)
            {
                FileVersionInfo verFile = FileVersionInfo.GetVersionInfo(file);
                LocalversionFiles.Add(verFile.FileName + verFile.FileVersion);
            }


            
            return LocalversionFiles;
        }
    }
}