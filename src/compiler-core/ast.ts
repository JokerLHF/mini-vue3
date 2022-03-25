export enum NodeTypes {
  ROOT = 'ROOT',
  TEXT = 'TEXT',
  INTERPOLATION = 'INTERPOLATION',
  ELEMENT = 'ELEMENT',
  ATTRIBUTE = 'ATTRIBUTE',
  DIRECTIVE = 'DIRECTIVE',
  SIMPLE_EXPRESSION = 'SIMPLE_EXPRESSION',
};

export enum ElementTypes {
  ELEMENT = 'ELEMENT',
  COMPONENT = 'COMPONENT',
}

export type ASTChild = ElementAST | TextAST | InterpolationAST;

// 根 AST
export interface RootAST {
  type: NodeTypes.ROOT,
  children: ASTChild[],
}

/**
 *  文本节点：比如 111
 *    111  就是一个文本节点
 */
export interface TextAST {
  type: NodeTypes.TEXT,
  content: string  
}

/**
 * 表达式节点：比如 <div v-if="ok"> bar </div> 中
 *    ok  就是一个动态表达式，指向的是一个变量
 *    bar 就是一个静态表达式，单纯表示一个字符串
 */
export interface ExpressAST {
  type: NodeTypes.SIMPLE_EXPRESSION,
  content: string,
  isStatic: boolean,
}

/**
 * 插槽节点：比如 <div> {{ name }} </div> 中
 *    {{ name }} 就表示一个插槽，其中 name 就是一个表达式节点(动态)
 */
export interface InterpolationAST {
  type: NodeTypes.INTERPOLATION,
  content: ExpressAST,
}

/**
 * 指令节点: 比如 <div v-if="ok" @click="func" :class="myClass" v-bind:class="myClass" />
 *    v-if="ok"               name: "if",  exp: "ok"
 *    @click="func"           name: "on",  arg: "click", exp: "func"
 *    :class="myClass"        name: "bind",  arg: "class", exp: "myClass"
 *    v-bind:class="myClass"  name: "bind",  arg: "class", exp: "myClass"
 */
export interface DirectiveAST {
  type: NodeTypes.DIRECTIVE,
  name: string,
  arg?: ExpressAST,
  exp: ExpressAST,
}

/**
 * TODO：是否支持指令节点？？？？？？？
 * 属性节点: 比如 <div id="foo"> bar </div>
 *   id="foo" 就是一个属性节点, 其中 foo 表示表达式节点（静态）
 */

export interface AttributeAST {
  type: NodeTypes.ATTRIBUTE,
  name: string,
  value: TextAST, // 纯文本节点
};


/**
 * <div id="foo" v-if="ok"></div>
 * <Component id="foo"/>
 */
export interface ElementAST {
  type: NodeTypes.ELEMENT,
  tag: string, // 标签名,
  tagType: ElementTypes, // 是组件还是原生元素,
  props?: AttributeAST[], // 属性节点数组,
  directives?: DirectiveAST[], // 指令数组
  isSelfClosing: boolean, // 是否是自闭合标签,
  children: ASTChild[],
}

export const createRoot = (children: ASTChild[]) => {
  return {
    type: NodeTypes.ROOT,
    children,
  };
}