import { rollup } from 'rollup';
import typescript2 from 'rollup-plugin-typescript2';
import { replaceVersion, replaceModuleName } from './plugins/replace';
import removeFunc from './plugins/remove-func';

const builds = [
  {
    file: 'utils/index',
    external: [],
  },
  {
    file: 'common/index',
    external: ['../utils'],
  },
  {
    file: 'client/index',
    external: ['../utils', '../common'],
  },
  {
    file: 'server/index',
    external: ['../utils', '../common'],
  },
  {
    file: 'components/index',
    external: ['../utils', '../common', '../client'],
  },
  {
    file: 'router/index',
    external: ['../utils', '../common', '../client'],
  },
]
async function esmBuild(file, external) {
  const bundle = await rollup({
    input: `core/${file}.ts`,
    external,
    plugins: [
      typescript2({
        tsconfig: 'tsconfig.json',
      }),
      replaceVersion(),
    ],
  })
  await bundle.write({
    format: 'es',
    file: `lib/${file}.js`,
  });
  await bundle.close();
}

async function cjsBuild(file, external) {
  const bundle = await rollup({
    input: `core/${file}.ts`,
    external,
    plugins: [
      typescript2({
        tsconfig: 'tsconfig.json',
      }),
      replaceVersion(),
      replaceModuleName(),
    ],
  })
  await bundle.write({
    format: 'cjs',
    file: `lib/${file}.cjs`,
  });
  await bundle.close();
}



builds.forEach(val => {
  esmBuild(val.file, val.external);
  cjsBuild(val.file, val.external);
})

// rollup({
//   input: `core/index.ts`,
//   plugins: [
//     typescript2({
//       tsconfig: 'tsconfig.json',
//     }),
//     replaceVersion(),
//   ],
// }).then(async bundle => {
//   await bundle.write({
//     format: 'es',
//     file: `lib/index.js`,
//   });
//   bundle.close();
// })