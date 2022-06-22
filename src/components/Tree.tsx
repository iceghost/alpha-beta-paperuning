import { PositionedTree } from '$lib/position';
import {
    Component,
    createSignal,
    mergeProps,
    For,
    createContext,
    createEffect,
    JSX,
    Accessor,
    createMemo,
    useContext,
    Switch,
    Match,
    Setter,
} from 'solid-js';
import { scaleLinear } from 'd3-scale';
import { createElementSize } from '@solid-primitives/resize-observer';
import { useTableMachine } from './TableMachine';
import Table from './Table';
import { LabeledTree } from '$lib/label';

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
                Math.min(
                    (2 * merged.height - 1) * merged.size,
                    merged.svgHeight - merged.paddingY
                ) -
                    merged.size / 2,
            ])
    );
    const [size, setSize] = createSignal(merged.size);

    return (
        <ScaleContext.Provider
            value={[{ svgX: x, svgY: y, size }, { setSize }]}
        >
            {merged.children}
        </ScaleContext.Provider>
    );
};

const useScale = () => useContext(ScaleContext);

const MinimaxRoot: Component<{
    root: PositionedTree<{ value?: number; label: string }>;
}> = (props) => {
    let [container, setContainer] = createSignal<SVGSVGElement>();

    let size = createElementSize(container);

    // const [state, send] = useTableMachine()!;
    // createEffect(() => {
    //     console.log(state.value);
    // });

    return (
        <div class="flex w-full h-full items-start">
            {/* <div class="flex w-full p-5 items-start space-x-3">
                <For each={state.context.others}>
                    {(table) => <Table table={table} />}
                </For>
                <Table table={state.context.current} />
            </div> */}
            <div class="flex flex-col h-full">
                <div class="space-x-5">
                    <button
                        class="border uppercase px-2 py-1"
                        // classList={{
                        //     'bg-green-500 text-white font-bold': state.can({
                        //         type: 'GO DOWN',
                        //     }),
                        // }}
                        // onClick={() => send({ type: 'GO DOWN' })}
                    >
                        go down
                    </button>
                    <button
                        class="border uppercase px-2 py-1"
                        // classList={{
                        //     'bg-green-500 text-white font-bold': state.can({
                        //         type: 'FILL ALPHA BETA',
                        //     }),
                        // }}
                        // onClick={() => send({ type: 'FILL ALPHA BETA' })}
                    >
                        fill alpha beta
                    </button>
                    <button
                        class="border uppercase px-2 py-1"
                        // classList={{
                        //     'bg-green-500 text-white font-bold': state.can({
                        //         type: 'GO UP',
                        //     }),
                        // }}
                        // onClick={() => send({ type: 'GO UP' })}
                    >
                        go up
                    </button>
                </div>
                <div ref={setContainer} class="w-full h-full">
                    <svg class="w-full h-full">
                        <ScaleProvider
                            svgWidth={size.width || 0}
                            svgHeight={size.height || 0}
                            width={props.root.node.dimensions.width}
                            height={props.root.node.dimensions.height}
                            size={30}
                        >
                            <MinimaxNode node={props.root} />
                        </ScaleProvider>
                    </svg>
                </div>
            </div>
        </div>
    );
};

const MinimaxNode: Component<{
    node: PositionedTree<{ value?: number; label: string }>;
}> = (props) => {
    const [{ svgX, svgY, size }] = useScale()!;

    // const [state, send] = useTableMachine()!;
    const selectable = () => false;
    // state.can({ type: 'SELECT CHILD', child: props.node });

    return (
        <g>
            <For each={props.node.children}>
                {(child, i) => (
                    <g>
                        <line
                            x1={svgX()(props.node.node.rootPosition.left)}
                            y1={svgY()(props.node.node.rootPosition.top)}
                            x2={svgX()(child.node.rootPosition.left)}
                            y2={svgY()(child.node.rootPosition.top)}
                            class="stroke-gray-400"
                            // stroke-width="2"
                        />
                        <MinimaxNode node={child} />
                    </g>
                )}
            </For>
            <g
            // classList={{
            //     'cursor-pointer': state.can({
            //         type: 'SELECT CHILD',
            //         child: props.node,
            //     }),
            // }}
            // onClick={() =>
            //     send({ type: 'SELECT CHILD', child: props.node })
            // }
            >
                <rect
                    x={svgX()(props.node.node.rootPosition.left) - size() / 2}
                    y={svgY()(props.node.node.rootPosition.top) - size() / 2}
                    width={size()}
                    height={size()}
                    rx={props.node.node.rootPosition.top % 2 == 0 ? 5 : 100}
                    classList={{
                        'fill-white stroke-black': !selectable(),
                        'fill-green-500': selectable(),
                    }}
                />

                <text
                    x={svgX()(props.node.node.rootPosition.left)}
                    y={svgY()(props.node.node.rootPosition.top)}
                    text-anchor="middle"
                    dominant-baseline="middle"
                    classList={{
                        'fill-white': selectable(),
                    }}
                >
                    {props.node.node.label}
                </text>
            </g>
        </g>
    );
};

export default MinimaxRoot;
