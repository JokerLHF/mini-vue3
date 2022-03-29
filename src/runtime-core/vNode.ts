import { isArray, isBoolean, isNull, isNumber, isString, isUndefined } from "../utils";
import { VNode, VNodeTypes, ShapeFlags, VNodeProps, Text, Fragment, RawChildren, VNodeChildAtom, Component } from "./interface";

/**
 *  h(Symbol(Text), {}, 111)
 *  h(Symbol(Text), {}, '111')
 *  h(Symbol(Text), {}, true)
 *  h(Symbol(Text), {}, undefined)
 *  h(Symbol(Text), {}, null)
 *
 *  h(Symbol(Text))
 */
 export function h(
  type: typeof Text,
  props?: VNodeProps,
  children?: RawChildren,
): VNode

/**
 *  h('div', {}, 'foo')
 *  h('div', {}, 111) 
 *  h('div', {}, true)
 *  h('div', {}, undefined)
 *  h('div', {}, null)
 *  h('div', {}, [111, 'foo', true, undefined, null, h('br')])
 * 
 *  h('div')
 */
export function h(
  type: string,
  props?: VNodeProps,
  children?: VNodeChildAtom[] | RawChildren,
): VNode

/**
 *  h(Symbol(Fragment), {}, [111, 'foo', true, undefined, null, h('br')])
 */
export function h(
  type: typeof Fragment,
  props: VNodeProps,
  children: VNodeChildAtom[],
): VNode

/**
 *  h(Component, {}, 'foo')
 *  h(Component, {}, 111) 
 *  h(Component, {}, true)
 *  h(Component, {}, undefined)
 *  h(Component, {}, null)
 *  h(Component, {}, [111, 'foo', true, undefined, null, h('br')])
 * 
 *  h(Component)
 */
export function h(
  type: Component,
  props?: VNodeProps,
  children?: VNodeChildAtom[] | RawChildren,
): VNode

export function h(type: any, props: any = {}, children: any = null): VNode {
  return createVNode(type, props, children);
} 

const createVNode = (type: any, props: any, children: any): VNode => {
  const vNode = {
    type,
    props,
    children,
    el: null,
    anchor: null,
    component: null,
    key: props.key,
    shapeFlag: getShapeFlags(type),
  }
  // 根据 children 的类型处理 shapeFlag
  if (isRawChildren(children)) {
    vNode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    vNode.children = `${children}`;
  } else {
    vNode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }

  return vNode;
}

const isRawChildren = (children: any) => {
  return isUndefined(children) || isNull(children) || isNumber(children) || isString(children) || isBoolean(children)
}

const getShapeFlags = (type: VNodeTypes) => {
  let shapeFlag = 0;
  if (isString(type)) {
    shapeFlag = ShapeFlags.ELEMENT;
  } else if (type === Text) {
    shapeFlag = ShapeFlags.TEXT;
  } else if (type === Fragment) {
    shapeFlag = ShapeFlags.FRAGMENT;
  } else {
    shapeFlag = ShapeFlags.COMPONENT;
  }
  return shapeFlag;
}

export const normalizeVNode = (child: VNodeChildAtom | VNodeChildAtom[]): VNode => {
  // 数组类型用 fragment
  if (isArray(child)) {
    return createVNode(Fragment, {}, child);
  }
  // 根据 children 的类型处理 shapeFlag
  if (isRawChildren(child)) {
    return createVNode(Text, {}, `${child}`);
  }
  return child as VNode;
}

// h(
//   {
//     props: ['foo'],
//     setup() {
//       const count = ref(0);
//       const add = () => count.value++;
//       return {
//         count,
//         add,
//       };
//     },
//     render(ctx) {
//       return [
//         h('div', null, ctx.count.value),
//         h(
//           'button',
//           {
//             onClick: ctx.add,
//           },
//           'add'
//         ),
//       ];
//     },
//   },
// {}, '11')

// const Comp = {
//   props: ['foo'],
//   render(ctx) {
//     return h('div', { class: 'a', id: ctx.bar }, ctx.foo);
//   },
// };

// const vnodeProps = {
//   foo: 'foo',
//   bar: 'bar',
// };

// const vnode = h(Comp, vnodeProps);
// render(vnode, root); // 渲染为<div class="a" bar="bar">foo</div>