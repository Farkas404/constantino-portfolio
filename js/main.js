const images = document.querySelectorAll(".project img");

const overlay = document.createElement("div");
overlay.className = "lightbox";
overlay.innerHTML = `
  <button class="lightbox-close">×</button>
  <img src="" alt="Project full preview">
`;
document.body.appendChild(overlay);

const overlayImg = overlay.querySelector("img");
const closeBtn = overlay.querySelector(".lightbox-close");

images.forEach((img) => {
  img.style.cursor = "zoom-in";
  img.addEventListener("click", () => {
    overlayImg.src = img.src;
    overlay.classList.add("active");
  });
});

closeBtn.addEventListener("click", () => {
  overlay.classList.remove("active");
});

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    overlay.classList.remove("active");
  }
});
