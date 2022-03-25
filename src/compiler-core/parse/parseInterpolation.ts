import { InterpolationAST, NodeTypes } from "../ast";
import { Context } from "../interface";
import { advanceBy, parseTextData } from "./helper";

/**
 *  {{ name }}
 */
export const parseInterpolation = (context: Context): InterpolationAST => {
  const [open, close] = context.options.delimiters;
  // 去掉 {{
  advanceBy(context, open.length);
  // 找到 }} 的具体位置
  const closeIndex = context.source.indexOf(close);
  // 拿到 name 并且在 source 中删除 name
  const content = parseTextData(context, closeIndex);
  // 去掉 }}
  advanceBy(context, close.length);
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      isStatic: false,
      content,
    },
  }
}
