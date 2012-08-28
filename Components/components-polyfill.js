(function(scope) {

scope = scope || {};

// NOTE: use attributes on the script tag for this file as directives

// export="[name]"		exports polyfill scope into window as 'name'

// NOTE: uses 'window' and 'document' globals

// directives

var thisFile = "components-polyfill.js";

var source, base = "";

(function() {
	var s$ = document.querySelectorAll('[src]');
	Array.prototype.forEach.call(s$, function(s) {
		var src = s.getAttribute('src');
		if (src.slice(-thisFile.length) == thisFile) {
			source = s;
			base = src.slice(0, -thisFile.length);
		}
	});
	source = source || {getAttribute: nop};
})();

var flags = scope.flags = {
	exportAs: source.getAttribute("export")
};

console.log(flags);

if (flags.exportAs) {
	window[flags.exportAs] = scope;
}

window.__exported_components_polyfill_scope__ = scope;


var require = function(inSrc) {
	document.write('<script src="' + base + inSrc + '"></script>');
};

[
  "lib/lang.js",
  "ComponentDocuments/path.js",
  "ComponentDocuments/loader.js",
  "ComponentDocuments/parser.js",
	"CustomDOMElements.js",
	"boot.js"
].forEach(require);

})(window.__exported_components_polyfill_scope__);
