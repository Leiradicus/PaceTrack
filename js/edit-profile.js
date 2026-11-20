/*
 * Edit Profile page: change your display name and delete logged runs.
 * Adding a run is handled by tracker.js, which this page also loads; it
 * fires "pacetrack:runs-changed" after each save so the list below updates.
 */
(function () {
  const nameForm = document.getElementById("name-form");
  const list = document.getElementById("manage-list");
  if (!nameForm || !list) {
    return;
  }

  const nameInput = document.getElementById("profile-name");
  const nameStatus = document.getElementById("name-status");
  const nameAlert = document.getElementById("name-alert");
  const noticesEl = document.getElementById("data-notices");
  const heading = document.getElementById("manage-heading");
  const emptyEl = document.getElementById("manage-empty");
  const statusEl = document.getElementById("manage-status");
  const alertEl = document.getElementById("manage-alert");

  let profileStatus = "ok";
  let runsInfo = { status: "ok", skipped: 0 };

  function setMessage(element, className, message) {
    element.textContent = message;
    element.classList.toggle(className, Boolean(message));
  }

  function plural(count, word) {
    return count + " " + word + (count === 1 ? "" : "s");
  }

  // ---------- Notices about unreadable data ----------

  function addNotice(message) {
    const notice = document.createElement("div");
    notice.className = "notice";
    const text = document.createElement("p");
    text.textContent = message;
    notice.appendChild(text);
    noticesEl.appendChild(notice);
  }

  function renderNotices() {
    noticesEl.replaceChildren();
    if (runsInfo.status === "unavailable") {
      addNotice("Your browser is blocking storage, so your profile and runs can't be loaded or saved. " +
        "Check that cookies and site data are allowed, then reload.");
      return;
    }
    if (profileStatus === "invalid") {
      addNotice("Your saved profile couldn't be read because the stored data is damaged. " +
        "Saving a name below will replace it.");
    }
    if (runsInfo.status === "invalid") {
      addNotice("Your saved runs couldn't be read because the stored data is damaged, so they can't be " +
        "listed or deleted here. Nothing has been changed.");
    } else if (runsInfo.skipped > 0) {
      addNotice(plural(runsInfo.skipped, "saved run") + (runsInfo.skipped === 1 ? " is" : " are") +
        " hidden because a date, distance, or duration is missing or invalid. " +
        (runsInfo.skipped === 1 ? "It is" : "They are") + " kept as-is.");
    }
  }

  // ---------- Display name ----------

  function loadName() {
    const profile = PaceTrack.loadProfile();
    profileStatus = profile.status;
    nameInput.value = profile.name;
  }

  nameForm.addEventListener("submit", function (event) {
    event.preventDefault();
    setMessage(nameStatus, "is-success", "");
    setMessage(nameAlert, "is-error", "");

    let saved;
    try {
      saved = PaceTrack.saveProfileName(nameInput.value);
    } catch (error) {
      // Leave what they typed in place so nothing has to be retyped.
      setMessage(nameAlert, "is-error",
        "Your name couldn't be saved. Your browser may be blocking or out of storage. " +
        "Your entry is still in the box — please try again.");
      return;
    }

    nameInput.value = saved;
    profileStatus = "ok";
    renderNotices();
    setMessage(nameStatus, "is-success", saved
      ? "Name saved. Your runs will show as “" + saved + "”."
      : "Name cleared. Your runs will show as “You”.");
  });

  // ---------- Runs ----------

  function describeRun(run) {
    const details = PaceTrack.formatDate(run.date) + " (" + PaceTrack.formatDistance(run.distanceMiles) + ")";
    return run.title ? "“" + run.title + "” on " + details : "your run on " + details;
  }

  function addStat(listEl, label, value) {
    const wrapper = document.createElement("div");
    const term = document.createElement("dt");
    term.textContent = label;
    const detail = document.createElement("dd");
    detail.textContent = value;
    wrapper.appendChild(term);
    wrapper.appendChild(detail);
    listEl.appendChild(wrapper);
  }

  // All user-entered text is set with textContent.
  function buildItem(run, index) {
    const item = document.createElement("li");
    item.className = "run-item";

    const title = document.createElement("p");
    title.className = "run-item-title";
    title.textContent = run.title || "Run";
    item.appendChild(title);

    const date = document.createElement("p");
    date.className = "run-item-date";
    date.textContent = PaceTrack.formatDate(run.date);
    item.appendChild(date);

    const stats = document.createElement("dl");
    stats.className = "run-stats";
    addStat(stats, "Distance", PaceTrack.formatDistance(run.distanceMiles));
    addStat(stats, "Duration", PaceTrack.formatDuration(run.durationSeconds));
    addStat(stats, "Pace", PaceTrack.formatPace(
      PaceTrack.paceSecondsPerMile(run.durationSeconds, run.distanceMiles)
    ));
    item.appendChild(stats);

    if (run.notes) {
      const notes = document.createElement("p");
      notes.className = "run-item-notes";
      notes.textContent = run.notes;
      item.appendChild(notes);
    }

    const actions = document.createElement("div");
    actions.className = "run-item-actions";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button-danger";
    button.textContent = "Delete";
    const hidden = document.createElement("span");
    hidden.className = "visually-hidden";
    hidden.textContent = " " + (run.title || "run") + ", " + PaceTrack.formatDate(run.date);
    button.appendChild(hidden);
    button.addEventListener("click", function () {
      deleteRun(run, index);
    });
    actions.appendChild(button);
    item.appendChild(actions);

    return item;
  }

  // Redraws the list. message (optional) replaces the usual count in the
  // status line, e.g. to confirm a deletion.
  function renderRuns(message) {
    runsInfo = PaceTrack.inspectRuns();
    renderNotices();

    const runs = PaceTrack.sortNewestFirst(PaceTrack.loadRuns());
    list.replaceChildren();
    runs.forEach(function (run, index) {
      list.appendChild(buildItem(run, index));
    });

    const broken = runsInfo.status === "invalid" || runsInfo.status === "unavailable";
    list.hidden = runs.length === 0;
    emptyEl.hidden = runs.length > 0 || broken;

    let text = runs.length ? "You have " + plural(runs.length, "saved run") + "." : "";
    if (message) {
      text = message + (text ? " " + text : "");
    }
    statusEl.textContent = text;
  }

  // Keeps keyboard focus in the list after a card disappears.
  function focusNear(index) {
    const buttons = list.querySelectorAll(".button-danger");
    if (buttons.length) {
      buttons[Math.min(index, buttons.length - 1)].focus();
    } else {
      heading.focus();
    }
  }

  function deleteRun(run, index) {
    const label = describeRun(run);
    if (!window.confirm("Delete " + label + "? This can't be undone.")) {
      return;
    }
    setMessage(alertEl, "is-error", "");

    try {
      PaceTrack.deleteRun(run);
    } catch (error) {
      const code = error && error.code;
      if (code === "notfound") {
        renderRuns("That run was already removed, so the list has been refreshed.");
        focusNear(index);
      } else if (code === "invalid") {
        setMessage(alertEl, "is-error",
          "Nothing was deleted because your saved runs data is damaged. See the message at the top of the page.");
        renderRuns();
      } else {
        // Nothing was saved, so the list stays exactly as it was.
        setMessage(alertEl, "is-error",
          "The run couldn't be deleted. Your browser may be blocking storage. Nothing was changed — please try again.");
      }
      return;
    }

    renderRuns("Deleted " + label + ".");
    focusNear(index);
  }

  // A run added with the form on this page.
  document.addEventListener("pacetrack:runs-changed", function () {
    setMessage(alertEl, "is-error", "");
    renderRuns();
  });

  // Changes made in another tab.
  window.addEventListener("storage", function (event) {
    if (event.key === null || event.key === PaceTrack.RUNS_KEY) {
      renderRuns();
    }
    if ((event.key === null || event.key === PaceTrack.PROFILE_KEY) && document.activeElement !== nameInput) {
      loadName();
      renderNotices();
    }
  });

  loadName();
  renderRuns();
})();
