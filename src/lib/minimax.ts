import { Node } from './parse';
import { newQueue, Queue } from './queue';

export interface MinimaxNode {
  label: string;
  value: number | null;
  alpha: number | null;
  beta: number | null;
  type: 'max' | 'min';
  children: MinimaxNode[];
}

export function initMinimax(
  root: Node<number>,
  type: 'max' | 'min' = 'max',
  labelFn: (node: MinimaxNode) => string = defaultLabeler(),
  alpha: number | null = -Infinity,
  beta: number | null = Infinity
): MinimaxNode {
  const newRoot: MinimaxNode = {
    label: '',
    value: root.value ?? null,
    alpha,
    beta,
    type,
    children: new Array(root.children.length),
  };
  for (const key in root.children) {
    newRoot.children[key] = initMinimax(
      root.children[key],
      type == 'max' ? 'min' : 'max',
      () => '',
      null,
      null
    );
  }

  const queue: Queue<MinimaxNode> = newQueue();
  queue.enqueue(newRoot);
  let node: MinimaxNode | undefined;
  while ((node = queue.dequeue())) {
    node.label = labelFn(node);
    for (const child of node.children) {
      queue.enqueue(child);
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
    return counters.map((count) => String.fromCharCode(count + 65)).join('');
  };
}
