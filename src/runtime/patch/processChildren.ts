import { patch, unMount } from ".";
import { RendererElement, ShapeFlags, VNode, VNodeArrayChildren, VNodeChildAtom } from "../interface"
import { normalizeVNode } from "../vNode";

/**
 * children 只可能存在【2种】数据结构: string 和 VNodeArrayChildren
 * patchChildren 存在【9种】情况
 * 1. newChildren 为 string
 *    1.1 oldChildren 为 string, 更新 textChildren
 *    1.2 oldChildren 为 arrayVNode, 卸载 oldChildren, 挂载 newVNode【unMount(oldChildren), mount(newChildren)】
 *    1.3 oldChildren 不存在, 挂载 newChildren 【mount(newChildren)】
 * 2. newChildren 为 arrayVNode
 *    2.1 oldChildren 为 string, 卸载 oldChildren, 挂载 newVNode【unMount(oldChildren), mount(newChildren)】
 *    2.2 oldChildren 为 arrayVNode, patchArrayChildren
 *    2.3 oldChildren 不存在, 挂载 newChildren 【mount(newChildren)】
 * 3. newChildren 不存在
 *    2.1 oldChildren 为 string, 卸载 oldVNode【unMount(oldChildren)】
 *    2.2 oldChildren 为 arrayVNode, 卸载 oldVNode【unMount(oldChildren)】
 *    2.3 oldChildren 不存在, 不处理
 */

/**
 * 走到这个函数的前提：newVNode oldVNode 都存在，且类型相同。类型相同证明 container(dom) 相同
 * 此时 oldVNode 已经挂载在 dom 树上了，所以其 children 应该全部都是 VNode[]
 * 但是 newVNode 还没有挂载到 dom 树上，所以其 children 应该是 VNodeArrayChildren
 * 可以看出 mount 阶段是 VNodeArrayChildren， unMount 阶段是 VNode[]
 */
export const patchChildren = (oldVNode: VNode, newVNode: VNode, container: RendererElement, anchor: RendererElement | null) => {
  const { shapeFlag: oldShapeFlag, children: oldChildren } = oldVNode;
  const { shapeFlag: newShapeFlag, children: newChildren } = newVNode;
  
  if (newShapeFlag & ShapeFlags.TEXT_CHILDREN) {
    if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      unMountChildren(oldChildren as VNode[]);
      container.textContent = newChildren as string;
    } else if(oldShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      container.textContent = newChildren as string;
    } else if (!oldChildren) {
      container.textContent = newChildren as string;
    }

    // 下面是优化的写法（为了可阅读就用上面的写法）
    // if (oldShapeFlag && ShapeFlags.ARRAY_CHILDREN) {
    //   unMountChildren(oldChildren as VNode[]);
    // }
    // if (oldChildren != newChildren) {
    //   container.textContent = newChildren as string;
    // }
  } else if (newShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      patchArrayChildren(oldVNode, newVNode, container, anchor);
    } else if(oldShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      container.textContent = '';
      mountChildren(newChildren as VNodeArrayChildren, container, anchor);
    } else if (!oldChildren) {
      mountChildren(newChildren as VNodeArrayChildren, container, anchor);
    }
  } else {
    if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      unMountChildren(oldChildren as VNode[]);
    } else if(oldShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      container.textContent = '';
    }
  }
}

/**
 * 相当于 createChildVNode, 相当于将 h('div', {}, [111, 'foo', true, undefined, null, h('br')])
 * 111, 'foo', true, undefined, null, 变为 VNode
 */
export const mountChildren = (children: VNodeArrayChildren, container: RendererElement, anchor: RendererElement | null) => {
  children.forEach(child => {
    child = normalizeVNode(child);
    patch(null, child, container, anchor);
  });
}

const unMountChildren = (children: VNode[]) => {
  children.forEach((child) => unMount(child));
}

/**
 * 走到这个函数的前提：newVNode oldVNode 都存在，且类型相同。类型相同证明 container(dom) 相同
 * 此时 oldVNode 已经挂载在 dom 树上了，所以其 children 应该全部都是 VNode[]
 * 但是 newVNode 还没有挂载到 dom 树上，所以其 children 应该是 VNodeArrayChildren
 * 且 oldVNode.children 和 newVNode.children 都只可能是数组
 */
export const patchArrayChildren = (oldVNode: VNode, newVNode: VNode, container: RendererElement, anchor: RendererElement | null) => {
  const oldChildrenLen = oldVNode.children.length;
  const newChildrenLen = newVNode.children.length;
  const len = Math.min(oldChildrenLen, newChildrenLen);
  for (let i = 0; i < len; i++) {
    const newChildVNode = normalizeVNode(newVNode.children[i]);
    patch(oldVNode.children[i] as VNode, newChildVNode, container, anchor);
  }
  if (oldChildrenLen > len) {
    // 情况4. newVNode 不存在，oldVNode 存在【unMount(oldVNode)】
    unMountChildren(oldVNode.children.slice(len, oldChildrenLen) as VNode[]);
  } else {
    mountChildren(newVNode.children.slice(len, newChildrenLen) as VNodeChildAtom[], container, anchor);
  }
}