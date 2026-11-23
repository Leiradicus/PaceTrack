(() => {
  "use strict";

  const STORAGE_KEY = "pacetrack-app-v1";
  const NAV_LINKS = [
    { id: "home", label: "Home", href: "index.html" },
    { id: "tracker", label: "Log Run", href: "tracker.html" },
    { id: "feed", label: "Feed", href: "feed.html" },
    { id: "athletes", label: "Athletes", href: "athletes.html" }
  ];
  const EVENTS = [
    { group: "Running · Sprints & distance", options: [
      ["55m", "55m", "run", 55], ["60m", "60m", "run", 60],
      ["100m", "100m", "run", 100], ["200m", "200m", "run", 200],
      ["400m", "400m", "run", 400], ["800m", "800m", "run", 800],
      ["1600m", "1600m / Mile", "run", 1600], ["5K", "5K", "run", 5000],
      ["custom", "Custom distance", "run", 0]
    ] },
    { group: "Hurdles & steeplechase", options: [
      ["55mH", "55m Hurdles", "run", 55], ["60mH", "60m Hurdles", "run", 60],
      ["110mH", "110m Hurdles", "run", 110], ["100mH", "100m Hurdles", "run", 100],
      ["400mH", "400m Hurdles", "run", 400], ["steeple", "Steeplechase", "run", 3000]
    ] },
    { group: "Jumps", options: [
      ["long-jump", "Long Jump", "field"], ["triple-jump", "Triple Jump", "field"],
      ["high-jump", "High Jump", "field"], ["pole-vault", "Pole Vault", "field"]
    ] },
    { group: "Throws", options: [
      ["shot-put", "Shot Put", "field"], ["discus", "Discus", "field"],
      ["javelin", "Javelin", "field"], ["hammer", "Hammer", "field"],
      ["weight-throw", "Weight Throw", "field"]
    ] }
  ];
  const EVENT_MAP = new Map(EVENTS.flatMap(group => group.options.map(event =>
    [event[0], { id: event[0], label: event[1], kind: event[2], distance: event[3] || null }]
  )));
  // A brand-new visitor starts with an empty, unregistered profile and must
  // complete the registration form before using the rest of the app.
  const PROFILE_DEFAULT = {
    name: "", gradYear: "", school: "",
    category: "Club", bio: "",
    avatar: "", discoveryEnabled: false, registered: false
  };
  const ATHLETE_SEEDS = [
    { id: "ath-maya", name: "Maya Chen", school: "Lincoln High School", category: "High School", gradYear: "2026", events: ["800m", "1600m", "5K"], pr: "2:16.42 · 800m", city: "Portland", nearby: true, similar: true, avatar: "" },
    { id: "ath-noah", name: "Noah Williams", school: "Oregon State University", category: "Collegiate", gradYear: "2027", events: ["400m", "800m"], pr: "49.82 · 400m", city: "Corvallis", nearby: false, similar: true, avatar: "" },
    { id: "ath-sofia", name: "Sofia Ramirez", school: "Rose City Track Club", category: "Club", gradYear: "2025", events: ["Long Jump", "Triple Jump"], pr: "5.82m · Long Jump", city: "Portland", nearby: true, similar: false, avatar: "" },
    { id: "ath-ethan", name: "Ethan Brooks", school: "Westview High School", category: "High School", gradYear: "2028", events: ["100m", "200m", "400m"], pr: "11.14 · 100m", city: "Beaverton", nearby: true, similar: true, avatar: "" },
    { id: "ath-ava", name: "Ava Patel", school: "Portland State University", category: "Collegiate", gradYear: "2026", events: ["Shot Put", "Discus"], pr: "12.46m · Shot Put", city: "Portland", nearby: false, similar: false, avatar: "" },
    { id: "ath-jayden", name: "Jayden Ortiz", school: "Grant High School", category: "High School", gradYear: "2027", events: ["55m", "60m", "200m"], pr: "6.48 · 55m", city: "Portland", nearby: true, similar: true, avatar: "" },
    { id: "ath-lila", name: "Lila Thompson", school: "University of Oregon", category: "Collegiate", gradYear: "2026", events: ["60m Hurdles", "100m Hurdles", "400m Hurdles"], pr: "8.41 · 60m Hurdles", city: "Eugene", nearby: false, similar: false, avatar: "" },
    { id: "ath-marcus", name: "Marcus Hill", school: "Beaverton Track Club", category: "Club", gradYear: "2025", events: ["55m Hurdles", "110m Hurdles"], pr: "7.62 · 55m Hurdles", city: "Beaverton", nearby: true, similar: true, avatar: "" },
    { id: "ath-priya", name: "Priya Nair", school: "Jefferson High School", category: "High School", gradYear: "2026", events: ["60m", "100m", "Long Jump"], pr: "7.78 · 60m", city: "Portland", nearby: true, similar: false, avatar: "" },
    { id: "ath-caleb", name: "Caleb Johnson", school: "Lane Community College", category: "Collegiate", gradYear: "2027", events: ["1500m", "5K", "Steeplechase"], pr: "4:01.20 · 1500m", city: "Eugene", nearby: false, similar: true, avatar: "" },
    { id: "ath-nina", name: "Nina Alvarez", school: "Pacific Throwers Club", category: "Club", gradYear: "2024", events: ["Javelin", "Hammer", "Discus"], pr: "44.10m · Javelin", city: "Salem", nearby: false, similar: false, avatar: "" },
    { id: "ath-owen", name: "Owen Park", school: "Central Catholic High School", category: "High School", gradYear: "2028", events: ["55m Hurdles", "300m Hurdles", "High Jump"], pr: "7.95 · 55m Hurdles", city: "Portland", nearby: true, similar: true, avatar: "" },
    { id: "ath-samir", name: "Samir Khan", school: "Portland State University", category: "Collegiate", gradYear: "2025", events: ["60m", "200m", "400m"], pr: "6.89 · 60m", city: "Portland", nearby: false, similar: true, avatar: "" }
  ];

  const isoDay = offset => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
  };
  const SEED_WORKOUTS = [
    { id: "seed-1", athleteId: "ath-maya", date: isoDay(-1), event: "800m", eventLabel: "800m", kind: "run", markMeters: 800, mark: 800, timeSeconds: 136.42, verified: true, photo: "", reactions: { kudos: 12, fire: 4, clap: 3 } },
    { id: "seed-2", athleteId: "ath-sofia", date: isoDay(-1), event: "long-jump", eventLabel: "Long Jump", kind: "field", markMeters: 5.82, mark: 5.82, timeSeconds: null, verified: false, photo: "", reactions: { kudos: 8, fire: 6, clap: 2 } },
    { id: "seed-3", athleteId: "ath-noah", date: isoDay(-2), event: "400m", eventLabel: "400m", kind: "run", markMeters: 400, mark: 49.82, timeSeconds: 49.82, verified: false, photo: "", reactions: { kudos: 6, fire: 3, clap: 5 } },
    { id: "seed-4", athleteId: "ath-ethan", date: isoDay(-3), event: "100m", eventLabel: "100m", kind: "run", markMeters: 100, mark: 11.14, timeSeconds: 11.14, verified: false, photo: "", reactions: { kudos: 5, fire: 7, clap: 1 } },
    { id: "seed-5", athleteId: "ath-ava", date: isoDay(-4), event: "shot-put", eventLabel: "Shot Put", kind: "field", markMeters: 12.46, mark: 12.46, timeSeconds: null, verified: true, photo: "", reactions: { kudos: 9, fire: 2, clap: 4 } }
  ];

  function initialState() {
    return {
      profile: { ...PROFILE_DEFAULT },
      workouts: [],
      athletes: ATHLETE_SEEDS.map(athlete => ({ ...athlete })),
      following: [],
      myReactions: {}
    };
  }

  // ---------- Security helpers ----------
  // Allow-lists and limits used to validate everything a user (or a tampered
  // localStorage entry) can feed into the app.
  const PROFILE_CATEGORIES = ["High School", "College", "Club"];
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_IMAGE_BYTES = 1024 * 1024;
  const IMPORT_HOSTS = ["tfrrs.org", "milesplit.com", "athletic.net"];
  const LIMITS = { name: 60, school: 100, bio: 180 };

  // Strips control characters and trims/limits length of free text.
  function cleanText(value, maxLength) {
    return String(value ?? "").replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, maxLength);
  }

  // Only images that PaceTrack created itself (base64 data URLs of an allowed
  // type) or local files may be used as an <img src>. Blocks javascript:,
  // remote tracking pixels, and SVG data URLs injected via localStorage.
  function safeImageSrc(src) {
    const value = String(src || "");
    if (/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value)) return value;
    if (/^(assets|images)\/[\w./-]+$/.test(value) && !value.includes("..")) return value;
    return "";
  }

  function sanitizeProfile(raw) {
    const profile = raw && typeof raw === "object" ? raw : {};
    const gradYear = String(profile.gradYear ?? "");
    const name = cleanText(profile.name, LIMITS.name);
    const school = cleanText(profile.school, LIMITS.school);
    return {
      name,
      gradYear: /^\d{4}$/.test(gradYear) ? gradYear : "",
      school,
      category: PROFILE_CATEGORIES.includes(profile.category) ? profile.category : PROFILE_DEFAULT.category,
      bio: cleanText(profile.bio, LIMITS.bio),
      avatar: safeImageSrc(profile.avatar),
      discoveryEnabled: profile.discoveryEnabled === true,
      // A profile only counts as registered if its required fields are valid.
      registered: profile.registered === true && Boolean(name && school)
    };
  }

  // Shared validation for the registration form and the edit-profile dialog.
  // Returns { error } or { values }.
  function validateProfileForm(form) {
    const data = new FormData(form);
    const name = cleanText(data.get("name"), LIMITS.name);
    const school = cleanText(data.get("school"), LIMITS.school);
    const gradYear = cleanText(data.get("gradYear"), 4);
    const category = String(data.get("category"));
    if (!name || !school) return { error: "Name and school or club are required." };
    if (gradYear && !(/^\d{4}$/.test(gradYear) && gradYear >= "1950" && gradYear <= "2100")) {
      return { error: "Graduation year must be a 4-digit year." };
    }
    if (!PROFILE_CATEGORIES.includes(category)) return { error: "Choose a valid affiliation type." };
    return { values: { name, school, gradYear, category, bio: cleanText(data.get("bio"), LIMITS.bio) } };
  }

  function isRegistered() {
    return state.profile.registered === true;
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return initialState();
      const parsed = JSON.parse(saved);
      return {
        // Stored data is treated as untrusted input and re-validated.
        // Profiles saved before registration existed are treated as registered
        // (if their name and school are valid) so returning users aren't locked out.
        profile: sanitizeProfile({
          ...PROFILE_DEFAULT,
          ...(parsed.profile ? { registered: true, discoveryEnabled: true } : {}),
          ...(parsed.profile || {})
        }),
        workouts: Array.isArray(parsed.workouts) ? parsed.workouts : [],
        athletes: Array.isArray(parsed.athletes) && parsed.athletes.length
          ? parsed.athletes : ATHLETE_SEEDS.map(athlete => ({ ...athlete })),
        following: Array.isArray(parsed.following) ? parsed.following : [],
        myReactions: parsed.myReactions && typeof parsed.myReactions === "object" ? parsed.myReactions : {}
      };
    } catch (error) {
      console.error("Could not read PaceTrack data from localStorage.", error);
      return initialState();
    }
  }

  let state = loadState();
  let view = routeFromLocation();
  let feedFilter = "all";
  let athleteFilter = "all";
  let currentUnit = "m";
  let importedMarkVerified = false;
  const main = document.querySelector("#main-content");
  const nav = document.querySelector(".nav-links");

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error("Could not save PaceTrack data to localStorage.", error);
      notify("Your changes could not be saved. Check available browser storage.");
      return false;
    }
  }

  function routeFromLocation() {
    const path = location.pathname.toLowerCase();
    if (path.endsWith("tracker.html")) return "tracker";
    if (path.endsWith("feed.html")) return "feed";
    if (path.endsWith("athletes.html")) return "athletes";
    return "home";
  }

  function routeTo(nextView, push = true) {
    view = NAV_LINKS.some(link => link.id === nextView) ? nextView : "home";
    if (push) {
      const target = new URL(NAV_LINKS.find(link => link.id === view).href, location.href);
      history.pushState({ view }, "", target);
    }
    render();
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function notify(message) {
    const status = document.querySelector("#app-status");
    if (status) {
      status.textContent = message;
      status.classList.add("is-visible");
      window.setTimeout(() => status.classList.remove("is-visible"), 4000);
    }
  }

  function eventOptions() {
    return EVENTS.map(group => `<optgroup label="${escapeHtml(group.group)}">${
      group.options.map(([id, label]) => `<option value="${id}">${escapeHtml(label)}</option>`).join("")
    }</optgroup>`).join("");
  }

  function profileAvatar(profile = state.profile, className = "avatar") {
    const avatar = safeImageSrc(profile.avatar);
    return avatar
      ? `<img class="${className}" src="${escapeHtml(avatar)}" alt="${escapeHtml(profile.name)}">`
      : `<span class="${className} avatar-placeholder" aria-hidden="true">${escapeHtml((profile.name || "?").split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase())}</span>`;
  }

  function athleteFor(workout) {
    if (workout.athleteId === "me") {
      return { ...state.profile, id: "me", category: state.profile.category };
    }
    return state.athletes.find(athlete => athlete.id === workout.athleteId) || {
      id: workout.athleteId, name: "PaceTrack athlete", school: "", category: "", avatar: ""
    };
  }

  function formatTime(seconds) {
    if (!Number.isFinite(Number(seconds))) return "";
    const total = Number(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const remainder = total % 60;
    const secs = remainder.toFixed(2).padStart(5, "0");
    return hours ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${secs}` : `${minutes}:${secs}`;
  }

  function parseDuration(value) {
    const parts = value.trim().split(":");
    if (parts.length < 2 || parts.length > 3 || parts.some(part => part === "")) return null;
    const secondsPart = Number(parts[parts.length - 1]);
    const minutesPart = Number(parts[parts.length - 2]);
    const hoursPart = parts.length === 3 ? Number(parts[0]) : 0;
    if (![secondsPart, minutesPart, hoursPart].every(Number.isFinite)
      || secondsPart < 0 || secondsPart >= 60 || minutesPart < 0 || minutesPart >= 60 || hoursPart < 0) return null;
    return hoursPart * 3600 + minutesPart * 60 + secondsPart;
  }

  function formatMark(workout) {
    if (workout.kind === "run" && Number.isFinite(Number(workout.timeSeconds))) {
      return formatTime(workout.timeSeconds);
    }
    const unit = workout.unit === "ft" ? "ft" : "m";
    if (workout.unit === "ft" && Number.isFinite(Number(workout.markFeet))) {
      const inches = Number(workout.markInches || 0);
      return `${Number(workout.markFeet)}′${inches ? `${inches}″` : ""}`;
    }
    const mark = Number(workout.mark);
    return `${Number.isFinite(mark) ? mark.toFixed(workout.kind === "run" ? 2 : 2).replace(/\.?0+$/, "") : "—"} ${unit}`;
  }

  function paceText(workout) {
    if (workout.kind !== "run" || !workout.timeSeconds || !workout.markMeters) return "";
    const output = [];
    if (workout.showMps !== false) output.push(`${(workout.markMeters / workout.timeSeconds).toFixed(2)} m/s`);
    if (workout.showMph !== false) output.push(`${(workout.markMeters / 1609.344 / (workout.timeSeconds / 3600)).toFixed(2)} mph`);
    return output.join(" · ");
  }

  function sortedWorkouts() {
    return [...state.workouts, ...SEED_WORKOUTS]
      .sort((a, b) => new Date(`${b.date}T12:00:00`) - new Date(`${a.date}T12:00:00`));
  }

  function renderHome() {
    const ownWorkouts = state.workouts.filter(workout => workout.athleteId === "me");
    const totalMeters = ownWorkouts.reduce((sum, workout) => sum + (Number(workout.kind === "run" ? workout.markMeters : 0) || 0), 0);
    const prsByEvent = new Map();
    ownWorkouts.forEach(workout => {
      const current = prsByEvent.get(workout.event);
      const isBetter = !current || (workout.kind === "run"
        ? Number(workout.timeSeconds) < Number(current.timeSeconds)
        : Number(workout.markMeters) > Number(current.markMeters));
      if (isBetter) prsByEvent.set(workout.event, workout);
    });

    return `<section class="page-heading">
        <div><p class="eyebrow">YOUR TRAINING SPACE</p><h1>Your Runner Profile</h1>
          <p class="page-description">Every session adds up. Keep showing up.</p></div>
        <a class="button button-primary" href="tracker.html" data-route="tracker">＋ Log a session</a>
      </section>
      <section class="profile-layout" aria-label="Runner profile">
        <article class="card profile-card">
          <div class="profile-top">
            ${profileAvatar()}
            <span class="tag">${escapeHtml(state.profile.category)}</span>
          </div>
          <h2>${escapeHtml(state.profile.name)}</h2>
          <p class="profile-school">${escapeHtml(state.profile.school)}${state.profile.gradYear ? ` <span>· Class of ${escapeHtml(state.profile.gradYear)}</span>` : ""}</p>
          <p class="profile-bio">${escapeHtml(state.profile.bio || "Add a short bio to tell your story.")}</p>
          <button type="button" class="button button-secondary" data-action="edit-profile">Edit profile</button>
        </article>
        <article class="card privacy-card">
          <p class="eyebrow">YOUR VISIBILITY</p><h2>Find your running community</h2>
          <p>Allow discovery by local runners and athletes with a similar pace.</p>
          <label class="switch-row"><span>${state.profile.discoveryEnabled ? "Discovery is on" : "Discovery is off"}</span>
            <input type="checkbox" data-action="toggle-discovery" ${state.profile.discoveryEnabled ? "checked" : ""}>
            <span class="switch" aria-hidden="true"></span>
          </label>
          <p class="privacy-note">Your exact location is never shown.</p>
        </article>
      </section>
      <section class="section-block" aria-labelledby="overview-heading">
        <div class="section-heading"><div><p class="eyebrow">THE BIG PICTURE</p><h2 id="overview-heading">Training overview</h2></div></div>
        <div class="stats-grid">
          <article class="card stat-card"><span class="stat-icon">↗</span><p>Total running distance</p>
            <strong>${totalMeters.toFixed(0)} <small>m</small></strong>
            <span class="stat-sub">${(totalMeters / 1609.344).toFixed(2)} miles</span></article>
          <article class="card stat-card"><span class="stat-icon">◷</span><p>Logged sessions</p>
            <strong>${ownWorkouts.length}</strong><span class="stat-sub">All events</span></article>
          <article class="card stat-card"><span class="stat-icon">✦</span><p>Personal records</p>
            <strong>${prsByEvent.size}</strong><span class="stat-sub">Across your events</span></article>
        </div>
      </section>
      <section class="section-block">
        <div class="section-heading"><div><p class="eyebrow">YOUR BEST</p><h2>Personal records</h2></div>
          <a class="text-link" href="tracker.html" data-route="tracker">Add a mark →</a></div>
        ${prsByEvent.size ? `<div class="pr-grid">${[...prsByEvent.values()].map(workout =>
          `<article class="card pr-card"><span class="event-badge">${escapeHtml(workout.eventLabel)}</span><strong>${escapeHtml(formatMark(workout))}</strong><span>${escapeHtml(new Date(`${workout.date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }))}</span></article>`
        ).join("")}</div>` : `<div class="card empty-card"><p>Your PR shelf is ready for its first mark.</p><a class="text-link" href="tracker.html" data-route="tracker">Log a session →</a></div>`}
      </section>
      <dialog id="profile-dialog" class="modal">
        <form id="profile-form" class="modal-form">
          <div class="section-heading"><div><p class="eyebrow">MAKE IT YOURS</p><h2>Edit profile</h2></div>
            <button type="button" class="icon-button" aria-label="Close dialog" data-action="close-profile">×</button></div>
          <label class="upload-row">${profileAvatar()}
            <span><strong>Profile photo</strong><small>JPG, PNG or WebP. Max 1 MB. Location data is removed.</small></span>
            <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp" class="visually-hidden" data-action="profile-photo">
          </label>
          <p class="privacy-note">Privacy: your profile is stored only in this browser. Don't include your phone number, email, or home address.</p>
          <label>Full name<input name="name" required maxlength="60" autocomplete="name" value="${escapeHtml(state.profile.name)}"></label>
          <div class="form-grid">
            <label>Graduation year<input name="gradYear" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" value="${escapeHtml(state.profile.gradYear)}"></label>
            <label>Affiliation type<select name="category">${["High School", "College", "Club"].map(category =>
              `<option ${state.profile.category === category ? "selected" : ""}>${category}</option>`).join("")}</select></label>
          </div>
          <label>School or club<input name="school" required maxlength="100" value="${escapeHtml(state.profile.school)}"></label>
          <label>Short bio<textarea name="bio" rows="3" maxlength="180">${escapeHtml(state.profile.bio)}</textarea></label>
          <div class="form-actions"><button type="button" class="button button-secondary" data-action="close-profile">Cancel</button><button class="button button-primary">Save profile</button></div>
        </form>
      </dialog>`;
  }

  function renderRegistration() {
    return `<section class="page-heading">
        <div><p class="eyebrow">WELCOME TO PACETRACK</p><h1>Create your runner profile</h1>
          <p class="page-description">Set up your profile to start logging sessions and connecting with athletes.</p></div>
      </section>
      <form id="register-form" class="card form-card register-card" novalidate aria-describedby="register-privacy">
        <div class="section-heading"><div><p class="eyebrow">STEP 1 OF 1</p><h2>Your details</h2></div></div>
        <p id="register-privacy" class="privacy-note">Privacy: your profile is stored only in this browser and is never uploaded. Only add what you're comfortable sharing, and don't include your phone number, email, or home address.</p>
        <label class="upload-row">${profileAvatar()}
          <span><strong>Profile photo (optional)</strong><small>JPG, PNG or WebP. Max 1 MB. Location data is removed.</small></span>
          <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp" class="visually-hidden">
        </label>
        <label>Full name <span aria-hidden="true">*</span><input name="name" required maxlength="${LIMITS.name}" autocomplete="name"></label>
        <label>School or club <span aria-hidden="true">*</span><input name="school" required maxlength="${LIMITS.school}" autocomplete="organization"></label>
        <div class="form-grid">
          <label>Affiliation type<select name="category">${PROFILE_CATEGORIES.map(category =>
            `<option ${category === PROFILE_DEFAULT.category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}</select></label>
          <label>Graduation year (optional)<input name="gradYear" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="e.g. 2027"></label>
        </div>
        <label>Short bio (optional)<textarea name="bio" rows="3" maxlength="${LIMITS.bio}" placeholder="Finding my pace, one lap at a time."></textarea></label>
        <label class="check-row"><input type="checkbox" name="discoveryEnabled"> Let nearby athletes and athletes with a similar pace discover me (you can change this later)</label>
        <p class="form-hint"><span aria-hidden="true">*</span> Required</p>
        <p id="register-error" class="form-error" role="alert"></p>
        <button class="button button-primary button-wide" type="submit">Create profile</button>
      </form>`;
  }

  async function submitRegistration(form) {
    const errorEl = document.querySelector("#register-error");
    errorEl.textContent = "";
    const result = validateProfileForm(form);
    if (result.error) {
      errorEl.textContent = result.error;
      form.querySelector(":invalid")?.focus();
      return;
    }
    let avatar = "";
    try {
      avatar = await imageAsDataUrl(form.elements.avatar.files[0]);
    } catch (error) {
      errorEl.textContent = error.message;
      return;
    }
    const previous = state.profile;
    state.profile = {
      ...PROFILE_DEFAULT,
      ...result.values,
      avatar: safeImageSrc(avatar),
      discoveryEnabled: form.elements.discoveryEnabled.checked,
      registered: true
    };
    if (!saveState()) {
      state.profile = previous;
      errorEl.textContent = "Your profile couldn't be saved. Check that your browser allows site storage.";
      return;
    }
    // Continue to the page the user originally opened.
    render();
    main.focus({ preventScroll: true });
    notify(`Welcome to PaceTrack, ${state.profile.name}!`);
  }

  function renderTracker() {
    currentUnit = "m";
    importedMarkVerified = false;
    return `<section class="page-heading">
        <div><p class="eyebrow">A LITTLE BETTER EACH DAY</p><h1>Log a session</h1>
          <p class="page-description">Capture a workout, race result, or field mark.</p></div>
      </section>
      <div class="tracker-layout">
        <form id="workout-form" class="card form-card">
          <div class="section-heading"><div><p class="eyebrow">NEW WORKOUT</p><h2>Session details</h2></div></div>
          <label>Track &amp; field event<select name="event" id="event-select" required>${eventOptions()}</select></label>
          <div class="form-grid">
            <label>Mark unit<select name="unit" id="unit-select"><option value="m">Meters (m)</option><option value="ft">Feet / inches (ft / in)</option></select></label>
            <label>Date<input type="date" name="date" required value="${isoDay(0)}"></label>
          </div>
          <div class="form-grid mark-inputs">
            <label id="mark-metric-label">Distance / mark (m)<input name="markMetric" id="mark-metric" type="number" min="0.01" step="any" placeholder="e.g. 800" required></label>
            <div class="field-pair is-hidden" id="mark-imperial">
              <label>Feet<input name="markFeet" type="number" min="0" step="1" placeholder="ft"></label>
              <label>Inches<input name="markInches" type="number" min="0" max="11.99" step="any" placeholder="in"></label>
            </div>
          </div>
          <label id="time-label">Time <span class="label-hint">HH:MM:SS.ms or MM:SS.ms</span>
            <input name="time" id="time-input" type="text" inputmode="decimal" placeholder="00:04:32.50" autocomplete="off"></label>
          <fieldset id="calculator-options" class="choice-fieldset"><legend>Show calculations</legend>
            <label class="check-row"><input type="checkbox" name="showMps" checked> Calculate m/s (meters per second)</label>
            <label class="check-row"><input type="checkbox" name="showMph" checked> Calculate mph (miles per hour)</label>
            <output id="calculation-preview" class="calculation-preview" aria-live="polite">Enter a distance and time to preview speed.</output>
          </fieldset>
          <label>Attach a meet photo or score sheet <span class="label-hint">Optional · JPG, PNG or WebP · Max 1 MB · Location data is removed</span>
            <input type="file" name="photo" id="workout-photo" accept="image/jpeg,image/png,image/webp"></label>
          <div id="photo-preview" class="photo-preview" aria-live="polite"></div>
          <section class="import-panel" aria-labelledby="import-heading">
            <div><p class="eyebrow">SAVE TIME</p><h3 id="import-heading">Import official times</h3>
              <p>Paste a result link or athlete ID for a demo import.</p></div>
            <div class="provider-buttons" role="group" aria-label="Official result provider">
              <button type="button" class="provider-button is-selected" data-provider="TFRRS">TFRRS</button>
              <button type="button" class="provider-button" data-provider="MileSplit">MileSplit</button>
              <button type="button" class="provider-button" data-provider="Athletic.net">Athletic.net</button>
            </div>
            <label class="visually-hidden" for="import-input">Result link or athlete ID</label>
            <div class="import-row"><input id="import-input" type="text" maxlength="200" autocomplete="off" placeholder="Paste a result URL or athlete ID">
              <button type="button" class="button button-secondary" data-action="mock-import">Fill from result</button></div>
            <p id="verified-note" class="verified-note is-hidden">✓ Result imported · verified mark</p>
          </section>
          <p id="form-error" class="form-error" role="alert"></p>
          <button class="button button-primary button-wide" type="submit">Save session</button>
        </form>
        <aside class="card tracker-aside"><span class="aside-icon">✦</span><p class="eyebrow">KEEP THE MOMENTUM</p>
          <h2>Progress is built rep by rep.</h2><p>Your sessions show up in your profile and community feed automatically.</p>
          <a class="text-link" href="feed.html" data-route="feed">See the community feed →</a></aside>
      </div>`;
  }

  function getVisibleFeed() {
    const workouts = sortedWorkouts();
    if (feedFilter === "near") return workouts.filter(workout => {
      const athlete = athleteFor(workout);
      return (athlete.id === "me" && state.profile.discoveryEnabled)
        || state.athletes.find(item => item.id === athlete.id)?.nearby;
    });
    if (feedFilter === "similar") return workouts.filter(workout => {
      const athlete = athleteFor(workout);
      return (athlete.id === "me" && state.profile.discoveryEnabled)
        || state.athletes.find(item => item.id === athlete.id)?.similar;
    });
    return workouts;
  }

  function renderWorkoutCard(workout) {
    const athlete = athleteFor(workout);
    const isMe = athlete.id === "me";
    const base = workout.reactions || { kudos: 0, fire: 0, clap: 0 };
    const mine = state.myReactions[workout.id] || {};
    const counts = {
      kudos: (base.kudos || 0) + (mine.kudos ? 1 : 0),
      fire: (base.fire || 0) + (mine.fire ? 1 : 0),
      clap: (base.clap || 0) + (mine.clap ? 1 : 0)
    };
    const following = state.following.includes(athlete.id);
    const metrics = paceText(workout);
    return `<article class="card workout-card">
      <div class="workout-author">${profileAvatar(athlete, "avatar avatar-small")}
        <div class="author-details"><strong>${escapeHtml(athlete.name)}</strong><span>${escapeHtml(athlete.school || "")}${athlete.school ? " · " : ""}${escapeHtml(new Date(`${workout.date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }))}</span></div>
        ${workout.verified ? `<span class="verified-badge" title="Official mark verified">✓ Verified</span>` : ""}
        ${!isMe ? `<button type="button" class="button button-follow ${following ? "is-following" : ""}" data-action="follow" data-athlete="${escapeHtml(athlete.id)}">${following ? "Following" : "Connect"}</button>` : ""}
      </div>
      <div class="workout-main"><span class="event-badge">${escapeHtml(workout.eventLabel)}</span>
        <strong class="workout-mark">${escapeHtml(formatMark(workout))}</strong>
        ${metrics ? `<span class="workout-speed">${escapeHtml(metrics)}</span>` : ""}
      </div>
      ${safeImageSrc(workout.photo) ? `<img class="workout-photo" src="${escapeHtml(safeImageSrc(workout.photo))}" alt="Photo attached to ${escapeHtml(workout.eventLabel)} session" loading="lazy">` : ""}
      <div class="reaction-row" aria-label="Reactions">
        ${[["kudos", "⚡", "Kudos"], ["fire", "🔥", "Fire"], ["clap", "👏", "Clap"]].map(([key, emoji, label]) =>
          `<button type="button" class="reaction-button ${mine[key] ? "is-reacted" : ""}" data-action="react" data-workout="${escapeHtml(workout.id)}" data-reaction="${key}" aria-pressed="${mine[key] ? "true" : "false"}" aria-label="${label}, ${counts[key] || 0} reactions">${emoji} <span>${label}</span> <b>${counts[key] || 0}</b></button>`
        ).join("")}
      </div>
    </article>`;
  }

  function renderFeed() {
    const visible = getVisibleFeed();
    const filters = [["all", "All athletes"], ["near", "Near me"], ["similar", "Similar times / pace"]];
    const showPrivacyNote = !state.profile.discoveryEnabled && feedFilter !== "all";
    return `<section class="page-heading">
        <div><p class="eyebrow">FROM THE RUNNING COMMUNITY</p><h1>Activity feed</h1>
          <p class="page-description">A little inspiration from every lane.</p></div>
        <a class="button button-primary" href="tracker.html" data-route="tracker">＋ Log a session</a>
      </section>
      <section class="feed-toolbar card" aria-label="Feed filters">
        <div class="filter-pills" role="group" aria-label="Filter athletes">
          ${filters.map(([id, label]) => `<button type="button" class="filter-pill ${feedFilter === id ? "is-active" : ""}" data-action="feed-filter" data-filter="${id}" aria-pressed="${feedFilter === id}">${label}</button>`).join("")}
        </div>
      </section>
      ${showPrivacyNote ? `<aside class="notice-banner">Nearby and similar-athlete filters are unavailable while discovery is off. <a href="index.html" data-route="home">Update your privacy settings</a>.</aside>` : ""}
      ${feedFilter !== "all" && !state.profile.discoveryEnabled ? `<section class="feed-stream"><div class="card empty-card">Discovery filters are paused while your privacy setting is off.</div></section>` :
        `<section class="feed-stream" aria-label="Community activity">${visible.length ? visible.map(renderWorkoutCard).join("") : `<div class="card empty-card">No sessions in this filter yet. Try another view.</div>`}</section>`}`;
  }

  function filteredAthletes(query = "") {
    const needle = query.trim().toLowerCase();
    return state.athletes.filter(athlete => {
      const matchesSearch = !needle || `${athlete.name} ${athlete.school}`.toLowerCase().includes(needle);
      const matchesCategory = athleteFilter === "all" || (athleteFilter === "near"
        ? state.profile.discoveryEnabled && athlete.nearby
        : athlete.category === athleteFilter);
      return matchesSearch && matchesCategory;
    });
  }

  function renderAthleteCard(athlete) {
    const following = state.following.includes(athlete.id);
    return `<article class="card athlete-card">
      <div class="athlete-card-top">${profileAvatar(athlete, "avatar avatar-large")}<span class="tag">${escapeHtml(athlete.category)}</span></div>
      <h3>${escapeHtml(athlete.name)}</h3><p class="athlete-school">${escapeHtml(athlete.school)}</p>
      <p class="athlete-meta">Class of ${escapeHtml(athlete.gradYear)}</p>
      <div class="event-list">${athlete.events.map(event => `<span>${escapeHtml(event)}</span>`).join("")}</div>
      <div class="athlete-pr"><span>PERSONAL BEST</span><strong>${escapeHtml(athlete.pr)}</strong></div>
      <button type="button" class="button ${following ? "button-secondary" : "button-primary"} button-wide" data-action="follow" data-athlete="${escapeHtml(athlete.id)}">${following ? "Following" : "Connect"}</button>
    </article>`;
  }

  function renderAthletes() {
    const categories = [["all", "All"], ["High School", "High School"], ["Collegiate", "Collegiate (NCAA/NJCAA)"], ["Club", "Club"], ["near", "Near my location"]];
    const nearbyDisabled = !state.profile.discoveryEnabled;
    return `<section class="page-heading">
        <div><p class="eyebrow">MEET YOUR NEXT TRAINING PARTNER</p><h1>Athletes</h1>
          <p class="page-description">Find your people, share a little encouragement.</p></div>
      </section>
      <section class="directory-controls card">
        <label class="search-field"><span aria-hidden="true">⌕</span><span class="visually-hidden">Search athletes</span>
          <input type="search" id="athlete-search" placeholder="Search by name or school…" autocomplete="off"></label>
        <div class="filter-pills directory-pills" role="group" aria-label="Filter by athlete type">
          ${categories.map(([id, label]) => `<button type="button" class="filter-pill ${athleteFilter === id ? "is-active" : ""} ${id === "near" && nearbyDisabled ? "is-disabled" : ""}" data-action="athlete-filter" data-filter="${escapeHtml(id)}" aria-pressed="${athleteFilter === id}" ${id === "near" && nearbyDisabled ? "aria-disabled=\"true\"" : ""}>${label}</button>`).join("")}
        </div>
      </section>
      ${nearbyDisabled && athleteFilter === "near" ? `<aside class="notice-banner">Nearby discovery is off. <a href="index.html" data-route="home">Enable it in your profile settings</a> to see local athletes.</aside>` : ""}
      <section id="athlete-grid" class="athlete-grid" aria-live="polite">${filteredAthletes().map(renderAthleteCard).join("") || `<div class="card empty-card">No athletes match that search. Try another name or filter.</div>`}</section>`;
  }

  function updateNav() {
    nav.querySelectorAll("a").forEach(link => {
      const current = new URL(link.href, location.href).pathname === location.pathname;
      link.removeAttribute("aria-current");
      if ((link.dataset.view || routeFromHref(link.href)) === view) link.setAttribute("aria-current", "page");
      if (current && !link.dataset.view) link.dataset.view = routeFromHref(link.href);
    });
  }

  function routeFromHref(href) {
    const path = new URL(href, location.href).pathname.toLowerCase();
    return path.endsWith("tracker.html") ? "tracker" : path.endsWith("feed.html") ? "feed" : path.endsWith("athletes.html") ? "athletes" : "home";
  }

  function render() {
    // Registration gate: until a profile exists, every page shows the
    // registration form and the main navigation is hidden.
    nav.closest("nav").hidden = !isRegistered();
    if (!isRegistered()) {
      document.title = "Create your profile | PaceTrack";
      main.innerHTML = renderRegistration();
      return;
    }
    document.title = `${NAV_LINKS.find(link => link.id === view)?.label || "Home"} | PaceTrack`;
    updateNav();
    // Safe: every user-controlled value inside these templates is passed
    // through escapeHtml() and image URLs through safeImageSrc().
    main.innerHTML = view === "tracker" ? renderTracker()
      : view === "feed" ? renderFeed()
        : view === "athletes" ? renderAthletes() : renderHome();
    if (view === "tracker") {
      updateEventFields();
      updateCalculationPreview();
    }
  }

  function updateEventFields() {
    const event = EVENT_MAP.get(document.querySelector("#event-select").value);
    const isRunning = event.kind === "run";
    const unit = document.querySelector("#unit-select").value;
    document.querySelector("#time-label").classList.toggle("is-hidden", !isRunning);
    document.querySelector("#time-input").required = isRunning;
    document.querySelector("#calculator-options").classList.toggle("is-hidden", !isRunning);
    document.querySelector("#mark-metric").required = unit === "m";
    document.querySelector("#mark-imperial input[name=markFeet]").required = unit === "ft";
    document.querySelector("#mark-metric-label").classList.toggle("is-hidden", unit !== "m");
    document.querySelector("#mark-imperial").classList.toggle("is-hidden", unit !== "ft");
    const mark = document.querySelector("#mark-metric");
    if (event.distance && event.kind === "run" && !mark.dataset.edited) mark.value = event.distance;
    document.querySelector("#mark-metric-label").firstChild.textContent = isRunning ? "Distance (m)" : "Mark (m)";
    updateCalculationPreview();
  }

  function metricDistance(form) {
    if (form.elements.unit.value === "ft") {
      const feet = Number(form.elements.markFeet.value);
      const inches = Number(form.elements.markInches.value || 0);
      if (!Number.isFinite(feet) || feet < 0 || !Number.isFinite(inches) || inches < 0 || inches >= 12) return null;
      return (feet * 12 + inches) * 0.0254;
    }
    const meters = Number(form.elements.markMetric.value);
    return Number.isFinite(meters) && meters > 0 ? meters : null;
  }

  function updateCalculationPreview() {
    const form = document.querySelector("#workout-form");
    if (!form) return;
    const event = EVENT_MAP.get(form.elements.event.value);
    const preview = document.querySelector("#calculation-preview");
    if (event.kind !== "run") {
      preview.textContent = "Speed calculations are available for running events.";
      return;
    }
    const meters = metricDistance(form);
    const seconds = parseDuration(form.elements.time.value);
    if (!meters || !seconds) {
      preview.textContent = "Enter a distance and time to preview speed.";
      return;
    }
    const values = [];
    if (form.elements.showMps.checked) values.push(`${(meters / seconds).toFixed(2)} m/s`);
    if (form.elements.showMph.checked) values.push(`${(meters / 1609.344 / (seconds / 3600)).toFixed(2)} mph`);
    preview.textContent = values.length ? `Calculated speed · ${values.join(" · ")}` : "Select a calculation to display speed.";
  }

  // Validates an uploaded image, then re-draws it on a canvas. Re-encoding
  // strips EXIF metadata (GPS location, device info) for privacy and ensures
  // only real pixel data — never SVG/script content — is ever stored.
  function imageAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve("");
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return reject(new Error("Choose a JPG, PNG, or WebP image."));
      if (file.size > MAX_IMAGE_BYTES) return reject(new Error("Images must be 1 MB or smaller."));
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.naturalWidth * scale);
        canvas.height = Math.round(image.naturalHeight * scale);
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("This image could not be read."));
      };
      image.src = objectUrl;
    });
  }

  // Builds the preview with DOM APIs instead of innerHTML string building.
  function createPreviewImage(dataUrl, className, alt) {
    const img = document.createElement("img");
    if (className) img.className = className;
    img.src = safeImageSrc(dataUrl);
    img.alt = alt;
    return img;
  }

  function setImagePreview(file, container) {
    if (!file) {
      container.replaceChildren();
      return Promise.resolve("");
    }
    return imageAsDataUrl(file).then(dataUrl => {
      container.replaceChildren(createPreviewImage(dataUrl, "", "Selected image preview"));
      return dataUrl;
    });
  }

  // Accepts either a plain athlete ID or an HTTPS link to a known results site.
  function isValidImportValue(value) {
    if (/^[A-Za-z0-9_-]{1,40}$/.test(value)) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:"
        && IMPORT_HOSTS.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`));
    } catch {
      return false;
    }
  }

  function isValidIsoDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T12:00:00`);
    return !Number.isNaN(date.getTime()) && value >= "1950-01-01" && value <= isoDay(1);
  }

  async function submitWorkout(form) {
    const errorEl = document.querySelector("#form-error");
    errorEl.textContent = "";
    // Never trust the <select>: its value can be edited in dev tools.
    const event = EVENT_MAP.get(form.elements.event.value);
    if (!event) {
      errorEl.textContent = "Choose an event from the list.";
      return;
    }
    if (!["m", "ft"].includes(form.elements.unit.value)) {
      errorEl.textContent = "Choose a valid unit.";
      return;
    }
    if (!isValidIsoDate(form.elements.date.value)) {
      errorEl.textContent = "Enter a valid date that is not in the future.";
      form.elements.date.focus();
      return;
    }
    const seconds = event.kind === "run" ? parseDuration(form.elements.time.value) : null;
    const meters = metricDistance(form);
    if (event.kind === "run" && (!seconds || seconds > 24 * 3600)) {
      errorEl.textContent = "Enter a valid time (MM:SS.ms or HH:MM:SS.ms) under 24 hours.";
      form.elements.time.focus();
      return;
    }
    if (!meters || meters > (event.kind === "run" ? 100000 : 150)) {
      errorEl.textContent = "Enter a valid positive distance or mark within a realistic range.";
      return;
    }
    if (event.kind === "run" && !form.elements.showMps.checked && !form.elements.showMph.checked) {
      errorEl.textContent = "Select at least one speed calculation to show.";
      return;
    }
    const file = form.elements.photo.files[0];
    let photo = "";
    try {
      photo = await imageAsDataUrl(file);
    } catch (error) {
      errorEl.textContent = error.message;
      return;
    }
    const unit = form.elements.unit.value;
    const mark = unit === "ft"
      ? Number(form.elements.markFeet.value) * 0.3048 + Number(form.elements.markInches.value || 0) * 0.0254
      : Number(form.elements.markMetric.value);
    const workout = {
      id: `workout-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      athleteId: "me", date: form.elements.date.value,
      event: event.id, eventLabel: event.label, kind: event.kind,
      markMeters: meters, mark, unit,
      markFeet: unit === "ft" ? Number(form.elements.markFeet.value) : null,
      markInches: unit === "ft" ? Number(form.elements.markInches.value || 0) : null,
      timeSeconds: seconds, verified: importedMarkVerified, photo,
      showMps: form.elements.showMps.checked, showMph: form.elements.showMph.checked,
      reactions: { kudos: 0, fire: 0, clap: 0 }
    };
    state.workouts.unshift(workout);
    if (!saveState()) {
      state.workouts.shift();
      return;
    }
    notify("Session saved to your profile and community feed.");
    routeTo("feed");
  }

  async function submitProfile(form) {
    // Re-validate in JavaScript: HTML attributes like maxlength/pattern are
    // easy to bypass, so they are only a convenience for the user.
    const result = validateProfileForm(form);
    if (result.error) {
      notify(result.error);
      return;
    }
    const file = form.elements.avatar.files[0];
    let avatar = state.profile.avatar;
    try {
      if (file) avatar = await imageAsDataUrl(file);
    } catch (error) {
      notify(error.message);
      return;
    }
    const previous = state.profile;
    state.profile = {
      ...state.profile,
      ...result.values,
      avatar: safeImageSrc(avatar)
    };
    if (!saveState()) {
      state.profile = previous;
      return;
    }
    render();
    notify("Your profile has been updated.");
  }

  function refreshAthleteGrid() {
    const query = document.querySelector("#athlete-search")?.value || "";
    const grid = document.querySelector("#athlete-grid");
    if (grid) grid.innerHTML = filteredAthletes(query).map(renderAthleteCard).join("")
      || `<div class="card empty-card">No athletes match that search. Try another name or filter.</div>`;
  }

  function handleClick(event) {
    // Navigation is disabled until the user has registered.
    if (!isRegistered()) return;
    const routeLink = event.target.closest("a[data-route]");
    if (routeLink) {
      event.preventDefault();
      routeTo(routeLink.dataset.route);
      return;
    }
    const navLink = event.target.closest(".nav-links a");
    if (navLink) {
      event.preventDefault();
      routeTo(routeFromHref(navLink.href));
      return;
    }
    const providerButton = event.target.closest(".provider-button");
    if (providerButton) {
      document.querySelectorAll(".provider-button").forEach(button =>
        button.classList.toggle("is-selected", button === providerButton));
      return;
    }
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "edit-profile") document.querySelector("#profile-dialog")?.showModal();
    if (action === "close-profile") document.querySelector("#profile-dialog")?.close();
    if (action === "feed-filter") {
      if (!["all", "near", "similar"].includes(button.dataset.filter)) return;
      feedFilter = button.dataset.filter;
      render();
    }
    if (action === "athlete-filter") {
      if (!["all", "High School", "Collegiate", "Club", "near"].includes(button.dataset.filter)) return;
      if (button.dataset.filter === "near" && !state.profile.discoveryEnabled) {
        athleteFilter = "near";
        render();
        return;
      }
      athleteFilter = button.dataset.filter;
      render();
    }
    if (action === "follow") {
      const id = button.dataset.athlete;
      const previous = state.following;
      state.following = state.following.includes(id)
        ? state.following.filter(item => item !== id) : [...state.following, id];
      if (!saveState()) state.following = previous;
      render();
    }
    if (action === "react") {
      const { workout: workoutId, reaction } = button.dataset;
      const workout = sortedWorkouts().find(item => item.id === workoutId);
      if (!workout) return;
      const previous = state.myReactions[workoutId] ? { ...state.myReactions[workoutId] } : null;
      const current = state.myReactions[workoutId] ? { ...state.myReactions[workoutId] } : {};
      current[reaction] = !current[reaction];
      if (current.kudos || current.fire || current.clap) {
        state.myReactions[workoutId] = current;
      } else {
        delete state.myReactions[workoutId];
      }
      if (!saveState()) {
        if (previous) state.myReactions[workoutId] = previous;
        else delete state.myReactions[workoutId];
      }
      render();
    }
    if (action === "mock-import") {
      const importValue = document.querySelector("#import-input").value.trim();
      if (!importValue) {
        notify("Enter a result link or athlete ID to import.");
        document.querySelector("#import-input").focus();
        return;
      }
      if (!isValidImportValue(importValue)) {
        notify("Use an athlete ID (letters, numbers, - or _) or an https:// link from TFRRS, MileSplit, or Athletic.net.");
        document.querySelector("#import-input").focus();
        return;
      }
      // The link/ID is only checked, never stored or sent anywhere.
      document.querySelector("#import-input").value = "";
      const eventSelect = document.querySelector("#event-select");
      const defaultOption = eventSelect.querySelector("option[value='800m']");
      if (defaultOption) eventSelect.value = "800m";
      document.querySelector("#unit-select").value = "m";
      updateEventFields();
      document.querySelector("#mark-metric").value = "800";
      document.querySelector("#mark-metric").dataset.edited = "true";
      document.querySelector("#time-input").value = "00:02:18.40";
      document.querySelector("input[name=date]").value = isoDay(-1);
      importedMarkVerified = true;
      document.querySelector("#verified-note").classList.remove("is-hidden");
      updateCalculationPreview();
      notify(`Demo result imported from ${document.querySelector(".provider-button.is-selected").dataset.provider}.`);
    }
  }

  function handleChange(event) {
    const target = event.target;
    if (importedMarkVerified && target.matches("#event-select, #unit-select, #mark-metric, #mark-imperial input, #time-input, input[name=date]")) {
      importedMarkVerified = false;
      document.querySelector("#verified-note")?.classList.add("is-hidden");
    }
    if (target.matches("[data-action=toggle-discovery]")) {
      const previous = state.profile.discoveryEnabled;
      state.profile.discoveryEnabled = target.checked;
      if (!saveState()) state.profile.discoveryEnabled = previous;
      render();
    }
    if (target.matches("#event-select")) {
      document.querySelector("#mark-metric").dataset.edited = "";
      updateEventFields();
    }
    if (target.matches("#unit-select")) {
      const form = document.querySelector("#workout-form");
      if (currentUnit === "m" && target.value === "ft") {
        const meters = Number(form.elements.markMetric.value);
        if (Number.isFinite(meters) && meters > 0) {
          const totalInches = meters / 0.0254;
          form.elements.markFeet.value = Math.floor(totalInches / 12);
          form.elements.markInches.value = (totalInches % 12).toFixed(2).replace(/\.?0+$/, "");
        }
      } else if (currentUnit === "ft" && target.value === "m") {
        const feet = Number(form.elements.markFeet.value);
        const inches = Number(form.elements.markInches.value || 0);
        if ((form.elements.markFeet.value !== "" || form.elements.markInches.value !== "")
          && Number.isFinite(feet) && Number.isFinite(inches)) {
          form.elements.markMetric.value = ((feet * 12 + inches) * 0.0254).toFixed(3);
        }
      }
      currentUnit = target.value;
      updateEventFields();
    }
    if (target.matches("#workout-photo")) {
      const preview = document.querySelector("#photo-preview");
      setImagePreview(target.files[0], preview).catch(error => {
        target.value = "";
        preview.replaceChildren();
        notify(error.message);
      });
    }
    if (target.matches("input[name=avatar]")) {
      const avatar = target.files[0];
      if (!avatar) return;
      imageAsDataUrl(avatar)
        .then(dataUrl => {
          const preview = target.closest(".upload-row").querySelector(".avatar");
          preview.replaceWith(createPreviewImage(dataUrl, "avatar", "Selected profile photo preview"));
        })
        .catch(error => {
          target.value = "";
          notify(error.message);
        });
    }
    if (target.matches(".provider-button")) {
      document.querySelectorAll(".provider-button").forEach(button => button.classList.toggle("is-selected", button === target));
    }
    if (target.matches("#athlete-search")) refreshAthleteGrid();
    if (target.matches("#workout-form input")) updateCalculationPreview();
  }

  document.addEventListener("click", handleClick);
  document.addEventListener("change", handleChange);
  document.addEventListener("input", event => {
    if (importedMarkVerified && event.target.matches("#event-select, #unit-select, #mark-metric, #mark-imperial input, #time-input, input[name=date]")) {
      importedMarkVerified = false;
      document.querySelector("#verified-note")?.classList.add("is-hidden");
    }
    if (event.target.matches("#athlete-search")) refreshAthleteGrid();
    if (event.target.matches("#workout-form input")) updateCalculationPreview();
    if (event.target.matches("#mark-metric")) event.target.dataset.edited = "true";
  });
  document.addEventListener("submit", event => {
    if (event.target.matches("#workout-form")) {
      event.preventDefault();
      submitWorkout(event.target);
    } else if (event.target.matches("#register-form")) {
      event.preventDefault();
      submitRegistration(event.target);
    } else if (event.target.matches("#profile-form")) {
      event.preventDefault();
      submitProfile(event.target);
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") document.querySelector("#profile-dialog")?.close();
  });
  window.addEventListener("popstate", () => routeTo(routeFromLocation(), false));

  const status = document.createElement("div");
  status.id = "app-status";
  status.className = "app-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  document.body.append(status);

  render();
})();
