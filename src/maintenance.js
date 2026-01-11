// Maintenance Mode Overlay System
// This script checks localStorage for maintenance mode and displays the overlay

(function () {
    const STORAGE_KEY = 'hisher_maintenance_mode';

    // Check if maintenance mode is enabled
    const isMaintenanceMode = localStorage.getItem(STORAGE_KEY) === 'true';

    if (!isMaintenanceMode) return;

    // Create the maintenance overlay
    const overlay = document.createElement('div');
    overlay.id = 'maintenance-overlay';
    overlay.innerHTML = `
        <div class="maintenance-container">
            <!-- Loading Icon -->
            <div class="maintenance-icon">
                <div class="icon-circle">
                    <div class="icon-inner"></div>
                </div>
            </div>
            
            <!-- Title -->
            <h1 class="maintenance-title">Temporarily Unavailable</h1>
            <p class="maintenance-subtitle">This site is currently unavailable. We're working to get it back online.</p>
            
            <!-- Expandable Section -->
            <div class="owner-section">
                <button class="owner-toggle" id="ownerToggle">
                    Are you the site owner?
                    <span class="toggle-arrow">▼</span>
                </button>
                
                <div class="owner-content" id="ownerContent">
                    <div class="reason-tabs">
                        <button class="reason-tab active" data-reason="payment">Payment Issue</button>
                        <button class="reason-tab" data-reason="maintenance">Scheduled Maintenance</button>
                        <button class="reason-tab" data-reason="suspended">Service Suspended</button>
                    </div>
                    
                    <div class="reason-details">
                        <div class="reason-item active" id="reason-payment">
                            <div class="reason-header">
                                <span class="reason-icon">◯</span>
                                <span class="reason-title">Payment Issue</span>
                            </div>
                            <p class="reason-description">The invoice was not paid for this service in our system. If this is an issue, please go ahead and contact the admin of your project to get it live back.</p>
                        </div>
                        <div class="reason-item" id="reason-maintenance">
                            <div class="reason-header">
                                <span class="reason-icon">◯</span>
                                <span class="reason-title">Scheduled Maintenance</span>
                            </div>
                            <p class="reason-description">We're performing scheduled maintenance to improve our services. Please check back soon.</p>
                        </div>
                        <div class="reason-item" id="reason-suspended">
                            <div class="reason-header">
                                <span class="reason-icon">◯</span>
                                <span class="reason-title">Service Suspended</span>
                            </div>
                            <p class="reason-description">This service has been temporarily suspended. Please contact support for more information.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
        #maintenance-overlay {
            position: fixed;
            inset: 0;
            z-index: 999999;
            background: #0f0f0f;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
            overflow-y: auto;
            padding: 2rem;
        }
        
        .maintenance-container {
            text-align: center;
            max-width: 600px;
            width: 100%;
        }
        
        /* Icon Animation */
        .maintenance-icon {
            margin-bottom: 2rem;
        }
        
        .icon-circle {
            width: 48px;
            height: 48px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse-ring 2s infinite;
        }
        
        .icon-inner {
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 50%;
        }
        
        @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        /* Typography */
        .maintenance-title {
            font-size: 2rem;
            font-weight: 700;
            color: #fff;
            margin: 0 0 1rem 0;
            letter-spacing: -0.02em;
        }
        
        .maintenance-subtitle {
            font-size: 0.95rem;
            color: rgba(255, 255, 255, 0.5);
            margin: 0 0 3rem 0;
            line-height: 1.6;
        }
        
        /* Owner Section */
        .owner-section {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            overflow: hidden;
        }
        
        .owner-toggle {
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
        
        .owner-toggle:hover {
            color: rgba(255, 255, 255, 0.8);
        }
        
        .toggle-arrow {
            font-size: 0.75rem;
            transition: transform 0.3s ease;
        }
        
        .owner-toggle.active .toggle-arrow {
            transform: rotate(180deg);
        }
        
        .owner-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.4s ease;
        }
        
        .owner-content.expanded {
            max-height: 500px;
        }
        
        /* Reason Tabs */
        .reason-tabs {
            display: flex;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            overflow-x: auto;
        }
        
        .reason-tab {
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
        
        .reason-tab:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        
        .reason-tab.active {
            background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
            border-color: transparent;
            color: #fff;
        }
        
        /* Reason Details */
        .reason-details {
            padding: 1rem;
        }
        
        .reason-item {
            display: none;
            text-align: left;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 8px;
        }
        
        .reason-item.active {
            display: block;
        }
        
        .reason-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
        }
        
        .reason-icon {
            color: rgba(255, 255, 255, 0.4);
            font-size: 0.875rem;
        }
        
        .reason-title {
            color: #fff;
            font-weight: 600;
            font-size: 0.875rem;
        }
        
        .reason-description {
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
            
            .maintenance-title {
                font-size: 1.5rem;
            }
            
            .maintenance-subtitle {
                font-size: 0.875rem;
            }
            
            .reason-tabs {
                flex-direction: column;
            }
            
            .reason-tab {
                text-align: center;
            }
        }
    `;

    // Insert into DOM immediately
    document.head.appendChild(styles);
    document.body.insertBefore(overlay, document.body.firstChild);

    // Hide the rest of the page
    document.getElementById('app').style.display = 'none';
    document.body.style.overflow = 'hidden';

    // Toggle functionality
    setTimeout(() => {
        const ownerToggle = document.getElementById('ownerToggle');
        const ownerContent = document.getElementById('ownerContent');
        const reasonTabs = document.querySelectorAll('.reason-tab');

        if (ownerToggle && ownerContent) {
            ownerToggle.addEventListener('click', () => {
                ownerToggle.classList.toggle('active');
                ownerContent.classList.toggle('expanded');
            });
        }

        // Tab switching
        reasonTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const reason = tab.dataset.reason;

                // Update tabs
                reasonTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update content
                document.querySelectorAll('.reason-item').forEach(item => {
                    item.classList.remove('active');
                });
                document.getElementById(`reason-${reason}`).classList.add('active');
            });
        });
    }, 100);
})();
