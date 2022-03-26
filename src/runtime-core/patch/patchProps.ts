import { isNumber, isObject, isString } from "../../utils";
import { RendererElement, VNodeProps } from "../interface";

/**
 * TODO：支持 class style onClick
 */
export function patchProps(el: RendererElement, oldProps: VNodeProps, newProps: VNodeProps) {
  for (const key in newProps) {
    if (key === 'key') {
      continue;
    }
    const prev = oldProps[key];
    const next = newProps[key];
    if (prev !== next) {
      patchDomProp(el, key, prev, next);
    }
  }

  for (const key in oldProps) {
    if (key !== 'key' && !(key in newProps)) {
      patchDomProp(el, key, oldProps[key], null);
    }    
  }
}

const patchDomProp = (el: RendererElement, key: string, prevPropVal: any, nextPropVal: any) => {
  switch (key) {
    case 'class':
      handlePatchClass(el, prevPropVal, nextPropVal);
      break;
    case 'style':
      handlePatchStyle(el, prevPropVal, nextPropVal);
      break;
    default:
      handlePatchEvent(el, key, prevPropVal, nextPropVal);
      break;
  }
}

/**
 * 暂时只支持 class 是字符串以及 数字 的情况
 * h('div', { class: 'aaa' }, []);
 */
const handlePatchClass = (el: RendererElement, prevPropVal: any, nextPropVal: any) => {
  if (isString(nextPropVal) || isNumber(nextPropVal)) {
    el.className = `${nextPropVal}`;
  }
}

/**
 * h('div', { style: '' }, []);
 * h('div', { style: null }, []);
 * h('div', { style: undefined }, []);
 * h('div', { style: { color: 'red' } }, []);
 */
const handlePatchStyle = (el: RendererElement, prevPropVal: any, nextPropVal: any) => {
  el.removeAttribute('style');

  // 只支持 style 是对象的情况
  if (isObject(nextPropVal)) {
    for (const key in nextPropVal) {
      el.style[key] = nextPropVal[key];
    }
  }
}

const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)$/;

/**
{
  class: 'a b',
  style: {
    color: 'red',
    fontSize: '14px',
  },
  onClick: () => console.log('click'),
  checked: '',
  custom: false
}
 */
const handlePatchEvent = (el: RendererElement, key: string, prevPropVal: any, nextPropVal: any) => {
  // 事件
  if (/^on[^a-z]/.test(key)) {
    if (prevPropVal !== nextPropVal) {
      const eventName = key.slice(2).toLowerCase();
      if (prevPropVal) {
        el.removeEventListener(eventName, prevPropVal);
      }
      if (nextPropVal) {
        el.addEventListener(eventName, nextPropVal);
      }
    }
  } 
  // 特殊属性
  else if (domPropsRE.test(key)) {
    // <input checked /> 翻译成 props 应该是 { "checked": "" } 它的值是空字符串。 但如果给 input 元素的 checked 直接赋值为空字符串，它实际上是赋值为 false
    if (nextPropVal === '' && typeof el[key] === 'boolean') {
      nextPropVal = true;
    }
    // setAttribute 的值只能是 string， 所以这里用 el[key] 
    el[key] = nextPropVal;
  }
  // 自定义属性
  else {
    // { custom: false }，它的值是空字符串。setAttribute 第二个参数都会变为字符串
    // 这时候采用 setAttribute 会让 false 成为 "false" ，重新新 getAttribute(custom) 其结果仍然为 true， 
    // 所以我们需要进行判断，并且使用removeAttribute
    if (nextPropVal == null || nextPropVal === false) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, nextPropVal);
    }
  }
}