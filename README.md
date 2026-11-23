# PaceTrack

PaceTrack is a lightweight training log and community site for track and field athletes. It is built with semantic HTML, CSS, and plain JavaScript, with no frameworks, build tools, or backend server.

> Built as a Web Technologies class project. All data stays in the user's own browser.

---

## Table of Contents

1. [Purpose](#purpose)
2. [Intended Users](#intended-users)
3. [Problem Addressed](#problem-addressed)
4. [Getting Started](#getting-started)
5. [Major Pages and Features](#major-pages-and-features)
6. [Project Structure](#project-structure)
7. [Data Storage](#data-storage)
8. [Accessibility](#accessibility)
9. [Security Considerations](#security-considerations)
10. [Known Limitations](#known-limitations)

---

## Purpose

PaceTrack gives track and field athletes one place to:

- **Record** training sessions and meet results for running, hurdles, jumps, and throws.
- **Measure** progress with automatic pace and speed calculations and personal-record (PR) tracking.
- **Connect** with other athletes through a community feed and a searchable athlete directory.

## Intended Users

| User group | How they use PaceTrack |
| --- | --- |
| **High school athletes** | Log practice and meet marks, follow PRs across the season, and find nearby athletes. |
| **Collegiate athletes** | Keep a record of their events and compare progress with athletes running similar times. |
| **Club and recreational runners** | Keep a simple personal training log without needing an account. |
| **Coaches and teammates** | Browse community sessions and react to athletes' results. |

## Problem Addressed

Most running apps are built around GPS road running. They do not handle **track and field events** well, such as sprints, hurdles, steeplechase, jumps, and throws, where results are recorded as times *or* distances and in metric *or* imperial units. Athletes often end up keeping marks in notebooks, spreadsheets, or scattered results sites.

PaceTrack addresses this by:

- Supporting every major track and field event group in one log.
- Accepting marks in meters or feet/inches, and times down to hundredths of a second.
- Calculating speed (m/s and mph) and pace automatically.
- Showing personal records for each event without any manual tracking.
- Adding a community layer (feed, reactions, athlete directory) with a **privacy toggle**, so athletes choose whether others can find them.

---

## Getting Started

### Requirements

- A current web browser (Chrome, Edge, Firefox, or Safari).
- Nothing else is needed. There are no dependencies to install and no build step.

### Option 1: Open the file directly

1. Clone or download the repository:
   ```bash
   git clone https://github.com/Leiradicus/PaceTrack.git
   cd PaceTrack
   ```
2. Double-click `index.html`, or drag it into a browser window.

### Option 2: Run a local web server (recommended)

A local server makes in-app navigation and browser history behave the same as on a hosted site. Run any **one** of the following from the project folder:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# VS Code
# Install the "Live Server" extension, right-click index.html, and choose "Open with Live Server"
```

Then open **http://localhost:8000** (or the address the tool prints).

### Option 3: Deploy

PaceTrack is a fully static site, so it can be hosted on any static host, such as **GitHub Pages**, Netlify, or Vercel. On GitHub Pages: go to **Settings → Pages**, set the source to the `main` branch root folder, and save.

### Resetting the app

To clear all saved data, open the browser's developer tools (**F12**), go to **Application → Local Storage**, and delete the `pacetrack-app-v1`, `pacetrack.runs`, and `pacetrack.profile` keys. Then reload the page.

---

## Major Pages and Features

Use the header navigation to move between pages. The four main pages share one script (`js/app.js`), which switches views without a full page reload and keeps the browser's Back and Forward buttons working.

### Home (`index.html`)
- **Runner profile card** showing name, avatar, school or club, graduation year, affiliation, and bio.
- **Edit profile dialog** for updating profile details and uploading a profile photo (JPG, PNG, or WebP, up to 1 MB).
- **Discovery toggle** that controls whether the user appears in the "Near me" and "Similar pace" filters.
- **Training overview** with session totals and a **personal-record grid** that shows the best mark for each event.

### Log Run (`tracker.html`)
- **Event picker** grouped by sprints and distance, hurdles and steeplechase, jumps, and throws, plus a custom-distance option.
- **Flexible mark entry** in meters or feet and inches. Times are entered as `HH:MM:SS.ms` or `MM:SS.ms`.
- **Live speed preview** in m/s and mph for running events.
- **Optional photo attachment** for a meet photo or score sheet (up to 1 MB).
- **Official results import (demo):** choose a provider (TFRRS, MileSplit, or Athletic.net) and paste a link or athlete ID to auto-fill a sample "verified" mark. *This is a UI demonstration only and does not contact any outside service.*

### Feed (`feed.html`)
- **Community activity stream** showing the user's own sessions alongside sample athlete sessions.
- **Filters:** All athletes, Near me, and Similar times / pace. The last two respect the discovery privacy setting.
- **Reactions** (Kudos ⚡, Fire 🔥, Clap 👏) that can be toggled on and off and are saved between visits.
- **Verified badges** on imported results.

### Athletes (`athletes.html`)
- **Athlete directory** with each athlete's school, events, graduation year, and featured PR.
- **Live search** by name or school.
- **Category filters:** High School, Collegiate, Club, and Nearby.
- **Connect / Following** button to follow athletes.

### Edit Profile (`edit-profile.html`)
A standalone page, not linked in the main navigation, for setting a display name, adding mileage-based runs (date, distance, duration, notes) with a live pace preview, and deleting logged runs. It uses the shared helpers in `js/storage.js`.

---

## Project Structure

```
PaceTrack/
├── index.html          # Home: profile, discovery toggle, PRs
├── tracker.html        # Log Run: event logging form
├── feed.html           # Community feed
├── athletes.html       # Athlete directory
├── edit-profile.html   # Standalone name and run management page
├── css/
│   └── style.css       # Global styles, layout, and responsive rules
├── js/
│   ├── app.js          # Main application: views, state, events, routing
│   ├── storage.js      # Shared storage and formatting helpers (edit-profile)
│   ├── tracker.js      # Run form logic (edit-profile)
│   ├── edit-profile.js # Edit-profile page controller
│   └── athletes.js, community.js, feed.js, profile.js   # Earlier page scripts (not currently loaded)
├── assets/             # Logo and background texture
└── images/             # Logo used by edit-profile.html
```

## Data Storage

PaceTrack has **no backend or user accounts**. All data is saved in the browser's `localStorage`:

| Key | Contents | Used by |
| --- | --- | --- |
| `pacetrack-app-v1` | Profile, logged workouts (including images as data URLs), athletes, follows, and reactions | Home, Log Run, Feed, Athletes |
| `pacetrack.runs` | Mileage-based run entries | Edit Profile |
| `pacetrack.profile` | Display name | Edit Profile |

Sample athletes and community sessions are built into the code and appear right away. They are **not** counted in the user's personal totals or PRs.

---

## Accessibility

PaceTrack aims to meet **WCAG 2.1 Level AA**. The following are in place:

**Structure and navigation**
- Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`) and a logical heading order on every page.
- A **"Skip to content"** link as the first focusable element on every page.
- `aria-current="page"` marks the active navigation link.
- After an in-app page change, keyboard focus moves to the main content area and the document title updates, so screen reader users know the view changed.
- `lang="en"` and a responsive viewport are set on every page.

**Forms**
- Every input has a visible, associated `<label>`. Related inputs are grouped with `<fieldset>` and `<legend>`.
- Required fields are marked both visually and for screen readers, and hints and errors are linked with `aria-describedby`.
- Validation errors are announced through `role="alert"`. Success messages and live calculations (pace and speed previews) use `aria-live="polite"`.

**Interactive controls**
- All controls are native `<button>`, `<a>`, or form elements, so they work with a keyboard by default.
- Toggle buttons (filters and reactions) use `aria-pressed`, and unavailable filters use `aria-disabled`.
- Icon-only buttons have descriptive `aria-label`s, such as "Close dialog" and "Kudos, 12 reactions".
- The profile editor uses the native `<dialog>` element, which traps focus and closes with **Escape**.
- Clear `:focus-visible` outlines are shown on all interactive elements.

**Visual design and media**
- Images have meaningful `alt` text, and decorative elements use `aria-hidden="true"`.
- The layout adapts at 820px and 600px breakpoints for tablets and phones.
- Text and controls should meet WCAG AA contrast ratios (4.5:1 for body text, 3:1 for large text and UI components). Check this whenever colors change.

**Recommended testing:** keyboard-only navigation, a screen reader (NVDA, JAWS, or VoiceOver), and an automated checker such as Lighthouse or axe DevTools.

---

## Security Considerations

PaceTrack runs entirely in the browser, which keeps its attack surface small. The following measures and limits apply:

**Measures in place**
- **No server and no network requests.** User data never leaves the device, and the results importer is simulated, so no third-party data is sent or received.
- **Output escaping.** All user-supplied text (names, bios, notes, search terms) goes through an `escapeHtml()` function before it is inserted into the page, which helps prevent cross-site scripting (XSS).
- **Input validation.** Fields enforce `maxlength`, `min`/`max`, `pattern`, and `required` rules. JavaScript also checks values again before saving.
- **File upload checks.** Uploaded files must have an `image/*` type and be **1 MB or smaller**. They are read locally with `FileReader` and never uploaded anywhere.
- **Safe storage handling.** Reads from `localStorage` are wrapped in `try/catch`. Damaged or unexpected data is skipped or replaced with defaults instead of crashing the app, and save failures (for example, a full quota or private browsing mode) show a message to the user.
- **No third-party scripts.** The site loads no external libraries, analytics, or CDNs, so there is no supply-chain risk.

**Limitations and recommendations**
- `localStorage` is **not encrypted**. Anyone with access to the device or browser profile, or any script running on the same origin, can read it. Do not store sensitive personal information.
- There is **no authentication**. Profiles, "verified" badges, and follows are local and for demonstration only, and they cannot be trusted as proof of identity or results.
- Before deploying publicly, add a **Content Security Policy**, for example `default-src 'self'; img-src 'self' data:`, using a `<meta>` tag or HTTP header, and serve the site over **HTTPS**.
- A production version would need server-side validation, real authentication, and privacy controls appropriate for minors (many users are high school athletes) to comply with laws such as COPPA and FERPA.

---

## Known Limitations

- Data does not sync across browsers or devices, and clearing browser data permanently deletes it.
- Community athletes and feed posts are sample data.
- Official results import is a mock and does not connect to TFRRS, MileSplit, or Athletic.net.
- `edit-profile.html` uses a separate storage format from the main app, so its runs do not appear on the Home, Feed, or Log Run pages.

---

*PaceTrack — Web Technologies Class Project*
