// ======================================================
// script.js – Versión Profesional Optimizada Final (Revisada)
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
    } catch {
      // localStorage puede fallar (modo incógnito o restricciones)
    }
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

    // Animación del botón
    themeToggle.animate(
      [{ transform: "scale(1)" }, { transform: "scale(0.92)" }, { transform: "scale(1)" }],
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
  // PERF EXTRA (Recuperar parallax al volver de otra pestaña)
  // ======================================================
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && bannerImg) {
      requestAnimationFrame(() => {
        bannerImg.style.transform = "translateY(0) scale(1.03)";
      });
    }
  });

})(); // FIN DEL IIFE PRINCIPAL



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
// POPUP MODERNO + ENVÍO NETLIFY FORMS
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
        showPopup("Mensaje enviado correctamente");
      })
      .catch(() => {
        showPopup("Error al enviar el mensaje");
      });
  });
});


// ======================================================
// POPUP MODERNO
// ======================================================
function showPopup(message) {
  const popup = document.createElement("div");

  popup.innerHTML = `
    <div style="
      display:flex;
      gap:12px;
      align-items:center;
    ">
      <span style="font-size:22px;">📩</span>
      <span>${message}</span>
    </div>
  `;

  popup.style.position = "fixed";
  popup.style.bottom = "25px";
  popup.style.right = "25px";
  popup.style.padding = "16px 22px";
  popup.style.background = "rgba(20,20,20,0.7)";
  popup.style.backdropFilter = "blur(10px)";
  popup.style.color = "#fff";
  popup.style.fontSize = "1rem";
  popup.style.borderRadius = "14px";
  popup.style.boxShadow = "0 6px 20px rgba(0,0,0,0.35)";
  popup.style.opacity = "0";
  popup.style.transform = "translateY(25px)";
  popup.style.transition = "all .35s ease";
  popup.style.zIndex = "9999";

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
