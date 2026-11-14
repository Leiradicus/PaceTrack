/* Home / Profile page: builds the dashboard from saved runs. */
(function () {
  const dashboard = document.getElementById("dashboard");
  const emptyState = document.getElementById("empty-state");
  if (!dashboard || !emptyState) {
    return;
  }

  function setText(id, text) {
    document.getElementById(id).textContent = text;
  }

  function runLabel(run) {
    return run.title ? run.title + ", " + PaceTrack.formatDate(run.date) : PaceTrack.formatDate(run.date);
  }

  function render() {
    const runs = PaceTrack.loadRuns();

    if (runs.length === 0) {
      emptyState.hidden = false;
      dashboard.hidden = true;
      return;
    }
    emptyState.hidden = true;
    dashboard.hidden = false;

    // Totals
    let totalDistance = 0;
    let totalSeconds = 0;
    runs.forEach(function (run) {
      totalDistance += run.distanceMiles;
      totalSeconds += run.durationSeconds;
    });

    setText("stat-total-runs", String(runs.length));
    setText("stat-total-distance", PaceTrack.formatDistance(totalDistance));
    // Overall pace = total time / total distance (not an average of paces).
    setText("stat-average-pace", PaceTrack.formatPace(
      PaceTrack.paceSecondsPerMile(totalSeconds, totalDistance)
    ));

    // Personal records. On a tie, the earlier run keeps the record.
    const byDate = runs.slice().sort(function (a, b) {
      return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    });
    let longest = byDate[0];
    let fastest = byDate[0];
    byDate.forEach(function (run) {
      if (run.distanceMiles > longest.distanceMiles) {
        longest = run;
      }
      if (run.durationSeconds / run.distanceMiles < fastest.durationSeconds / fastest.distanceMiles) {
        fastest = run;
      }
    });

    setText("record-longest", PaceTrack.formatDistance(longest.distanceMiles));
    setText("record-longest-detail", runLabel(longest));
    setText("record-fastest", PaceTrack.formatPace(
      PaceTrack.paceSecondsPerMile(fastest.durationSeconds, fastest.distanceMiles)
    ));
    setText("record-fastest-detail",
      PaceTrack.formatDistance(fastest.distanceMiles) + " · " + runLabel(fastest));

    // Five most recent runs
    const tbody = document.getElementById("recent-runs");
    tbody.replaceChildren();
    PaceTrack.sortNewestFirst(runs).slice(0, 5).forEach(function (run) {
      const row = document.createElement("tr");
      [
        PaceTrack.formatDate(run.date),
        run.title || "Run",
        PaceTrack.formatDistance(run.distanceMiles),
        PaceTrack.formatDuration(run.durationSeconds),
        PaceTrack.formatPace(PaceTrack.paceSecondsPerMile(run.durationSeconds, run.distanceMiles))
      ].forEach(function (value, index) {
        const cell = document.createElement("td");
        cell.textContent = value; // user text goes through textContent only
        cell.setAttribute("data-label", ["Date", "Run", "Distance", "Duration", "Pace"][index]);
        row.appendChild(cell);
      });
      tbody.appendChild(row);
    });
  }

  // Refresh if a run is saved in another tab.
  window.addEventListener("storage", function (event) {
    if (event.key === PaceTrack.RUNS_KEY || event.key === null) {
      render();
    }
  });

  render();
})();
