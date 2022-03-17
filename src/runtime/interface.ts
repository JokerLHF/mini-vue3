export interface RendererElement {
  [key: string]: any;
}

export const Text = Symbol('Text');
export const Fragment = Symbol('Fragment');
export type VNodeTypes =
  | string
  | typeof Text
  | typeof Fragment

export type RawChildren = 
  | number
  | string
  | boolean
  | null
  | undefined;

export type VNodeChildAtom =
  | RawChildren
  | VNode


export type VNodeChildren = 
  | string
  | VNodeChildAtom[];

export type VNodeProps = { [key: string]: any };

export type VNodeKey = string | number | null;
export interface VNode {
  type: VNodeTypes;
  props: VNodeProps;
  children: VNodeChildren;
  shapeFlag: number;
  el: RendererElement | null;
  key: VNodeKey; // 用于 diff 算法
  anchor: RendererElement | null; // Fragment 专有
}

// << 表示向左移动指定位数，左边超出的位数将会被清除，右边将会补零。
export const enum ShapeFlags {
  ELEMENT = 1,
  TEXT = 1 << 1,
  FRAGMENT = 1 << 2,
  COMPONENT = 1 << 3,
  TEXT_CHILDREN = 1 << 4,
  ARRAY_CHILDREN = 1 << 5,
  CHILDREN = (1 << 4) | (1 << 5),
};
