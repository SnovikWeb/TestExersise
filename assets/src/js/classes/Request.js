export default class Request {
    cacheStorage = new Map;

    constructor({url, format = 'json', caching = false}) {
        this.url = url;
        this.caching = caching;
        this.format = format;
    }

    async get(query) {
        if (this.caching && this.cacheStorage.has(query)) return this.cacheStorage.get(query);

        const response = await fetch(query).then(resp => this.format === 'json' ? resp.json() : resp.text());

        if (this.caching) this.cacheStorage.set(query, response);

        return response;
    }

}