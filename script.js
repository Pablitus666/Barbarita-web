// ======================================================
// script.js – Versión Final Profesional + Popup Flotante
// ======================================================

(() => {
  "use strict";

  // ======================================================
  // CONSTANTES BASE
  // ======================================================
  const body = document.body;
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const LS_THEME = "ls_theme_mode";

  // ======================================================
  // APLICAR TEMA
  // ======================================================
  function applyTheme(theme) {
    const isLight = theme === "light";

    body.classList.toggle("light-mode", isLight);
    themeIcon.src = isLight ? "./images/sun.png" : "./images/moon.png";
    themeToggle.setAttribute("aria-pressed", String(isLight));

    const toast = document.getElementById("toast");
    toast?.classList.toggle("light-mode", isLight);

    localStorage.setItem(LS_THEME, theme);
  }

  // ======================================================
  // TEMA INICIAL
  // ======================================================
  (() => {
    const savedTheme = localStorage.getItem(LS_THEME) || "dark";
    applyTheme(savedTheme);
  })();

  // ======================================================
  // TOGGLE DE TEMA
  // ======================================================
  themeToggle.addEventListener("click", () => {
    const newTheme = body.classList.contains("light-mode") ? "dark" : "light";
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
  // PARALLAX HEADER
  // ======================================================
  const bannerImg = document.querySelector(".header-banner .banner-img");

  if (bannerImg) {
    let ticking = false;
    let winH = window.innerHeight;

    const updateParallax = () => {
      const rectTop = bannerImg.getBoundingClientRect().top;
      const ratio = Math.min(Math.max(rectTop / winH, -1), 1);
      bannerImg.style.transform = `translateY(${ratio * -25}px) scale(1.04)`;
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    });

    window.addEventListener("resize", () => {
      winH = window.innerHeight;
      requestAnimationFrame(updateParallax);
    });

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
  const fallback = "./images/offline-image.png";

  document.querySelectorAll("img").forEach(img => {
    img.addEventListener("error", () => {
      if (!img.dataset.fallback) {
        img.dataset.fallback = "1";
        img.src = fallback;
      }
    });
  });

  // ======================================================
  // LIGHTBOX GALERÍA
  // ======================================================
  const gallery = document.getElementById("gallery");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");

  if (gallery && lightbox && lightboxImg) {
    gallery.addEventListener("click", e => {
      if (e.target.tagName === "IMG") {
        lightboxImg.src = e.target.src;
        lightbox.classList.remove("hidden");
        lightbox.setAttribute("aria-hidden", "false");
        body.style.overflow = "hidden";
      }
    });

    lightbox.addEventListener("click", e => {
      if (e.target === lightbox) {
        lightbox.classList.add("hidden");
        lightbox.setAttribute("aria-hidden", "true");
        body.style.overflow = "";
      }
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        lightbox.classList.add("hidden");
        lightbox.setAttribute("aria-hidden", "true");
        body.style.overflow = "";
      }
    });
  }

  // ======================================================
  // POPUP FLOTANTE (TOAST)
  // ======================================================
  function showToast(message = "Mensaje enviado correctamente") {
    const toast = document.getElementById("toast");
    const text = toast.querySelector(".toast-text");

    text.textContent = message;
    toast.classList.add("toast-show");

    setTimeout(() => {
      toast.classList.remove("toast-show");
    }, 3000);
  }

  // ======================================================
  // NETLIFY FORM SUBMIT + TELEGRAM (vía Netlify Function)
  // ======================================================
  const form = document.getElementById("contact-form");

  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();

      const formData = new FormData(form);
      const name = formData.get("name") || 'No especificado';
      const email = formData.get("email") || 'No especificado';
      const message = formData.get("message") || 'No especificado';

      try {
        // Preparamos las dos tareas que se ejecutarán en paralelo
        const netlifyPromise = fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(formData).toString()
        });

        const telegramPromise = fetch("/.netlify/functions/send-telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, message })
        });

        // Esperamos a que ambas terminen
        const [netlifyResponse, telegramResponse] = await Promise.all([
          netlifyPromise,
          telegramPromise
        ]);

        // Verificamos que ambas respuestas son correctas
        if (!netlifyResponse.ok || !telegramResponse.ok) {
            // Si alguna falla, lanzamos un error para que lo capture el catch
            throw new Error(`Error en el envío: Netlify ${netlifyResponse.status}, Telegram ${telegramResponse.status}`);
        }

        showToast("Mensaje enviado correctamente");
        form.reset();

      } catch (err) {
        showToast("Hubo un error. Intenta nuevamente.");
        console.error("Error al enviar formulario:", err);
      }
    });
  }
})();
