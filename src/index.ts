import { createApp, render, h, Text, Fragment, nextTick, resolveComponent, renderList } from './runtime-core'
import { reactive, ref, computed, effect } from './reactivity'

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
  _resolveComponent: resolveComponent,
  _renderList: renderList,
});