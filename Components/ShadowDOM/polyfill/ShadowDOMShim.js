(function(scope) {

scope = scope || {};

scope.shimShadowImpl = {
  createShadowDOM: function(inInstance, inContents) {
    if (!inInstance.lightDOM) {
      new LightDOM(inInstance);
    }
    var shadowRoot = new ShadowDOM(inInstance, inContents);
    // TODO(sjmiles): check spec: .host not set automatically
    if (!shadowRoot.host) {
      shadowRoot.host = inInstance;
    }
    return shadowRoot;
  },
  installDOM: function(inNode) {
    inNode.distribute();
  }
};

})(window.__exported_components_polyfill_scope__);
