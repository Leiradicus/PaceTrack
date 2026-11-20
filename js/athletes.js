/* Athletes page: sample athlete cards with search, a Following filter, and follow buttons. */
(function () {
  const list = document.getElementById("athlete-list");
  if (!list) {
    return;
  }

  const Community = PaceTrackCommunity;
  const form = document.getElementById("athlete-search-form");
  const searchInput = document.getElementById("athlete-search");
  const heading = document.getElementById("athletes-heading");
  const emptyPanel = document.getElementById("athlete-empty");
  const statusEl = document.getElementById("athlete-status");
  const alertEl = document.getElementById("athlete-alert");
  const noticesEl = document.getElementById("data-notices");
  const filterInputs = Array.prototype.slice.call(
    document.querySelectorAll('input[name="athlete-filter"]')
  );

  let follows = { status: "ok", ids: [] };

  function currentFilter() {
    for (let i = 0; i < filterInputs.length; i += 1) {
      if (filterInputs[i].checked) {
        return filterInputs[i].value;
      }
    }
    return "all";
  }

  function setFilter(value) {
    filterInputs.forEach(function (input) {
      input.checked = input.value === value;
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

  function isFollowing(athleteId) {
    return follows.ids.indexOf(athleteId) !== -1;
  }

  function setFollowButton(button, following) {
    button.setAttribute("aria-pressed", following ? "true" : "false");
    button.querySelector(".toggle-text").textContent = following ? "Following" : "Follow";
  }

  function buildCard(athlete) {
    const stats = Community.athleteStats(athlete.id);

    const item = document.createElement("li");
    item.className = "athlete-card";

    const header = document.createElement("div");
    header.className = "athlete-header";
    const avatar = document.createElement("span");
    avatar.className = "avatar avatar-large";
    avatar.setAttribute("aria-hidden", "true");
    avatar.style.backgroundColor = athlete.color;
    avatar.textContent = athlete.initials;
    header.appendChild(avatar);

    const identity = document.createElement("div");
    const name = document.createElement("h3");
    name.className = "athlete-name";
    name.textContent = athlete.name;
    identity.appendChild(name);
    const location = document.createElement("p");
    location.className = "athlete-location";
    location.textContent = athlete.location;
    identity.appendChild(location);
    header.appendChild(identity);
    item.appendChild(header);

    const badge = document.createElement("p");
    badge.className = "athlete-badge";
    const badgeText = document.createElement("span");
    badgeText.className = "badge badge-sample";
    badgeText.textContent = "Sample profile";
    badge.appendChild(badgeText);
    item.appendChild(badge);

    const bio = document.createElement("p");
    bio.className = "athlete-bio";
    bio.textContent = athlete.bio;
    item.appendChild(bio);

    const statList = document.createElement("dl");
    statList.className = "run-stats";
    addStat(statList, "Runs", String(stats.runCount));
    addStat(statList, "Distance", PaceTrack.formatDistance(stats.totalDistance));
    addStat(statList, "Avg pace", PaceTrack.formatPace(stats.paceSecondsPerMile));
    addStat(statList, "Latest run", stats.latestDate ? PaceTrack.formatDate(stats.latestDate) : "—");
    item.appendChild(statList);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "button-toggle athlete-follow";
    button.setAttribute("data-athlete-id", athlete.id);
    const visibleText = document.createElement("span");
    visibleText.className = "toggle-text";
    button.appendChild(visibleText);
    const hiddenText = document.createElement("span");
    hiddenText.className = "visually-hidden";
    hiddenText.textContent = " " + athlete.name;
    button.appendChild(hiddenText);
    if (follows.status !== "ok") {
      button.disabled = true;
    }
    setFollowButton(button, isFollowing(athlete.id));
    button.addEventListener("click", onFollowClick);
    item.appendChild(button);

    return item;
  }

  function onFollowClick(event) {
    const button = event.currentTarget;
    const athleteId = button.getAttribute("data-athlete-id");
    const athlete = Community.getAthlete(athleteId);
    const wantFollow = button.getAttribute("aria-pressed") !== "true";

    try {
      follows = { status: "ok", ids: Community.setFollowing(athleteId, wantFollow) };
    } catch (error) {
      // Nothing was saved, so the button keeps its previous state.
      if (error && error.code === "invalid") {
        showAlert("That change wasn't saved because your saved follows are damaged. See the message at the top of the page.");
        follows = Community.loadFollows();
        renderNotices();
      } else {
        showAlert("Couldn't " + (wantFollow ? "follow " : "unfollow ") + athlete.name +
          ". Your browser may be blocking or out of storage. Nothing was changed — please try again.");
      }
      return;
    }

    clearAlert();

    // In the Following view an unfollowed athlete disappears, so redraw and
    // move focus to the next card (or the heading if none are left).
    if (!wantFollow && currentFilter() === "following") {
      const buttons = Array.prototype.slice.call(list.querySelectorAll(".athlete-follow"));
      const position = buttons.indexOf(button);
      render();
      const remaining = list.querySelectorAll(".athlete-follow");
      if (remaining.length) {
        remaining[Math.min(position, remaining.length - 1)].focus();
      } else {
        heading.focus();
      }
      return;
    }

    setFollowButton(button, isFollowing(athleteId));
    updateStatus(list.children.length);
  }

  function updateStatus(shown) {
    const total = Community.athletes.length;
    let text = shown === total
      ? "Showing all " + total + " athletes."
      : "Showing " + shown + " of " + total + " athletes.";
    if (follows.status === "ok") {
      text += " You follow " + follows.ids.filter(function (id) {
        return Community.getAthlete(id) !== null;
      }).length + ".";
    }
    statusEl.textContent = text;
  }

  function renderEmpty(filter, query, rawQuery) {
    emptyPanel.replaceChildren();
    const message = document.createElement("p");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button button-secondary";

    if (filter === "following" && !query) {
      message.textContent = follows.status === "ok"
        ? "You aren't following anyone yet. Follow athletes to see their runs in your Following feed."
        : "Your follows can't be shown right now. See the message at the top of the page.";
      button.textContent = "Show all athletes";
      button.addEventListener("click", function () {
        setFilter("all");
        render();
        filterInputs[0].focus();
      });
    } else {
      message.textContent = (filter === "following"
        ? "None of the athletes you follow match “"
        : "No athletes match “") + rawQuery.trim().replace(/\s+/g, " ") +
        "”. Try a different name or city.";
      button.textContent = "Clear search";
      button.addEventListener("click", function () {
        searchInput.value = "";
        render();
        searchInput.focus();
      });
    }

    emptyPanel.appendChild(message);
    emptyPanel.appendChild(button);
  }

  function renderNotices() {
    noticesEl.replaceChildren();
    const message = Community.describeProblem(follows.status, "follows");
    if (!message) {
      return;
    }
    noticesEl.appendChild(Community.buildNotice(
      message,
      "Clear saved follows",
      follows.status === "invalid" ? resetFollows : null
    ));
  }

  function resetFollows() {
    if (!window.confirm("Clear all saved follows? This can't be undone.")) {
      return;
    }
    try {
      Community.resetList(Community.FOLLOWS_KEY);
    } catch (error) {
      showAlert("Your saved follows couldn't be cleared. Your browser may be blocking storage.");
      return;
    }
    clearAlert();
    render();
  }

  function render() {
    follows = Community.loadFollows();
    renderNotices();

    const filter = currentFilter();
    const rawQuery = searchInput.value;
    const query = Community.normalize(rawQuery);

    const matches = Community.athletes.filter(function (athlete) {
      if (filter === "following" && !isFollowing(athlete.id)) {
        return false;
      }
      if (!query) {
        return true;
      }
      return Community.normalize(athlete.name).indexOf(query) !== -1 ||
        Community.normalize(athlete.location).indexOf(query) !== -1;
    });

    list.replaceChildren();
    matches.forEach(function (athlete) {
      list.appendChild(buildCard(athlete));
    });

    list.hidden = matches.length === 0;
    emptyPanel.hidden = matches.length > 0;
    if (matches.length === 0) {
      renderEmpty(filter, query, rawQuery);
    }
    updateStatus(matches.length);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    render();
  });
  searchInput.addEventListener("input", render);
  filterInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      clearAlert();
      render();
    });
  });

  // Stay in sync with follows changed in another tab.
  window.addEventListener("storage", function (event) {
    if (event.key === null || event.key === Community.FOLLOWS_KEY) {
      render();
    }
  });

  Community.initFollows();
  render();
})();
