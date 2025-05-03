# QuillImagePreview

An quill module for image preview popup

## Usage

```sh
npm install quill-image-preview
```

```js
import Quill from 'quill';
import QuillImagePreview from 'quill-image-preview';
import 'quill/dist/quill.snow.css';
import 'quill-image-preview/index.css';

Quill.register({ 'modules/image-preview': QuillImagePreview }, true);

const quill = new Quill('#editor', {
  // ...
  modules: {
    //  ...
    'image-preview': true
  },
});
```

## Options

| attribute            | description                                                    | type                                                           | default        |
| -------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- | -------------- |
| enableOnEdit         | only enable when quill is not enabled                          | `boolean`                                                      | `true`         |
| beforePreviewDisplay | before popup display. return `true` will prevent popup trigger | `(this: QuillImagePreview, img: HTMLImageElement) => boolean;` | ` () => false` |
