import { produce, immerable, nothing, castDraft, Draft } from 'immer';
import { Node } from '$lib/parse';

enum Dir {
    UP,
    DOWN,
    // LEFT,
    // RIGHT,
}

export interface Zipper {
    go(dir: Dir): Zipper;
}

export const goUp = (zipper: Zipper) => zipper.go(Dir.UP);
export const goDown = (zipper: Zipper) => zipper.go(Dir.DOWN);

export interface Explorable<E> {
    isDone(): boolean;
    intoExplored(): E;
}

// E for explored
export interface ExplorableTree<T, E extends T>
    extends Explorable<ExploredTree<T, E>> {
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
    passUp: AlphaBeta;
};

export class AlphaBetaTree<T>
    implements ExplorableTree<ABNode<T>, ExploredABNode<T>>
{
    type: 'max' | 'min';

    node: ABNode<T>;
    exploreds: ExploredAlphaBetaTree<T>[];
    remainings: AlphaBetaTree<T>[];

    [immerable] = true;

    static fromNode<T extends { value?: number }>(
        node: Node<T>,
        type: 'max' | 'min' = 'max'
    ): AlphaBetaTree<T> {
        let newNode: ABNode<T> = {
            ...node.data,
            passDown: { alpha: -Infinity, beta: +Infinity },
        };
        let remainings = [];
        for (const child of node.children) {
            remainings.push(
                AlphaBetaTree.fromNode(child, type === 'max' ? 'min' : 'max')
            );
        }
        remainings.reverse();
        return new AlphaBetaTree(newNode, [], remainings, type);
    }

    constructor(
        node: ABNode<T>,
        exploreds: ExploredAlphaBetaTree<T>[],
        remainings: AlphaBetaTree<T>[],
        type: 'max' | 'min'
    ) {
        this.node = node;
        this.exploreds = exploreds;
        this.remainings = remainings;
        this.type = type;
    }

    isDone(): boolean {
        return this.node.value !== null || this.remainings.length === 0;
    }

    intoExplored(): ExploredAlphaBetaTree<T> {
        if (!this.isDone()) throw new Error('not explored enough');

        let value: number;
        if (this.node.value) {
            value = this.node.value;
        } else {
            const { alpha, beta } = this.exploreds.at(-1)!.node.passUp;
            value = this.type === 'max' ? alpha : beta;
        }

        const { alpha, beta } = this.node.passDown;
        const passUp =
            this.type === 'max'
                ? // then parent is min
                  { alpha, beta: Math.min(value, beta) }
                : // else parent is max
                  { alpha: Math.max(value), beta };

        return new ExploredAlphaBetaTree(
            { ...this.node, passUp },
            this.exploreds,
            this.remainings,
            this.type
        );
    }
}

export class ExploredAlphaBetaTree<T> extends AlphaBetaTree<T> {
    node: ExploredABNode<T>;

    constructor(
        node: ExploredABNode<T>,
        exploreds: ExploredAlphaBetaTree<T>[],
        remainings: AlphaBetaTree<T>[],
        type: 'max' | 'min'
    ) {
        super(node, exploreds, remainings, type);
        this.node = node;
    }

    isDone(): boolean {
        return true;
    }

    intoExplored(): ExploredAlphaBetaTree<T> {
        return this;
    }
}

export class AlphaBetaZipper<T>
    implements Zipper, Explorable<AlphaBetaZipper<T>>
{
    current: AlphaBetaTree<T> | ExploredAlphaBetaTree<T>;
    breadcrumps: AlphaBetaTree<T>[];

    [immerable] = true;

    constructor(current: AlphaBetaTree<T>) {
        this.current = current;
        this.breadcrumps = [];
    }

    static fromNode<T extends { value?: number }>(
        node: Node<T>,
        type: 'max' | 'min' = 'max'
    ): AlphaBetaZipper<T> {
        return new AlphaBetaZipper(AlphaBetaTree.fromNode(node, type));
    }

    go(dir: Dir): AlphaBetaZipper<T> {
        return produce<AlphaBetaZipper<T>>(this, (draft) => {
            switch (dir) {
                case Dir.UP:
                    // no more parent to report up
                    const parent = draft.breadcrumps.pop();
                    if (!parent) return;

                    // if explored, push to explored stack
                    if ('passUp' in draft.current.node) {
                        parent.exploreds.push(
                            draft.current as Draft<ExploredAlphaBetaTree<T>>
                        );
                    }
                    // else, push to remaining stack for later
                    else {
                        parent.remainings.push(draft.current);
                    }
                    draft.current = parent;
                    break;

                case Dir.DOWN:
                    // if explored, can't go down
                    if (!(draft.current instanceof AlphaBetaTree)) return;

                    // if no child, can't go down
                    const child = draft.current.remainings.pop();
                    if (!child) return;

                    draft.breadcrumps.push(draft.current);
                    draft.current = child;
                    break;
            }
        });
    }

    isDone(): boolean {
        return this.current.isDone();
    }

    intoExplored(): AlphaBetaZipper<T> {
        return produce(this, (draft) => {
            draft.current = castDraft(draft.current.intoExplored());
        });
    }
}
