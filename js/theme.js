(function () {
  var root = document.documentElement;
  var preference = "system";
  var styleMode = "journal";
  var validStyles = ["journal", "pokedex", "unicorn"];

  try {
    var saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") preference = saved;
    var savedStyle = localStorage.getItem("site-style");
    if (validStyles.indexOf(savedStyle) !== -1) styleMode = savedStyle;
  } catch (error) { /* Storage unavailable; fall back to defaults. */ }

  function applyTheme(value) {
    if (value === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", value);
  }

  function applyStyle(value) {
    styleMode = validStyles.indexOf(value) !== -1 ? value : "journal";
    root.setAttribute("data-style", styleMode);
  }

  applyTheme(preference);
  applyStyle(styleMode);

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".theme-toggle");
    var systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

    function isDark() {
      return preference === "dark" || (preference === "system" && systemTheme.matches);
    }

    function updateLabel() {
      if (!toggle) return;
      var label = isDark() ? "Switch to light theme" : "Switch to dark theme";
      toggle.setAttribute("aria-label", label);
      toggle.title = label;
    }

    if (toggle) {
      updateLabel();
      toggle.hidden = false;
      systemTheme.addEventListener("change", updateLabel);
      toggle.addEventListener("click", function () {
        preference = isDark() ? "light" : "dark";
        applyTheme(preference);
        updateLabel();
        try {
          localStorage.setItem("theme", preference);
        } catch (error) {}
      });
    }

    var switcher = document.querySelector(".style-switcher");
    var pills = document.querySelectorAll("[data-style-choice]");

    function updateStylePills() {
      pills.forEach(function (pill) {
        var active = pill.getAttribute("data-style-choice") === styleMode;
        pill.setAttribute("aria-pressed", active ? "true" : "false");
        pill.classList.toggle("is-active", active);
      });
    }

    if (switcher && pills.length) {
      updateStylePills();
      switcher.hidden = false;
      pills.forEach(function (pill) {
        pill.addEventListener("click", function () {
          var chosen = pill.getAttribute("data-style-choice");
          applyStyle(chosen);
          updateStylePills();
          try {
            localStorage.setItem("site-style", styleMode);
          } catch (error) {}
        });
      });
    }
  });
})();
