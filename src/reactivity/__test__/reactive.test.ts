import { effect } from "../effect";
import { isReactive, reactive } from "../reactive";

describe("reactive", () => {
  it("1. 判断对象是否被代理", () => {
    const original = { foo: 1 };
    const observed = reactive(original);
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(original)).toBe(false);
  });

  // let a = reactive({ obj: { count: 0 }})
  it("2. 子对象也会被代理", () => {
    const original = { obj: { count: 0 } };
    const observed = reactive(original);
    expect(isReactive(observed.obj)).toBe(true);
    expect(isReactive(observed.obj.count)).toBe(false);
  });

  // let a = reactive(obj), let b = reactive(obj)
  it('3. 不会被代理两次', () => {
    const original = { count: 0 };
    const observed = reactive(original);
    const observed2 = reactive(observed);
    expect(observed).toBe(observed2);
  });

  // reactive(reactive(obj)), 只需要 reactive 一次
  it('4. 重复代理返回相同的值', () => {
    const original = { count: 0 };
    const observed = reactive(original);
    const observed2 = reactive(original);
    expect(observed).toBe(observed2);
  });

  it('5. 按需 reactive', () => {
    let notObserve = { d : 2 };
    const obj = reactive({
      a: { 
        b: 1, 
        c: notObserve,
      },
    });
    effect(() => { console.log(obj.a.b); });
    expect(isReactive(notObserve)).toBe(false);
    expect(isReactive(obj.a.b)).toBe(false);
  });
});
