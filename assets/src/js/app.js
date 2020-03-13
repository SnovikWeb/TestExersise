import Form from './classes/Form';
import Request from './classes/Request';

class App {

    constructor({formFilters: form, request, postsContainer, excluded = []}) {
        if (form instanceof Form && request instanceof Request) {
            this.form = form;
            this.request = request;
            this.postsContainer = postsContainer;
            this.excluded = excluded;

            this.tags = [...form.form.querySelectorAll('#tags input, #tags select')].map(item => item.name);
            this.dates = [...form.form.querySelectorAll('#numaric-fields input')].map(item => item.name);

            this.init();
        } else {
            throw new Error('App class received invalid arguments');
        }
    }

    /*  Application initialization  */
    init() {
        this.initSearch();
    }

    /*  Display posts per page  */
    renderPosts(posts = []) {
        this.postsContainer.classList.add('hidden');
        this.postsContainer.innerHTML = '';

        if (window.Worker) {
            const worker = new Worker(`${pathPubJs}workers/templatePosts.js`);
            worker.postMessage(posts);
            worker.addEventListener('message', e => this.postsContainer.insertAdjacentHTML('afterBegin', e.data.postsHTML));
        } else {
            throw new Error('Browser doesn\'t support Workers');
        }

    }

    /*  Initialization the form with filters and searching */
    initSearch() {
        const request = (formData) => {
            const paramChecks = [],
                paramTexts = [],
                paramDates = [],
                searchByDate = this.form.form.querySelector('#byDate').checked;

            for (const field of formData) {
                const name = field[0],
                    value = field[1];

                if (this.excluded.includes(name)) continue;

                if (this.tags.includes(name)) {
                    paramChecks.push(name === 'author' ? `author_${value}` : name);
                } else if (this.dates.includes(name)) {
                    if (value) paramDates.push(`created_at_i${name === 'created_after' ? '>' : '<'}${new Date(value).getTime() / 1000}`);
                } else {
                    paramTexts.push(`${name}=${value}`);
                }
            }

            let requestUrl = [
                this.request.url,
                searchByDate ? 'search_by_date' : 'search',
                `?tags=(${paramChecks.join()})`,
                paramTexts.length ? `&${paramTexts.join()}` : '',
                searchByDate ? `&numericFilters=${paramDates.join()}` : ``
            ].join('');

            this._info(paramChecks, paramDates, paramTexts, requestUrl);

            this.request.get(requestUrl)
                .then(resp => this.renderPosts(resp.hits))
                .catch(err => console.error(err));
        };

        document.addEventListener(this.form.submitEvent, e => request(e.detail.data.entries()));
    }

    /*  Display debug information in console    */
    _info(...message) {
        console.group('Info');
        console.log(...message);
        console.groupEnd();
    }

}

window.onload = () => {

    const formFilters = new Form({
        form: document.querySelector('#form-filter'),
        submitEvent: 'formFilter'
    });

    const request = new Request({
        url: 'https://hn.algolia.com/api/v1/',
        caching: true,
        format: 'json'
    });

    const app = new App({
        formFilters,
        request,
        postsContainer: document.querySelector('.posts'),
        excluded: ['byDate']
    });

};