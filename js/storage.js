/*
 * PaceTrack shared storage and formatting helpers.
 *
 * Loaded on every page before the page-specific script, so Home, Log Run,
 * Feed, and Athletes all read and write runs the same way.
 *
 * Runs are stored in localStorage under RUNS_KEY as a JSON array of:
 *   {
 *     id: string,              // unique id
 *     date: "YYYY-MM-DD",      // day the run happened (local time)
 *     distanceMiles: number,   // > 0
 *     durationSeconds: number, // whole seconds, > 0
 *     title: string,           // optional, may be ""
 *     notes: string,           // optional, may be ""
 *     createdAt: string        // ISO timestamp when it was saved
 *   }
 */
const PaceTrack = (function () {
  const RUNS_KEY = "pacetrack.runs";

  // Your profile is stored under PROFILE_KEY as a JSON object: { name: string }.
  // An empty name means "show You".
  const PROFILE_KEY = "pacetrack.profile";
  const MAX_NAME_LENGTH = 40;

  // Accept only records that have the fields we need; skip anything broken
  // instead of letting one bad entry break the whole page.
  function isValidRun(run) {
    return (
      run !== null &&
      typeof run === "object" &&
      typeof run.date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(run.date) &&
      Number(run.distanceMiles) > 0 &&
      Number(run.durationSeconds) > 0
    );
  }

  // Cleans one valid stored run into the shape every page uses.
  function normalizeRun(run) {
    return {
      id: String(run.id || run.createdAt || run.date),
      date: run.date,
      distanceMiles: Number(run.distanceMiles),
      durationSeconds: Math.round(Number(run.durationSeconds)),
      title: typeof run.title === "string" ? run.title : "",
      notes: typeof run.notes === "string" ? run.notes : "",
      createdAt: typeof run.createdAt === "string" ? run.createdAt : ""
    };
  }

  function loadRuns() {
    let raw;
    try {
      raw = localStorage.getItem(RUNS_KEY);
    } catch (error) {
      return [];
    }
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter(isValidRun).map(normalizeRun);
    } catch (error) {
      return [];
    }
  }

  // Adds a run to the existing list. Re-reads storage first so runs saved
  // in another tab are not overwritten. Throws if the browser refuses to
  // save (storage full, disabled, private mode, etc.).
  function addRun(run) {
    let existing = [];
    const raw = localStorage.getItem(RUNS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Keep every existing entry exactly as stored.
        existing = parsed;
      }
    }

    const record = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      date: run.date,
      distanceMiles: run.distanceMiles,
      durationSeconds: run.durationSeconds,
      title: run.title || "",
      notes: run.notes || "",
      createdAt: new Date().toISOString()
    };

    existing.push(record);
    localStorage.setItem(RUNS_KEY, JSON.stringify(existing));
    return record;
  }

  function storageError(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
  }

  function sameRun(a, b) {
    return a.id === b.id && a.date === b.date &&
      a.distanceMiles === b.distanceMiles && a.durationSeconds === b.durationSeconds &&
      a.title === b.title && a.notes === b.notes && a.createdAt === b.createdAt;
  }

  // Removes one run, given as loadRuns() returned it. Re-reads storage first
  // and removes only the single matching entry, so runs saved in another tab
  // and entries this app can't read are kept. Throws with error.code
  // "invalid" (stored runs unreadable), "notfound" (already removed), or a
  // browser storage error.
  function deleteRun(target) {
    const raw = localStorage.getItem(RUNS_KEY);
    let parsed = null;
    try {
      parsed = raw === null ? null : JSON.parse(raw);
    } catch (error) {
      parsed = null;
    }
    if (raw !== null && !Array.isArray(parsed)) {
      throw storageError("invalid", "Stored runs are not a list.");
    }
    const runs = parsed || [];
    let index = -1;
    for (let i = 0; i < runs.length; i += 1) {
      if (isValidRun(runs[i]) && sameRun(normalizeRun(runs[i]), target)) {
        index = i;
        break;
      }
    }
    if (index === -1) {
      throw storageError("notfound", "That run is no longer saved.");
    }
    runs.splice(index, 1);
    localStorage.setItem(RUNS_KEY, JSON.stringify(runs));
  }

  // Trims, collapses spaces, and limits length. Non-strings become "".
  function cleanName(name) {
    if (typeof name !== "string") {
      return "";
    }
    return name.trim().replace(/\s+/g, " ").slice(0, MAX_NAME_LENGTH).trim();
  }

  // status is "ok", "invalid", or "unavailable"; name is "" when not set.
  function loadProfile() {
    const result = readJSON(PROFILE_KEY);
    if (result.status === "missing") {
      return { status: "ok", name: "" };
    }
    if (result.status !== "ok") {
      return { status: result.status, name: "" };
    }
    const value = result.value;
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return { status: "invalid", name: "" };
    }
    return { status: "ok", name: cleanName(value.name) };
  }

  // Saves the display name and returns the cleaned name. Keeps any other
  // profile fields. Throws if the browser refuses to save.
  function saveProfileName(name) {
    let profile = {};
    const result = readJSON(PROFILE_KEY);
    if (result.status === "ok" && result.value !== null &&
        typeof result.value === "object" && !Array.isArray(result.value)) {
      profile = result.value;
    }
    profile.name = cleanName(name);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return profile.name;
  }

  // Newest run date first; for runs on the same day, the most recently
  // saved comes first.
  function sortNewestFirst(runs) {
    return runs.slice().sort(function (a, b) {
      if (a.date !== b.date) {
        return a.date < b.date ? 1 : -1;
      }
      if (a.createdAt !== b.createdAt) {
        return a.createdAt < b.createdAt ? 1 : -1;
      }
      return 0;
    });
  }

  // Seconds per mile, rounded to a whole second.
  function paceSecondsPerMile(durationSeconds, distanceMiles) {
    if (!(distanceMiles > 0) || !(durationSeconds > 0)) {
      return null;
    }
    return Math.round(durationSeconds / distanceMiles);
  }

  function pad2(number) {
    return String(number).padStart(2, "0");
  }

  // 540 -> "9:00/mi". The value is rounded before it is split into minutes
  // and seconds, so the output can never show something like "8:60/mi".
  function formatPace(secondsPerMile) {
    if (secondsPerMile === null || !isFinite(secondsPerMile)) {
      return "—";
    }
    const total = Math.round(secondsPerMile);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return minutes + ":" + pad2(seconds) + "/mi";
  }

  // 1620 -> "27:00", 3725 -> "1:02:05"
  function formatDuration(totalSeconds) {
    const total = Math.round(totalSeconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    if (hours > 0) {
      return hours + ":" + pad2(minutes) + ":" + pad2(seconds);
    }
    return minutes + ":" + pad2(seconds);
  }

  // Up to two decimal places, without trailing zeros: 3 -> "3", 3.1 -> "3.1"
  function formatDistance(miles) {
    return Number(miles.toFixed(2)).toString() + " mi";
  }

  // Parse "YYYY-MM-DD" as a local date (new Date("YYYY-MM-DD") would use UTC
  // and can show the previous day in US time zones).
  function parseLocalDate(isoDate) {
    const parts = isoDate.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function formatDate(isoDate) {
    return parseLocalDate(isoDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  // Today's date in local time as "YYYY-MM-DD".
  function todayISO() {
    const now = new Date();
    return now.getFullYear() + "-" + pad2(now.getMonth() + 1) + "-" + pad2(now.getDate());
  }

  // Reads and parses any stored JSON value without throwing, and says why
  // nothing usable came back. status is one of:
  //   "ok"          - value holds the parsed JSON
  //   "missing"     - nothing has been saved under this key yet
  //   "invalid"     - something is saved but it is not valid JSON
  //   "unavailable" - the browser blocked access to localStorage
  function readJSON(key) {
    let raw;
    try {
      raw = localStorage.getItem(key);
    } catch (error) {
      return { status: "unavailable", value: null };
    }
    if (raw === null) {
      return { status: "missing", value: null };
    }
    try {
      return { status: "ok", value: JSON.parse(raw) };
    } catch (error) {
      return { status: "invalid", value: null };
    }
  }

  // Lets a page warn about unreadable runs instead of quietly showing an
  // empty list. Never changes what is stored. skipped counts entries that
  // loadRuns() leaves out because they are missing required fields.
  function inspectRuns() {
    const result = readJSON(RUNS_KEY);
    if (result.status !== "ok") {
      return { status: result.status, skipped: 0 };
    }
    if (!Array.isArray(result.value)) {
      return { status: "invalid", skipped: 0 };
    }
    return {
      status: "ok",
      skipped: result.value.filter(function (run) {
        return !isValidRun(run);
      }).length
    };
  }

  return {
    RUNS_KEY: RUNS_KEY,
    PROFILE_KEY: PROFILE_KEY,
    MAX_NAME_LENGTH: MAX_NAME_LENGTH,
    deleteRun: deleteRun,
    cleanName: cleanName,
    loadProfile: loadProfile,
    saveProfileName: saveProfileName,
    readJSON: readJSON,
    inspectRuns: inspectRuns,
    loadRuns: loadRuns,
    addRun: addRun,
    sortNewestFirst: sortNewestFirst,
    paceSecondsPerMile: paceSecondsPerMile,
    formatPace: formatPace,
    formatDuration: formatDuration,
    formatDistance: formatDistance,
    formatDate: formatDate,
    parseLocalDate: parseLocalDate,
    todayISO: todayISO
  };
})();
