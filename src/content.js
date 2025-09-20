// Enhanced user experience through visual feedback on downloadable content
(function() {
    'use strict';

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'pageInfo') {
            sendResponse({
                url: window.location.href,
                title: document.title,
                domain: window.location.hostname
            });
        }
    });


    function addVisualFeedback() {
        const downloadableElements = document.querySelectorAll('a[href], img[src], video[src], audio[src]');
        
        downloadableElements.forEach(element => {
            element.addEventListener('contextmenu', function() {
                const originalOpacity = element.style.opacity;
                element.style.opacity = '0.8';
                element.style.transition = 'opacity 0.2s';
                
                setTimeout(() => {
                    element.style.opacity = originalOpacity;
                }, 500);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addVisualFeedback);
    } else {
        addVisualFeedback();
    }

    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const hasDownloadable = node.matches && (
                            node.matches('a[href], img[src], video[src], audio[src]') ||
                            node.querySelector('a[href], img[src], video[src], audio[src]')
                        );
                        if (hasDownloadable) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });
        
        if (shouldUpdate) {
            clearTimeout(window.vtExtensionUpdateTimeout);
            window.vtExtensionUpdateTimeout = setTimeout(addVisualFeedback, 100);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    window.addEventListener('beforeunload', () => {
        observer.disconnect();
        clearTimeout(window.vtExtensionUpdateTimeout);
    });

})();