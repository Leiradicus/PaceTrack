/* Log Run page: validates the form, saves runs, and shows run history. */
(function () {
  const form = document.getElementById("run-form");
  if (!form) {
    return;
  }

  const dateInput = document.getElementById("run-date");
  const distanceInput = document.getElementById("run-distance");
  const hoursInput = document.getElementById("run-hours");
  const minutesInput = document.getElementById("run-minutes");
  const secondsInput = document.getElementById("run-seconds");
  const titleInput = document.getElementById("run-title");
  const notesInput = document.getElementById("run-notes");
  const durationFieldset = document.getElementById("run-duration");

  const dateError = document.getElementById("run-date-error");
  const distanceError = document.getElementById("run-distance-error");
  const durationError = document.getElementById("run-duration-error");

  const pacePreview = document.getElementById("pace-preview-value");
  const formStatus = document.getElementById("form-status");
  const formAlert = document.getElementById("form-alert");
  const historyList = document.getElementById("history-list");
  const historyEmpty = document.getElementById("history-empty");

  const durationInputs = [hoursInput, minutesInput, secondsInput];

  // Dates after today are not allowed in the date picker either.
  dateInput.max = PaceTrack.todayISO();
  dateInput.value = PaceTrack.todayISO();

  // Reads a duration part. Blank counts as 0. Returns NaN for anything that
  // is not a whole, non-negative number (e.g. "-1", "1.5", "abc").
  function readWholeNumber(input) {
    const text = input.value.trim();
    if (text === "") {
      // A number input whose text cannot be parsed reports "" but is invalid.
      return input.validity && input.validity.badInput ? NaN : 0;
    }
    const value = Number(text);
    if (!Number.isInteger(value) || value < 0) {
      return NaN;
    }
    return value;
  }

  function readDistance() {
    const text = distanceInput.value.trim();
    if (text === "") {
      return NaN;
    }
    return Number(text);
  }

  function setError(element, errorElement, message) {
    errorElement.textContent = message;
    if (message) {
      element.setAttribute("aria-invalid", "true");
    } else {
      element.removeAttribute("aria-invalid");
    }
  }

  function setDurationError(message) {
    durationError.textContent = message;
    durationInputs.forEach(function (input) {
      if (message) {
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", "run-duration-error");
      } else {
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
      }
    });
    durationFieldset.classList.toggle("has-error", Boolean(message));
  }

  // Validates every field, shows messages next to each one, and returns
  // either the cleaned run data or null.
  function validate() {
    let firstInvalid = null;

    // Date
    const date = dateInput.value;
    let dateMessage = "";
    if (!date) {
      dateMessage = "Enter the date of your run.";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      dateMessage = "Enter a valid date.";
    } else if (date > PaceTrack.todayISO()) {
      dateMessage = "The date cannot be in the future.";
    }
    setError(dateInput, dateError, dateMessage);
    if (dateMessage && !firstInvalid) {
      firstInvalid = dateInput;
    }

    // Distance
    const distance = readDistance();
    let distanceMessage = "";
    if (distanceInput.value.trim() === "" && !distanceInput.validity.badInput) {
      distanceMessage = "Enter the distance in miles.";
    } else if (!isFinite(distance)) {
      distanceMessage = "Distance must be a number, like 3 or 3.1.";
    } else if (distance <= 0) {
      distanceMessage = "Distance must be greater than 0 miles.";
    } else if (distance > 1000) {
      distanceMessage = "Distance must be 1000 miles or less.";
    }
    setError(distanceInput, distanceError, distanceMessage);
    if (distanceMessage && !firstInvalid) {
      firstInvalid = distanceInput;
    }

    // Duration
    const hours = readWholeNumber(hoursInput);
    const minutes = readWholeNumber(minutesInput);
    const seconds = readWholeNumber(secondsInput);
    let durationMessage = "";
    let durationFocus = hoursInput;
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      durationMessage = "Hours, minutes, and seconds must be whole numbers of 0 or more.";
      durationFocus = isNaN(hours) ? hoursInput : isNaN(minutes) ? minutesInput : secondsInput;
    } else if (minutes > 59 || seconds > 59) {
      durationMessage = "Minutes and seconds must be between 0 and 59.";
      durationFocus = minutes > 59 ? minutesInput : secondsInput;
    } else if (hours * 3600 + minutes * 60 + seconds <= 0) {
      durationMessage = "Total duration must be greater than 0.";
    }
    setDurationError(durationMessage);
    if (durationMessage && !firstInvalid) {
      firstInvalid = durationFocus;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return null;
    }

    return {
      date: date,
      distanceMiles: distance,
      durationSeconds: hours * 3600 + minutes * 60 + seconds,
      title: titleInput.value.trim(),
      notes: notesInput.value.trim()
    };
  }

  // Live pace preview while typing (no error messages here).
  function updatePacePreview() {
    const distance = readDistance();
    const h = readWholeNumber(hoursInput);
    const m = readWholeNumber(minutesInput);
    const s = readWholeNumber(secondsInput);
    const total = h * 3600 + m * 60 + s;
    const pace = isFinite(total) && distance > 0 ? PaceTrack.paceSecondsPerMile(total, distance) : null;
    pacePreview.textContent = PaceTrack.formatPace(pace);
  }

  function clearMessages() {
    formStatus.textContent = "";
    formStatus.classList.remove("is-success");
    formAlert.textContent = "";
    formAlert.classList.remove("is-error");
  }

  // The Edit Profile page reuses this form without a history list.
  function renderHistory() {
    if (!historyList || !historyEmpty) {
      return;
    }
    const runs = PaceTrack.sortNewestFirst(PaceTrack.loadRuns());
    historyList.replaceChildren();
    historyEmpty.hidden = runs.length > 0;

    runs.forEach(function (run) {
      historyList.appendChild(buildRunItem(run));
    });
  }

  // All user-entered text is set with textContent.
  function buildRunItem(run) {
    const item = document.createElement("li");
    item.className = "run-item";

    const heading = document.createElement("p");
    heading.className = "run-item-title";
    heading.textContent = run.title || "Run";
    item.appendChild(heading);

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

    return item;
  }

  function addStat(list, label, value) {
    const wrapper = document.createElement("div");
    const term = document.createElement("dt");
    term.textContent = label;
    const detail = document.createElement("dd");
    detail.textContent = value;
    wrapper.appendChild(term);
    wrapper.appendChild(detail);
    list.appendChild(wrapper);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearMessages();

    const run = validate();
    if (!run) {
      return;
    }

    let saved;
    try {
      saved = PaceTrack.addRun(run);
    } catch (error) {
      // Leave every form value in place so nothing has to be retyped.
      formAlert.textContent =
        "Your run could not be saved. Your browser may be blocking or out of storage. " +
        "Your entries are still in the form — please try again.";
      formAlert.classList.add("is-error");
      return;
    }

    const pace = PaceTrack.formatPace(
      PaceTrack.paceSecondsPerMile(saved.durationSeconds, saved.distanceMiles)
    );
    formStatus.textContent =
      "Run saved: " + PaceTrack.formatDistance(saved.distanceMiles) + " in " +
      PaceTrack.formatDuration(saved.durationSeconds) + " (" + pace + ").";
    formStatus.classList.add("is-success");

    form.reset();
    dateInput.value = PaceTrack.todayISO();
    updatePacePreview();
    renderHistory();
    // Lets other scripts on the page (Edit Profile) refresh their run lists.
    document.dispatchEvent(new CustomEvent("pacetrack:runs-changed"));
  });

  [distanceInput, hoursInput, minutesInput, secondsInput].forEach(function (input) {
    input.addEventListener("input", updatePacePreview);
  });

  // Keep the history in sync if a run is saved in another tab.
  window.addEventListener("storage", function (event) {
    if (event.key === PaceTrack.RUNS_KEY || event.key === null) {
      renderHistory();
    }
  });

  renderHistory();
  updatePacePreview();
})();
