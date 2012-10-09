var moveChildren = function(upgrade, element) {
  var n$ = element.insertions;
  if (n$) {
    //element.insertions = [];
    element.insertions = null;
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

var LightDom = function(inNode) {
  var lightDom = document.createDocumentFragment();
  lightDom.tagName = inNode.tagName;
  moveChildren(lightDom, inNode);
  inNode.textContent = '';
  inNode.lightDom = lightDom;
  return lightDom;
};
