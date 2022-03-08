import { track, trigger } from "./effect";
import { hasChanged } from "./utils";

export function isRef(value: any) {
  return !!(value && value.__isRef);
}

export function ref(value: any) {
  // 处理 ref(ref(1))
  if (isRef(value)) {
    return value;
  }

  return new RefImpl(value);
}

class RefImpl {
  private _value: any;
  private __isRef: boolean;

  constructor(value: any) {
    this._value = value;
    this.__isRef = true;
  }

  get value() {
    track(this, 'value');
    return this._value;
  }

  set value(val) {
    // 处理重复设置同一个值
    if (hasChanged(val ,this.value)) {
      // TODO: 考虑 val 是对象
      this._value = val;
      trigger(this, 'value');
    }
  };
}

