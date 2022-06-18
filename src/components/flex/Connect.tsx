import { Component, createSignal, onMount } from 'solid-js';

const Connect: Component<{
  parent: HTMLDivElement;
  child: HTMLDivElement;
  container: HTMLDivElement;
}> = (props) => {
  let [line, setLine] = createSignal();
  onMount(() => {
    const parentRect = props.parent.getBoundingClientRect();
    const childRect = props.child.getBoundingClientRect();
    const containerRect = props.container.getBoundingClientRect();
    console.log(props.container, containerRect);
    console.log(props.child, childRect);
    setLine({
      x1: (parentRect.left + parentRect.right) / 2 - containerRect.left,
      y1: parentRect.bottom - containerRect.top,
      x2: (childRect.left + childRect.right) / 2 - containerRect.left,
      y2: childRect.top - containerRect.top,
    });
  });
  return (
    <svg class="absolute top-0 left-0 w-full h-full text-gray-300 pointer-events-none">
      <line {...line()} stroke-width="2" stroke="currentColor" />
    </svg>
  );
};

export default Connect;
