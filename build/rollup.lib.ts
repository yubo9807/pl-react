import { rollup } from 'rollup';
import typescript2 from 'rollup-plugin-typescript2';
import { replaceVersion, replaceModuleName } from './plugins/replace';
import removeFunc from './plugins/remove-func';

rollup({
  input: `core/index.ts`,
  plugins: [
    typescript2({
      tsconfig: 'tsconfig.json',
    }),
    replaceVersion(),
  ],
}).then(async bundle => {
  await bundle.write({
    format: 'es',
    file: `lib/index.js`,
  });
  bundle.close();
})