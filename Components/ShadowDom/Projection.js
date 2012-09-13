(function(scope) {

scope = scope || {};

var projector = {
  createShadowDom: function(inInstance, inContent) {
    // capture publik
    inInstance.publik = document.createElement("div");
    moveChildren(inInstance.publik, inInstance);
    // our content starts out as our template
    inInstance.appendChild(inContent);
    // do projections
    //project(inInstance.publik, inInstance);
    // our 'shadow dom' is our rendered tree (DOM proper)
    return inInstance;
  },
  installDom: function(inInstance) {
    xdump("instance", inInstance);
    projectAll(inInstance);
  }/*,
  observe: function(inInstance, inDecl) {
    var contentChanges = function() {
      unShadow.installDom(inInstance);
    };
    var observer = new WebKitMutationObserver(contentChanges);
    observer.observe(inInstance.lightDom, {
      characterData: true,
      childList: true,
      subtree: true
    });
  }*/
};

var findContent = function(inNode) {
  var content = [];
  for (var i=0, c; c=inNode.childNodes[i]; i++) {
    if (c.tagName == "CONTENT") {
      content.push(c);
    } else {
      content = content.concat(findContent(c.publik || c));
    }
  } 
  return content;
};

var project = function(inSource, inTarget) {
  // we need to locate all content nodes, in order, in inSource's LOCAL tree
  var c$ = findContent(inTarget);
  console.log("content(s):", c$);
  //var c$ = inTarget.querySelectorAll("content");
  for (var i=0, c; (c=c$[i]); i++) {
    _project(inSource, c);
  }
};

_project = function(inSource, inContent) {
  // abandon old content
  inContent.textContent = "";
  // new or replacement Projection
  var p = new Projection(inContent);
  inContent.projection = p;
  // distribute nodes
  p.project(inSource, inContent.getAttribute("select"));
};

projectAll = function(inNode) {
  if (inNode.publik) {
    project(inNode.publik, inNode);
  }
  for (var i=0, c; (c=inNode.childNodes[i]); i++) {
    projectAll(c);
  }
};

var Projection = function(node) {
  this.host = node;
  this.host.projection = this;
  this.content = [];
};
Projection.prototype = {
  add: function(inNode) {
    // if this node has a parent, we need to pretend it's still there
    if (inNode.parentNode) {
      new Doppleganger(inNode);
    }
    this.content.push(inNode);
    this.host.appendChild(inNode);
  },
  project: function(inSource, inSlctr) {
    // find 'selectable' nodes
    var selectable = [];
    for (var i=0, n; n=inSource.childNodes[i]; i++) {
      if (n.projection) {
        selectable = selectable.concat(n.projection.content);
      } else {
        // select babies not dopplegangers
        selectable.push(n.baby || n);
       }
    }
    console.log("selectables:", selectable);
    //
    // ignore inSlctr for the moment
    //var nodes = inSlctr ? $$(inSource, inSlctr) : inSource.childNodes;
    var nodes = selectable;
    //
    for (i=0, n; (n=nodes[i]); i++) {
      this.add(n);
    }
  }
};

var Doppleganger = function(inNode) {
  var elt = document.createElement(inNode.tagName);
  elt.innerHTML = inNode.innerHTML;
  elt.__proto__ = Doppleganger.prototype;
  elt.baby = inNode;
  inNode.parentNode.replaceChild(elt, inNode);
  return elt;
};
Doppleganger.prototype = {
  get innerHTML() {
    return this.baby.innerHTML;
  },
  get childNodes() {
    return this.baby.childNodes;
  }
};
Doppleganger.prototype.__proto__ = HTMLDivElement.prototype;

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

var moveChildren = function(upgrade, element) {
  var n$ = [];
  forEach(element.childNodes, function(n) {
    n$.push(n);
  });
  forEach(n$, function(n) {
    upgrade.appendChild(n);
  });
};

/*
var transplantNode = function(upgrade, element) {
  forEach(element.attributes, function(a) {
    upgrade.setAttribute(a.name, a.value);
  });
  var n$ = [];
  forEach(element.childNodes, function(n) {
    n$.push(n);
  });
  forEach(n$, function(n) {
    upgrade.appendChild(n);
  });
  element.parentNode.replaceChild(upgrade, element);
  return upgrade;
};
*/

var _dump = function(inNode, inIterator) {
  var n = inNode.tagName || inNode.textContent;
  if (inNode.baby) {
    n += " (doppleganger)";
  }
  if (inNode.tagName == "CONTENT") {
    n += " #" + inNode.id + "";
  }
  if (inNode.childNodes.length) {
    console.group(n);
  } else {
    console.log(n);
  }
  inIterator(inNode);
  if (inNode.childNodes.length) {
    console.groupEnd();
  }
};

var dump_children = function(inNode) {
  for (var i=0, c; c=inNode.childNodes[i]; i++) {
    _dump(c, dump_children);
  }
};

var dumpComposed = function(inNode) {
  _dump(inNode, dump_children);
};

var dumpPublik = function(inNode) {
  _dump(inNode.publik || inNode, dump_children);
};

var dump_local = function(inNode) {
  for (var i=0, c; c=inNode.childNodes[i]; i++) {
    dumpPublik(c);
  }
};

var dumpLocal = function(inNode) {
  _dump(inNode, dump_local);
};

var xdump = function(inLabel, inNode) {
  console.group(inLabel);
  //
  console.log("PUBLIK");
  dumpPublik(inNode);
  //
  console.log("LOCAL");
  dumpLocal(inNode);
  //
  console.log("COMPOSED");
  dumpComposed(inNode);
  //
  console.groupEnd();
};

// exports

scope.projectorImpl = projector;

})(window.__exported_components_polyfill_scope__);
