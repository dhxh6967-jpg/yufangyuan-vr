# Offline mode

This viewer is designed to run with **no network connection**.

## What is local

| Asset | Location |
| --- | --- |
| Three.js `0.187.0` | `vendor/three/build/three.module.js` (+ `three.core.js`) |
| Room scene / controls | `room.js` |
| Meeting report (PDF) | `assets/taipei-club-report.pdf` |

Open `index.html` via a local static server (or file access that allows ES modules). The import map resolves `three` to the vendored build; nothing is fetched from esm.sh or other CDNs.

## How to serve locally

```bash
# any static file server works, e.g.
python3 -m http.server 8080 --bind 127.0.0.1
# then open http://127.0.0.1:8080/
```

You can disconnect the network after the files are on disk; page load and the 3D room need only local assets.

## Remaining online-only items

None required for core viewing. Optional notes:

- System fonts (`PingFang SC`, `Noto Sans SC`, `Microsoft YaHei`) fall back to the browser default if not installed; no web fonts are loaded.
- The previous GitHub release link for the report was replaced with the local PDF above. The separate `taipei-meeting-report` repository is not needed at runtime.
