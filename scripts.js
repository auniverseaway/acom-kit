import blockLoader from './tools/blockLoader.js';

const config = {
    blocks: {
        '.marquee': {
            location: '/blocks/marquee/',
            styles: 'styles.css',
            scripts: 'scripts.js',
        },
    },
};

blockLoader(config);
