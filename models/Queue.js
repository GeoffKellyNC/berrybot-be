
class Queue {
    constructor() {
        this.items = [];
    }

    set_into_queue(item) {
        this.items.push(item);
    }

    dequeue() {
        return this.items.length ? this.items.shift() : null;
    }

    size() {
        return this.items.length;
    }
}

module.exports = Queue;