(function(scope) {

scope.flags = scope.flags || {};

scope.shadowDOMImpl =
    scope.flags.shimshadow ? scope.shimShadowImpl : scope.webkitShadowImpl;

})(window.__exported_components_polyfill_scope__);