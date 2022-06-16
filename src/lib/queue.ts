export interface Queue<T> {
  dequeue(): T | undefined;
  enqueue(e: T): void;
  size(): number;
}

export function newQueue<T>(): Queue<T> {
  return new TwoStackQueue<T>();
}

class TwoStackQueue<T> implements Queue<T> {
  inbox: T[];
  outbox: T[];
  constructor() {
    this.inbox = [];
    this.outbox = [];
  }
  enqueue(e: T): void {
    this.inbox.push(e);
  }
  dequeue() {
    if (!this.outbox.length) {
      let item: T | undefined;
      while ((item = this.inbox.pop())) {
        this.outbox.push(item);
      }
    }
    return this.outbox.pop();
  }
  size() {
    return this.inbox.length + this.outbox.length;
  }
}
