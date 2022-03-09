import { isSameVNode } from "../helper";
import { RendererElement, ShapeFlags, VNode, Text, Fragment } from "../interface";
import { processComponent, unMountComponent } from "./processCompoment";
import { processElement, unMountElement } from "./processElement";
import { processFragment, unMountFragment } from "./processFragment";
import { processText, unMountText } from "./processText";

/**
 * newVNode 和 oldVNode 存在【4种】情况
 *  1. newVNode oldVNode 都存在，但是类型不同 【unMount(oldVNode), mount(newVNode)】
 *  2. newVNode oldVNode 都存在，类型相同 【update】
 *  3. newVNode 存在，oldVNode 不存在 【mount(newVNode)】
 *  4. newVNode 不存在，oldVNode 存在【unMount(oldVNode)】
 */

export const patch = (oldVNode: VNode | null, newVNode: VNode, container: RendererElement, anchor: RendererElement | null) => {
  // 情况1: newVNode oldVNode 都存在，但是类型不同
  if (oldVNode && !isSameVNode(oldVNode, newVNode)) {
    unMount(oldVNode);
    oldVNode = null;
  }
  
  const { shapeFlag, type } = newVNode;

  switch (type) {
    case Text:
      processText(oldVNode, newVNode, container, anchor);
      return;
    case Fragment:
      processFragment(oldVNode, newVNode, container, anchor);
      return;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(oldVNode, newVNode, container, anchor);
      } else if (shapeFlag & ShapeFlags.COMPONENT) {
        processComponent(oldVNode, newVNode, container, anchor);
      }
      return;
  }
}

export const unMount = (prevVNode: VNode) => {
  if (prevVNode.shapeFlag & ShapeFlags.TEXT) {
    unMountText(prevVNode.el);
  } else if (prevVNode.shapeFlag & ShapeFlags.ELEMENT) {
    unMountElement(prevVNode.el);
  } else if (prevVNode.shapeFlag & ShapeFlags.FRAGMENT) {
    unMountFragment(prevVNode);
  } else if (prevVNode.shapeFlag & ShapeFlags.COMPONENT) {
    unMountComponent()
  }
}