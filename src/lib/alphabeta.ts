import { produce } from 'immer';
import { Node } from './parse';
import { DeepReadonly } from './utils';

interface ABNode extends Node<number> {
    // depth for determine min node or max node
    depth: number;
    initialAlpha: number | null;
    initialBeta: number | null;
    children: (this &
        (
            | {
                  // unvisited
                  type: 'pending';
                  initialAlpha: null;
                  initialBeta: null;
              }
            | {
                  // currently visiting, no value yet
                  type: 'questioning';
                  value: null;
                  initialAlpha: number;
                  initialBeta: number;
              }
            | {
                  // visited, has value
                  type: 'visited';
                  value: number;
                  initialAlpha: number;
                  initialBeta: number;
              }
            | {
                  // filled with alpha beta
                  type: 'filled';
                  value: number;
                  computedAlpha: number;
                  computedBeta: number;
                  initialAlpha: number;
                  initialBeta: number;
              }
            | {
                  // pruned
                  type: 'pruned';
                  initialAlpha: null;
                  initialBeta: null;
              }
        ))[];
}

export function wrapAB<T extends Node<number>>(root: T, depth = 0): T & ABNode {
    const newRoot: T & ABNode = {
        ...root,
        depth,
        initialAlpha: -Infinity,
        initialBeta: +Infinity,
        children: new Array(root.children.length),
    };
    for (const key in root.children) {
        newRoot.children[key] = {
            ...wrapAB(root.children[key], depth + 1),
            type: 'pending',
            initialAlpha: null,
            initialBeta: null,
        };
    }
    return newRoot;
}


