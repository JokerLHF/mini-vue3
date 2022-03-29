import { traverseChildren } from "./index";
import { capitalize } from "../../utils";
import { DirectiveAST, ElementAST, ElementTypes, NodeTypes, RootAST } from "../ast";
import { createText } from "./helper";

// ElementAST 的 parent 是 ElementAST 或者 RootAST
export type IElementAstParent = ElementAST | RootAST;

export const resolveElementASTNode = (node: ElementAST, parent: IElementAstParent): string => {
  /**
   * v-if v-else v-else-if
   * v-for
   * v-model 特殊处理
   */
  return handleVIfDirective(node, parent) ||
    handleVForDirective(node, parent) ||
    createElementASTNode(node);
}

/**
 * 模版字符串 astNode: <div v-for="(item,index) in items">{{item}}</div>
 * h(div, {}, 
 *   h(Fragment, {}, [
 *     (item, index) => return h(Text, {}, item)
 *     (item, index) => return h(Text, {}, item)
 *   ])
 * )
 */
const handleVForDirective = (node: ElementAST, parent: IElementAstParent) => {
  // 1. 需要将 v-for 的 directive node 去掉
  const forNode = node.directives && pluck(node.directives, 'for', true);
  // 2. 使用 fragment 包裹, 手动for 循环 items
  if (forNode && forNode.exp) {
    const [args, source] = forNode.exp.content.split(/\sin\s/); // in前后都有空格
    return `h(Fragment, {}, renderList(
      ${source.trim()},
      ${args.trim()} => ${resolveElementASTNode(node, parent)}
    ))`;
  }
}

/**
 * <h1 v-if="ok"></h1>
 * <h2 v-else-if="ok2"></h2>
 * <h3 v-else></h3>
 * 
 * ok 
 *  ? h('h1')
 *  : ok2 ? h('h2') : h('h3');
 */
const handleVIfDirective = (node: ElementAST, parent: IElementAstParent) => {
  // 1. 需要将 v-if, v-else-if 的 directives node 去掉
  const ifNode = node.directives && (
    pluck(node.directives, 'if', true) ||  pluck(node.directives, 'else-if', true)
  );

  // 2. 使用 fragment 包裹, 手动for 循环 items
  if (ifNode) {
    // 3. 递归 resolveElementASTNode，因为一个元素可能有多个指令
    let alternate;
    const consequent = resolveElementASTNode(node, parent);

    const { children } = parent;
    const currentIndex = children.findIndex(child => child === node);
    // 4. 处理兄弟v-else v-else-if 节点
    for (let i = currentIndex + 1; i < children.length; i++) {
      const sibling = children[i];

      // 在 parse 阶段，对于 <div v-if="ok"/>     <p v-else-if="no"/>       <span v-else/>
      // 在同一行但是多个空格会压缩成一个空格 <div v-if="ok"/> <p v-else-if="no"/> <span v-else/>
      // 为了处理上面的例子，需要将空节点删除
      if (sibling.type === NodeTypes.TEXT && !sibling.content.trim()) {
        children.splice(i, 1);
        i--;
        continue;
      }

      if (
        sibling.type === NodeTypes.ELEMENT && sibling.directives &&
        (pluck(sibling.directives, 'else', true) || pluck(sibling.directives, 'else-if', false))
      ) {
        alternate = resolveElementASTNode(sibling, parent);
        children.splice(i, 1);
      }

      // 只用向前寻找一个相临的元素，因此for循环到这里可以立即退出
      break;
    }

    return `${ifNode.exp?.content} ? ${consequent} : ${alternate}`;
  }
}

const pluck = (directives: DirectiveAST[], name: string, remove = false) => {
  const index = directives.findIndex((dir) => dir.name === name);
  const dir = directives[index];
  if (remove && index > -1) {
    directives.splice(index, 1);
  }
  return dir;
}

const createElementASTNode = (node: ElementAST) => {
  const tag =
    node.tagType === ElementTypes.ELEMENT
      ? `"${node.tag}"`
      : `resolveComponent("${node.tag}")`;

  const propsAttr = createPropAttr(node);
  const props = propsAttr.length ? `{ ${propsAttr.join(', ')} }` : '{}';

  const childStr = node.children.length ? traverseChildren(node) : '';
  const children = childStr ? `[${childStr}]` : 'null';
  return `h(${tag}, ${props}, ${children})`;
}

/**
 * 
 * id="foo" v-if="ok" :class="myClass" 的结果如下
 *
 * {
 *   "type": "ATTRIBUTE",
 *   "name": "id",
 *   "value": { "type": "TEXT", "content": "foo" }
 * }
 * 
 * {
 *   "type": "DIRECTIVE",
 *   "name": "if",
 *   "exp": {
 *      type: "SIMPLE_EXPRESSION",
 *      content: "ok",
 *      isStatic: false
 *    }
 * }
 * 
 * {
 *   "type": "DIRECTIVE",
 *   "name": "bind",
 *   "exp": {
 *      type: "SIMPLE_EXPRESSION",
 *      content: "myClass",
 *      isStatic: false
 *    },
 *    "arg": {
 *      type: 'SIMPLE_EXPRESSION', 
 *      content: 'class',
 *      isStatic: true,
 *    }
 * }
 */
const createPropAttr = (node: ElementAST) => {
  const { props = [], directives = [] } = node;
  const propsStr = props.map(item => {
    return `${item.name}: ${createText(item.value)}`
  });

  const DirectivesStr = directives.map(dir => {
    const content = dir.arg?.content;
    switch (dir.name) {
      case 'bind':
        return `${content}: ${createText(dir.exp)}`;
      case 'on':
        if (dir.exp) {
          const eventName = `on${capitalize(content!)}`;
          let exp = dir.exp.content;
          return `${eventName}: ${exp}`;
        }
      default: // 暂时没有什么作用
        return `${dir.name}: ${createText(dir.exp)}`;
    }
  });
  return [
    ...propsStr,
    ...DirectivesStr,
  ];
}