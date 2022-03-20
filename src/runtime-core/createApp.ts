import { h, render } from ".";
import { Component, RendererElement } from "./interface";

export function createApp(rootComponent: Component) {
  const app = {
    mount(rootContainer: RendererElement) {
      render(h(rootComponent, {}, null), rootContainer);
    },
  };
  return app;
}
