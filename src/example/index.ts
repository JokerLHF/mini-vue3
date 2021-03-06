import { MiniVue } from "../index";
const { ref, createApp, h, reactive, effect } = MiniVue;

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
// render(
//   h('ul', {}, [
//     h('li', { key: 'first' }, 'first'),
//     h('li', { key: 'second' }, 'second'),
//     h('li', { key: 'third' }, 'third'),
//     h('li', { key: 'four' }, 'four'),
//     h('li', { key: 'six' }, 'six'),
//   ]),
//   document.body,
// );

// setTimeout(() => {
//   render(
//     h('ul', {}, [
//       h('li', { key: 'four' }, 'four'),
//       h('li', { key: 'first' }, 'first'),
//       h('li', { key: 'second' }, 'second'),
//       h('li', { key: 'third' }, 'third'),
//       h('li', { key: 'five' }, 'five'),
//     ]),
//     document.body,
//   );
// }, 3000);


// component 主动更新
// const com = {
//   setup() {
//     const count = ref(0);
//     const add = () => count.value++;
//     return {
//       count,
//       add,
//     };
//   },
//   render(ctx: any) {
//     return [
//       h('div', {}, ctx.count.value),
//       h(
//         'button',
//         {
//           onClick: ctx.add,
//         },
//         'add'
//       ),
//     ];
//   },
// }

// render(h(com), document.body);

// component 被动更新
// const Child = {
//   props: ['foo'],
//   render(ctx: any) {
//     return [h('div', { class: 'a', id: ctx.bar }, ctx.foo)];
//   },
// };

// const Parent = {
//   setup() {
//     const vnodeProps = reactive({
//       foo: 'foo',
//       bar: 'bar',
//     });
//     const changeProps = () => {
//       vnodeProps.foo = `changeBar+${Math.random()}`
//     };
//     return { vnodeProps, changeProps };
//   },
//   render(ctx: any) {
//     return [
//       h(Child, ctx.vnodeProps, null),
//       h(
//         'button',
//         { onClick: ctx.changeProps },
//         'changeProps'
//       ),
//     ];
//   },
// };

// render(h(Parent, {}, null), document.body);


// component 被动更新 props 没有变化
// const Child = {
//   props: ['foo'],
//   render(ctx: any) {
//     return [h('div', { class: 'a' }, ctx.foo)];
//   },
// };

// const Parent = {
//   setup() {
//     const vnodeProps = reactive({
//       foo: 'foo',
//     });
//     const count = ref(0);
//     const add = () => count.value++;
//     return {
//       count,
//       add,
//       vnodeProps
//     };

//   },
//   render(ctx: any) {
//     return [
//       h(Child, ctx.vnodeProps, null),
//       h('div', {}, ctx.count.value),
//       h(
//         'button',
//         { onClick: ctx.add },
//         'add'
//       ),
//     ];
//   },
// };

// render(h(Parent, {}, null), document.body);

const Child = {
  props: ['count'],
  render(ctx: any) {
    return h('div', { class: 'a' }, ctx.count.value);
  },
};

const Comp = {
  setup() {
    const count = ref(1);
    const add = () => {
      count.value++;
    };

    const obj = reactive({ a: 1 });
    effect(() => {
      console.log('effect', obj.a);
      obj.a++;
    });
    return {
      count,
      add,
      items: [1, 2, 3],
      ok: false,
      ok2: false,
      ok3: true,
    };
  },
  components: {
    Child,
  },
  template: `
    <div v-for="(item,index) in items">{{item}}</div>
    <h1 v-if="ok">h1</h1>
    <h2 v-else-if="ok2">h2</h2>
    <h3 v-else-if="ok3">h3</h3>
    <h4 v-else>h4</h4>
    <div>11</div>
    <Child :count="count" />
  `,
  // render(ctx: any) {
  //   console.log('render');
  //   return [
  //     h('div', {}, `count: ${ctx.count.value}`),
  //     h('div'),
  //     h(Text),
  //     h(
  //       'button',
  //       {
  //         onClick: ctx.add,
  //       },
  //       'add'
  //     ),
  //   ];
  // },
};

createApp(Comp).mount(document.body);