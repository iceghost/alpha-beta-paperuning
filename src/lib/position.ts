import { Node } from '$lib/parse';

export interface Position {
    dimensions: { left: number; top: number; width: number; height: number };
    rootPosition: { left: number; top: number };
}

export type PositionedNode<U> = Node<U & Position>;

export function computePosition<U extends object>(
    root: Node<U>,
    left = 0,
    top = 0
): PositionedNode<U> {
    let baseLeft = left;

    const children = new Array<PositionedNode<U>>(root.children.length);
    let height = 1;
    for (const key in root.children) {
        const child = root.children[key];

        children[key] = computePosition<U>(child, left, top + 1);

        left += children[key].data.dimensions.width;

        height = Math.max(height, children[key].data.dimensions.height + 1);
    }

    return {
        ...root,
        data: {
            ...root.data,
            dimensions: {
                left: baseLeft,
                top,
                width: Math.max(1, left - baseLeft),
                height,
            },
            rootPosition: {
                left: baseLeft + Math.trunc((left - baseLeft) / 2),
                top,
            },
        },
        children,
    };
}
