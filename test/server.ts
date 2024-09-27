import { createServer } from 'http';
import App from './app';
import { ssrOutlet } from "~/core/router";
import { extname, resolve } from 'path';
import { readFile, readFileSync } from 'fs';

const mimeTypes = {
  'text/html': ['.html'],
  'text/css': ['.css'],
  'application/javascript;': ['.js'],
  'application/json': ['.json'],
  'image/vnd.microsoft.icon': ['.ico'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'application/pdf': ['.pdf'],
  'font/woff2': ['.worf2'],
  'font/woff': ['.worf'],
  'font/ttf': ['.ttf'],
  'application/octet-stream': ['.mp4', '.avi'],
}

/**
 * 获取所有静态文件的后缀
 * @returns 
 */
export function getStaticFileExts() {
  const exts = Object.values(mimeTypes).flat();
  return ['.gz'].concat(exts);
}

/**
 * 获取文件 content-type 类型
 * @param filename 
 * @returns 
 */
export function getMimeType(ext: string) {
  ext = ext.toLowerCase();
  let type: string = null;
  for (const key in mimeTypes) {
    if (mimeTypes[key].includes(ext)) {
      type = key;
      break;
    }
  }
  return type;
}

const html = readFileSync(resolve(__dirname, 'index.html'), 'utf-8');

const server = createServer(async (req, res) => {

  const url = req.url;
  const ext = extname(url);

  if (getStaticFileExts().includes(ext)) {
    // 静态资源
    const filename = resolve(__dirname, url.slice(1));

    readFile(filename, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      } else {
        const contentType = getMimeType(ext);
        contentType && res.setHeader('Content-Type', contentType);
        res.write(content);
        res.end();
      }
    });
  } else {
    // 服务端渲染
    ssrOutlet(url, App).then(content => {
      res.write(html.replace('<!--ssr-outlet-->', content));
      res.end();
    })
  }

});

const port = 3000;
server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
