(function () {
  "use strict";

  var i18n = window.LujisI18n;
  var t = i18n ? i18n.t : function (key) { return key; };
  var API = window.LUJIS_API_BASE || "";

  // ---------- Footer year ----------
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Mobile nav ----------
  var navToggle = document.getElementById("navToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---------- Events ----------
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function formatDate(dateStr) {
    try {
      var d = new Date(dateStr + "T00:00:00");
      var formatted = new Intl.DateTimeFormat(i18n ? i18n.dateLocale() : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long"
      }).format(d);
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch (e) {
      return dateStr;
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function formatDateRange(dateStr, dateEndStr) {
    if (!dateEndStr || dateEndStr === dateStr) return formatDate(dateStr);
    try {
      var start = new Date(dateStr + "T00:00:00");
      var end = new Date(dateEndStr + "T00:00:00");
      var fmt = new Intl.DateTimeFormat(i18n ? i18n.dateLocale() : "en-US", { day: "numeric", month: "long" });
      return capitalize(fmt.format(start)) + " – " + capitalize(fmt.format(end));
    } catch (e) {
      return dateStr;
    }
  }

  function instagramHandle(url) {
    var match = String(url).match(/instagram\.com\/([^/?#]+)/i);
    return match ? "@" + match[1] : url;
  }

  var lastEvents = null;

  function renderEvents(events) {
    var list = document.getElementById("eventsList");
    if (!list) return;

    if (!events || events.length === 0) {
      list.innerHTML = '<p class="events-empty">' + escapeHtml(t("s5.empty")) + "</p>";
      return;
    }

    list.innerHTML = events
      .map(function (evt) {
        var mapSrc = "https://www.google.com/maps?q=" + encodeURIComponent(evt.address) + "&output=embed";
        var mediaHtml =
          '<div class="event-card__map"><iframe src="' +
          mapSrc +
          '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map of ' +
          escapeHtml(evt.place) +
          '"></iframe></div>';

        var extraLinks = "";
        if (evt.video) {
          extraLinks +=
            '<li><a href="#" class="event-card__watch-video" data-video="' +
            escapeHtml(evt.video) +
            '" data-poster="' +
            escapeHtml(evt.videoPoster || "") +
            '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9.5v5l4-2.5-4-2.5Z" fill="currentColor" stroke="none"/></svg>' +
            escapeHtml(t("s5.watchVideo")) +
            "</a></li>";
        }
        if (evt.mapsUrl) {
          extraLinks +=
            '<li><a href="' +
            escapeHtml(evt.mapsUrl) +
            '" target="_blank" rel="noopener">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>' +
            escapeHtml(t("s5.viewMap")) +
            "</a></li>";
        }
        if (evt.instagram) {
          extraLinks +=
            '<li><a href="' +
            escapeHtml(evt.instagram) +
            '" target="_blank" rel="noopener">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>' +
            escapeHtml(instagramHandle(evt.instagram)) +
            "</a></li>";
        }
        if (evt.flyer) {
          extraLinks +=
            '<li><a href="' +
            escapeHtml(evt.flyer) +
            '" target="_blank" rel="noopener">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5"/></svg>' +
            escapeHtml(t("s5.viewFlyer")) +
            "</a></li>";
        }

        return (
          '<article class="event-card">' +
          mediaHtml +
          '<div class="event-card__info">' +
          '<span class="event-card__date">' +
          escapeHtml(formatDateRange(evt.date, evt.dateEnd)) +
          "</span>" +
          '<h3 class="event-card__place">' +
          escapeHtml(evt.place) +
          "</h3>" +
          '<ul class="event-card__meta">' +
          "<li>" +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>' +
          escapeHtml(evt.address) +
          "</li>" +
          "<li>" +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>' +
          escapeHtml(evt.time) +
          "</li>" +
          extraLinks +
          "</ul>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  function loadEvents() {
    var list = document.getElementById("eventsList");
    if (!list) return;
    fetch(API + "/api/events")
      .then(function (res) {
        if (!res.ok) throw new Error("network");
        return res.json();
      })
      .then(function (events) {
        lastEvents = events;
        renderEvents(events);
      })
      .catch(function () {
        list.innerHTML = '<p class="events-empty">' + escapeHtml(t("s5.error")) + "</p>";
      });
  }

  loadEvents();

  // ---------- Event video lightbox ----------
  var videoLightbox = document.getElementById("videoLightbox");
  var videoLightboxVideo = videoLightbox ? videoLightbox.querySelector("video") : null;

  function openVideoLightbox(src, poster) {
    if (!videoLightbox || !videoLightboxVideo) return;
    videoLightboxVideo.src = src;
    if (poster) videoLightboxVideo.setAttribute("poster", poster);
    videoLightbox.hidden = false;
    videoLightboxVideo.play().catch(function () {});
  }

  function closeVideoLightbox() {
    if (!videoLightbox || !videoLightboxVideo) return;
    videoLightboxVideo.pause();
    videoLightboxVideo.removeAttribute("src");
    videoLightboxVideo.load();
    videoLightbox.hidden = true;
  }

  var eventsListEl = document.getElementById("eventsList");
  if (eventsListEl) {
    eventsListEl.addEventListener("click", function (e) {
      var link = e.target.closest(".event-card__watch-video");
      if (!link) return;
      e.preventDefault();
      openVideoLightbox(link.getAttribute("data-video"), link.getAttribute("data-poster"));
    });
  }

  if (videoLightbox) {
    videoLightbox.addEventListener("click", function (e) {
      if (e.target === videoLightbox || e.target.classList.contains("video-lightbox__backdrop")) {
        closeVideoLightbox();
      }
    });
    var lightboxCloseBtn = videoLightbox.querySelector(".video-lightbox__close");
    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener("click", closeVideoLightbox);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !videoLightbox.hidden) closeVideoLightbox();
    });
  }

  // ---------- Menu teaser ----------
  var lastProducts = null;

  function renderMenuTeaser(products) {
    var teaser = document.getElementById("menuTeaser");
    if (!teaser) return;

    if (!products || products.length === 0) {
      teaser.innerHTML = '<p class="events-empty">' + escapeHtml(t("s1.empty")) + "</p>";
      return;
    }

    var featured = products.slice(0, 4);
    teaser.innerHTML = featured
      .map(function (item, index) {
        var art = item.photo
          ? '<img src="' + escapeHtml(item.photo) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" width="240" height="180" />'
          : '<svg viewBox="0 0 120 100" aria-hidden="true"><path d="M10 55c0-24 22-45 50-45s50 21 50 45-22 40-50 40-50-16-50-40Z" fill="#F3D27A" stroke="#17130F" stroke-width="3"/><path d="M22 55h76" stroke="#8a4b1f" stroke-width="4" stroke-dasharray="1 8" stroke-linecap="round"/></svg>';
        var badge = index === 0 ? '<span class="empanada-card__badge">' + escapeHtml(t("s1.bestseller")) + "</span>" : "";

        return (
          '<article class="empanada-card">' +
          '<div class="empanada-card__art">' +
          badge +
          art +
          "</div>" +
          '<div class="empanada-card__body">' +
          "<h3>" +
          escapeHtml(item.title) +
          "</h3>" +
          "<p>" +
          escapeHtml(item.description || "") +
          "</p>" +
          '<span class="empanada-card__price">$' +
          Number(item.price).toFixed(2) +
          "</span>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  function loadMenuTeaser() {
    var teaser = document.getElementById("menuTeaser");
    if (!teaser) return;
    fetch(API + "/api/products")
      .then(function (res) {
        if (!res.ok) throw new Error("network");
        return res.json();
      })
      .then(function (products) {
        lastProducts = products;
        renderMenuTeaser(products);
      })
      .catch(function () {
        teaser.innerHTML = '<p class="events-empty">' + escapeHtml(t("s1.error")) + "</p>";
      });
  }

  loadMenuTeaser();

  // Re-render dynamic, language-dependent content when the language changes.
  document.addEventListener("i18n:change", function () {
    if (lastEvents !== null) renderEvents(lastEvents);
    if (lastProducts !== null) renderMenuTeaser(lastProducts);
  });

  // ---------- Contact form ----------
  var form = document.getElementById("contactForm");
  if (form) {
    var statusEl = document.getElementById("formStatus");

    function setFieldError(name, hasError) {
      var field = form.querySelector('[data-field="' + name + '"]');
      if (field) field.classList.toggle("has-error", hasError);
    }

    function validate() {
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      setFieldError("name", !name);
      setFieldError("email", !emailOk);
      setFieldError("message", !message);

      return Boolean(name) && emailOk && Boolean(message);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      statusEl.className = "form-status";
      statusEl.textContent = "";

      if (!validate()) {
        statusEl.className = "form-status is-error";
        statusEl.textContent = t("s6.statusFieldError");
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = t("s6.sending");

      fetch(API + "/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.value.trim(),
          email: form.email.value.trim(),
          phone: form.phone.value.trim(),
          message: form.message.value.trim()
        })
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.ok) {
            statusEl.className = "form-status is-success";
            statusEl.textContent = t("s6.successMsg");
            form.reset();
          } else {
            statusEl.className = "form-status is-error";
            statusEl.textContent = result.data.error || t("s6.networkError");
          }
        })
        .catch(function () {
          statusEl.className = "form-status is-error";
          statusEl.textContent = t("s6.networkError");
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = t("s6.submit");
        });
    });
  }
})();
