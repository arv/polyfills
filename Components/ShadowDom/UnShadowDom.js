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
    // install shadow root on instance
    inInstance.appendChild(shadowRoot);
    // for debug/visualization purposes only
    shadowRoot.appendChild(inContent.cloneNode(true));
    // cache the shadowDom instance
    inInstance.shadowRoot = shadowRoot;
    return inInstance;
  },
  installDom: function(inInstance) {
    // create a source we can extract nodes from
    var source = inInstance;
    // target for installation
    var target = inInstance;
    // get all shadow roots
    var shadowRoots = target.querySelectorAll("shadow-root");
    // shadow dom
    var shadowRoot = inInstance.shadowRoot;
    if (shadowRoot) {
      // create mutable shadowDom
      var dom = shadowRoot.content.cloneNode(true);
      // build a immutable list of template <content> elements
      var c$ = [];
      $$(dom, "content").forEach(function(content) {
        c$.push(content)
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
          }
        }
        // replace the content node with the fragment
        content.parentNode.replaceChild(frag, content);
      });
    } else {
      dom = document.createDocumentFragment();
      for (var n; (n=source.childNodes[0]);) {
        dom.appendChild(n);
      }
    }
    // install constructed dom
    target.textContent = '';
    // for visualizing shadow roots only
    for (i=0, n; n=shadowRoots[i]; i++) {
      target.appendChild(n);
    }
    target.appendChild(dom);
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
  }/*,
  renderShadows: function(inDom, inDecl) {
    // if this template dom has a <shadow> node
    var shadow = $(inDom, "shadow");
    if (shadow) {
      // fetch the shadow dom that would be rendered
      // by my ancestors (recusively)
      var srcShadow = unShadow.fetchShadow(inDecl.ancestor);
      if (srcShadow) {
        shadow.parentNode.replaceChild(srcShadow, shadow);
      }
    }
    return inDom;
  },
  fetchShadow: function(inDecl) {
    // find ancestor template
    var d = inDecl;
    while (d && !d.shadow) {
      d = d.ancestor;
    }
    // now render any ancestor shadow DOM (recurse)
    return d && unShadow.renderShadows(d.shadow, d);
  }
  */
};

var isTemplate = function(inNode) {
	return (inNode.tagName == "TEMPLATE");
};

var isShadowRoot = function(inNode) {
  return (inNode.tagName == "SHADOW-ROOT");
};

// exports

scope.unShadowImpl = unShadow;

})(window.__exported_components_polyfill_scope__);
