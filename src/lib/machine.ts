import { createMachine } from 'xstate';
import { Node } from './parse';

export interface Table {
  valueRows: { node: Node<number>; alpha: number; beta: number }[];
  questionRow?: { node: Node<number> };
}

createMachine(
  {
    schema: {
      context: {} as { stack: Table[] },
      events: {} as
        | { type: 'ADD ROOT'; root: Node<number> }
        | { type: 'GO DOWN' }
        | { type: 'SELECT CHILD'; child: Node<number> }
        | { type: 'GO UP' }
        | { type: 'FILL ALPHA BETA' },
    },
    id: 'alpha beta pruning',
    initial: 'empty',
    states: {
      'current table with value child': {
        description: 'alpha, beta is updated',
        always: {
          cond: 'no more chilren or pruned',
          target: 'completed current table',
        },
        on: {
          'SELECT CHILD': {
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
      empty: {
        on: {
          'ADD ROOT': {
            description: 'alpha = -infty\nbeta = +infty',
            target: 'new table',
          },
        },
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
        entry: 'addQuestionChild',
        always: {
          cond: 'value',
          target: 'current table with value child, no alpha beta',
        },
        on: {
          'GO DOWN': {
            description: 'pass alpha, beta to child',
            target: 'new table',
          },
        },
      },
      'new table': {
        entry: 'createTable',
        always: {
          target: 'current table with value child',
        },
      },
    },
  },
  {
    guards: {
      value: (ctx) => {
        return ctx.stack.at(-1)!.questionRow!.node.value !== null;
      },
      'no more chilren or pruned': (ctx) => {
        const current = ctx.stack.at(-1)!;

        // no more children
        if (
          current.valueRows[0].node.children.length == current.valueRows.length
        )
          return true;

        // pruned
        const { alpha, beta } = current.valueRows.at(-1)!;
        if (alpha >= beta) return true;

        return false;
      },
      'is unvisited child': (ctx, e) => {
        if (!('child' in e)) return false;
        const current = ctx.stack.at(-1)!;

        // is child
        if (!current.valueRows[0].node.children.includes(e.child)) return false;

        // is unvisited
        if (current.valueRows.some((row) => row.node == e.child)) return false;

        return true;
      },
      'more tables': (ctx, e) => {
        return ctx.stack.length > 1;
      },
    },
  }
);
