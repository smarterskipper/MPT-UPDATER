using ClickableTransparentOverlay;
using ImGuiNET;
using MPTUPDATERV2SaveData;
using MPTUPDATERV2SftpConnect;
using MPTUPDATERV2App;
using System.Reflection;
using System.Numerics;
using System.Diagnostics;
using System.IO;
using System.Collections.Generic;

namespace MPTUPDATERV2Renderer
{
    public class FileAction
    {
        public string FolderPath { get; }
        public bool Keep { get; set; }
        public bool Remove { get; set; }

        public FileAction(string folderPath)
        {
            FolderPath = folderPath;
            Keep = false;
            Remove = false;
        }
    }

    public class ButtonClickHandler
    {
        public static event EventHandler<SyncButtonEventArgs> SyncButtonClicked;

        public static void OnSyncButtonClicked(object sender, SyncButtonEventArgs e)
        {
            SyncButtonClicked?.Invoke(sender, e);
        }

        public static void OnExitButtonClicked()
        {
            Program.Close();
        }
    }

    public class SyncButtonEventArgs : EventArgs
    {
        public string Host { get; }
        public string User { get; }
        public string Pass { get; }
        public List<string> ChangedFiles { get; }

        public SyncButtonEventArgs(string host, string user, string pass, List<string> changedFiles)
        {
            Host = host;
            User = user;
            Pass = pass;
            ChangedFiles = changedFiles;
        }
    }

    public class Renderer : Overlay
    {
        public static string host = "";
        public static string port = "22";
        public static string user = "";
        public static string pass = "";
        public static string key = "";
        public static bool saved = false;
        public static string saveMessage = "SFTP Data Saved!";
        public static string updateMessage = " ";
        private static bool showOutputWindow = true;
        public static bool showFileManagemntWindow = true;
        public static string outputMessage = string.Empty;
        public static string outputMessage2 = string.Empty;
        public static List<string> outputMessageList = new List<string>();
        public static List<string> outputMessageList2 = new List<string>();
        public static float Progress { get; set; }

        public static List<FileAction> folderActions = new List<FileAction>();

        public Renderer()
        {
            ButtonClickHandler.SyncButtonClicked += OnSyncButtonClicked;
        }

        private async void OnSyncButtonClicked(object sender, SyncButtonEventArgs e)
        {
            string host = e.Host;
            string user = e.User;
            string pass = e.Pass;
            List<string> changedFiles = e.ChangedFiles;

            try
            {
                SftpSyncManager sftpSyncManager = new SftpSyncManager(host, user, pass);
                changedFiles = await sftpSyncManager.SyncDirectoriesAsync(folderActions);
                // Update the list of changed files
                outputMessageList = changedFiles;
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred: " + ex.Message);
                updateMessage = "An error occurred: " + ex.Message;
            }
        }

        private Vector2 _windowSize = new Vector2(800, 400);

