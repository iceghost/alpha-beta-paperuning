import { newQueue, Queue } from './queue';

export interface Node<T extends object> {
    data: T;
    children: this[];
}

// parse ((((5 6) (7 4 5)) ((3))) (((6) (6 9)) ((7))) (((5)) ((9 8) (6))))
// 3 2 2 2 2 1 2 1 1 2 2 3 1 1 2 1 1 2 1
// 5 6 7 4 5 3 6 6 9 7 5 9 8 6

type PartialNode<T> = Node<Partial<T>>;

export function parse<T extends object>(
    sizes: number[],
    values: T[]
): PartialNode<T> {
    const queue: Queue<PartialNode<T>> = newQueue();
    const root: PartialNode<T> = { data: {}, children: [] };
    queue.enqueue(root);

    // traverse size left-to-right
    for (const size of sizes) {
        const node: PartialNode<T> = queue.dequeue()!;
        node.children = new Array(size);

        // create childrens and push them into queue
        for (let i = 0; i < size; i++) {
            const child: PartialNode<T> = {
                data: {},
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
        node.data = value;
    }

    return root;
}
