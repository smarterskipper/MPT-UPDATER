import requests
import zipfile
import os
import shutil
import sys

def delete_directory_contents(dir_path):
    """Deletes all contents of a directory."""
    if os.path.exists(dir_path):
        print(f"Deleting contents of {dir_path}...")
        for filename in os.listdir(dir_path):
            file_path = os.path.join(dir_path, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    print(f"Deleting file: {file_path}")
                    os.unlink(file_path)  # Remove file or link
                elif os.path.isdir(file_path):
                    print(f"Deleting directory: {file_path}")
                    shutil.rmtree(file_path)  # Remove directory and all its contents
            except Exception as e:
                print(f'Failed to delete {file_path}. Reason: {e}')

def download_and_extract_repo():
    access_token = ""  # Add token here 
    repo_owner = "smarterskipper"
    repo_name = "MPT-Skipper"
    branch = "main"
    
    download_url = f"https://github.com/{repo_owner}/{repo_name}/archive/refs/heads/{branch}.zip"
    
    # Set the current directory based on whether the script is bundled
    if getattr(sys, 'frozen', False):
        current_dir = os.path.dirname(sys.executable)
    else:
        current_dir = os.path.dirname(os.path.abspath(__file__))
    
    print(f"Current directory: {current_dir}")

    # Paths to directories to clean
    mods_dir = os.path.join(current_dir,'MPT-Skipper-main', 'user', 'mods')
    plugins_dir = os.path.join(current_dir,'MPT-Skipper-main', 'BepInEx', 'plugins')

    print(f"Mods directory: {mods_dir}")
    print(f"Plugins directory: {plugins_dir}")

    # Clean  directories
    delete_directory_contents(mods_dir)
    delete_directory_contents(plugins_dir)

    # Download the repository as a ZIP file
    print(f"Downloading {download_url}...")
    headers = {'Authorization': f'token {access_token}'} if access_token else {}
    response = requests.get(download_url, headers=headers)
    response.raise_for_status()

    # Save the downloaded ZIP file
    local_zip_path = os.path.join(current_dir, f"{repo_name}-{branch}.zip")
    with open(local_zip_path, 'wb') as f:
        f.write(response.content)

    # Extract the ZIP file
    print(f"Extracting {local_zip_path} to {current_dir}...")
    with zipfile.ZipFile(local_zip_path, 'r') as zip_ref:
        zip_ref.extractall(current_dir)

    # Clean up the ZIP file
    os.remove(local_zip_path)
    print(f"Repository downloaded and extracted successfully to {current_dir}.")

if __name__ == "__main__":
    download_and_extract_repo()
