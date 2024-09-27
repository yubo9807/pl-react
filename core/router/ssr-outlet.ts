import { Component } from "../client";
import { renderToString, h } from "../server";

export let temp = {
  url: '',
  text: '',
  done(result: string) {}
}

export function ssrOutlet(url: string, app: Component) {
  return new Promise((resolve: (value: string) => void) => {
    temp.url = url;
    temp.text = renderToString(h(app));
    temp.done = (result) => {
      resolve(result);
    };
  })
}