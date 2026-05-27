document.addEventListener("DOMContentLoaded", function () {
  var lightbox = document.querySelector(".lightbox");
  var lightboxPanel = document.querySelector(".lightbox-panel");
  var lightboxImg = document.querySelector(".lightbox-image-wrap img");
  var lightboxTitle = document.querySelector(".lightbox-title");
  var lightboxMeta = document.querySelector(".lightbox-meta");
  var lightboxCounter = document.querySelector(".lightbox-counter");
  var lightboxThumbs = document.querySelector(".lightbox-thumbs");
  var closeButton = document.querySelector(".lightbox-close");
  var prevButton = document.querySelector(".gallery-prev");
  var nextButton = document.querySelector(".gallery-next");
  var backTopButton = document.querySelector(".back-top");
  var openButtons = document.querySelectorAll(".js-open-gallery");

  var currentGallery = [];
  var currentIndex = 0;
  var currentTitle = "";
  var currentMeta = "";
  var touchStartX = 0;
  var touchStartY = 0;

  function getGallery(button) {
    var gallery = button.getAttribute("data-gallery") || "";

    return gallery
      .split(",")
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  function renderThumbs() {
    lightboxThumbs.innerHTML = "";

    currentGallery.forEach(function (src, index) {
      var thumbButton = document.createElement("button");
      thumbButton.type = "button";
      thumbButton.className = "lightbox-thumb";

      if (index === currentIndex) {
        thumbButton.classList.add("is-active");
      }

      var thumbImg = document.createElement("img");
      thumbImg.src = src;
      thumbImg.alt = currentTitle + " thumbnail " + (index + 1);

      thumbButton.appendChild(thumbImg);

      thumbButton.addEventListener("click", function () {
        currentIndex = index;
        renderGallery(true);
      });

      lightboxThumbs.appendChild(thumbButton);
    });
  }

  function renderGallery(shouldScrollTop) {
    if (!currentGallery.length) {
      return;
    }

    lightboxImg.src = currentGallery[currentIndex];
    lightboxImg.alt = currentTitle + " — image " + (currentIndex + 1);

    lightboxTitle.textContent = currentTitle;
    lightboxMeta.textContent = currentMeta;
    lightboxCounter.textContent =
      "Image " + (currentIndex + 1) + " / " + currentGallery.length;

    var hasMultipleImages = currentGallery.length > 1;

    prevButton.disabled = !hasMultipleImages;
    nextButton.disabled = !hasMultipleImages;

    renderThumbs();

    if (shouldScrollTop) {
      lightbox.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }

  function openLightbox(button) {
    currentGallery = getGallery(button);
    currentIndex = 0;
    currentTitle = button.getAttribute("data-title") || "Project preview";
    currentMeta = button.getAttribute("data-meta") || "";

    if (!currentGallery.length) {
      return;
    }

    renderGallery(false);

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");

    lightbox.scrollTop = 0;
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");

    lightboxImg.src = "";
    lightboxTitle.textContent = "";
    lightboxMeta.textContent = "";
    lightboxCounter.textContent = "";
    lightboxThumbs.innerHTML = "";

    currentGallery = [];
    currentIndex = 0;
    currentTitle = "";
    currentMeta = "";

    document.body.classList.remove("no-scroll");
  }

  function showPrevious() {
    if (currentGallery.length <= 1) {
      return;
    }

    currentIndex =
      (currentIndex - 1 + currentGallery.length) % currentGallery.length;

    renderGallery(true);
  }

  function showNext() {
    if (currentGallery.length <= 1) {
      return;
    }

    currentIndex = (currentIndex + 1) % currentGallery.length;

    renderGallery(true);
  }

  openButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      openLightbox(button);
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  prevButton.addEventListener("click", showPrevious);
  nextButton.addEventListener("click", showNext);

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  lightboxPanel.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  document.addEventListener("keydown", function (event) {
    if (!lightbox.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowLeft") {
      showPrevious();
    }

    if (event.key === "ArrowRight") {
      showNext();
    }
  });

  lightbox.addEventListener("touchstart", function (event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
  }, { passive: true });

  lightbox.addEventListener("touchend", function (event) {
    var touchEndX = event.changedTouches[0].screenX;
    var touchEndY = event.changedTouches[0].screenY;

    var diffX = touchStartX - touchEndX;
    var diffY = touchStartY - touchEndY;

    if (Math.abs(diffX) > 60 && Math.abs(diffY) < 70) {
      if (diffX > 0) {
        showNext();
      } else {
        showPrevious();
      }
    }
  }, { passive: true });

  function updateBackTopVisibility() {
    if (window.scrollY > 520) {
      backTopButton.classList.add("is-visible");
    } else {
      backTopButton.classList.remove("is-visible");
    }
  }

  backTopButton.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  window.addEventListener("scroll", updateBackTopVisibility, { passive: true });
  updateBackTopVisibility();
});
