import { Tree } from '$lib/parse';
import { newQueue } from './queue';

export type LabeledTree<T> = Tree<T & { label: string }>;

export function labelBFS<T extends object>(
    root: Tree<T>,
    labeler: (data: Tree<T>) => string = defaultLabeler()
): LabeledTree<T> {
    // the way we're about to do needs some caution,
    // as we want to copy old nodes (create new objects),
    // rather than add label to existing nodes.
    // TypeScript doesn't allow this anyway, currently (as far as i know)

    const newRoot: LabeledTree<T> = {
        ...root,
        node: {
            ...root.node,
            label: labeler(root),
        },
        children: new Array(root.children.length),
    };

    // prepare queue for bfs, new node children should be holes
    const queue = newQueue<[Tree<T>, LabeledTree<T>]>();
    queue.enqueue([root, newRoot]);

    // for BFS
    let e: [Tree<T>, LabeledTree<T>] | undefined;
    while ((e = queue.dequeue())) {
        let [oldNode, newNode] = e;

        for (const key in oldNode.children) {
            const oldChild = oldNode.children[key];

            // mutate new node, add child to array hole
            newNode.children[key] = {
                ...oldChild,
                node: {
                    ...oldChild.node,
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
