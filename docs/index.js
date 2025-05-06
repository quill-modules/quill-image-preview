/* eslint-disable no-undef */
const Quill = window.Quill;
const { QuillImagePreview } = window.QuillImagePreview;

Quill.register({
  'modules/image-preview': QuillImagePreview,
}, true);

const toolbarConfig = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block', 'code'],
  ['link', 'image', 'video', 'formula'],
  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ direction: 'rtl' }],
  [{ size: ['small', false, 'large', 'huge'] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ['clean'],
];

const quill1 = new Quill('#editor1', {
  theme: 'snow',
  modules: {
    'toolbar': toolbarConfig,
    'image-preview': {

    },
  },
});
const quill2 = new Quill('#editor2', {
  theme: 'snow',
  readOnly: true,
  modules: {
    'toolbar': toolbarConfig,
    'image-preview': {
      enableOnEdit: false,
    },
  },
});

const quill = [quill1, quill2];
window.quill = quill;

const output = [output1, output2];

for (const [i, btn] of [btn1, btn2].entries()) {
  btn.addEventListener('click', () => {
    const contents = quill[i].getContents();
    console.log(contents);
    output[i].innerHTML = '';
    for (const content of contents.ops) {
      const item = document.createElement('li');
      item.textContent = `${JSON.stringify(content)},`;
      output[i].appendChild(item);
    }
  });
}

for (const [i, btn] of [writable1, writable2].entries()) {
  btn.addEventListener('click', () => {
    quill[i].enable(!quill[i].isEnabled());
  });
}
