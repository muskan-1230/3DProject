# 3D Virtual Room

A small Three.js project with a virtual room scene powered by `index.html` and `main.js`.

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
