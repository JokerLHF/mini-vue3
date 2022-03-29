import { RendererElement, ShapeFlags, VNode, VNodeChildAtom } from "../interface";
import { patchProps } from "./patchProps";
import { mountChildren, patchChildren } from "./processChildren";

export const processElement = (oldVNode: VNode | null, newVNode: VNode, container: RendererElement, anchor: RendererElement | null) => {
  // 情况3: newVNode 存在，oldVNode 不存在
  if (!oldVNode) {
    mountElement(newVNode, container, anchor);
    return;
  }
  // 情况2: newVNode oldVNode 都存在，类型相同
  patchElement(oldVNode, newVNode, anchor);
}

const mountElement = (newVNode: VNode, container: RendererElement, anchor: RendererElement | null) => {
  const { type, shapeFlag, children, props } = newVNode;
  const element = document.createElement(type as string);
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {    
    element.textContent = children as string;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // 这里不能传anchor。因为anchor限制的是当前的element
    // 作为本element的children，不用指定anchor，append就行
    mountChildren(children as VNodeChildAtom[], element, null);
  }

  if (props) {
    patchProps(element, {}, props);
  }

  newVNode.el = element;
  // anchor 不存在相当于 container.appendChild(element)
  container.insertBefore(element, anchor);
}

const patchElement = (oldVNode: VNode, newVNode: VNode, anchor: RendererElement | null) => {
  newVNode.el = oldVNode.el!;
  patchProps(newVNode.el, oldVNode.props, newVNode.props);
  patchChildren(oldVNode, newVNode, newVNode.el, anchor);
}

export const unMountElement = (el: RendererElement | null) => {
  el?.parentNode?.removeChild(el);
}