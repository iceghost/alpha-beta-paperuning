import { PositionNode } from '$lib/position';
import {
  Component,
  createSignal,
  mergeProps,
  For,
  createContext,
  JSX,
  Accessor,
  createMemo,
  useContext,
  Switch,
  Match,
} from 'solid-js';
import { scaleLinear } from 'd3-scale';
import { createElementSize } from '@solid-primitives/resize-observer';

const ScaleContext = createContext<
  [
    {
      svgX: Accessor<(x: number) => number>;
      svgY: Accessor<(y: number) => number>;
      size: Accessor<number>;
    },
    { setSize: Setter<number> }
  ]
>();

export const ScaleProvider: Component<{
  svgWidth: number;
  svgHeight: number;
  width: number;
  height: number;
  paddingX?: number;
  paddingY?: number;
  size?: number;
  children?: JSX.Element;
}> = (props) => {
  const merged = mergeProps(props, { paddingX: 20, paddingY: 20, size: 30 });

  const x = createMemo(() =>
    scaleLinear()
      .domain([0, merged.width - 1])
      .range([
        merged.paddingX + merged.size / 2,
        merged.svgWidth - merged.paddingX - merged.size / 2,
      ])
  );
  const y = createMemo(() =>
    scaleLinear()
      .domain([0, merged.height - 1])
      .range([
        merged.paddingY + merged.size / 2,
        merged.svgHeight - merged.paddingY - merged.size / 2,
      ])
  );
  const [size, setSize] = createSignal(merged.size);

  return (
    <ScaleContext.Provider value={[{ svgX: x, svgY: y, size }, { setSize }]}>
      {merged.children}
    </ScaleContext.Provider>
  );
};

const useScale = () => useContext(ScaleContext);

const MinimaxRoot: Component<{
  root: PositionNode<number>;
}> = (props) => {
  let [container, setContainer] = createSignal<SVGSVGElement>();

  let size = createElementSize(container);

  return (
    <ScaleProvider
      svgWidth={size.width || 0}
      svgHeight={size.height || 0}
      width={props.root.dimensions.width}
      height={props.root.dimensions.height}
      size={30}
    >
      <div ref={setContainer} class="w-full h-full">
        <svg class="w-full h-full">
          <MinimaxNode node={props.root} />
        </svg>
      </div>
    </ScaleProvider>
  );
};

const MinimaxNode: Component<{
  node: PositionNode<number>;
}> = (props) => {
  const [{ svgX, svgY, size }] = useScale()!;
  return (
    <g>
      <For each={props.node.children}>
        {(child, i) => (
          <g>
            <line
              x1={svgX()(props.node.rootPosition.left)}
              y1={svgY()(props.node.rootPosition.top)}
              x2={svgX()(child.rootPosition.left)}
              y2={svgY()(child.rootPosition.top)}
              class="stroke-gray-400"
              // stroke-width="2"
            />
            <MinimaxNode node={child} />
          </g>
        )}
      </For>

      <Switch>
        <Match when={props.node.rootPosition.top % 2 == 0}>
          <rect
            x={svgX()(props.node.rootPosition.left) - size() / 2}
            y={svgY()(props.node.rootPosition.top) - size() / 2}
            width={size()}
            height={size()}
            class="fill-white stroke-black"
          />
        </Match>
        <Match when={props.node.rootPosition.top % 2 == 1}>
          <circle
            cx={svgX()(props.node.rootPosition.left)}
            cy={svgY()(props.node.rootPosition.top)}
            r={size() / 2}
            class="fill-white stroke-black"
          />
        </Match>
      </Switch>

      <text
        x={svgX()(props.node.rootPosition.left)}
        y={svgY()(props.node.rootPosition.top)}
        text-anchor="middle"
        dominant-baseline="middle"
      >
        {props.node.value}
      </text>
    </g>
  );
};

export default MinimaxRoot;
