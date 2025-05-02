import type Quill from 'quill';

export class Module {
  constructor(public quill: Quill) {
    const container = this.quill.addContainer('module-container');
    container.classList.add('bg-green-400');
  }
}

export default Module;
