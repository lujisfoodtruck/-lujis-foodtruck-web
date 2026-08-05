(function () {
  "use strict";

  var host = window.location.hostname;
  var isLocal = host === "localhost" || host === "127.0.0.1" || host === "";

  var PRODUCTION_API_BASE = "https://lujis-foodtruck-web.onrender.com";

  window.LUJIS_API_BASE = isLocal ? "" : PRODUCTION_API_BASE;
})();
