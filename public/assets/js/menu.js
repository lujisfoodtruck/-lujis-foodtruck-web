(function () {
  "use strict";

  var i18n = window.LujisI18n;
  var t = i18n ? i18n.t : function (key) { return key; };
  var API = window.LUJIS_API_BASE || "";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var WHATSAPP_NUMBER = "17866959263";

  var MENU = [];
  var SETTINGS = { deliveryDays: [2, 4], deliveryMinimum: 60 };
  var cart = {};
  var orderType = "pickup";

  function money(n) {
    return "$" + Number(n).toFixed(2);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function unitLabel(unit) {
    return unit === "docena" ? t("menu.unitDozen") : t("menu.unitEach");
  }

  function findItem(id) {
    return MENU.find(function (m) {
      return m.id === id;
    });
  }

  function cartTotal() {
    return Object.keys(cart).reduce(function (sum, id) {
      var item = findItem(id);
      return item ? sum + item.price * cart[id] : sum;
    }, 0);
  }

  // ---------- Menu rendering ----------
  function renderMenuRow(item) {
    var thumb = item.photo
      ? '<img class="menu-row-photo" src="' + escapeHtml(item.photo) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" width="64" height="64" />'
      : '<span class="menu-row-photo menu-row-photo--placeholder" aria-hidden="true">' +
        '<svg viewBox="0 0 120 100"><path d="M10 55c0-24 22-45 50-45s50 21 50 45-22 40-50 40-50-16-50-40Z" fill="#F3D27A" stroke="#17130F" stroke-width="4"/><path d="M22 55h76" stroke="#8a4b1f" stroke-width="5" stroke-dasharray="1 9" stroke-linecap="round"/></svg>' +
        "</span>";

    return (
      '<div class="menu-row" data-id="' +
      item.id +
      '">' +
      thumb +
      '<div class="menu-row-info">' +
      "<h3>" +
      escapeHtml(item.title) +
      "</h3>" +
      "<p>" +
      escapeHtml(item.description || "") +
      "</p>" +
      "</div>" +
      '<div class="menu-row-price">' +
      money(item.price) +
      ' <span style="font-family:var(--font-body); font-size:var(--fs-small); color:var(--color-muted);">/ ' +
      unitLabel(item.unit) +
      "</span></div>" +
      '<div class="qty-control">' +
      '<button type="button" class="qty-btn" data-action="dec" aria-label="Remove ' +
      escapeHtml(item.title) +
      '">-</button>' +
      '<span class="qty-value" data-qty="' +
      item.id +
      '">0</span>' +
      '<button type="button" class="qty-btn" data-action="inc" aria-label="Add ' +
      escapeHtml(item.title) +
      '">+</button>' +
      "</div>" +
      "</div>"
    );
  }

  function renderMenu() {
    var list = document.getElementById("menuList");

    if (MENU.length === 0) {
      list.innerHTML = '<p class="events-empty">' + escapeHtml(t("menu.unavailable")) + "</p>";
      return;
    }

    var fresh = MENU.filter(function (m) {
      return m.category !== "frozen";
    });
    var frozen = MENU.filter(function (m) {
      return m.category === "frozen";
    });

    var html = "";
    if (fresh.length) {
      html +=
        '<h2 class="menu-category-title">' +
        escapeHtml(t("menu.categoryFreshTitle")) +
        ' <span class="menu-category-tag">' +
        escapeHtml(t("menu.categoryFreshTag")) +
        "</span></h2>";
      html += fresh.map(renderMenuRow).join("");
    }
    if (frozen.length) {
      html +=
        '<h2 class="menu-category-title">' +
        escapeHtml(t("menu.categoryFrozenTitle")) +
        ' <span class="menu-category-tag">' +
        escapeHtml(t("menu.categoryFrozenTag")) +
        "</span></h2>";
      html += frozen.map(renderMenuRow).join("");
    }
    list.innerHTML = html;

    // Restore quantities already selected before a re-render (e.g. language change).
    Object.keys(cart).forEach(function (id) {
      var qtyEl = document.querySelector('[data-qty="' + id + '"]');
      if (qtyEl) qtyEl.textContent = String(cart[id]);
    });
  }

  // ---------- Cart ----------
  function renderCart() {
    var itemsEl = document.getElementById("cartItems");
    var totalEl = document.getElementById("cartTotal");

    var entries = Object.keys(cart)
      .map(function (id) {
        return { menuItem: findItem(id), qty: cart[id] };
      })
      .filter(function (e) {
        return e.menuItem && e.qty > 0;
      });

    if (entries.length === 0) {
      itemsEl.innerHTML = '<p class="cart-empty">' + escapeHtml(t("menu.cartEmpty")) + "</p>";
    } else {
      itemsEl.innerHTML = entries
        .map(function (e) {
          var subtotal = e.menuItem.price * e.qty;
          return (
            '<div class="cart-item"><span>' +
            e.qty +
            " " +
            unitLabel(e.menuItem.unit) +
            " × " +
            escapeHtml(e.menuItem.title) +
            "</span><span>" +
            money(subtotal) +
            "</span></div>"
          );
        })
        .join("");
    }

    totalEl.textContent = money(cartTotal());
    updateOrderValidity();
  }

  function updateQty(id, delta) {
    var current = cart[id] || 0;
    var next = Math.max(0, Math.min(50, current + delta));
    cart[id] = next;
    var qtyEl = document.querySelector('[data-qty="' + id + '"]');
    if (qtyEl) qtyEl.textContent = String(next);
    renderCart();
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".qty-btn");
    if (!btn) return;
    var row = btn.closest(".menu-row");
    var id = row.getAttribute("data-id");
    updateQty(id, btn.getAttribute("data-action") === "inc" ? 1 : -1);
  });

  // ---------- Order type ----------
  var orderTypeButtons = document.querySelectorAll(".order-type-btn");
  var deliveryFields = document.getElementById("deliveryFields");

  orderTypeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      orderType = btn.getAttribute("data-order-type");
      orderTypeButtons.forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      deliveryFields.classList.toggle("is-visible", orderType === "delivery");
      updateOrderValidity();
    });
  });

  function nextValidDeliveryDates(days, count) {
    var results = [];
    var cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    var guard = 0;
    while (results.length < count && guard < 60) {
      if (days.indexOf(cursor.getDay()) !== -1) {
        results.push(new Date(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
      guard++;
    }
    return results;
  }

  function formatDateOption(date) {
    var formatted = new Intl.DateTimeFormat(i18n ? i18n.dateLocale() : "en-US", {
      weekday: "long",
      day: "numeric",
      month: "long"
    }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  function toISODate(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, "0");
    var d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function renderDeliverySettings() {
    var dayNames = SETTINGS.deliveryDays.map(function (d) {
      return t("days." + d);
    });
    document.getElementById("deliveryNote").textContent = t("menu.deliveryAvailable", {
      days: dayNames.join(" " + t("common.and") + " "),
      minimum: money(SETTINGS.deliveryMinimum)
    });

    var select = document.getElementById("orderDeliveryDate");
    var previousValue = select.value;
    var dates = nextValidDeliveryDates(SETTINGS.deliveryDays, 8);
    select.innerHTML = dates
      .map(function (d) {
        return '<option value="' + toISODate(d) + '">' + formatDateOption(d) + "</option>";
      })
      .join("");
    if (previousValue) select.value = previousValue;
  }

  // ---------- Validation ----------
  function updateOrderValidity() {
    var sendBtn = document.getElementById("sendOrderBtn");
    var warning = document.getElementById("minimumWarning");
    var total = cartTotal();
    var hasItems = total > 0;

    if (orderType === "delivery" && total > 0 && total < SETTINGS.deliveryMinimum) {
      var missing = SETTINGS.deliveryMinimum - total;
      warning.textContent = t("menu.minimumWarning", {
        amount: money(missing),
        minimum: money(SETTINGS.deliveryMinimum)
      });
      warning.classList.add("is-visible");
      sendBtn.disabled = true;
      return;
    }

    warning.classList.remove("is-visible");
    sendBtn.disabled = !hasItems;
  }

  // ---------- Send order ----------
  document.getElementById("sendOrderBtn").addEventListener("click", function () {
    var entries = Object.keys(cart)
      .map(function (id) {
        return { menuItem: findItem(id), qty: cart[id] };
      })
      .filter(function (e) {
        return e.menuItem && e.qty > 0;
      });

    if (entries.length === 0) return;

    var firstName = document.getElementById("orderFirstName").value.trim();
    var lastName = document.getElementById("orderLastName").value.trim();
    var phone = document.getElementById("orderPhone").value.trim();
    var zip = document.getElementById("orderZip").value.trim();
    var deliverySelect = document.getElementById("orderDeliveryDate");
    var deliveryDateLabel = deliverySelect.options[deliverySelect.selectedIndex]
      ? deliverySelect.options[deliverySelect.selectedIndex].text
      : "";
    var note = document.getElementById("orderNote").value.trim();

    if (!firstName || !lastName || !phone) {
      alert(t("menu.alertNamePhone"));
      return;
    }
    if (orderType === "delivery" && !zip) {
      alert(t("menu.alertZip"));
      return;
    }

    var total = cartTotal();
    if (orderType === "delivery" && total < SETTINGS.deliveryMinimum) {
      alert(t("menu.alertMinimum", { minimum: money(SETTINGS.deliveryMinimum) }));
      return;
    }

    var lines = [t("menu.waGreeting"), ""];
    lines.push(t("menu.waOrderType") + " " + (orderType === "delivery" ? t("menu.waDeliveryValue") : t("menu.waPickupValue")));
    lines.push(t("menu.waName") + " " + firstName + " " + lastName);
    lines.push(t("menu.waPhone") + " " + phone);
    if (orderType === "delivery") {
      lines.push(t("menu.waZip") + " " + zip);
      lines.push(t("menu.waDate") + " " + deliveryDateLabel);
    }
    lines.push("");
    entries.forEach(function (e) {
      lines.push(e.qty + " " + unitLabel(e.menuItem.unit) + " x " + e.menuItem.title + " - " + money(e.menuItem.price * e.qty));
    });
    lines.push("");
    lines.push(t("menu.waTotal") + " " + money(total));
    if (note) {
      lines.push("");
      lines.push(t("menu.waNotes") + " " + note);
    }

    var text = encodeURIComponent(lines.join("\n"));
    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;
    window.open(url, "_blank", "noopener");
  });

  // ---------- Re-render on language change ----------
  document.addEventListener("i18n:change", function () {
    if (MENU.length) {
      renderMenu();
      renderCart();
      renderDeliverySettings();
    }
  });

  // ---------- Init ----------
  Promise.all([
    fetch(API + "/api/products").then(function (r) {
      return r.json();
    }),
    fetch(API + "/api/settings").then(function (r) {
      return r.json();
    })
  ])
    .then(function (results) {
      MENU = results[0];
      SETTINGS = results[1];
      renderMenu();
      renderCart();
      renderDeliverySettings();
    })
    .catch(function () {
      document.getElementById("menuList").innerHTML =
        '<p class="events-empty">' + escapeHtml(t("menu.loadError")) + "</p>";
    });
})();
