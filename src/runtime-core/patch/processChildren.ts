import { patch, unMount } from ".";
import { getSequence } from "../../utils/sequence";
import { isSameVNode } from "../helper";
import { RendererElement, ShapeFlags, VNode, VNodeChildAtom, VNodeChildren, VNodeKey } from "../interface"
import { normalizeVNode } from "../vNode";

/**
 * children 只可能存在【2种】数据结构: string 和 VNodeChildAtom[]
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
 * 但是 newVNode 还没有挂载到 dom 树上，所以其 children 应该是 VNodeChildAtom[]
 * 可以看出 mount 阶段是 VNodeChildAtom[], unMount 阶段是 VNode[]
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
      patchKeyedChildren(oldVNode.children as VNode[], newVNode.children, container, anchor);
    } else if(oldShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      container.textContent = '';
      mountChildren(newChildren as VNodeChildAtom[], container, anchor);
    } else if (!oldChildren) {
      mountChildren(newChildren as VNodeChildAtom[], container, anchor);
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
export const mountChildren = (children: VNodeChildAtom[], container: RendererElement, anchor: RendererElement | null) => {
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
 * 但是 newVNode 还没有挂载到 dom 树上，所以其 children 应该是 VNodeChildAtom[]
 * 且 oldVNode.children 和 newVNode.children 都只可能是数组
 */
// export const patchUnkeyedChildren = (oldVNode: VNode, newVNode: VNode, container: RendererElement, anchor: RendererElement | null) => {
//   const oldChildrenLen = oldVNode.children.length;
//   const newChildrenLen = newVNode.children.length;
//   const len = Math.min(oldChildrenLen, newChildrenLen);
//   for (let i = 0; i < len; i++) {
//     const newChildVNode = normalizeVNode(newVNode.children[i]);
//     patch(oldVNode.children[i] as VNode, newChildVNode, container, anchor);
//   }
//   if (oldChildrenLen > len) {
//     // 情况4. newVNode 不存在，oldVNode 存在【unMount(oldVNode)】
//     unMountChildren(oldVNode.children.slice(len, oldChildrenLen) as VNode[]);
//   } else {
//     mountChildren(newVNode.children.slice(len, newChildrenLen) as VNodeChildAtom[], container, anchor);
//   }
// }

// 走到这个函数的前提：newVNode oldVNode 都存在，且类型相同。类型相同证明 container(dom) 相同
export const patchKeyedChildren = (oldChildren: VNode[], newChildren: VNodeChildren, container: RendererElement, anchor: RendererElement | null) => {
  let i = 0;
  let oldChildrenEnd = oldChildren.length - 1;
  let newChildrenEnd = newChildren.length - 1;
  // 1. 从左到右
  // (a b) c
  // (a b) d e
  while(i <= oldChildrenEnd && i <= newChildrenEnd) {
    const oldVNode = oldChildren[i];
    const newVNode = normalizeVNode(newChildren[i]);
    if (!isSameVNode(oldVNode, newVNode)) {
      break;
    }
    patch(oldVNode, newVNode, container, anchor);
    i++;
  }
  // 2. 从右到左
  // a (b c)
  // d e (b c)
  while(i <= oldChildrenEnd && i <= newChildrenEnd) {
    const oldVNode = oldChildren[oldChildrenEnd];
    const newVNode = normalizeVNode(newChildren[newChildrenEnd]);
    if (!isSameVNode(oldVNode, newVNode)) {
      break;
    }
    patch(oldVNode, newVNode, container, anchor);
    oldChildrenEnd--;
    newChildrenEnd--;
  }

  // 3. 经过1、2直接将旧结点比对完，则剩下的新结点直接mount
  if (i > oldChildrenEnd && i <= newChildrenEnd) {
    const nextPos = newChildrenEnd + 1;
    // newChildrenEnd 是最后一个 +1 就是 undefined, 
    // newChildrenEnd 不是最后一个，前一个肯定在情况2中被 patch 了
    const curAnchor = newChildren[nextPos] 
      ? (newChildren[nextPos] as VNode).el
      : anchor;
    for (let j = i; j <= newChildrenEnd; j++) {
      const newVNode = normalizeVNode(newChildren[j]);
      patch(null, newVNode, container, curAnchor);
    }
  }

  // 4. 经过1、2直接将新结点比对完，则剩下的旧结点直接 unMount
  else if (i > newChildrenEnd && i <= oldChildrenEnd) {
    for (let j = i; j <= oldChildrenEnd; j++) {
      unMount(oldChildren[j]);
    }
  }

  // 5. 经过3、4, 新节点和旧节点都没有对比完
  else {
    // 5.1 得到 newChildren 在 oldChildren 的位置数组 source
    const { 
      move,
      source,
      seq,
    } = getSourceAndSeq(oldChildren, newChildren, i, newChildrenEnd, oldChildrenEnd, container, anchor);
    
    // 5.2 根据 source 获取最长增长序列并移动
    if (move) {
      let j = seq.length - 1;
      for (let k = source.length - 1; k >= 0; k--) {
        if (seq[j] === k) {
          // 不用移动
          j--;
        } else {
          const pos = k + i;
          const nextPos = pos + 1;
          const curAnchor = newChildren[nextPos]  ? (newChildren[nextPos] as VNode).el : anchor;
          if (source[k] === -1) {
            // mount
            const newChildVNode = normalizeVNode(newChildren[pos]);
            patch(null, newChildVNode, container, curAnchor);
          } else {
            // move
            const newChildVNode = newChildren[pos] as VNode;
            container.insertBefore(newChildVNode.el, curAnchor);
          } 
        }
      }
    }
  }
}

/**
 *   (a b)
 * A (a b) B
 * 此时就不需要 move, 但是 A B 需要 mounted。
 * source = [-1, 1, 2, -1]
 * seq = [1, 2]
 * 
 *  a b c d
 *  d a b c
 * 此时就需要 move。
 * source = [1, 0, 3, 2]
 * seq = [1, 3]
 * 
 *  b e d a
 *  a c e d
 * 此时就需要 move， c 需要 mounted，d 需要 unmounted
 * source = [3, -1, 1, 2]
 * seq = [1, 2]
 */
export const getSourceAndSeq = (
  oldChildren: VNode[],
  newChildren: VNodeChildren,
  startIndex: number,
  newChildrenEnd: number,
  oldChildrenEnd: number,
  container: RendererElement,
  anchor: RendererElement | null
) => {
  const oldChildrenKeyMap = new Map();
  for (let i = startIndex; i <= oldChildrenEnd; i++) {
    const vNode = oldChildren[i];
    oldChildrenKeyMap.set(vNode.key, { vNode, index: i });
  }

  const len = newChildrenEnd - startIndex + 1;
  const source = new Array(len).fill(-1);
  let move = false;

  let maxNewIndexSoFar = -1;

  for (let i = 0; i < len; i++) {
    const childVNode = normalizeVNode(newChildren[i]);
    if (oldChildrenKeyMap.has(childVNode.key)) {
      const { vNode, index } = oldChildrenKeyMap.get(childVNode.key);
      if (index < maxNewIndexSoFar) {
        move = true;
      } else {
        maxNewIndexSoFar = index;
      }
      source[i] = index;
      patch(vNode, childVNode, container, anchor);
      oldChildrenKeyMap.delete(childVNode.key);
    }
  }

  // 情况4. newVNode 不存在，oldVNode 存在【unMount(oldVNode)】
  oldChildrenKeyMap.forEach(value => {
    unMount(value.vNode);
  });

  const seq = getSequence(move ? source : []);
  return {
    move,
    source,
    seq,
  };
}
