// Fithub Landing Page v3 — vanilla JS, no dependencies.
// Handles: scroll-triggered reveal, counter animation, mobile menu, parallax.

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ─── Reveal on scroll ──────────────────────────────────────
  const revealEls = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window && revealEls.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.15,
      }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // ─── Counter animation (data-counter on hero stats) ────────
  const counters = document.querySelectorAll("[data-counter]");

  if ("IntersectionObserver" in window && counters.length > 0 && !reduceMotion) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => counterObserver.observe(el));
  } else if (reduceMotion) {
    // Just set the final value
    counters.forEach((el) => {
      el.textContent = el.dataset.counter;
    });
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.counter, 10);
    const duration = 1800;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  // ─── Mobile menu toggle ────────────────────────────────────
  const menuBtn = document.getElementById("navMenuBtn");
  const navLinks = document.querySelector(".nav__links");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(isOpen));
      menuBtn.setAttribute(
        "aria-label",
        isOpen ? "Menüyü kapat" : "Menüyü aç"
      );
    });

    // Close menu when a link is clicked (single-page nav)
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.setAttribute("aria-label", "Menüyü aç");
      });
    });
  }

  // ─── Subtle parallax on hero phones ─────────────────────────
  const phoneStackMain = document.querySelector(".phone-stack__main");
  const phoneStackBack = document.querySelector(".phone-stack__back");

  if (phoneStackMain && !reduceMotion) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          if (scrolled < window.innerHeight) {
            const offsetMain = scrolled * 0.06;
            const offsetBack = scrolled * 0.12;
            phoneStackMain.style.setProperty(
              "--scroll-offset",
              `${offsetMain}px`
            );
            phoneStackMain.style.translate = `0 ${offsetMain}px`;
            if (phoneStackBack) {
              phoneStackBack.style.translate = `0 ${offsetBack}px`;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ─── Cursor-aware glow on hero (subtle premium touch) ──────
  const hero = document.querySelector(".hero");
  if (hero && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    let raf = null;
    hero.addEventListener("mousemove", (e) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        hero.style.setProperty("--mx", `${x}%`);
        hero.style.setProperty("--my", `${y}%`);
      });
    });
  }
})();
