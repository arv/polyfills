/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {

scope = scope || {};

// imports

var componentLoader = scope.ComponentDocuments.loader.componentLoader;
var documentParser = scope.ComponentDocuments.parser;
var elementParser = scope.CustomDOMElements.elementParser

// 
// NOTE: uses 'window' and 'document' globals

scope.ready = function() {
  elementParser.createHostSheet();
  componentLoader.preload(document, function() {
    documentParser.parse(document, elementParser.parse);
    //scope.declarationFactory.morphAll(document);
    scope.webComponentsReady(); 
  });
};

scope.webComponentsReady = function() {
  var e = document.createEvent('Event');
  e.initEvent('WebComponentsReady', true, true);
  window.document.body.dispatchEvent(e);
};

scope.run = function() {
  document.addEventListener('DOMContentLoaded', scope.ready);
};

if (!scope.flags.runManually) {
  scope.run();
}

// we are using this object for cross-module support only
// use 'export' directive to get a global reference
// (see components-polyfill.js)

window.__exported_components_polyfill_scope__ = null;

})(window.__exported_components_polyfill_scope__);
