# Maintenance Mode Package

A self-contained, drop-in maintenance mode system for any website. Features a password-protected admin panel and a beautiful "Temporarily Unavailable" overlay.

## Features

- 🔒 **Password Protected Admin Panel** - Hardcoded password for security
- 🎨 **Beautiful Overlay** - Modern, dark-themed maintenance page
- 🚫 **SEO Safe** - Blocks robots, no indexing
- 💾 **Persistent State** - Uses localStorage to persist state across browser sessions
- 📱 **Fully Responsive** - Works on all devices
- ⚡ **Zero Dependencies** - Pure vanilla JS

## Quick Start

### 1. Copy files to your project

```
your-project/
├── heyitsmecb.html     (admin panel - access at /heyitsmecb.html)
├── maintenance-mode.js  (add this script to your main page)
└── public/
    └── robots.txt       (blocks crawlers from admin page)
```

### 2. Add the script to your main HTML

Add this script tag to the `<head>` of your main `index.html`:

```html
<script src="/maintenance-mode.js"></script>
```

**Or** for ES modules (Vite, etc.):

```javascript
import './maintenance-mode.js'
```

### 3. Update robots.txt

Add these lines to your `robots.txt`:

```
Disallow: /heyitsmecb.html
Disallow: /heyitsmecb
```

### 4. Change the password!

Open `heyitsmecb.html` and change the password on this line:

```javascript
const ADMIN_PASSWORD = 'your-secure-password';
```

## Usage

1. Navigate to `/heyitsmecb.html` on your website
2. Enter the password (default: `hisher2026cb`)
3. Toggle the "Maintenance Mode" switch ON to show the unavailable page
4. Toggle it OFF when the invoice is paid

## Customization

### Change the password
Edit `heyitsmecb.html`:
```javascript
const ADMIN_PASSWORD = 'your-new-password';
```

### Change the storage key
If using multiple sites, change the storage key in both files:
```javascript
const STORAGE_KEY = 'your_site_maintenance_mode';
```

### Customize the overlay message
Edit `maintenance-mode.js` to change the text, colors, or add your branding.

## Files

| File | Purpose |
|------|---------|
| `heyitsmecb.html` | Admin panel (password protected) |
| `maintenance-mode.js` | Overlay script (add to your main page) |
| `robots.txt` | Robot exclusion rules |

## How It Works

1. The admin panel sets a `localStorage` flag when you toggle maintenance mode ON
2. The `maintenance-mode.js` script checks this flag on every page load
3. If the flag is `true`, it immediately shows the "Temporarily Unavailable" overlay
4. The overlay completely covers the page content until you toggle it OFF

## Security Notes

- The password is stored in plain text in the HTML file (not for high-security use)
- Only use this for simple payment enforcement, not for actual security
- The admin page is hidden from search engines but can be accessed via direct URL
- Consider IP restrictions at the server level for additional security

## License

MIT - Free to use in any project
