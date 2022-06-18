import { Node } from './parse';
import { newQueue, Queue } from './queue';

interface MinimaxNode extends Node<number> {
  alpha: number | null;
  beta: number | null;
  type: 'max' | 'min';
}

type NewNode<T> = Omit<T, 'children'> & MinimaxNode;

export function initMinimax<T extends Node<number>>(
  root: T,
  type: 'max' | 'min' = 'max',
  alpha: number | null = -Infinity,
  beta: number | null = Infinity
): NewNode<T> {
  const newRoot: NewNode<T> = {
    ...root,
    label: '',
    alpha,
    beta,
    type,
    children: new Array(root.children.length),
  };

  for (const key in root.children) {
    newRoot.children[key] = initMinimax(
      root.children[key],
      type == 'max' ? 'min' : 'max',
      null,
      null
    );
  }

  return newRoot;
}
