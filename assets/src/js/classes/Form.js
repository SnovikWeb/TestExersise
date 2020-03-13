export default class Form {
    constructor({form, submitEvent, preventDefault = true}) {
        if (form instanceof HTMLFormElement) {
            this.form = form;
            this.submitEvent = submitEvent;
            this.preventDefault = preventDefault;

            this.init();
        } else {
            throw new Error('Form class received invalid arguments');
        }
    }

    init() {
        this.form.onsubmit = e => {
            if (this.preventDefault) e.preventDefault();

            document.dispatchEvent(new CustomEvent(this.submitEvent, {
                detail: {
                    data: new FormData(this.form)
                }
            }));
        }
    }
}