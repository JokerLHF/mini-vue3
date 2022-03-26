import { capitalize } from "../utils";
import { ASTChild, ASTNode, ElementAST, ExpressAST, NodeTypes, TextAST } from "./ast";

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
  return `h(Text, null, ${child})`;
}

const resolveElementASTNode = (node: ElementAST) => {
  const tag = JSON.stringify(node.tag);

  const propsAttr = createPropAttr(node);
  const props = propsAttr.length ? `{ ${propsAttr.join(', ')} }` : 'null';

  const childStr = node.children.length ? traverseChildren(node.children) : 'null';

  return `h(${tag}, ${props}, ${childStr})`;
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
    return `${item.name}: ${item.value}`
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
      default: // v-if
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
  return result.length ? `[${result.join(', ')}]` : '';
}

// static 使用 JSON.stringify 加上引号
const createText = ({ content = '', isStatic = true } = {}) => {
  return isStatic ? JSON.stringify(content) : content;
}