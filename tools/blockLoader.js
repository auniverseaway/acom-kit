/**
 * Block Loader
 * Lazily load JS & CSS for a block when the element is in the viewport.
 *
 * @param {Object} config the loader config.
 * @param {HTMLElement} suppliedEl the parent element to load blocks into.
 */
const blockLoader = (config, suppliedEl) => {
    const parentEl = suppliedEl || document;

    const addStyle = (location) => {
        const element = document.createElement('link');
        element.setAttribute('rel', 'stylesheet');
        element.setAttribute('href', location);
        document.querySelector('head').appendChild(element);
    };

    const addScript = (location) => {
        const element = document.createElement('script');
        element.setAttribute('crossorigin', true);
        element.setAttribute('src', location);
        document.querySelector('head').appendChild(element);
    };

    const addDep = (dep) => {
        if (dep.styles) {
            dep.styles.forEach((style) => {
                addStyle(`${dep.location}${style}`);
            });
        }
        if (dep.scripts) {
            dep.scripts.forEach((script) => {
                addScript(`${dep.location}${script}`);
            });
        }
        // eslint-disable-next-line no-param-reassign
        dep.loaded = true;
    };

    const initJs = async (element, block) => {
        // If the block scripts haven't been loaded, load them.
        if (block.scripts) {
            if (!block.module) {
                /* eslint-disable-next-line */
                block.module = await import(`${block.location}${block.scripts}`);
            }
            // If this block type has scripts and they're already loaded
            if (block.module) {
                block.module.default(element);
            }
        }
        return true;
    };

    /**
     * Unlazy each type of block
     * @param {HTMLElement} element
     */
    const loadElement = async (element) => {
        const { blockSelect } = element.dataset;
        const block = config.blocks[blockSelect];
        // Load any block dependencies
        if (block.deps) {
            block.deps.forEach(async (dep) => {
                const depConfig = config.deps[dep];
                if (!depConfig.loaded) {
                    addDep(depConfig);
                }
            });
        }

        // Inject CSS
        if (!block.loaded && block.styles) {
            addStyle(`${block.location}${block.styles}`);
        }
        // Run JS against element
        block.loaded = await initJs(element, block);
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
     * Lazily load blocks using an Intersection Observer.
     * @param {HTMLElement} element
     */
    const init = (element) => {
        const isDoc = element instanceof HTMLDocument;
        const parent = isDoc ? document.querySelector('body') : element;

        const options = { rootMargin: config.margin || '1000px 0px' };
        const observer = new IntersectionObserver(onIntersection, options);

        Object.keys(config.blocks).forEach((selector) => {
            const elements = parent.querySelectorAll(selector);
            elements.forEach((el) => {
                el.setAttribute('data-block-select', selector);
                if (!isDoc || config.eager) {
                    loadElement(el);
                } else {
                    observer.observe(el);
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
