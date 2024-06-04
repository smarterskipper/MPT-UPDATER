using ClickableTransparentOverlay;
using ImGuiNET;
using MPTUPDATERV2CheckForUpdates;

//Renders GUI For User Control and Configuration.
namespace MPTUPDATERV2Renderer
{
    public class Renderer : Overlay
    {
        // window variabled
        public static bool clicked = false;
        public static string github = "ENTER GITHUB LINK HERE";
        public static bool showUpdateWindow = false;
        public static bool showSaveButton = true;
        


        protected override void Render()
        {
            // draw stuff here
            ImGui.Begin("MPT Updater");
            ImGui.NewLine();
            ImGui.NewLine();
            ImGui.NewLine();
            if (ImGui.InputText("", ref github, 64))
            {
                
            }
            if (showSaveButton)
            {
                if (ImGui.Checkbox("Save Github ENTRY", ref clicked))
                {

                }
            }
            if (showUpdateWindow == false && clicked == true && github != "ENTER GITHUB LINK HERE")
            {
                ImGui.Checkbox("Check For Updates", ref showUpdateWindow);
            }
            if (showUpdateWindow)
            {
                ImGui.Begin(" ", ref showUpdateWindow);
                ImGui.Text($"Checking For Updates Using {github}");
                CheckForUpdates.CheckUpdate();
                if (ImGui.Button("Cancel Update"))
                    showUpdateWindow = false;
            }

            ImGui.End();
        }
    }
}
