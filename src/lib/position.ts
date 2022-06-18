import { Node } from '$lib/parse';

export interface PositionNode<T> extends Node<T> {
  dimensions: { left: number; top: number; width: number; height: number };
  rootPosition: { left: number; top: number };
}

type NewNode<T, U> = Omit<T, 'children'> & PositionNode<U>;

export function computePosition<
  T extends Node<U>,
  U = T extends Node<infer V> ? V : never
>(root: T, left = 0, top = 0): NewNode<T, U> {
  let baseLeft = left;

  const children = new Array<NewNode<T, U>>(root.children.length);
  let height = 1;
  for (const key in root.children) {
    const child = root.children[key];

    children[key] = computePosition<T, U>(child, left, top + 1);

    left += children[key].dimensions.width;

    height = Math.max(height, children[key].dimensions.height + 1);
  }

  return {
    ...root,
    dimensions: {
      left: baseLeft,
      top,
      width: Math.max(1, left - baseLeft),
      height,
    },
    rootPosition: { left: baseLeft + Math.trunc((left - baseLeft) / 2), top },
    children,
  };
}
