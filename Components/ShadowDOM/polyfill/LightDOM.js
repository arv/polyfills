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

var LightDOM = function(inNode) {
  var lightDOM = document.createDocumentFragment();
  lightDOM.tagName = inNode.tagName;
  moveChildren(lightDOM, inNode);
  inNode.textContent = '';
  inNode.lightDOM = lightDOM;
  return lightDOM;
};
