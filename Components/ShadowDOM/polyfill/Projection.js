(function(scope) {

// imports

var Changeling = scope.Changeling;

var Projection = function(inNode) {
  // contract with host
  this.host = inNode;
  this.host.projection = this;
  // start empty
  this.clear();
};

Projection.prototype = {
  clear: function() {
    this.host.textContent = "";
    if (this.host.insertions) {
      this.host.insertions = [];
    }
  },
  add: function(inNode) {
    // if a Changeling, add the baby instead
    var n = inNode.baby || inNode;
    if (n.parentNode) {
      new Changeling(n).transplant(n);
    }
    appendExplodedChild(this.host, n);
  },
  addNodes: function(inNodes) {
    for (var i=0, n; (n=inNodes[i]); i++) {
      this.add(n);
    }
  }
};

Projection.flatten = function(inNode) {
  // 1. create insertion list if needed
  // 2. construct composed dom by walking insertion
  //    list, exploding insertion points and
  //    adding regular nodes
  if (!inNode.insertions) {
    createInsertions(inNode);
  }
  // compose into an empty subtree
  inNode.textContent = '';
  // use insertion list to compile composed DOM
  for (var i=0, n; (n=inNode.insertions[i]); i++) {
    // always deref
    n = n.baby || n;
    // if n is flattenable
    if (n.shouldFlatten) {
      n.shouldFlatten = false;
      // insert n's COMPOSED children
      var nodes = n.composedNodes || n.childNodes;
      for (var j=0, c; (c=nodes[j]); j++) {
        // make sure there is a placeholder for c in the insertion list
        if (!c.baby) {
          new Changeling(c).transplant(c);
        } else {
          c = c.baby;
        }
        // add the node to the flattened-composed dom
        appendFlattenedChild(inNode, c);
      }
    } else {
      // otherwise, add n itself to the flattened-composed dom
      appendFlattenedChild(inNode, n);
    }
  }
};

var createInsertions = function(inNode) {
  var i$ = inNode.insertions = [];
  for (var i=0, n; (n=inNode.childNodes[i]); i++) {
    i$.push(new Changeling(n));
  }
};

// add to the 'exploded composed' tree
var appendExplodedChild = function(inNode, inChild) {
  if (inNode.insertions) {
    inNode.insertions.push(inChild);
  } else {
    // equivalent to appendChild, but avoids any appendChild override
    inNode.insertBefore(inChild, null);
  }
};

// add to the 'flattened composed' tree
var appendFlattenedChild = function(inNode, inChild) {
  // equivalent to appendChild, but avoids any appendChild override
  inNode.insertBefore(inChild, null);
};

scope.Projection = Projection;

})(window.__exported_components_polyfill_scope__);
