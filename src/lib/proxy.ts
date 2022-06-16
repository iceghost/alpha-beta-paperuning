import { minimax, Node } from '$lib/minimax';

function wrap<T>(root: Node<T>, depth: number) {
  return new Proxy(root, {
    get(target, prop) {
      const value = Reflect.get(target, prop);
      if (prop == 'value') {
        console.log('value read to', value, 'at depth', depth);
      }
      return value;
    },
    set(target, prop, value) {
      if (prop == 'value') {
        console.log('value set  to', value, 'at depth', depth);
      }
      return Reflect.set(target, prop, value);
    },
  });
}

export function wrapAll<T>(root: Node<T>, depth = 0) {
  for (const key in root.children) {
    root.children[key] = wrapAll(root.children[key], depth + 1);
  }
  return wrap(root, depth);
}

export {};
