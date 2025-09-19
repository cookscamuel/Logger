export default class treeQueue {

    constructor() {
        this.front = -1;
        this.rear = -1;
        this.items = [];
        this.score = 0;
    }

    addLog(val) {
        if (this.front == -1) {
            this.front = 0;
        }
        this.rear++;
        this.items[this.rear] = val;
    }

    removeLog() {
        if (this.front != -1 || this.front > this.rear) {
            for (var i = 0; i < this.rear; i++) {
                this.items[i] = this.items[i + 1];
            }
            this.rear--;

            if (this.rear == -1) {
                this.front = -1;
            }
        }
    }


    // Return the front.
    getFront() {
        return this.items[this.front];
    }

    // Return the rear.
    getRear() {
        return this.items[this.rear];
    }

    // Return the number of logs chopped.
    getScore() {
        return this.score;
    }


};