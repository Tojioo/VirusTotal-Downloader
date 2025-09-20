// Detailed scan results interface helps users make informed download decisions
(function() {
    'use strict';

    const filenameEl = document.getElementById('filename');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const reportContent = document.getElementById('reportContent');
    const downloadBtn = document.getElementById('downloadBtn');
    
    const malwareCountEl = document.getElementById('malwareCount');
    const suspiciousCountEl = document.getElementById('suspiciousCount');
    const cleanCountEl = document.getElementById('cleanCount');
    const totalEnginesEl = document.getElementById('totalEngines');
    
    const detectionResultsEl = document.getElementById('detectionResults');
    const scanIdEl = document.getElementById('scanId');
    const scanDateEl = document.getElementById('scanDate');
    const resourceEl = document.getElementById('resource');
    const permalinkEl = document.getElementById('permalink');
    const virusTotalLinkEl = document.getElementById('virusTotalLink');

    // Enable download after user reviews scan results
    let currentScanData = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        loadReportData();
        loadDarkMode();
        
        // Add download button event listener
        downloadBtn.addEventListener('click', function() {
            if (currentScanData && currentScanData.url) {
                // Download the file using Chrome downloads API
                chrome.downloads.download({
                    url: currentScanData.url,
                    saveAs: false,
                    filename: currentScanData.filename
                });
            } else {
                alert('Download URL not available');
            }
        });
    });

    // Load report data from URL parameters and storage
    async function loadReportData() {
        try {
            // Get scan ID from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const scanKey = urlParams.get('scan');
            const filename = urlParams.get('filename');
            
            if (!scanKey) {
                showError('No scan data specified');
                return;
            }

            // Update filename display
            if (filename) {
                filenameEl.textContent = decodeURIComponent(filename);
            }

            // Get scan data from storage
            const result = await chrome.storage.local.get([scanKey]);
            const scanData = result[scanKey];
            
            if (!scanData) {
                showError('Scan data not found');
                return;
            }

            // Try to fetch detailed scan results from VirusTotal
            await fetchScanResults(scanData);

        } catch (error) {
            console.error('Error loading report data:', error);
            showError('Failed to load scan report: ' + error.message);
        }
    }

    // Fetch detailed scan results from VirusTotal API
    async function fetchScanResults(scanData) {
        try {
            // Get API key
            const apiKey = await getApiKey();
            if (!apiKey) {
                // Show basic scan info without detailed results
                displayBasicScanInfo(scanData);
                return;
            }

            // Fetch scan report from VirusTotal
            const response = await fetch(`https://www.virustotal.com/vtapi/v2/url/report?apikey=${encodeURIComponent(apiKey)}&resource=${encodeURIComponent(scanData.url)}&scan=1`);
            
            if (!response.ok) {
                console.error(`HTTP error: ${response.status}`);
                displayBasicScanInfo(scanData, 'Could not fetch detailed results');
                return;
            }

            const reportData = await response.json();
            
            if (reportData.response_code === 1) {
                // Successfully got scan results
                displayFullScanReport(scanData, reportData);
            } else if (reportData.response_code === 0) {
                // Scan not found or still pending
                displayBasicScanInfo(scanData, 'Scan is still pending or not found');
            } else {
                displayBasicScanInfo(scanData, reportData.verbose_msg || 'Unknown status');
            }

        } catch (error) {
            console.error('Error fetching scan results:', error);
            // Fall back to basic info if API call fails
            displayBasicScanInfo(scanData, 'Could not fetch detailed results');
        }
    }

    // Get API key from secure storage with fallback chain
    async function getApiKey() {
        try {
            // Get the configured storage method
            const methodResult = await chrome.storage.sync.get(['apiKeyStorageMethod']);
            const method = methodResult.apiKeyStorageMethod || 'browser';
            
            switch (method) {
                case 'file':
                    return await getFileApiKey();
                case 'browser':
                default:
                    return await getBrowserApiKey();
            }
        } catch (error) {
            console.error('Error loading API key:', error);
            // Fallback to browser storage
            return await getBrowserApiKey();
        }
    }

    // Get API key from browser storage (legacy method)
    async function getBrowserApiKey() {
        const result = await chrome.storage.sync.get(['virusTotalApiKey']);
        return result.virusTotalApiKey;
    }

    // Get API key from file storage
    async function getFileApiKey() {
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


    // Display full scan report with detailed results
    function displayFullScanReport(scanData, reportData) {
        // Store scan data for download functionality
        currentScanData = scanData;
        // Update metadata
        scanIdEl.textContent = scanData.scanId || 'N/A';
        scanDateEl.textContent = scanData.timestamp ? new Date(scanData.timestamp).toLocaleString() : 'N/A';
        resourceEl.textContent = scanData.url || 'N/A';
        permalinkEl.textContent = reportData.permalink || scanData.permalink || 'N/A';
        
        // Update VirusTotal link
        if (reportData.permalink || scanData.permalink) {
            virusTotalLinkEl.href = reportData.permalink || scanData.permalink;
        }

        // Process scan results if available
        if (reportData.scans) {
            const engines = Object.keys(reportData.scans);
            let malwareCount = 0;
            let suspiciousCount = 0;
            let cleanCount = 0;

            // Count detection types
            engines.forEach(engine => {
                const result = reportData.scans[engine];
                if (result.detected) {
                    if (result.result && result.result.toLowerCase().includes('suspicious')) {
                        suspiciousCount++;
                    } else {
                        malwareCount++;
                    }
                } else {
                    cleanCount++;
                }
            });

            // Update summary stats
            malwareCountEl.textContent = malwareCount;
            suspiciousCountEl.textContent = suspiciousCount;
            cleanCountEl.textContent = cleanCount;
            totalEnginesEl.textContent = engines.length;

            // Display detailed results
            displayDetectionResults(reportData.scans);
        } else {
            // No detailed scan results available
            displayBasicStats(scanData);
        }

        // Show the report content
        showReport();
    }

    // Display basic scan info without detailed results
    function displayBasicScanInfo(scanData, statusMessage = null) {
        // Store scan data for download functionality
        currentScanData = scanData;
        // Update metadata
        scanIdEl.textContent = scanData.scanId || 'N/A';
        scanDateEl.textContent = scanData.timestamp ? new Date(scanData.timestamp).toLocaleString() : 'N/A';
        resourceEl.textContent = scanData.url || 'N/A';
        permalinkEl.textContent = scanData.permalink || 'N/A';
        
        // Update VirusTotal link
        if (scanData.permalink) {
            virusTotalLinkEl.href = scanData.permalink;
        }

        // Show basic stats or status message
        if (statusMessage) {
            detectionResultsEl.innerHTML = `<div class="no-data">${escapeHtml(statusMessage)}</div>`;
        } else {
            displayBasicStats(scanData);
        }

        // Show the report content
        showReport();
    }

    // Display basic stats when detailed results aren't available
    function displayBasicStats(scanData) {
        malwareCountEl.textContent = '?';
        suspiciousCountEl.textContent = '?';
        cleanCountEl.textContent = '?';
        totalEnginesEl.textContent = '?';

        detectionResultsEl.innerHTML = '<div class="no-data">Detailed scan results not available. Check the VirusTotal link for complete results.</div>';
    }

    // Display detailed detection results
    function displayDetectionResults(scans) {
        const engines = Object.keys(scans).sort();
        
        if (engines.length === 0) {
            detectionResultsEl.innerHTML = '<div class="no-data">No detection results available</div>';
            return;
        }

        let html = '';
        engines.forEach(engine => {
            const result = scans[engine];
            let resultClass = 'clean';
            let resultText = 'Clean';

            if (result.detected) {
                if (result.result && result.result.toLowerCase().includes('suspicious')) {
                    resultClass = 'suspicious';
                    resultText = result.result || 'Suspicious';
                } else {
                    resultClass = 'malware';
                    resultText = result.result || 'Malware';
                }
            }

            html += `
                <div class="detection-item">
                    <div class="detection-engine">${escapeHtml(engine)}</div>
                    <div class="detection-result ${resultClass}">${escapeHtml(resultText)}</div>
                </div>
            `;
        });

        detectionResultsEl.innerHTML = html;
    }

    // Show the report content and hide loading
    function showReport() {
        loadingMessage.style.display = 'none';
        errorMessage.style.display = 'none';
        reportContent.style.display = 'block';
    }

    // Show error message
    function showError(message) {
        loadingMessage.style.display = 'none';
        reportContent.style.display = 'none';
        errorMessage.style.display = 'block';
        errorMessage.querySelector('p').textContent = message;
    }

    // Load and apply dark mode setting
    async function loadDarkMode() {
        try {
            const result = await chrome.storage.sync.get(['darkMode']);
            const darkMode = result.darkMode || false;
            
            if (darkMode) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        } catch (error) {
            console.error('Error loading dark mode setting:', error);
        }
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

})();