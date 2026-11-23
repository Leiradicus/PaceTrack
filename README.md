# PaceTrack

A lightweight track and field training log built with semantic HTML, CSS, and vanilla JavaScript.

## Run locally

Open `index.html` in a modern browser. The app can also be served from any static-file server. Use the header to move between Home, Log Run, Feed, and Athletes; navigation updates the view without a full page reload.

## Features

- Edit a runner profile and discovery preference on Home.
- Record running and field events, add an optional image, preview speed calculations, or try the mock official-results importer.
- Browse seeded community sessions and athletes, react to feed posts, connect with athletes, and filter/search the directory.
- Profile, workout, reaction, and connection data persist in browser `localStorage` under the `pacetrack-app-v1` key. Seed community activity is shown immediately and is not mixed into your personal workout totals.

All data stays in the current browser. Official-results import is a UI demonstration and does not contact TFRRS, MileSplit, or Athletic.net.