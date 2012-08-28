(function(scope) {

scope = scope || {};

// marshall shadow dom implementation
// TODO(sjmiles): make less phony
if (!window.shadowDomImpl) {
  shadowDomImpl = {
    createShadowDom: function(inInstance, inContents) {
      inInstance.shadow = inContents;
      inInstance.appendChild(inInstance.shadow);
    }
  };
}

// custom element definition registry (name: definition)

var registry = {
};

// SECTION 4

var baseTag = "div";

var instantiate = function(inPrototype, inTemplate) {
  // 4.a.1. Create a new object that implements PROTOTYPE
  // 4.a.2. Let ELEMENT by this new object
  var element = document.createElement(baseTag);
  element.__proto__ = inPrototype;
  // 4.a.3. if template was provided
  if (inTemplate) {
    // 4.a.3.1 create a shadow root with ELEMENT as it's host
    // 4.a.3.2. clone template as contents of this shadow root
    shadowDomImpl.createShadowDom(element, inTemplate.content.cloneNode(true));
  }
  return element;
};

var generateConstructor = function(inPrototype, inTemplate) {
  // 4.b.1. Generate a function object which, when called:
  // 4.b.1.1. Runs the custom element instantiation algorithm with PROTOTYPE
  // and TEMPLATE as arguments.
  // 4.b.1.2. Returns algorithm's output as result
  // 4.b.2. Let CONSTRUCTOR be that function object
  var constructor = function() {
    return instantiate(inPrototype, inTemplate);
  };
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
  // 6.a.2. If EXTENDS is a custom element name name, let BASE be the element
  // prototype of the custom DOM element with the custom element name of EXTENDS
  /* TODO(sjmiles) */

  // 6.a.3. Otherwise
  // 6.a.3.1 If BASE is defined in HTML specification or other applicable
  // specifications, let BASE be the interface prototype object for the element
  // type corresponding to the HTML tag name of EXTENDS
  // 6.a.3.2 Otherwise, throw a NotSupportedError exception.
  /* TODO(sjmiles) */

  // 6.a.3.3 Create a new object that implements BASE
  // 6.a.3.4 Let PROTOTYPE be this new object
  var prototype = document.createElement(inExtends);
  // 6.a.3.5 If PROPERTIES is present and not undefined, define properties on
  // PROTOTYPE using PROPERTIES
  // TODO(sjmiles): determine if this is acceptable implementation of 
  // 'define properties'
  inProperties.__proto__ = prototype.__proto__;
  prototype.__proto__ = inProperties;
  return prototype;
};

var upgradeElements = function(inTree, inDefinition) {
  // 6.b.1 Let NAME be the custom element name part of DEFINITION
  var name = inDefinition.name;
  // 6.b.2 For each element ELEMENT in TREE whose custom element name is NAME:
  var elements = inTree.querySelectorAll(name);
  for (var i=0, element; element=elements[i]; i++) {
    // 6.b.2.3. Let UPGRADE be the result of running custom element
    // instantiation algorithm with PROTOTYPE and TEMPLATE as arguments
    var upgrade = instantiate(inDefinition.prototype, inDefinition.template);
    // TODO(sjmiles): not in spec
    upgrade.setAttribute("is", inDefinition.name);
    // 6.b.2.4 Replace ELEMENT with UPGRADE in TREE
    element.parentNode.replaceChild(upgrade, element);
  // 6.b.3 On UPGRADE, fire an event named elementupgrade with its bubbles
  // attribute set to true.
  /* TODO(sjmiles) */
  }
};

// SECTION 5 deals with UA parsing HTML
//
// TODO(sjmiles): do we need to polyfill something here?

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
  // 7.1.2 If PROTOTYPE is missing, let PROTOTYPE be the interface prototype
  // object for the HTMLSpanElement interface
  var prototype = inOptions.prototype || HTMLSpanElement.prototype;
  var template = inOptions.template;
  // 7.1.4 Let DEFINITION be the tuple of (PROTOTYPE, TEMPLATE, NAME)
  var definition = {
    prototype: prototype,
    template: template,
    name: inName
  };
  // 7.1.5: Register the DEFINITION with DOCUMENT
  registry[inName] = definition;
  // 7.1.6: For DOCUMENT tree and every shadow DOM subtree enclosed by
  // DOCUMENT tree:
  /* TODO(sjmiles): and every shadow DOM subtree */
  // 7.1.6.1. Let TREE be this tree
  // 7/1.6.2. Run element upgrade algorithm with TREE and DEFINITION as
  // arguments
  upgradeElements(document, definition);
  // 7.1.7. Run custom element constructor generation algorithm with PROTOTYPE
  // and TEMPLATE as arguments
  // 7.1.8. Return the output of the previous step.
  // 7. Output: CONSTRUCTOR, the custom element constructor
  return generateConstructor(prototype, template);
};

// SECTION 7.2

HTMLElementElement = function(inElement) {
  this.name = inElement.getAttribute("name");
  this.constructorName = inElement.getAttribute("constructor");
  this.extendsName = inElement.getAttribute("extendsName");
};

// exports

var exports = {
  instantiate: instantiate,
  generateConstructor: generateConstructor,
  generatePrototype: generatePrototype,
  upgradeElements: upgradeElements,
  validateArguments: validateArguments,
  register: register,
  HTMLElementElement: HTMLElementElement
};

scope.CustomDOMElements = exports;

// new public API

document.register = register;

})(window.__exported_components_polyfill_scope__);
