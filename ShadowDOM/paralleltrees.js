/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

var logical, visual;

(function() {

  var slice = Array.prototype.slice.call.bind(Array.prototype.slice);

  var wrapperTable = new SideTable('wrapper');

  function assert(b) {
    if (!b)
      throw new Error('Assertion failed');
  }

  /**
   * Wraps a node in a WrapperNode. If there already exists a wrapper for the
   * |node| that wrapper is returned instead.
   * @param {Node} node
   * @return {WrapperNode}
   */
  function wrap(node) {
    if (node === null)
      return null;

    assert(node instanceof Node);
    var wrapper = wrapperTable.get(node);
    if (!wrapper) {
      wrapper = new WrapperNode(node);
      wrapperTable.set(node, wrapper);
    }
    return wrapper;
  }

  /**
   * Unwraps a wrapper and returns the node it is wrapping.
   * @param {WrapperNode} wrapper
   * @return {Node}
   */
  function unwrap(wrapper) {
    if (wrapper === null)
      return null;
    assert(wrapper instanceof WrapperNode);
    return wrapper.node;
  }

  /**
   * @param {!Node} node
   * @return {!WrapperNode|undefined}
   */
  function getExistingWrapper(node) {
    assert(node instanceof Node);
    return wrapperTable.get(node);
  }

  /**
   * @param {!Node} node
   * @return {Array.<!Node> An array of the nodes.
   * @this
   */
  function getChildNodesSnapshot(node) {
    var result = [], i = 0;
    for (var child = this.getFirstChild(node); child; child = this.getNextSibling(child)) {
      result[i++] = child;
    }
    return result;
  }

  function getLogicalPropertyFunction(propertyName) {
    return function(node) {
      var wrapper = getExistingWrapper(node);
      if (wrapper)
        return unwrap(wrapper[propertyName]);
      return node[propertyName];
    }
  }

  /**
   * Whether the |node| has any childNode that has a wrapper.
   * @param {!Node} node
   * @return {boolean}
   */
  function hasAnyChildWrapper(node) {
    for (var child = node.firstChild; child; child = child.nextSibling) {
      if (getExistingWrapper(child))
        return true;
    }
    return false;
  }

  // This object groups DOM operations. This is supposed to be the DOM as the
  // developer sees it.
  logical = {
    getParentNode: getLogicalPropertyFunction('parentNode'),
    getFirstChild: getLogicalPropertyFunction('firstChild'),
    getLastChild: getLogicalPropertyFunction('lastChild'),
    getNextSibling: getLogicalPropertyFunction('nextSibling'),
    getPreviousSibling: getLogicalPropertyFunction('previousSibling'),
    removeAllChildNodes: function(node) {
      var wrapper = getExistingWrapper(node);
      if (!wrapper) {
        if (!hasAnyChildWrapper(node)) {
          node.textContent = '';
          return;
        }
        wrapper = wrap(node);
      }
      wrapper.removeAllChildNodes();
    },
    getWrapper: wrap,
    getChildNodesSnapshot: getChildNodesSnapshot
  };

  /**
   * Updates the fields of a wrapper to a snapshot of the logical DOM as needed.
   * Up means parenNode
   * Sideways means previous and next sibling.
   * @param {!WrapperNode} wrapper
   */
  function updateWrapperUpAndSideways(wrapper) {
    wrapper.previousSibling_ = wrapper.previousSibling;
    wrapper.nextSibling_ = wrapper.nextSibling;
    wrapper.parentNode_ = wrapper.parentNode;
  }

  /**
   * Updates the fields of a wrapper to a snapshot of the logical DOM as needed.
   * Down means first and last child
   * @param {!WrapperNode} wrapper
   */
  function updateWrapperDown(wrapper) {
    wrapper.firstChild_ = wrapper.firstChild;
    wrapper.lastChild_ = wrapper.lastChild;
  }

  function getVisualPropertyFunction(propertyName) {
    return function(node) {
      return node[propertyName];
    };
  }

  // This object groups DOM operations. This is supposed to be the DOM as the
  // browser/render tree sees it.
  // When changes are done to the visual DOM the logical DOM needs to be updated
  // to reflect the correct tree.
  visual = {
    removeAllChildNodes: function(parentNode) {
      var parentNodeWrapper = wrap(parentNode);
      for (var child = parentNodeWrapper.firstChild;
           child;
           child = child.nextSibling) {
        updateWrapperUpAndSideways(child);
      }
      updateWrapperDown(parentNodeWrapper);

      parentNode.textContent = '';
    },

    appendChild: function(parentNode, child) {
      this.remove(child);

      var childWrapper = wrap(child);
      updateWrapperUpAndSideways(childWrapper);

      var parentNodeWrapper = wrap(parentNode);
      parentNodeWrapper.lastChild_ = parentNodeWrapper.lastChild;
      if (parentNodeWrapper.lastChild === parentNodeWrapper.firstChild)
        parentNodeWrapper.firstChild_ = parentNodeWrapper.firstChild;

      var lastChildWrapper = wrap(parentNode.lastChild);
      if (lastChildWrapper) {
        lastChildWrapper.nextSibling_ = lastChildWrapper.nextSibling;
      }

      parentNode.appendChild(child);
    },

    removeChild: function(parentNode, child) {
      var parentNodeWrapper = wrap(parentNode);

      var childWrapper = wrap(child);
      updateWrapperUpAndSideways(childWrapper);

      if (childWrapper.previousSibling)
        childWrapper.previousSibling.nextSibling_ = childWrapper;
      if (childWrapper.nextSibling)
        childWrapper.nextSibling.previousSibling_ = childWrapper;

      if (parentNodeWrapper.lastChild === childWrapper)
        parentNodeWrapper.lastChild_ = childWrapper;
      if (parentNodeWrapper.firstChild === childWrapper)
        parentNodeWrapper.firstChild_ = childWrapper;

      parentNode.removeChild(child);
    },

    remove: function(node) {
      if (node.parentNode)
        this.removeChild(node.parentNode, node);
    },

    getParentNode: getVisualPropertyFunction('parentNode'),
    getFirstChild: getVisualPropertyFunction('firstChild'),
    getLastChild: getVisualPropertyFunction('lastChild'),
    getNextSibling: getVisualPropertyFunction('nextSibling'),
    getPreviousSibling: getVisualPropertyFunction('previousSibling'),
    getChildNodesSnapshot: getChildNodesSnapshot
  };

  /**
   * This represents a logical DOM node.
   * @param {!Node} original The original DOM node, aka, the visual DOM node.
   * @constructor
   */
  function WrapperNode(original) {
    /**
     * @type {!Node}
     */
    this.node = original;

    // These properties are used to override the visual references with the
    // logical ones. If the value is undefined it means that the logical is the
    // same as the visual.

    /**
     * @type {WrapperNode|undefined}
     * @private
     */
    this.parentNode_ = undefined;

    /**
     * @type {WrapperNode|undefined}
     * @private
     */
    this.firstChild_ = undefined;

    /**
     * @type {WrapperNode|undefined}
     * @private
     */
    this.lastChild_ = undefined;

    /**
     * @type {WrapperNode|undefined}
     * @private
     */
    this.nextSibling_ = undefined;

    /**
     * @type {WrapperNode|undefined}
     * @private
     */
    this.previousSibling_ = undefined;
  }

  WrapperNode.prototype = {
    // TODO(arv): Implement these

    // appendChild: function(child) {
    //   assert(child instanceof WrapperNode);
    //   if (child.parentNode)
    //     child.parentNode.removeChild(child);
    //   if (!this.lastChild) {
    //     this.firstChild_ = this.lastChild_ = child;
    //   } else {
    //     this.lastChild.nextSibling_ = child;
    //     child.previousSibling_ = this.lastChild;
    //     this.lastChild_ = child;
    //   }
    //   child.parentNode_ = this;
    // },

    // removeChild: function(child) {
    //   assert(child instanceof WrapperNode);
    //   if (child.parentNode !== this)
    //     throw Error('wrong parentNode');

    //   if (this.firstChild === child)
    //     this.firstChild_ = child.nextSibling;
    //   if (this.lastChild === child)
    //     this.lastChild_ = child.previousSibling;
    //   if (child.previousSibling)
    //     child.previousSibling.nextSibling_ = child.nextSibling;
    //   if (child.nextSibling)
    //     child.nextSibling.previousSibling_ = child.previousSibling;

    //   child.previousSibling_ = child.nextSibling_ = child.parentNode_ = null;
    // },

    removeAllChildNodes: function() {
      var child = this.firstChild;
      while (child) {
        assert(child.parentNode === this);
        var nextSibling = child.nextSibling;
        var childNode = unwrap(child);
        child.previousSibling_ = child.nextSibling_ = child.parentNode_ = null;
        if (childNode.parentNode)
          childNode.parentNode.removeChild(childNode);
        child = nextSibling;
      }
      this.firstChild_ = this.lastChild_ = null;
    },

    hasChildNodes: function() {
      return this.firstChild === null;
    },

    /** @type {WrapperNode} */
    get parentNode() {
      // If the parentNode has not been overridden, use the original parentNode.
      return this.parentNode_ !== undefined ?
          this.parentNode_ : wrap(this.node.parentNode);
    },

    /** @type {WrapperNode} */
    get firstChild() {
      return this.firstChild_ !== undefined ?
          this.firstChild_ : wrap(this.node.firstChild);
    },

    /** @type {WrapperNode} */
    get lastChild() {
      return this.lastChild_ !== undefined ?
          this.lastChild_ : wrap(this.node.lastChild);
    },

    /** @type {WrapperNode} */
    get nextSibling() {
      return this.nextSibling_ !== undefined ?
          this.nextSibling_ : wrap(this.node.nextSibling);
    },

    /** @type {WrapperNode} */
    get previousSibling() {
      return this.previousSibling_ !== undefined ?
          this.previousSibling_ : wrap(this.node.previousSibling);
    },
  };

})();