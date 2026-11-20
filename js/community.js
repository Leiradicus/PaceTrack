/*
 * PaceTrack community data: sample athletes, sample activity, follows, likes.
 *
 * Loaded after storage.js on the Feed and Athletes pages so both pages share
 * one source of truth for who you follow.
 *
 * Sample athletes and activities are fixed demo records defined here (not in
 * storage), so their ids never change between visits. Only your choices are
 * saved, each in localStorage as a JSON array of id strings:
 *   pacetrack.follows - athlete ids you follow, e.g. ["athlete-priya-patel"]
 *   pacetrack.likes   - activity ids you liked, e.g. ["sample-maya-1", "run:abc123"]
 *
 * Activity ids: sample runs use "sample-...", your runs use "run:" + the id
 * that the Log Run page gave the run.
 */
const PaceTrackCommunity = (function () {
  const FOLLOWS_KEY = "pacetrack.follows";
  const LIKES_KEY = "pacetrack.likes";

  // Follows saved the very first time a community page is opened, so the
  // Following feed has something to show. Never re-applied after that.
  const DEFAULT_FOLLOWS = ["athlete-priya-patel"];

  // You, as shown in the feed. Use me() for your current display name.
  const ME = {
    id: "me",
    name: "You",
    initials: "ME",
    color: "#172033"
  };

  // Your display name from the Edit Profile page, or "You" if none is set.
  function me() {
    const name = PaceTrack.loadProfile().name;
    if (!name) {
      return ME;
    }
    return { id: ME.id, name: name, initials: initials(name), color: ME.color };
  }

  const ATHLETES = [
    {
      id: "athlete-maya-chen",
      name: "Maya Chen",
      location: "Portland, OR",
      bio: "Trail runner training for her first 50K. Never met a hill she didn't like.",
      color: "#05603a"
    },
    {
      id: "athlete-jordan-reyes",
      name: "Jordan Reyes",
      location: "Austin, TX",
      bio: "Marathoner chasing a sub-3:30. Tempo on Tuesdays, long runs on Sundays.",
      color: "#1746a2"
    },
    {
      id: "athlete-priya-patel",
      name: "Priya Patel",
      location: "Chicago, IL",
      bio: "Lakefront regular who coaches a beginner group on Saturday mornings.",
      color: "#6941c6"
    },
    {
      id: "athlete-sam-okafor",
      name: "Sam Okafor",
      location: "Denver, CO",
      bio: "Back from a knee injury and rebuilding mileage one easy run at a time.",
      color: "#b54708"
    },
    {
      id: "athlete-lena-novak",
      name: "Lena Novak",
      location: "Boston, MA",
      bio: "Track nerd. Intervals by the harbor, coffee after every single run.",
      color: "#0e7090"
    }
  ];

  // Same shape as saved runs (see storage.js) plus athleteId and baseLikes,
  // the number of likes from other (pretend) community members.
  const SAMPLE_ACTIVITIES = [
    { id: "sample-maya-1", athleteId: "athlete-maya-chen", date: "2026-11-19", distanceMiles: 6.2, durationSeconds: 3906, title: "Forest Park hill repeats", notes: "Six climbs up Leif Erikson. Legs are toast.", createdAt: "2026-11-19T15:10:00.000Z", baseLikes: 14 },
    { id: "sample-maya-2", athleteId: "athlete-maya-chen", date: "2026-11-15", distanceMiles: 13.1, durationSeconds: 8490, title: "Long trail run", notes: "Muddy, cold, perfect.", createdAt: "2026-11-15T19:30:00.000Z", baseLikes: 22 },
    { id: "sample-maya-3", athleteId: "athlete-maya-chen", date: "2026-11-11", distanceMiles: 3, durationSeconds: 1935, title: "Recovery shuffle", notes: "", createdAt: "2026-11-11T14:00:00.000Z", baseLikes: 5 },
    { id: "sample-jordan-1", athleteId: "athlete-jordan-reyes", date: "2026-11-17", distanceMiles: 7, durationSeconds: 3108, title: "Tempo Tuesday", notes: "3 mi warmup, 3 at 7:05, 1 mi cooldown.", createdAt: "2026-11-17T12:45:00.000Z", baseLikes: 18 },
    { id: "sample-jordan-2", athleteId: "athlete-jordan-reyes", date: "2026-11-15", distanceMiles: 16, durationSeconds: 7920, title: "Sunday long run", notes: "Three loops around the lake. Fueled every 4 miles.", createdAt: "2026-11-15T16:20:00.000Z", baseLikes: 31 },
    { id: "sample-jordan-3", athleteId: "athlete-jordan-reyes", date: "2026-11-12", distanceMiles: 5, durationSeconds: 2650, title: "Easy miles", notes: "", createdAt: "2026-11-12T23:05:00.000Z", baseLikes: 9 },
    { id: "sample-priya-1", athleteId: "athlete-priya-patel", date: "2026-11-19", distanceMiles: 5.5, durationSeconds: 2970, title: "Lakefront sunrise", notes: "Windy on the way out, flying on the way back.", createdAt: "2026-11-19T13:15:00.000Z", baseLikes: 12 },
    { id: "sample-priya-2", athleteId: "athlete-priya-patel", date: "2026-11-14", distanceMiles: 4, durationSeconds: 2400, title: "Saturday group run", notes: "Coached the beginner group through their first 4-miler!", createdAt: "2026-11-14T16:00:00.000Z", baseLikes: 27 },
    { id: "sample-priya-3", athleteId: "athlete-priya-patel", date: "2026-11-10", distanceMiles: 4.5, durationSeconds: 2295, title: "Fartlek", notes: "", createdAt: "2026-11-10T22:40:00.000Z", baseLikes: 7 },
    { id: "sample-sam-1", athleteId: "athlete-sam-okafor", date: "2026-11-18", distanceMiles: 3, durationSeconds: 2025, title: "Easy 3, no pain", notes: "First run over 30 minutes since the injury.", createdAt: "2026-11-18T01:30:00.000Z", baseLikes: 40 },
    { id: "sample-sam-2", athleteId: "athlete-sam-okafor", date: "2026-11-13", distanceMiles: 2.5, durationSeconds: 1750, title: "Walk/run intervals", notes: "", createdAt: "2026-11-13T23:50:00.000Z", baseLikes: 11 },
    { id: "sample-lena-1", athleteId: "athlete-lena-novak", date: "2026-11-17", distanceMiles: 5, durationSeconds: 2240, title: "Track: 8 x 400m", notes: "Splits between 82 and 85 seconds. Coffee earned.", createdAt: "2026-11-17T22:00:00.000Z", baseLikes: 16 },
    { id: "sample-lena-2", athleteId: "athlete-lena-novak", date: "2026-11-14", distanceMiles: 3.2, durationSeconds: 1600, title: "Shakeout", notes: "", createdAt: "2026-11-14T13:30:00.000Z", baseLikes: 4 },
    { id: "sample-lena-3", athleteId: "athlete-lena-novak", date: "2026-11-08", distanceMiles: 6.2, durationSeconds: 2697, title: "Harbor 10K race", notes: "New personal record!", createdAt: "2026-11-08T17:10:00.000Z", baseLikes: 48 }
  ];

  ATHLETES.forEach(function (athlete) {
    athlete.initials = initials(athlete.name);
    Object.freeze(athlete);
  });
  SAMPLE_ACTIVITIES.forEach(Object.freeze);
  Object.freeze(ME);

  function initials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map(function (part) {
      return part.charAt(0).toUpperCase();
    }).join("");
  }

  // Lowercase, trim, and collapse runs of whitespace so "  san   DIEGO "
  // matches "San Diego".
  function normalize(text) {
    return String(text).trim().replace(/\s+/g, " ").toLowerCase();
  }

  function getAthlete(id) {
    for (let i = 0; i < ATHLETES.length; i += 1) {
      if (ATHLETES[i].id === id) {
        return ATHLETES[i];
      }
    }
    return null;
  }

  function isString(value) {
    return typeof value === "string";
  }

  // Reads a saved id list. Nothing saved yet counts as an empty list.
  // status: "ok" | "invalid" | "unavailable"; ids is always an array.
  function readIdList(key) {
    const result = PaceTrack.readJSON(key);
    if (result.status === "missing") {
      return { status: "ok", ids: [] };
    }
    if (result.status === "ok" && Array.isArray(result.value)) {
      return { status: "ok", ids: result.value.filter(isString) };
    }
    return { status: result.status === "ok" ? "invalid" : result.status, ids: [] };
  }

  // Adds or removes one id. Re-reads storage first so changes from another
  // tab are kept, and leaves every other stored entry untouched. Throws if
  // the stored value is unreadable (error.code === "invalid") so it is never
  // overwritten by accident, or if the browser refuses to save.
  function setInList(key, id, include) {
    const raw = localStorage.getItem(key);
    let list = [];
    if (raw !== null) {
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (error) {
        parsed = null;
      }
      if (!Array.isArray(parsed)) {
        const invalid = new Error("Stored data for " + key + " is not a list.");
        invalid.code = "invalid";
        throw invalid;
      }
      list = parsed;
    }
    const next = list.filter(function (entry) {
      return entry !== id;
    });
    if (include) {
      next.push(id);
    }
    localStorage.setItem(key, JSON.stringify(next));
    return next.filter(isString);
  }

  // Saves the starter follows once. If they cannot be saved, nothing is
  // shown as followed, which matches what is actually stored.
  function initFollows() {
    if (PaceTrack.readJSON(FOLLOWS_KEY).status === "missing") {
      try {
        localStorage.setItem(FOLLOWS_KEY, JSON.stringify(DEFAULT_FOLLOWS));
      } catch (error) {
        // Reported by the page when it reads or writes follows.
      }
    }
  }

  // Replaces an unreadable list with an empty one. Only called after the
  // user confirms. Throws if the browser refuses to save.
  function resetList(key) {
    localStorage.setItem(key, JSON.stringify([]));
  }

  // Totals for one athlete's sample runs.
  function athleteStats(athleteId) {
    const runs = SAMPLE_ACTIVITIES.filter(function (activity) {
      return activity.athleteId === athleteId;
    });
    let distance = 0;
    let seconds = 0;
    let latest = "";
    runs.forEach(function (run) {
      distance += run.distanceMiles;
      seconds += run.durationSeconds;
      if (run.date > latest) {
        latest = run.date;
      }
    });
    return {
      runCount: runs.length,
      totalDistance: distance,
      paceSecondsPerMile: PaceTrack.paceSecondsPerMile(seconds, distance),
      latestDate: latest
    };
  }

  // A sentence explaining a storage problem, or "" when there is none.
  function describeProblem(status, what) {
    if (status === "unavailable") {
      return "Your browser is blocking storage, so " + what +
        " can't be loaded or saved. Check that cookies and site data are allowed, then reload.";
    }
    if (status === "invalid") {
      return "Your saved " + what + " couldn't be read because the stored data is damaged. " +
        "Changes are turned off so that data isn't overwritten.";
    }
    return "";
  }

  // Builds a warning box. When onReset is given, adds a button that clears
  // the damaged data after the user confirms.
  function buildNotice(message, resetLabel, onReset) {
    const notice = document.createElement("div");
    notice.className = "notice";
    const text = document.createElement("p");
    text.textContent = message;
    notice.appendChild(text);
    if (onReset) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button button-secondary";
      button.textContent = resetLabel;
      button.addEventListener("click", onReset);
      notice.appendChild(button);
    }
    return notice;
  }

  return {
    FOLLOWS_KEY: FOLLOWS_KEY,
    LIKES_KEY: LIKES_KEY,
    ME: ME,
    me: me,
    athletes: ATHLETES,
    sampleActivities: SAMPLE_ACTIVITIES,
    getAthlete: getAthlete,
    initials: initials,
    normalize: normalize,
    initFollows: initFollows,
    loadFollows: function () {
      return readIdList(FOLLOWS_KEY);
    },
    loadLikes: function () {
      return readIdList(LIKES_KEY);
    },
    setFollowing: function (athleteId, follow) {
      return setInList(FOLLOWS_KEY, athleteId, follow);
    },
    setLiked: function (activityId, liked) {
      return setInList(LIKES_KEY, activityId, liked);
    },
    resetList: resetList,
    athleteStats: athleteStats,
    describeProblem: describeProblem,
    buildNotice: buildNotice
  };
})();
