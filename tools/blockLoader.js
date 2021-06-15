const blockLoader = (config, suppliedEl) => {
    const parentEl = suppliedEl || document;

    const addStyle = (location) => {
        const element = document.createElement('link');
        element.setAttribute('rel', 'stylesheet');
        element.setAttribute('href', location);
        document.querySelector('head').appendChild(element);
    };

    const initJs = async (element, block) => {
        // If the block scripts haven't been loaded, load them.
        if (!block.module) {
            // eslint-disable-next-line no-param-reassign
            block.module = await import(`${block.location}${block.scripts}`);
        }
        // If this block type has scripts and they're already imported
        if (block.module) {
            block.module.default(element);
        }
    };

    /**
     * Unlazy each type of block
     * @param {HTMLElement} element
     */
    const loadElement = async (element) => {
        const { blockSelect } = element.dataset;
        const block = config.blocks[blockSelect];

        if (!block.loaded && block.styles) {
            addStyle(`${block.location}${block.styles}`);
        }

        if (block.scripts) {
            await initJs(element, block);
        }

        block.loaded = true;
    };

    /**
     * Iterate through all entries to determine if they are intersecting.
     * @param {IntersectionObserverEntry} entries
     * @param {IntersectionObserver} observer
     */
    const onIntersection = (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                observer.unobserve(entry.target);
                loadElement(entry.target);
            }
        });
    };

    /**
     * Clean up variant classes
     * Ex: marquee--small--contained- -> marquee small contained
     * @param {HTMLElement} parent
     */
    const cleanVariations = (parent) => {
        const variantBlocks = parent.querySelectorAll('[class$="-"]');
        return variantBlocks.map((variant) => {
            let { className } = variant;
            className = className.slice(0, -1);
            // eslint-disable-next-line no-param-reassign
            variant.className = '';
            const classNames = className.split('--');
            variant.classList.add(...classNames);
            return variant;
        });
    };

    /**
     * Load blocks
     * @param {HTMLElement} element
     */
    const init = (element) => {
        const isDoc = element instanceof HTMLDocument;
        const parent = isDoc ? document.querySelector('body') : element;
        const lazyLoad = isDoc && config.lazy;

        cleanVariations(parent);

        let observer;
        if (lazyLoad) {
            const options = { rootMargin: config.margin || '1000px 0px' };
            observer = new IntersectionObserver(onIntersection, options);
        }

        Object.keys(config.blocks).forEach((selector) => {
            const elements = parent.querySelectorAll(selector);
            elements.forEach((el) => {
                el.setAttribute('data-block-select', selector);
                if (lazyLoad) {
                    observer.observe(el);
                } else {
                    loadElement(el);
                }
            });
        });
    };

    const fetchFragment = async (path) => {
        const resp = await fetch(`${path}.plain.html`);
        if (resp.ok) {
            return resp.text();
        }
        return null;
    };

    const loadFragment = async (fragmentEl) => {
        const path = fragmentEl.querySelector('div > div').textContent;
        const html = await fetchFragment(path);
        if (html) {
            fragmentEl.insertAdjacentHTML('beforeend', html);
            fragmentEl.querySelector('div').remove();
            fragmentEl.classList.add('is-Visible');
            init(fragmentEl);
        }
    };

    /**
     * Add fragment to the list of blocks
     */
    // eslint-disable-next-line no-param-reassign
    config.blocks['.fragment'] = {
        loaded: true,
        scripts: {},
        module: {
            default: loadFragment,
        },
    };

    init(parentEl);
};

export default blockLoader;
