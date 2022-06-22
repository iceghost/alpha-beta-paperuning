import { labelBFS } from '$lib/label';
import { newMachine, useMachine } from '$lib/machine';
import { parse } from '$lib/parse';
import { computePosition } from '$lib/position';
import {
    batch,
    Component,
    createEffect,
    createSignal,
    onCleanup,
} from 'solid-js';
// import MinimaxTree from './components/flex/MinimaxTree';
import MinimaxTree from './components/Tree';
import { TableMachineProvider } from './components/TableMachine';
import { useZipper } from '$lib/zipper';
import { createStore, reconcile, unwrap } from 'solid-js/store';

const sizes = '3 2 2 2 2 1 2 1 1 2 2 3 1 1 2 1 1 2 1'.split(' ').map(Number);
const values = '5 6 7 4 5 3 6 6 9 7 5 9 8 6'
    .split(' ')
    .map((x) => ({ value: Number(x) }));
console.log(labelBFS(parse(sizes, values)));
const root = computePosition(labelBFS(parse(sizes, values)));

const App: Component = () => {
    const [{ zipper, done }, { goDown, goUp, intoExplored }] = useZipper(root);

    const [count, setCount] = createSignal(0);

    let [container, setContainer] = createSignal<HTMLDivElement>();

    createEffect(() => {
        console.log(zipper);
    });

    createEffect(() => {
        window.addEventListener('keydown', (e) => {
            console.log(e);
            switch (e.key) {
                case 'ArrowDown':
                    goDown();
                    break;
                case 'ArrowUp':
                    goUp();
                    break;
                case 'Enter':
                    if (done()) {
                        batch(() => {
                            intoExplored();
                            goUp();
                            goDown();
                        });
                    }
                    break;
            }
            // console.log(unwrap(zipper));
        });

        onCleanup(() => window.removeEventListener('keydown', () => {}));
    });

    return (
        <div class="font-body">
            {/* <TableMachineProvider root={root}> */}
            <div class="h-screen w-full">
                <MinimaxTree root={root} />
                {zipper.current.node.label}, {done() ? 'done' : 'not done'}
            </div>
            {/* </TableMachineProvider> */}
        </div>
    );
};

export default App;
