(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ?  factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.QuillImagePreview = {})));
})(this, function(exports) {
"use strict";
Object.defineProperty(exports, '__esModule', { value: true });

//#region src/index.ts
var QuillImagePreview = class {
	options;
	constructor(quill, options) {
		this.quill = quill;
		this.options = this.resolveOptions(options);
		this.quill.root.addEventListener("click", this.imagePreviewCheck);
	}
	resolveOptions(options) {
		return Object.assign({
			enableOnEdit: true,
			beforePreviewDisplay: () => false
		}, options);
	}
	imagePreviewCheck = (e) => {
		if (this.options.enableOnEdit && !this.quill.isEnabled()) return;
		const target = e.target;
		if (target && target.tagName === "IMG" && !this.options.beforePreviewDisplay.call(this, target)) this.createImagePreview(target);
	};
	createImagePreview(img) {
		const temp = document.createElement("div");
		temp.innerHTML = `
      <div class="fixed top-0 left-0 right-0 bottom-0 z-500 backdrop-blur-7">
        <div class="absolute top-0 left-0 right-0 bottom-0 bg-black:50 z--1" />
        <img src="${img.src}" class="max-w-screen max-h-screen w-full h-full object-contain">
      </div>
    `;
		const wrapper = temp.children[0];
		wrapper.addEventListener("click", () => {
			document.body.removeChild(wrapper);
		});
		document.body.appendChild(wrapper);
	}
};
var src_default = QuillImagePreview;

//#endregion
exports.QuillImagePreview = QuillImagePreview
exports.default = src_default
});
//# sourceMappingURL=index.umd.js.map