(function(scope) {

scope = scope || {};

scope.webkitShadowImpl = {
  createShadowDom: function(inInstance, inContents) {
    var shadowRoot = new WebKitShadowRoot(inInstance);
    // TODO(sjmiles): check spec: .host not set automatically
    if (!shadowRoot.host) {
      shadowRoot.host = inInstance;
    }
    inInstance.shadow = inContents;
    shadowRoot.appendChild(inContents);
    return shadowRoot;
  },
  installDom: function() {
  }
};

})(window.__exported_components_polyfill_scope__);
