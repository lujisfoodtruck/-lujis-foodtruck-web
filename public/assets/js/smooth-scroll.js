(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || typeof gsap === "undefined") {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ---------- Lenis smooth scroll ----------
  if (typeof Lenis !== "undefined") {
    var lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (id.length > 1 && document.querySelector(id)) {
          e.preventDefault();
          lenis.scrollTo(id, { offset: -70 });
        }
      });
    });
  }

  // ---------- Entrance animations ----------
  function reveal(selector, vars) {
    var items = gsap.utils.toArray(selector);
    if (!items.length) return;

    items.forEach(function (item, index) {
      gsap.set(item, { opacity: 0, y: 32 });

      ScrollTrigger.create({
        trigger: item,
        start: "top 90%",
        once: true,
        onEnter: function () {
          gsap.to(
            item,
            Object.assign(
              {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: "power2.out",
                delay: (index % 4) * 0.1
              },
              vars || {}
            )
          );
        }
      });
    });
  }

  // ---------- Hero side empanadas: scroll parallax ----------
  function heroParallax() {
    var left = document.querySelector(".hero-side-empanada--left");
    var right = document.querySelector(".hero-side-empanada--right");
    var hero = document.querySelector(".hero");
    if (!left || !right || !hero) return;

    gsap.set(left, { rotate: -10 });
    gsap.set(right, { rotate: 10 });

    gsap.to(left, {
      y: -90,
      rotate: -25,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 }
    });
    gsap.to(right, {
      y: -90,
      rotate: 25,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 }
    });
  }

  window.addEventListener("load", function () {
    reveal(".section-head");
    reveal(".card");
    reveal(".empanada-card");
    reveal(".event-card");
    reveal(".catering-card");
    reveal(".polaroid");
    reveal(".menu-row");
    heroParallax();
    ScrollTrigger.refresh();
  });
})();
