/**
 * Maintenance Mode Overlay
 * 
 * A standalone, drop-in script that displays a "Temporarily Unavailable" 
 * page when maintenance mode is enabled via the admin panel.
 * 
 * Usage: Add this script to your main HTML file's <head> or import it
 * 
 * Configuration:
 * - STORAGE_KEY: Change this if using on multiple sites
 * - Customize the HTML/CSS below to match your branding
 * 
 * @version 1.0.0
 * @license MIT
 */

(function () {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const STORAGE_KEY = 'hisher_maintenance_mode';

    // Check if maintenance mode is enabled
    const isMaintenanceMode = localStorage.getItem(STORAGE_KEY) === 'true';

    // Exit early if not in maintenance mode
    if (!isMaintenanceMode) return;

    // ============================================
    // STYLES
    // ============================================
    const styles = `
        #maintenance-overlay {
            position: fixed;
            inset: 0;
            z-index: 2147483647;
            background: #0f0f0f;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
            overflow-y: auto;
            padding: 2rem;
        }
        
        #maintenance-overlay * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        .mm-container {
            text-align: center;
            max-width: 600px;
            width: 100%;
        }
        
        /* Icon Animation */
        .mm-icon {
            margin-bottom: 2rem;
        }
        
        .mm-icon-circle {
            width: 48px;
            height: 48px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: mm-pulse-ring 2s infinite;
        }
        
        .mm-icon-inner {
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 50%;
        }
        
        @keyframes mm-pulse-ring {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        /* Typography */
        .mm-title {
            font-size: 2rem;
            font-weight: 700;
            color: #fff;
            margin: 0 0 1rem 0;
            letter-spacing: -0.02em;
        }
        
        .mm-subtitle {
            font-size: 0.95rem;
            color: rgba(255, 255, 255, 0.5);
            margin: 0 0 3rem 0;
            line-height: 1.6;
        }
        
        /* Owner Section */
        .mm-owner-section {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            overflow: hidden;
        }
        
        .mm-owner-toggle {
            width: 100%;
            padding: 1rem 1.5rem;
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.875rem;
            font-family: inherit;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        }
        
        .mm-owner-toggle:hover {
            color: rgba(255, 255, 255, 0.8);
        }
        
        .mm-toggle-arrow {
            font-size: 0.75rem;
            transition: transform 0.3s ease;
        }
        
        .mm-owner-toggle.active .mm-toggle-arrow {
            transform: rotate(180deg);
        }
        
        .mm-owner-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.4s ease;
        }
        
        .mm-owner-content.expanded {
            max-height: 500px;
        }
        
        /* Reason Tabs */
        .mm-reason-tabs {
            display: flex;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            overflow-x: auto;
        }
        
        .mm-reason-tab {
            flex: 1;
            min-width: fit-content;
            padding: 0.75rem 1rem;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.75rem;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.3s ease;
            white-space: nowrap;
        }
        
        .mm-reason-tab:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        
        .mm-reason-tab.active {
            background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
            border-color: transparent;
            color: #fff;
        }
        
        /* Reason Details */
        .mm-reason-details {
            padding: 1rem;
        }
        
        .mm-reason-item {
            display: none;
            text-align: left;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 8px;
        }
        
        .mm-reason-item.active {
            display: block;
        }
        
        .mm-reason-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
        }
        
        .mm-reason-icon {
            color: rgba(255, 255, 255, 0.4);
            font-size: 0.875rem;
        }
        
        .mm-reason-title {
            color: #fff;
            font-weight: 600;
            font-size: 0.875rem;
        }
        
        .mm-reason-description {
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.8rem;
            line-height: 1.6;
            margin: 0;
        }
        
        /* Mobile Responsive */
        @media (max-width: 640px) {
            #maintenance-overlay {
                padding: 1rem;
            }
            
            .mm-title {
                font-size: 1.5rem;
            }
            
            .mm-subtitle {
                font-size: 0.875rem;
            }
            
            .mm-reason-tabs {
                flex-direction: column;
            }
            
            .mm-reason-tab {
                text-align: center;
            }
        }
    `;

    // ============================================
    // HTML TEMPLATE
    // ============================================
    const template = `
        <div class="mm-container">
            <!-- Loading Icon -->
            <div class="mm-icon">
                <div class="mm-icon-circle">
                    <div class="mm-icon-inner"></div>
                </div>
            </div>
            
            <!-- Title -->
            <h1 class="mm-title">Temporarily Unavailable</h1>
            <p class="mm-subtitle">This site is currently unavailable. We're working to get it back online.</p>
            
            <!-- Expandable Section -->
            <div class="mm-owner-section">
                <button class="mm-owner-toggle" id="mm-owner-toggle">
                    Are you the site owner?
                    <span class="mm-toggle-arrow">▼</span>
                </button>
                
                <div class="mm-owner-content" id="mm-owner-content">
                    <div class="mm-reason-tabs">
                        <button class="mm-reason-tab active" data-reason="payment">Payment Issue</button>
                        <button class="mm-reason-tab" data-reason="maintenance">Scheduled Maintenance</button>
                        <button class="mm-reason-tab" data-reason="suspended">Service Suspended</button>
                    </div>
                    
                    <div class="mm-reason-details">
                        <div class="mm-reason-item active" id="mm-reason-payment">
                            <div class="mm-reason-header">
                                <span class="mm-reason-icon">◯</span>
                                <span class="mm-reason-title">Payment Issue</span>
                            </div>
                            <p class="mm-reason-description">The invoice was not paid for this service in our system. If this is an issue, please go ahead and contact the admin of your project to get it live back.</p>
                        </div>
                        <div class="mm-reason-item" id="mm-reason-maintenance">
                            <div class="mm-reason-header">
                                <span class="mm-reason-icon">◯</span>
                                <span class="mm-reason-title">Scheduled Maintenance</span>
                            </div>
                            <p class="mm-reason-description">We're performing scheduled maintenance to improve our services. Please check back soon.</p>
                        </div>
                        <div class="mm-reason-item" id="mm-reason-suspended">
                            <div class="mm-reason-header">
                                <span class="mm-reason-icon">◯</span>
                                <span class="mm-reason-title">Service Suspended</span>
                            </div>
                            <p class="mm-reason-description">This service has been temporarily suspended. Please contact support for more information.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // ============================================
    // INITIALIZATION
    // ============================================

    // Create and inject styles
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'maintenance-overlay';
    overlay.innerHTML = template;

    // Insert overlay as first child of body (blocks everything)
    if (document.body) {
        document.body.insertBefore(overlay, document.body.firstChild);
    } else {
        // If body doesn't exist yet, wait for it
        document.addEventListener('DOMContentLoaded', function () {
            document.body.insertBefore(overlay, document.body.firstChild);
        });
    }

    // Hide all other content
    function hideContent() {
        // Find the main app container or body children
        const appContainer = document.getElementById('app') || document.getElementById('root') || document.getElementById('__next');
        if (appContainer) {
            appContainer.style.display = 'none';
        }

        // Prevent scrolling
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    }

    // Run immediately if possible, otherwise wait for DOM
    if (document.body) {
        hideContent();
    }
    document.addEventListener('DOMContentLoaded', hideContent);

    // ============================================
    // INTERACTIVITY
    // ============================================

    function initInteractivity() {
        const ownerToggle = document.getElementById('mm-owner-toggle');
        const ownerContent = document.getElementById('mm-owner-content');
        const reasonTabs = document.querySelectorAll('.mm-reason-tab');

        if (ownerToggle && ownerContent) {
            ownerToggle.addEventListener('click', function () {
                ownerToggle.classList.toggle('active');
                ownerContent.classList.toggle('expanded');
            });
        }

        // Tab switching
        reasonTabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                const reason = tab.dataset.reason;

                // Update tabs
                reasonTabs.forEach(function (t) {
                    t.classList.remove('active');
                });
                tab.classList.add('active');

                // Update content
                document.querySelectorAll('.mm-reason-item').forEach(function (item) {
                    item.classList.remove('active');
                });
                const reasonElement = document.getElementById('mm-reason-' + reason);
                if (reasonElement) {
                    reasonElement.classList.add('active');
                }
            });
        });
    }

    // Initialize interactivity when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initInteractivity);
    } else {
        setTimeout(initInteractivity, 100);
    }

})();
