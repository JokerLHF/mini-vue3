import { parseChildren } from ".";
import { AttributeAST, DirectiveAST, ElementAST, ElementTypes, NodeTypes } from "../ast";
import { Context } from "../interface";
import { advanceBy, advanceSpaces, isComponent, parseTextData } from "./helper";


/**
 *  <div id="foo" v-if="ok" />
 */

export const parseElement = (context: Context): ElementAST | null => {
  // Start tag.
  const element = parseTag(context);

  if (!element) {
    return null;
  }

  if (element.isSelfClosing || context.options.isVoidTag(element.tag)) {
    return element;
  }

  // Children.
  element.children = parseChildren(context);

  // End tag.
  parseTag(context);

  return element;
}

/**
 * <div       id="foo" v-if="ok"></div>
 * <Component id="foo" />
 */
const parseTag = (context: Context): ElementAST | null => {
  // 匹配到 <div 或者 </div 或者 <Component
  const match = /^<\/?([a-z][^\t\r\n\f />]*)/i.exec(context.source);
  if (!match) {
    return null;
  }
  // 拿到 tag
  const tag = match[1];
  // 判断 tag 类型
  const tagType = isComponent(tag, context)
    ? ElementTypes.COMPONENT
    : ElementTypes.ELEMENT;

  // 去掉 <div 或者 </div 或者 <Component
  advanceBy(context, match[0].length);
  // 去掉多余的空格
  advanceSpaces(context);
  
  // Attributes.
  const attribute = parseAttributes(context);

  // 判断是否闭合
  const isSelfClosing = context.source.startsWith('/>');
  // 闭合去掉 /> 不是闭合去掉 >
  advanceBy(context, isSelfClosing ? 2 : 1);

  return {
    type: NodeTypes.ELEMENT,
    tag,
    tagType,
    props: attribute?.props,
    directives: attribute?.directives,
    isSelfClosing,
    children: [],
  };
}

/**
 * id="foo" v-if="ok"></div>
 * id="foo" v-if="ok" />
 */
const parseAttributes = (context: Context) => {
  const props = [];
  const directives = [];
  while (
    context.source.length &&
    !context.source.startsWith('>') &&
    !context.source.startsWith('/>')
  ) {
    const attr = parseAttribute(context);
    if (!attr) {
      break;
    }
    if (attr.type === NodeTypes.ATTRIBUTE) {
      props.push(attr);
    } else {
      directives.push(attr);
    }
  }
  return { props, directives };
}


/**
 * v-if="ok" @click="func" :class="myClass" v-bind:class="myClass" id="foo" />
 *    v-if="ok"               name: "v-if",  value: "ok"
 *    @click="func"           name: "@click", value: "func"
 *    :class="myClass"        name: ":class",  value: "myClass"
 *    v-bind:class="myClass"  name: "v-bind:class",  value: "myClass"
 *    v-else                  name: "else", 
 *    id="foo"                name: "id",    value: "foo"
 */

const parseAttribute = (context: Context): AttributeAST | DirectiveAST | null => {
  // name判断很宽除了下述几个字符外都支持 匹配 id 或者 v-if
  const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source);
  if (!match) {
    return null;
  }
  // 拿到 name
  const name = match[0];
  advanceBy(context, name.length);

  // Value
  // advanceSpaces考虑的情况是: id="   foo"      v-if="ok"></div>
  let value;
  if (context.source[0] === '=') {
    advanceBy(context, 1);
    advanceSpaces(context);
    value = parseAttributeValue(context);
    advanceSpaces(context);
  }

  // Directive
  if (/^(v-|:|@)/.test(name)) {
    let dirName, argContent;
    if (name[0] === ':') {
      dirName = 'bind';
      argContent = name.slice(1);
    } else if (name[0] === '@') {
      dirName = 'on';
      argContent = name.slice(1);
    } else if (name.startsWith('v-')) {
      [dirName, argContent] = name.slice(2).split(':');
    }

    if (!dirName) {
      return null;
    }

    return {
      type: NodeTypes.DIRECTIVE,
      name: dirName,
      exp: value ? {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: value.content,
        isStatic: false,
      } : undefined,
      arg: argContent ? {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: argContent,
        isStatic: true,
      } : undefined,
    };
  }

  if (!value) {
    return null;
  }

  // Attribute
  return {
    type: NodeTypes.ATTRIBUTE,
    name,
    value: {
      type: NodeTypes.TEXT,
      content: value.content,
    },
  };
}

// 不考虑没有引号的情况
const  parseAttributeValue = (context: Context) => {
  const quote = context.source[0];
  // 删除 “
  advanceBy(context, 1);

  const endIndex = context.source.indexOf(quote);
  const content = parseTextData(context, endIndex);

  // 删除 ”
  advanceBy(context, 1);

  return { content };
}
