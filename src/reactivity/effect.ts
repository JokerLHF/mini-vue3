
// 表示函数对象
export interface EffectFn { 
  (): any;
  scheduler?: (effect: EffectFn) => void; 
}

let activeEffect: EffectFn | undefined = undefined;
const effectStack: EffectFn[] = [];

interface IOptions {
  lazy?: boolean;
  scheduler?: (effect: EffectFn) => void;
}

export function effect(fn: () => void, options?: IOptions) {
  const effectFn = () => {
    try {
      // 处理：嵌套 effect
      effectStack.push(effectFn);
      activeEffect = effectFn;
      return fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
  };

  effectFn.scheduler = options?.scheduler;

  // 是否默认执行
  if (!options?.lazy) {
    effectFn();
  }

  return effectFn;
}

/**
 * const obj = {
 *  a: 1,
 *  b: 2
 * };
 * effect(() => console.log(obj.a));
 * effect(() => console.log(obj.b));
 * 
 * const targetMap = {
 *  [obj]: {
 *    a: [effect1, ...],
 *    b: [effect2, ....]
 *  }
 * }
 * 
 * {
 *  [target]: {
 *    [key]: [effect1, effect2],
 *  }
 * }
 */

// 依赖收集
const targetMap = new WeakMap<
  any,
  Map<string | symbol, Set<EffectFn>>
>();

export const track = (target: any, key: string | symbol) => {
  if (!activeEffect) {
    return;
  }
  // 初始化
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  // 初始化
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  dep.add(activeEffect);
  console.log('track', targetMap);
}

// 依赖执行
export const trigger = (target: any, key: string | symbol) => {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  let dep = depsMap.get(key);
  if (!dep) {
    return;
  }
  console.log('trigger', targetMap);

  dep.forEach(fn => {
    fn.scheduler ? fn.scheduler(fn) : fn();
  })
}