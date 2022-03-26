import { traverseNode } from "./codegen";
import { parse } from "./parse";

export const compiler = (content: string) => {
  const ast = parse(content);
  return traverseNode(ast);
}