import { RendererElement, VNode } from "../interface";

/**
 *    1                  1
 *  2              =>  2   newVNode

 *    1                  1
 *  2   oldVNode   =>  2   newVNode
 */
export const processText = (oldVNode: VNode | null, newVNode: VNode, container: RendererElement, anchor: RendererElement | null) => {
  // 情况3: newVNode 存在，oldVNode 不存在
  if (!oldVNode) {
    mountText(newVNode, container, anchor);
    return;
  }
  // 情况2: newVNode oldVNode 都存在，类型相同
  patchText(oldVNode, newVNode);
}

const patchText = (oldVNode: VNode, newVNode: VNode) => {
  newVNode.el = oldVNode.el!;
  newVNode.el.textContent = newVNode.children;
}

const mountText = (newVNode: VNode, container: RendererElement, anchor: RendererElement | null) => {
  const textNode = document.createTextNode(newVNode.children as string);
  newVNode.el = textNode;
  // anchor 不存在相当于 container.appendChild(element)
  container.insertBefore(textNode, anchor)
}

export const unMountText = (el: RendererElement | null) => {
  el?.parentNode?.removeChild(el);
}