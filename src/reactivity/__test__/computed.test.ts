import { computed } from "../computed";
import { reactive } from "../reactive";
import { ref } from "../ref";


describe('computed 的单元测试', () => {
  it('1. 基本功能使用', () => {
    const observed = reactive({ count: 0 });
    const r = ref(10);
    const c = computed(() => r.value + observed.count);
    expect(c.value).toBe(10);

    observed.count++;
    expect(c.value).toBe(11);
    r.value = 20;
    expect(c.value).toBe(21);
  });
});
  