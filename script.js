// ======================================================
// script.js – Versión Profesional Optimizada Final
// ======================================================

(() => {
  "use strict";

  // ======================================================
  // CONSTANTES BASE
  // ======================================================
  const body = document.body;
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const LS_THEME = "ls_theme_mode"; // Valores esperados: "light" | "dark"

  // ======================================================
  // FUNCIÓN: APLICAR TEMA
  // ======================================================
  function applyTheme(theme) {
    const isLight = theme === "light";

    body.classList.toggle("light-mode", isLight);
    themeIcon.src = isLight ? "./images/sun.png" : "./images/moon.png";
    themeToggle?.setAttribute("aria-pressed", String(isLight));

    try {
      localStorage.setItem(LS_THEME, theme);
    } catch {}
  }

  // ======================================================
  // TEMA INICIAL
  // ======================================================
  (() => {
    let savedTheme = "dark";

    try {
      savedTheme = localStorage.getItem(LS_THEME) || "dark";
    } catch {}

    applyTheme(savedTheme);
  })();

  // ======================================================
  // LISTENER DE TOGGLE DE TEMA
  // ======================================================
  themeToggle?.addEventListener("click", () => {
    const isLight = body.classList.contains("light-mode");
    const newTheme = isLight ? "dark" : "light";

    applyTheme(newTheme);

    themeToggle.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(0.92)" },
        { transform: "scale(1)" }
      ],
      { duration: 220, easing: "ease-out" }
    );
  });

  // ======================================================
  // PARALLAX OPTIMIZADO
  // ======================================================
  const bannerImg = document.querySelector(".header-banner .banner-img");

  if (bannerImg) {
    let ticking = false;
    let winH = window.innerHeight;

    const updateParallax = () => {
      const rectTop = bannerImg.getBoundingClientRect().top;
      const ratio = Math.min(Math.max(rectTop / winH, -1), 1);
      const offset = ratio * -25;

      bannerImg.style.transform = `translateY(${offset}px) scale(1.04)`;
      ticking = false;
    };

    const scheduleUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });

    window.addEventListener(
      "resize",
      () => {
        winH = window.innerHeight;
        requestAnimationFrame(updateParallax);
      },
      { passive: true }
    );

    requestAnimationFrame(updateParallax);
  }

  // ======================================================
  // SCROLL REVEAL
  // ======================================================
  const revealItems = document.querySelectorAll(
    ".reveal, [data-scroll-reveal], .fade-left, .fade-right"
  );

  if (revealItems.length) {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    revealItems.forEach(el => io.observe(el));
  }

  // ======================================================
  // FALLBACK GLOBAL PARA IMÁGENES
  // ======================================================
  const fallbackImg = "./images/offline-image.png";

  document.querySelectorAll("img").forEach(img => {
    img.addEventListener("error", () => {
      if (!img.dataset.fallback) {
        img.dataset.fallback = "1";
        img.classList.add("img--fallback");
        img.src = fallbackImg;
      }
    });
  });

  // ======================================================
  // LIGHTBOX GALERÍA
  // ======================================================
  const gallery = document.getElementById("gallery");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");

  const closeLightbox = () => {
    lightbox.classList.add("hidden");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
    body.style.overflow = "";
  };

  if (gallery && lightbox && lightboxImg) {
    gallery.addEventListener("click", event => {
      const img = event.target;

      if (img.tagName === "IMG") {
        lightboxImg.src = img.src;
        lightbox.classList.remove("hidden");
        lightbox.setAttribute("aria-hidden", "false");
        body.style.overflow = "hidden";
      }
    });

    lightbox.addEventListener("click", event => {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !lightbox.classList.contains("hidden")) {
        closeLightbox();
      }
    });
  }

  // ======================================================
  // PERF EXTRA
  // ======================================================
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && bannerImg) {
      requestAnimationFrame(() => {
        bannerImg.style.transform = "translateY(0) scale(1.03)";
      });
    }
  });

})();

// ======================================================
// SERVICE WORKER
// ======================================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(reg => {
        reg.onupdatefound = () => {
          const installing = reg.installing;
          if (installing) {
            installing.onstatechange = () => {
              if (installing.state === "installed") {
                console.log("Service worker instalado/actualizado.");
              }
            };
          }
        };
      })
      .catch(err => console.warn("Service Worker registration failed:", err));
  });
}

// ======================================================
// POPUP ESTILIZADO – CONFIRMACIÓN DE ENVÍO DE FORMULARIO
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const formData = new FormData(form);

    fetch("/", {
      method: "POST",
      body: formData,
    })
      .then(() => {
        form.reset();
        showPopup("Mensaje enviado correctamente", "success");
      })
      .catch(() => {
        showPopup("Hubo un error al enviar el mensaje", "error");
      });
  });
});

// ======================================================
// POPUP PREMIUM
// ======================================================
function showPopup(message, type = "success") {
  const popup = document.createElement("div");

  popup.className = "popup-message";
  popup.innerHTML = `
      <div class="popup-content">
          <div class="popup-icon ${type}">
              ${type === "success" ? "✔" : "✖"}
          </div>
          <p>${message}</p>
      </div>
  `;

  Object.assign(popup.style, {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    padding: "0",
    backdropFilter: "blur(12px)",
    background: "rgba(20,20,20,0.55)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "16px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
    zIndex: "99999",
    opacity: "0",
    transform: "translateY(20px)",
    transition: "all .35s ease",
    padding: "16px 22px"
  });

  const iconStyle = `
      .popup-icon {
          font-size: 1.5rem;
          display: inline-block;
          margin-right: 10px;
      }
      .popup-icon.success { color: #6CFA8D; }
      .popup-icon.error { color: #FF6B6B; }
      .popup-message p {
          margin: 0;
          color: #fff;
          font-size: 1rem;
      }
      .popup-content {
          display: flex;
          align-items: center;
      }
  `;

  const styleTag = document.createElement("style");
  styleTag.innerHTML = iconStyle;
  document.head.appendChild(styleTag);

  document.body.appendChild(popup);

  requestAnimationFrame(() => {
    popup.style.opacity = "1";
    popup.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    popup.style.opacity = "0";
    popup.style.transform = "translateY(20px)";
    setTimeout(() => popup.remove(), 400);
  }, 3000);
}
