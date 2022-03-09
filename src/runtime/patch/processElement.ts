import { RendererElement, ShapeFlags, VNode, VNodeArrayChildren } from "../interface";
import { mountChildren, patchChildren } from "./processChildren";

export const processElement = (oldVNode: VNode | null, newVNode: VNode, container: RendererElement, anchor: RendererElement | null) => {
  // 情况3: newVNode 存在，oldVNode 不存在
  if (!oldVNode) {
    mountElement(newVNode, container, anchor);
    return;
  }
  // 情况2: newVNode oldVNode 都存在，类型相同
  patchElement(oldVNode, newVNode, anchor);
}

const mountElement = (newVNode: VNode, container: RendererElement, anchor: RendererElement | null) => {
  const { type, shapeFlag, children } = newVNode;
  const element = document.createElement(type as string);
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {    
    element.textContent = children as string;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children as VNodeArrayChildren, element, anchor);
  }

  newVNode.el = element;
  // anchor 不存在相当于 container.appendChild(element)
  container.insertBefore(element, anchor);
}

const patchElement = (oldVNode: VNode, newVNode: VNode, anchor: RendererElement | null) => {
  newVNode.el = oldVNode.el!;
  patchChildren(oldVNode, newVNode, newVNode.el, anchor);
}

export const unMountElement = (el: RendererElement | null) => {
  el?.parentNode?.removeChild(el);
}