// Retry mechanism prevents context menu creation failures from breaking extension functionality
let menuCreationAttempts = 0;
const MAX_MENU_CREATION_ATTEMPTS = 5;

// Initialize context menu immediately to ensure users can access functionality upon installation
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[VT Downloader] Extension installed, initializing...');
  
  await waitForServiceWorkerReady();
  
  console.log('[VT Downloader] Service worker ready, creating context menu...');
  await createContextMenusWithRetry();
});

// Ensure context menu persists across browser restarts to maintain consistent user experience
chrome.runtime.onStartup.addListener(async () => {
  console.log('[VT Downloader] Extension started, reinitializing...');
  
  await waitForServiceWorkerReady();
  
  console.log('[VT Downloader] Service worker ready, recreating context menu...');
  await createContextMenusWithRetry();
});

// Handle edge cases where context menu disappears during browser session
if (chrome.runtime.onActivated && typeof chrome.runtime.onActivated.addListener === 'function') {
  chrome.runtime.onActivated.addListener(async () => {
    console.log('[VT Downloader] Service worker activated, ensuring context menu exists...');
    
    try {
      chrome.contextMenus.query({}, (menus) => {
        if (chrome.runtime.lastError) {
          console.error('[VT Downloader] Error checking context menus:', chrome.runtime.lastError);
          return;
        }
        
        const hasOurMenu = menus.some(menu => menu.id === 'downloadWithVirusTotal');
        if (!hasOurMenu) {
          console.warn('[VT Downloader] Context menu missing on activation, recreating...');
          createContextMenusWithRetry();
        } else {
          console.log('[VT Downloader] Context menu verified present on activation');
        }
      });
    } catch (error) {
      console.error('[VT Downloader] Error in context menu verification on activation:', error);
    }
  });
}

