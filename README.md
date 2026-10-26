# Ophia website

The public site for Ophia, the eye hospital software.

## Pages

| Page | File |
| --- | --- |
| Home | `index.html` |
| Product: follow a patient, and screen recordings | `product.html` |
| Patient app | `patient-app.html` |
| Why Ophia | `why-ophia.html` |
| Hosting and security | `hosting.html` |

## Editing

The pages are generated. Edit the sources, then rebuild:

- `src/layout.html`: the shared header, footer and loading screen
- `src/pages/*.html`: each page's content, with its title and scripts in the comment at the top
- `assets/css/site.css`: all styles
- `assets/js/`: `site.js` (shared), `home.js`, `hero3d.js` (the 3D ring), `journey.js`, `videos.js`

```bash
python tools/build.py
```

Commit the built `*.html` files at the root along with the sources; GitHub Pages serves them directly.

## Screens and recordings

`assets/screens/` and `assets/video/` hold real screenshots and screen recordings of Ophia. The patients and staff in them are fictional.

## View locally

```bash
python -m http.server 8090
```

Then open http://localhost:8090.
