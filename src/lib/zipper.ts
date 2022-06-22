import { createStore, produce } from 'solid-js/store';
import {
    AlphaBetaTree,
    ExploredAlphaBetaTree,
    fromTree,
    intoExplored,
    isDone,
    isExplored,
} from './explore';
import { Tree } from './parse';

enum Dir {
    UP,
    DOWN,
    // LEFT,
    // RIGHT,
}

export interface AlphaBetaZipper<T> {
    current: AlphaBetaTree<T> | ExploredAlphaBetaTree<T>;
    breadcrumps: AlphaBetaTree<T>[];
}

const go = <T>(zipper: AlphaBetaZipper<T>, dir: Dir) => {
    switch (dir) {
        case Dir.UP:
            // no more parent to report up
            const parent = zipper.breadcrumps.pop();
            if (!parent) return;

            // if explored, push to explored stack
            if (isExplored(zipper.current)) {
                parent.exploreds.push(zipper.current);
            }
            // else, push to remaining stack for later
            else {
                parent.remainings.push(zipper.current);
            }
            zipper.current = parent;
            break;

        case Dir.DOWN:
            // if explored, can't go down
            if (isExplored(zipper.current) || isDone(zipper.current)) return;

            // if no child, can't go down
            const child = zipper.current.remainings.pop();
            if (!child) return;

            zipper.breadcrumps.push(zipper.current);
            zipper.current = child;
            break;
    }
};

export const useZipper = <T extends { value?: number }>(
    root: Tree<T>,
    type: 'max' | 'min' = 'max'
) => {
    const [zipper, setZipper] = createStore<AlphaBetaZipper<T>>({
        current: fromTree(root, type),
        breadcrumps: [],
    });

    return [
        {
            zipper,
            done: () => isDone(zipper.current),
        },
        {
            goDown: () => setZipper(produce((zipper) => go(zipper, Dir.DOWN))),
            goUp: () => setZipper(produce((zipper) => go(zipper, Dir.UP))),
            intoExplored: () =>
                setZipper(
                    produce(
                        (zipper) =>
                            (zipper.current = intoExplored(zipper.current))
                    )
                ),
        },
    ] as const;
};
