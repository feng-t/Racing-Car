
export class Queue {
    private data = [];
    push = item => this.data.push(item);
    pop = () => this.data.shift();
}
