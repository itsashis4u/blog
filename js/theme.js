(function () {
  var root = document.documentElement;
  var preference = "system";
  try {
    var saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") preference = saved;
  } catch (error) { /* The selector still works when storage is unavailable. */ }

  function apply(value) {
    if (value === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", value);
  }
  apply(preference);

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;
    var systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    function isDark() {
      return preference === "dark" || (preference === "system" && systemTheme.matches);
    }
    function updateLabel() {
      var label = isDark() ? "Switch to light theme" : "Switch to dark theme";
      toggle.setAttribute("aria-label", label);
      toggle.title = label;
    }
    updateLabel();
    toggle.hidden = false;
    systemTheme.addEventListener("change", updateLabel);
    toggle.addEventListener("click", function () {
      preference = isDark() ? "light" : "dark";
      apply(preference);
      updateLabel();
      try {
        localStorage.setItem("theme", preference);
      } catch (error) { /* Keep the current-page choice without persistence. */ }
    });
  });
})();