// Prevent context menu creation failures by ensuring browser APIs are fully initialized
async function waitForServiceWorkerReady() {
  console.log('[VT Downloader] Waiting for service worker to be ready...');
  
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const isEdge = navigator.userAgent.includes('Edg') || navigator.userAgent.includes('Edge');
  if (isEdge) {
    console.log('[VT Downloader] Edge browser detected, applying enhanced compatibility measures...');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  let apiReady = false;
  let attempts = 0;
  const maxAttempts = isEdge ? 15 : 10;
  
  while (!apiReady && attempts < maxAttempts) {
    try {
      if (chrome.contextMenus && 
          typeof chrome.contextMenus.removeAll === 'function' &&
          typeof chrome.contextMenus.create === 'function') {
        apiReady = true;
        console.log('[VT Downloader] Chrome APIs are fully ready');
      } else {
        console.log(`[VT Downloader] Waiting for Chrome APIs to be available... (attempt ${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, isEdge ? 150 : 100));
        attempts++;
      }
    } catch (error) {
      console.log(`[VT Downloader] Chrome APIs not yet available, retrying... (attempt ${attempts + 1}/${maxAttempts})`, error);
      await new Promise(resolve => setTimeout(resolve, isEdge ? 150 : 100));
      attempts++;
    }
  }
  
  if (!apiReady) {
    console.error('[VT Downloader] Chrome APIs failed to become available after multiple attempts');
    if (isEdge) {
      console.error('[VT Downloader] Edge browser detected - this may indicate a browser-specific compatibility issue');
    }
  }
  
  return apiReady;
}

// Function to create context menus with retry mechanism
async function createContextMenusWithRetry() {
  menuCreationAttempts++;
  console.log(`[VT Downloader] Creating context menus (attempt ${menuCreationAttempts}/${MAX_MENU_CREATION_ATTEMPTS})...`);
  
  if (menuCreationAttempts > MAX_MENU_CREATION_ATTEMPTS) {
    console.error('[VT Downloader] Maximum context menu creation attempts reached, giving up');
    return;
  }
  
  try {
    await createContextMenus();
  } catch (error) {
    console.error('[VT Downloader] Context menu creation failed:', error);
    
    if (menuCreationAttempts < MAX_MENU_CREATION_ATTEMPTS) {
      console.log('[VT Downloader] Retrying context menu creation in 1 second...');
      setTimeout(() => createContextMenusWithRetry(), 1000);
    }
  }
}

// Function to create context menus with enhanced debugging and Edge compatibility
function createContextMenus() {
  return new Promise((resolve, reject) => {
    console.log('[VT Downloader] Starting context menu creation process...');
    
    // Check if contextMenus API is available
    if (!chrome.contextMenus) {
      const error = new Error('contextMenus API is not available');
      console.error('[VT Downloader]', error.message);
      reject(error);
      return;
    }
    
    // Remove all existing context menus first
    chrome.contextMenus.removeAll((removeError) => {
      if (chrome.runtime.lastError || removeError) {
        const error = chrome.runtime.lastError || removeError;
        console.error('[VT Downloader] Error removing existing context menus:', error);
        reject(new Error(`Failed to remove existing menus: ${error.message || error}`));
        return;
      }
      
      console.log('[VT Downloader] Successfully removed all existing context menus');
      
      // Create single "Download with VirusTotal" menu item with URL restrictions
      const menuConfig = {
        id: "downloadWithVirusTotal",
        title: "Download with VirusTotal",
        contexts: ["link", "image", "video", "audio", "page"],
        // Target URL patterns - restrict to downloadable file types (including query parameters)
        targetUrlPatterns: [
          // Images
          "*://*/*.jpg", "*://*/*.jpg?*", "*://*/*.jpeg", "*://*/*.jpeg?*", 
          "*://*/*.png", "*://*/*.png?*", "*://*/*.gif", "*://*/*.gif?*",
          "*://*/*.bmp", "*://*/*.bmp?*", "*://*/*.webp", "*://*/*.webp?*", 
          "*://*/*.svg", "*://*/*.svg?*", "*://*/*.ico", "*://*/*.ico?*",
          "*://*/*.tiff", "*://*/*.tiff?*", "*://*/*.tif", "*://*/*.tif?*",
          // Videos
          "*://*/*.mp4", "*://*/*.mp4?*", "*://*/*.avi", "*://*/*.avi?*", 
          "*://*/*.mov", "*://*/*.mov?*", "*://*/*.wmv", "*://*/*.wmv?*",
          "*://*/*.flv", "*://*/*.flv?*", "*://*/*.mkv", "*://*/*.mkv?*", 
          "*://*/*.webm", "*://*/*.webm?*", "*://*/*.m4v", "*://*/*.m4v?*",
          "*://*/*.mpg", "*://*/*.mpg?*", "*://*/*.mpeg", "*://*/*.mpeg?*", 
          "*://*/*.3gp", "*://*/*.3gp?*",
          // Audio
          "*://*/*.mp3", "*://*/*.mp3?*", "*://*/*.wav", "*://*/*.wav?*", 
          "*://*/*.flac", "*://*/*.flac?*", "*://*/*.aac", "*://*/*.aac?*",
          "*://*/*.ogg", "*://*/*.ogg?*", "*://*/*.m4a", "*://*/*.m4a?*", 
          "*://*/*.wma", "*://*/*.wma?*", "*://*/*.opus", "*://*/*.opus?*",
          // Documents
          "*://*/*.pdf", "*://*/*.pdf?*", "*://*/*.doc", "*://*/*.doc?*", 
          "*://*/*.docx", "*://*/*.docx?*", "*://*/*.txt", "*://*/*.txt?*",
          "*://*/*.rtf", "*://*/*.rtf?*", "*://*/*.odt", "*://*/*.odt?*",
          // Spreadsheets
          "*://*/*.xls", "*://*/*.xls?*", "*://*/*.xlsx", "*://*/*.xlsx?*", 
          "*://*/*.csv", "*://*/*.csv?*", "*://*/*.ods", "*://*/*.ods?*",
          // Presentations
          "*://*/*.ppt", "*://*/*.ppt?*", "*://*/*.pptx", "*://*/*.pptx?*", 
          "*://*/*.odp", "*://*/*.odp?*",
          // Archives
          "*://*/*.zip", "*://*/*.zip?*", "*://*/*.rar", "*://*/*.rar?*", 
          "*://*/*.7z", "*://*/*.7z?*", "*://*/*.tar", "*://*/*.tar?*",
          "*://*/*.gz", "*://*/*.gz?*", "*://*/*.bz2", "*://*/*.bz2?*", 
          "*://*/*.xz", "*://*/*.xz?*",
          // Executables
          "*://*/*.exe", "*://*/*.exe?*", "*://*/*.msi", "*://*/*.msi?*", 
          "*://*/*.deb", "*://*/*.deb?*", "*://*/*.dmg", "*://*/*.dmg?*",
          "*://*/*.pkg", "*://*/*.pkg?*", "*://*/*.app", "*://*/*.app?*", 
          "*://*/*.apk", "*://*/*.apk?*",
          // Web files
          "*://*/*.html", "*://*/*.html?*", "*://*/*.htm", "*://*/*.htm?*", 
          "*://*/*.css", "*://*/*.css?*", "*://*/*.js", "*://*/*.js?*",
          "*://*/*.json", "*://*/*.json?*", "*://*/*.xml", "*://*/*.xml?*", 
          "*://*/*.php", "*://*/*.php?*"
        ],
        // Document URL patterns - allow on pages that commonly host downloadable files
        documentUrlPatterns: [
          "*://*.github.com/*", "*://*.gitlab.com/*", "*://*.bitbucket.org/*", // Code repositories
          "*://*.sourceforge.net/*", "*://*.download.com/*", // Download sites  
          "*://*.mediafire.com/*", "*://*.dropbox.com/*", "*://*.drive.google.com/*", // File hosting
          "*://*.onedrive.live.com/*", "*://*.box.com/*", "*://*.mega.nz/*",
          "*://*.wikipedia.org/*", "*://*.wikimedia.org/*", // Wikipedia (original issue)
          "*://*.imgur.com/*", "*://*.flickr.com/*", "*://*.deviantart.com/*", // Image hosting
          "*://*.istockphoto.com/*", "*://*.shutterstock.com/*", "*://*.gettyimages.com/*", // Stock photo sites
          "*://*.youtube.com/*", "*://*.vimeo.com/*", "*://*.dailymotion.com/*", // Video hosting
          "*://*.soundcloud.com/*", "*://*.bandcamp.com/*", // Audio hosting
          "*://*.archive.org/*", "*://*.filehippo.com/*", "*://*.softonic.com/*", // Archives/software
          "*://*/*" // Allow on all sites for page context (when right-clicking on page background)
        ]
      };
      
      console.log('[VT Downloader] Creating menu item with enhanced config:', menuConfig);
      
      chrome.contextMenus.create(menuConfig, (createError) => {
        if (chrome.runtime.lastError || createError) {
          const error = chrome.runtime.lastError || createError;
          console.error('[VT Downloader] Error creating context menu:', error);
          reject(new Error(`Failed to create context menu: ${error.message || error}`));
          return;
        }
        
        console.log('[VT Downloader] Download with VirusTotal menu created successfully');
        
        // Menu creation was successful, reset attempt counter and resolve
        console.log('[VT Downloader] Context menu verification: Menu created successfully');
        menuCreationAttempts = 0;
        resolve();
      });
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('[VT Downloader] Context menu clicked:', info.menuItemId);
  console.log('[VT Downloader] Context info:', {
    linkUrl: info.linkUrl,
    srcUrl: info.srcUrl,
    pageUrl: info.pageUrl,
    frameUrl: info.frameUrl,
    selectionText: info.selectionText,
    mediaType: info.mediaType,
    contextTypes: info.contexts || 'unknown'
  });
  console.log('[VT Downloader] Tab info:', {
    url: tab.url,
    title: tab.title,
    id: tab.id
  });
  
  if (info.menuItemId === "downloadWithVirusTotal") {
    downloadThenScan(info, tab);
  } else {
    console.log('[VT Downloader] Unknown menu item clicked:', info.menuItemId);
  }
});

// Main workflow based on user settings
async function downloadThenScan(info, tab) {
  try {
    const url = info.linkUrl || info.srcUrl || tab.url;
    
    if (!url) {
      showNotification("Error", "No valid URL found to download");
      return;
    }

    // Load both settings
    const downloadAutomatically = await loadDownloadBehaviorSetting();
    const alwaysShowReport = await loadShowReportSetting();
    
    // Extract filename from URL for caching
    const filename = extractFilenameFromUrl(url);
    
    if (downloadAutomatically) {
      // Download automatically = ON
      if (alwaysShowReport) {
        // 1. Always Show Report ON + Download automatically ON:
        // Cache file URL, get report, open report page, then auto-download
        showNotification("VirusTotal", "Scanning URL and preparing download...");
        const scanResult = await submitUrlToVirusTotal(url);
        if (scanResult.success) {
          // Store download URL with scan data for auto-download
          const scanKey = scanResult.scanKey;
          const existingScanData = await chrome.storage.local.get([scanKey]);
          if (existingScanData[scanKey]) {
            existingScanData[scanKey].autoDownload = true;
            await chrome.storage.local.set({[scanKey]: existingScanData[scanKey]});
          }
          showNotification("VirusTotal", "Report opening with auto-download...");
        }
      } else {
        // 2. Always Show Report OFF + Download automatically ON:
        // Get report, auto-download without opening report page
        showNotification("VirusTotal", "Scanning and auto-downloading...");
        const scanResult = await submitUrlToVirusTotal(url);
        if (scanResult.success) {
          // Auto-download after scan
          setTimeout(() => {
            chrome.downloads.download({
              url: url,
              saveAs: false
            }).then(() => {
              showNotification("VirusTotal", `Auto-download started for: ${filename}`);
            }).catch(error => {
              showNotification("Download Error", "Auto-download failed: " + error.message);
            });
          }, 2000); // Brief delay to allow scan to process
        }
      }
    } else {
      // Download automatically = OFF (manual download)
      if (alwaysShowReport) {
        // 3. Always Show Report ON + Download automatically OFF:
        // Open report page with download button and "Disregard File" option
        showNotification("VirusTotal", "Scanning URL for review...");
        const scanResult = await submitUrlToVirusTotal(url);
        if (scanResult.success) {
          // Store that this should show manual download options
          const scanKey = scanResult.scanKey;
          const existingScanData = await chrome.storage.local.get([scanKey]);
          if (existingScanData[scanKey]) {
            existingScanData[scanKey].showDownloadButton = true;
            existingScanData[scanKey].showDisregardButton = true;
            await chrome.storage.local.set({[scanKey]: existingScanData[scanKey]});
          }
          showNotification("VirusTotal", "Report ready for review with download options.");
        }
      } else {
        // 4. Always Show Report OFF + Download automatically OFF:
        // Show download button in popup's scan list
        showNotification("VirusTotal", "Scanning URL...");
        const scanResult = await submitUrlToVirusTotal(url);
        if (scanResult.success) {
          showNotification("VirusTotal", "Scan complete. Check popup for download option.");
        }
      }
    }

  } catch (error) {
    console.error('Download/Scan error:', error);
    showNotification("Error", "Failed to process request: " + error.message);
  }
}

// Scan then download workflow
async function scanThenDownload(info, tab) {
  try {
    const url = info.linkUrl || info.srcUrl || tab.url;
    
    if (!url) {
      showNotification("Error", "No valid URL found to scan");
      return;
    }

    showNotification("VirusTotal", "Scanning URL first...");

    // Submit URL for scanning first
    const scanResult = await submitUrlToVirusTotal(url);
    
    if (scanResult.success) {
      showNotification("VirusTotal", "Scan submitted. Starting download...");
      
      // Then download the file
      const downloadId = await chrome.downloads.download({
        url: url,
        saveAs: false
      });

      // Listen for download completion
      const downloadListener = (downloadDelta) => {
        if (downloadDelta.id === downloadId && downloadDelta.state?.current === 'complete') {
          chrome.downloads.onChanged.removeListener(downloadListener);
          chrome.downloads.search({id: downloadId}, (downloads) => {
            if (downloads.length > 0) {
              const download = downloads[0];
              showNotification("VirusTotal", `File downloaded: ${download.filename}. Check scan results.`);
            }
          });
        } else if (downloadDelta.id === downloadId && downloadDelta.state?.current === 'interrupted') {
          chrome.downloads.onChanged.removeListener(downloadListener);
          showNotification("Download Error", "Failed to download file after scan");
        }
      };

      chrome.downloads.onChanged.addListener(downloadListener);
    }

  } catch (error) {
    console.error('Scan-then-download error:', error);
    showNotification("Error", "Failed to scan and download: " + error.message);
  }
}

// Download only workflow (no scan)
async function downloadOnly(info, tab) {
  try {
    const url = info.linkUrl || info.srcUrl || tab.url;
    
    if (!url) {
      showNotification("Error", "No valid URL found to download");
      return;
    }

    showNotification("Download", "Starting download (no scan)...");

    // Download the file without scanning
    const downloadId = await chrome.downloads.download({
      url: url,
      saveAs: false
    });

    // Listen for download completion
    const downloadListener = (downloadDelta) => {
      if (downloadDelta.id === downloadId && downloadDelta.state?.current === 'complete') {
        chrome.downloads.onChanged.removeListener(downloadListener);
        chrome.downloads.search({id: downloadId}, (downloads) => {
          if (downloads.length > 0) {
            const download = downloads[0];
            showNotification("Download Complete", `File downloaded: ${download.filename}`);
          }
        });
      } else if (downloadDelta.id === downloadId && downloadDelta.state?.current === 'interrupted') {
        chrome.downloads.onChanged.removeListener(downloadListener);
        showNotification("Download Error", "Failed to download file");
      }
    };

    chrome.downloads.onChanged.addListener(downloadListener);

  } catch (error) {
    console.error('Download-only error:', error);
    showNotification("Error", "Failed to download: " + error.message);
  }
}

// Scan only workflow (no download)
async function scanOnly(info, tab) {
  try {
    const url = info.linkUrl || info.srcUrl || tab.url;
    
    if (!url) {
      showNotification("Error", "No valid URL found to scan");
      return;
    }

    showNotification("VirusTotal", "Scanning URL (no download)...");

    // Extract filename from URL for display
    const filename = extractFilenameFromUrl(url);
    
    // Submit URL for scanning only
    const scanResult = await submitUrlToVirusTotal(url);
    
    if (scanResult.success) {
      showNotification("VirusTotal Scan", `Scan submitted for: ${filename}. Check results later.`);
    }

  } catch (error) {
    console.error('Scan-only error:', error);
    showNotification("Error", "Failed to scan: " + error.message);
  }
}

// Show VirusTotal report workflow
async function showVirusTotalReport(info, tab) {
  try {
    const url = info.linkUrl || info.srcUrl || tab.url;
    
    if (!url) {
      showNotification("Error", "No valid URL found");
      return;
    }

    // Create VirusTotal report URL
    const reportUrl = `https://www.virustotal.com/gui/url/${btoa(url)}/detection`;
    
    // Open VirusTotal report in new tab
    chrome.tabs.create({ url: reportUrl });
    
    showNotification("VirusTotal", "Opening report in new tab...");

  } catch (error) {
    console.error('Show-report error:', error);
    showNotification("Error", "Failed to open report: " + error.message);
  }
}

// Helper function to extract filename from URL
function extractFilenameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.split('/').pop() || 'unknown_file';
  } catch (e) {
    return 'unknown_file';
  }
}

// Main function to download file and submit to VirusTotal (legacy - keeping for compatibility)
async function downloadWithVirusTotal(info, tab) {
  // Redirect to downloadThenScan for backward compatibility
  return downloadThenScan(info, tab);
}

// Load API key from secure storage with fallback chain
async function loadApiKey() {
  try {
    // Get the configured storage method
    const methodResult = await chrome.storage.sync.get(['apiKeyStorageMethod']);
    const method = methodResult.apiKeyStorageMethod || 'browser';
    
    switch (method) {
      case 'file':
        return await loadFileApiKey();
      case 'browser':
      default:
        return await loadBrowserApiKey();
    }
  } catch (error) {
    console.error('Error loading API key:', error);
    // Fallback to browser storage
    return await loadBrowserApiKey();
  }
}

// Load API key from browser storage (legacy method)
async function loadBrowserApiKey() {
  const result = await chrome.storage.sync.get(['virusTotalApiKey']);
  return result.virusTotalApiKey;
}

// Load API key from file (requires user to re-select file each session for security)
async function loadFileApiKey() {
  // Check for temporarily stored API key from recent file selection
  const tempData = await chrome.storage.local.get(['tempApiKeyFromFile', 'tempApiKeyTimestamp']);
  
  if (tempData.tempApiKeyFromFile) {
    // Check if the temporary key is still valid (within last 5 minutes)
    const keyAge = Date.now() - (tempData.tempApiKeyTimestamp || 0);
    if (keyAge < 5 * 60 * 1000) {
      return tempData.tempApiKeyFromFile;
    } else {
      // Clean up expired temporary key
      await chrome.storage.local.remove(['tempApiKeyFromFile', 'tempApiKeyTimestamp']);
    }
  }
  
  // File method requires user to select file through popup interface
  throw new Error('API key file not selected. Please select your API key file in the extension popup.');
}



// Load access level setting (free or premium)
async function loadAccessLevel() {
  const result = await chrome.storage.sync.get(['virusTotalAccessLevel']);
  return result.virusTotalAccessLevel || 'free'; // Default to free
}

// Load show report setting
async function loadShowReportSetting() {
  const result = await chrome.storage.sync.get(['alwaysShowReport']);
  return result.alwaysShowReport || false; // Default to false
}

// Load download behavior setting
async function loadDownloadBehaviorSetting() {
  const result = await chrome.storage.sync.get(['downloadAutomatically']);
  return result.downloadAutomatically || false; // Default to false (manual download)
}

// Open custom report tab for scan data
function openCustomReport(scanKey, filename) {
  const reportUrl = chrome.runtime.getURL(`src/report.html?scan=${encodeURIComponent(scanKey)}&filename=${encodeURIComponent(filename)}`);
  chrome.tabs.create({ url: reportUrl });
}

// Rate limiting and quota management functions
async function checkRateLimit() {
  const accessLevel = await loadAccessLevel();
  
  // Premium users don't have the same strict limits
  if (accessLevel === 'premium') {
    return { allowed: true };
  }

  const now = Date.now();
  const result = await chrome.storage.local.get(['vtApiUsage']);
  const usage = result.vtApiUsage || {
    requests: [],
    dailyCount: 0,
    monthlyCount: 0,
    lastResetDay: new Date().toDateString(),
    lastResetMonth: new Date().getFullYear() + '-' + (new Date().getMonth() + 1)
  };

  // Reset daily counter if it's a new day
  const currentDay = new Date().toDateString();
  if (usage.lastResetDay !== currentDay) {
    usage.dailyCount = 0;
    usage.lastResetDay = currentDay;
  }

  // Reset monthly counter if it's a new month
  const currentMonth = new Date().getFullYear() + '-' + (new Date().getMonth() + 1);
  if (usage.lastResetMonth !== currentMonth) {
    usage.monthlyCount = 0;
    usage.lastResetMonth = currentMonth;
  }

  // Clean up old requests (keep only last hour for rate limiting)
  usage.requests = usage.requests.filter(timestamp => now - timestamp < 60000); // 1 minute

  // Check rate limit (4 requests per minute)
  if (usage.requests.length >= 4) {
    const oldestRequest = Math.min(...usage.requests);
    const timeSinceOldest = now - oldestRequest;
    if (timeSinceOldest < 60000) { // Less than 1 minute
      const waitTime = 60000 - timeSinceOldest;
      return { 
        allowed: false, 
        reason: `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
        waitTime: waitTime
      };
    }
  }

  // Check if last request was less than 15 seconds ago (60/4 = 15)
  if (usage.requests.length > 0) {
    const lastRequest = Math.max(...usage.requests);
    const timeSinceLast = now - lastRequest;
    if (timeSinceLast < 15000) { // Less than 15 seconds
      const waitTime = 15000 - timeSinceLast;
      return { 
        allowed: false, 
        reason: `Please wait ${Math.ceil(waitTime / 1000)} seconds before next request.`,
        waitTime: waitTime
      };
    }
  }

  // Check daily quota (500 requests per day)
  if (usage.dailyCount >= 500) {
    return { 
      allowed: false, 
      reason: 'Daily quota of 500 requests exceeded. Try again tomorrow.' 
    };
  }

  // Check monthly quota (15,500 requests per month)
  if (usage.monthlyCount >= 15500) {
    return { 
      allowed: false, 
      reason: 'Monthly quota of 15,500 requests exceeded. Try again next month.' 
    };
  }

  return { allowed: true, usage: usage };
}

// Record API usage
async function recordApiUsage() {
  const accessLevel = await loadAccessLevel();
  
  // Don't track usage for premium users
  if (accessLevel === 'premium') {
    return;
  }

  const now = Date.now();
  const result = await chrome.storage.local.get(['vtApiUsage']);
  const usage = result.vtApiUsage || {
    requests: [],
    dailyCount: 0,
    monthlyCount: 0,
    lastResetDay: new Date().toDateString(),
    lastResetMonth: new Date().getFullYear() + '-' + (new Date().getMonth() + 1)
  };

  // Add current request
  usage.requests.push(now);
  usage.dailyCount++;
  usage.monthlyCount++;

  // Clean up old requests
  usage.requests = usage.requests.filter(timestamp => now - timestamp < 60000);

  // Save updated usage
  await chrome.storage.local.set({ vtApiUsage: usage });
}

// Submit URL to VirusTotal for analysis (returns result object)
async function submitUrlToVirusTotal(originalUrl) {
  try {
    // Check rate limits first
    const rateLimitCheck = await checkRateLimit();
    if (!rateLimitCheck.allowed) {
      showNotification("Rate Limit Exceeded", rateLimitCheck.reason);
      return { success: false, error: rateLimitCheck.reason };
    }

    // Get API key (check file first, then storage)
    const apiKey = await loadApiKey();

    if (!apiKey) {
      const errorMsg = "Please set your VirusTotal API key in the extension popup";
      showNotification("API Key Required", errorMsg);
      return { success: false, error: errorMsg };
    }

    // Record API usage before making the request
    await recordApiUsage();

    // Submit URL for analysis
    const response = await fetch('https://www.virustotal.com/vtapi/v2/url/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `apikey=${encodeURIComponent(apiKey)}&url=${encodeURIComponent(originalUrl)}`
    });

    const data = await response.json();

    if (data.response_code === 1) {
      // Successfully submitted
      const filename = extractFilenameFromUrl(originalUrl);
      
      // Store scan info for later retrieval
      const scanKey = `scan_${Date.now()}`;
      chrome.storage.local.set({
        [scanKey]: {
          filename: filename,
          url: originalUrl,
          scanId: data.scan_id,
          permalink: data.permalink,
          timestamp: new Date().toISOString()
        }
      });

      // Check if we should automatically show the report
      const showReport = await loadShowReportSetting();
      if (showReport) {
        openCustomReport(scanKey, filename);
      }

      return { 
        success: true, 
        scanId: data.scan_id, 
        permalink: data.permalink,
        filename: filename
      };
    } else {
      const errorMsg = data.verbose_msg || "Failed to submit to VirusTotal";
      showNotification("VirusTotal Error", errorMsg);
      return { success: false, error: errorMsg };
    }

  } catch (error) {
    console.error('VirusTotal submission error:', error);
    const errorMsg = "Failed to submit to VirusTotal: " + error.message;
    showNotification("VirusTotal Error", errorMsg);
    return { success: false, error: errorMsg };
  }
}

// Submit file URL to VirusTotal for analysis
async function submitToVirusTotal(filename, originalUrl) {
  try {
    // Check rate limits first
    const rateLimitCheck = await checkRateLimit();
    if (!rateLimitCheck.allowed) {
      showNotification("Rate Limit Exceeded", rateLimitCheck.reason);
      return;
    }

    // Get API key (check file first, then storage)
    const apiKey = await loadApiKey();

    if (!apiKey) {
      showNotification("API Key Required", "Please set your VirusTotal API key in the extension popup");
      return;
    }

    // Record API usage before making the request
    await recordApiUsage();

    // Submit URL for analysis
    const response = await fetch('https://www.virustotal.com/vtapi/v2/url/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `apikey=${encodeURIComponent(apiKey)}&url=${encodeURIComponent(originalUrl)}`
    });

    const data = await response.json();

    if (data.response_code === 1) {
      // Successfully submitted
      showNotification(
        "VirusTotal Scan", 
        `File downloaded: ${filename}\nScan initiated. Check VirusTotal for results.`
      );
      
      // Store scan info for later retrieval
      const scanKey = `scan_${Date.now()}`;
      chrome.storage.local.set({
        [scanKey]: {
          filename: filename,
          url: originalUrl,
          scanId: data.scan_id,
          permalink: data.permalink,
          timestamp: new Date().toISOString()
        }
      });

      // Check if we should automatically show the report
      const showReport = await loadShowReportSetting();
      if (showReport) {
        openCustomReport(scanKey, filename);
      }

    } else {
      showNotification("VirusTotal Error", data.verbose_msg || "Failed to submit to VirusTotal");
    }

  } catch (error) {
    console.error('VirusTotal submission error:', error);
    showNotification("VirusTotal Error", "Failed to submit to VirusTotal: " + error.message);
  }
}

// Show notification to user
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon48.png',
    title: title,
    message: message
  }, (notificationId) => {
    // Clear notification after 5 seconds
    setTimeout(() => {
      chrome.notifications.clear(notificationId);
    }, 5000);
  });
}

async function fetchQuotaFromVirusTotal() {
  try {
    const apiKey = await loadApiKey();
    if (!apiKey) {
      console.log('No API key available for quota fetching');
      return null;
    }

    const response = await fetch('https://www.virustotal.com/api/v3/users/' + encodeURIComponent(apiKey.substring(0, 16)) + '/overall_quotas', {
      method: 'GET',
      headers: {
        'x-apikey': apiKey
      }
    });

    if (response.status === 403) {
      console.log('API key has limited access, using default quotas for free tier');
      return {
        dailyUsed: 0,
        dailyLimit: 500,
        monthlyUsed: 0,
        monthlyLimit: 15500,
        accessLevel: 'free'
      };
    }

    if (!response.ok) {
      console.error('VirusTotal API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (data && data.data) {
      const quotas = data.data;
      const apiRequests = quotas.api_requests_hourly || quotas.api_requests_daily || quotas.api_requests_monthly || {};
      
      const dailyLimit = apiRequests.allowed || 500;
      const monthlyLimit = quotas.api_requests_monthly ? quotas.api_requests_monthly.allowed : 15500;
      
      const accessLevel = (dailyLimit > 500 || monthlyLimit > 15500) ? 'premium' : 'free';
      
      return {
        dailyUsed: apiRequests.used || 0,
        dailyLimit: dailyLimit,
        monthlyUsed: quotas.api_requests_monthly ? quotas.api_requests_monthly.used : 0,
        monthlyLimit: monthlyLimit,
        accessLevel: accessLevel
      };
    }
    
    console.log('No quota data found in VirusTotal response');
    return null;
    
  } catch (error) {
    console.error('Error fetching quota from VirusTotal:', error);
    return null;
  }
}

// Handle messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getScanHistory") {
    chrome.storage.local.get(null, (items) => {
      const scanKeys = Object.keys(items).filter(key => key.startsWith('scan_'));
      const scanHistory = scanKeys
        .map(key => items[key])
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      const scanHistoryWithKeys = scanKeys
        .map(key => ({ key: key, data: items[key] }))
        .sort((a, b) => new Date(b.data.timestamp) - new Date(a.data.timestamp));
      
      sendResponse({
        scanHistory: scanHistory,
        scanHistoryWithKeys: scanHistoryWithKeys
      });
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === "getApiUsage") {
    (async () => {
      try {
        const quotaData = await fetchQuotaFromVirusTotal();
        
        if (quotaData) {
          sendResponse({
            accessLevel: quotaData.accessLevel,
            dailyCount: quotaData.dailyUsed,
            monthlyCount: quotaData.monthlyUsed,
            dailyLimit: quotaData.dailyLimit,
            monthlyLimit: quotaData.monthlyLimit
          });
        } else {
          // Fallback to local tracking if API call fails
          const result = await chrome.storage.local.get(['vtApiUsage']);
          const usage = result.vtApiUsage || {
            requests: [],
            dailyCount: 0,
            monthlyCount: 0,
            lastResetDay: new Date().toDateString(),
            lastResetMonth: new Date().getFullYear() + '-' + (new Date().getMonth() + 1)
          };

          // Reset counters if needed
          const currentDay = new Date().toDateString();
          if (usage.lastResetDay !== currentDay) {
            usage.dailyCount = 0;
            usage.lastResetDay = currentDay;
          }

          const currentMonth = new Date().getFullYear() + '-' + (new Date().getMonth() + 1);
          if (usage.lastResetMonth !== currentMonth) {
            usage.monthlyCount = 0;
            usage.lastResetMonth = currentMonth;
          }

          sendResponse({
            accessLevel: 'free', // Default to free when API call fails
            dailyCount: usage.dailyCount,
            monthlyCount: usage.monthlyCount,
            dailyLimit: 500,
            monthlyLimit: 15500
          });
        }
      } catch (error) {
        console.error('Error getting API usage:', error);
        sendResponse({ error: error.message });
      }
    })();
    return true; // Keep message channel open for async response
  }
  
  if (request.action === "removeScan") {
    if (!request.scanKey) {
      sendResponse({ success: false, error: "No scan key provided" });
      return;
    }
    
    chrome.storage.local.remove(request.scanKey, () => {
      if (chrome.runtime.lastError) {
        console.error('Error removing scan:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log('Scan removed successfully:', request.scanKey);
        sendResponse({ success: true });
      }
    });
    return true; // Keep message channel open for async response
  }
});

// Cleanup old scans based on user's auto-removal setting
async function cleanupOldScans() {
  try {
    // Get the auto-removal setting
    const settingResult = await chrome.storage.sync.get(['autoRemoveDays']);
    const autoRemoveDays = settingResult.autoRemoveDays || 'never';
    
    // Skip cleanup if set to never
    if (autoRemoveDays === 'never') {
      return;
    }
    
    const daysToKeep = parseInt(autoRemoveDays);
    if (isNaN(daysToKeep)) {
      return;
    }
    
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000); // Convert days to milliseconds
    
    // Get all scan items
    const items = await chrome.storage.local.get(null);
    const scanKeys = Object.keys(items).filter(key => key.startsWith('scan_'));
    
    let removedCount = 0;
    const keysToRemove = [];
    
    // Check each scan's timestamp
    for (const key of scanKeys) {
      const scan = items[key];
      if (scan && scan.timestamp && new Date(scan.timestamp).getTime() < cutoffTime) {
        keysToRemove.push(key);
        removedCount++;
      }
    }
    
    // Remove old scans
    if (keysToRemove.length > 0) {
      await chrome.storage.local.remove(keysToRemove);
      console.log(`Auto-cleanup removed ${removedCount} old scans`);
    }
    
  } catch (error) {
    console.error('Error during scan cleanup:', error);
  }
}

// Set up periodic cleanup alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'scanCleanup') {
    cleanupOldScans();
  }
});

// Create cleanup alarm on extension startup
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create('scanCleanup', { periodInMinutes: 60 }); // Run every hour
});

// Also create alarm when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('scanCleanup', { periodInMinutes: 60 }); // Run every hour
  // Run cleanup immediately on install
  cleanupOldScans();
});
