var ShadowDOM = function(inNode, inTemplate) {
  // make a new root
  var root = document.createElement("shadow-root");
  // get shadows store
  var shadows = inNode.shadows;
  // if there is no store
  if (!shadows) {
    // create shadow store
    shadows = inNode.shadows = document.createDocumentFragment();
    // add some API to inInstance
    inNode.distribute = ShadowDOM.distribute;
  }
  // stamp our template
  var shadow = inTemplate && inTemplate.cloneNode(true);
  // install our shadow nodes
  if (shadow) {
    root.appendChild(shadow);
  }
  // install the root
  shadows.appendChild(root);
  // return the reference
  return root;
};

var isInsertionPoint = function(inNode) {
  return (inNode.tagName == "SHADOW" || inNode.tagName == "CONTENT");
};

(function(){
  
ShadowDOM.distribute = function() {
  var pool = this.lightDOM && this.lightDOM.childNodes;
  var root = this.shadows.lastChild;
  // distribute any lightdom to our shadowDOM(s)
  distribute(poolify(pool), root);
  flatten(root);
  // project composed tree
  new Projection(this).addNodes(root.childNodes);
};
  
// ShadowDOM Query (simplistic)

// custom selectors:
//
// ~        = any node with lightDOM 
// #<id>    = node with id = <id>
// *        = any non-Text node
// .<class> = any node with <class> in it's classList
// [<attr>] = any node with attribute <attr>
//
var matches = function(inNode, inSlctr) {
  if (inSlctr == "~") {
    return Boolean(inNode.lightDOM);
  } 
  if (inSlctr[0] == '#') {
    return inNode.id == inSlctr.slice(1);
  }
  if (inSlctr == '*') {
    return inNode.nodeName != '#text';
  }
  if (inSlctr[0] == '.') {
    return inNode.classList && inNode.classList.contains(inSlctr.slice(1));
  }
  if (inSlctr[0] == '[') {
    return inNode.hasAttribute && inNode.hasAttribute(inSlctr.slice(1, -1));
  }
  return (inNode.tagName == inSlctr.toUpperCase());
};

var search = function(inNodes, inSlctr) {
  var results = [];
  for (var i=0, n; (n=inNodes[i]); i++) {
    n = n.baby || n;
    if (matches(n, inSlctr)) {
      results.push(n);
    }
    if (!isInsertionPoint(n)) {
      results = results.concat(_search(n, inSlctr));
    }
  }
  return results;
};

var _search = function(inNode, inSlctr) {
  return search((inNode.lightDOM && inNode.lightDOM.childNodes) || 
    inNode.insertions || inNode.childNodes, inSlctr);
};

ShadowDOM.localQueryAll = function(inNode, inSlctr) {
  return search(inNode.insertions || inNode.childNodes, inSlctr);
};

ShadowDOM.localQuery = function(inNode, inSlctr) {
  return ShadowDOM.localQueryAll(inNode, inSlctr)[0];
};

var poolify = function(inNodes) {
  var base = inNodes ? Array.prototype.slice.call(inNodes, 0) : [];
  //
  var pool = [];
  for (var i=0, n; (n=base[i]) && (n=n.baby || n); i++) {
    //if (n.tagName == "CONTENT") {
    if (isInsertionPoint(n)) {
      base.splice(i--, 1);
      pool = pool.concat(poolify(n.insertions || n.childNodes));
    } else {
      pool.push(n);
    }
  }
  //
  return pool;
};

var extract = function(inPool, inSlctr) {
  if (!inSlctr) {
    return inPool.splice(0);
  } else {
    var result = [];
    for (var i=0, n; (n=inPool[i]); i++) {
      if (matches(n, inSlctr)) {
        result.push(n);
        inPool.splice(i--, 1);
      }
    }
    return result;
  }
};

var decorateInsertionPoint = function(inPoint) {
  if (!inPoint.__decorated__) {
    inPoint.__decorated__ = true;
    Object.defineProperty(inPoint, 'distributedNodes', {
      get: function() {
        var items = [];
        for (var i=0, n$ = this.childNodes, n; (n=n$[i]); i++) {
          items.push(n.baby || n);
        }
        return items;
      }
    });
  }
};

var distribute = function(inPool, inRoot) {
  var root = inRoot;
  //
  // distribute pool to <content> nodes
  var insertions = ShadowDOM.localQueryAll(root, "content");
  insertions.forEach(function(insertion) {
    decorateInsertionPoint(insertion);
    var slctr = insertion.getAttribute("select");
    var nodes = extract(inPool, slctr);
    new Projection(insertion).addNodes(nodes);
  });
  //
  // distribute older shadow to <shadow>
  var shadow = ShadowDOM.localQuery(root, "shadow");
  if (shadow) {
    var olderRoot = root.previousSibling;
    new Projection(shadow).addNodes(olderRoot.childNodes);
    distribute(inPool, olderRoot);
  }
  //
  // distribute any contained objects
  var comps = ShadowDOM.localQueryAll(root, "~");
  comps.forEach(function(c) {
    c.distribute();
  });
};

var flatten = function(inTree) {
  var nodes = inTree.insertions || inTree.childNodes;
  if (nodes) {
    var hasInsertion = false;
    for (var i=0, n; (n=nodes[i]); i++) {
      n = n.baby || n;
      flatten(n);
      if (isInsertionPoint(n) && n.projection) {
        n.projection.flattenme = true;
        hasInsertion = true;
      }
    }
    if (hasInsertion) {
      Projection.flatten(inTree);
    }
  }
};

})();