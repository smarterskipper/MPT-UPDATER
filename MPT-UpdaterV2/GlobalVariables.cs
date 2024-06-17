using Rebex.Net;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MPTUPDATERV2GlobalVariables
{
    public class GlobalVariables
    {
        //LocalPaths
        public static string LocalDir = Directory.GetCurrentDirectory();
        public static string LocalRootdir = Path.GetFullPath(Path.Combine(LocalDir, $@"../../../"));
        public static string SaveDataPath = Path.GetFullPath(Path.Combine(LocalDir, $@"SavedData.txt"));
        public static string BepInExDir = Path.GetFullPath(Path.Combine(LocalRootdir, $@"BepInEx/"));
        public static string UserDir = Path.GetFullPath(Path.Combine(LocalRootdir, $@"user/"));
        public static string ModsDir = Path.GetFullPath(Path.Combine(UserDir, $@"mods/"));
        public static string PluginsDir = Path.GetFullPath(Path.Combine(BepInExDir, $@"plugins/"));
        public static string UserCacheDir = Path.GetFullPath(Path.Combine(UserDir, $@"cache/"));
        public static string ConfigDir = Path.GetFullPath(Path.Combine(BepInExDir, $@"config/"));
        public static string BepInExCache = Path.GetFullPath(Path.Combine(BepInExDir, $@"cache/"));

        //RemoteFiles
        public static SftpItemCollection AllRemoteFiles = new SftpItemCollection();
        public static List<string> RemoteFileList = new List<string>();
        public static List<string> RemoteDirList = new List<string>();
        public static Dictionary<string, long> RemoteFileSizeList = new Dictionary<string, long>();
        public static Dictionary<string, long> CompareableRemoteFileList = new Dictionary<string, long>();

        //LocalFiles
        public static string[] LocalFiles = Array.Empty<string>();
        public static Dictionary<string, long> LocalFileSizeList = new Dictionary<string, long>();
        public static Dictionary<string, long> CompareableLocalFileList = new Dictionary<string, long>();
    }

}
