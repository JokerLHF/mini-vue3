import { isBoolean, isNull, isNumber, isString, isUndefined } from "../utils";
import { VNode, VNodeTypes, ShapeFlags, VNodeProps, Text, Fragment, RawChildren, VNodeChildAtom } from "./interface";

/**
 *  h(Symbol(Text), {}, 111)
 *  h(Symbol(Text), {}, '111')
 *  h(Symbol(Text), {}, true)
 *  h(Symbol(Text), {}, undefined)
 *  h(Symbol(Text), {}, null)
 */
 export function h(
  type: typeof Text,
  props: VNodeProps,
  children: RawChildren
): VNode

/**
 *  h('div', {}, 'foo')
 *  h('div', {}, 111) 
 *  h('div', {}, true)
 *  h('div', {}, undefined)
 *  h('div', {}, null)
 *  h('div', {}, [111, 'foo', true, undefined, null, h('br')])
 */
export function h(
  type: string,
  props: VNodeProps,
  children: VNodeChildAtom[] | RawChildren
): VNode

/**
 *  h(Symbol(Fragment), {}, [111, 'foo', true, undefined, null, h('br')])
 */
 export function h(
  type: typeof Fragment,
  props: VNodeProps,
  children: VNodeChildAtom[]
): VNode


export function h(type: any, props: any, children: any): VNode {  
  return createVNode(type, props, children);
} 

const createVNode = (type: any, props: any, children: any): VNode => {
  const vNode = {
    type,
    props,
    children,
    el: null,
    anchor: null,
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

// TODO: 先这样
export const normalizeVNode = (child: VNodeChildAtom): VNode => {
  // 根据 children 的类型处理 shapeFlag
  if (isRawChildren(child)) {
    return createVNode(Text, {}, `${child}`);
  }
  return child as VNode;
}