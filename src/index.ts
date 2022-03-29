import { createApp, render, h, Text, Fragment, nextTick } from './runtime-core'
import { reactive, ref, computed, effect } from './reactivity'
import { compiler } from './compiler-core'; 
import { renderList } from './runtime-core/helper';

export const MiniVue = ((window as any).MiniVue = {
  createApp,
  render,
  h,
  Text,
  Fragment,
  nextTick,
  reactive,
  ref,
  computed,
  effect,
  compiler,
  renderList,
});