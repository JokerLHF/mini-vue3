import { traverseNode } from "./codegen/index";
import { parse } from "./parse";

export const compiler = (content: string) => {
  const ast = parse(content);
  console.log('ast', ast);

  const nodeStr = traverseNode(ast, null);
  console.log('nodeStr', nodeStr);

  // with 作用是在模版中使用 count.value 可以直接变为拿到 ctx.count.value
  // 也可以在 traverseNode 阶段将 count.value 替换成 ctx.count.value, 但是这样比较复杂还有 v-for 情况要考虑
  //      比如 <div v-for="(item,index) in items">{{ item }}</div>, {{ item }} 就不能替换成 ctx.item
  const code = `
  with (ctx) {
    const { h, Text, Fragment, renderList, resolveComponent } = MiniVue;
    return ${nodeStr}
  }`
  return code;
}