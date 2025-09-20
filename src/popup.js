// User interface for configuring extension settings and viewing scan history
document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyBtn = document.getElementById('saveApiKey');
    const saveButtonText = document.getElementById('saveButtonText');
    const apiStatus = document.getElementById('apiStatus');
    const refreshHistoryBtn = document.getElementById('refreshHistory');
    const scanHistoryDiv = document.getElementById('scanHistory');
    const showMoreScansBtn = document.getElementById('showMoreScans');
    const accessLevelText = document.getElementById('accessLevelText');
    const showReportToggle = document.getElementById('showReportToggle');
    const showReportText = document.getElementById('showReportText');
    const downloadBehaviorToggle = document.getElementById('downloadBehaviorToggle');
    const downloadBehaviorText = document.getElementById('downloadBehaviorText');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeText = document.getElementById('darkModeText');
    const autoRemoveSelect = document.getElementById('autoRemoveSelect');
    const quotaSection = document.getElementById('quotaSection');
    const dailyUsageText = document.getElementById('dailyUsageText');
    const monthlyUsageText = document.getElementById('monthlyUsageText');
    const dailyProgress = document.getElementById('dailyProgress');
    const monthlyProgress = document.getElementById('monthlyProgress');
    
    // Multiple storage options protect user's API key based on their security preferences
    const storageMethodRadios = document.querySelectorAll('input[name="storageMethod"]');
    const browserStorageConfig = document.getElementById('browserStorageConfig');
    const fileStorageConfig = document.getElementById('fileStorageConfig');
    const apiKeyFile = document.getElementById('apiKeyFile');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const fileStatus = document.getElementById('fileStatus');

    // Limit initial history display to improve performance with large scan databases
    let scanHistoryData = [];
    let currentDisplayCount = 5;

    initializeCollapsibleSections();

    // Restore user configuration to maintain consistent experience across sessions
    loadApiKey();
    loadScanHistory();
    loadAccessLevel();
    loadApiUsage();
    loadShowReportSetting();
    loadDownloadBehaviorSetting();
    loadDarkModeSetting();
    loadAutoRemoveSetting();
    loadStorageMethod();

    // Save API key with support for multiple storage methods
    saveApiKeyBtn.addEventListener('click', async function() {
        const selectedMethod = document.querySelector('input[name="storageMethod"]:checked').value;
        
        try {
            switch (selectedMethod) {
                case 'browser':
                    await saveBrowserStorageApiKey();
                    break;
                case 'file':
                    await saveFileStorageApiKey();
                    break;
                default:
                    showStatus('Invalid storage method selected', 'error');
            }
        } catch (error) {
            console.error('Error saving API key:', error);
            showStatus('Failed to save API key: ' + error.message, 'error');
        }
    });

    // Refresh scan history
    refreshHistoryBtn.addEventListener('click', function() {
        loadScanHistory();
    });

    // Show more scans button
    showMoreScansBtn.addEventListener('click', function() {
        currentDisplayCount += 5;
        displayScanHistory();
    });

    // Access level is now automatically determined, no toggle needed

    // Show report toggle
    showReportToggle.addEventListener('click', function() {
        const newSetting = showReportText.textContent === 'Off';
        
        chrome.storage.sync.set({
            alwaysShowReport: newSetting
        }, function() {
            if (chrome.runtime.lastError) {
                console.error('Error saving show report setting:', chrome.runtime.lastError);
                return;
            }
            
            updateShowReportUI(newSetting);
        });
    });

    // Download behavior toggle
    downloadBehaviorToggle.addEventListener('click', function() {
        const newSetting = downloadBehaviorText.textContent === 'Off'; // true = download automatically, false = manual download
        
        chrome.storage.sync.set({
            downloadAutomatically: newSetting
        }, function() {
            if (chrome.runtime.lastError) {
                console.error('Error saving download behavior setting:', chrome.runtime.lastError);
                return;
            }
            
            updateDownloadBehaviorUI(newSetting);
        });
    });

    // Dark mode toggle
    darkModeToggle.addEventListener('click', function() {
        const newSetting = darkModeText.textContent === 'Off';
        
        chrome.storage.sync.set({
            darkMode: newSetting
        }, function() {
            if (chrome.runtime.lastError) {
                console.error('Error saving dark mode setting:', chrome.runtime.lastError);
                return;
            }
            
            updateDarkModeUI(newSetting);
            applyDarkMode(newSetting);
        });
    });

    // Auto-removal setting change
    autoRemoveSelect.addEventListener('change', function() {
        const newSetting = this.value;
        
        chrome.storage.sync.set({
            autoRemoveDays: newSetting
        }, function() {
            if (chrome.runtime.lastError) {
                console.error('Error saving auto-removal setting:', chrome.runtime.lastError);
                return;
            }
            
            console.log('Auto-removal setting saved:', newSetting);
        });
    });

    // Storage method change event listeners
    storageMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                switchStorageMethod(this.value);
                saveStorageMethod(this.value);
            }
        });
    });

    // File picker event listeners
    selectFileBtn.addEventListener('click', function() {
        apiKeyFile.click();
    });

    apiKeyFile.addEventListener('change', function(event) {
        handleFileSelection(event);
    });

    // Load existing API key (masked)
    async function loadApiKey() {
        try {
            const result = await chrome.storage.sync.get(['virusTotalApiKey']);
            const apiKey = result.virusTotalApiKey;
            
            if (apiKey) {
                // Show that API key is set (masked)
                apiKeyInput.placeholder = 'API key is set (••••••••••••)';
                showStatus('API key is configured', 'success');
            } else {
                apiKeyInput.placeholder = 'Enter your API key';
            }
        } catch (error) {
            console.error('Error loading API key:', error);
            apiKeyInput.placeholder = 'Enter your API key';
        }
    }

    // Load section states from storage
    async function loadSectionStates() {
        try {
            const result = await chrome.storage.sync.get(['sectionStates']);
            return result.sectionStates || {};
        } catch (error) {
            console.error('Error loading section states:', error);
            return {};
        }
    }

    // Save section state to storage
    async function saveSectionState(sectionId, isCollapsed) {
        try {
            const currentStates = await loadSectionStates();
            currentStates[sectionId] = isCollapsed;
            await chrome.storage.sync.set({ sectionStates: currentStates });
        } catch (error) {
            console.error('Error saving section state:', error);
        }
    }

    // Initialize collapsible sections with state persistence
    async function initializeCollapsibleSections() {
        // Enhanced wait for all content to be fully loaded with multiple checks
        await new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
        
        // Add longer delay for Edge browser compatibility and ensure all dynamic content is rendered
        await new Promise(resolve => setTimeout(resolve, 250));
        
        // Additional check for images and external resources
        const images = document.querySelectorAll('img');
        if (images.length > 0) {
            await Promise.all(Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve; // Resolve even on error
                    setTimeout(resolve, 1000); // Fallback timeout
                });
            }));
        }
        
        const savedStates = await loadSectionStates();
        const collapseButtons = document.querySelectorAll('.collapse-btn');
        
        collapseButtons.forEach(button => {
            const targetId = button.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            
            if (targetContent) {
                // Enhanced height calculation with multiple fallback mechanisms
                const calculateContentHeight = () => {
                    // Store original styles
                    const originalMaxHeight = targetContent.style.maxHeight;
                    const originalDisplay = targetContent.style.display;
                    const wasCollapsed = targetContent.classList.contains('collapsed');
                    
                    try {
                        // Temporarily make element visible and uncollapsed for accurate measurement
                        targetContent.classList.remove('collapsed');
                        targetContent.style.maxHeight = 'none';
                        targetContent.style.display = 'block';
                        
                        // Force a reflow to ensure accurate measurements
                        targetContent.offsetHeight;
                        
                        // Multiple attempts to get accurate height
                        let height = targetContent.scrollHeight;
                        
                        // Fallback: use offsetHeight if scrollHeight is 0
                        if (height <= 0) {
                            height = targetContent.offsetHeight;
                        }
                        
                        // Fallback: calculate based on children
                        if (height <= 0) {
                            const children = Array.from(targetContent.children);
                            height = children.reduce((total, child) => {
                                return total + child.offsetHeight + parseInt(getComputedStyle(child).marginTop) + parseInt(getComputedStyle(child).marginBottom);
                            }, 0);
                        }
                        
                        // Minimum height fallback
                        if (height <= 0) {
                            height = 100; // Default minimum height
                        }
                        
                        // Add some padding for safety
                        height += 10;
                        
                        // Restore original state before returning
                        if (wasCollapsed) {
                            targetContent.classList.add('collapsed');
                        }
                        targetContent.style.maxHeight = originalMaxHeight;
                        targetContent.style.display = originalDisplay;
                        
                        return height;
                    } catch (error) {
                        console.error('Error calculating content height:', error);
                        // Restore state on error
                        if (wasCollapsed) {
                            targetContent.classList.add('collapsed');
                        }
                        targetContent.style.maxHeight = originalMaxHeight;
                        targetContent.style.display = originalDisplay;
                        return 100; // Safe fallback height
                    }
                };
                
                // Initialize section state with improved timing and animation consistency
                setTimeout(() => {
                    const savedState = savedStates[targetId];
                    if (savedState === true) {
                        // Should be collapsed - set state immediately without animation
                        targetContent.classList.add('collapsed');
                        targetContent.style.maxHeight = '0px';
                        button.classList.add('collapsed');
                    } else {
                        // Should be expanded (default) - ensure proper height without animation
                        targetContent.classList.remove('collapsed');
                        const contentHeight = calculateContentHeight();
                        targetContent.style.maxHeight = contentHeight + 'px';
                        button.classList.remove('collapsed');
                    }
                    
                    // Mark this section as initialized to prevent state conflicts
                    targetContent.dataset.initialized = 'true';
                }, 100); // Increased delay to ensure all elements are ready

                // Add click event listener with improved state management
                button.addEventListener('click', async function() {
                    const isCollapsed = targetContent.classList.contains('collapsed');
                    
                    // Prevent rapid clicking
                    if (button.dataset.animating === 'true') {
                        return;
                    }
                    button.dataset.animating = 'true';
                    
                    try {
                        if (isCollapsed) {
                            // Expand with smooth animation (reverse of collapse)
                            const contentHeight = calculateContentHeight();
                            
                            // Start from collapsed state
                            targetContent.style.maxHeight = '0px';
                            targetContent.classList.remove('collapsed');
                            targetContent.offsetHeight; // Force reflow
                            
                            // Small delay to ensure smooth transition
                            await new Promise(resolve => setTimeout(resolve, 10));
                            
                            // Animate to full height
                            targetContent.style.maxHeight = contentHeight + 'px';
                            this.classList.remove('collapsed');
                            await saveSectionState(targetId, false);
                        } else {
                            // Collapse with existing smooth animation
                            const contentHeight = calculateContentHeight();
                            targetContent.style.maxHeight = contentHeight + 'px';
                            targetContent.offsetHeight; // Force reflow
                            await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
                            targetContent.style.maxHeight = '0px';
                            targetContent.classList.add('collapsed');
                            this.classList.add('collapsed');
                            await saveSectionState(targetId, true);
                        }
                    } catch (error) {
                        console.error('Error toggling section:', error);
                    } finally {
                        // Remove animation lock after transition completes
                        setTimeout(() => {
                            button.dataset.animating = 'false';
                        }, 350);
                    }
                });
                
                // Enhanced content height update function
                const updateContentHeight = () => {
                    if (!targetContent.classList.contains('collapsed')) {
                        setTimeout(() => {
                            const contentHeight = calculateContentHeight();
                            targetContent.style.maxHeight = contentHeight + 'px';
                        }, 50);
                    }
                };
                
                // Observe changes to content for dynamic updates
                if (targetId === 'recent-scans-content' && targetContent) {
                    const observer = new MutationObserver(() => {
                        // Debounce the update to avoid excessive calls
                        clearTimeout(observer.updateTimeout);
                        observer.updateTimeout = setTimeout(updateContentHeight, 100);
                    });
                    observer.observe(targetContent, { childList: true, subtree: true });
                }
                
                // Add resize observer for better responsiveness
                if (window.ResizeObserver) {
                    const resizeObserver = new ResizeObserver(() => {
                        updateContentHeight();
                    });
                    resizeObserver.observe(targetContent);
                }
            }
        });
    }

    // Load and display scan history
    function loadScanHistory() {
        chrome.runtime.sendMessage({action: 'getScanHistory'}, function(response) {
            if (chrome.runtime.lastError) {
                console.error('Error getting scan history:', chrome.runtime.lastError);
                return;
            }

            const scanHistory = response.scanHistory || [];
            const scanHistoryWithKeys = response.scanHistoryWithKeys || [];
            
            // Store data globally and reset pagination
            scanHistoryData = { scanHistory, scanHistoryWithKeys };
            currentDisplayCount = 5;
            
            displayScanHistory();
        });
    }

    // Extract filename from URL like browser downloads
    function getFilenameFromUrl(url, fallbackName = 'unknown_file') {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const filename = pathname.split('/').pop();
            return filename && filename.includes('.') ? filename : fallbackName;
        } catch (e) {
            return fallbackName;
        }
    }

    // Get file type icon based on file extension
    function getFileTypeIcon(filename) {
        const extension = filename.toLowerCase().split('.').pop();
        
        // Enhanced SVG icons with larger size and improved dark mode compatibility
        const svgIcons = {
            // Images - Blue theme
            image: `<svg class="file-type-icon" width="24" height="24" viewBox="0 0 24 24"  stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" class="icon-bg-image" fill="var(--icon-bg-image, #e3f2fd)" stroke="var(--icon-stroke-image, #2196f3)"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="var(--icon-stroke-image, #2196f3)"/>
                <polyline points="21,15 16,10 5,21" stroke="var(--icon-stroke-image, #2196f3)"/>
            </svg>`,
            
            // Videos - Purple theme
            video: `<svg class="file-type-icon" width="24" height="24" viewBox="0 0 24 24"  stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" class="icon-bg-video" fill="var(--icon-bg-video, #f3e5f5)" stroke="var(--icon-stroke-video, #9c27b0)"/>
                <polygon points="10,8 16,12 10,16" fill="var(--icon-stroke-video, #9c27b0)"/>
            </svg>`,
            
            // Audio - Green theme
            audio: `<svg class="file-type-icon" width="24" height="24" viewBox="0 0 24 24"  stroke="currentColor" stroke-width="1.5">
                <path d="M9 18V5l12-2v13" class="icon-bg-audio" fill="var(--icon-bg-audio, #e8f5e8)" stroke="var(--icon-stroke-audio, #4caf50)"/>
                <circle cx="6" cy="18" r="3" fill="var(--icon-stroke-audio, #4caf50)"/>
                <circle cx="20" cy="16" r="3" fill="var(--icon-stroke-audio, #4caf50)"/>
            </svg>`,
            
            // Documents - Orange theme
            document: `<svg class="file-type-icon" width="24" height="24" viewBox="0 0 24 24"  stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" class="icon-bg-document" fill="var(--icon-bg-document, #fff3e0)" stroke="var(--icon-stroke-document, #ff9800)"/>
                <polyline points="14,2 14,8 20,8" stroke="var(--icon-stroke-document, #ff9800)"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="var(--icon-stroke-document, #ff9800)"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="var(--icon-stroke-document, #ff9800)"/>
            </svg>`,
            
            // Spreadsheets - Teal theme
            spreadsheet: `<svg class="file-type-icon" width="24" height="24" viewBox="0 0 24 24"  stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" class="icon-bg-spreadsheet" fill="var(--icon-bg-spreadsheet, #e0f2f1)" stroke="var(--icon-stroke-spreadsheet, #009688)"/>
                <line x1="9" y1="9" x2="15" y2="9" stroke="var(--icon-stroke-spreadsheet, #009688)"/>
                <line x1="9" y1="12" x2="15" y2="12" stroke="var(--icon-stroke-spreadsheet, #009688)"/>
                <line x1="9" y1="15" x2="15" y2="15" stroke="var(--icon-stroke-spreadsheet, #009688)"/>
                <line x1="12" y1="9" x2="12" y2="15" stroke="var(--icon-stroke-spreadsheet, #009688)"/>
            </svg>`,
            
            // Presentations - Red theme
            presentation: `<svg class="file-type-icon" width="24" height="24" viewBox="0 0 24 24"  stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" class="icon-bg-presentation" fill="var(--icon-bg-presentation, #ffebee)" stroke="var(--icon-stroke-presentation, #f44336)"/>
                <line x1="8" y1="21" x2="16" y2="21" stroke="var(--icon-stroke-presentation, #f44336)"/>
                <line x1="12" y1="17" x2="12" y2="21" stroke="var(--icon-stroke-presentation, #f44336)"/>
                <rect x="6" y="7" width="4" height="3" fill="var(--icon-stroke-presentation, #f44336)"/>
                <rect x="14" y="7" width="4" height="3" fill="var(--icon-stroke-presentation, #f44336)"/>
            </svg>`,
            
            // Archives - Brown theme
            archive: `<svg class="file-type-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8z" class="icon-bg-archive" fill="var(--icon-bg-archive, #efebe9)" stroke="var(--icon-stroke-archive, #795548)"/>
                <polyline points="7.5,4.21 12,6.81 16.5,4.21" stroke="var(--icon-stroke-archive, #795548)"/>
                <polyline points="7.5,19.79 7.5,14.6 3,12" stroke="var(--icon-stroke-archive, #795548)"/>
                <polyline points="21,12 16.5,14.6 16.5,19.79" stroke="var(--icon-stroke-archive, #795548)"/>
                <polyline points="7.5,4.21 7.5,14.6" stroke="var(--icon-stroke-archive, #795548)"/>
                <line x1="12" y1="6.81" x2="12" y2="12" stroke="var(--icon-stroke-archive, #795548)"/>
            </svg>`,
            
            // Executables - Red theme
            executable: `<svg class="file-type-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="3" class="icon-bg-executable" fill="var(--icon-bg-executable, #ffcdd2)" stroke="var(--icon-stroke-executable, #f44336)"/>
                <path d="m12 1 3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6Z" class="icon-bg-executable-alt" fill="var(--icon-bg-executable-alt, #ffebee)" stroke="var(--icon-stroke-executable, #f44336)"/>
            </svg>`,
            
            // Web files - Indigo theme
            web: `<svg class="file-type-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10" class="icon-bg-web" fill="var(--icon-bg-web, #e8eaf6)" stroke="var(--icon-stroke-web, #3f51b5)"/>
                <line x1="2" y1="12" x2="22" y2="12" stroke="var(--icon-stroke-web, #3f51b5)"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="var(--icon-stroke-web, #3f51b5)"/>
            </svg>`,
            
            // Default - Gray theme
            default: `<svg class="file-type-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" class="icon-bg-default" fill="var(--icon-bg-default, #f5f5f5)" stroke="var(--icon-stroke-default, #9e9e9e)"/>
            </svg>`
        };
        
        const iconMap = {
            // Images
            'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 
            'bmp': 'image', 'webp': 'image', 'svg': 'image', 'ico': 'image',
            'tiff': 'image', 'tif': 'image',
            
            // Videos
            'mp4': 'video', 'avi': 'video', 'mov': 'video', 'wmv': 'video', 
            'flv': 'video', 'mkv': 'video', 'webm': 'video', 'm4v': 'video',
            'mpg': 'video', 'mpeg': 'video', '3gp': 'video',
            
            // Audio
            'mp3': 'audio', 'wav': 'audio', 'flac': 'audio', 'aac': 'audio', 
            'ogg': 'audio', 'm4a': 'audio', 'wma': 'audio', 'opus': 'audio',
            
            // Documents
            'pdf': 'document', 'doc': 'document', 'docx': 'document', 
            'txt': 'document', 'rtf': 'document', 'odt': 'document',
            
            // Spreadsheets
            'xls': 'spreadsheet', 'xlsx': 'spreadsheet', 'csv': 'spreadsheet',
            'ods': 'spreadsheet',
            
            // Presentations
            'ppt': 'presentation', 'pptx': 'presentation', 'odp': 'presentation',
            
            // Archives
            'zip': 'archive', 'rar': 'archive', '7z': 'archive', 'tar': 'archive', 
            'gz': 'archive', 'bz2': 'archive', 'xz': 'archive',
            
            // Executables
            'exe': 'executable', 'msi': 'executable', 'deb': 'executable', 
            'dmg': 'executable', 'pkg': 'executable', 'app': 'executable',
            'apk': 'executable',
            
            // Web files
            'html': 'web', 'htm': 'web', 'css': 'web', 'js': 'web',
            'json': 'web', 'xml': 'web', 'php': 'web'
        };
        
        const iconType = iconMap[extension] || 'default';
        return svgIcons[iconType];
    }

    // Display scan history in the popup with pagination
    function displayScanHistory() {
        // Use global scanHistoryData if no parameters provided
        const scanHistory = scanHistoryData.scanHistory || [];
        const scanHistoryWithKeys = scanHistoryData.scanHistoryWithKeys || [];
        
        if (scanHistory.length === 0) {
            scanHistoryDiv.innerHTML = '<div class="empty-state">No scans yet</div>';
            showMoreScansBtn.style.display = 'none';
            return;
        }

        let html = '';
        const itemsToShow = Math.min(currentDisplayCount, scanHistory.length);
        
        scanHistory.slice(0, itemsToShow).forEach(function(scan, index) {
            const date = new Date(scan.timestamp);
            const timeStr = date.toLocaleString();
            
            // Find the corresponding storage key for this scan
            let scanKey = `scan_${Date.now()}_${index}`; // fallback
            if (scanHistoryWithKeys.length > index) {
                scanKey = scanHistoryWithKeys[index].key;
            }
            
            // Extract filename from URL like browser downloads
            const displayFilename = getFilenameFromUrl(scan.url, scan.filename);
            const fileIcon = getFileTypeIcon(displayFilename);
            
            // Always show download button (as required by issue description)
            html += `
                <div class="scan-item">
                    <button class="icon-btn delete-scan-btn" data-scan-key="${escapeHtml(scanKey)}" title="Remove from list" aria-label="Remove scan from list">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                    </button>
                    <div class="scan-filename">
                        <span class="file-icon">${fileIcon}</span>
                        <span class="filename-text">${escapeHtml(displayFilename)}</span>
                    </div>
                    <div class="scan-time">${timeStr}</div>
                    <div class="scan-buttons">
                            <button class="icon-btn icon-btn-download download-file-btn" data-url="${escapeHtml(scan.url)}" data-filename="${escapeHtml(displayFilename)}" title="Download File" aria-label="Download file">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7,10 12,15 17,10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                            </button>
                            <button class="icon-btn icon-btn-report show-report-btn" data-scan-key="${escapeHtml(scanKey)}" data-filename="${escapeHtml(displayFilename)}" title="Show Report" aria-label="Show scan report">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14,2 14,8 20,8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                    <polyline points="10,9 9,9 8,9"/>
                                </svg>
                            </button>
                            ${scan.permalink ? `<a href="${escapeHtml(scan.permalink)}" target="_blank" class="icon-btn icon-btn-external" title="View on VirusTotal" aria-label="Open scan results on VirusTotal">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M7 17l9.2-9.2M17 17V7H7"/>
                                </svg>
                            </a>` : ''}
                        </div>
                </div>
            `;
        });

        scanHistoryDiv.innerHTML = html;
        
        // Show/hide "Show more" button based on remaining items
        if (itemsToShow < scanHistory.length) {
            showMoreScansBtn.style.display = 'block';
            showMoreScansBtn.textContent = `Show more (${scanHistory.length - itemsToShow} remaining)`;
        } else {
            showMoreScansBtn.style.display = 'none';
        }
        
        // Add event listeners for "Show Report" buttons
        const showReportBtns = scanHistoryDiv.querySelectorAll('.show-report-btn');
        showReportBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const scanKey = this.getAttribute('data-scan-key');
                const filename = this.getAttribute('data-filename');
                openCustomReport(scanKey, filename);
            });
        });

        // Add event listeners for "Download" buttons
        const downloadBtns = scanHistoryDiv.querySelectorAll('.download-file-btn');
        downloadBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                const filename = this.getAttribute('data-filename');
                chrome.downloads.download({
                    url: url,
                    saveAs: false,
                    filename: filename
                });
            });
        });

        // Add event listeners for "Delete" buttons
        const deleteBtns = scanHistoryDiv.querySelectorAll('.delete-scan-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const scanKey = this.getAttribute('data-scan-key');
                if (confirm('Are you sure you want to remove this scan from the list?')) {
                    chrome.runtime.sendMessage({
                        action: 'removeScan',
                        scanKey: scanKey
                    }, function(response) {
                        if (chrome.runtime.lastError) {
                            console.error('Error removing scan:', chrome.runtime.lastError);
                            return;
                        }
                        
                        if (response && response.success) {
                            // Reload scan history to update the display
                            loadScanHistory();
                        } else {
                            showStatus('Failed to remove scan', 'error');
                        }
                    });
                }
            });
        });
    }

    // Show status message
    function showStatus(message, type) {
        apiStatus.textContent = message;
        apiStatus.className = `status ${type}`;
        
        // Clear status after 3 seconds
        setTimeout(function() {
            apiStatus.textContent = '';
            apiStatus.className = '';
        }, 3000);
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Load access level and update UI
    function loadAccessLevel() {
        chrome.runtime.sendMessage({action: 'getApiUsage'}, function(response) {
            if (chrome.runtime.lastError) {
                console.error('Error getting access level:', chrome.runtime.lastError);
                return;
            }
            
            if (response && response.accessLevel) {
                updateAccessLevelUI(response.accessLevel);
            }
        });
    }

    // Update access level UI (read-only display)
    function updateAccessLevelUI(accessLevel) {
        const isFree = accessLevel === 'free';
        accessLevelText.textContent = isFree ? 'Free' : 'Premium';
        
        // Show/hide quota section based on access level
        if (isFree) {
            quotaSection.classList.add('visible');
        } else {
            quotaSection.classList.remove('visible');
        }
    }

    // Load and display API usage information
    function loadApiUsage() {
        chrome.runtime.sendMessage({action: 'getApiUsage'}, function(response) {
            if (chrome.runtime.lastError) {
                console.error('Error getting API usage:', chrome.runtime.lastError);
                
                // Check if we have an API key to show placeholder usage stats
                chrome.storage.sync.get(['virusTotalApiKey'], function(result) {
                    if (result.virusTotalApiKey) {
                        // Show placeholder stats with "no data yet" indicator
                        showPlaceholderUsage();
                        quotaSection.classList.add('visible');
                    }
                });
                return;
            }
            
            if (response && response.accessLevel === 'free') {
                updateQuotaDisplay(response);
            } else if (response && response.error) {
                // API call failed but we might still have an API key
                chrome.storage.sync.get(['virusTotalApiKey'], function(result) {
                    if (result.virusTotalApiKey) {
                        // Show placeholder stats with "no data yet" indicator
                        showPlaceholderUsage();
                        quotaSection.classList.add('visible');
                    }
                });
            }
        });
    }

    // Show placeholder usage stats when no data is available yet
    function showPlaceholderUsage() {
        // Show default free tier limits with zero usage
        const placeholderUsage = {
            dailyCount: 0,
            monthlyCount: 0,
            dailyLimit: 500,
            monthlyLimit: 15500
        };
        
        // Update text displays with indicator message
        dailyUsageText.textContent = `${placeholderUsage.dailyCount} / ${placeholderUsage.dailyLimit.toLocaleString()} (No data until first scan)`;
        monthlyUsageText.textContent = `${placeholderUsage.monthlyCount} / ${placeholderUsage.monthlyLimit.toLocaleString()} (No data until first scan)`;
        
        // Update progress bars (empty)
        dailyProgress.style.width = '0%';
        monthlyProgress.style.width = '0%';
        
        // Remove any color classes since usage is 0
        dailyProgress.classList.remove('warning', 'danger');
        monthlyProgress.classList.remove('warning', 'danger');
    }

    // Update quota progress bars and text
    function updateQuotaDisplay(usage) {
        const dailyPercentage = (usage.dailyCount / usage.dailyLimit) * 100;
        const monthlyPercentage = (usage.monthlyCount / usage.monthlyLimit) * 100;
        
        // Update text displays
        dailyUsageText.textContent = `${usage.dailyCount} / ${usage.dailyLimit.toLocaleString()}`;
        monthlyUsageText.textContent = `${usage.monthlyCount} / ${usage.monthlyLimit.toLocaleString()}`;
        
        // Update progress bars
        dailyProgress.style.width = `${Math.min(dailyPercentage, 100)}%`;
        monthlyProgress.style.width = `${Math.min(monthlyPercentage, 100)}%`;
        
        // Update progress bar colors based on usage
        updateProgressBarColor(dailyProgress, dailyPercentage);
        updateProgressBarColor(monthlyProgress, monthlyPercentage);
    }

    // Update progress bar color based on percentage
    function updateProgressBarColor(progressBar, percentage) {
        progressBar.classList.remove('warning', 'danger');
        
        if (percentage >= 90) {
            progressBar.classList.add('danger');
        } else if (percentage >= 70) {
            progressBar.classList.add('warning');
        }
    }

    // Load show report setting
    function loadShowReportSetting() {
        chrome.storage.sync.get(['alwaysShowReport'], function(result) {
            if (chrome.runtime.lastError) {
                console.error('Error loading show report setting:', chrome.runtime.lastError);
                return;
            }
            
            const showReport = result.alwaysShowReport || false;
            updateShowReportUI(showReport);
        });
    }

    // Update show report UI
    function updateShowReportUI(showReport) {
        showReportText.textContent = showReport ? 'On' : 'Off';
        
        if (showReport) {
            showReportToggle.classList.add('active');
        } else {
            showReportToggle.classList.remove('active');
        }
    }

    // Load download behavior setting
    function loadDownloadBehaviorSetting() {
        chrome.storage.sync.get(['downloadAutomatically'], function(result) {
            if (chrome.runtime.lastError) {
                console.error('Error loading download behavior setting:', chrome.runtime.lastError);
                return;
            }
            
            const downloadAutomatically = result.downloadAutomatically || false;
            updateDownloadBehaviorUI(downloadAutomatically);
        });
    }

    // Update download behavior UI
    function updateDownloadBehaviorUI(downloadAutomatically) {
        downloadBehaviorText.textContent = downloadAutomatically ? 'On' : 'Off';
        
        if (downloadAutomatically) {
            downloadBehaviorToggle.classList.add('active');
        } else {
            downloadBehaviorToggle.classList.remove('active');
        }
    }

    // Load dark mode setting
    function loadDarkModeSetting() {
        chrome.storage.sync.get(['darkMode'], function(result) {
            if (chrome.runtime.lastError) {
                console.error('Error loading dark mode setting:', chrome.runtime.lastError);
                return;
            }
            
            const darkMode = result.darkMode || false;
            updateDarkModeUI(darkMode);
            applyDarkMode(darkMode);
        });
    }

    // Update dark mode UI
    function updateDarkModeUI(darkMode) {
        darkModeText.textContent = darkMode ? 'On' : 'Off';
        
        if (darkMode) {
            darkModeToggle.classList.add('active');
        } else {
            darkModeToggle.classList.remove('active');
        }
    }

    // Apply dark mode styles
    function applyDarkMode(darkMode) {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    // Load auto-removal setting
    function loadAutoRemoveSetting() {
        chrome.storage.sync.get(['autoRemoveDays'], function(result) {
            if (chrome.runtime.lastError) {
                console.error('Error loading auto-removal setting:', chrome.runtime.lastError);
                return;
            }
            
            autoRemoveSelect.value = result.autoRemoveDays || '7'; // Default to 1 week
        });
    }

    // Storage method management functions
    async function loadStorageMethod() {
        try {
            const result = await chrome.storage.sync.get(['apiKeyStorageMethod']);
            const method = result.apiKeyStorageMethod || 'browser';
            
            // Set the appropriate radio button
            const radio = document.querySelector(`input[name="storageMethod"][value="${method}"]`);
            if (radio) {
                radio.checked = true;
                switchStorageMethod(method);
            }
        } catch (error) {
            console.error('Error loading storage method:', error);
            // Default to browser storage
            switchStorageMethod('browser');
        }
    }

    async function saveStorageMethod(method) {
        try {
            await chrome.storage.sync.set({ apiKeyStorageMethod: method });
        } catch (error) {
            console.error('Error saving storage method:', error);
        }
    }

    function switchStorageMethod(method) {
        // Hide all config sections with null checks
        if (browserStorageConfig) {
            browserStorageConfig.style.display = 'none';
        }
        if (fileStorageConfig) {
            fileStorageConfig.style.display = 'none';
        }

        // Show the selected method's config
        switch (method) {
            case 'browser':
                if (browserStorageConfig) {
                    browserStorageConfig.style.display = 'block';
                }
                if (saveButtonText) {
                    saveButtonText.textContent = 'Save API Key';
                }
                break;
            case 'file':
                if (fileStorageConfig) {
                    fileStorageConfig.style.display = 'block';
                }
                if (saveButtonText) {
                    saveButtonText.textContent = 'Load from File';
                }
                break;
        }
    }

    // File handling functions
    async function handleFileSelection(event) {
        const file = event.target.files[0];
        if (!file) {
            fileStatus.textContent = 'No file selected';
            fileStatus.classList.remove('selected');
            return;
        }

        // Validate file type
        const allowedTypes = ['text/plain', 'application/octet-stream'];
        const allowedExtensions = ['.txt', '.key', '.api'];
        const hasValidExtension = allowedExtensions.some(ext => 
            file.name.toLowerCase().endsWith(ext)
        );

        if (!allowedTypes.includes(file.type) && !hasValidExtension) {
            showStatus('Please select a text file (.txt, .key, or .api)', 'error');
            fileStatus.textContent = 'Invalid file type';
            fileStatus.classList.remove('selected');
            return;
        }

        // Check file size (max 1KB for API key file)
        if (file.size > 1024) {
            showStatus('File too large. API key file should be under 1KB', 'error');
            fileStatus.textContent = 'File too large';
            fileStatus.classList.remove('selected');
            return;
        }

        try {
            const content = await readFileContent(file);
            const apiKey = content.trim();

            // Validate API key
            if (apiKey.length < 32) {
                showStatus('API key in file seems too short', 'error');
                fileStatus.textContent = 'Invalid API key in file';
                fileStatus.classList.remove('selected');
                return;
            }

            // Store the file path reference and content hash for security
            await chrome.storage.sync.set({
                apiKeyFileName: file.name,
                apiKeyFileSize: file.size,
                apiKeyFileHash: await hashString(apiKey)
            });

            fileStatus.textContent = `Selected: ${file.name}`;
            fileStatus.classList.add('selected');
            showStatus('API key file loaded successfully', 'success');

            // Temporarily store the API key for immediate use
            await chrome.storage.local.set({
                tempApiKeyFromFile: apiKey,
                tempApiKeyTimestamp: Date.now()
            });

        } catch (error) {
            console.error('Error reading file:', error);
            showStatus('Error reading file: ' + error.message, 'error');
            fileStatus.textContent = 'Error reading file';
            fileStatus.classList.remove('selected');
        }
    }

    function readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // Simple hash function for file integrity checking
    async function hashString(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // API Key saving functions for different storage methods
    async function saveBrowserStorageApiKey() {
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        // Validate API key format
        if (apiKey.length < 32) {
            showStatus('API key seems too short. Please check your key.', 'error');
            return;
        }

        // Save API key to browser storage (existing method)
        await chrome.storage.sync.set({
            virusTotalApiKey: apiKey,
            apiKeyStorageMethod: 'browser'
        });

        showStatus('API key saved successfully!', 'success');
        apiKeyInput.value = ''; // Clear input for security
    }

    async function saveFileStorageApiKey() {
        // Check if file has been selected and loaded
        const tempData = await chrome.storage.local.get(['tempApiKeyFromFile', 'tempApiKeyTimestamp']);
        
        if (!tempData.tempApiKeyFromFile) {
            showStatus('Please select an API key file first', 'error');
            return;
        }

        // Check if the temporary key is still valid (within last 5 minutes)
        const keyAge = Date.now() - (tempData.tempApiKeyTimestamp || 0);
        if (keyAge > 5 * 60 * 1000) {
            showStatus('File selection expired. Please select the file again', 'error');
            await chrome.storage.local.remove(['tempApiKeyFromFile', 'tempApiKeyTimestamp']);
            return;
        }

        // Save the method preference and clear temporary storage
        await chrome.storage.sync.set({
            apiKeyStorageMethod: 'file'
        });

        // Clear the temporary API key for security
        await chrome.storage.local.remove(['tempApiKeyFromFile', 'tempApiKeyTimestamp']);

        showStatus('File-based API key configured successfully!', 'success');
    }


    // Open custom report tab
    function openCustomReport(scanKey, filename) {
        const reportUrl = chrome.runtime.getURL(`src/report.html?scan=${encodeURIComponent(scanKey)}&filename=${encodeURIComponent(filename)}`);
        chrome.tabs.create({ url: reportUrl });
    }

    // Handle Enter key in API key input
    if (apiKeyInput && saveApiKeyBtn) {
        apiKeyInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveApiKeyBtn.click();
            }
        });
    }
});