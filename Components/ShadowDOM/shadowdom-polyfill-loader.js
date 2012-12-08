/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {

scope = scope || {};


var thisFile = "shadowdom-polyfill-loader.js";

var base = "";

(function() {
  var s$ = document.querySelectorAll('[src]');
  Array.prototype.forEach.call(s$, function(s) {
    var src = s.getAttribute('src');
    if (src.slice(-thisFile.length) == thisFile) {
      base = src.slice(0, -thisFile.length);
    }
  });
})();


if (!scope.flags.shadow) {
  scope.flags.shadow = window.WebKitShadowRoot ? 'webkit' : 'shim';
}

var require = function(inSrc) {
  document.write('<script src="' + base + inSrc + '"></script>');
};

var fileSets = {
  webkit: [
    'webkit/WebkitShadowDOM.js',
    'ShadowDOMImpl.js'
  ],
  shim: [
    'polyfill/LightDOM.js',
    'polyfill/Changeling.js',
    'polyfill/Projection.js',
    'polyfill/ShimShadowDOM.js',
    'ShadowDOMImpl.js'
  ],
  polyfill: [
    '../../ShadowDOM/map.js',
    '../../ShadowDOM/sidetable.js',
    '../../ShadowDOM/domreflectionutils.js',
    '../../ShadowDOM/domoverrides.js',
    '../../ShadowDOM/paralleltrees.js',
    '../../ShadowDOM/ShadowRoot.js',
    'jsshadow/JsShadowDOM.js',
    'ShadowDOMImpl.js'
  ]
}

fileSets[scope.flags.shadow].forEach(require);

})(window.__exported_components_polyfill_scope__);
