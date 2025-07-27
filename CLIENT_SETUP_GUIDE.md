#  Client Setup Guide for UEC Launcher

## Overview
This guide explains how to add the actual HTML client files (Astra, Resent, Star-like, Eagly-MC) to your UEC Launcher.

## Directory Structure
Create the following folder structure in your project root:

```
public/
├── clients/
│   ├── resent/
│   │   └── index.html
│   ├── shadow/
│   │   └── index.html
│   ├── astra/
│   │   └── index.html
│   ├── starlike/
│   │   └── index.html
│   └── eaglymc/
│       └── index.html
```

## Setup Instructions

### 1. Create Client Directories
```bash
mkdir -p public/clients/resent
mkdir -p public/clients/shadow
mkdir -p public/clients/astra
mkdir -p public/clients/starlike
mkdir -p public/clients/eaglymc
```

### 2. Add Client Files

#### For Resent Client:
1. Place your Resent client files in `public/clients/resent/`
2. Ensure the main HTML file is named `index.html`
3. Include all required assets (CSS, JS, textures) in the same folder

#### For Shadow Client:
1. Place your Shadow client files in `public/clients/shadow/`
2. Ensure the main HTML file is named `index.html`
3. Include all dependencies in the shadow folder

#### For Astra Client:
1. Place your Astra client files in `public/clients/astra/`
2. Ensure the main HTML file is named `index.html`
3. Include all required resources

#### For Star-like Client:
1. Place your Star-like client files in `public/clients/starlike/`
2. Ensure the main HTML file is named `index.html`
3. Include all assets and dependencies

#### For Eagly-MC Client:
1. Place your Eagly-MC client files in `public/clients/eaglymc/`
2. Ensure the main HTML file is named `index.html`
3. Include all required files

## Client HTML Template
Each client should have a basic HTML structure like this:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Client Name</title>
    <!-- Client-specific CSS -->
    <link rel="stylesheet" href="client.css">
</head>
<body>
    <div id="game-container">
        <canvas id="game-canvas"></canvas>
    </div>
    
    <!-- Client-specific JavaScript -->
    <script src="client.js"></script>
</body>
</html>
```

## File Organization Tips

### 3. Recommended Structure for Each Client:
```
public/clients/resent/
├── index.html          # Main HTML file
├── client.js           # Main JavaScript
├── client.css          # Styles
├── assets/             # Game assets
│   ├── textures/       # Texture files
│   ├── sounds/         # Audio files
│   └── models/         # 3D models
└── libs/               # External libraries
    ├── three.js        # 3D engine
    └── other-libs.js   # Other dependencies
```

## Configuration Options

### 4. Client Configuration
The launcher passes configuration parameters via URL parameters:

```javascript
// Example: launching with custom settings
clientLauncher.launchClient('Resent', {
    'render-distance': '8',
    'enable-shaders': 'true',
    'texture-pack': 'default'
});
```

Your client HTML should read these parameters:
```javascript
// In your client's JavaScript
const urlParams = new URLSearchParams(window.location.search);
const renderDistance = urlParams.get('render-distance') || '6';
const enableShaders = urlParams.get('enable-shaders') === 'true';
```

## Testing Clients

### 5. Test Individual Clients
You can test each client directly by navigating to:
- `http://localhost:5173/clients/resent/`
- `http://localhost:5173/clients/shadow/`
- `http://localhost:5173/clients/astra/`
- `http://localhost:5173/clients/starlike/`
- `http://localhost:5173/clients/eaglymc/`

### 6. Test Through Launcher
1. Start your development server (`npm run dev`)
2. Click on any client button in the launcher
3. The client should open in a new tab/window

## Common Client Sources

### 7. Where to Get Clients:

#### Resent Client:
- Download from official Resent repository
- Ensure you have the web/HTML5 version

#### Shadow Client:
- Get the browser-compatible version
- Check for latest beta releases

#### Astra Client:
- Download lightweight web version
- Verify browser compatibility

#### Star-like Client:
- Get premium/free web version
- Include all required assets

#### Eagly-MC (EaglercraftX):
- Download from EaglercraftX releases
- Use the standalone HTML version

## Security Considerations

### 8. Client Security:
- Only use trusted client sources
- Scan files for malware before adding
- Test in isolated environment first
- Keep clients updated to latest versions

## Troubleshooting

### 9. Common Issues:

#### Client Won't Load:
- Check file paths are correct
- Ensure index.html exists in each folder
- Verify all assets are included

#### Assets Missing:
- Check relative paths in HTML/CSS
- Ensure all texture/sound files are present
- Verify folder structure matches client expectations

#### Performance Issues:
- Optimize large asset files
- Consider compression for textures
- Use appropriate render settings

## Advanced Configuration

### 10. Custom Launch Parameters:
You can modify `src/utils/clientLauncher.js` to add custom parameters:

```javascript
// Add custom parameters for specific clients
const customConfigs = {
  'Resent': {
    'anti-aliasing': 'true',
    'fov': '90',
    'fps-limit': '60'
  }
};
```

The clients are now ready to be integrated into your UEC Launcher! Make sure to test each client thoroughly before deployment.
 