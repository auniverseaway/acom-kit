import blockLoader from './tools/blockLoader';

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
