import { createMachine, assign } from 'xstate';
import { Node } from './parse';

export interface Table<N> {
  type: 'min' | 'max';
  headerRow: { node: N; alpha: number; beta: number };
  valueRows: { node: N; value: number; alpha: number; beta: number }[];
  questionRow?: { node: N; value?: number };
}

function getAlphaBeta<N>(table: Table<N>): {
  alpha: number;
  beta: number;
} {
  const lastValueRow = table.valueRows.at(-1);
  if (lastValueRow) {
    return { ...lastValueRow };
  }
  return { ...table.headerRow };
}

function newMachine<N extends Node<number>>(root: N) {
  return createMachine(
    {
      schema: {
        context: {} as { others: Table<N>[]; current: Table<N> },
        events: {} as
          | { type: 'GO DOWN' }
          | { type: 'SELECT CHILD'; child: N }
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
            cond: 'no more chilren or pruned',
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
        'no more chilren or pruned': (ctx) => {
          const current = ctx.current;

          // no more children
          if (
            current.valueRows[0].node.children.length ==
            current.valueRows.length
          )
            return true;

          // pruned
          const { alpha, beta } = current.valueRows.at(-1)!;
          if (alpha >= beta) return true;

          return false;
        },
        'is unvisited child': (ctx, e) => {
          if (!('child' in e)) return false;
          const current = ctx.current;

          // is child
          if (!current.valueRows[0].node.children.includes(e.child))
            return false;

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
