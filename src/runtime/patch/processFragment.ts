import { RendererElement, ShapeFlags, VNode, VNodeArrayChildren } from "../interface";
import { mountChildren, patchArrayChildren } from "./processChildren";

export const processFragment = (oldVNode: VNode | null, newVNode: VNode, container: RendererElement, anchor: RendererElement | null) => {
  // 用来删除 unMountFragment
  const fragmentStartAnchor = newVNode.el = (
    oldVNode ? oldVNode.el! : document.createTextNode('')
  );
  // 用来插入，insertBefore
  const fragmentEndAnchor = newVNode.anchor = (
    oldVNode ? oldVNode.anchor! : document.createTextNode('')
  );

  // 情况3: newVNode 存在，oldVNode 不存在  
  if (!oldVNode) {
    /**
     * anchor 不存在相当于 container.appendChild(element)
     * 此时 newVNode 的 fragment 虽然有 children，但是 dom 节点依旧没有渲染子节点
     */
    container.insertBefore(fragmentStartAnchor, anchor);
    container.insertBefore(fragmentEndAnchor, anchor);
    mountFragment(newVNode, container, fragmentEndAnchor);
    return;
  }
  // 情况2: newVNode oldVNode 都存在，类型相同
  patchFragment(oldVNode, newVNode, container, fragmentEndAnchor);
}

const mountFragment = (newVNode: VNode, container: RendererElement, anchor: RendererElement) => {
  const { shapeFlag, children } = newVNode;
  if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children as VNodeArrayChildren, container, anchor);
  }
}

const patchFragment = (oldVNode: VNode, newVNode: VNode, container: RendererElement, anchor: RendererElement) => {
  patchArrayChildren(oldVNode, newVNode, container, anchor);
}


export const unMountFragment = (oldVNode: VNode) => {
  let cur = oldVNode.el!;
  let end = oldVNode.anchor!;

  while (cur !== end) {
    const next = cur.nextSibling;
    cur.parentNode.removeChild(cur);
    cur = next;
  }
  end.parentNode.removeChild(end);
}
