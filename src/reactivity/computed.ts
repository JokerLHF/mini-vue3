import { effect, EffectFn, track, trigger } from "./effect";
import { isFunction } from "./utils";


export function computed(getterOrOptions: any) {
  let getter, setter;
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    setter = () => {
      console.warn('Write operation failed: computed value is readonly');
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  return new ComputedRefImpl(getter, setter);
}

class ComputedRefImpl {
  private _setter: Function;
  private _value: undefined | EffectFn;
  private _dirty: boolean;
  private _effect: EffectFn;

  constructor(getter: () => void, setter: () => void) {
    this._setter = setter;
    this._value = undefined;
    this._dirty = true; // computed的依赖是否更新
    this._effect = effect(getter, {
      lazy: true,
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true;
        }
      },
    });
  }

  get value() {
    // 依赖更新重新计算，没有更新不计算
    if (this._dirty) {
      this._value = this._effect();
      this._dirty = false;
    }
    return this._value;
  }

  set value(val) {
    this._setter(val);
  }
}

/**
 * computed 跟 effect 功能相似，
 * 1. 默认执行 
 *  effect 默认执行一遍，调用了 reactive || ref 的 get 方法去收集依赖
 *  computed 默认不会执行，等到调用 computed 的 get 方法 才会去调用了 reactive || ref 的 get 方法去收集依赖
 * 2. 修改执行
 *  effect 的依赖项改变， effect 列表就会改变。
 *  但是 computed 不会每一次都执行，只会执行一次随后缓存下来，
 */