document.addEventListener("DOMContentLoaded", function () {
  var galleries = {
    "Interstate Magazine": [
      "assets/images/p01.jpg",
      "assets/images/p02.jpg",
      "assets/images/p04.jpg"
    ],
    "Locust Jones": [
      "assets/images/p08.jpg",
      "assets/images/p09.jpg",
      "assets/images/p10.jpg"
    ],
    "Eva Mayr-Stihl Stiftung": [
      "assets/images/p11.jpg",
      "assets/images/p12.jpg"
    ],
    "Organ Donation": [
      "assets/images/p18.jpg",
      "assets/images/p19.jpg",
      "assets/images/p20.jpg"
    ],
    "Bucalu Store Interior": [
      "assets/images/b01.jpg",
      "assets/images/b02.jpg",
      "assets/images/b03.jpg",
      "assets/images/b04.jpg"
    ],
    "KFC Summer Bucket": [
      "assets/images/p39.jpg",
    ]
  };

  var lightbox = document.querySelector(".lightbox");
  var lightboxImg = document.querySelector(".lightbox-image-wrap img");
  var lightboxTitle = document.querySelector(".lightbox-title");
  var lightboxMeta = document.querySelector(".lightbox-meta");
  var closeButton = document.querySelector(".lightbox-close");
  var backTopButton = document.querySelector(".back-top");
  var openButtons = document.querySelectorAll(".js-open-image");

  var lightboxPanel = document.querySelector(".lightbox-panel");
  var caption = document.querySelector(".lightbox-caption");

  var controls = document.createElement("div");
  controls.className = "gallery-controls";
  controls.innerHTML = [
    '<button class="gallery-prev" type="button" aria-label="Previous image">‹</button>',
    '<span class="gallery-counter">1 / 1</span>',
    '<button class="gallery-next" type="button" aria-label="Next image">›</button>'
  ].join("");

  var thumbnails = document.createElement("div");
  thumbnails.className = "gallery-thumbnails";

  lightboxPanel.insertBefore(controls, caption);
  lightboxPanel.appendChild(thumbnails);

  var prevButton = controls.querySelector(".gallery-prev");
  var nextButton = controls.querySelector(".gallery-next");
  var counter = controls.querySelector(".gallery-counter");

  var state = {
    images: [],
    index: 0,
    title: "",
    meta: ""
  };

  function renderGallery() {
    var image = state.images[state.index];

    lightboxImg.src = image;
    lightboxImg.alt = state.title + " — image " + (state.index + 1);

    lightboxTitle.textContent = state.title;
    lightboxMeta.textContent = state.meta;
    counter.textContent = (state.index + 1) + " / " + state.images.length;

    prevButton.disabled = state.images.length <= 1;
    nextButton.disabled = state.images.length <= 1;

    thumbnails.innerHTML = "";

    state.images.forEach(function (src, index) {
      var thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = "gallery-thumb" + (index === state.index ? " is-active" : "");
      thumb.setAttribute("aria-label", "Open image " + (index + 1));

      var thumbImg = document.createElement("img");
      thumbImg.src = src;
      thumbImg.alt = "";

      thumb.appendChild(thumbImg);

      thumb.addEventListener("click", function () {
        state.index = index;
        renderGallery();
      });

      thumbnails.appendChild(thumb);
    });
  }

  function openLightbox(button) {
    var title = button.getAttribute("data-title") || "Project preview";
    var meta = button.getAttribute("data-meta") || "";
    var fallbackImage = button.getAttribute("data-full");

    state.images = galleries[title] || [fallbackImage];
    state.index = 0;
    state.title = title;
    state.meta = meta;

    renderGallery();

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
    thumbnails.innerHTML = "";
    document.body.classList.remove("no-scroll");
  }

  function showNext() {
    if (state.images.length <= 1) return;
    state.index = (state.index + 1) % state.images.length;
    renderGallery();
  }

  function showPrevious() {
    if (state.images.length <= 1) return;
    state.index = (state.index - 1 + state.images.length) % state.images.length;
    renderGallery();
  }

  openButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      openLightbox(button);
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  nextButton.addEventListener("click", showNext);
  prevButton.addEventListener("click", showPrevious);

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (!lightbox.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowRight") {
      showNext();
    }

    if (event.key === "ArrowLeft") {
      showPrevious();
    }
  });

  var touchStartX = 0;
  var touchEndX = 0;

  lightbox.addEventListener("touchstart", function (event) {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener("touchend", function (event) {
    touchEndX = event.changedTouches[0].screenX;

    if (touchStartX - touchEndX > 50) {
      showNext();
    }

    if (touchEndX - touchStartX > 50) {
      showPrevious();
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
