# Phantom
Phantom is a research project for HTML, JS, and CSS.

## About
This project aims to solve several problems when dealing with HTML, JS, and CSS. It is hyper focused on speed and simplicity.

**Specifically:**
1. Pages only request JS & CSS for the content they actually have. No more un-used JS & CSS.
2. All JS & CSS is lazy loaded based on proximity to the viewport.
3. Dependencies are handled without chaining requests.
4. No bundling, no build systems, and no ramp up. Evergreen browsers only.

## Contents

### Block Loader
The heart of the phantom project. Used to find "blocks" in an HTML file based on CSS selector. 

When a match is within the defined area of the viewport, the loader will:

1. Inject any dependencies of the block.
2. Inject the CSS if the block has not been loaded yet.
3. Load the ES Module if it has not been loaded yet.
4. Run the default function of the module against the matched element on page.

#### Usage
```bash
$ npm install @adobecom/blocks
```

```js
import blockLoader from './node_modules/@adobecom/blocks/tools/blockLoader.js';
blockLoader(config);
```

#### Sample Configuration
A block is defined by its selector, the location of CSS & JS. Both styles and scripts are optional.

##### Simple
```js
const config = {
    blocks: {
        'header': {
            location: '/blocks/header/',
            styles: 'styles.css',
            scripts: 'scripts.js',
        },
        '.home-hero': {
            location: '/blocks/home-hero/',
            styles: 'styles.css',
        },
        'footer': {
            location: '/blocks/footer/',
            styles: 'styles.css',
        },
        'a[href^="https://www.youtube.com"]': {
            location: '/blocks/embed/',
            styles: 'youtube.css',
            scripts: 'youtube.js',
        }
    }
};
```

##### Advanced
The following adds the ability to eager load, spec a margin around the viewport, and have dependencies.

```js
const config = {
    eager: true,
    margin: '800px 0px',
    blocks: {
        'header': {
            location: '/blocks/header/',
            styles: 'styles.css',
            scripts: 'scripts.js',
        },
        '.accordion': {
            deps: ['react'],
            location: '/blocks/accordion/',
            styles: 'styles.css',
            scripts: 'scripts.js',
        },
        'footer': {
            location: '/blocks/footer/',
            styles: 'styles.css',
        },
        'a[href^="https://www.youtube.com"]': {
            location: '/blocks/embed/',
            styles: 'youtube.css',
            scripts: 'youtube.js',
        },
        '.fragment': {
            location: '/blocks/fragment/',
            scripts: 'scripts.js',
        }
    },
    deps: {
        'react': {
            location: 'https://unpkg.com/',
            scripts: ['react@17/umd/react.development.js', 'react-dom@17/umd/react-dom.development.js'],
        }
    }
};
```
