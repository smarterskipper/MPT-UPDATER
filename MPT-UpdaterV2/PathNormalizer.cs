using MPTUPDATERV2Renderer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MPTUPDATERV2PathNormalizer
{
    class PathNormalizer
    {
        public static string Run(string path)
        {
            try
            {
                return path.Replace('\\', Path.DirectorySeparatorChar)
                       .Replace('/', Path.DirectorySeparatorChar);
            }
            catch (Exception e)
            {
                return Renderer.updateMessage = $" Path Normalizer Error! - {e.Message}";
            }
        }
    }
}

