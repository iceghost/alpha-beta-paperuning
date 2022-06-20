import {
  createMachine,
  assign,
  interpret,
  StateMachine,
  EventObject,
  Typestate,
  BaseActionObject,
  ServiceMap,
  State,
  InterpreterOptions,
} from 'xstate';
import { Node } from './parse';
import { onCleanup, batch, createContext, Component, JSX } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

export interface Table {
  type: 'min' | 'max';
  headerRow: { node: Node<number>; alpha: number; beta: number };
  valueRows: {
    node: Node<number>;
    value: number;
    alpha: number;
    beta: number;
  }[];
  questionRow?: { node: Node<number>; value?: number };
}

function getAlphaBeta<N>(table: Table): {
  alpha: number;
  beta: number;
} {
  const lastValueRow = table.valueRows.at(-1);
  if (lastValueRow) {
    return { ...lastValueRow };
  }
  return { ...table.headerRow };
}

export function newMachine(root: Node<number>) {
  return createMachine(
    {
      schema: {
        context: {} as { others: Table[]; current: Table },
        events: {} as
          | { type: 'GO DOWN' }
          | { type: 'SELECT CHILD'; child: Node<number> }
          | { type: 'GO UP' }
          | { type: 'FILL ALPHA BETA' },
      },
      context: {
        others: [],
        current: {
          type: 'max' as const,
          headerRow: {
            node: root,
            alpha: -Infinity,
            beta: +Infinity,
          },
          valueRows: [],
        },
      },
      id: 'alpha beta pruning',
      initial: 'current table with value child',
      states: {
        'current table with value child': {
          description: 'alpha, beta is updated',
          always: {
            cond: 'no more children or pruned',
            target: 'completed current table',
          },
          on: {
            'SELECT CHILD': {
              actions: 'addQuestionChild',
              cond: 'is unvisited child',
              target: 'current table with question child',
            },
          },
        },
        'completed current table': {
          exit: 'destroyTable',
          entry: 'updateQuestionValue',
          on: {
            'GO UP': [
              {
                cond: 'more tables',
                target: 'current table with value child, no alpha beta',
              },
              {
                description: 'finished',
                target: 'finish',
              },
            ],
          },
        },
        finish: {
          type: 'final',
        },
        'current table with value child, no alpha beta': {
          entry: 'resolveQuestionChild',
          on: {
            'FILL ALPHA BETA': {
              actions: 'fillAlphaBeta',
              target: 'current table with value child',
            },
          },
        },
        'current table with question child': {
          always: {
            cond: 'value',
            target: 'current table with value child, no alpha beta',
          },
          on: {
            'GO DOWN': {
              actions: 'createTable',
              description: 'pass alpha, beta to child',
              target: 'current table with value child',
            },
          },
        },
      },
    },
    {
      guards: {
        value: (ctx) => {
          return ctx.current.questionRow!.node.value !== null;
        },
        'no more children or pruned': (ctx) => {
          const current = ctx.current;

          // no more children
          if (
            current.headerRow.node.children.length == current.valueRows.length
          )
            return true;

          // pruned
          const { alpha, beta } = getAlphaBeta(ctx.current);
          if (alpha >= beta) return true;

          return false;
        },
        'is unvisited child': (ctx, e) => {
          if (!('child' in e)) return false;
          const current = ctx.current;

          // is child
          if (!current.headerRow.node.children.includes(e.child)) return false;

          // is unvisited
          if (current.valueRows.some((row) => row.node == e.child))
            return false;

          return true;
        },
        'more tables': (ctx, e) => {
          return ctx.others.length > 0;
        },
      },
      actions: {
        destroyTable: assign({
          others: (ctx) => ctx.others.slice(0, -1),
          current: (ctx) => ctx.others.at(-1)!,
        }),
        createTable: assign({
          others: (ctx) => [...ctx.others, ctx.current],
          current: ({ current }) => ({
            type: current.type === 'max' ? ('min' as const) : ('max' as const),
            headerRow: {
              // pass alpha, beta down
              ...getAlphaBeta(current),
              node: current.questionRow!.node,
            },
            valueRows: [],
          }),
        }),
        addQuestionChild: assign({
          current: ({ current }, e) => {
            if (!('child' in e)) return current;

            return {
              ...current,
              questionRow: {
                node: e.child,
              },
            };
          },
        }),
        updateQuestionValue: assign({
          others: ({ current, others }) => {
            const { alpha, beta } = current.valueRows.at(-1)!;

            return others.length != 0
              ? [
                  ...others.slice(0, -1),
                  {
                    ...others.at(-1)!,
                    questionRow: {
                      ...others.at(-1)!.questionRow!,
                      value: current.type == 'max' ? alpha : beta,
                    },
                  },
                ]
              : [];
          },
        }),
        resolveQuestionChild: assign({
          current: ({ current }) => {
            const value = current.questionRow!.node.value;
            if (!value) return current;
            return {
              ...current,
              questionRow: {
                ...current.questionRow!,
                value,
              },
            };
          },
        }),
        fillAlphaBeta: assign({
          current: ({ current }) => {
            const { alpha, beta } = getAlphaBeta(current);
            const { node, value } = current.questionRow!;

            return {
              ...current,
              valueRows: [
                ...current.valueRows,
                {
                  node,
                  value: value!,
                  alpha:
                    current.type === 'max' ? Math.max(alpha, value!) : alpha,
                  beta: current.type === 'min' ? Math.min(beta, value!) : beta,
                },
              ],
              questionRow: undefined,
            };
          },
        }),
      },
    }
  );
}

// https://codesandbox.io/s/xstate-solid-example-dgpd7
export function useMachine<A, B, C extends EventObject>(
  machine: StateMachine<A, B, C>,
  options: InterpreterOptions = {}
) {
  const service = interpret(machine, options);

  const [state, setState] = createStore({
    ...service.initialState,
    matches(arg: any) {
      // access state to track on value access
      state.value;
      return service.state.matches(arg);
    },
    can(
      arg: typeof service.state.can extends (arg: infer T) => any ? T : never
    ) {
      state.value;
      return service.state.can(arg);
    },
  });
  service.onTransition((s) => {
    // only focus on stuff that actually changes
    batch(() => {
      setState('value', s.value);
      // diff data to only update values that changes
      setState('context', s.context);
    });
  });

  service.start();
  onCleanup(() => service.stop());

  return [state, service.send] as const;
}
