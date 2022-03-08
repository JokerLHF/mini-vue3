import { effect } from "../effect";
import { ref } from "../ref";

export const refRun = () => {
  example1();
  example2();
}

// 基本功能: effect 默认执行一次， reactive 数值改变，执行订阅的 effect 列表
const example1 = () => {
  const obj = (window as any).obj1 = ref(1);
  effect(() => {
    console.log('effect-value1', obj.value);
  });
}

// 完善功能: ref(ref(1))
const example2 = () => {
  const obj = (window as any).obj2 = ref(ref(3));
  effect(() => {
    console.log('effect-value2', obj.value);
  });
}
  