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

  // traverse size left-to-right
  for (const size of sizes) {
    const node: Node<T> = queue.dequeue()!;
    node.children = new Array(size);

    // create childrens and push them into queue
    for (let i = 0; i < size; i++) {
      const child: Node<T> = {
        value: null,
        children: [],
      };
      node.children[i] = child;
      queue.enqueue(child);
    }
  }

  // those remaining in queue (no size, no children)
  // are the leaves
  for (const value of values) {
    let node = queue.dequeue()!;
    node.value = value;
  }

  return root;
}
