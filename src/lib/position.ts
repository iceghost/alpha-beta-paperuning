import { Node } from '$lib/parse';

interface PositionNode<T> extends Node<T> {
  dimensions: { left: number; width: number };
  rootPosition: { left: number; top: number };
}

type NewNode<T, U> = Omit<T, 'children'> & PositionNode<U>;

export function computePosition<
  T extends Node<U>,
  U = T extends Node<infer V> ? V : never
>(root: T, left = 0, top = 0): NewNode<T, U> {
  let baseLeft = left;

  const children = new Array<NewNode<T, U>>(root.children.length);
  for (const key in root.children) {
    const child = root.children[key];

    children[key] = computePosition<T, U>(child, left, top + 1);

    left += children[key].dimensions.width;
  }

  return {
    ...root,
    dimensions: { left: baseLeft, width: Math.max(1, left - baseLeft) },
    rootPosition: { left: baseLeft + Math.trunc((left - baseLeft) / 2), top },
    children,
  };
}
