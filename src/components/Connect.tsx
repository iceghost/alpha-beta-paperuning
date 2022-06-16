import { Component, createSignal, onMount } from 'solid-js';

const Connect: Component<{ parent: HTMLDivElement; child: HTMLDivElement }> = (
  props
) => {
  let [line, setLine] = createSignal();
  onMount(() => {
    const parentRect = props.parent.getBoundingClientRect();
    const childRect = props.child.getBoundingClientRect();
    setLine({
      x1: (parentRect.left + parentRect.right) / 2,
      y1: parentRect.bottom,
      x2: (childRect.left + childRect.right) / 2,
      y2: childRect.top,
    })
  })
  return (
    <svg class="absolute top-0 left-0 w-full h-full text-gray-300 pointer-events-none"> 
      <line
        {...line()}
        stroke-width="2"
        stroke="currentColor"
      />
    </svg>
  );
};

export default Connect;
