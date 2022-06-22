import { useMachine, newMachine } from '$lib/machine';
import { Tree } from '$lib/parse';
import {
    Component,
    createContext,
    createEffect,
    JSX,
    useContext,
} from 'solid-js';

const composite = (root: Tree<{ value?: number }>) =>
    useMachine(newMachine(root));

export const TableMachineContext =
    createContext<
        typeof composite extends (...args: any[]) => infer T ? T : never
    >();

export function TableMachineProvider(props: {
    root: Tree<{ value?: number }>;
    children: JSX.Element;
}) {
    const [state, send] = composite(props.root);

    return (
        <TableMachineContext.Provider value={[state, send]}>
            {props.children}
        </TableMachineContext.Provider>
    );
}

export const useTableMachine = () => useContext(TableMachineContext);
