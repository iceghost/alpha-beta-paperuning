import { bfsLabel } from '$lib/label';
import { initMinimax } from '$lib/minimax';
import { parse } from '$lib/parse';
import { computePosition } from '$lib/position';
import { Component, createSignal } from 'solid-js';
import MinimaxTree from './components/flex/MinimaxTree';

const App: Component = () => {
  const [count, setCount] = createSignal(0);

  const sizes = '3 2 2 2 2 1 2 1 1 2 2 3 1 1 2 1 1 2 1'.split(' ').map(Number);
  const values = '5 6 7 4 5 3 6 6 9 7 5 9 8 6'.split(' ').map(Number);
  const root = computePosition(bfsLabel(initMinimax(parse(sizes, values))));
  console.log(root);
  let [container, setContainer] = createSignal<HTMLDivElement>();
  return (
    <div class="font-body">
      <div class="flex justify-start overflow-x-scroll">
        <div class="relative flex transform" ref={setContainer}>
          <MinimaxTree root={root} container={container()} />
        </div>
      </div>
    </div>
  );
};

export default App;
