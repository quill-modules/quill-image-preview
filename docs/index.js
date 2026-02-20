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
      enableOnEdit: true,
    },
  },
});

const quills = [quill1];
window.quills = quills;

for (const [i, quill] of quills.entries()) {
  const btn = document.getElementById(`btn${i + 1}`);
  btn.addEventListener('click', () => {
    const contents = quill.getContents();
    console.log(contents);
    const output = document.getElementById(`output${i + 1}`);
    output.innerHTML = '';
    for (const content of contents.ops) {
      const item = document.createElement('li');
      item.textContent = `${JSON.stringify(content)},`;
      output.appendChild(item);
    }
  });
  const writableBtn = document.getElementById(`writable${i + 1}`);
  writableBtn.addEventListener('click', () => {
    quill.enable(!quill.isEnabled());
  });
}
