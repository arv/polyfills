/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {

// NOTE: uses 'window' and 'document' globals

scope = scope || {};

// path conversion utilities
var path = {
  nodeUrl: function(inNode) {
    var nodeUrl = inNode.getAttribute("href") || inNode.getAttribute("src");
    var url = path.resolveNodeUrl(inNode, nodeUrl);
    return url;
  },
  resolveNodeUrl: function(inNode, inRelativeUrl) {
    var baseUrl = this.documentUrlFromNode(inNode);
    return this.resolveUrl(baseUrl, inRelativeUrl);
  },
  documentUrlFromNode: function(inNode) {
    var n = inNode, p;
    while ((p = n.parentNode)) {
      n = p;
    }
    return (n && (n.URL || n.name)) || "";
  },
  resolveUrl: function(inBaseUrl, inUrl) {
    if (this.isAbsUrl(inUrl)) {
      return inUrl;
    }
    var base = this.urlToPath(inBaseUrl);
    return this.compressUrl(base + inUrl);
  },
  urlToPath: function(inBaseUrl) {
    var parts = inBaseUrl.split("/");
    parts.pop();
    return parts.join("/") + "/";
  },
  isAbsUrl: function(inUrl) {
    return /^data:/.test(inUrl) || /^http[s]?:/.test(inUrl);
  },
  makeCssUrlsRelative: function(inCss, inBaseUrl) {
    return inCss.replace(/url\([^)]*\)/g, function(inMatch) {
      // find the url path, ignore quotes in url string
      var urlPath = inMatch.replace(/["']/g, "").slice(4, -1);
      urlPath = path.resolveUrl(inBaseUrl, urlPath);
      urlPath = path.makeRelPath(document.URL, urlPath);
      return "url(" + urlPath + ")";
    });
  },
  // make a relative path from source to target
  makeRelPath: function(inSource, inTarget) {
    var s, t;
    s = this.compressUrl(inSource).split("/");
    t = this.compressUrl(inTarget).split("/");
    while (s.length && s[0] === t[0]){
      s.shift();
      t.shift();
    }
    for(var i = 0, l = s.length-1; i < l; i++) {
      t.unshift("..");
    }
    return t.join("/");
  },
  compressUrl: function(inUrl) {
    var parts = inUrl.split("/");
    for (var i=0, p; i < parts.length; i++) {
      p = parts[i];
      if (p == "..") {
        parts.splice(i-1, 2);
        i -= 2;
      }
    }
    return parts.join("/");
  }
};

// exports

scope.ComponentDocuments = scope.ComponentDocuments ||  {};
  scope.ComponentDocuments.path = path;

})(window.__exported_components_polyfill_scope__);
