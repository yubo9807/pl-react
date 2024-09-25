import { renderToString, h } from "~/core/server";
import App from './app';

const text = renderToString(h(App))
console.log(text);