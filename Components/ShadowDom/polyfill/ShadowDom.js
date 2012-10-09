var ShadowDom = function(inNode, inTemplate) {
  // make a new root
  var root = document.createElement("shadow-root");
  // get shadows store
  var shadows = inNode.shadows;
  // if there is no store
  if (!shadows) {
    // create shadow store
    shadows = inNode.shadows = document.createDocumentFragment();
    // add some API to inInstance
    inNode.distribute = function() {
      var root = this.shadows.lastChild;
      // distribute any lightdom to our shadowDom(s)
      ShadowDom.distribute(this.lightDom && this.lightDom.childNodes, root);
      // project composed tree
      new Projection(inNode).addNodes(root.childNodes);
    };
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
  
// ShadowDom Query (brain-dead)

var matches = function(inNode, inSlctr) {
  if (inSlctr == "~") {
    return Boolean(inNode.lightDom);
  }
  if (inSlctr[0] == '#') {
    return inNode.id == inSlctr.slice(1);
  }
  if (inSlctr == '*') {
    return inNode.nodeName != '#text';
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
  return search((inNode.lightDom && inNode.lightDom.childNodes) || 
    inNode.insertions || inNode.childNodes, inSlctr);
};

ShadowDom.localQueryAll = function(inNode, inSlctr) {
  return search(inNode.insertions || inNode.childNodes, inSlctr);
};

ShadowDom.localQuery = function(inNode, inSlctr) {
  return ShadowDom.localQueryAll(inNode, inSlctr)[0];
};

ShadowDom.distribute = function(inPool, inRoot) {
  distribute(poolify(inPool), inRoot);
  flatten(inRoot);
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

var distribute = function(inPool, inRoot) {
  var root = inRoot;
  //
  // distribute pool to <content> nodes
  var insertions = ShadowDom.localQueryAll(root, "content");
  insertions.forEach(function(insertion) {
     var slctr = insertion.getAttribute("select");
     var nodes = extract(inPool, slctr);
     new Projection(insertion).addNodes(nodes);
  });
  //
  // distribute older shadow to <shadow>
  var shadow = ShadowDom.localQuery(root, "shadow");
  if (shadow) {
    var olderRoot = root.previousSibling;
    new Projection(shadow).addNodes(olderRoot.childNodes);
    distribute(inPool, olderRoot);
  }
  //
  // distribute any contained objects
  var comps = ShadowDom.localQueryAll(root, "~");
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