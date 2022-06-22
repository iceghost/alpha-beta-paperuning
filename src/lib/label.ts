import { Node } from '$lib/parse';
import { newQueue } from './queue';

type LabeledNode<T> = Node<T & { label: string }>;

export function labelBFS<T extends object>(
    root: Node<T>,
    labeler: (data: Node<T>) => string = defaultLabeler()
): LabeledNode<T> {
    // the way we're about to do needs some caution,
    // as we want to copy old nodes (create new objects),
    // rather than add label to existing nodes.
    // TypeScript doesn't allow this anyway, currently (as far as i know)

    const newRoot: LabeledNode<T> = {
        ...root,
        data: {
            ...root.data,
            label: labeler(root),
        },
        children: new Array(root.children.length),
    };

    // prepare queue for bfs, new node children should be holes
    const queue = newQueue<[Node<T>, LabeledNode<T>]>();
    queue.enqueue([root, newRoot]);

    // for BFS
    let e: [Node<T>, LabeledNode<T>] | undefined;
    while ((e = queue.dequeue())) {
        let [oldNode, newNode] = e;

        for (const key in oldNode.children) {
            const oldChild = oldNode.children[key];

            // mutate new node, add child to array hole
            newNode.children[key] = {
                ...oldChild,
                data: {
                    ...oldChild.data,
                    label: labeler(oldChild),
                },
                children: new Array(oldChild.children.length),
            };

            // BFS
            queue.enqueue([oldChild, newNode.children[key]]);
        }
    }

    return newRoot;
}

function defaultLabeler() {
    let counters: number[] = [-1];

    return () => {
        let i = counters.length - 1;
        while (true) {
            if (i == -1) {
                counters.push(0);
                break;
            }
            if (counters[i] == 25) {
                counters[i] = 0;
                i--;
                continue;
            }
            counters[i] += 1;
            break;
        }
        return counters
            .map((count) => String.fromCharCode(count + 65))
            .join('');
    };
}
