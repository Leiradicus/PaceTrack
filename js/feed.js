/* Feed page: your runs plus sample community activity, with filters and likes. */
(function () {
  const list = document.getElementById("feed-list");
  if (!list) {
    return;
  }

  const Community = PaceTrackCommunity;
  const emptyPanel = document.getElementById("feed-empty");
  const statusEl = document.getElementById("feed-status");
  const alertEl = document.getElementById("feed-alert");
  const noticesEl = document.getElementById("data-notices");
  const filterInputs = Array.prototype.slice.call(
    document.querySelectorAll('input[name="feed-filter"]')
  );

  const FILTER_LABELS = {
    all: "All Activity",
    following: "Following",
    mine: "My Runs"
  };

  let follows = { status: "ok", ids: [] };
  let likes = { status: "ok", ids: [] };
  let runsInfo = { status: "ok", skipped: 0 };
  let currentMe = Community.ME;

  function currentFilter() {
    for (let i = 0; i < filterInputs.length; i += 1) {
      if (filterInputs[i].checked) {
        return filterInputs[i].value;
      }
    }
    return "all";
  }

  // Your saved runs as feed activities. Older runs without their own id
  // fall back to their date in loadRuns(), so repeats get a numbered suffix
  // to keep each activity id unique and stable.
  function myActivities() {
    const seen = {};
    return PaceTrack.loadRuns().map(function (run) {
      let id = "run:" + run.id;
      if (seen[id]) {
        seen[id] += 1;
        id = id + "~" + seen[id];
      } else {
        seen[id] = 1;
      }
      return {
        id: id,
        athleteId: Community.ME.id,
        date: run.date,
        distanceMiles: run.distanceMiles,
        durationSeconds: run.durationSeconds,
        title: run.title,
        notes: run.notes,
        createdAt: run.createdAt,
        baseLikes: 0
      };
    });
  }

  function showAlert(message) {
    alertEl.textContent = message;
    alertEl.classList.add("is-error");
  }

  function clearAlert() {
    alertEl.textContent = "";
    alertEl.classList.remove("is-error");
  }

  function likeCountText(count) {
    return count === 1 ? "1 like" : count + " likes";
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

  function setLikeButton(button, countEl, liked) {
    button.setAttribute("aria-pressed", liked ? "true" : "false");
    button.querySelector(".toggle-text").textContent = liked ? "Liked" : "Like";
    const base = Number(button.getAttribute("data-base-likes"));
    countEl.textContent = likeCountText(base + (liked ? 1 : 0));
  }

  // Every name, title, and note is set with textContent.
  function buildCard(activity, index, likedIds) {
    const isMe = activity.athleteId === Community.ME.id;
    const person = isMe ? currentMe : Community.getAthlete(activity.athleteId);
    const title = activity.title || "Run";
    const dateText = PaceTrack.formatDate(activity.date);

    const item = document.createElement("li");
    const card = document.createElement("article");
    card.className = "activity-card";
    const titleId = "activity-title-" + index;
    card.setAttribute("aria-labelledby", titleId);

    // Who and when
    const header = document.createElement("div");
    header.className = "activity-header";

    const avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.style.backgroundColor = person.color;
    avatar.textContent = person.initials;
    header.appendChild(avatar);

    const meta = document.createElement("div");
    meta.className = "activity-meta";
    const name = document.createElement("p");
    name.className = "activity-name";
    const strong = document.createElement("strong");
    strong.textContent = person.name;
    name.appendChild(strong);
    const badge = document.createElement("span");
    badge.className = isMe ? "badge badge-me" : "badge badge-sample";
    badge.textContent = isMe ? "Your run" : "Sample";
    name.appendChild(document.createTextNode(" "));
    name.appendChild(badge);
    meta.appendChild(name);

    const when = document.createElement("p");
    when.className = "activity-date";
    const time = document.createElement("time");
    time.dateTime = activity.date;
    time.textContent = dateText;
    when.appendChild(time);
    meta.appendChild(when);
    header.appendChild(meta);
    card.appendChild(header);

    // What
    const heading = document.createElement("h3");
    heading.className = "activity-title";
    heading.id = titleId;
    heading.textContent = title;
    card.appendChild(heading);

    const stats = document.createElement("dl");
    stats.className = "run-stats";
    addStat(stats, "Distance", PaceTrack.formatDistance(activity.distanceMiles));
    addStat(stats, "Duration", PaceTrack.formatDuration(activity.durationSeconds));
    addStat(stats, "Pace", PaceTrack.formatPace(
      PaceTrack.paceSecondsPerMile(activity.durationSeconds, activity.distanceMiles)
    ));
    card.appendChild(stats);

    if (activity.notes) {
      const notes = document.createElement("p");
      notes.className = "run-item-notes";
      notes.textContent = activity.notes;
      card.appendChild(notes);
    }

    // Like
    const actions = document.createElement("div");
    actions.className = "activity-actions";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "button-toggle";
    button.setAttribute("data-activity-id", activity.id);
    button.setAttribute("data-base-likes", String(activity.baseLikes));
    const visibleText = document.createElement("span");
    visibleText.className = "toggle-text";
    button.appendChild(visibleText);
    const hiddenText = document.createElement("span");
    hiddenText.className = "visually-hidden";
    hiddenText.textContent = " " + (isMe ? "your" : person.name + "'s") + " run: " + title + ", " + dateText;
    button.appendChild(hiddenText);

    const count = document.createElement("span");
    count.className = "like-count";
    count.id = "like-count-" + index;
    button.setAttribute("aria-describedby", count.id);

    if (likes.status !== "ok") {
      button.disabled = true;
    }
    button.addEventListener("click", onLikeClick);

    setLikeButton(button, count, likedIds.indexOf(activity.id) !== -1);
    actions.appendChild(button);
    actions.appendChild(count);
    card.appendChild(actions);

    item.appendChild(card);
    return item;
  }

  function onLikeClick(event) {
    const button = event.currentTarget;
    const id = button.getAttribute("data-activity-id");
    const count = document.getElementById(button.getAttribute("aria-describedby"));
    const wantLiked = button.getAttribute("aria-pressed") !== "true";

    try {
      likes = { status: "ok", ids: Community.setLiked(id, wantLiked) };
    } catch (error) {
      // Nothing was saved, so the button keeps its previous state.
      if (error && error.code === "invalid") {
        showAlert("Your like wasn't saved because the saved likes are damaged. See the message at the top of the page.");
        likes = Community.loadLikes();
        renderNotices();
      } else {
        showAlert("Your like couldn't be saved. Your browser may be blocking or out of storage. Nothing was changed — please try again.");
      }
      return;
    }

    clearAlert();
    setLikeButton(button, count, likes.ids.indexOf(id) !== -1);
  }

  function renderEmpty(filter, ownCount) {
    emptyPanel.replaceChildren();
    const message = document.createElement("p");
    const links = document.createElement("p");

    function addLink(href, text) {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = text;
      if (links.childNodes.length) {
        links.appendChild(document.createTextNode(" · "));
      }
      links.appendChild(link);
    }

    if (filter === "mine") {
      const runsBroken = runsInfo.status === "invalid" || runsInfo.status === "unavailable";
      message.textContent = runsBroken
        ? "Your saved runs can't be shown right now. See the message at the top of the page."
        : "You haven't logged any runs yet. Runs you save on the Log Run page will show up here.";
      addLink("tracker.html", "Log your first run");
    } else if (filter === "following") {
      if (follows.status !== "ok") {
        message.textContent = "Your follows can't be loaded, and you haven't logged any runs yet.";
      } else if (follows.ids.length === 0 && ownCount === 0) {
        message.textContent = "Nothing here yet. Following shows your runs plus runs from athletes you follow — you aren't following anyone and haven't logged a run.";
      } else {
        message.textContent = "The athletes you follow haven't posted any runs, and you haven't logged any yet.";
      }
      addLink("athletes.html", "Find athletes to follow");
      addLink("tracker.html", "Log a run");
    } else {
      message.textContent = "No activity yet.";
      addLink("tracker.html", "Log your first run");
    }

    emptyPanel.appendChild(message);
    emptyPanel.appendChild(links);
  }

  function renderNotices() {
    noticesEl.replaceChildren();

    if (runsInfo.status === "invalid") {
      noticesEl.appendChild(Community.buildNotice(
        "Your saved runs couldn't be read because the stored data is damaged, so they aren't shown here. " +
        "Nothing has been changed or deleted."
      ));
    } else if (runsInfo.status === "unavailable") {
      noticesEl.appendChild(Community.buildNotice(Community.describeProblem("unavailable", "your runs, likes, and follows")));
      return;
    } else if (runsInfo.skipped > 0) {
      noticesEl.appendChild(Community.buildNotice(
        runsInfo.skipped + (runsInfo.skipped === 1 ? " saved run was" : " saved runs were") +
        " skipped because a date, distance, or duration is missing or invalid."
      ));
    }

    [
      { state: likes, what: "likes", key: Community.LIKES_KEY },
      { state: follows, what: "follows", key: Community.FOLLOWS_KEY }
    ].forEach(function (entry) {
      const message = Community.describeProblem(entry.state.status, entry.what);
      if (!message) {
        return;
      }
      const canReset = entry.state.status === "invalid";
      noticesEl.appendChild(Community.buildNotice(
        message,
        "Clear saved " + entry.what,
        canReset ? function () { resetData(entry.key, entry.what); } : null
      ));
    });
  }

  function resetData(key, what) {
    if (!window.confirm("Clear all saved " + what + "? This can't be undone.")) {
      return;
    }
    try {
      Community.resetList(key);
    } catch (error) {
      showAlert("Your saved " + what + " couldn't be cleared. Your browser may be blocking storage.");
      return;
    }
    clearAlert();
    render();
  }

  function render() {
    follows = Community.loadFollows();
    likes = Community.loadLikes();
    runsInfo = PaceTrack.inspectRuns();
    currentMe = Community.me();
    renderNotices();

    const filter = currentFilter();
    const mine = myActivities();
    const followed = follows.ids;

    let activities;
    if (filter === "mine") {
      activities = mine;
    } else if (filter === "following") {
      activities = mine.concat(Community.sampleActivities.filter(function (activity) {
        return followed.indexOf(activity.athleteId) !== -1;
      }));
    } else {
      activities = mine.concat(Community.sampleActivities);
    }
    activities = PaceTrack.sortNewestFirst(activities);

    list.replaceChildren();
    activities.forEach(function (activity, index) {
      list.appendChild(buildCard(activity, index, likes.ids));
    });

    list.hidden = activities.length === 0;
    emptyPanel.hidden = activities.length > 0;
    if (activities.length === 0) {
      renderEmpty(filter, mine.length);
    }

    const noun = activities.length === 1 ? " activity" : " activities";
    statusEl.textContent = "Showing " + activities.length + noun + " in " + FILTER_LABELS[filter] + ".";
  }

  filterInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      clearAlert();
      render();
    });
  });

  // Stay in sync with runs, likes, and follows changed in another tab.
  window.addEventListener("storage", function (event) {
    if (event.key === null || event.key === PaceTrack.RUNS_KEY || event.key === PaceTrack.PROFILE_KEY ||
        event.key === Community.LIKES_KEY || event.key === Community.FOLLOWS_KEY) {
      render();
    }
  });

  Community.initFollows();
  render();
})();
