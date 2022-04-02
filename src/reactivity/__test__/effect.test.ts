import { effect } from "../effect";
import { isReactive, reactive } from "../reactive";

describe('effect 的单元测试', () => {
  it("1. effect 默认执行一次", () => {
    let value;
    const counter = reactive({ num: 0 });
    effect(() => { value = counter.num });
    expect(value).toBe(0);
  });
  
  it('2. reactive 数值改变, 执行订阅的 effect', () => {
    let value;
    const counter = reactive({ num: 0 });
    effect(() => { value = counter.num });
    counter.num = 10;
    expect(value).toBe(10);
  });

  it('3. reactive 数值改变, 执行订阅的多个 effect 列表', () => {
    const observed = reactive({ count: 0 });
    let value1;
    effect(() => { value1 = observed.count; });
    let value2;
    effect(() => { value2 = observed.count; });
    let value3;
    effect(() => { value3 = observed.count; });
    expect(value1).toBe(0);
    expect(value2).toBe(0);
    expect(value3).toBe(0);
    observed.count++;
    expect(value1).toBe(1);
    expect(value2).toBe(1);
    expect(value3).toBe(1);
  });

  it('4. effect中监听多个响应式对象', () => {
    const observed1 = reactive({ count: 0 });
    const observed2 = reactive({ count: 0 });
    let value;
    effect(() => {
      value = observed1.count + observed2.count;
    });
    expect(value).toBe(0);
    observed1.count++;
    expect(value).toBe(1);
    observed2.count++;
    expect(value).toBe(2);
    observed1.count++;
    observed2.count++;
    expect(value).toBe(4);
  });

  it('5. 嵌套响应式对象', () => {
    let value;
    const observed = reactive({ nested: { num: 0 } });
    effect(() => (value = observed.nested.num));

    expect(value).toBe(0);
    observed.nested.num = 8;
    expect(value).toBe(8);
  });

  it('6. 嵌套effect', () => {
    const nums = reactive({ num1: 0, num2: 10, num3: 100 });
    const dummy = {} as any;
    const childSpy = jest.fn(() => (dummy.num1 = nums.num1));
    const childEffect = effect(childSpy);
    const parentSpy = jest.fn(() => {
      dummy.num2 = nums.num2;
      childEffect();
      dummy.num3 = nums.num3;
    });
    effect(parentSpy);

    expect(dummy).toEqual({ num1: 0, num2: 10, num3: 100 });
    expect(parentSpy).toHaveBeenCalledTimes(1);
    expect(childSpy).toHaveBeenCalledTimes(2);

    // parentSpy不会调用
    nums.num1++;
    expect(dummy).toEqual({ num1: 1, num2: 10, num3: 100 });
    expect(parentSpy).toHaveBeenCalledTimes(1);
    expect(childSpy).toHaveBeenCalledTimes(3);

    // parentSpy和childSpy都会调用
    nums.num2++;
    expect(dummy).toEqual({ num1: 1, num2: 11, num3: 100 });
    expect(parentSpy).toHaveBeenCalledTimes(2);
    expect(childSpy).toHaveBeenCalledTimes(4);

    // parentSpy和childSpy都会调用
    nums.num3++;
    expect(dummy).toEqual({ num1: 1, num2: 11, num3: 101 });
    expect(parentSpy).toHaveBeenCalledTimes(3);
    expect(childSpy).toHaveBeenCalledTimes(5);
  });
});