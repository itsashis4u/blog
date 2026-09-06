(function () {
  var postBody = document.querySelector(".post-body");
  var rail = document.querySelector(".rail");

  if (!postBody || !rail) {
    return;
  }

  var headings = Array.prototype.slice.call(postBody.querySelectorAll("h2, h3"));

  var tocList = document.getElementById("toc-list");
  var tocBlock = document.querySelector(".rail-toc");
  var tocLinks = [];

  if (tocList && headings.length >= 2) {
    headings.forEach(function (heading) {
      if (!heading.id) {
        return;
      }
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
            if (!match) {
              return;
            }
            if (entry.isIntersecting) {
              tocLinks.forEach(function (item) {
                item.link.classList.remove("is-active");
              });
              match.link.classList.add("is-active");
            }
          });
        },
        { rootMargin: "-20% 0px -70% 0px" }
      );

      tocLinks.forEach(function (item) {
        observer.observe(item.heading);
      });
    }
  } else if (tocBlock) {
    tocBlock.style.display = "none";
  }

  var progressFill = document.getElementById("reading-progress");
  var progressBlock = document.querySelector(".rail-progress");

  if (progressFill && headings.length >= 2) {
    var ticking = false;

    var updateProgress = function () {
      ticking = false;
      var rect = postBody.getBoundingClientRect();
      var articleHeight = postBody.offsetHeight - window.innerHeight;
      var scrolled = -rect.top;
      var percent = 0;

      if (articleHeight > 0) {
        percent = (scrolled / articleHeight) * 100;
      } else if (rect.top <= 0) {
        percent = 100;
      }

      percent = Math.min(100, Math.max(0, percent));
      progressFill.style.width = percent + "%";
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
