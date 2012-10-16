(function(scope) {

scope.flags = scope.flags || {};

var shim = (!window.WebKitShadowRoot || (scope.flags.shadow == "shim") || 
  (scope.flags.shimshadow));

window.ShadowDOM = scope.ShadowDOM = 
  shim ? scope.ShimShadowDOM : scope.WebkitShadowDOM;

})(window.__exported_components_polyfill_scope__);