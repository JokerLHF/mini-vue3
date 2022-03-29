import { h, render } from ".";
import { Component, RegisterComponent, RendererElement } from "./interface";

let components: RegisterComponent;
export function createApp(rootComponent: Component) {
  components = rootComponent.components || {};
  const app = {
    mount(rootContainer: RendererElement) {
      render(h(rootComponent, {}, null), rootContainer);
    },
  };
  return app;
}

export const resolveComponent = (name: string) => {
  return components && components[name];
}
