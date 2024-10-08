import { rollup } from 'rollup';
import { replaceVersion } from './plugins/replace';
import { terser } from 'rollup-plugin-terser';
import typescript2 from 'rollup-plugin-typescript2';

async function build(minifay: boolean) {
  const bundle = await rollup({
    input: `core/reactivity/index.ts`,
    plugins: [
      typescript2({
        tsconfig: 'tsconfig.json',
      }),
      replaceVersion(),
      minifay && terser(),
    ],
  })
  await bundle.write({
    format: 'es',
    file: `dist/reactivity${minifay ? '.min' : ''}.js`,
  });
  bundle.close();
}

build(false);
build(true);
