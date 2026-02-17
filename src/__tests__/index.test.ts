import type QuillImagePreview from '../index';
import {beforeEach, describe, expect, it, vi } from 'vitest';
import { createEditor } from './utils';

beforeEach(() => {
  // Clean up any preview overlays from previous tests
  document.querySelectorAll('.image-preview').forEach(el => el.remove());
});

describe('imagePreviewCheck', () => {
  it('should trigger preview when clicking an IMG element', () => {
    const quill = createEditor();
    const module = quill.getModule('image-preview') as QuillImagePreview;
    const createPreviewSpy = vi.spyOn(module, 'createImagePreview');

    const img = document.createElement('img');
    img.src = 'https://example.com/test.jpg';
    quill.root.appendChild(img);

    const clickEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', { value: img, writable: false });
    img.dispatchEvent(clickEvent);

    expect(createPreviewSpy).toHaveBeenCalledWith(img);
  });

  it('should not trigger preview when clicking non-IMG element', () => {
    const quill = createEditor();
    const module = quill.getModule('image-preview') as QuillImagePreview;
    const createPreviewSpy = vi.spyOn(module, 'createImagePreview');

    const div = document.createElement('div');
    quill.root.appendChild(div);

    const clickEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', { value: div, writable: false });
    div.dispatchEvent(clickEvent);

    expect(createPreviewSpy).not.toHaveBeenCalled();
  });

  it('should allow preview when quill is disabled regardless of enableOnEdit', () => {
    const quill = createEditor({ enableOnEdit: false });
    const module = quill.getModule('image-preview') as QuillImagePreview;
    const createPreviewSpy = vi.spyOn(module, 'createImagePreview');

    quill.disable();

    const img = document.createElement('img');
    img.src = 'https://example.com/test.jpg';
    quill.root.appendChild(img);

    const clickEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', { value: img, writable: false });
    img.dispatchEvent(clickEvent);

    expect(createPreviewSpy).toHaveBeenCalledWith(img);
  });

  it('should not allow preview when enableOnEdit is false and quill is enabled', () => {
    const quill = createEditor({ enableOnEdit: false });
    const module = quill.getModule('image-preview') as QuillImagePreview;
    const createPreviewSpy = vi.spyOn(module, 'createImagePreview');

    const img = document.createElement('img');
    img.src = 'https://example.com/test.jpg';
    quill.root.appendChild(img);

    const clickEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', { value: img, writable: false });
    img.dispatchEvent(clickEvent);

    expect(createPreviewSpy).not.toHaveBeenCalled();
  });

  it('should call beforePreviewDisplay hook before showing preview', () => {
    const beforePreviewDisplay = vi.fn(() => false);
    const quill = createEditor({ beforePreviewDisplay });
    const module = quill.getModule('image-preview') as QuillImagePreview;
    const createPreviewSpy = vi.spyOn(module, 'createImagePreview');

    const img = document.createElement('img');
    img.src = 'https://example.com/test.jpg';
    quill.root.appendChild(img);

    const clickEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', { value: img, writable: false });
    img.dispatchEvent(clickEvent);

    expect(beforePreviewDisplay).toHaveBeenCalledWith(img);
    expect(createPreviewSpy).toHaveBeenCalledWith(img);
  });

  it('should not show preview when beforePreviewDisplay returns true', () => {
    const beforePreviewDisplay = vi.fn(() => true);
    const quill = createEditor({ beforePreviewDisplay });
    const module = quill.getModule('image-preview') as QuillImagePreview;
    const createPreviewSpy = vi.spyOn(module, 'createImagePreview');

    const img = document.createElement('img');
    img.src = 'https://example.com/test.jpg';
    quill.root.appendChild(img);

    const clickEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', { value: img, writable: false });
    img.dispatchEvent(clickEvent);

    expect(beforePreviewDisplay).toHaveBeenCalledWith(img);
    expect(createPreviewSpy).not.toHaveBeenCalled();
  });
});

describe('createImagePreview', () => {
  it('should create preview overlay in document.body', () => {
    const quill = createEditor();
    const module = quill.getModule('image-preview') as QuillImagePreview;

    const img = document.createElement('img');
    img.src = 'https://example.com/test.jpg';

    module.createImagePreview(img);

    const wrapper = document.body.querySelector('.image-preview');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.querySelector('img')?.getAttribute('src')).toBe('https://example.com/test.jpg');
  });

  it('should remove preview overlay when clicked', () => {
    const quill = createEditor();
    const module = quill.getModule('image-preview') as QuillImagePreview;

    const img = document.createElement('img');
    img.src = 'https://example.com/test.jpg';

    module.createImagePreview(img);

    const wrapper = document.body.querySelector('.image-preview') as HTMLElement;
    expect(wrapper).toBeTruthy();

    // The wrapper has a click listener that removes it from DOM
    // Use dispatchEvent to ensure the event listener is triggered
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    wrapper.dispatchEvent(clickEvent);

    expect(document.body.querySelector('.image-preview')).toBeFalsy();
  });

  it('should preserve original img src in preview', () => {
    const quill = createEditor();
    const module = quill.getModule('image-preview') as QuillImagePreview;

    const testSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const img = document.createElement('img');
    img.src = testSrc;

    module.createImagePreview(img);

    const previewImg = document.body.querySelector('.image-preview img');
    expect(previewImg?.getAttribute('src')).toBe(testSrc);
  });
});

describe('integration tests', () => {
  it('should complete full preview flow: click -> show -> click to close', () => {
    const quill = createEditor();

    const img = document.createElement('img');
    img.src = 'https://example.com/test.jpg';
    quill.root.appendChild(img);

    const wrapperBefore = document.body.querySelector('.image-preview');
    expect(wrapperBefore).toBeFalsy();

    img.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const wrapperAfter = document.body.querySelector('.image-preview') as HTMLElement;
    expect(wrapperAfter).toBeTruthy();

    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    wrapperAfter.dispatchEvent(clickEvent);

    const wrapperClosed = document.body.querySelector('.image-preview');
    expect(wrapperClosed).toBeFalsy();
  });

  it('should handle multiple images independently', () => {
    const quill = createEditor();

    const img1 = document.createElement('img');
    img1.src = 'https://example.com/image1.jpg';
    quill.root.appendChild(img1);

    const img2 = document.createElement('img');
    img2.src = 'https://example.com/image2.jpg';
    quill.root.appendChild(img2);

    img1.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const previewImg = document.body.querySelector('.image-preview img');
    expect(previewImg?.getAttribute('src')).toBe('https://example.com/image1.jpg');

    const wrapper = document.body.querySelector('.image-preview') as HTMLElement;
    wrapper?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    img2.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const previewImg2 = document.body.querySelector('.image-preview img');
    expect(previewImg2?.getAttribute('src')).toBe('https://example.com/image2.jpg');
  });
});
