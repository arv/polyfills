/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {

scope = scope || {};

// NOTE: use attributes on the script tag for this file as directives

// export="[name]"		exports polyfill scope into window as 'name'
// shimShadow         use shim version of ShadowDom (otherwise native)

// NOTE: uses 'window' and 'document' globals

// directives

var thisFile = "components-polyfill.js";

var source, base = "";

(function() {
  var s$ = document.querySelectorAll('[src]');
  Array.prototype.forEach.call(s$, function(s) {
    var src = s.getAttribute('src');
    if (src.slice(-thisFile.length) == thisFile) {
      source = s;
      base = src.slice(0, -thisFile.length);
    }
  });
  source = source || {
    getAttribute: nop
  };
})();

var flags = scope.flags = {
  exportAs: source.getAttribute("export"),
  shimShadow: source.hasAttribute("shimshadow")
};

console.log(flags);

if (flags.exportAs) {
  window[flags.exportAs] = scope;
}

window.__exported_components_polyfill_scope__ = scope;

var require = function(inSrc) {
  document.write('<script src="' + base + inSrc + '"></script>');
};

[
  "lib/lang.js",
  "ShadowDom/WebkitShadowDom.js",
  "ShadowDom/ShimShadowDom.js",
  "ShadowDom/ShadowDom.js",
  "ComponentDocuments/path.js",
  "ComponentDocuments/loader.js",
  "ComponentDocuments/parser.js",
  "CustomDOMElements.js",
  "boot.js"
].forEach(require);

})(window.__exported_components_polyfill_scope__);
