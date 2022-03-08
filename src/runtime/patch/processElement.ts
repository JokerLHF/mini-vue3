import { RendererElement, ShapeFlags, VNode, VNodeArrayChildren } from "../interface";
import { mountChildren, patchChildren } from "./processChildren";

export const processElement = (oldVNode: VNode | null, newVNode: VNode, container: RendererElement) => {
  // 情况3: newVNode 存在，oldVNode 不存在
  if (!oldVNode) {
    mountElement(newVNode, container);
    return;
  }
  // 情况2: newVNode oldVNode 都存在，类型相同
  patchElement(oldVNode, newVNode, container);
}

const mountElement = (newVNode: VNode, container: RendererElement) => {
  const { type, shapeFlag, children } = newVNode;
  const element = document.createElement(type as string);
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {    
    element.textContent = children as string;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children as VNodeArrayChildren, element);
  }

  newVNode.el = element;
  container.appendChild(element);
}

const patchElement = (oldVNode: VNode, newVNode: VNode, container: RendererElement) => {
  newVNode.el = oldVNode.el!;
  patchChildren(oldVNode, newVNode, newVNode.el);
}

export const unMountElement = (el: RendererElement | null) => {
  el?.parentNode?.removeChild(el);
}