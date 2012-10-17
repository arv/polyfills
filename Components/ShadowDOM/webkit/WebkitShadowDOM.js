(function(scope) {

scope.WebkitShadowDOM = {
  ShadowRoot: function(inElement) {
    var root = new WebKitShadowRoot(inElement);
    inElement.shadow = root;
    return root;
  },
  distribute: function() {},
  localQuery: function(inElement, inSlctr) {
    return inElement.querySelector(inSlctr);
  },
  localQueryAll: function(inElement, inSlctr) {
    return inElement.querySelectorAll(inSlctr);
  }
};

})(window.__exported_components_polyfill_scope__);
