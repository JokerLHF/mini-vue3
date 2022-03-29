import { ASTNode, ElementAST, ExpressAST, NodeTypes, RootAST, TextAST } from "../ast";
import { IElementAstParent, resolveElementASTNode } from "./createElementAST";
import { createText } from "./helper";

/**
 * rootAst 的 parent 是 null
 * ElementAST 的 parent 是 ElementAST 或者 RootAST
 * textAst 的 parent 是 ElementAST 或者 RootAST
 * 将 astNode 变为 h 函数
 */
export const traverseNode = (node: ASTNode, parent: IElementAstParent | null) => {
  switch(node.type) {
    case NodeTypes.ROOT:
      const childStr = node.children.length ? traverseChildren(node) : '';
      return childStr ? `[${childStr}]` : 'null';
    case NodeTypes.ELEMENT:
      return resolveElementASTNode(node, parent!);
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

export const traverseChildren = (node: RootAST | ElementAST) => {
  const { children } = node;
  const result: string[] = [];
  for (let i = 0; i < children.length; i++) {
    // 在 traverseChildren 之后肯定不会出现 rootNode
    result.push(traverseNode(children[i], node) as string);
  }
  return result.length ? result.join(', ') : '';
}

