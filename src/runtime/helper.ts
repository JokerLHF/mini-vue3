import { JSONObject, VNode } from "./interface";

export const isSameVNode = (oldVNode: VNode, newVNode: VNode) => {
  return oldVNode.type === newVNode.type && oldVNode.key === newVNode.key;
}

export function shouldUpdateComponent(prevVNode: VNode, nextVNode: VNode) {
  const { props: prevProps } = prevVNode;
  const { props: nextProps } = nextVNode;

  // 核心：只要是 props 发生改变了，那么这个 component 就需要更新
  // 在 hasPropsChanged 会做更细致的对比检测
  return hasPropsChanged(prevProps, nextProps);
}

function hasPropsChanged(prevProps: JSONObject, nextProps: JSONObject): boolean {
  // 依次对比每一个 props.key

  // 提前对比一下 length ，length 不一致肯定是需要更新的
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }

  // 只要现在的 prop 和之前的 prop 不一样那么就需要更新
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    if (nextProps[key] !== prevProps[key]) {
      return true;
    }
  }
  return false;
}
