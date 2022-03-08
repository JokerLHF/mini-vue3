import { RendererElement, ShapeFlags, VNode, VNodeArrayChildren } from "../interface";
import { mountChildren, patchArrayChildren } from "./processChildren";

export const processFragment = (oldVNode: VNode | null, newVNode: VNode, container: RendererElement) => {
  // 情况3: newVNode 存在，oldVNode 不存在
  console.log('processFragment', oldVNode, newVNode, container );
  
  if (!oldVNode) {
    mountFragment(newVNode, container);
    return;
  }
  // 情况2: newVNode oldVNode 都存在，类型相同
  patchFragment(oldVNode, newVNode, container);
}

const mountFragment = (newVNode: VNode, container: RendererElement) => {
  const { shapeFlag, children } = newVNode;
  if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children as VNodeArrayChildren, container);
  }
}

const patchFragment = (oldVNode: VNode, newVNode: VNode, container: RendererElement) => {
  patchArrayChildren(oldVNode, newVNode, container);
}


export const unMountFragment = () => {

}
