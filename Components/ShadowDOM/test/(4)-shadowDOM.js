(function(){

var test = function(inImpl) {
  render(function(){/*
      <A>
        <span>Where am I?</span>
      </A>
      <template id="A">
        <span>A's Template</span>
      </template>
  */});
  // make ShadowRoot
  return makeRoot("A", "A", inImpl)
};

describe("(4)-shadowDOM", function() {
  var expected = "<span>A's Template</span>";
  testImpls(test, expected);
});

})();