# VirusTotal Downloader Browser Extension

A browser extension that allows you to download files and automatically submit them to VirusTotal for malware scanning via a convenient right-click context menu option.

## Features

- **Right-click download**: Right-click on any link, image, video, or audio file and select "Download with VirusTotal"
- **Automatic scanning**: Files are automatically submitted to VirusTotal for malware analysis
- **Scan history**: View your recent scans and their VirusTotal results
- **Advanced secure API key storage**: Choose from two security levels - browser storage or external file storage
- **Real-time notifications**: Get notified when downloads start and scans are submitted
- **Cross-browser support**: Works with Chrome, Edge, and other Chromium-based browsers
- **Modern UI with dark mode**: Clean, responsive interface with collapsible sections and dark mode support
- **Automatic quota tracking**: Monitor your VirusTotal API usage with visual progress indicators

## Installation

### Prerequisites

1. **Get a VirusTotal API Key**:
   - Visit [VirusTotal](https://www.virustotal.com/gui/join-us)
   - Create a free account or sign in
   - Go to your profile and generate an API key

### Install the Extension

1. **Download or Clone this repository**:
   ```bash
   git clone https://github.com/Tojioo/VirusTotal-Downloader.git
   cd VirusTotal-Downloader
   ```

2. **Load Extension in Browser**:
   - Open Chrome/Edge and go to `chrome://extensions/` or `edge://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `VirusTotalExtension` folder
   - The extension should now appear in your extensions list

## Secure API Key Storage

This extension offers two levels of API key security to meet different user needs:

### 🖥️ Browser Storage (Recommended for most users)
- **Security Level**: Basic
- **How it works**: API key is encrypted and stored in browser's secure sync storage
- **Best for**: Most users who want convenience with reasonable security
- **Pros**: Syncs across devices, easy to set up, no additional files needed
- **Cons**: Tied to browser profile, accessible if browser is compromised

### 📁 External File Storage (Enhanced security)
- **Security Level**: Medium
- **How it works**: Load API key from a secure text file on your system
- **Best for**: Users who want control over physical storage location
- **Pros**: File system permissions control, separated from browser data
- **Cons**: Requires file management, temporary caching for usability
- **Setup**: Create a `.txt` file containing only your API key, store in secure location


## Setup

### Quick Setup (Browser Storage)
1. **Configure API Key**:
   - Click the VirusTotal Downloader extension icon in your browser toolbar
   - Ensure "Browser Storage" is selected (default)
   - Enter your VirusTotal API key in the input field
   - Click "Save API Key"
   - You should see a success message confirming the key is saved

### Advanced Setup (File Storage)
1. **Choose Storage Method**:
   - Click the extension icon to open the popup
   - In the "API Configuration" section, select "External File" storage method
   
2. **For External File Storage**:
   - Create a text file containing only your API key (no extra characters or spaces)
   - Save it as `virustotal_api.txt` in a secure location with restricted permissions
   - Click "Choose File" and select your API key file
   - Click "Load from File"

## Usage

1. **Download with VirusTotal**:
   - Browse to any website with downloadable files
   - Right-click on any link, image, video, or audio file
   - Select "Download with VirusTotal" from the context menu
   - The extension will download the file first, then automatically submit it to VirusTotal for scanning
   - Notifications will confirm the download and scan submission status

2. **View Scan Results**:
   - Click the extension icon to open the popup
   - Check the "Recent Scans" section to see your scan history
   - Click "View on VirusTotal" links to see detailed scan results
   - Use the "Refresh" button to update the scan history

## File Structure

```
VirusTotalExtension/
├── .gitignore             # Git ignore rules
├── manifest.json          # Extension configuration
├── package.json           # Project metadata
├── src/                   # Main extension source files
│   ├── background.js      # Background service worker
│   ├── content.js         # Content script for page interaction
│   ├── popup.html         # Extension popup interface
│   ├── popup.js           # Popup functionality
│   ├── report.html        # Scan report page
│   └── report.js          # Report page functionality
├── assets/                # Static resources
│   └── icons/             # Extension icons
│       ├── icon16.png     # 16x16 extension icon
│       ├── icon48.png     # 48x48 extension icon
│       └── icon128.png    # 128x128 extension icon
└── docs/                  # Documentation
    ├── README.md          # This file
    ├── DESIGN_GUIDELINES.md # UI/UX design standards
    └── FUTURE_PLANS.md    # Future enhancement plans
```

## Permissions Explained

The extension requires the following permissions:

- **contextMenus**: Create right-click context menu items
- **downloads**: Download files from the internet
- **activeTab**: Access the current tab for file information
- **storage**: Store API key and scan history securely
- **notifications**: Show download and scan status notifications
- **host_permissions**: Access VirusTotal API and download files from any website

## Security & Privacy

### API Key Protection
- **Browser Storage**: API keys are encrypted using Chrome's secure sync storage with built-in encryption
- **File Storage**: API keys are loaded from user-controlled files with temporary caching (5 minutes max)
- **No plain text storage**: API keys are never stored in plain text anywhere in the system
- **Automatic cleanup**: Cached keys expire automatically for security (file: 5 minutes)

### Data Privacy
- **Local processing**: All API key operations happen locally in your browser
- **No key transmission**: API keys are never sent to third parties or external servers
- **Minimal data sharing**: Only file URLs (not file contents) are submitted to VirusTotal for analysis
- **Local scan history**: All scan history is stored locally and never transmitted to third parties
- **Explicit consent**: The extension only submits URLs to VirusTotal when you explicitly use the "Download with VirusTotal" option

### Security Best Practices
- **Regular key rotation**: Consider rotating your VirusTotal API key periodically
- **File permissions**: For file storage, set restrictive permissions (read-only for your user account only)
- **Secure locations**: Store API key files outside of cloud-synced directories unless they use end-to-end encryption
- **Browser security**: Keep your browser updated and use security extensions for additional protection

## Troubleshooting

### Extension Not Working
- Ensure you have configured a valid VirusTotal API key using one of the two storage methods
- Check that Developer Mode is enabled in your browser
- Try reloading the extension from the extensions page
- Verify your chosen storage method is properly configured

### API Key Issues
- **Browser Storage**: Verify your API key is correct (should be 64 characters long)
- **File Storage**: Ensure your API key file is accessible and contains only the API key (no extra spaces or characters)
- Make sure your VirusTotal account is active
- Check that you haven't exceeded your API rate limit

### Storage Method Specific Issues

#### File Storage Problems
- **"File not selected" error**: Re-select your API key file (temporary storage expires after 5 minutes)
- **"File too large" error**: API key files should be under 1KB (plain text only)
- **"Invalid file type" error**: Use only .txt, .key, or .api file extensions
- **Access denied**: Check file permissions - ensure your user account can read the file


#### General Storage Issues
- **Storage method not switching**: Clear browser data and reconfigure
- **API calls failing**: Check browser console for detailed error messages
- **Fallback to browser storage**: Other methods failed, configure browser storage as backup

### Downloads Not Starting
- Ensure the extension has permission to access the current website
- Check that the file URL is accessible and not blocked by CORS policies
- Try right-clicking directly on the file link or image

### VirusTotal Submission Failed
- Check your internet connection
- Verify your API key is still valid
- Some file types or URLs may not be supported by VirusTotal

## API Rate Limits

VirusTotal free accounts have the following limits:
- 4 requests per minute
- 1,000 requests per month

If you exceed these limits, you'll receive error messages. Consider upgrading to a premium VirusTotal account for higher limits.

## Development

To modify or extend the extension:

1. Edit the relevant files in the `src/` directory (`src/background.js`, `src/popup.js`, `src/content.js`, etc.)
2. Reload the extension from the browser's extensions page
3. Test your changes

The project follows a standard browser extension structure:
- `src/` - Contains all main extension logic and UI files
- `assets/` - Contains static resources like icons
- `docs/` - Contains documentation files

## Support

If you encounter issues:
1. Check the browser's developer console for error messages
2. Verify all files are present in the extension directory
3. Ensure your VirusTotal API key is valid and active
4. Check that all required permissions are granted

## Version History

- **v1.0.0**: Initial release with basic download and scan functionality

## License

This project is open source. Feel free to modify and distribute according to your needs.