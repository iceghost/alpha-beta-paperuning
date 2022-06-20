import { Component, For, Show } from 'solid-js';
import { Table as TableType } from '$lib/machine';

const format = (x: number) =>
  x === -Infinity
    ? `-∞`
    : x === +Infinity
    ? '+∞'
    : x === undefined || x === null
    ? '?'
    : `${x}`;

const Table: Component<{ table: TableType }> = (props) => {
  return (
    <table>
      <thead>
        <tr>
          <th class="text-center px-2">{props.table.type}</th>
          <th class="text-center px-2">a</th>
          <th class="text-center px-2">b</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-center">{props.table.headerRow.node.label}</td>
          <td class="text-center">{format(props.table.headerRow.alpha)}</td>
          <td class="text-center">{format(props.table.headerRow.beta)}</td>
        </tr>
        <For each={props.table.valueRows}>
          {(row, i) => (
            <tr>
              <td class="text-center">
                {row.node.label} = {format(row.value)}
              </td>
              <td class="text-center">{format(row.alpha)}</td>
              <td class="text-center">{format(row.beta)}</td>
            </tr>
          )}
        </For>
        <Show when={props.table.questionRow}>
          <tr>
            <td class="text-center">
              {props.table.questionRow!.node.label} ={' '}
              {format(props.table.questionRow?.value)}
            </td>
            <td class="text-center"></td>
            <td class="text-center"></td>
          </tr>
        </Show>
      </tbody>
    </table>
  );
};

export default Table;
