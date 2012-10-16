(function(){

var test = function(inImpl) {
  render(function(){/*
      <A>
        <span>Where am I?</span>
      </A>

      <template id="Abb"><span>A's Base Base Template</span></template>
      <template id="Ab"><span>A's Base Template:<shadow></shadow></span></template>
      <template id="A"><span>A's Template:<shadow></shadow></span></template>
  */});
  // make ShadowRoot
  makeRoot("A", "Abb", inImpl)
  makeRoot("A", "Ab", inImpl)
  return makeRoot("A", "A", inImpl)
};

describe("(4.1)-shadow", function() {
  var expected = "<span>A's Template:<span>A's Base Template:<span>A's Base Base Template</span></span></span>";
  testImpls(test, expected);
});

})();