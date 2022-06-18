import { MinimaxNode } from '$lib/minimax';
import {
  Component,
  createSignal,
  mergeProps,
  onMount,
  Ref,
  For,
  Show,
} from 'solid-js';
import Connect from './Connect';

const MinimaxTree: Component<{
  root: MinimaxNode;
  container?: HTMLDivElement;
  depth?: number;
  ref?: Ref<HTMLDivElement>;
}> = (props) => {
  const merged = mergeProps({ depth: 0, isContainer: true }, props);
  const childRefs = new Array(props.root.children.length);
  const setChildRefs = new Array(props.root.children.length);
  for (let i = 0; i < props.root.children.length; i++) {
    const [childRef, setChildRef] = createSignal<HTMLDivElement>();
    childRefs[i] = childRef;
    setChildRefs[i] = setChildRef;
  }
  let [selfRef, setSelfRef] = createSignal<HTMLDivElement>();

  return (
    <div class="flex flex-col">
      <div
        class="px-1 py-2"
        classList={{
          'bg-gray-100': merged.depth % 2 == 1,
          // 'bg-yellow-100': merged.depth % 2 == 1,
        }}
      >
        <div
          class="mx-auto border-2 border-gray-300 bg-white w-10 h-10 flex items-center justify-center"
          classList={{
            'rounded-full': merged.depth % 2 == 0,
            'rounded-md': merged.depth % 2 == 1,
          }}
          ref={(ref) => {
            typeof props.ref == 'function' ? props.ref(ref) : (props.ref = ref);
            setSelfRef(ref);
          }}
        >
          <span class="text-gray-800">{merged.root.value ?? ''}</span>
        </div>
      </div>
      <div class="flex">
        <For each={merged.root.children}>
          {(child, i) => (
            <>
              <MinimaxTree
                root={child}
                depth={merged.depth + 1}
                container={props.container}
                ref={setChildRefs[i()]}
              />
              <Show when={childRefs[i()]() && selfRef() && props.container}>
                <Connect
                  parent={selfRef()!}
                  child={childRefs[i()]()!}
                  container={props.container!}
                />
              </Show>
            </>
          )}
        </For>
      </div>
    </div>
  );
};

export default MinimaxTree;
