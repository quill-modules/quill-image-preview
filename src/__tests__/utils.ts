import type { Delta as TypeDelta, Range as TypeRange } from 'quill';
import type { QuillImagePreviewOptions } from '../index';
import Quill from 'quill';
import { expect, vi } from 'vitest';
import QuillImagePreview from '../index';

const Delta = Quill.import('delta');

export const normalizeHTML = (html: string | { html: string }) => typeof html === 'object' ? html.html : html.replaceAll(/\n\s*/g, '');
export function normalizeStyle(style: string) {
  if (!style) return '';
  return style
    .split(';')
    .map(style => style.trim())
    .filter(Boolean)
    .map((style) => {
      const [property, value] = style.split(':').map(s => s.trim());
      return property && value ? `${property}:${value}` : '';
    })
    .filter(Boolean)
    .toSorted()
    .join(';');
}

export function sortAttributes(element: HTMLElement) {
  const attributes = Array.from(element.attributes);
  const sortedAttributes = attributes.toSorted((a, b) => a.name.localeCompare(b.name));

  while (element.attributes.length > 0) {
    element.removeAttribute(element.attributes[0].name);
  }

  for (const attr of sortedAttributes) {
    element.setAttribute(attr.name, attr.value);
  }

  element.childNodes.forEach((child) => {
    if (child instanceof HTMLElement) {
      sortAttributes(child);
    }
  });
}

export function replaceAttrEmptyRow(value: string) {
  try {
    const emptyRow = JSON.parse(value);
    return `length:${emptyRow.length}`;
  }
  catch {
    return value;
  }
}

expect.extend({
  toEqualHTML(
    received,
    expected,
    {
      ignoreAttrs = [],
      replaceAttrs = {},
    }: {
      ignoreAttrs?: string[];
      replaceAttrs?: Record<string, (attrValue: string) => string>;
    } = {},
  ) {
    const receivedDOM = document.createElement('div');
    const expectedDOM = document.createElement('div');
    receivedDOM.innerHTML = normalizeHTML(
      typeof received === 'string' ? received : received.innerHTML,
    );
    expectedDOM.innerHTML = normalizeHTML(expected);

    for (const [attr, handler] of Object.entries(replaceAttrs)) {
      for (const node of Array.from(receivedDOM.querySelectorAll(`[${attr}]`))) {
        const attrValue = node.getAttribute(attr);
        if (attrValue) {
          node.setAttribute(attr, handler(attrValue));
        }
      }
    }

    const doms = [receivedDOM, expectedDOM];
    for (const dom of doms) {
      for (const node of Array.from(dom.querySelectorAll('.ql-ui'))) {
        node.remove();
      }

      for (const attr of ignoreAttrs) {
        for (const node of Array.from(dom.querySelectorAll(`[${attr}]`))) {
          node.removeAttribute(attr);
        }
      }

      sortAttributes(dom);

      // normalize style attributes to handle different order
      for (const node of Array.from(dom.querySelectorAll('[style]'))) {
        const styleAttr = node.getAttribute('style');
        if (styleAttr) {
          node.setAttribute('style', normalizeStyle(styleAttr));
        }
      }
    }

    if (this.equals(receivedDOM.innerHTML, expectedDOM.innerHTML)) {
      return { pass: true, message: () => '' };
    }
    return {
      pass: false,
      message: () =>
        `HTMLs don't match.\n${this.utils.diff(
          this.utils.stringify(receivedDOM),
          this.utils.stringify(expectedDOM),
        )}\n`,
    };
  },
});

export function expectDelta(received: TypeDelta, expected: TypeDelta) {
  for (const [i, op] of expected.ops.entries()) {
    expect(op).toMatchObject(received.ops[i]);
  }
}

export function simulatePasteHTML(quill: Quill, range: TypeRange, html: string) {
  const formats = quill.getFormat(range.index);
  const pastedDelta = quill.clipboard.convert(
    { html },
    formats,
  );
  const delta = new Delta()
    .retain(range.index)
    .delete(range.length)
    .concat(pastedDelta);
  quill.updateContents(delta);
  return vi.runAllTimersAsync();
}

export function createEditor(
  imagePreviewOptions: Partial<QuillImagePreviewOptions> = {},
  moduleOptions: any = {},
  quillOptions: any = {},
  register: any = {},
) {
  Quill.register({
    'modules/image-preview': QuillImagePreview,
    ...register,
  }, true);
  const container = document.body.appendChild(document.createElement('div'));
  container.innerHTML = normalizeHTML('<p><br></p>');
  const quill = new Quill(container, {
    theme: 'snow',
    modules: {
      'image-preview': imagePreviewOptions,
      'history': {
        delay: 0,
      },
      ...moduleOptions,
    },
    ...quillOptions,
  });
  return quill;
}
