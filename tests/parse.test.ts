import { describe, it, assert } from 'vitest';
import { parse } from '../src/lib/parse';

describe('ok', () => {
  it('should works', () => {
    const sizes = '3 2 2 2 2 1 2 1 1 2 2 3 1 1 2 1 1 2 1'
      .split(' ')
      .map(Number);
    console.log(parse(sizes, []));
  });
});

export {};
