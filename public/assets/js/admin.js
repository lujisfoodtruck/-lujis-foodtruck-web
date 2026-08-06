(function () {
  "use strict";

  var API = window.LUJIS_API_BASE || "";

  function apiFetch(path, options) {
    options = options || {};
    options.credentials = "include";
    return fetch(API + path, options);
  }

  var loginView = document.getElementById("loginView");
  var dashboardView = document.getElementById("dashboardView");
  var loginForm = document.getElementById("loginForm");
  var loginStatus = document.getElementById("loginStatus");
  var logoutBtn = document.getElementById("logoutBtn");
  var createForm = document.getElementById("createForm");
  var createStatus = document.getElementById("createStatus");
  var listEl = document.getElementById("eventsAdminList");
  var createProductForm = document.getElementById("createProductForm");
  var createProductStatus = document.getElementById("createProductStatus");
  var productsListEl = document.getElementById("productsAdminList");
  var tabs = document.querySelectorAll(".admin-tab");

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function showDashboard() {
    loginView.style.display = "none";
    dashboardView.style.display = "block";
    loadEvents();
    loadProducts();
    loadSettings();
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
      });
      tab.classList.add("is-active");
      document.querySelectorAll(".admin-panel").forEach(function (panel) {
        panel.classList.remove("is-active");
      });
      document.getElementById("panel-" + tab.getAttribute("data-tab")).classList.add("is-active");
    });
  });

  function showLogin() {
    dashboardView.style.display = "none";
    loginView.style.display = "block";
  }

  function checkSession() {
    apiFetch("/api/admin/session")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data.isAdmin) showDashboard();
        else showLogin();
      })
      .catch(showLogin);
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    loginStatus.className = "form-status";
    var password = document.getElementById("password").value;

    apiFetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: password })
    })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok) {
          loginForm.reset();
          showDashboard();
        } else {
          loginStatus.className = "form-status is-error";
          loginStatus.textContent = result.data.error || "Contraseña incorrecta.";
        }
      })
      .catch(function () {
        loginStatus.className = "form-status is-error";
        loginStatus.textContent = "No pudimos conectar con el servidor.";
      });
  });

  logoutBtn.addEventListener("click", function () {
    apiFetch("/api/admin/logout", { method: "POST" }).finally(showLogin);
  });

  function renderRow(evt) {
    return (
      '<div class="admin-event-row" data-id="' +
      evt.id +
      '">' +
      '<div class="row-view">' +
      "<strong>" +
      escapeHtml(evt.place) +
      "</strong><br/>" +
      "<span>" +
      escapeHtml(evt.address) +
      "</span><br/>" +
      "<span>" +
      escapeHtml(evt.date) +
      " · " +
      escapeHtml(evt.time) +
      "</span>" +
      '<div class="row-actions">' +
      '<button class="btn btn--sm" data-action="edit">Editar</button>' +
      '<button class="btn btn--sm btn--primary" data-action="delete">Eliminar</button>' +
      "</div>" +
      "</div>" +
      '<div class="row-edit">' +
      '<div class="form-row form-row--2">' +
      '<div class="field"><label>Lugar</label><input type="text" class="edit-place" value="' +
      escapeHtml(evt.place) +
      '" maxlength="150" /></div>' +
      '<div class="field"><label>Dirección</label><input type="text" class="edit-address" value="' +
      escapeHtml(evt.address) +
      '" maxlength="200" /></div>' +
      "</div>" +
      '<div class="form-row form-row--2">' +
      '<div class="field"><label>Fecha</label><input type="date" class="edit-date" value="' +
      escapeHtml(evt.date) +
      '" /></div>' +
      '<div class="field"><label>Horario</label><input type="text" class="edit-time" value="' +
      escapeHtml(evt.time) +
      '" maxlength="60" /></div>' +
      "</div>" +
      '<div class="row-actions">' +
      '<button class="btn btn--sm btn--primary" data-action="save">Guardar</button>' +
      '<button class="btn btn--sm" data-action="cancel">Cancelar</button>' +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function loadEvents() {
    apiFetch("/api/events")
      .then(function (r) {
        return r.json();
      })
      .then(function (events) {
        if (!events.length) {
          listEl.innerHTML = '<p class="events-empty">No hay eventos cargados todavía.</p>';
          return;
        }
        listEl.innerHTML = events.map(renderRow).join("");
      });
  }

  createForm.addEventListener("submit", function (e) {
    e.preventDefault();
    createStatus.className = "form-status";

    var payload = {
      place: document.getElementById("new-place").value.trim(),
      address: document.getElementById("new-address").value.trim(),
      date: document.getElementById("new-date").value,
      time: document.getElementById("new-time").value.trim()
    };

    apiFetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok) {
          createForm.reset();
          loadEvents();
        } else {
          createStatus.className = "form-status is-error";
          createStatus.textContent = result.data.error || "No se pudo crear el evento.";
        }
      });
  });

  listEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) return;
    var row = btn.closest(".admin-event-row");
    var id = row.getAttribute("data-id");
    var action = btn.getAttribute("data-action");

    if (action === "edit") {
      row.classList.add("is-editing");
    } else if (action === "cancel") {
      row.classList.remove("is-editing");
    } else if (action === "delete") {
      if (!confirm("¿Eliminar este evento?")) return;
      apiFetch("/api/admin/events/" + id, { method: "DELETE" }).then(loadEvents);
    } else if (action === "save") {
      var payload = {
        place: row.querySelector(".edit-place").value.trim(),
        address: row.querySelector(".edit-address").value.trim(),
        date: row.querySelector(".edit-date").value,
        time: row.querySelector(".edit-time").value.trim()
      };
      apiFetch("/api/admin/events/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(loadEvents);
    }
  });

  // ---------- Products ----------
  function money(n) {
    return "$" + Number(n).toFixed(2);
  }

  function categoryLabel(category) {
    return category === "frozen" ? "Congelado" : "Fresco";
  }

  function unitLabel(unit) {
    return unit === "docena" ? "docena" : "un.";
  }

  function renderProductRow(p) {
    var photoView = p.photo
      ? '<img class="admin-product-photo" src="' + escapeHtml(p.photo) + '" alt="" />'
      : '<div class="admin-product-photo" aria-hidden="true"></div>';

    return (
      '<div class="admin-product-row" data-id="' +
      p.id +
      '">' +
      photoView +
      '<div class="row-view">' +
      "<strong>" +
      escapeHtml(p.title) +
      "</strong> — " +
      money(p.price) +
      " / " +
      unitLabel(p.unit) +
      ' <span class="empanada-card__badge" style="position:static; display:inline-flex;">' +
      categoryLabel(p.category) +
      "</span>" +
      "<br/>" +
      "<span>" +
      escapeHtml(p.description || "") +
      "</span>" +
      '<div class="row-actions">' +
      '<button class="btn btn--sm" data-action="edit">Editar</button>' +
      '<button class="btn btn--sm btn--primary" data-action="delete">Eliminar</button>' +
      "</div>" +
      "</div>" +
      '<div class="row-edit">' +
      '<div class="form-row form-row--2">' +
      '<div class="field"><label>Título</label><input type="text" class="edit-title" value="' +
      escapeHtml(p.title) +
      '" maxlength="100" /></div>' +
      '<div class="field"><label>Precio (USD)</label><input type="number" min="0" step="0.25" class="edit-price" value="' +
      p.price +
      '" /></div>' +
      "</div>" +
      '<div class="form-row form-row--2">' +
      '<div class="field"><label>Categoría</label><select class="edit-category">' +
      '<option value="fresh"' +
      (p.category !== "frozen" ? " selected" : "") +
      ">Fresco (menú del truck)</option>" +
      '<option value="frozen"' +
      (p.category === "frozen" ? " selected" : "") +
      ">Congelado (para llevar)</option>" +
      "</select></div>" +
      '<div class="field"><label>Se vende por</label><select class="edit-unit">' +
      '<option value="un"' +
      (p.unit !== "docena" ? " selected" : "") +
      ">Unidad</option>" +
      '<option value="docena"' +
      (p.unit === "docena" ? " selected" : "") +
      ">Docena</option>" +
      "</select></div>" +
      "</div>" +
      '<div class="form-row">' +
      '<div class="field"><label>Descripción</label><input type="text" class="edit-desc" value="' +
      escapeHtml(p.description || "") +
      '" maxlength="300" /></div>' +
      "</div>" +
      '<div class="form-row">' +
      '<div class="field"><label>Reemplazar foto (opcional)</label><input type="file" class="edit-photo" accept="image/png,image/jpeg,image/webp" /></div>' +
      "</div>" +
      '<div class="row-actions">' +
      '<button class="btn btn--sm btn--primary" data-action="save">Guardar</button>' +
      '<button class="btn btn--sm" data-action="cancel">Cancelar</button>' +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function loadProducts() {
    apiFetch("/api/products")
      .then(function (r) {
        return r.json();
      })
      .then(function (products) {
        if (!products.length) {
          productsListEl.innerHTML = '<p class="events-empty">No hay productos cargados todavía.</p>';
          return;
        }
        productsListEl.innerHTML = products.map(renderProductRow).join("");
      });
  }

  createProductForm.addEventListener("submit", function (e) {
    e.preventDefault();
    createProductStatus.className = "form-status";

    var formData = new FormData();
    formData.append("title", document.getElementById("new-p-title").value.trim());
    formData.append("price", document.getElementById("new-p-price").value);
    formData.append("category", document.getElementById("new-p-category").value);
    formData.append("unit", document.getElementById("new-p-unit").value);
    formData.append("description", document.getElementById("new-p-desc").value.trim());
    var fileInput = document.getElementById("new-p-photo");
    if (fileInput.files[0]) formData.append("photo", fileInput.files[0]);

    var createSubmitBtn = createProductForm.querySelector('button[type="submit"]');
    createSubmitBtn.disabled = true;

    apiFetch("/api/admin/products", { method: "POST", body: formData })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok) {
          createProductForm.reset();
          loadProducts();
        } else {
          createProductStatus.className = "form-status is-error";
          createProductStatus.textContent = result.data.error || "No se pudo crear el producto.";
        }
      })
      .catch(function () {
        createProductStatus.className = "form-status is-error";
        createProductStatus.textContent = "No pudimos conectar con el servidor. Intentá de nuevo.";
      })
      .finally(function () {
        createSubmitBtn.disabled = false;
      });
  });

  productsListEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) return;
    var row = btn.closest(".admin-product-row");
    var id = row.getAttribute("data-id");
    var action = btn.getAttribute("data-action");

    if (action === "edit") {
      row.classList.add("is-editing");
    } else if (action === "cancel") {
      row.classList.remove("is-editing");
    } else if (action === "delete") {
      if (!confirm("¿Eliminar este producto?")) return;
      apiFetch("/api/admin/products/" + id, { method: "DELETE" }).then(loadProducts);
    } else if (action === "save") {
      var formData = new FormData();
      formData.append("title", row.querySelector(".edit-title").value.trim());
      formData.append("price", row.querySelector(".edit-price").value);
      formData.append("category", row.querySelector(".edit-category").value);
      formData.append("unit", row.querySelector(".edit-unit").value);
      formData.append("description", row.querySelector(".edit-desc").value.trim());
      var fileInput = row.querySelector(".edit-photo");
      if (fileInput.files[0]) formData.append("photo", fileInput.files[0]);

      apiFetch("/api/admin/products/" + id, { method: "PUT", body: formData })
        .then(function (r) {
          return r.json().then(function (data) {
            return { ok: r.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.ok) {
            loadProducts();
          } else {
            alert(result.data.error || "No se pudo guardar el producto.");
          }
        })
        .catch(function () {
          alert("No pudimos conectar con el servidor. Intentá de nuevo.");
        });
    }
  });

  // ---------- Order settings ----------
  var settingsForm = document.getElementById("settingsForm");
  var settingsStatus = document.getElementById("settingsStatus");

  function loadSettings() {
    apiFetch("/api/settings")
      .then(function (r) {
        return r.json();
      })
      .then(function (settings) {
        document.querySelectorAll(".delivery-day").forEach(function (cb) {
          cb.checked = settings.deliveryDays.indexOf(Number(cb.value)) !== -1;
        });
        document.getElementById("delivery-minimum").value = settings.deliveryMinimum;
        document.getElementById("half-dozen-price").value = settings.halfDozenPrice;
        document.getElementById("dozen-price").value = settings.dozenPrice;
      });
  }

  settingsForm.addEventListener("submit", function (e) {
    e.preventDefault();
    settingsStatus.className = "form-status";

    var deliveryDays = Array.from(document.querySelectorAll(".delivery-day:checked")).map(function (cb) {
      return Number(cb.value);
    });

    apiFetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deliveryDays: deliveryDays,
        deliveryMinimum: document.getElementById("delivery-minimum").value,
        halfDozenPrice: document.getElementById("half-dozen-price").value,
        dozenPrice: document.getElementById("dozen-price").value
      })
    })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok) {
          settingsStatus.className = "form-status is-success";
          settingsStatus.textContent = "Condiciones guardadas.";
        } else {
          settingsStatus.className = "form-status is-error";
          settingsStatus.textContent = result.data.error || "No se pudieron guardar las condiciones.";
        }
      });
  });

  checkSession();
})();
