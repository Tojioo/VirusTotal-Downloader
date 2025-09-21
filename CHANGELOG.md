# Changelog

All notable changes to the VirusTotal Downloader extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - v1.1.0

### Added (Planned)
- **Risk Assessment Engine**: Intelligent evaluation of VirusTotal scan results
  - Risk scoring algorithm based on engine detections and threat types
  - Weighted scoring by antivirus engine reputation
  - File type risk factor analysis (executables vs documents)
  - Source domain reputation checking

- **Configurable Risk Thresholds**: User-customizable security levels
  - Low Risk: Block files detected by 3+ engines
  - Medium Risk: Block files detected by 2+ engines
  - High Risk: Block files detected by 1+ engine
  - Paranoid Mode: Block files with any suspicious indicators

- **Risk-Based Download Prevention**: Smart blocking with user control
  - Automatic risk evaluation before downloads
  - Prevention of high-risk file downloads when auto-download is enabled
  - Risk assessment notifications and warnings
  - "Download Anyway" override option with explicit warnings

- **Enhanced User Interface**: Visual risk communication
  - Color-coded risk levels (green/yellow/orange/red)
  - Risk percentage display in scan reports
  - Detailed risk breakdown with contributing factors
  - Pre-download warning dialogs with threat explanations
  - Educational content about detected threats

- **Whitelist/Blacklist Management**: Trusted source control
  - Domain whitelist for bypassing risk assessment
  - Custom file type filtering rules
  - Hash-based exceptions for previously approved files
  - Temporary time-limited overrides

- **Advanced Analytics**: Usage tracking and insights
  - Download statistics (blocked vs allowed)
  - Historical risk assessment data and trends
  - False positive tracking and learning
  - Integration with additional threat intelligence sources

### Technical Improvements (Planned)
- New risk calculation JavaScript module
- Enhanced storage schema for risk metadata
- Performance optimization with risk assessment caching
- Improved accessibility with screen reader support for warnings
- Mobile-responsive design for all risk interfaces

### Security Enhancements (Planned)
- All risk assessment performed locally (privacy-first approach)
- Open source risk calculation algorithms (transparency)
- Always-available user override options
- Performance-optimized risk assessment (no download speed impact)

## [1.0.0] - 2025-09-21

### Added
- Initial release of VirusTotal Downloader extension
- Right-click context menu for downloading files with VirusTotal scanning
- Automatic file submission to VirusTotal API after download
- Secure API key storage with multiple storage methods:
  - Browser storage (encrypted sync storage)
  - External file storage (enhanced security)
- Scan history management with collapsible interface
- Modern UI with dark mode support
- Cross-browser compatibility (Chrome, Edge, Firefox)
- API usage tracking and quota monitoring
- Auto-removal of old scan history
- Comprehensive file type support:
  - Images, videos, audio files
  - Documents, spreadsheets, presentations
  - Archives and compressed files
  - Executables and web files
- Professional design with accessibility features
- Detailed scan reports with VirusTotal integration

### Security Features
- Encrypted API key storage
- Local-only processing (no data sent to third parties)
- User consent required for all VirusTotal submissions
- Secure file handling and download management

### Performance Features
- Rate limiting and quota management
- Efficient storage and cleanup mechanisms
- Optimized context menu creation with retry logic
- Cross-platform compatibility enhancements

---

## Legend

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements