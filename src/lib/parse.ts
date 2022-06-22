import { newQueue, Queue } from './queue';

export interface Tree<T extends object> {
    node: T;
    children: Tree<T>[];
}

// parse ((((5 6) (7 4 5)) ((3))) (((6) (6 9)) ((7))) (((5)) ((9 8) (6))))
// 3 2 2 2 2 1 2 1 1 2 2 3 1 1 2 1 1 2 1
// 5 6 7 4 5 3 6 6 9 7 5 9 8 6

export type PartialTree<T> = Tree<Partial<T>>;

export function parse<T extends object>(
    sizes: number[],
    values: T[]
): PartialTree<T> {
    const queue: Queue<PartialTree<T>> = newQueue();
    const root: PartialTree<T> = { node: {}, children: [] };
    queue.enqueue(root);

    // traverse size left-to-right
    for (const size of sizes) {
        const node: PartialTree<T> = queue.dequeue()!;
        node.children = new Array(size);

        // create childrens and push them into queue
        for (let i = 0; i < size; i++) {
            const child: PartialTree<T> = {
                node: {},
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
        node.node = value;
    }

    return root;
}
