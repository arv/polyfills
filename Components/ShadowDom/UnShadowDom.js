(function(scope) {

scope = scope || {};

var unShadow = {
  createShadowDom: function(inInstance, inContent) {
    // memoize lightDom (sort of)
    inInstance.lightDom = inInstance;
    // create shadowRoot
    var shadowRoot = document.createElement("shadow-root");
    shadowRoot.style.cssText = "display: none;";
    shadowRoot.content = inContent;
    // add to internal shadow stack
    inInstance.shadows = inInstance.shadows || [];
    inInstance.shadows.push(shadowRoot);
    if (scope.flags.showshadow) {
      // for debug/visualization purposes only
      // install shadow root on instance
      inInstance.appendChild(shadowRoot);
      // with a copy of its content
      shadowRoot.appendChild(inContent.cloneNode(true));
    }
    // cache the shadowDom instance
    inInstance.shadowRoot = shadowRoot;
    return inInstance;
  },
  installDom: function(inInstance) {
    // source nodes to distribute
    var source = inInstance;
    // target for distribution
    var target = inInstance;
    // shadow dom
    var shadowRoot = inInstance.shadowRoot;
    if (shadowRoot) {
      // shadowDom 
      var dom = shadowRoot.content;
      // projections array
      var projections = [];
      // build an immutable list of template <content> elements
      var c$ = [];
      $$(dom, "content").forEach(function(content) {
        c$.push(content)
      });
      // find content elements *inside* of template elements
      $$(dom, "template").forEach(function(template) {
        $$(template.content, "content").forEach(function(content) {
          c$.push(content)
        });
      });
      // replace each <content> element with matching content
      c$.forEach(function(content) {
        // build a fragment to contain selected nodes
        var frag = document.createDocumentFragment();
        // find selected 'light dom' nodes
        var slctr = content.getAttribute("select");
        var nodes = slctr ? $$(source, slctr) : source.childNodes;
        for (var i=0, n; (n=nodes[i]);) {
          if ((n.parentNode != source) || isTemplate(n) || isShadowRoot(n)) {
            i++;
          } else {
            frag.appendChild(n);
            projections.push(n);
          }
        }
        // replace the content node with the fragment
        content.parentNode.replaceChild(frag, content);
      });
    } else {
      dom = document.createDocumentFragment();
      for (var n; (n=source.childNodes[0]);) {
        dom.appendChild(n);
        projections.push(n);
      }
    }
    //
    if (scope.flags.showshadow) {
      // for visualizing shadow roots only
      // cache all shadow roots
      var shadowRoots = target.querySelectorAll("shadow-root");
    }
    //
    // we want to replace any existing content
    target.textContent = '';
    //
    if (scope.flags.showshadow) {
      // for visualizing shadow roots only
      // restore shadow roots
      for (i=0, n; n=shadowRoots[i]; i++) {
        target.appendChild(n);
      }
    }
    //
    // install constructed dom
    target.appendChild(dom);
    target.distributedNodes = projections;
    //
    // protect MDV template iterators
    postprocessTemplates(target);
  },
  observe: function(inInstance, inDecl) {
    var contentChanges = function() {
      unShadow.installDom(inInstance);
    };
    var observer = new WebKitMutationObserver(contentChanges);
    observer.observe(inInstance.lightDom, {
      characterData: true,
      childList: true,
      subtree: true
    });
  }
};

var morphAttr = function(inNode, inBefore, inAfter) {
  if (inNode.hasAttribute(inBefore)) {
    var v = inNode.getAttribute(inBefore);
    inNode.setAttribute(inBefore, "null");
    inNode.removeAttribute(inBefore);
    inNode.setAttribute(inAfter, v);
  }
};

var postprocessTemplates = function(inNode) {
  $$(inNode, "template").forEach(function(t) {
    morphAttr(t, "x-iterate", "iterate");
    morphAttr(t, "x-instantiate", "instantiate");
  });
};

var isTemplate = function(inNode) {
  return false;
	return (inNode.tagName == "TEMPLATE") && 
    (inNode.hasAttribute("instantiate") || inNode.hasAttribute("iterate"));
};

var isShadowRoot = function(inNode) {
  return (inNode.tagName == "SHADOW-ROOT");
};

// exports

scope.unShadowImpl = unShadow;

})(window.__exported_components_polyfill_scope__);
