import { ASTChild, createRoot } from "../ast";
import { Context } from "../interface";
import { parseElement } from "./parseElement";
import { parseInterpolation } from "./parseInterpolation";
import { parseText } from "./parseText";
import { isVoidTag, isNativeTag } from './helper';

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
export const parseChildren = (context: Context) => {
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
  return astNodes;
}

const isEnd = (context: Context) => {
  const s = context.source;
  return s.startsWith('</') || !s;
}


