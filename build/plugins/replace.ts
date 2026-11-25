
export function replaceVersion() {
  return {
    name: 'replace-version',

    transform(code, id) {
      return code.replace('process.env.version', `'${process.env.npm_package_version}'`);
    },
  }
}

// 已带这些扩展名的 require 目标视为文件本身，不再补 /index.cjs
const HAS_EXT_RE = /\.(cjs|mjs|js|jsx|ts|tsx|json|node|css|scss|sass|less|svg|png|jpe?g|gif|webp|ico|woff2?|ttf|eot|map)$/i;
// 裸目录：'.' / '..' / './' / '../'，交给 Node 走 package.json 的 main 解析
const BARE_DIR_RE = /^\.\.?\/?$/;

export function replaceModuleName() {
  return {
    name: 'replace-module-name',

    renderChunk(code) {
      // 整条 require('...') / require("...") 原子重写：
      // 1. 用带回调的 String.replace(/regex/g, fn)，避免旧实现里
      //    code.replace(纯字符串, ...) 只替换首个出现位置 + 子串跨行污染
      //    的问题（'..' 命中到 '../utils/index.cjs' 里的那段 '..'）。
      // 2. 每条 require 独立判定，天然幂等，重复执行不会二次追加。
      return code.replace(
        /require\((['"])([^'"]+)\1\)/g,
        (full, quote: string, mod: string) => {
          // 只处理相对路径，外部包（react / fs / dayjs ...）保持原样
          if (!mod.startsWith('.')) return full;
          // 已经带扩展名的（如 ./foo.js、../bar/index.cjs），不动
          if (HAS_EXT_RE.test(mod)) return full;
          // 包根裸目录，不补 /index.cjs
          if (BARE_DIR_RE.test(mod)) return full;
          // 目录形式：补 /index.cjs
          return `require(${quote}${mod}/index.cjs${quote})`;
        }
      );
    }
  }
}
