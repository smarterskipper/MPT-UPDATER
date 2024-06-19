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
using System.Threading.Tasks;

namespace MPTUPDATERV2Renderer
{
    public class FileAction
    {
        public string FolderPath { get; }
        public bool KeepLocalVersion { get; set; }
        public bool UpdateToNew { get; set; }
        public bool RemoveLocalVersion { get; set; }

        public FileAction(string folderPath)
        {
            FolderPath = folderPath;
            KeepLocalVersion = false;
            UpdateToNew = false;
            RemoveLocalVersion = false;
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
        private static bool showOutputWindowBool = true;
        public static bool showFileManagementWindow = true;
        public static string outputMessage = string.Empty;
        public static string outputMessage2 = string.Empty;
        public static List<string> outputMessageList = new List<string>();
        public static List<string> outputMessageList2 = new List<string>();
        public static float Progress { get; set; }

        public static List<FileAction> folderActions = new List<FileAction>();

        private bool isRetrievingFiles = false;
        private List<string> filesToBeAdded = new List<string>();

        public Renderer()
        {
            ButtonClickHandler.SyncButtonClicked += OnSyncButtonClicked;
            Console.WriteLine("Renderer initialized.");
        }

        private async void OnSyncButtonClicked(object sender, SyncButtonEventArgs e)
        {
            string host = e.Host;
            string user = e.User;
            string pass = e.Pass;
            List<string> changedFiles = e.ChangedFiles;

            try
            {
                isRetrievingFiles = true;
                SftpSyncManager sftpSyncManager = new SftpSyncManager(host, user, pass);
                var (filesOnlyInSftp, filesWithDifferentSizes, filesOnlyInLocal, extraLocalFiles) = await sftpSyncManager.CollectFilesToBeChangedAsync();

                // Populate folderActions with the files to be changed, ensuring no duplicates
                folderActions.Clear();
                filesToBeAdded = filesOnlyInSftp;

                foreach (var file in filesWithDifferentSizes)
                {
                    folderActions.Add(new FileAction(file.Path));
                }

                foreach (var file in filesOnlyInLocal)
                {
                    folderActions.Add(new FileAction(file) { RemoveLocalVersion = true });
                }

                foreach (var file in extraLocalFiles)
                {
                    folderActions.Add(new FileAction(file.Path) { RemoveLocalVersion = true });
                }

                isRetrievingFiles = false;

                // Render the checkboxes and wait for user input
                showOutputWindow = true;

                // Wait for user interaction (you might need to implement a proper waiting mechanism or user prompt here)
                // Example: using a simple message loop or a more sophisticated approach
                while (showOutputWindow)
                {
                    await Task.Delay(100);
                }

                // After user input, proceed with the sync process
                await SyncFilesAsync(sftpSyncManager, folderActions);
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred: " + ex.Message);
                updateMessage = "An error occurred: " + ex.Message;
                showOutputWindow = true;
            }
        }

        private async Task SyncFilesAsync(SftpSyncManager sftpSyncManager, List<FileAction> folderActions)
        {
            try
            {
                List<string> changedFiles = await sftpSyncManager.SyncDirectoriesAsync(folderActions);
                outputMessageList = changedFiles;

                // Update UI to show completion message
                updateMessage = "Sync Completed!";
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred: " + ex.Message);
                updateMessage = "An error occurred: " + ex.Message;
            }
        }

        private Vector2 _windowSize = new Vector2(800, 400);
        private Vector2 _windowSize1 = new Vector2(800, 1000);

        protected override void Render()
        {
            // Console.WriteLine("Render method called."); // Comment out this line to prevent spamming

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

                    if (ImGui.Button("Check For Updates"))
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

                    if (showOutputWindowBool)
                    {
                        ImGui.SetNextWindowPos(window2Pos, ImGuiCond.Appearing);
                        ImGui.SetNextWindowSize(_windowSize1, ImGuiCond.Appearing);
                        ImGui.Begin("Output Window", ref showOutputWindow);

                        if (isRetrievingFiles)
                        {
                            ImGui.Text("Retrieving files...");
                        }
                        else
                        {
                            ImGui.Text(updateMessage);
                            ImGui.Text(outputMessage);
                            ImGui.ProgressBar(Progress, new Vector2(585, 5), " ");
                            ImGui.Text("Made By WiserSkipper");
                            ImGui.NewLine();

                            ImGui.Text($"Total files to be added: {filesToBeAdded.Count}");
                            ImGui.Text($"Total files to be removed: {folderActions.Count(fa => fa.RemoveLocalVersion)}");
                            ImGui.Text($"Total files to be updated to newer versions: {folderActions.Count(fa => !fa.RemoveLocalVersion && !filesToBeAdded.Contains(fa.FolderPath))}");

                            ImGui.Separator();

                            ImGui.Text("Files to be removed:");
                            foreach (var fileAction in folderActions.Where(fa => fa.RemoveLocalVersion))
                            {
                                ImGui.Text(fileAction.FolderPath);

                                bool removeLocalVersion = fileAction.RemoveLocalVersion;
                                ImGui.SameLine();
                                if (ImGui.Checkbox($"Remove Local Version##{fileAction.FolderPath}", ref removeLocalVersion))
                                {
                                    fileAction.RemoveLocalVersion = removeLocalVersion;
                                }
                            }

                            ImGui.Separator();

                            ImGui.Text("Files to be updated to newer versions:");
                            foreach (var fileAction in folderActions.Where(fa => !fa.RemoveLocalVersion && !filesToBeAdded.Contains(fa.FolderPath)))
                            {
                                ImGui.Text(fileAction.FolderPath);

                                // Use local variables to hold the checkbox values
                                bool keepLocalVersion = fileAction.KeepLocalVersion;
                                bool updateToNew = fileAction.UpdateToNew;

                                ImGui.SameLine();
                                if (ImGui.Checkbox($"Keep Local Version##{fileAction.FolderPath}", ref keepLocalVersion))
                                {
                                    if (keepLocalVersion)
                                    {
                                        fileAction.UpdateToNew = false; // Ensure mutual exclusivity
                                    }
                                    fileAction.KeepLocalVersion = keepLocalVersion;
                                }

                                ImGui.SameLine();
                                if (ImGui.Checkbox($"Update To Remote Version##{fileAction.FolderPath}", ref updateToNew))
                                {
                                    if (updateToNew)
                                    {
                                        fileAction.KeepLocalVersion = false; // Ensure mutual exclusivity
                                    }
                                    fileAction.UpdateToNew = updateToNew;
                                }
                            }

                            ImGui.Separator();

                            if (folderActions.Any() || filesToBeAdded.Any())
                            {
                                if (ImGui.Button("Update All To New Version"))
                                {
                                    foreach (var fileAction in folderActions)
                                    {
                                        fileAction.UpdateToNew = true;
                                        fileAction.KeepLocalVersion = false;
                                    }
                                }

                                ImGui.SameLine();

                                if (ImGui.Button("Continue"))
                                {
                                    showOutputWindow = false;
                                }
                            }
                        }

                        ImGui.End();
                    }
                }
            }
            ImGui.End();
        }
    }
}
