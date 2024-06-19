# MPT-UpdaterV2 🚀

MPT-UpdaterV2 is a powerful tool designed to keep your MPT mods up to date with ease. This README will guide you through the setup and installation process, as well as highlight some of the key features of this updater.

## Table of Contents 📚
- [Features ✨](#features-✨)
- [Setup Guide 🛠️](#setup-guide-️)
  - [For Server Owners 🖥️](#for-server-owners-️)
    - [1. Setup Rebex Tiny SFTP Server 🔧](#1-setup-rebex-tiny-sftp-server-)
    - [2. Obtain a Rebex Trial Key 🔑](#2-obtain-a-rebex-trial-key-)
  - [For Users 👥](#for-users-)
    - [1. Install MPT-UpdaterV2 📦](#1-install-mpt-updaterv2-)
    - [2. Configure the Updater ⚙️](#2-configure-the-updater-)
- [Automated Features 🤖](#automated-features-)
- [License 📜](#license-)

## Features ✨
- **Automatic Updates**: MPT-UpdaterV2 automatically checks for and downloads the latest versions of your mods.
- **Selective Syncing**: Allows you to keep local versions or update to the latest remote versions based on your preference.
- **Detailed Progress**: Provides detailed progress feedback during the update process.
- **Error Handling**: Robust error handling to ensure smooth operation even when issues arise.

## Setup Guide 🛠️

### For Server Owners 🖥️

#### 1. Setup Rebex Tiny SFTP Server 🔧
Rebex Tiny SFTP Server is a free SFTP server that is perfect for setting up a local SFTP server for testing and development purposes.

1. **Download Rebex Tiny SFTP Server**: [Rebex Tiny SFTP Server](https://rebex.net/tiny-sftp-server/)
2. **Install the Server**: Follow the instructions provided on the website to install the SFTP server on your local machine.
3. **Configure the Server**: Set up the directories and users as needed to host the mod files.
4. YOUR REBEX DATA FOLDER SHOULD LOOK LIKE THIS!
![Screenshot 2024-06-19 145233](https://github.com/smarterskipper/MPT-UPDATER/assets/100497831/22344352-d8c7-4eef-b8c5-09e29134c605)

#### 2. Obtain a Rebex Trial Key 🔑
To use Rebex libraries, you need a trial key.

1. **Request a Trial Key**: Visit the Rebex website to request a trial key: [Rebex Trial Key](https://rebex.net/support/trial-key/)
2. **Apply the Key**: Follow the Rebex documentation to apply the trial key in your SFTP server configuration.

### For Users 👥

#### 1. Install MPT-UpdaterV2 📦

1. **Download the Latest Release**: Go to the [Releases](https://github.com/smarterskipper/MPT-UPDATER/releases) page and download the latest zip file of MPT-UpdaterV2.
2. **Extract the Zip File**: Drag and drop the zip file into your MPT mods folder and extract all files directly into the mods folder.

#### 2. Configure the Updater ⚙️

1. **Open the Updater**: Launch the MPT-UpdaterV2 application.
2. **Enter SFTP Server Information**:
   - **Host**: Enter the host address provided by your server owner.
   - **Port**: Default is 22 unless specified otherwise.
   - **Username**: Enter your SFTP username.
   - **Password**: Enter your SFTP password.
   - **Rebex Key**: Enter the Rebex trial key provided by the server owner.
3. **Save Configuration**: Click "Save All" to store your configuration settings.
4. **Check for Updates**: Click "Check For Updates" to start the update process. Follow on-screen instructions to complete the update.

## Automated Features 🤖

MPT-UpdaterV2 automates several tasks behind the scenes to ensure your mods are always up to date:

- **Version Checking**: Automatically checks for the latest versions of your mods on the SFTP server.
- **File Synchronization**: Compares local and remote files to determine what needs to be updated.
- **Conflict Resolution**: Allows you to choose whether to keep local versions or update to new versions for conflicting files.
- **Progress Tracking**: Tracks and displays the progress of the update process, giving you real-time feedback.
- **Error Logging**: Logs any errors encountered during the update process to help with troubleshooting.

## License 📜
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
