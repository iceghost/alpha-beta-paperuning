import { produce, castDraft, Immutable, immerable } from 'immer';

interface ExploringTree<N, E> {
    readonly node: N;
    readonly exploreds: ExploredTree<N, E>[];
    readonly pruneds?: never;
    readonly pendings: ExploringTree<N, E>[];

    [immerable]: true;
    isDone(): boolean;
    intoExplored(): ExploredTree<N, E>;
}

interface ExploredTree<N, E> {
    readonly node: E;
    readonly exploreds: ExploredTree<N, E>[];
    readonly pendings?: never;
    readonly pruneds: ExploringTree<N, E>[];
}

type Zipper<N, E> = {
    current: ExploringTree<N, E> | ExploredTree<N, E>;
    breadcrumps: ExploringTree<N, E>[];
};

export const explore = <N, E>(zipper: Zipper<N, E>): Zipper<N, E> => {
    return produce(zipper, (draft) => {
        // already explored
        if (draft.current.pendings === undefined) {
            return;
        }

        // no more pendings
        const nextChild = draft.current.pendings.pop();
        if (!nextChild) {
            draft.current = castDraft(draft.current.intoExplored());
            return;
        }

        // go down
        draft.breadcrumps.push(draft.current);
        if (nextChild.isDone()) {
            // if child is already leaf
            draft.current = castDraft(nextChild.intoExplored());
            return;
        } else {
            draft.current = nextChild;
            return;
        }
    });
};

export const done = <N, E>(zipper: Zipper<N, E>): Zipper<N, E> => {
    return produce(zipper, (draft) => {
        // not done yet
        if (draft.current.pendings) return;

        // no more parent to report up
        const parent = draft.breadcrumps.pop();
        if (!parent) return;

        parent.exploreds.push(draft.current);
        draft.current = parent;
    });
};

interface ExploringNode {
    value: number | null;
    initialAlpha: number;
    initialBeta: number;
}

interface ExploredNode extends ExploringNode {
    value: number;
    computedAlpha: number;
    computedBeta: number;
}

// class ExploringABTree implements ExploringTree<ExploringNode, ExploredNode> {
//     node: ExploringNode;
//     exploreds: ExploredABTree[];
//     pruneds?: undefined;
//     pendings: ExploringABTree[];

//     constructor() {
//         this.node = {
//             value: null,
//             initialAlpha: -Infinity,
//             initialBeta: +Infinity,
//         };
//         this.exploreds = [];
//         this.pendings = [];
//     }

//     [immerable] = true as const;

//     isDone(): boolean {
//         // no more children
//         if (this.pendings.length == 0) return true;

//         // pruning
//         const latest = this.exploreds.at(-1);
//         if (latest) {
//             const { computedAlpha, computedBeta } = latest.node;
//             if (computedAlpha >= computedBeta) return true;
//         }

//         return false;
//     }

//     intoExplored() {
//         return produce(this, (draft) => {
//             if (this.node.value) {
//             }
//         });
//     }
// }

// class ExploredABTree implements ExploredTree<ExploringNode, ExploredNode> {
//     node: ExploredNode;
//     exploreds: ExploredABTree[];
//     pruneds: ExploringABTree[];

//     constructor(tree: ExploringABTree) {

//     }
// }
