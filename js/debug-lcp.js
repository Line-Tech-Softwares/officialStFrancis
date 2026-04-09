/**
 * LCP (Largest Contentful Paint) Debug Console
 * Monitors and logs performance metrics to help diagnose page loading issues
 */

(function() {
    'use strict';

    // Create debug overlay
    const debugConsole = {
        logs: [],
        enabled: true,
        
        init() {
            this.createUI();
            this.monitorLCP();
            this.monitorImageLoading();
            this.monitorResourceTiming();
            this.log('[INIT]', 'Debug console initialized');
        },

        createUI() {
            // Create debug panel
            const panel = document.createElement('div');
            panel.id = 'debug-lcp-console';
            panel.innerHTML = `
                <style>
                    #debug-lcp-console {
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        width: 400px;
                        max-height: 300px;
                        background: #1e1e1e;
                        border: 2px solid #4CAF50;
                        border-radius: 8px;
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        color: #00ff00;
                        z-index: 99999;
                        box-shadow: 0 0 10px rgba(0,0,0,0.5);
                        display: none;
                        flex-direction: column;
                    }
                    #debug-lcp-console.show {
                        display: flex;
                    }
                    #debug-lcp-header {
                        padding: 10px;
                        background: #2d2d2d;
                        border-bottom: 1px solid #4CAF50;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        cursor: move;
                    }
                    #debug-lcp-title {
                        font-weight: bold;
                        user-select: none;
                    }
                    #debug-lcp-close {
                        background: #4CAF50;
                        color: #1e1e1e;
                        border: none;
                        padding: 2px 8px;
                        cursor: pointer;
                        border-radius: 3px;
                        font-weight: bold;
                    }
                    #debug-lcp-logs {
                        overflow-y: auto;
                        padding: 10px;
                        flex: 1;
                        line-height: 1.6;
                    }
                    .log-entry {
                        margin-bottom: 8px;
                        padding-bottom: 5px;
                        border-bottom: 1px solid #333;
                    }
                    .log-time {
                        color: #ffaa00;
                    }
                    .log-level {
                        font-weight: bold;
                    }
                    .log-level.warn {
                        color: #ff6b6b;
                    }
                    .log-level.error {
                        color: #ff1744;
                    }
                    .log-level.success {
                        color: #4CAF50;
                    }
                </style>
                <div id="debug-lcp-header">
                    <span id="debug-lcp-title">⚡ LCP Debug Console</span>
                    <button id="debug-lcp-close">✕</button>
                </div>
                <div id="debug-lcp-logs"></div>
            `;
            document.body.appendChild(panel);

            // Event listeners
            document.getElementById('debug-lcp-close').addEventListener('click', () => {
                panel.classList.remove('show');
            });

            // Show console with keyboard shortcut (Ctrl+Shift+D)
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
                    panel.classList.toggle('show');
                }
            });
        },

        log(label, message, level = 'info') {
            const time = new Date().toLocaleTimeString();
            const entry = { time, label, message, level };
            this.logs.push(entry);
            this.updateUI(entry);
            console.log(`${label} ${message}`);
        },

        updateUI(entry) {
            const logsDiv = document.getElementById('debug-lcp-logs');
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.innerHTML = `
                <span class="log-time">[${entry.time}]</span>
                <span class="log-level ${entry.level}">${entry.label}</span>
                <span>${entry.message}</span>
            `;
            logsDiv.appendChild(logEntry);
            logsDiv.scrollTop = logsDiv.scrollHeight;
        },

        monitorLCP() {
            this.log('[LCP]', 'Starting LCP monitoring...', 'info');

            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.renderTime === 0) {
                        entry.renderTime = entry.loadTime;
                    }

                    const elementInfo = entry.element 
                        ? `${entry.element.tagName}.${entry.element.className.split(' ').join('.')}` 
                        : 'Unknown';
                    
                    const message = `LCP: ${(entry.renderTime / 1000).toFixed(2)}s - Element: ${elementInfo}`;
                    
                    if (entry.renderTime > 4000) {
                        this.log('[LCP]', message + ' ⚠️ POOR', 'warn');
                        this.addSuggestion('LCP Issue', [
                            '• Hero image file size is too large',
                            '• Image is not optimized',
                            '• Font loading is blocking render',
                            '• JavaScript execution is slow',
                            'Fix: Optimize images, preload fonts, defer non-critical JS'
                        ]);
                    } else if (entry.renderTime > 2500) {
                        this.log('[LCP]', message + ' ⚠️ NEEDS IMPROVEMENT', 'warn');
                    } else {
                        this.log('[LCP]', message + ' ✓ GOOD', 'success');
                    }
                }
            });

            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        },

        monitorImageLoading() {
            this.log('[IMG]', 'Monitoring image loading...', 'info');

            const images = document.querySelectorAll('img, [style*="background-image"]');
            let loadedCount = 0;
            let startTime = performance.now();

            images.forEach((img) => {
                if (img.tagName === 'IMG') {
                    img.addEventListener('load', () => {
                        loadedCount++;
                        const duration = (performance.now() - startTime) / 1000;
                        this.log('[IMG]', `Loaded: ${img.src || 'unknown'} (${duration.toFixed(2)}s)`, 'success');
                    });
                    img.addEventListener('error', () => {
                        this.log('[IMG]', `Failed to load: ${img.src}`, 'error');
                    });
                }
            });

            // Monitor hero background specifically
            const heroBackground = document.querySelector('.hero__background');
            if (heroBackground) {
                const bgImage = window.getComputedStyle(heroBackground).backgroundImage;
                this.log('[HERO]', `Background image: ${bgImage.substring(0, 60)}...`, 'info');
            }
        },

        monitorResourceTiming() {
            window.addEventListener('load', () => {
                const resources = performance.getEntriesByType('resource');
                const slowResources = resources
                    .filter(r => r.duration > 1000)
                    .sort((a, b) => b.duration - a.duration)
                    .slice(0, 5);

                this.log('[PERF]', `Page Load Time: ${(performance.timing.loadEventEnd - performance.timing.navigationStart) / 1000}s`, 'info');

                if (slowResources.length > 0) {
                    this.log('[SLOW]', `Found ${slowResources.length} slow resources:`, 'warn');
                    slowResources.forEach(r => {
                        this.log('[SLOW]', `${(r.duration / 1000).toFixed(2)}s - ${r.name.substring(r.name.lastIndexOf('/') + 1)}`, 'warn');
                    });
                } else {
                    this.log('[PERF]', 'All resources loaded efficiently', 'success');
                }
            });
        },

        addSuggestion(title, suggestions) {
            const logDiv = document.getElementById('debug-lcp-logs');
            if (logDiv && !logDiv.innerHTML.includes(title)) {
                const suggestionEntry = document.createElement('div');
                suggestionEntry.className = 'log-entry';
                suggestionEntry.innerHTML = `
                    <div style="color: #4CAF50; font-weight: bold;">💡 ${title}</div>
                    ${suggestions.map(s => `<div style="margin-left: 10px; color: #aaa;">${s}</div>`).join('')}
                `;
                logDiv.appendChild(suggestionEntry);
                logDiv.scrollTop = logDiv.scrollHeight;
            }
        }
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => debugConsole.init());
    } else {
        debugConsole.init();
    }

    // Expose to window for manual access
    window.debugLCP = debugConsole;
    window.debugLCP.log('[DEBUG]', 'Press Ctrl+Shift+D to toggle console', 'success');
})();
