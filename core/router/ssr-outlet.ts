import { renderToString } from "../server";
import type { TreeValue } from "../types";
import { config } from "./create-router";

export let temp = {
  url:  '',
  html: '',
  text: '',
  data: {},
  done(result: string) {}
}

export function ssrOutlet(url: string, tree: TreeValue, html: string, replaceText = '<!-- ssr-outlet -->') {
  return new Promise((resolve: (value: string) => void) => {
    temp.url = url;
    temp.html = html;
    temp.text = renderToString(tree);
    temp.done = result => {
      let template = temp.html;
      const dataStr = `<script>window.${config.ssrDataKey} = ${JSON.stringify(temp.data)}</script>\n`
      const index = template.search('</body>');
      template = template.slice(0, index) + dataStr + template.slice(index);
      const html = template.replace(replaceText, result);
      resolve(html);
    };
  })
}