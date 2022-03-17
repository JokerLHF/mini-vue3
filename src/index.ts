// import { computedRun } from "./reactivity/__test__/computed";
// import { reactiveRun } from "./reactivity/__test__/reactive";
// import { refRun } from "./reactivity/__test__/ref";

// reactiveRun();
// refRun()
// computedRun();

import { h, Text, render, Fragment } from './runtime';
// props 的
// render(
//   h('div', {}, [

//     h('div', {
//       class: 'a b',
//       style: {
//         color: 'red',
//         fontSize: '14px',
//       },
//       onClick: () => console.log('click'),
//       custom: true
//     }, 'first'),

//     h('input', {
//       checked: '',
//     }, 'second'),
//   ]),
//   document.body,
// );

// render(
//   h('ul', {}, [
//     h('li', {}, 'first'),
//     h('li', {}, 'second'),
//     h('li', {}, 'third'),
//     h('li', {}, 'last'),
//   ]),
//   document.body,
// );

// setTimeout(() => {
//   render(
//     h('ul', {}, [
//       h('li', {}, 'first'),
//       h('li', {}, 'second'),
//       h('li', {}, 'last'),
//       h('li', {}, 'newLAst'),
//     ]),
//     document.body,
//   );
// }, 3000);

// Diff情况1
// render(
//   h('ul', {}, [
//     h('li', { key: 'first' }, 'first'),
//     h('li', { key: 'second' }, 'second'),
//   ]),
//   document.body,
// );

// setTimeout(() => {
//   render(
//     h('ul', {}, [
//       h('li', { key: 'first' }, 'newFirst'),
//       h('li', { key: 'newInsert' }, 'newInsert'),
//       h('li', { key: 'newInsert2' }, 'newInsert2'),
//       h('li', { key: 'second' }, 'newSecond'),
//     ]),
//     document.body,
//   );
// }, 3000);

// // Diff 情况2 
// render(
//   h('ul', {}, [
//     h('li', { key: 'first' }, 'first'),
//     h('li', { key: 'second' }, 'second'),
//     h('li', { key: 'third' }, 'third'),
//     h('li', { key: 'four' }, 'four'),
//   ]),
//   document.body,
// );

// setTimeout(() => {
//   render(
//     h('ul', {}, [
//       h('li', { key: 'first' }, 'newFirst'),
//       h('li', { key: 'four' }, 'newFour'),
//     ]),
//     document.body,
//   );
// }, 3000);

// Diff 情况3
render(
  h('ul', {}, [
    h('li', { key: 'first' }, 'first'),
    h('li', { key: 'second' }, 'second'),
    h('li', { key: 'third' }, 'third'),
    h('li', { key: 'four' }, 'four'),
    h('li', { key: 'six' }, 'six'),
  ]),
  document.body,
);

setTimeout(() => {
  render(
    h('ul', {}, [
      h('li', { key: 'four' }, 'four'),
      h('li', { key: 'first' }, 'first'),
      h('li', { key: 'second' }, 'second'),
      h('li', { key: 'third' }, 'third'),
      h('li', { key: 'five' }, 'five'),
    ]),
    document.body,
  );
}, 3000);