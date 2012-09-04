/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {

scope = scope || {};

// imports

var CustomDOMElements = scope.CustomDOMElements;
var path = scope.ComponentDocuments.path;
var componentLoader = scope.ComponentDocuments.loader.componentLoader;

// debuggable script injection
//
// this technique allows the component scripts to be
// viewable and debuggable in inspector scripts
// tab (although they are all named "(program)").

var context;

// invoke inScript in inContext scope
var inject = function(inScript, inContext, inName) {
  context = inContext;
  // inject a (debuggable!) script tag
  var	tag = document.createElement("script");
  tag.textContent = "componentScript('" + inName + "', function(){"
    + inScript + "});";
  document.body.appendChild(tag);
};

// global necessary for script injection
window.componentScript = function(inName, inFunc) {
  inFunc.call(context);
};

// Custom DOM Elements SECTION 7.2

HTMLElementElement = function(inElement) {
  this.name = inElement.getAttribute("name");
  this.constructorName = inElement.getAttribute("constructor");
  this.extendsName = inElement.getAttribute("extends") || "div";
  this.template = inElement.querySelector("template");
  this.generatedConstructor = function() {
    return this.instantiate();
  }
  if (!this.name) {
    console.error('name attribute is required.');
    return;
  }
  this.register(inElement);
};

HTMLElementElement.prototype = {
  lifecycle: function(inLifecycle) {
    this.lifecycleImpl = inLifecycle;
  },
  instantiate: function() {
    return CustomDomElements.instantiate(this.prototype, this.template,
      this.lifecycleImpl);
  },
  register: function(element) {
    // fix css paths for inline style elements
    elementParser.adjustTemplateCssPaths(element, this.template);
    // load component stylesheets
    elementParser.sheets(element, this.template);
    // apply @host styles.
    elementParser.applyHostStyles(this.template, this.name);
    //
    // to register a custom element, I need
    //
    //  prototype
    //  lifcycle
    //  template
    //
    // I have template right away
    //
    // I don't get lifecycle or prototype until
    // executing user's code
    //
    // so, execute user's code right away
    //
    // but user may want to cache the reference to generatedConstructor
    // so I have to make a 'real one', but I cannot use the canonical
    // constructor-generation algorithm because I am missing pieces
    //
    // Gambit: make a custom generatedConstructor that binds
    // to an object that is filled in later (instead of
    // a closure)
    //
    // evaluate components scripts
    //
    elementParser.scripts(element, this);
    //
    // now we have the user supplied prototype and lifecycle
    console.log("registering", this.name);
    console.log(this.generatedConstructor.prototype);
    console.log(this.lifecycleImpl);
    //
    // we need to reprocess the prototype (cheating because
    // prototype is not a property defintion object as called for
    // by the spec; it happens to work now due CustomDomElements is
    // implemented to take a regular map)
    //
    this.prototype = CustomDOMElements.generatePrototype(this.extendsName,
      this.generatedConstructor.prototype);
    // TODO(sjmiles): putting name on prototype not in spec
    this.prototype.is = this.name;
    //
    // can't use canonical register method because we've already
    // generated a constructor
    //
    // we almost implement 'definition', except for lifecycleImpl
    //
    var definition = {
      name: this.name,
      prototype: this.prototype,
      template: this.template,
      lifecycle: this.lifecycleImpl
    };
    CustomDOMElements.registry[this.name] = definition;
    CustomDOMElements.upgradeElements(document, definition);
    //
    // optionally install the constructor on the global object
    if (this.constructorName) {
      window[this.constructorName] = this.generatedConstructor;
    }
  }
};

elementParser = {
  parse: function(element) {
    new HTMLElementElement(element);
  },
  scripts: function(element, htmlElementElement) {
    // accumulate all script content from the element declaration
    var script = [];
    forEach($$(element, "script"), function(s) {
      script.push(s.textContent);
    });
    // if there is any code, inject it
    if (script.length) {
      inject(script.join(';\n'), htmlElementElement, htmlElementElement.name);
    }
  },
  normalizeTemplate: function(inTemplate) {
    if (inTemplate && !inTemplate.content) {
      var c = inTemplate.content = document.createDocumentFragment();
      while (inTemplate.childNodes.length) {
        c.appendChild(inTemplate.childNodes[0]);
      }
    }
    return inTemplate;
  },
  adjustTemplateCssPaths: function(element, template) {
    if (template) {
      var docUrl = path.documentUrlFromNode(element);
      forEach($$(template.content, "style"), function(s) {
        s.innerHTML = path.makeCssUrlsRelative(s.innerHTML, docUrl);
      });
    }
  },
  sheets: function(element, template) {
    var sheet = [];
    if (template) {
      console.group("sheets");
      forEach($$(element, "link[rel=stylesheet]"), function(s) {
        var styles = componentLoader.fetch(s);
        styles = path.makeCssUrlsRelative(styles, path.nodeUrl(s));
        sheet.push(styles);
      });
      if (sheet.length) {
        console.log("sheets found (", sheet.length, "), injecting");
        var style = document.createElement("style");
        style.style.display = "none !important;";
        style.innerHTML = sheet.join('');
        template.content.appendChild(style);
      }
      console.groupEnd();
    }
  },
  hostRe:/(@host[^{]*)({[^{]*})/gim,
  applyHostStyles: function(template, name) {
    // strategy: apply a rule for each @host rule with @host replaced with
    // the component name into a stylesheet added at the top of head (so it's
    // least specific)
    if (template) {
      forEach($$(template.content, "style"), function(s) {
        var matches, rule;
        while ((matches = this.hostRe.exec(s.innerHTML))) {
          rule = this.convertHostRules(matches[1], name) + " "
              + matches[2];
          this.hostSheet.appendChild(document.createTextNode(rule));
        }
      }, this);
    }
  },
  // convert e.g. @host to x-foo, [is=x-foo]
  convertHostRules: function(selectors, name) {
    var o=[], parts = selectors.split(",");
    var h = "@host";
    parts.forEach(function(p) {
      if (p.indexOf(h) >= 0) {
        var r = p.trim();
        o.push(r.replace(h, name));
        //o.push(r.replace(h, "[is=" + name + "]"));
      }
    });
    return o.join(", ");
  },
  // support for creating @host rules
  createHostSheet: function() {
    var s = document.createElement("style");
    var h = document.head;
    if (h.children.length) {
      h.insertBefore(s, h.children[0]);
    } else {
      h.appendChild(s);
    }
    this.hostSheet = s;
  }
};

// exports

scope.CustomDOMElements.elementParser = elementParser;

})(window.__exported_components_polyfill_scope__);
