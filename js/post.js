(function () {
  var postBody = document.querySelector(".post-body");
  if (!postBody) return;

  // 1. Copy-code buttons on <pre> blocks
  var preBlocks = postBody.querySelectorAll("pre");
  preBlocks.forEach(function (pre) {
    if (pre.querySelector(".code-copy-btn")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "code-copy-btn";
    btn.textContent = "Copy";
    btn.setAttribute("aria-label", "Copy code to clipboard");
    btn.addEventListener("click", function () {
      var codeEl = pre.querySelector("code");
      var raw = (codeEl ? codeEl.textContent : pre.textContent) || "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(raw.trim()).then(function () {
          btn.textContent = "Copied";
          setTimeout(function () { btn.textContent = "Copy"; }, 1800);
        });
      }
    });
    pre.appendChild(btn);
  });

  // 2. Interactive Cold Start Budget Simulator (if present in post)
  var sim = postBody.querySelector("[data-budget-sim]");
  if (sim) {
    var inputs = sim.querySelectorAll("input[data-bucket]");
    var totalEl = sim.querySelector("[data-budget-total]");
    var statusEl = sim.querySelector("[data-budget-status]");
    var limit = Number(sim.getAttribute("data-budget-limit") || 2500);

    function updateSim() {
      var values = {};
      var sum = 0;
      inputs.forEach(function (input) {
        var key = input.getAttribute("data-bucket");
        var val = Number(input.value) || 0;
        values[key] = val;
        sum += val;
        var out = sim.querySelector('[data-val="' + key + '"]');
        if (out) out.textContent = val + " ms";
      });
      var denom = Math.max(sum, limit, 1);
      Object.keys(values).forEach(function (key) {
        var seg = sim.querySelector('[data-seg="' + key + '"]');
        if (seg) seg.style.width = ((values[key] / denom) * 100).toFixed(1) + "%";
      });
      if (totalEl) totalEl.textContent = sum + " ms / " + limit + " ms";
      var over = sum > limit;
      sim.classList.toggle("is-over", over);
      if (statusEl) {
        statusEl.textContent = over
          ? "OVER BUDGET (+" + (sum - limit) + " ms)"
          : "PASS (" + (limit - sum) + " ms headroom)";
      }
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", updateSim);
    });
    updateSim();
  }

  // 3. Sticky Rail: Table of Contents & Reading Progress
  var rail = document.querySelector(".rail");
  if (!rail) return;

  var headings = Array.prototype.slice.call(postBody.querySelectorAll("h2, h3"));
  var tocList = document.getElementById("toc-list");
  var tocBlock = document.querySelector(".rail-toc");
  var tocLinks = [];

  if (tocList && headings.length >= 2) {
    headings.forEach(function (heading) {
      if (!heading.id) return;
      var link = document.createElement("a");
      link.href = "#" + heading.id;
      link.textContent = heading.textContent.replace(/#$/, "").trim();
      tocList.appendChild(link);
      tocLinks.push({ heading: heading, link: link });
    });

    if (tocLinks.length && "IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var match = tocLinks.find(function (item) {
              return item.heading === entry.target;
            });
            if (!match) return;
            if (entry.isIntersecting) {
              tocLinks.forEach(function (item) {
                item.link.classList.remove("is-active");
              });
              match.link.classList.add("is-active");
            }
          });
        },
        { rootMargin: "-18% 0px -70% 0px" }
      );

      tocLinks.forEach(function (item) {
        observer.observe(item.heading);
      });
    }
  } else if (tocBlock) {
    tocBlock.style.display = "none";
  }

  var progressFill = document.getElementById("reading-progress");
  var progressLabel = document.getElementById("reading-progress-label");
  var progressBlock = document.querySelector(".rail-progress");

  if (progressFill && headings.length >= 2) {
    var ticking = false;

    var updateProgress = function () {
      ticking = false;
      var rect = postBody.getBoundingClientRect();
      var articleHeight = postBody.offsetHeight - window.innerHeight * 0.6;
      var scrolled = -rect.top;
      var percent = 0;

      if (articleHeight > 0) {
        percent = (scrolled / articleHeight) * 100;
      } else if (rect.top <= 0) {
        percent = 100;
      }

      percent = Math.min(100, Math.max(0, percent));
      var rounded = Math.round(percent);
      progressFill.style.width = percent + "%";
      if (progressLabel) progressLabel.textContent = rounded + "%";
    };

    var requestUpdate = function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateProgress);
      }
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    updateProgress();
  } else if (progressBlock) {
    progressBlock.style.display = "none";
  }
})();
