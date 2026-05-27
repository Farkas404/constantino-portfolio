document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = lightbox.querySelector("img");
  const closeBtn = document.querySelector(".lightbox-close");
  const backTop = document.querySelector(".back-top");

  document.querySelectorAll("[data-full]").forEach((button) => {
    button.addEventListener("click", () => {
      lightboxImg.src = button.dataset.full;
      lightboxImg.alt = button.querySelector("img")?.alt || "Project preview";
      lightbox.classList.add("active");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
    document.body.classList.remove("no-scroll");
  }

  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();
  });

  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
