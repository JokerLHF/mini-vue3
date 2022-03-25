
import { NodeTypes, TextAST } from "../ast";
import { Context } from "../interface";
import { parseTextData } from "./helper";

/**
 * 情况1: hello </div>, 遇到 </ 就表示解析结束
 * 情况2: hello {{ name }}, 遇到 {{ 就表示解析结束
 * 情况3: hello, 只有单纯的字符串，根据长度解析完结束
 */
export const parseText = (context: Context): TextAST => {
  const { source, options } = context;
  const endTokens = [options.delimiters[0], '</'];

  let endIndex = source.length;
  for (let i = 0; i < endTokens.length; i++) {
    const index = source.indexOf(endTokens[i]);
    // endIndex > index 是需要要 endIndex 尽可能的小
    // hi, {{123}} </div>
    // 那么这里就应该停到 {{ 这里，而不是停到 <div 这里
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }

  const content = parseTextData(context, endIndex);

  return {
    type: NodeTypes.TEXT,
    content,
  }
}