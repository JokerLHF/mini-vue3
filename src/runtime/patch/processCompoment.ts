import { patch, unMount } from "./index";
import { effect } from "../../reactivity/effect";
import { Component, RendererElement, VNode, JSONObject, ComponentInstance } from "../interface";
import { normalizeVNode } from "../vNode";
import { shouldUpdateComponent } from "../helper";

/**
 * 组件的更新分为主动更新和被动更新
 *   主动更新：组件内部的 reactive 数据更新
 *   被动更新：父组件 props 改变，造成子组件更新 
 */
export const processComponent = (oldVNode: VNode | null, newVNode: VNode, container: RendererElement, anchor: RendererElement | null) => {
  // 情况3: newVNode 存在，oldVNode 不存在
  if (!oldVNode) {
    mountComponent(newVNode, container, anchor);
    return;
  }
  // 情况2: newVNode oldVNode 都存在，类型相同 【被动更新】
  if (shouldUpdateComponent(oldVNode, newVNode)) {
    patchComponent(oldVNode, newVNode);
  }
}


export const mountComponent = (newVNode: VNode, container: RendererElement, anchor: RendererElement | null) => {
  const instance: ComponentInstance = {
    type: newVNode.type as Component,
    props: {},
    setupState: {},
    ctx: null,
    subTree: null,
    isMounted: true,
    next: null,
    update: null,
  };

  // 为了在 update 的时候能够调用 instanceUpdate，所以在 vNode 增加字段
  newVNode.component = instance;

  setupComponent(instance, newVNode);

  setupRenderEffect(instance, newVNode, container, anchor);
}

const patchComponent = (oldVNode: VNode, newVNode: VNode) => {
  newVNode.component = oldVNode.component!;
  // 被动更新 oldVNode newVNode 都存在，但是因为更新代码写在 mountComponent 中，所以里面的 newVNode 其实是这一次的 oldVNode。
  // 但是我们是需要对最新的 vNode 进行 update，所以这里做一下处理
  newVNode.component.next = newVNode;
  // 调用【被动更新】
  newVNode.component.update?.()
}

/**
 * parentComponent 传入 parentProps: { foo: 'foo', bar: 'bar' }
 * childComponent 只声明了 props: ['foo']
 * 那么在 childComponent 的 ctx 是获取不到 bar 的，
 */
 const getProps = (instance: ComponentInstance, newVNode: VNode) => {
  const vNodeProps = newVNode.props;
  const propsList = instance.type.props || [];
  const newProps: JSONObject = {};
  for (let key in vNodeProps) {
    if (propsList.includes(key)) {
      newProps[key] = vNodeProps[key];
    }
  }
  return newProps;
}

const setupComponent = (instance: ComponentInstance, newVNode: VNode) => {
  const componentType = instance.type;

  instance.props = getProps(instance, newVNode);
  instance.setupState = componentType.setup?.(instance.props) || {};

  // ctx 可以访问到 props 和 setup 返回的所有东西
  instance.ctx = {
    ...instance.props,
    ...instance.setupState,
  };
}

const setupRenderEffect = (instance: ComponentInstance, newVNode: VNode, container: RendererElement, anchor: RendererElement | null) => {
  instance.update = effect(() => {  
    const componentType = instance.type;
    // mount
    if (instance.isMounted) {
      const subTree = instance.subTree = normalizeVNode(
        componentType.render(instance.ctx!)
      );
  
      patch(null, subTree, container, anchor);
      newVNode.el = subTree.el;
      instance.isMounted = false;
      return;
    }
    // update
    // update【被动更新】
    if (instance.next) {
      newVNode = instance.next;
      instance.next = null;
      // 被动更新大部分是由于 props 改变造成的，因为 next 是新的 VNode，所以需要重新计算
      setupComponent(instance, newVNode);
    }
  
    const prev = instance.subTree;
    const subTree = (instance.subTree = normalizeVNode(
      componentType.render(instance.ctx!)
    ));
    patch(prev, subTree, container, anchor);
    newVNode.el = subTree.el;
  });
}

export const unMountComponent = (prevVNode: VNode) => {
  unMount(prevVNode.component?.subTree as VNode);
}