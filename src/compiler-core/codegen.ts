import { capitalize } from "../utils";
import { ASTChild, ASTNode, DirectiveAST, ElementAST, ExpressAST, NodeTypes, TextAST } from "./ast";

/**
 * 将 astNode 变为 h 函数
 */
export const traverseNode = (node: ASTNode) => {
  switch(node.type) {
    case NodeTypes.ROOT:
      return traverseChildren(node.children);
    case NodeTypes.ELEMENT:
      return resolveElementASTNode(node);
    case NodeTypes.TEXT:
      return createTextVNode(node);
    case NodeTypes.INTERPOLATION:
      return createTextVNode(node.content);
  }
}

const createTextVNode = (node: TextAST | ExpressAST) => {
  const child = createText(node);
  return `h(Text, {}, ${child})`;
}

const resolveElementASTNode = (node: ElementAST) => {
  const directives = handleSpecialDirectives(node);
  return directives || createElementASTNode(node);
}

const createElementASTNode = (node: ElementAST) => {
  const tag = JSON.stringify(node.tag);

  const propsAttr = createPropAttr(node);
  const props = propsAttr.length ? `{ ${propsAttr.join(', ')} }` : '{}';

  const childStr = node.children.length ? traverseChildren(node.children) : '';
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
        const eventName = `on${capitalize(content!)}`;
        let exp = dir.exp.content;
        return `${eventName}: ${exp}`;
      default: // 暂时没有什么作用
        return `${dir.name}: ${createText(dir.exp)}`;
    }
  });
  return [
    ...propsStr,
    ...DirectivesStr,
  ];
}

const traverseChildren = (children: ASTChild[]) => {
  const result: string[] = [];
  for (let i = 0; i < children.length; i++) {
    // 在 traverseChildren 之后肯定不会出现 rootNode
    result.push(traverseNode(children[i]) as string);
  }
  return result.length ? result.join(', ') : '';
}

// static 使用 JSON.stringify 加上引号
const createText = ({ content = '', isStatic = true } = {}) => {
  return isStatic ? JSON.stringify(content) : content;
}

/**
 * v-if v-else v-else-if
 * v-for
 * v-model 特殊处理
 */
// 模版字符串 astNode: <div v-for="(item,index) in items">{{item, index}}</div>
// (item, index) => return <div>{{item, index}}</div>
// (item, index) => return <div>{{item, index}}</div>

const handleSpecialDirectives = (node: ElementAST) => {
  // 1. 需要将 v-for 的 ast node 去掉
  const forNode = node.directives && pluck(node.directives, 'for', true);
  // 2. 使用 fragment 包裹, 手动for 循环 items
  if (forNode) {
    const [args, source] = forNode.exp.content.split(/\sin\s/); // in前后都有空格
    return `h(Fragment, {}, renderList(
      ${source.trim()},
      ${args.trim()} => ${createElementASTNode(node)}
    ))`;
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