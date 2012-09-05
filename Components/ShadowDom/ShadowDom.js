(function(scope) {

scope.flags = scope.flags || {};

scope.shadowDomImpl =
  scope.flags.shimShadow ? scope.shimShadowImpl :
    scope.flags.unShadow ? scope.unShadowImpl :
      scope.webkitShadowImpl;

})(window.__exported_components_polyfill_scope__);