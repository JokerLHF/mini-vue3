import { ASTChild, createRoot, NodeTypes, RootAST } from "../ast";
import { Context } from "../interface";
import { parseElement } from "./parseElement";
import { parseInterpolation } from "./parseInterpolation";
import { parseText } from "./parseText";
import { isVoidTag, isNativeTag } from './helper';

/**
 * 将模版字符串变为 astNode
 */
export const parse = (content: string) => {
  const context = createParserContext(content);
  return createRoot(parseChildren(context));
}

const createParserContext = (content: string): Context => {
  return {
    options: {
      delimiters: ['{{', '}}'],
      isVoidTag,
      isNativeTag,
    },
    source: content,
  };
}

// <div id="foo" v-if="ok"> hello {{name}} </div>
export const parseChildren = (context: Context): ASTChild[] => {
  const astNodes: ASTChild[] = [];
  while(!isEnd(context)) {
    const { source, options } = context;
    let astNode: ASTChild | null = null;
    if (source.startsWith(options.delimiters[0])) {
      astNode = parseInterpolation(context);
    } else if (source[0] === '<') {
      astNode = parseElement(context);
    } else {
      astNode = parseText(context);
    }
    astNode && astNodes.push(astNode);
  }

  removeWhiteSpace(astNodes);
  return astNodes;
}

const isEnd = (context: Context) => {
  const s = context.source;
  return s.startsWith('</') || !s;
}

/**
 * <div> foo
 *        bar
 * </div>
 * 压缩成 <div> foo bar </div>
 * 
 * <div>
 *   <span>a</span>
 *   <span>b</span>
 *   <span>c</span>
 * </div>
 * 此时div 和 span 的间隔会被识别成 空text， 但是本身是不需要的
 * 
 */
const removeWhiteSpace = (nodes: ASTChild[]) => {
  let removedWhitespace = false;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node?.type === NodeTypes.TEXT) {
      // 全是空白的节点
      if (!/[^\t\r\n\f ]/.test(node.content)) {
        const prev = nodes[i - 1];
        const next = nodes[i + 1];
        /**
          * <div>
          *   <span>a</span>
          *   <span>b</span>
          *   <span>c</span>
          * </div>
         */
        if (
          !prev ||
          !next ||
          (prev.type === NodeTypes.ELEMENT &&
            next.type === NodeTypes.ELEMENT &&
            /[\r\n]/.test(node.content))    // 空白加上换行符
        ) {
          removedWhitespace = true;
          nodes.splice(i, 1);
          i--;
        } else {
          /**
           * <div>
           *  <span>a</span>          <span>b</span>
           */
          node.content = ' ';
        }
      } else {
        /**
         * <div> 
         *      foo
         *      bar
         * </div>
         * content由【n个空格 foo n个空格 bar】变为【1个空格 foo 1个空格 bar】 
         */
        node.content = node.content.replace(/[\t\r\n\f ]+/g, ' ');
      }
    }
  }
  return removedWhitespace;
}
