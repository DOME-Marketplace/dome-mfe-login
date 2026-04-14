(function(window) {
  window.env = window.env || {};

  // Environment variables
  window["env"]["api_base_url"] = "${API_BASE_URL}";
  window["env"]["wallet_url"] = "${WALLET_URL}";

})(this);