        protected override void Render()
        {
            // Calculate window positions to center them and avoid overlap
            float windowWidth = 800; // Adjust as needed
            float windowHeight = 400; // Adjust as needed
            Vector2 window1Pos = new Vector2((ImGui.GetIO().DisplaySize.X - 2 * windowWidth) * 0.5f, (ImGui.GetIO().DisplaySize.Y - windowHeight) * 0.5f);
            Vector2 window2Pos = new Vector2(window1Pos.X + windowWidth, window1Pos.Y);
            

            

            
            ImGui.SetNextWindowPos(window1Pos, ImGuiCond.Appearing);
            ImGui.SetNextWindowSize(_windowSize, ImGuiCond.Appearing);
            ImGui.Begin("MPT Updater");

            ImGui.SetNextItemOpen(true);

            if (ImGui.TreeNode("SFTP"))
            {
                ImGuiTabBarFlags tab_bar_flags = ImGuiTabBarFlags.FittingPolicyDefault;

                if (ImGui.BeginTabBar("SFTP Tab Bar", tab_bar_flags))
                {
                    if (ImGui.BeginTabItem("Host"))
                    {
                        ImGui.Text("Enter Host For SFTP Connection");
                        ImGui.InputTextWithHint("host name", "localhost", ref host, 64);
                        ImGui.EndTabItem();
                    }

                    if (ImGui.BeginTabItem("Port"))
                    {
                        ImGui.Text("Enter Port For SFTP Connection");
                        ImGui.InputTextWithHint("port number", "22", ref port, 64);
                        ImGui.EndTabItem();
                    }

                    if (ImGui.BeginTabItem("User"))
                    {
                        ImGui.Text("Enter Username For SFTP Connection");
                        ImGui.InputTextWithHint("username", "bobjoe1", ref user, 64);
                        ImGui.EndTabItem();
                    }

                    if (ImGui.BeginTabItem("Pass"))
                    {
                        ImGui.Text("Enter Password For SFTP Connection");
                        ImGui.InputTextWithHint("password", "SuperSecurePassword123%", ref pass, 64);
                        ImGui.EndTabItem();
                    }

                    if (ImGui.BeginTabItem("Key"))
                    {
                        ImGui.Text("Enter Rebex Key For SFTP Connection");
                        ImGui.InputTextWithHint("Key", "==AOFkk3rK2V1YM/HF5BwdvQeLUJCoHQZGP/ESJuzKaaYk==", ref key, 64);
                        ImGui.EndTabItem();
                    }

                    if (ImGui.BeginTabItem("Save All"))
                    {
                        ImGui.Text("Save");
                        if (saved == true)
                        {
                            ImGui.Text(saveMessage);
                        }

                        if (ImGui.Button("Save All"))
                        {
                            if (saved == false)
                            {
                                SaveData.RunSave();
                                saved = true;
                            }
                        }

                        ImGui.EndTabItem();
                    }

                    ImGui.EndTabBar();
                    ImGui.TreePop();

                    ImGui.Separator();
                    ImGui.Text("Update - After Setting SFTP Info.");

                    if (ImGui.Button("Update"))
                    {
                        ButtonClickHandler.OnSyncButtonClicked(this, new SyncButtonEventArgs(host, user, pass, new List<string>()));
                    }
                    ImGui.Separator();

                    // Define the URL and display text
                    string url = "https://github.com/smarterskipper/MPT-UPDATER";

                    // Create an invisible button with the text
                    ImGui.Text("Go To GITHUB ReadMe.");

                    if (ImGui.ArrowButton("gitbutton", ImGuiDir.Right))
                    {
                        // Open the URL when the button is clicked
                        Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
                    }
                    ImGui.Separator();
                    // Restore the previous style
                    ImGui.PopStyleColor();
                    // Calculate the available space and the button position
                    Vector2 contentRegion = ImGui.GetContentRegionAvail();
                    float buttonHeight = ImGui.CalcTextSize("Button").Y + ImGui.GetStyle().FramePadding.Y * 2; // Calculate the button height
                    float spacingY = ImGui.GetStyle().ItemSpacing.Y;

                    // Set the cursor position to the calculated Y position
                    ImGui.SetCursorPosY(ImGui.GetCursorPosY() + contentRegion.Y - buttonHeight - spacingY);

                    if (ImGui.Button("Exit, Program"))
                    {
                        ButtonClickHandler.OnExitButtonClicked();
                    }
                    ImGui.Separator();

                    if (showOutputWindow)
                    {
                        ImGui.SetNextWindowPos(window2Pos, ImGuiCond.Appearing);
                        ImGui.SetNextWindowSize(_windowSize, ImGuiCond.Appearing);
                        ImGui.Begin("Output Window", ref showOutputWindow);
                        ImGui.Text(updateMessage);
                        ImGui.Text(outputMessage);
                        ImGui.ProgressBar(Progress, new Vector2(585, 5), " ");
                        ImGui.Text("Made By WiserSkipper");
                        ImGui.NewLine();
                        foreach (var item in outputMessageList)
                        {
                            ImGui.Text(item);
                        }

                        ImGui.End();
                    }
                }
            }
            ImGui.End();
        }
    }
}
