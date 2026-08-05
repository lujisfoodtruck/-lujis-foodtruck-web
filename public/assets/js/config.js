(function () {
  "use strict";

  var host = window.location.hostname;
  var isLocal = host === "localhost" || host === "127.0.0.1" || host === "";

  // TODO: once the backend is deployed on Render, replace the string below
  // with its URL (no trailing slash), e.g. "https://lujis-backend.onrender.com".
  var PRODUCTION_API_BASE = "https://REPLACE-WITH-YOUR-RENDER-URL.onrender.com";

  window.LUJIS_API_BASE = isLocal ? "" : PRODUCTION_API_BASE;
})();
