(function(scope) {

scope = scope || {};

var shimShadow = {
  createShadowDom: function(inInstance, inContents) {
    // create shadow dom from template
    inInstance.shadowDom = document.createElement("shadow-root");
    inInstance.shadowDom.content = inContents;
    inInstance.shadowDom.appendChild(inContents.cloneNode(true));
    // for debug/visualization purposes
    //inInstance.appendChild(inInstance.shadowDom);
    // return shadow root
    return inInstance.shadowDom;
  },
  createLightDom: function(inInstance, inDecl) {
    // make a copy of our lightdom for the user to interact with
    inInstance.lightDom = inInstance.cloneNode(true);
    // FIXME: setting model allows lightdom to react to MDV changes,
    // but we don't have a good way to keep these references in sync
    // (i.e. user could change inInstance.model)
    inInstance.lightDom.model = inInstance.model;
    //inInstance.lightDom.host = inInstance;
    // immediately perform projection
    //shadowImpl.installDom(inInstance, inDecl);
    // reproject on changes in lightdom
    //shadowImpl.observe(inInstance);
    // install instance method so clients can force reprojection
    inInstance.render = function() {
      shimShadow.installDom(inInstance);
    };
  },
  installDom: function(inInstance) {
    // create a source we can extract nodes from
    var source = inInstance.lightDom; //.cloneNode(true);
    var repl = function(n) {
        var repl = n.cloneNode(true);
        repl.replaces = n;
        n.replaced = repl;
        source.insertBefore(n, repl);
    };
    // target for installation
    var target = inInstance;
    // shadow dom
    var shadowNodes = target.querySelectorAll("shadow-root");
    var shadowDom = shadowNodes[shadowNodes.length - 1];
    //var shadowDom = inInstance.shadowDom;
    if (shadowDom) {
      // create mutable shadowDom
      var dom = shadowDom.content.cloneNode(true);
      // recursively calculate replacements for <shadow> nodes, if any
      //this.renderShadows(dom, inDecl);
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
            repl(n);
            frag.appendChild(n);
          }
        }
        // replace the content node with the fragment
        content.parentNode.replaceChild(frag, content);
      });
    } else {
      dom = document.createDocumentFragment();
      for (var n; (n=source.childNodes[0]);) {
        repl(n);
        dom.appendChild(n);
      }
    }
    // install constructed dom
    target.textContent = '';
    for (var i=0, n; n=shadowNodes[i]; i++) {
      target.appendChild(n);
    }
    target.appendChild(dom);
  },
  observe: function(inInstance, inDecl) {
    var contentChanges = function() {
      shimShadow.installDom(inInstance);
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
      var srcShadow = shimShadow.fetchShadow(inDecl.ancestor);
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
    return d && shimShadow.renderShadows(d.shadow, d);
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

scope.shimShadowImpl = shimShadow;

})(window.__exported_components_polyfill_scope__);
