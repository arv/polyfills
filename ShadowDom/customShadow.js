(function(scope) {

scope = scope || {};

var isTemplate = function(inNode) {
	return (inNode.tagName == "TEMPLATE");
};

var shadowImpl = {
	createShadow: function(inInstance, inDecl) {
		// create shadow dom from template
		inDecl.shadow = inDecl.template && inDecl.template.content.cloneNode(true);
		// since our pretend shadowDom is the real dom, we create lightDom instead
		shadowImpl.createLightDom(inInstance, inDecl);
		//
		return inDecl.shadow;
	},
	createLightDom: function(inInstance, inDecl) {
		// make a copy of our lightdom for the user to interact with
		inInstance.lightdom = inInstance.cloneNode(true);
		// FIXME: setting model allows lightdom to react to MDV changes, 
		// but we don't have a good way to keep these references in sync
		// (i.e. user could change inInstance.model)
		inInstance.lightdom.model = inInstance.model;
		inInstance.lightdom.host = inInstance;
		// immediately perform projection
		//shadowImpl.installDom(inInstance, inDecl);
		// reproject on changes in lightdom
		shadowImpl.observe(inInstance, inDecl);
		// install instance method so clients can force reprojection
		inInstance.render = function() {
			shadowImpl.installDom(inInstance, inDecl);
		};
	},
	installDom: function(inInstance, inDecl) {
		// create a source we can extract nodes from
		var source = inInstance.lightdom.cloneNode(true);
		// target for installation
		var target = inInstance;
		// create mutable dom from template
		var dom = inDecl.shadow && inDecl.shadow.cloneNode(true);
		if (dom) {
			// recursively calculate replacements for <shadow> nodes, if any
			this.renderShadows(dom, inDecl);
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
					if (isTemplate(n) || (n.parentNode != source)) {
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
			while (source.childNodes[0]) {
				dom.appendChild(source.childNodes[0]);
			}
		}
		// install constructed dom
		target.textContent = '';
		target.appendChild(dom);
	},
	observe: function(inInstance, inDecl) {
		var contentChanges = function() {
			shadowImpl.installDom(inInstance, inDecl);
		};
		var observer = new WebKitMutationObserver(contentChanges);
		observer.observe(inInstance.lightdom, {
			characterData: true,
			childList: true,
			subtree: true
		});
	},
	renderShadows: function(inDom, inDecl) {
		// if this template dom has a <shadow> node
		var shadow = $(inDom, "shadow");
		if (shadow) {
			// fetch the shadow dom that would be rendered
			// by my ancestors (recusively)
			var srcShadow = shadowImpl.fetchShadow(inDecl.ancestor);
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
		if (d) {
			// now render any ancestor shadow DOM (recurse)
			return shadowImpl.renderShadows(d.shadow, d);
		}
	}
};

scope.shadowImpl = shadowImpl;

})(window.__exported_components_polyfill_scope__);