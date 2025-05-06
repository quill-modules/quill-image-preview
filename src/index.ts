import type Quill from 'quill';

export interface QuillImagePreviewOptions {
  enableOnEdit: boolean;
  beforePreviewDisplay: (this: QuillImagePreview, img: HTMLImageElement) => boolean;
}
export class QuillImagePreview {
  options: QuillImagePreviewOptions;
  constructor(public quill: Quill, options: Partial<QuillImagePreviewOptions>) {
    this.options = this.resolveOptions(options);
    this.quill.root.addEventListener('click', this.imagePreviewCheck);
  }

  resolveOptions(options: Partial<QuillImagePreviewOptions>) {
    return Object.assign({
      enableOnEdit: true,
      beforePreviewDisplay: () => false,
    }, options);
  }

  imagePreviewCheck = (e: MouseEvent) => {
    if (!this.options.enableOnEdit && this.quill.isEnabled()) return;
    const target = e.target as HTMLElement;
    if (target && target.tagName === 'IMG' && !this.options.beforePreviewDisplay.call(this, target as HTMLImageElement)) {
      this.createImagePreview(target as HTMLImageElement);
    }
  };

  createImagePreview(img: HTMLImageElement) {
    const temp = document.createElement('div');
    temp.innerHTML = `
      <div class="fixed top-0 left-0 right-0 bottom-0 z-500 backdrop-blur-7">
        <div class="absolute top-0 left-0 right-0 bottom-0 bg-black:50 z--1" />
        <img src="${img.src}" class="max-w-screen max-h-screen w-full h-full object-contain">
      </div>
    `;
    const wrapper = temp.children[0];
    wrapper.addEventListener('click', () => {
      document.body.removeChild(wrapper);
    });
    document.body.appendChild(wrapper);
  }
}

export default QuillImagePreview;
