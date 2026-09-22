(function () {
  var input = document.querySelector("[data-post-search-input]");
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-post-search-item]"));
  var status = document.querySelector("[data-post-search-status]");

  if (!input || !items.length || !status) {
    return;
  }

  var total = items.length;

  var updateStatus = function (visibleCount, query) {
    if (!query) {
      status.textContent = "Showing all " + total + (total === 1 ? " post." : " posts.");
      return;
    }
    status.textContent = "Showing " + visibleCount + " of " + total + " for “" + query + "”.";
  };

  var applyFilter = function () {
    var query = input.value.trim().toLowerCase();
    var visibleCount = 0;

    items.forEach(function (item) {
      var haystack = [
        item.getAttribute("data-post-title") || "",
        item.getAttribute("data-post-tags") || "",
        item.getAttribute("data-post-excerpt") || ""
      ].join(" ").toLowerCase();

      var show = !query || haystack.indexOf(query) !== -1;
      item.hidden = !show;
      if (show) {
        visibleCount += 1;
      }
    });

    updateStatus(visibleCount, query);
  };

  updateStatus(total, "");
  input.addEventListener("input", applyFilter);
})();
