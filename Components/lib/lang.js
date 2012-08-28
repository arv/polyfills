function nop() {};

var nob = {};

// missing DOM/JS API

var forEach = function(inArrayish, inFunc, inScope) {
  Array.prototype.forEach.call(inArrayish, inFunc, inScope);
};

var $ = function(inElement, inSelector) {
  if (arguments.length == 1) {
    inSelector = inElement;
    inElement = document;
  }
  return inElement.querySelector(inSelector);
};

var $$ = function(inElement, inSelector) {
  var nodes = inElement.querySelectorAll(inSelector);
  nodes.forEach = function(inFunc, inScope) {
    forEach(nodes, inFunc, inScope);
  }
  return nodes;
};

var createDom = function(inTagOrNode, inHtml, inAttrs) {
  var dom = (typeof inTagOrNode == "string") ? document.createElement(inTagOrNode) : inTagOrNode.cloneNode(true);
  dom.innerHTML = inHtml;
  if (inAttrs) {
    for (var n in inAttrs) {
      dom.setAttribute(n, inAttrs[n]);
    }
  }
  return dom;
};

// bind shim for iOs

if (!Function.prototype.bind) {
  console.warn("patching 'bind'");
  Function.prototype.bind = function(scope) {
    var _this = this;
    return function() {
      return _this.apply(scope, arguments);
    }
  }
};
