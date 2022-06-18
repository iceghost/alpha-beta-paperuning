import { newQueue, Queue } from './queue';

export interface Node<T> {
  value: T | null;
  children: this[];
}

// parse ((((5 6) (7 4 5)) ((3))) (((6) (6 9)) ((7))) (((5)) ((9 8) (6))))
// 3 2 2 2 2 1 2 1 1 2 2 3 1 1 2 1 1 2 1
// 5 6 7 4 5 3 6 6 9 7 5 9 8 6

export function parse<T>(sizes: number[], values: T[]): Node<T> {
  const queue: Queue<Node<T>> = newQueue();
  const root: Node<T> = { value: null, children: [] };
  queue.enqueue(root);
  for (const size of sizes) {
    const node: Node<T> = queue.dequeue()!;
    for (let i = 0; i < size; i++) {
      const child: Node<T> = {
        value: null,
        children: [],
      };
      node.children.push(child);
      queue.enqueue(child);
    }
  }
  for (const value of values) {
    let node = queue.dequeue()!;
    node.value = value;
  }
  return root;
}
