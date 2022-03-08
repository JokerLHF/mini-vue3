// import { computedRun } from "./reactivity/__test__/computed";
// import { reactiveRun } from "./reactivity/__test__/reactive";
// import { refRun } from "./reactivity/__test__/ref";

// reactiveRun();
// refRun()
// computedRun();

import { h, Text, render, Fragment } from './runtime';

render(
  h('ul', {}, [
    h('li', {}, 'first'),
    h(Fragment, {}, []),
    h('li', {}, 'last'),
  ]),
  document.body
);

setTimeout(() => {
  render(
    h('ul', {}, [
      h('li', {}, 'first'),
      h(Fragment, {}, [h('li', {}, 'middle')]),
      h('li', {}, 'last'),
    ]),
    document.body
  );
}, 5000);

// const vNode = h('ul', {}, [
//   h('li', {}, 'd'),
//   h('li', {}, 'e'),
//   h('li', {}, 'f'),
// ]);

// render(
//   vNode,
//   document.querySelector('#root')!,
// );

// render(
//   h('div', {}, null),
//   document.querySelector('#root')!,
// );

// render(
//   h('div', {}, 1111),
//   document.querySelector('#root')!,
// );

// render(
//   h('div', {}, undefined),
//   document.querySelector('#root')!,
// );

// render(
//   h('div', {}, 'test'),
//   document.querySelector('#root')!,
// );
