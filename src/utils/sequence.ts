// TODO 后续再看

export const getSequence = (nums: number[]) => {
  const result = [];
  const position = [];
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === -1) {
      continue;
    }
    // result[result.length - 1]可能为undefined，此时nums[i] > undefined为false
    if (nums[i] > result[result.length - 1]) {
      result.push(nums[i]);
      position.push(result.length - 1);
    } else {
      let l = 0,
        r = result.length - 1;
      while (l <= r) {
        const mid = ~~((l + r) / 2);
        if (nums[i] > result[mid]) {
          l = mid + 1;
        } else if (nums[i] < result[mid]) {
          r = mid - 1;
        } else {
          l = mid;
          break;
        }
      }
      result[l] = nums[i];
      position.push(l);
    }
  }
  let cur = result.length - 1;
  // 这里复用了result，它本身已经没用了
  for (let i = position.length - 1; i >= 0 && cur >= 0; i--) {
    if (position[i] === cur) {
      result[cur--] = i;
    }
  }
  return result;
}

// export const patchKeyChildren = (oldChildren: VNode[], newChildren: VNodeChildren, container: RendererElement, anchor: RendererElement | null) => {
//   const oldChildrenKeyMap = new Map();
//   oldChildren.forEach((vNode, index) => {
//     oldChildrenKeyMap.set(vNode.key, { vNode, index });
//   });

//   let maxNewIndexSoFar = -1;
//   for (let i = 0; i < newChildren.length; i++) {
//     const childVNode = normalizeVNode(newChildren[i]);

//     if (oldChildrenKeyMap.has(childVNode.key)) {
//       const { vNode ,index } = oldChildrenKeyMap.get(childVNode.key);
//       // 第i个需要查到第i-1个之前，第0个插到第0个之前
//       const curAnchor = i === 0 
//         ? vNode[0].el
//         : vNode[i - 1].el.nextSibling;

//       // patch 主要作用是 el 的复用以及 patchChildren
//       patch(vNode, childVNode, container, anchor);
//       if (index < maxNewIndexSoFar) {
//         container.insertBefore(childVNode.el, curAnchor);
//       } else {
//         maxNewIndexSoFar = index;
//       }
//       oldChildrenKeyMap.delete(childVNode.key);
//     } else {
//       // 新的vNode在旧vNode找不到，证明是新增的vNode，需要mount
//       patch(null, childVNode, container, anchor);
//     }
//   }

// // 旧的vNode在新vNode 找不到，证明旧vNode需要unMount的
//   oldChildren.forEach(vNode => {
//     unMount(vNode);
//   });
// }