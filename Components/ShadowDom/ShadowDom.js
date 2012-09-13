(function(scope) {

scope.flags = scope.flags || {};

scope.shadowDomImpl =
  scope.flags.projector ? scope.projectorImpl :
    scope.flags.shimshadow ? scope.shimShadowImpl :
      scope.flags.unshadow ? scope.unShadowImpl :
        scope.webkitShadowImpl;

})(window.__exported_components_polyfill_scope__);