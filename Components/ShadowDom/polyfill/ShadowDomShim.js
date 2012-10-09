(function(scope) {

scope = scope || {};

scope.shimShadowImpl = {
  createShadowDom: function(inInstance, inContents) {
    if (!inInstance.lightDom) {
      new LightDom(inInstance);
    }
    var shadowRoot = new ShadowDom(inInstance, inContents);
    // TODO(sjmiles): check spec: .host not set automatically
    if (!shadowRoot.host) {
      shadowRoot.host = inInstance;
    }
    return shadowRoot;
  },
  installDom: function(inNode) {
    inNode.distribute();
  }
};

})(window.__exported_components_polyfill_scope__);
