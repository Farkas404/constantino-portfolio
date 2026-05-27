document.addEventListener("DOMContentLoaded", function () {
  var lightbox = document.querySelector(".lightbox");
  var lightboxImg = document.querySelector(".lightbox img");
  var lightboxTitle = document.querySelector(".lightbox-title");
  var lightboxMeta = document.querySelector(".lightbox-meta");
  var closeButton = document.querySelector(".lightbox-close");
  var backTopButton = document.querySelector(".back-top");
  var openButtons = document.querySelectorAll(".js-open-image");

  function openLightbox(button) {
    var fullImage = button.getAttribute("data-full");
    var title = button.getAttribute("data-title") || "Project preview";
    var meta = button.getAttribute("data-meta") || "";
    var previewImage = button.querySelector("img");

    lightboxImg.src = fullImage;
    lightboxImg.alt = previewImage ? previewImage.alt : title;
    lightboxTitle.textContent = title;
    lightboxMeta.textContent = meta;

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
    lightboxTitle.textContent = "";
    lightboxMeta.textContent = "";
    document.body.classList.remove("no-scroll");
  }

  openButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      openLightbox(button);
    });
  });

  closeButton.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });

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
