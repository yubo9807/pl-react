import { getCurrnetInstance } from "../client";
import { config, setCurrentRoute } from "./create-router";
import type { TreeValue } from "../types";

export let temp = {
  html: '',
  text: '',
  data: {},
  count: null as number,  // 路由经过计数
  done(result: string) {},
}

export function ssrOutlet(url: string, app: ReturnType<typeof getCurrnetInstance>, tree: TreeValue, html: string, replaceText = '<!-- ssr-outlet -->') {
  return new Promise((resolve: (value: string) => void) => {
    setCurrentRoute(url.replace(config.base, ''));
    temp.html = html;
    temp.text = app.renderToString(tree);
    temp.done = result => {
      let template = temp.html;
      const dataStr = `<script>window.${config.ssrDataKey} = ${JSON.stringify(temp.data)}</script>\n`
      const index = template.search('</body>');
      template = template.slice(0, index) + dataStr + template.slice(index);
      const html = template.replace(replaceText, result);
      resolve(html);
    };

    // 没经过 router 组件
    temp.count === null && temp.done(temp.text);
  })
}