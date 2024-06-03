# MPT Updater
![image](https://github.com/smarterskipper/MPT-UPDATER/assets/100497831/af1232bf-be7c-4fba-9095-26d2e27f1212)

MPTUpdater is a console application designed to update the Mods, Plugins, and Configurations of the MPT client from a specified GitHub repository. It automates the process of cloning the repository, deleting old files, and copying the new ones into place.

## Features

- Configurable GitHub repository URL
- Progress bar to show the status of the update
- Automatic deletion of old mods, plugins, and config files
- Cloning and copying of new files from the repository

## Prerequisites

- [.NET Core SDK](https://dotnet.microsoft.com/download)
- [LibGit2Sharp](https://github.com/libgit2/libgit2sharp) library
- [ShellProgressBar](https://github.com/Mpdreamz/shellprogressbar) library

## Getting Started

### Giude on setting up github repo to work with your server 
- [https://github.com/lukas-gust/mpt-updater-template/tree/main](https://github.com/lukas-gust/mpt-updater-template/tree/main)
  
### Installation
- Drag MPT-Updater.exe into your user>mods Folder.

### Mods/Configs/Plugins Setup Online.
- Via Github, create a new blank Repo
- Upload Your Files with MPT File Structure.
- Upload your user folder with only the mods folder within it.
- Upload your BepInEx folder with the config and plugins folder within it.
- Make sure capitalization on the folder names are the exact same as in your mpt local folder on your computer.
- Now when using the MPT.Updater.exe you can input your github link into the url section
- Your repo should look exaactly like this https://github.com/smarterskipper/MPT-Skipper


### Running the Application

1. Ensure the executable is placed in the Mods folder of your MPT client.

2. Run the application

3. Follow the on-screen instructions to configure the GitHub repository URL or use a preset.

### Configuration

You can configure the GitHub repository URL in two ways:

1. **Enter the URL manually:**
   - Select option `1` from the main menu.
   - Enter the desired GitHub repository URL.

2. **Use a preset URL:**
   - Select option `2` from the configuration menu to use the preset URL (`https://github.com/smarterskipper/MPT-Skipper`).

## Usage

1. **Configure GitHub Repo URL**
   - Select this option to set or change the GitHub repository URL.

2. **Update MPT Client**
   - Select this option to start the update process. The application will delete the existing Mods, Plugins, and Config files and replace them with the ones from the specified repository.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

---

### Code Breakdown

The application consists of several main functions:

- **Main:** The entry point of the application that handles user input and controls the flow of the application.
- **CleanUP:** Deletes temporary and git directories used during the update process.
- **ForceDeleteDirectory:** Force deletes a directory and all its contents.
- **DelRepo:** Deletes the Mods, Plugins, and Config directories.
- **IsLocked:** Checks if a file is currently in use by another process.
- **FileRemove:** Deletes files and directories within a specified path.
- **RepoDL:** Clones the GitHub repository to a temporary location and copies its contents to the MPT client directory.
- **CopyDirectory:** Copies all files and directories from the source path to the target path.

The application uses the `LibGit2Sharp` library for cloning the repository and `ShellProgressBar` for displaying the progress of the update process.
