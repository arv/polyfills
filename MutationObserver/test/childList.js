/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('JsMutationObserver childList', function() {

  test('Direct children', function() {
    var div = document.createElement('div');
    var observer = new JsMutationObserver(function() {});
    observer.observe(div, {
      childList: true
    });
    var a = document.createTextNode('a');
    var b = document.createTextNode('b');

    div.appendChild(a);
    div.insertBefore(b, a);
    div.removeChild(b);

    var records = observer.takeRecords();

    expect(records.length).to.be(3);

    expectRecord(records[0], {
      type: 'childList',
      target: div,
      addedNodes: [a]
    });

    expectRecord(records[1], {
      type: 'childList',
      target: div,
      nextSibling: a,
      addedNodes: [b]
    });

    expectRecord(records[2], {
      type: 'childList',
      target: div,
      nextSibling: a,
      removedNodes: [b]
    });
  });

  test('subtree', function() {
    var div = document.createElement('div');
    var child = div.appendChild(document.createElement('div'));
    var observer = new JsMutationObserver(function() {});
    observer.observe(child, {
      childList: true
    });
    var a = document.createTextNode('a');
    var b = document.createTextNode('b');

    child.appendChild(a);
    child.insertBefore(b, a);
    child.removeChild(b);

    var records = observer.takeRecords();
    expect(records.length).to.be(3);

    expectRecord(records[0], {
      type: 'childList',
      target: child,
      addedNodes: [a]
    });

    expectRecord(records[1], {
      type: 'childList',
      target: child,
      nextSibling: a,
      addedNodes: [b]
    });

    expectRecord(records[2], {
      type: 'childList',
      target: child,
      nextSibling: a,
      removedNodes: [b]
    });
  });

  test('both direct and subtree', function() {
    var div = document.createElement('div');
    var child = div.appendChild(document.createElement('div'));
    var observer = new JsMutationObserver(function() {});
    observer.observe(div, {
      childList: true,
      subtree: true
    });
    observer.observe(child, {
      childList: true
    });

    var a = document.createTextNode('a');
    var b = document.createTextNode('b');

    child.appendChild(a);
    div.appendChild(b);

    var records = observer.takeRecords();
    expect(records.length).to.be(2);

    expectRecord(records[0], {
      type: 'childList',
      target: child,
      addedNodes: [a]
    });

    expectRecord(records[1], {
      type: 'childList',
      target: div,
      addedNodes: [b],
      previousSibling: child
    });
  });

  test('Append multiple at once at the end', function() {
    var div = document.createElement('div');
    var a = div.appendChild(document.createTextNode('a'));

    var observer = new JsMutationObserver(function() {});
    observer.observe(div, {
      childList: true
    });

    var df = document.createDocumentFragment();
    var b = df.appendChild(document.createTextNode('b'));
    var c = df.appendChild(document.createTextNode('c'));
    var d = df.appendChild(document.createTextNode('d'));

    div.appendChild(df);

    var records = observer.takeRecords();
    expect(records.length).to.be(1);

    expectRecord(records[0], {
      type: 'childList',
      target: div,
      addedNodes: [b, c, d],
      previousSibling: a
    });
  });

  test('Append multiple at once at the front', function() {
    var div = document.createElement('div');
    var a = div.appendChild(document.createTextNode('a'));

    var observer = new JsMutationObserver(function() {});
    observer.observe(div, {
      childList: true
    });

    var df = document.createDocumentFragment();
    var b = df.appendChild(document.createTextNode('b'));
    var c = df.appendChild(document.createTextNode('c'));
    var d = df.appendChild(document.createTextNode('d'));

    div.insertBefore(df, a);

    var records = observer.takeRecords();
    expect(records.length).to.be(1);

    expectRecord(records[0], {
      type: 'childList',
      target: div,
      addedNodes: [b, c, d],
      nextSibling: a
    });
  });

  test('Append multiple at once in the middle', function() {
    var div = document.createElement('div');
    var a = div.appendChild(document.createTextNode('a'));
    var b = div.appendChild(document.createTextNode('b'));

    var observer = new JsMutationObserver(function() {});
    observer.observe(div, {
      childList: true
    });

    var df = document.createDocumentFragment();
    var c = df.appendChild(document.createTextNode('c'));
    var d = df.appendChild(document.createTextNode('d'));

    div.insertBefore(df, b);

    var records = observer.takeRecords();
    expect(records.length).to.be(1);

    expectRecord(records[0], {
      type: 'childList',
      target: div,
      addedNodes: [c, d],
      previousSibling: a,
      nextSibling: b
    });
  });

  test('Remove all children', function() {
    var div = document.createElement('div');
    var a = div.appendChild(document.createTextNode('a'));
    var b = div.appendChild(document.createTextNode('b'));
    var c = div.appendChild(document.createTextNode('c'));

    var observer = new JsMutationObserver(function() {});
    observer.observe(div, {
      childList: true
    });

    div.innerHTML = '';

    var records = observer.takeRecords();
    expect(records.length).to.be(1);

    expectRecord(records[0], {
      type: 'childList',
      target: div,
      removedNodes: [a, b, c]
    });
  });

  test('Replace all children using innerHTML', function() {
    // Firefox generates multiple records for innerHTML/textContent.
    if (useNativeMutationObserver && /Firefox/.test(navigator.userAgent))
      return;

    var div = document.createElement('div');
    var a = div.appendChild(document.createTextNode('a'));
    var b = div.appendChild(document.createTextNode('b'));

    var observer = new JsMutationObserver(function() {});
    observer.observe(div, {
      childList: true
    });

    div.innerHTML = '<c></c><d></d>';
    var c = div.firstChild;
    var d = div.lastChild;

    var records = observer.takeRecords();
    expect(records.length).to.be(1);

    expectRecord(records[0], {
      type: 'childList',
      target: div,
      addedNodes: [c, d],
      removedNodes: [a, b]
    });
  });

});