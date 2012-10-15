var Projection = function(inNode) {
  // contract with host
  this.host = inNode;
  this.host.projection = this;
  // start empty
  this.clear();
};

customAppendChild = function(inNode, inChild) {
  if (inNode.insertions) {
    inNode.insertions.push(inChild);
  } else {
    inNode.appendChild(inChild);
  }
  return inChild;
}

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
    customAppendChild(this.host, n);
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
    var i$ = inNode.insertions = [];
    for (var i=0, n; (n=inNode.childNodes[i]); i++) {
      i$.push(new Changeling(n));
    }
  }
  inNode.textContent = '';
  for (var i=0, n; (n=inNode.insertions[i]); i++) {
    n = n.baby || n;
    if (n.projection && n.projection.flattenme) {
      for (var j=0, c; (c=n.childNodes[j]); j++) {
        if (!c.baby) {
          new Changeling(c).transplant(c);
        }
        inNode.appendChild(c.baby || c);
      }
    } else {
      inNode.appendChild(n);
    }
  }
};
