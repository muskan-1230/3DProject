
# 3D Virtual Room - Three.js

An interactive 3D virtual room built using Three.js that provides an immersive walkthrough experience directly in the browser.

## Files

- `index.html` — the web page entrypoint
- `main.js` — the Three.js application code

## How to run

### Option 1: Open directly in the browser

1. Open `index.html` in your browser.
2. The page should load and display the scene.

> Note: Some browsers may restrict module imports when opening a local file directly. If the scene does not load, use a local web server.

### Option 2: Run with a local web server

#### Using Python 3

1. Open a terminal in this folder (`c:\Users\pc1\Desktop\threeJS`).
2. Run:

```powershell
python -m http.server 8000
```

3. Open your browser and go to:

```text
http://localhost:8000
```

#### Using VS Code Live Server

1. Install the Live Server extension.
2. Right-click `index.html` and select `Open with Live Server`.

## Notes

- The project uses `importmap` in `index.html` to load Three.js from a CDN.
- No build step or dependencies are required.

## Features

- First-person walkthrough mode
  - WASD keyboard navigation
  - Mouse-look controls using Pointer Lock API
  - Start/Exit Walkthrough button

- Interactive lighting system
  - Toggle room lights ON/OFF
  - Ambient and corner lamp lighting

- Interactive TV
  - Turn TV ON/OFF
  - Dynamic screen texture switching

- Draggable objects
  - Move mugs around the room using DragControls

- Realistic room environment
  - Tables and chairs
  - Ceiling light panels
  - Decorative plants
  - Functional door trigger system

- Responsive design
  - Automatically adapts to different screen sizes

## Technologies Used

- Three.js
- JavaScript (ES6 Modules)
- HTML5
- WebGL
- OrbitControls
- DragControls
- Pointer Lock API

## Controls

### Normal View
- Mouse Drag → Orbit around the room
- Drag mugs to reposition them

### Walkthrough Mode
- W → Move Forward
- A → Move Left
- S → Move Backward
- D → Move Right
- Mouse → Look Around
- ESC → Exit Walkthrough

## Live Demo

https://threejs-virtual-room.vercel.app/

## Future Enhancements

- Collision detection
- GLTF furniture models
- Mobile joystick controls
- Minimap navigation
- Multiple rooms and floors
- Animated doors and furniture
- Ambient sound effects

## Author

Muskan Jain
