(function(scope) {

scope.flags = scope.flags || {};

scope.shadowDomImpl = scope.flags.shimShadow ? scope.shimShadowImpl : scope.webkitShadowImpl;

})(window.__exported_components_polyfill_scope__);