import { Context } from "../interface";

/**
 * 拿到 source 的 第0个字符 到 第length个字符,
 * 并且 将 source 向前推进到以 length 开始
 */
export const parseTextData = (context: Context, length: number) => {
  const rawText = context.source.slice(0, length);
  advanceBy(context, length);
  return rawText;
}

/**
 * 将 source 向前推进到以 numberOfCharacters 开始
 * 比如 source = 'abcde', 那么 advanceBy(context, 3) 
 * 意思就是将 'abcde' 向前推进到以第3个字符 d 开始, 所以 source='de'
 */
export const advanceBy = (context: Context, numberOfCharacters: number) => {
  const { source } = context;
  context.source = source.slice(numberOfCharacters);
}

/**
 * 去掉空格，比如:
 * [空格1, 空格2，空格3]id="foo" /> 变为 id="foo" />
 */
export const advanceSpaces = (context: Context) => {
  const match = /^[\t\r\n\f ]+/.exec(context.source);
  if (match) {
    advanceBy(context, match[0].length);
  }
}

export const isComponent = (tag: string, context: Context) => {
  const { options } = context;
  return !options.isNativeTag(tag);
}

// html 原生标签
const HTML_TAGS =
  'html,body,base,head,link,meta,style,title,address,article,aside,footer,' +
  'header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,div,dd,dl,dt,figcaption,' +
  'figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,' +
  'data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,s,samp,small,span,strong,sub,sup,' +
  'time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,' +
  'canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,' +
  'th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,' +
  'option,output,progress,select,textarea,details,dialog,menu,' +
  'summary,template,blockquote,iframe,tfoot';

// 可以自闭合的标签
const VOID_TAGS =
  'area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr';

const makeMap = (str: string) => {
  const map = {} as any;
  str.split(',').forEach(item => {
    map[item] = true;
  });
  return (val: string) => !!map[val];
}

export const isVoidTag = makeMap(VOID_TAGS);
export const isNativeTag = makeMap(HTML_TAGS);