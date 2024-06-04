
//Gets File Version Info From Source Files
//Outputs: List of fileversions concatinated with pathname like the GetVerLocal
using System.Diagnostics;

namespace MPTUPDATERV2GetVerExternal
{
    class GetVerExternal
    {
        public static List<string> GVE(string path)
        {

            string[] files = Directory.GetFiles(path, "*", SearchOption.AllDirectories);
            List<string> ExternalversionFiles = new List<string>();



            foreach (string file in files)
            {
                FileVersionInfo verFile = FileVersionInfo.GetVersionInfo(file);
                ExternalversionFiles.Add(verFile.FileName + verFile.FileVersion);
            }



            return ExternalversionFiles;
        }
    }
}
