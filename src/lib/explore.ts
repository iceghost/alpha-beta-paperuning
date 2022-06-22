import { Tree } from '$lib/parse';

// E for explored
export interface ExplorableTree<T, E extends T> {
    node: T;
    exploreds: ExploredTree<T, E>[];
    remainings: ExplorableTree<T, E>[];
}

export interface ExploredTree<T, E extends T> extends ExplorableTree<T, E> {
    node: E;
}

export type AlphaBeta = {
    alpha: number;
    beta: number;
};

export type ABNode<T> = T & {
    value?: number;
    passDown: AlphaBeta;
};

export type ExploredABNode<T> = ABNode<T> & {
    value: number;
    passUp: AlphaBeta;
};

export interface AlphaBetaTree<T> {
    type: 'max' | 'min';

    node: ABNode<T>;
    exploreds: ExploredAlphaBetaTree<T>[];
    remainings: AlphaBetaTree<T>[];
}

export interface ExploredAlphaBetaTree<T> extends AlphaBetaTree<T> {
    node: ExploredABNode<T>;
}

export function fromTree<T extends { value?: number }>(
    node: Tree<T>,
    type: 'max' | 'min' = 'max'
): AlphaBetaTree<T> {
    let newNode: ABNode<T> = {
        ...node.node,
        passDown: { alpha: -Infinity, beta: +Infinity },
    };
    let remainings = [];
    for (const child of node.children) {
        remainings.push(fromTree(child, type === 'max' ? 'min' : 'max'));
    }
    remainings.reverse();
    return { node: newNode, exploreds: [], remainings, type };
}

export const isDone = <T>(tree: AlphaBetaTree<T>): boolean => {
    // has value, is probably leaf
    if (tree.node.value) return true;

    // no more child to go down
    if (tree.remainings.length === 0) return true;

    // alpha beta pruning
    const latest = tree.exploreds.at(-1);
    if (latest) {
        const { alpha, beta } = latest.node.passUp;
        if (alpha >= beta) return true;
    }

    return false;
};

export const isExplored = <T>(
    tree: AlphaBetaTree<T>
): tree is ExploredAlphaBetaTree<T> => {
    return 'passUp' in tree.node;
};

export const intoExplored = <T>(
    tree: AlphaBetaTree<T>
): ExploredAlphaBetaTree<T> => {
    if (!isDone(tree)) throw new Error('not explored enough');

    let value: number;
    if (tree.node.value) {
        value = tree.node.value;
    } else {
        const { alpha, beta } = tree.exploreds.at(-1)!.node.passUp;
        value = tree.type === 'max' ? alpha : beta;
    }

    const { alpha, beta } = tree.node.passDown;
    const passUp =
        tree.type === 'max'
            ? // then parent is min
              { alpha, beta: Math.min(value, beta) }
            : // else parent is max
              { alpha: Math.max(value), beta };

    return {
        ...tree,
        node: { ...tree.node, value, passUp },
    };
};
