import { labelBFS } from '$lib/label';
import { newMachine, useMachine } from '$lib/machine';
import { parse } from '$lib/parse';
import { computePosition } from '$lib/position';
import { Component, createEffect, createSignal } from 'solid-js';
// import MinimaxTree from './components/flex/MinimaxTree';
import MinimaxTree from './components/Tree';
import { TableMachineProvider } from './components/TableMachine';
import { AlphaBetaTree, AlphaBetaZipper } from '$lib/zipper';

const sizes = '3 2 2 2 2 1 2 1 1 2 2 3 1 1 2 1 1 2 1'.split(' ').map(Number);
const values = '5 6 7 4 5 3 6 6 9 7 5 9 8 6'
    .split(' ')
    .map((x) => ({ value: Number(x) }));
console.log(labelBFS(parse(sizes, values)));
const root = computePosition(labelBFS(parse(sizes, values)));

console.log(new AlphaBetaZipper(AlphaBetaTree.fromNode(root)));

const App: Component = () => {
    const [count, setCount] = createSignal(0);

    let [container, setContainer] = createSignal<HTMLDivElement>();
    return (
        <div class="font-body">
            {/* <TableMachineProvider root={root}>
                <div class="h-screen w-full">
                    <MinimaxTree root={root} />
                </div>
            </TableMachineProvider> */}
        </div>
    );
};

export default App;
