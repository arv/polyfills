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

makeRoot = function(inName, inTemplateName, inImpl) {
  var node = $("#work > " + inName);
  // make ShadowRoot
  var root = new inImpl.ShadowRoot(node);
  // stamp content
  root.appendChild($("#work > template#" + inTemplateName).content.cloneNode(true));
  // distribute
  inImpl.distribute(node);
  //
  return root;
};

testImpls = function(inTest, inExpected) {
  it("WebKit", function() {
    inTest(WebkitShadowDOM);
    // I can't test anything useful
  });
  it("Shim", function() {
    var root = inTest(ShimShadowDOM);
    var actual = root.host.innerHTML.trim().replace(/[\n]/g, '');
    if (inExpected != actual) {
      var err = new Error('Unexpected output: expected: [' + inExpected + '] actual: [' + actual + ']');
      // docs say I get a diff, but I don't
      err.expected = inExpected;
      err.actual = actual;
      throw err;
    }
  });
};