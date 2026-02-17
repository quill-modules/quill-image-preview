import { describe, expect, it } from 'vitest';
import { createEditor } from './utils';

describe('Module', () => {
  it('module container should be inside the quill root', () => {
    const quill = createEditor();
    expect(quill.container).toEqualHTML(
      `
        <div class="ql-editor ql-blank" contenteditable="true">
          <p><br></p>
        </div>
        <div class="ql-tooltip ql-hidden">
          <a class="ql-preview" rel="noopener noreferrer" target="_blank" href="about:blank"></a>
          <input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">
          <a class="ql-action"></a>
          <a class="ql-remove"></a>
        </div>
      `,
    );
  });
});
