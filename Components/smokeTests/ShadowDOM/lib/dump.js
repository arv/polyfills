var iterator = function(inTree, inFn) {
  if (inTree) {
    for (var i=0, n; (n=inTree.childNodes[i]); i++) {
      if (inFn(n) === false) {
        return false;
      }
    }
  }
};

labelizer = function(n) {
  // deref changeling
  n = n.baby || n;
  // filter
  if ({SCRIPT:1,TEMPLATE:1}[n.tagName]) {
    return null;
  }
  // labe is tagName, to start
  var label = n.tagName;
  if (n.nodeType == 11) {
     label = 'DOCUMENT FRAGMENT';
  }
  if (!label) {
    // text node
    if (n.textContent.search(/[\S]/) == -1) {
      return label;
    }
    label = n.textContent.replace(/[\n\r\t]*/g, '').trim();
  }
  if (n.id) {
    label += ' #' + n.id;
  }
  if (n.className) {
    label += ' .' + n.className;
  }
  if (n.tagName == 'CONTENT' && n.hasAttribute('select')) {
    label += ' select="' + n.getAttribute('select') + '"';
  }
  /*if (n.changeling || n.insertions) {
    label += ' (';
    if (n.changeling) {
      label += '@';
    }
    if (n.insertions) {
      label += '*';
    }
    label += ')';
  }*/
  return label;
};

dumper = function(n, composedOnly) {
  /*if (!(n instanceof Node)) {
    n = document.querySelector(n);
  }*/
  // filter
  if ({SCRIPT:1,TEMPLATE:1}[n.tagName]) {
    return;
  }
  // make a label
  var label = labelizer(n);
  if (!label) {
    return;
  }
  // deref Changeling
  if (n.baby) {
    n = n.baby;
  }
  if (n.childNodes.length || n.lightDom || n.doppleganger || n.insertions) {
    console.group(label);
    if (n.doppleganger) {
      _xdump('DOPPLEGANGER', n.doppleganger.cache);
      console.group('COMPOSED');
    }
    if ((n.lightDom || n.shadows || n.insertions) && !composedOnly) {
      //if (n.changeling) {
      //  dump(n.lightDom || n);
      //} else {
        xdump(n);
      //}
    } else {
      dump(n);
    }
    if (n.doppleganger) {
      console.groupEnd();
    }
    console.groupEnd();
  } else {
    console.log(label);
  }
};

dump = function(inTree) {
  if (inTree && inTree.childNodes.length) {
    iterator(inTree, dumper);
  }
};

_xdump = function(inLabel, inTree) {
  if (inTree && inTree.childNodes.length) {
    console.group(inLabel);
    dump(inTree);
    console.groupEnd();
  }
};

xdump = function(inTree) {
  _xdump('LIGHT', inTree.lightDom);
  /*
  if (inTree.shadows && inTree.shadows.childNodes.length > 1) {
    _xdump('SHADOW-ROOTS', inTree.shadows);
  }
  */
  //
  // since we are projecting from last shadow into our primary tree
  // (aka option B), the exploded tree is no longer available
  // on inTree because the insertion list is only on the last shadow
  // 
  // do we need to account for this elsewhere?
  //
  var root = (inTree.shadows && inTree.shadows.lastChild) || inTree;
  // handle exploded tree
  var frag = root.insertions ? {childNodes: root.insertions} : root;
  //
  if (inTree.lightDom && inTree.lightDom.childNodes.length) {
    _xdump('COMPOSED', frag);
  } else {
    dump(frag);
  }
  /*
  if (root.insertions) {
    dump(frag);
    // mostly don't want to see this; but there are times
    //_xdump('FLATTENED', root);
  } else {
    dump(frag);
  }
  */
};

var piterator = function(inNodes, inFn) {
  for (var i=0, n; (n=inNodes[i]); i++) {
    inFn(n);
  }
};

pumperator = function(inLabel, inNode) {
  var node = inNode.baby || inNode;
  //
  var light = node.lightDom;
  light = light && light.childNodes.length && light;
  //
  // local tree is expressed by last shadow (or the node itself)
  node = inNode.shadows && inNode.shadows.lastChild || node;
  var nodes = node.insertions || node.childNodes;
  nodes = nodes && nodes.length && nodes;
  //
  if (!light && !nodes) {
    console.log(inLabel);
  } else {
    console.group(inLabel);
    if (light) {
      //console.group('LIGHT');
      piterator(light.childNodes, pumper);
      //console.groupEnd();
    }
    if (nodes && light) {
      console.group('LOCAL');
    }
    if (nodes) {
      piterator(nodes, pumper);
    }
    if (nodes && light) {
      console.groupEnd();
    }
    console.groupEnd();
  }
};

pump = function(inTree) {
  pumper(inTree);
};

//--

_sump = function(inNode, inSumper) {
  // deref Changeling
  var n = inNode.baby || inNode;
  // make a label
  var label = labelizer(n);
  if (label) {
    inSumper(label, n);
  }
};

sumpNodes = function(inLabel, inNodes, inSump) {
  if (inNodes && inNodes.length) {
    // dump subtree
    console.group(inLabel);
    piterator(inNodes, inSump);
    console.groupEnd();
  } else {
    console.log(inLabel);
  }
};

lightSump = function(inNode) {
  _sump(inNode, lightSumper);
};

lightSumper = function(inLabel, inNode) {
  // light (public) tree is either explicit lightDom, or our regular (exploded) 
  // tree
  var nodes = (inNode.lightDom && inNode.lightDom.childNodes)
    || (inNode.insertions || inNode.childNodes);
  sumpNodes(inLabel, nodes, lightSump);
};

localSumper = function(inLabel, inNode) {
  // local tree is expressed by last shadow (or the node itself)
  var local = inNode.shadows && inNode.shadows.lastChild || inNode;
  // always use exploded tree
  var nodes = local.insertions || local.childNodes;
  sumpNodes(inLabel, nodes, lightSump);
};

localSump = function(inNode) {
  _sump(inNode, localSumper);
};

sump = function(inTree) {
  localSump(inTree);
}