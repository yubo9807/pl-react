import { TreeValue } from "../client";
import { renderToString } from "../server";

export let temp = {
  url: '',
  html: '',
  text: '',
  done(result: string) {}
}

export function ssrOutlet(url: string, tree: TreeValue, html: string, replaceText = '<!-- ssr-outlet -->') {
  return new Promise((resolve: (value: string) => void) => {
    temp.url = url;
    temp.html = html;
    temp.text = renderToString(tree);
    temp.done = result => {
      const html = temp.html.replace(replaceText, result);
      resolve(html);
    };
  })
}