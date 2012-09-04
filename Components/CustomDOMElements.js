/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {

scope = scope || {};

// imports

var shadowDomImpl = scope.shadowDomImpl;

// custom element definition registry (name: definition)
// TODO(sjmiles): coordinate with spec, I suppose this just a implementation
// detail?

var registry = {
};

// SECTION 4

var instantiate = function(inPrototype, inTemplate, inLifecycle) {
  // 4.a.1. Create a new object that implements PROTOTYPE
  // 4.a.2. Let ELEMENT by this new object
  //
  // TODO(sjmiles): spec omits instantiation of superclass shadow DOM
  // our solution is to call extendee constructor, if it's generated
  // and create a base element if not.
  // 
  // This is tricky to reconcile with spec, since the concepts
  // of base element and prototype swizzling are polyfil
  // concerns.
  //
  // search for an extendee constructor
  var p = inPrototype;
  while (p && (p.constructor === inPrototype.constructor)) {
    p = p.__proto__;
  }
  // we have attached a flag to identify a generated constructor
  var element = p.constructor.generated ? p.constructor() 
    // TODO(sjmiles): ad hoc usage of "div"
    : document.createElement("div");
  // implement inPrototype
  //element.__proto__ = inPrototype;
  //
  // TODO(sjmiles): spec omits instantiation of superclass shadow DOM
  //
  // spec implementation
  // 4.a.3. if template was provided
  if (inTemplate) {
    // 4.a.3.1 create a shadow root with ELEMENT as it's host
    // 4.a.3.2. clone template as contents of this shadow root
    // allow polymorphic shadowDomImpl
    var shadow = shadowDomImpl.createShadowDom(element, 
      inTemplate.content.cloneNode(true));
      // TODO(sjmiles): OFF SPEC: support lifecycle
      var shadowRootCreated = "shadowRootCreated";
      var created = inLifecycle.hasOwnProperty(shadowRootCreated) 
          && inLifecycle[shadowRootCreated];
      if (created) {
          created.call(element, shadow);
      }
  }
  // OUTPUT
  return element;
};

var generateConstructor = function(inPrototype, inTemplate, inLifecycle) {
  // 4.b.1. Generate a function object which, when called:
  // 4.b.1.1. Runs the custom element instantiation algorithm with PROTOTYPE
  // and TEMPLATE as arguments.
  // 4.b.1.2. Returns algorithm's output as result
  // 4.b.2. Let CONSTRUCTOR be that function object
  var constructor = function() {
    return instantiate(inPrototype, inTemplate, inLifecycle);
  };
  // TODO(sjmiles): OFF SPEC: flag this constructor so we can identify it 
  // in instantiate above
  constructor.generated = true;
  // 4.b.3. Set PROTOTYPE as the prototype property on CONSTRUCTOR
  constructor.prototype = inPrototype;
  // 4.b.3. Set CONSTRUCTOR as the constructor property on PROTOTYPE.
  inPrototype.constructor = constructor;
  return constructor;
};

// SECTION 6

var generatePrototype = function(inExtends, inProperties) {
  // 6.a.1 If EXTENDS is an invalid HTML tag name, throw an
  // InvalidCharacterError exception.
  if (!inExtends) {
    throw "6.1. InvalidCharacterError: extends must be a valid HTML tag name";
  }
  // 6.a.2. If EXTENDS is a custom element name, let BASE be the element
  // prototype of the custom DOM element with the custom element name EXTENDS
  if (registry[inExtends]) {
    var base = registry[inExtends].prototype;
    // 6.a.3.3 Create a new object that implements BASE
    // 6.a.3.4 Let PROTOTYPE be this new object
    var prototype = Object.create(base);
  }
  else {
    // TODO(sjmiles): seems like spec is unclear here
    // I think 6.a.3 means: try to resolve BASE, throw an exception
    // if you cannot.
    // It's worded strangely because BASE is tested before it's
    // defined.
    // 6.a.3. Otherwise
    // 6.a.3.1 If BASE is defined in HTML specification or other applicable
    // specifications, let BASE be the interface prototype object for the element
    // type corresponding to the HTML tag name of EXTENDS
    // 6.a.3.2 Otherwise, throw a NotSupportedError exception.
    /* TODO(sjmiles): validation */
    // 6.a.3.3 Create a new object that implements BASE
    // 6.a.3.4 Let PROTOTYPE be this new object
    prototype = document.createElement(inExtends);
  }
  // 6.a.3.5 If PROPERTIES is present and not undefined, define properties on
  // PROTOTYPE using PROPERTIES
  //
  // TODO(sjmiles): this is improper implementation of 'define properties'
  // the spec means Object.defineProperties
  //
  // TODO(sjmiles): handle undefined inProperties
  var properties = inProperties || {};
  //
  // TODO(sjmiles): OFF SPEC: we need to store our extends name somewhere
  // so we can look up ancestor properties during initialization
  //
  properties.extendsName = inExtends;
  //
  // strategy: insert 'inProperties' between the element
  // instance and it's original prototype chain.
  //
  // assumes inProperties has trivial proto (it's clipped off)
  //
  // chain the element's proto to inProperties
  properties.__proto__ = prototype.__proto__;
  // now use inProperties as the elements proto
  prototype.__proto__ = properties;
  // OUTPUT
  return prototype;
};

var transplantNode = function(upgrade, element) {
		forEach(element.attributes, function(a) {
			upgrade.setAttribute(a.name, a.value);
		});
    var n$ = [];
    forEach(element.childNodes, function(n) {
      //if (!isTemplate(n)) {
        n$.push(n);
      //}
    });
    // TODO(sjmiles): make bug reduction: appending children after creating 
    // shadow DOM seems to result in an unstable node if n$.length == 1 and
    // n$[0] is a text node
    forEach(n$, function(n) {
        //console.log(n);
        upgrade.appendChild(n);
		});
    //
    element.parentNode.replaceChild(upgrade, element);
};

var upgradeElements = function(inTree, inDefinition) {
  // 6.b.1 Let NAME be the custom element name part of DEFINITION
  var name = inDefinition.name;
  // 6.b.2 For each element ELEMENT in TREE whose custom element name is NAME:
  var elements = inTree.querySelectorAll(name);
  for (var i=0, element; element=elements[i]; i++) {
    // 6.b.2.3. Let UPGRADE be the result of running custom element
    // instantiation algorithm with PROTOTYPE and TEMPLATE as arguments
    var upgrade = instantiate(inDefinition.prototype, inDefinition.template,
      inDefinition.lifecycle);
    //
    // TODO(sjmiles): not in spec
    //
    upgrade.setAttribute("is", inDefinition.name);
    /*
    // TODO(sjmiles): lifecycle not in spec
    if (inDefinition.lifecycle.created) {
      // TODO(sjmiles): inDefinition.prototype.extendsName not in spec,
      // see above
      var ancestor = registry[inDefinition.prototype.extendsName];
      inDefinition.lifecycle.created(upgrade,
        ancestor && ancestor.lifecycle.key);
    }
    */
    // 6.b.2.4 Replace ELEMENT with UPGRADE in TREE
    transplantNode(upgrade, element);
    //element.parentNode.replaceChild(upgrade, element);
    //
    // give shadowShim a chance to render
    upgrade.render && upgrade.render();
    //
    // 6.b.3 On UPGRADE, fire an event named elementupgrade with its bubbles
    // attribute set to true.
    /* TODO(sjmiles) */
  }
};

// SECTION 5

// TODO(sjmiles): deals with UA parsing HTML; do we need to polyfill
// something here?

// SECTION 7.1

var validateArguments = function(inName, inOptions) {
  // The custom element name must start with a U+0078 LATIN SMALL LETTER X,
  // followed by U+002D HYPHEN-MINUS
  // TODO(sjmiles): wrong test
  if (!inName) {
    // 7.1.1. If NAME is an invalid custom element name, throw an
    // InvalidCharacterError exception.
    // TODO(sjmiles): wrong exception
    throw("name required");
  }
  // The element prototype itself must inherit from the HTMLElement interface
  var p = inOptions.prototype;
  if (p && !(p instanceof HTMLElement)) {
    // 7.1.3. if PROTOTYPE does not inherit from the HTMLElement interface,
    // throw a TypeMismatchError exception.
    throw "7.1.3. TypeMismatchError:  element prototype must inherit from HTMLElement";
  }
};

var register = function(inName, inOptions) {
  //
  // 7. Input
  //	DOCUMENT, the document on which the method is called
  //	NAME, the custom element name of the element being registered
  //	PROTOTYPE, the element prototype, optional
  //	TEMPLATE, the custom element template, optional
  //
  // TODO(sjmiles): resolve discrepancy between input and the formal arguments
  //
  validateArguments(inName, inOptions);
  var template = inOptions.template;
  // 7.1.2 If PROTOTYPE is missing, let PROTOTYPE be the interface prototype
  // object for the HTMLSpanElement interface
  var prototype = inOptions.prototype || HTMLSpanElement.prototype;
  // TODO(sjmiles): putting name on prototype not in spec
  prototype.is = inName;
  // TODO(sjmiles): lifecycle not in spec
  var lifecycle = inOptions.lifecycle || {};
  // 7.1.4 Let DEFINITION be the tuple of (PROTOTYPE, TEMPLATE, NAME)
  var definition = {
    prototype: prototype,
    template: template,
    name: inName,
    // TODO(sjmiles): OFF SPEC: lifecycle not in spec
    lifecycle: lifecycle
  };
  // 
  // TODO(sjmiles): OFF SPEC: get tricky with lifecycle
  var ancestor = registry[prototype.extendsName];
  if (ancestor) {
    lifecycle.__proto__ = ancestor.lifecycle;
  }
  // 
  // 7.1.5: Register the DEFINITION with DOCUMENT
  registry[inName] = definition;
  //
  // TODO(sjmiles): OFFSPEC: re-ordering the flow
  // so that prototype has the correct constructor on it
  // at instantiate time (when we call upgradeElements)
  // 
  // 7.1.7. Run custom element constructor generation algorithm with PROTOTYPE
  // and TEMPLATE as arguments
  // 7.1.8. Return the output of the previous step.
  // 7. Output: CONSTRUCTOR, the custom element constructor
  var ctor = generateConstructor(prototype, template, lifecycle);
  // TODO(sjmiles): OFF SPEC: for deubgging only
  ctor.tag = inName;
  //
  // 7.1.6: For DOCUMENT tree and every shadow DOM subtree enclosed by
  // DOCUMENT tree:
  //
  // TODO(sjmiles): "and every shadow DOM subtree" may not be possible
  // from polyfill. We will ensure this happens for shadow subtrees
  // created by this polyfill, but any others are invisible.
  // 
  // 7.1.6.1. Let TREE be this tree
  // 7.1.6.2. Run element upgrade algorithm with TREE and DEFINITION as
  // arguments
  //
  upgradeElements(document, definition);
  return ctor;
};

// SECTION 7.2

// see HTMLElementElement.js

// exports

var exports = {
  instantiate: instantiate,
  generateConstructor: generateConstructor,
  generatePrototype: generatePrototype,
  upgradeElements: upgradeElements,
  validateArguments: validateArguments,
  register: register,
  registry: registry
};

scope.CustomDOMElements = exports;

// new public API

document.register = register;

})(window.__exported_components_polyfill_scope__);
