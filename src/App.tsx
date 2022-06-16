import { initMinimax } from '$lib/minimax';
import { parse } from '$lib/parse';
import { wrapAll } from '$lib/proxy';
import { Component, createSignal } from 'solid-js';

const App: Component = () => {
  const [count, setCount] = createSignal(0);

  const sizes = '3 2 2 2 2 1 2 1 1 2 2 3 1 1 2 1 1 2 1'.split(' ').map(Number);
  const values = '5 6 7 4 5 3 6 6 9 7 5 9 8 6'.split(' ').map(Number);
  const root = initMinimax(parse(sizes, values));
  console.log(root);
  return (
    <button
      onClick={() => {
        setCount(count() + 1);
      }}
    >
      {count()}
    </button>
  );
};

export default App;
