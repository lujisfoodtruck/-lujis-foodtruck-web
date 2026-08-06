(function () {
  "use strict";

  var STORAGE_KEY = "lujis_lang";
  var DEFAULT_LANG = "en";

  var dict = {
    en: {
      "a11y.skipLink": "Skip to content",
      "a11y.openMenu": "Open menu",

      "nav.menu": "Menu",
      "nav.about": "About",
      "nav.catering": "Catering",
      "nav.events": "Events",
      "nav.contact": "Contact",
      "nav.orderNow": "Order Now",

      "hero.badge": "Miami · Argentinian Food Truck",
      "hero.text": "Argentinian Food Truck. Private events, corporate catering & more.",
      "hero.cta1": "Order Now",
      "hero.cta2": "Catering & Events",
      "hero.stat1": "Handcrafted",
      "hero.stat2": "Rated by fans",
      "hero.stat3value": "Daily",
      "hero.stat3": "Fresh from the truck",
      "hero.truckBadge": "We're here!",

      "s1.eyebrow": "Our Menu",
      "s1.title": "Explore the delicious popular empanadas",
      "s1.sub": "Pick your favorites and build your order in seconds. This is a preview — the full menu with every flavor is one click away.",
      "s1.loading": "Loading menu…",
      "s1.cta": "See full menu & order",
      "s1.error": "We couldn't load the menu right now.",
      "s1.empty": "Menu isn't available right now.",
      "s1.bestseller": "Bestseller",

      "s2.eyebrow": "Why choose us",
      "s2.title": "We Offer quality service That Customers Needs",
      "s2.f1title": "Our Heritage",
      "s2.f1desc": "Handcrafted empanadas honoring Argentina's culinary tradition.",
      "s2.f2title": "Quality Ingredients",
      "s2.f2desc": "Only grass-fed beef and farm-fresh produce in every bite.",
      "s2.f3title": "Daily Fresh",
      "s2.f3desc": "Every empanada is made from scratch on our truck with care.",

      "s3.fifaBadge": "Official FIFA World Cup 26™ Miami Vendor · Catering & Wholesale",
      "s3.title": "For Events, Restaurants & Venues",
      "s3.sub": "WE CATER EVENTS & SUPPLY RESTAURANTS",
      "s3.c1title": "Private Events",
      "s3.c1desc": "Weddings, corporate lunches, dinners, festivals, breweries, birthday parties, and more. We'd love to be part of your next event.",
      "s3.c1cta": "Book your event",
      "s3.c2title": "Restaurants & Venues (B2B)",
      "s3.c2desc": "We supply restaurants, hotels, and food businesses with frozen raw empanadas in bulk. Consistent quality, authentic Argentine recipes, flexible quantities. Contact us to discuss wholesale pricing.",
      "s3.c2cta": "Get wholesale pricing",
      "s3.photo1": "Our stand at Fan Festival Miami",
      "s3.photo2": "Official menu, official vendor",
      "s3.photo3": "Right in the heart of Fan Festival Miami",
      "s3.photo4": "Thousands of fans, one big festival",

      "gallery.eyebrow": "Follow the Truck",
      "gallery.title": "Straight From The Window",
      "gallery.sub": "Real empanadas, real truck, real Miami sunsets.",
      "gallery.caption1": "Straight off the grill",
      "gallery.caption2": "Handmade, every fold",
      "gallery.caption3": "Golden hour, Luji's hour",
      "gallery.caption4": "Hot off the fryer",
      "gallery.cta": "Follow @lujisfoodtruck",

      "s4.eyebrow": "Testimonials",
      "s4.title": "What have lot's off happy customer explore feedback",

      "s5.eyebrow": "Find the truck",
      "s5.title": "Upcoming Events",
      "s5.sub": "Follow the food truck to its next stop — place, address, date, and time.",
      "s5.loading": "Loading upcoming events…",
      "s5.empty": "No events scheduled yet. Check back soon!",
      "s5.error": "We couldn't load events right now.",

      "s6.eyebrow": "Contact Us",
      "s6.title": "Have any lunch or dinner plan?",
      "s6.sub": "We Offer quality food for lunch & dinner",
      "s6.hours": "Mon to Sun · 11am – 9pm",
      "s6.emailNote": "Catering & wholesale inquiries",
      "s6.locationNote": "See upcoming stops above ↑",
      "s6.name": "Name",
      "s6.nameError": "Please enter your name.",
      "s6.email": "Email",
      "s6.emailError": "Please enter a valid email.",
      "s6.phone": "Phone",
      "s6.message": "Message",
      "s6.messagePlaceholder": "Tell us about your event, date and guest count...",
      "s6.messageError": "Please write your message.",
      "s6.submit": "Send Message",
      "s6.sending": "Sending...",
      "s6.statusFieldError": "Please check the fields marked in red.",
      "s6.successMsg": "Thanks! We'll get back to you shortly.",
      "s6.networkError": "We couldn't send your message. Please try again in a few minutes.",

      "footer.tagline": "Handcrafted Argentine empanadas, made fresh every day on our food truck in Miami.",
      "footer.linksTitle": "Quick Links",
      "footer.servicesTitle": "Services",
      "footer.service1": "Private Events",
      "footer.service2": "Corporate Catering",
      "footer.service3": "Wholesale",
      "footer.contactTitle": "Contact",
      "footer.rights": "All rights reserved.",

      "menu.viewOrder": "View Order",
      "menu.eyebrow": "Full Menu",
      "menu.title": "Build Your Order",
      "menu.sub": "Pick your quantities and send your order straight to WhatsApp. No hassle, Argentine flavor in minutes.",
      "menu.categoryFreshTitle": "Truck Menu",
      "menu.categoryFreshTag": "made fresh today",
      "menu.categoryFrozenTitle": "Frozen To-Go",
      "menu.categoryFrozenTag": "raw, cook at home · sold by the dozen",
      "menu.cartTitle": "Your Order",
      "menu.pickup": "Pickup at the Truck",
      "menu.delivery": "Delivery",
      "menu.cartEmpty": "You haven't added any empanadas yet.",
      "menu.firstName": "First Name",
      "menu.lastName": "Last Name",
      "menu.phone": "Phone",
      "menu.zip": "Zip Code",
      "menu.deliveryDate": "Delivery Date",
      "menu.notes": "Notes (time, special requests)",
      "menu.notesPlaceholder": "E.g. Pickup today at 7pm",
      "menu.sendOrder": "Send Order via WhatsApp",
      "menu.loading": "Loading menu…",
      "menu.unavailable": "Menu isn't available right now.",
      "menu.loadError": "We couldn't load the menu right now.",
      "menu.deliveryAvailable": "Delivery available on {days}. Minimum order {minimum}.",
      "menu.minimumWarning": "You need {amount} more to reach the {minimum} delivery minimum.",
      "menu.alertNamePhone": "Please fill in your name, last name and phone to send the order.",
      "menu.alertZip": "Please fill in the Zip Code for delivery.",
      "menu.alertMinimum": "The minimum order for delivery is {minimum}.",
      "menu.waGreeting": "Hi Luji's Foodtruck! I'd like to place this order:",
      "menu.waOrderType": "Order type:",
      "menu.waDeliveryValue": "Delivery",
      "menu.waPickupValue": "Pickup at the truck",
      "menu.waName": "Name:",
      "menu.waPhone": "Phone:",
      "menu.waZip": "Zip Code:",
      "menu.waDate": "Delivery date:",
      "menu.waTotal": "Total:",
      "menu.waNotes": "Notes:",
      "menu.unitEach": "ea.",
      "menu.unitDozen": "dozen",
      "menu.dozenGroup": "{n}x Dozen (12 empanadas each, any flavors)",
      "menu.halfDozenGroup": "Half dozen (6 empanadas, any flavors)",
      "menu.remainderGroup": "{n} individual empanada(s)",

      "days.0": "Sunday",
      "days.1": "Monday",
      "days.2": "Tuesday",
      "days.3": "Wednesday",
      "days.4": "Thursday",
      "days.5": "Friday",
      "days.6": "Saturday",
      "common.and": "and"
    },

    es: {
      "a11y.skipLink": "Saltar al contenido",
      "a11y.openMenu": "Abrir menú",

      "nav.menu": "Menú",
      "nav.about": "Nosotros",
      "nav.catering": "Catering",
      "nav.events": "Eventos",
      "nav.contact": "Contacto",
      "nav.orderNow": "Ordená Ahora",

      "hero.badge": "Miami · Food Truck Argentino",
      "hero.text": "Food Truck Argentino. Eventos privados, catering corporativo y más.",
      "hero.cta1": "Ordená Ahora",
      "hero.cta2": "Catering y Eventos",
      "hero.stat1": "Artesanales",
      "hero.stat2": "Calificado por fans",
      "hero.stat3value": "A Diario",
      "hero.stat3": "Fresco desde el truck",
      "hero.truckBadge": "¡Ya llegamos!",

      "s1.eyebrow": "Nuestro Menú",
      "s1.title": "Descubrí nuestras deliciosas empanadas más populares",
      "s1.sub": "Elegí tus favoritas y armá tu pedido en segundos. Este es un adelanto — el menú completo con todos los sabores está a un click.",
      "s1.loading": "Cargando menú…",
      "s1.cta": "Ver menú completo y pedir",
      "s1.error": "No pudimos cargar el menú en este momento.",
      "s1.empty": "El menú no está disponible en este momento.",
      "s1.bestseller": "Más Vendido",

      "s2.eyebrow": "Por qué elegirnos",
      "s2.title": "Ofrecemos un servicio de calidad que nuestros clientes necesitan",
      "s2.f1title": "Nuestra Herencia",
      "s2.f1desc": "Empanadas artesanales que honran la tradición culinaria argentina.",
      "s2.f2title": "Ingredientes de Calidad",
      "s2.f2desc": "Solo carne de pastoreo e ingredientes frescos de campo en cada bocado.",
      "s2.f3title": "Frescura Diaria",
      "s2.f3desc": "Cada empanada se hace desde cero en nuestro truck con dedicación.",

      "s3.fifaBadge": "Vendedor Oficial de la Copa Mundial FIFA 26™ en Miami · Catering y Mayorista",
      "s3.title": "Para Eventos, Restaurantes y Locales",
      "s3.sub": "HACEMOS CATERING DE EVENTOS Y ABASTECEMOS RESTAURANTES",
      "s3.c1title": "Eventos Privados",
      "s3.c1desc": "Casamientos, almuerzos corporativos, cenas, festivales, cervecerías, cumpleaños y más. Nos encantaría ser parte de tu próximo evento.",
      "s3.c1cta": "Reservá tu evento",
      "s3.c2title": "Restaurantes y Locales (B2B)",
      "s3.c2desc": "Abastecemos restaurantes, hoteles y comercios gastronómicos con empanadas crudas congeladas al por mayor. Calidad consistente, recetas argentinas auténticas, cantidades flexibles. Contactanos para hablar de precios mayoristas.",
      "s3.c2cta": "Consultá precios mayoristas",
      "s3.photo1": "Nuestro stand en el Fan Festival Miami",
      "s3.photo2": "Menú oficial, vendedor oficial",
      "s3.photo3": "En el corazón del Fan Festival Miami",
      "s3.photo4": "Miles de fanáticos, un solo gran festival",

      "gallery.eyebrow": "Seguí al Truck",
      "gallery.title": "Directo Desde la Ventanilla",
      "gallery.sub": "Empanadas reales, truck real, atardeceres reales en Miami.",
      "gallery.caption1": "Recién salidas",
      "gallery.caption2": "Hechas a mano, pliegue a pliegue",
      "gallery.caption3": "La hora dorada es la hora de Luji's",
      "gallery.caption4": "Recién fritas",
      "gallery.cta": "Seguinos @lujisfoodtruck",

      "s4.eyebrow": "Testimonios",
      "s4.title": "Descubrí lo que dicen nuestros clientes felices",

      "s5.eyebrow": "Encontrá al Truck",
      "s5.title": "Próximos Eventos",
      "s5.sub": "Seguí al food truck hasta su próxima parada — lugar, dirección, fecha y horario.",
      "s5.loading": "Cargando próximos eventos…",
      "s5.empty": "Todavía no hay eventos programados. ¡Volvé pronto!",
      "s5.error": "No pudimos cargar los eventos en este momento.",

      "s6.eyebrow": "Contáctanos",
      "s6.title": "¿Tenés planes de almuerzo o cena?",
      "s6.sub": "Ofrecemos comida de calidad para almuerzo y cena",
      "s6.hours": "Lun a Dom · 11am – 9pm",
      "s6.emailNote": "Consultas de catering y mayorista",
      "s6.locationNote": "Mirá las próximas paradas arriba ↑",
      "s6.name": "Nombre",
      "s6.nameError": "Contanos tu nombre.",
      "s6.email": "Email",
      "s6.emailError": "Ingresá un email válido.",
      "s6.phone": "Teléfono",
      "s6.message": "Mensaje",
      "s6.messagePlaceholder": "Contanos sobre tu evento, fecha y cantidad de invitados...",
      "s6.messageError": "Escribinos tu mensaje.",
      "s6.submit": "Enviar Mensaje",
      "s6.sending": "Enviando...",
      "s6.statusFieldError": "Revisá los campos marcados en rojo.",
      "s6.successMsg": "¡Gracias! Te vamos a contactar a la brevedad.",
      "s6.networkError": "No pudimos enviar tu mensaje. Intentá de nuevo en unos minutos.",

      "footer.tagline": "Empanadas argentinas artesanales, hechas frescas cada día en nuestro food truck en Miami.",
      "footer.linksTitle": "Enlaces",
      "footer.servicesTitle": "Servicios",
      "footer.service1": "Eventos Privados",
      "footer.service2": "Catering Corporativo",
      "footer.service3": "Venta Mayorista",
      "footer.contactTitle": "Contacto",
      "footer.rights": "Todos los derechos reservados.",

      "menu.viewOrder": "Ver Pedido",
      "menu.eyebrow": "Menú Completo",
      "menu.title": "Armá tu Pedido",
      "menu.sub": "Elegí cantidades y enviá tu pedido directo por WhatsApp. Sin vueltas, sabor argentino en minutos.",
      "menu.categoryFreshTitle": "Menú del Truck",
      "menu.categoryFreshTag": "recién hechas",
      "menu.categoryFrozenTitle": "Congeladas para Llevar",
      "menu.categoryFrozenTag": "crudas, para cocinar en casa · se venden por docena",
      "menu.cartTitle": "Tu Pedido",
      "menu.pickup": "Retiro en el Truck",
      "menu.delivery": "Delivery",
      "menu.cartEmpty": "Todavía no agregaste empanadas.",
      "menu.firstName": "Nombre",
      "menu.lastName": "Apellido",
      "menu.phone": "Teléfono",
      "menu.zip": "Código Postal",
      "menu.deliveryDate": "Fecha de Entrega",
      "menu.notes": "Notas (horario, aclaraciones)",
      "menu.notesPlaceholder": "Ej: Retiro hoy a las 7pm",
      "menu.sendOrder": "Enviar Pedido por WhatsApp",
      "menu.loading": "Cargando menú…",
      "menu.unavailable": "El menú no está disponible en este momento.",
      "menu.loadError": "No pudimos cargar el menú en este momento.",
      "menu.deliveryAvailable": "Delivery disponible los {days}. Pedido mínimo {minimum}.",
      "menu.minimumWarning": "Faltan {amount} para el pedido mínimo de delivery ({minimum}).",
      "menu.alertNamePhone": "Completá nombre, apellido y teléfono para enviar el pedido.",
      "menu.alertZip": "Completá el Código Postal para el delivery.",
      "menu.alertMinimum": "El pedido mínimo para delivery es {minimum}.",
      "menu.waGreeting": "¡Hola Luji's Foodtruck! Quiero hacer este pedido:",
      "menu.waOrderType": "Tipo de pedido:",
      "menu.waDeliveryValue": "Delivery",
      "menu.waPickupValue": "Retiro en el truck",
      "menu.waName": "Nombre:",
      "menu.waPhone": "Teléfono:",
      "menu.waZip": "Código Postal:",
      "menu.waDate": "Fecha de entrega:",
      "menu.waTotal": "Total:",
      "menu.waNotes": "Notas:",
      "menu.unitEach": "un.",
      "menu.unitDozen": "docena",
      "menu.dozenGroup": "{n}x Docena (12 empanadas c/u, sabores a elección)",
      "menu.halfDozenGroup": "Media docena (6 empanadas, sabores a elección)",
      "menu.remainderGroup": "{n} empanada(s) suelta(s)",

      "days.0": "Domingo",
      "days.1": "Lunes",
      "days.2": "Martes",
      "days.3": "Miércoles",
      "days.4": "Jueves",
      "days.5": "Viernes",
      "days.6": "Sábado",
      "common.and": "y"
    }
  };

  function getLang() {
    var stored = localStorage.getItem(STORAGE_KEY);
    return stored === "es" || stored === "en" ? stored : DEFAULT_LANG;
  }

  function t(key, vars) {
    var lang = getLang();
    var str = (dict[lang] && dict[lang][key]) || dict.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.split("{" + k + "}").join(vars[k]);
      });
    }
    return str;
  }

  function dateLocale() {
    return getLang() === "es" ? "es-AR" : "en-US";
  }

  function apply(lang) {
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria-label")));
    });
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
    });
  }

  function setLang(lang) {
    if (lang !== "en" && lang !== "es") return;
    localStorage.setItem(STORAGE_KEY, lang);
    apply(lang);
    document.dispatchEvent(new CustomEvent("i18n:change", { detail: { lang: lang } }));
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".lang-btn");
    if (!btn) return;
    setLang(btn.getAttribute("data-lang"));
  });

  apply(getLang());

  window.LujisI18n = {
    t: t,
    getLang: getLang,
    setLang: setLang,
    dateLocale: dateLocale
  };
})();
