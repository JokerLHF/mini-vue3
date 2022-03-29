export interface JSONObject {
  [key: string]: any;
}
export interface RendererElement extends JSONObject {};

// TODO: symbol 作为对象的值导出会出现类型丢失情况：https://github.com/microsoft/TypeScript/issues/35562
// export const Text = Symbol('Text');
// export const Fragment = Symbol('Fragment');

export const Text = 'Mini_Vue_Text';
export const Fragment = 'Mini_Vue_Fragment';

// 只支持最简单的 vue3 语法
export type RenderFunction = (ctx: JSONObject) => VNodeChildAtom | VNodeChildAtom[];

export interface Component {
  setup?: (props: JSONObject) => JSONObject;
  render?: RenderFunction;
  props?: string[];
  template?: string;
}

export type VNodeTypes =
  | string
  | typeof Text
  | typeof Fragment
  | Component

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

export type VNodeProps = JSONObject;

export type VNodeKey = string | number | null;

export interface ComponentInstance {
  type: Component,
  props: JSONObject,
  setupState: JSONObject,
  ctx: JSONObject | null,
  isMounted: boolean;
  subTree: VNode | null,
  next: VNode | null, // 被动更新的 vNode
  update: null | { (): void },
}
export interface VNode {
  type: VNodeTypes;
  props: VNodeProps;
  children: VNodeChildren;
  shapeFlag: number;
  el: RendererElement | null;
  key: VNodeKey; // 用于 diff 算法
  anchor: RendererElement | null; // Fragment 专有
  component: ComponentInstance | null, // 组件专有
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
