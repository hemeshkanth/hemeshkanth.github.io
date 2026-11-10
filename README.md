# Hemesh Kanth: the goldfish site

A web film in one scene. The goldfish leaves its bowl, rides a bicycle and drives a car past your work, sails out, dives into the sea for your experiments, grows wings and flies off the Earth.

| Part | Where in the film | What people see |
|---|---|---|
| Opening | the bowl on the window ledge | your name and one line |
| **Work** | the road: projects 1–2 by bike, 3–5 by car (glass bubbles over the road) | a card per project, then the full case study (deck, report or game inside) |
| **Exploration** | the sea | small experiments |
| **About** | the Earth from space | who you are |
| **Contact** | the fish flying toward you | email, LinkedIn, GitHub |

## Files

| File | What it is |
|---|---|
| `index.html` | the page |
| `js/film.js` | the 3D film (Three.js) |
| `js/three.min.js` | Three.js r149 |
| `content.js` | **all the words, images and colours**. The editor writes this file |
| `editor.html` | the editor |
| `assets/` | images you upload |
| `media/` | report and deck pages (one image per page) |
| `ennore/` | the Average Ennorian game |

## Put it online (first time)

1. Copy everything in this folder into your `hemeshkanth.github.io` repository (the root, next to where `index.html` should be).
2. Commit and push. GitHub Pages serves it at https://hemeshkanth.github.io.

## Edit the site

Open **https://hemeshkanth.github.io/editor.html** (or `editor.html` from a local server: `python3 -m http.server` in this folder, then http://localhost:8000/editor.html).

- **Left:** every part of the site: opening, story captions, each project, exploration, about, contact, colours.
- **Middle:** the fields. Every line is editable. Projects have a card, quick facts, a cover image, a deck/report/game, and a case study made of blocks (text, image, gallery, quote, list, note). Drag ⠿ or use ↑ ↓ to reorder. Undo with Ctrl/Cmd+Z.
- **Right:** the live site with your changes, jumping to the part you are editing.
- **Images:** click “upload image…” or drop a picture on the thumbnail. Large photos are resized to 2000px.
- **PDFs:** for a report or deck, choose it under “deck, report or game” and upload the PDF. It becomes one image per page.
- Your draft is saved in this browser as you type, including new images, until you publish.

### Publishing from the editor

Go to **Publish & export**:

- **Publish to GitHub** writes `content.js` and your new images straight into the repo in one commit. You need a token once:
  1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate.
  2. Repository access: **Only select repositories** → `hemeshkanth.github.io`.
  3. Permissions → Repository permissions → **Contents: Read and write**.
  4. Paste it in the editor. Tick “remember” only on your own computer.
- **Export zip** downloads `content.js` and the new files. Unzip into this folder, then commit and push yourself.

## Time of day

The sun/moon button in the header switches between day, sunset, night and sunrise. A first-time visitor gets the one that matches their clock. The editor's **Colours** page changes the sky and sea for each.

## What is not in the editor (yet)

The 3D itself: the story path, the fish, the vehicles and the city all live in `js/film.js`. The five 3D bubble icons on the road are drawn for the project ids `flock`, `ruhi`, `ennore`, `kottakkal` and `museum`. A new project gets a simple arch icon.
