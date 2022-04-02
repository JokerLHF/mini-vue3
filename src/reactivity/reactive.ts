import { track, trigger } from "./effect";
import { hasChanged, isObject } from "./utils";

const reactiveMap = new WeakMap();

export function isReactive(target: any) {
  return !!target.__isReactive;
}

export const reactive = (target: any): any => {

  // 只处理对象
  if (!isObject(target)) {
    return target;
  }

  // 处理 let a = reactive(obj), let b = reactive(obj)
  if (reactiveMap.has(target)) {
    return reactiveMap.get(target);
  }

  // 处理 reactive(reactive(obj)) 返回 true 的一定已经经过 proxy
  if (isReactive(target)) {
    return target;
  }

  const proxy = new Proxy(target, {
    get(target, key) {
      // console.log('proxy-get', target, key);
      if (key === '__isReactive') {
        return true;
      }
      const res = Reflect.get(target, key);
      track(target, key);
      // 处理 reactive({ a: { b: 1 }}) 深层对象
      return isObject(res) ? reactive(res): res;
    },
    set(target, key, val) {
      // console.log('proxy-set', target, key, val);
      const oldValue = target[key];
      const res = Reflect.set(target, key, val);
      // 处理 const obj = reactive({ a: 1 }); obj.a = 1; obj.a = 1; 重复修改同一个值不会重复执行 effect
      if (hasChanged(val, oldValue)) {
        trigger(target, key);
      }
      return res;
    }
  });

  reactiveMap.set(target, proxy);
  return proxy;
}


/**
 * proxy 有几个需要注意的点
 * obj.a.b 在 get 阶段有两步: 
 *   1. obj.a (target: obj, key: a)
 *   2. a.b (target: a, key: b)
 * obj.a.b = 1 在 set 阶段只有一步
 *   1. a.b（target：a, key: b）
 */