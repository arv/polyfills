(function(scope) {

scope.WebkitShadowDOM = {
  ShadowRoot: function(inElement) {
    var root = new WebKitShadowRoot(inElement);
    inElement.shadow = root;
    return root;
  },
  distribute: function() {}
};

})(window.__exported_components_polyfill_scope__);
