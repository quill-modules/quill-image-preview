import type Quill from 'quill';
import { ImageZoom } from './zoom';

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
    if (this.quill.isEnabled() && !this.options.enableOnEdit) return;
    const target = e.target as HTMLElement;
    if (target && target.tagName === 'IMG' && !this.options.beforePreviewDisplay.call(this, target as HTMLImageElement)) {
      this.createImagePreview(target as HTMLImageElement);
    }
  };

  createImagePreview(img: HTMLImageElement) {
    const temp = document.createElement('div');
    temp.innerHTML = `
      <div class="image-preview">
        <div class="image-preview-backdrop" />
        <img src="${img.src}" class="image-preview-img" draggable="false">
      </div>
    `;
    const wrapper = temp.children[0] as HTMLElement;
    const zoomImg = wrapper.querySelector('img') as HTMLImageElement;

    const zoom = new ImageZoom(zoomImg, wrapper);

    wrapper.addEventListener('click', () => {
      if (zoom.shouldPreventClose()) {
        return;
      }
      zoom.destroy();
      document.body.removeChild(wrapper);
    });

    document.body.appendChild(wrapper);
  }
}

export { ImageZoom } from './zoom';
export default QuillImagePreview;
