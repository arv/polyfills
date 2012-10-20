(function(){

var test = function() {
  render(function(){/*
      <A>
        <span>Where am I?</span>
      </A>
      <template id="A">
        <span>A's Template</span>
      </template>
  */});
  var root = new ShadowRoot('A', 'A')
  return actualContent(root.host);
};

describe('(4)-shadowDOM', function() {
  var expected = '<span>A\'s Template</span>';
  testImpls(test, expected);
});

})();