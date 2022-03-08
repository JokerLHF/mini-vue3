import { computed } from "../computed";
import { reactive } from "../reactive";
import { ref } from "../ref";

export const computedRun = () => {
  example1();
}

// 基本功能: effect 默认执行一次， reactive 数值改变，执行订阅的 effect 列表
const example1 = () => {
  const obj1 = (window as any).obj1 = reactive({ a: 1 });
  const obj2  = (window as any).obj2 = ref(2);
  const res = (window as any).res = computed(() => {
    return obj1.a + obj2.value
  });
  console.log('res', res.value);
}
  