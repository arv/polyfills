/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

$ = document.querySelector.bind(document);

extractHtml = function(inCode) {
  var rx = /\/\*[\w\t\n\r]*([\s\S]*?)[\w\t\n\r]*\*\//;
  var html = inCode.toString().match(rx)[1];
  return html;
};

render = function(inCode) {
  $("#work").innerHTML = extractHtml(inCode);
};


var ShadowRoot = function(inNameOrNode, inTemplateName) {
  // resolve a node
  var node = typeof inNameOrNode == "string" ?
    $("#work > " + inNameOrNode) : inNameOrNode;
  // make ShadowRoot
  var root = new ShadowDOM.ShadowRoot(node);
  // stamp content
  root.appendChild(
    $("#work > template#" + inTemplateName).content.cloneNode(true));
  // distribute
  ShadowDOM.distribute(node);
  return root;
};

testImpls = function(inTest, inExpected) {
  it("WebKit", function() {
    ShadowDOM = WebkitShadowDOM;
    inTest();
    // I can't test anything useful
  });
  it("Shim", function() {
    ShadowDOM = ShimShadowDOM;
    var actual = inTest();
    if (inExpected != actual) {
      console.group("failure");
      console.log("actual:");
      console.log(actual);
      console.log("expected:");
      console.log(inExpected);
      console.groupEnd();
      var err = new Error('Unexpected output: expected: [' +
        inExpected + '] actual: [' + actual + ']');
      // docs say I get a diff, but I don't
      err.expected = inExpected;
      err.actual = actual;
      throw err;
    }
  });
};

actualContent = function(inNode) {
  return inNode.innerHTML.trim().replace(/[\n]/g, '');
};

actualOuterContent = function(inNode) {
  return inNode.outerHTML.trim().replace(/[\n]/g, '');
};