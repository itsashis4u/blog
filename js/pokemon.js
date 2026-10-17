(function () {
  var roamer = document.querySelector(".pokemon-roamer");
  if (!roamer) return;
  var choices = ["pikachu", "bulbasaur", "charmander", "squirtle"];
  var buddies = {
    pikachu: { name: "Pikachu", move: "Pika pika! Thunder Shock!", greeting: "Pikachu is exploring. Click to say hello." },
    bulbasaur: { name: "Bulbasaur", move: "Bulba! Vine Whip!", greeting: "Bulbasaur found a good spot to read." },
    charmander: { name: "Charmander", move: "Char! Ember!", greeting: "Charmander is warming up to this adventure." },
    squirtle: { name: "Squirtle", move: "Squirtle! Bubble!", greeting: "Squirtle is making a splash." }
  };
  var current = "pikachu";
  try { var saved = localStorage.getItem("pokemon-companion"); if (choices.indexOf(saved) !== -1) current = saved; } catch (error) {}
  var sprite = roamer.querySelector(".roamer-sprite");
  var image = sprite.querySelector("img");
  var message = roamer.querySelector(".roamer-message");
  var pause = roamer.querySelector(".roamer-pause");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var paused = false, engaged = false, hideTimer, step = 0;
  var drag = null, suppressClick = false;
  var habitat = null, arrivalTimer, lastWander = Date.now();
  var profiles = {
    pikachu: { home: "grass", wait: 5000, mood: "spark" },
    bulbasaur: { home: "grass", wait: 16000, mood: "rest" },
    charmander: { home: "camp", wait: 10000, mood: "warm" },
    squirtle: { home: "pond", wait: 7000, mood: "splash" }
  };
  function bubblePosition() {
    var rect = roamer.getBoundingClientRect();
    roamer.classList.toggle("bubble-left", rect.left < 210);
    roamer.classList.toggle("bubble-below", rect.top < 140);
  }
  function mood(value) { roamer.dataset.mood = value || ""; }
  function habitatReaction(kind) {
    if (kind === "pond") {
      if (current === "squirtle") { mood("splash"); return "Squirtle used Bubble! This pond feels like home."; }
      if (current === "charmander") { mood("warm"); return "Charmander keeps its tail safely away from the water."; }
      return buddies[current].name + " watches the ripples from the shore.";
    }
    if (kind === "grass") {
      if (current === "bulbasaur") { mood("rest"); return "Bulbasaur settles into the grass. Just five more minutes…"; }
      if (current === "pikachu") { mood("spark"); return "Pikachu heard a rustle! Time to investigate."; }
      return buddies[current].name + " peeks through the tall grass.";
    }
    if (current === "charmander") { mood("warm"); return "Charmander tends the campfire. A perfect little reading light."; }
    mood("rest"); return buddies[current].name + " takes a quiet break by the campfire.";
  }
  function markHabitat(element) {
    document.querySelectorAll(".habitat").forEach(function (item) {
      item.classList.toggle("is-occupied", item === element);
      item.querySelector(".habitat-visitor").textContent = item === element ? buddies[current].name : "";
    });
  }
  function visit(element, announce) {
    clearTimeout(arrivalTimer);
    habitat = element.dataset.habitat;
    var scene = element.querySelector("svg").getBoundingClientRect();
    var x = Math.max(8, Math.min(window.innerWidth - roamer.offsetWidth - 8, scene.left + scene.width / 2 - 48));
    var y = Math.max(8, Math.min(window.innerHeight - roamer.offsetHeight - 8, scene.top + scene.height / 2 - 35));
    roamer.style.transition = "";
    roamer.style.left = x + "px";
    roamer.style.top = y + "px";
    roamer.classList.remove("faces-left");
    lastWander = Date.now();
    markHabitat(element);
    arrivalTimer = setTimeout(function () {
      bubblePosition();
      var line = habitatReaction(habitat);
      if (announce) say(line);
    }, reduced.matches ? 0 : 4600);
  }
  document.querySelectorAll(".habitat").forEach(function (element) {
    element.addEventListener("click", function () {
      paused = false;
      engaged = false;
      pause.setAttribute("aria-pressed", "false");
      pause.setAttribute("aria-label", "Pause Pokémon wandering");
      visit(element, true);
    });
  });

  function say(text) {
    clearTimeout(hideTimer);
    bubblePosition();
    message.textContent = text;
    roamer.classList.add("is-speaking");
    hideTimer = setTimeout(function () { roamer.classList.remove("is-speaking"); }, 3500);
  }
  function render(announce) {
    clearTimeout(arrivalTimer);
    roamer.dataset.personality = current;
    mood(profiles[current].mood);
    habitat = null;
    markHabitat(null);
    image.src = "/img/pokemon/" + current + ".png";
    sprite.setAttribute("aria-label", "Say hello to " + buddies[current].name);
    if (announce) say(buddies[current].greeting);
  }
  function place() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var size = roamer.offsetWidth;
    var narrow = width < 1100;
    // Wide screens: roam in the outer margin. Phones: stay in the bottom strip.
    var x, y;
    if (narrow) {
      x = step % 2 ? Math.max(8, width - size - 12) : 12;
      y = Math.max(100, height - roamer.offsetHeight - 12);
    } else {
      x = width - size - 12;
      y = Math.max(100, Math.min(height - roamer.offsetHeight - 16, height * (step % 2 ? .68 : .28)));
    }
    roamer.style.left = x + "px";
    roamer.style.top = y + "px";
    roamer.classList.toggle("faces-left", step % 2 === 1);
  }
  function freeze() {
    var position = roamer.getBoundingClientRect();
    roamer.style.transition = "none";
    roamer.style.left = position.left + "px";
    roamer.style.top = position.top + "px";
  }
  function release() { if (!paused && !engaged) roamer.style.transition = ""; }
  function wander() {
    if (paused || engaged || reduced.matches || document.hidden || Date.now() - lastWander < profiles[current].wait) return;
    lastWander = Date.now();
    var preferred = document.querySelector('[data-habitat="' + profiles[current].home + '"]');
    if (preferred) {
      var bounds = preferred.getBoundingClientRect();
      if (bounds.top > 80 && bounds.bottom < window.innerHeight - 20 && habitat !== profiles[current].home) { visit(preferred, false); return; }
    }
    if (habitat === profiles[current].home && current !== "pikachu") return;
    habitat = null;
    markHabitat(null);
    mood(profiles[current].mood);
    step += 1;
    place();
  }
  sprite.addEventListener("click", function () {
    if (suppressClick) { suppressClick = false; return; }
    say(habitat ? habitatReaction(habitat) : buddies[current].move);
    roamer.classList.remove("is-delighted");
    void sprite.offsetWidth;
    roamer.classList.add("is-delighted");
  });
  sprite.addEventListener("pointerdown", function (event) {
    if (event.button !== 0) return;
    engaged = true;
    freeze();
    clearTimeout(arrivalTimer);
    var box = roamer.getBoundingClientRect();
    drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, left: box.left, top: box.top, moved: false };
    sprite.setPointerCapture(event.pointerId);
  });
  sprite.addEventListener("pointermove", function (event) {
    if (!drag || event.pointerId !== drag.id) return;
    var dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    drag.moved = true;
    roamer.classList.add("is-dragging");
    roamer.style.left = Math.max(8, Math.min(window.innerWidth - roamer.offsetWidth - 8, drag.left + dx)) + "px";
    roamer.style.top = Math.max(8, Math.min(window.innerHeight - roamer.offsetHeight - 8, drag.top + dy)) + "px";
  });
  function endDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    var moved = drag.moved;
    drag = null;
    roamer.classList.remove("is-dragging");
    if (sprite.hasPointerCapture(event.pointerId)) sprite.releasePointerCapture(event.pointerId);
    if (moved) {
      suppressClick = event.type === "pointerup";
      habitat = null;
      markHabitat(null);
      var location = roamer.getBoundingClientRect();
      var centerX = location.left + 48, centerY = location.top + 40;
      document.querySelectorAll(".habitat").forEach(function (element) {
        var bounds = element.getBoundingClientRect();
        if (centerX >= bounds.left && centerX <= bounds.right && centerY >= bounds.top && centerY <= bounds.bottom) {
          habitat = element.dataset.habitat;
          markHabitat(element);
          say(habitatReaction(habitat));
        }
      });
      // Dragging parks the Pokémon at the chosen spot until wandering resumes.
      paused = true;
      pause.setAttribute("aria-pressed", "true");
      pause.setAttribute("aria-label", "Resume Pokémon wandering");
      pause.title = "Resume wandering";
    }
    engaged = roamer.matches(":hover") || roamer.contains(document.activeElement);
    release();
  }
  sprite.addEventListener("pointerup", endDrag);
  sprite.addEventListener("pointercancel", endDrag);
  sprite.addEventListener("dragstart", function (event) { event.preventDefault(); });
  sprite.addEventListener("animationend", function () { roamer.classList.remove("is-delighted"); });
  roamer.querySelector(".roamer-next").addEventListener("click", function () {
    current = choices[(choices.indexOf(current) + 1) % choices.length];
    render(true);
    try { localStorage.setItem("pokemon-companion", current); } catch (error) {}
  });
  pause.addEventListener("click", function () {
    paused = !paused;
    if (paused) freeze(); else release();
    pause.setAttribute("aria-pressed", String(paused));
    pause.setAttribute("aria-label", paused ? "Resume Pokémon wandering" : "Pause Pokémon wandering");
    pause.title = paused ? "Resume wandering" : "Pause wandering";
    say(paused ? buddies[current].name + " is taking a break." : buddies[current].name + " is ready to explore.");
  });
  roamer.addEventListener("pointerenter", function () { engaged = true; freeze(); });
  roamer.addEventListener("pointerleave", function () { if (!drag) { engaged = false; release(); } });
  roamer.addEventListener("focusin", function () { engaged = true; freeze(); });
  roamer.addEventListener("focusout", function (event) { if (!roamer.contains(event.relatedTarget)) { engaged = false; release(); } });
  var previousTheme = document.documentElement.getAttribute("data-theme");
  new MutationObserver(function () {
    var nextTheme = document.documentElement.getAttribute("data-theme");
    if (nextTheme === previousTheme) return;
    previousTheme = nextTheme;
    if (current === "charmander") { mood("warm"); say(nextTheme === "dark" ? "Charmander's tail glows brighter. Night watch begins!" : "Charmander stretches in the daylight."); }
    if (current === "pikachu") { mood("spark"); say(nextTheme === "dark" ? "Pikachu lights the way. Tiny sparks, big adventure." : "Pikachu is charged up for a new day!"); }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  window.addEventListener("resize", function () { habitat = null; markHabitat(null); place(); });
  reduced.addEventListener("change", place);
  render(false);
  roamer.hidden = false;
  place();
  setInterval(wander, 1500);
})();
