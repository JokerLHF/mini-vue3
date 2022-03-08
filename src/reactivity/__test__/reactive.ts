import { effect } from "../effect";
import { reactive } from "../reactive";

export const reactiveRun = () => {
  example1();
  example2();
  example3();
  example4();
  example5();
  example6();
}

// 基本功能: effect 默认执行一次， reactive 数值改变，执行订阅的 effect 列表
const example1 = () => {
  const obj = (window as any).obj = reactive({ a: 1, b: 2 });
  effect(() => {
    console.log('effect-a', obj.a);
  });

  effect(() => {
    console.log('effect-b', obj.b);
  });

  effect(() => {
    console.log('effect-a&b', obj.b, obj.a);
  });
}

/**
 * 功能完善1：reactive 重复修改为同一个值，不会重复执行 effect 
 * const obj = reactive({ a: 1 }); 
 * obj.a = 1; obj.a = 1;
 */
const example2 = () => {
  const obj = (window as any).obj = reactive({ a: 1 });
  effect(() => {
    console.log('effect-a', obj.a);
  });
}

/**
 * 功能完善2：reactive(reactive(obj)), 只需要 reactive 一次
 */
 const example3 = () => {
  const obj = (window as any).obj = reactive(reactive({ a: 1 }));
  effect(() => {
    console.log('effect-a', obj.a);
  });
}

/**
 * 功能完善3：let a = reactive(obj), let b = reactive(obj) 相同对象不需要重复 reactive
 */
 const example4 = () => {
  const obj = { a: 1 };
  let obj1 = reactive(obj);
  let obj2 = reactive(obj);
  effect(() => {
    console.log('effect-a', obj1.a, obj2.a);
  });
}

/**
 * 功能完善4：深层对象的 reactive
 */
 const example5 = () => {
  const obj = (window as any).obj = reactive({
    a: {
      b: 1,
    }
  });
  effect(() => {
    console.log('effect-a', obj.a.b);
  });
}

/**
 * 功能完善5：嵌套 effect
 */
 const example6 = () => {
  const obj = (window as any).obj = reactive({
    a: 1,
    b: 2,
  });

  effect(() => {
    effect(() => {
      console.log('effect-b', obj.b);
    })
    console.log('effect-a', obj.a);
  });
}

/**
 * TODO: 功能完善6：数组
 */
//  const example7 = () => {
//   const obj = (window as any).obj = reactive([1, 2, 3]);

//   effect(() => {
//     effect(() => {
//       console.log('effect-b', obj.b);
//     })
//     console.log('effect-a', obj.a);
//   });
// }