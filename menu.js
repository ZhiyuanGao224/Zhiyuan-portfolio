document.addEventListener("DOMContentLoaded", () => {
  const gsapInstance = window.gsap;
  if (!gsapInstance) return;

  const menuButton = document.querySelector(".menu-trigger");
  const menuOverlay = document.querySelector(".menu-overlay");
  const menuContent = document.querySelector(".menu-content");
  const previewWrapper = document.querySelector(".menu-preview-img");
  const menuLinks = Array.from(document.querySelectorAll(".menu-links .link a"));
  const socialLinks = Array.from(document.querySelectorAll(".menu-socials .social a"));
  const footerLinks = Array.from(document.querySelectorAll(".menu-footer a"));
  const overlayCloseBtn = document.querySelector(".overlay-close");

  if (!menuButton || !menuOverlay || !menuContent) return;

  const textTargets = [...menuLinks, ...socialLinks];
  const interactiveLinks = [...menuLinks, ...socialLinks, ...footerLinks];
  const defaultPreview = previewWrapper?.dataset.defaultImg || menuLinks[0]?.dataset.img;

  let isOpen = false;
  let isAnimating = false;

  function setDefaultPreview() {
    if (!previewWrapper || !defaultPreview) return;
    previewWrapper.innerHTML = "";
    const img = document.createElement("img");
    img.src = defaultPreview;
    img.alt = "Menu preview";
    previewWrapper.appendChild(img);
  }

  function cleanupPreviewImages() {
    if (!previewWrapper) return;
    const images = Array.from(previewWrapper.querySelectorAll("img"));
    if (images.length <= 3) return;
    const overflow = images.length - 3;
    for (let i = 0; i < overflow; i += 1) {
      previewWrapper.removeChild(images[i]);
    }
  }

  function openMenu() {
    if (isAnimating || isOpen) return;
    isAnimating = true;
    isOpen = true;

    document.body.classList.add("menu-open");
    menuOverlay.classList.add("active");
    menuOverlay.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.textContent = "CLOSE";
    menuButton.setAttribute("aria-label", "Close immersive menu");

    gsapInstance.to(menuContent, {
      rotation: 0,
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 1.15,
      ease: "power4.inOut",
    });

    gsapInstance.to(textTargets, {
      y: "0%",
      opacity: 1,
      duration: 0.95,
      delay: 0.65,
      stagger: 0.08,
      ease: "power3.out",
    });

    gsapInstance.to(menuOverlay, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 175%, 0% 100%)",
      duration: 1.15,
      ease: "power4.inOut",
      onComplete: () => {
        isAnimating = false;
      },
    });
  }

  function closeMenu(force = false) {
    if (!isOpen && !force) return;

    if (isAnimating) {
      gsapInstance.killTweensOf(menuContent);
      gsapInstance.killTweensOf(menuOverlay);
      gsapInstance.killTweensOf(textTargets);
      isAnimating = false;
    }

    isOpen = false;
    isAnimating = true;

    gsapInstance.to(menuContent, {
      rotation: -12,
      x: -80,
      y: -80,
      scale: 1.3,
      opacity: 0.2,
      duration: 1.15,
      ease: "power4.inOut",
    });

    gsapInstance.to(menuOverlay, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      duration: 1.15,
      ease: "power4.inOut",
      onComplete: () => {
        document.body.classList.remove("menu-open");
        menuOverlay.classList.remove("active");
        menuOverlay.setAttribute("aria-hidden", "true");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.textContent = "MENU";
        menuButton.setAttribute("aria-label", "Open immersive menu");
        gsapInstance.set(menuLinks, { y: "120%", opacity: 0.25 });
        gsapInstance.set(socialLinks, { y: "120%", opacity: 0.1 });
        setDefaultPreview();
        isAnimating = false;
      },
    });
  }

  function handlePreview(event) {
    if (!previewWrapper || !isOpen || isAnimating) return;
    const imgSrc = event.currentTarget.getAttribute("data-img");
    if (!imgSrc) return;

    const existing = previewWrapper.querySelectorAll("img");
    if (existing.length > 0) {
      const current = existing[existing.length - 1];
      if (current.src.endsWith(imgSrc)) return;
    }

    const newImg = document.createElement("img");
    newImg.src = imgSrc;
    newImg.alt = "Menu preview";
    newImg.style.opacity = "0";
    newImg.style.transform = "scale(1.2) rotate(8deg)";
    previewWrapper.appendChild(newImg);
    cleanupPreviewImages();

    gsapInstance.to(newImg, {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.65,
      ease: "power2.out",
    });
  }

  menuButton.addEventListener("click", () => {
    if (isOpen) closeMenu();
    else openMenu();
  });

  menuButton.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (isOpen) closeMenu();
    else openMenu();
  });

  overlayCloseBtn?.addEventListener("click", () => closeMenu(true));
  overlayCloseBtn?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      closeMenu(true);
    }
  });

  menuOverlay.addEventListener("click", (event) => {
    if (event.target === menuOverlay) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  interactiveLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (link.getAttribute("href")?.startsWith("#")) {
        closeMenu();
      }
    });
  });

  menuLinks.forEach((link) => {
    link.addEventListener("mouseenter", handlePreview);
    link.addEventListener("focus", handlePreview);
  });

  gsapInstance.set(menuLinks, { y: "120%", opacity: 0.25 });
  gsapInstance.set(socialLinks, { y: "120%", opacity: 0.1 });
  setDefaultPreview();
});
