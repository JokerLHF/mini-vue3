import { VNode } from "./interface";

export const isSameVNode = (oldVNode: VNode, newVNode: VNode) => {
  return oldVNode.type === newVNode.type;
}
  