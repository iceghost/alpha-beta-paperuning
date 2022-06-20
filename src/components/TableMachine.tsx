import { useMachine, newMachine } from '$lib/machine';
import { Node } from '$lib/parse';
import {
  Component,
  createContext,
  createEffect,
  JSX,
  useContext,
} from 'solid-js';

const composite = (root: Node<number>) => useMachine(newMachine(root));

export const TableMachineContext =
  createContext<
    typeof composite extends (...args: any[]) => infer T ? T : never
  >();

export function TableMachineProvider(props: {
  root: Node<number>;
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
