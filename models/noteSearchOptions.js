const DefaultPageSize = 5;
const DefaultPage = 1;

function fallbackWithDefault(val, defaultValue) {
    return val === undefined || val === null || val < 1 ? defaultValue : val;
}
class NoteSearchOptions {
    static FILTERS = ["created", "updated", "viewed"];
    static ORDERS = ["asc", "desc"];

    text;
    page;
    pageSize;
    filter;
    order;
    username;

    /**
     * Create a new NoteSearchOptions instance
     *
     * @param {string} text - The search text (optional)
     * @param {number} page - The page number for pagination (defaults to 1)
     * @param {number} pageSize - Number of items per page (defaults to 5)
     * @param {string} filter - What field to sort by: 'created', 'updated', 'viewed' (defaults to 'created')
     * @param {string} order - Sort direction: 'asc' or 'desc' (defaults to 'asc')
     * @param {string} username - Filter notes by username (optional)
     */
    constructor(text, page, pageSize, filter, order, username) {
        this.text = text;
        this.page = page;
        this.pageSize = pageSize;
        this.filter = filter;
        this.order = order;
        this.username = username;
    }

    /**
     * Create a NoteSearchOptions instance from JSON object
     *
     * @param {object} json - JSON object with search parameters
     * @returns {NoteSearchOptions} - New instance
     */
    static fromJson(json) {
        return new NoteSearchOptions(
            json.text,
            json.page,
            json.pageSize,
            json.filter,
            json.order,
            json.username
        );
    }

    /**
     * Normalize all parameters to ensure they have valid values
     */
    normalize() {
        this.page = fallbackWithDefault(this.page, DefaultPage);
        this.pageSize = fallbackWithDefault(this.pageSize, DefaultPageSize);

        if (!this.filter || !NoteSearchOptions.FILTERS.includes(this.filter))
            this.filter = NoteSearchOptions.FILTERS[0];

        if (!this.order || !NoteSearchOptions.ORDERS.includes(this.order))
            this.order = NoteSearchOptions.ORDERS[0];
    }

    /**
     * Convert to query parameters string for API requests
     *
     * @returns {string} - URL query parameters
     */
    toQueryString() {
        const params = new URLSearchParams();

        if (this.text) params.append("text", this.text);
        if (this.page) params.append("page", this.page);
        if (this.pageSize) params.append("pageSize", this.pageSize);
        if (this.filter) params.append("filter", this.filter);
        if (this.order) params.append("order", this.order);
        if (this.username) params.append("username", this.username);

        return params.toString();
    }
}

module.exports = NoteSearchOptions;
