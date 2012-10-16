(function(scope) {
  
var moveChildren = function(element, upgrade) {
  var n$ = element.insertions;
  if (n$) {
    element.insertions = null;
    // clean up left-over content rendered from insertions
    element.textContent = '';
  } else {
    n$ = [];
    forEach(element.childNodes, function(n) {
      n$.push(n);
    });
  }
  forEach(n$, function(n) {
    upgrade.appendChild(n);
  });
};

var LightDOM = function(inNode) {
  // store lightDOM as a document fragment
  inNode.lightDOM = document.createDocumentFragment();
  // move our children into the fragment
  moveChildren(inNode, inNode.lightDOM);
  // make sure there's nothing left (?)
  if (inNode.textContent != '') {
    console.error("LightDOM(): inNode not empty after moving children");
  }
  // alter inNode's API
  inNode.composedNodes = inNode.childNodes;
  Object.defineProperty(inNode, 'childNodes', {
    get: function() {
      return this.lightDOM.childNodes;
    }
  });
  // return the fragment
  return inNode.lightDOM;
};

// exports

scope.LightDOM = LightDOM;

})(window.__exported_components_polyfill_scope__);
