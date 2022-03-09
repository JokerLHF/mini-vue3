import { RendererElement, VNode } from "./interface";
import { patch, unMount } from "./patch";
// null 和 undefined 需要想办法！！！！！！
// TODO: 这个 render 是否可以跟 patch 同构掉？？？
export function render(vNode: VNode, container: RendererElement) {
  const oldVNode = container._vNode;
  if (!vNode) {
    unMount(oldVNode);
  } else {    
    patch(oldVNode, vNode, container, null);
  }
  container._vNode = vNode;
}
