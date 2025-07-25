import { rollup } from 'rollup';
import typescript2 from 'rollup-plugin-typescript2';
import { replaceVersion, replaceModuleName } from './plugins/replace';
import removeFunc from './plugins/remove-func';
import { existsSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

function mkdir(path: string) {
  !existsSync(path) && mkdirSync(path, { recursive: true });
}
mkdir('lib');
copyFileSync('readme.md', 'lib/readme.md');
(async function () {
  const tem = await readFileSync('core/package.json', 'utf8');
  const temJson = JSON.parse(tem);
  const res = await readFileSync('package.json', 'utf8');
  const { version } = JSON.parse(res);
  temJson.version = version;
  writeFileSync('lib/package.json', JSON.stringify(temJson, null, 2));
})();

const builds = [
  {
    file: 'utils/index',
    external: [],
  },
  {
    file: 'hooks/index',
    external: ['../utils', '..'],
  },
  {
    file: 'tools/index',
    external: ['../utils', '..'],
  },
  {
    file: 'instace/index',
    external: ['../utils', '../hooks', '../tools'],
  },
  {
    file: 'index',
    external: ['./utils', './hooks', './tools', './instace'],
  },
  {
    file: 'components/index',
    external: ['../utils', '../tools', '../instace', '..'],
  },
  {
    file: 'router/index',
    external: ['../utils', '../tools', '../instace', '..'],
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
