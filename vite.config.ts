import { defineConfig, normalizePath } from 'vite';
// 引入 path 包注意两点:
// 1. 为避免类型报错，你需要通过 `pnpm i @types/node -D` 安装类型
// 2. tsconfig.node.json 中设置 `allowSyntheticDefaultImports: true`，以允许下面的 default 导入方式
import path from 'path';
import react from '@vitejs/plugin-react';
import viteEslint from 'vite-plugin-eslint';
import viteStylelint from 'vite-plugin-stylelint';
import autoprefixer from 'autoprefixer';
// import testHookPlugin from './test-hooks-plugin';
import virtual from './plugins/virtual-module.ts';
import svgr from './plugins/svgr.ts';
import inspect from 'vite-plugin-inspect';
// svg转组件
// import svgr from 'vite-plugin-svgr';
// 图片压缩
// import viteImagemin from 'vite-plugin-imagemin';
// Vite 中提供了import.meta.glob的语法糖来解决这种批量导入的问题，如上述的 import 语句可以写成下面这样:
// 同步用：globEager， 异步用：glob
// const icons = import.meta.glob('../../assets/icons/logo-*.svg');
// const iconUrls = Object.values(icons).map(mod => mod.default);
// 雪碧图
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
// const icons = import.meta.globEager('../../assets/icons/logo-*.svg');
/*
如果报错，安装fast-glob
import ids from 'virtual:svg-icons-names'
const iconUrls = Object.values(icons).map((mod) => {
  // 如 ../../assets/icons/logo-1.svg -> logo-1
  const fileName = mod.default.split('/').pop();
  const [svgName] = fileName.split('.');
  return svgName;
});
 */
import fs from 'fs';

/**
 * 手动开启vite与构建
 * 1.删除node_modules/.vite目录。
   2.在 Vite 配置文件中，将server.force设为true。(注意，Vite 3.0 中配置项有所更新，你需要将 optimizeDeps.force 设为true)
   3.命令行执行npx vite --force或者npx vite optimize
 */

// 是否为生产环境，在生产环境一般会注入 NODE_ENV 这个环境变量，见下面的环境变量文件配置
const isProduction = process.env.NODE_ENV === 'production';
// 填入项目的 CDN 域名地址
const CDN_URL = 'xxxxxx';

// 全局 scss 文件的路径
// 用 normalizePath 解决 window 下的路径问题
const variablePath = normalizePath(path.resolve('./src/variable.scss'));

// 通过 Esbuild 插件修改指定模块的内容，这里我给大家展示一下新增的配置内容:
const esbuildPatchPlugin = {
  name: 'react-virtualized-patch',
  setup(build) {
    build.onLoad(
      {
        filter:
          /react-virtualized\/dist\/es\/WindowScroller\/utils\/onScroll.js$/
      },
      async (args) => {
        const text = await fs.promises.readFile(args.path, 'utf8');

        return {
          contents: text.replace(
            'import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";',
            ''
          )
        };
      }
    );
  }
};
// https://vitejs.dev/config/
export default defineConfig({
  // 手动指定项目根目录位置
  // root: path.join(__dirname, 'src'),
  base: isProduction ? CDN_URL : '/',
  build: {
    // image 转成base64的临界值
    assetsInlineLimit: 8 * 1024
  },
  // 其他静态资源
  assetsInclude: ['.gltf'],
  resolve: {
    // 别名配置
    alias: {
      '@assets': path.join(__dirname, 'src/assets')
    }
  },
  plugins: [
    inspect(),
    virtual(),
    react(),
    viteEslint({
      // 对某些文件排除检查
      exclude: ['node_modules']
    }),
    viteStylelint({
      fix: true,
      exclude: ['node_modules']
    }),
    svgr(),
    // viteImagemin({
    //   // 无损压缩配置，无损压缩下图片质量不会变差
    //   optipng: {
    //     optimizationLevel: 7
    //   },
    //   // 有损压缩配置，有损压缩下图片质量可能会变差
    //   pngquant: {
    //     quality: [0.8, 0.9]
    //   },
    //   // svg 优化
    //   svgo: {
    //     plugins: [
    //       {
    //         name: 'removeViewBox'
    //       },
    //       {
    //         name: 'removeEmptyAttrs',
    //         active: false
    //       }
    //     ]
    //   }
    // }),
    createSvgIconsPlugin({
      iconDirs: [path.join(__dirname, 'src/assets/icons')]
    })
  ],
  // css 相关的配置
  css: {
    modules: {
      // 一般我们可以通过 generateScopedName 属性来对生成的类名进行自定义
      // 其中，name 表示当前文件名，local 表示类名
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    },
    preprocessorOptions: {
      scss: {
        // additionalData 的内容会在每个 scss 文件的开头自动注入
        additionalData: `@import "${variablePath}";`
      }
    },
    // 进行 PostCSS 配置
    postcss: {
      plugins: [
        autoprefixer({
          // 指定目标浏览器
          overrideBrowserslist: ['Chrome > 40', 'ff > 31', 'ie 11']
        })
      ]
    }
  },
  // 预构建配置
  optimizeDeps: {
    // 为一个字符串数组， 当然，entries 配置也支持 glob 语法，非常灵活，如:
    // 将所有的 .vue 文件作为扫描入口 entries: ["**/*.vue"];
    entries: ['./src/main.vue'],
    // 配置为一个字符串数组，将 `lodash-es` 和 `vue`两个包强制进行预构建
    // 间接依赖的声明语法，通过`>`分开, 如`a > b`表示 a 中依赖的 b
    // "@loadable/component > hoist-non-react-statics",
    include: ['lodash-es', 'vue'],
    esbuildOptions: {
      plugins: [esbuildPatchPlugin]
    }
  }
});
/** 
 * 改第三方库代码
 * 首先，我们能想到的思路是直接修改第三方库的代码，不过这会带来团队协作的问题，你的改动需要同步到团队所有成员，比较麻烦。

好在，我们可以使用patch-package这个库来解决这类问题。一方面，它能记录第三方库代码的改动，另一方面也能将改动同步到团队每个成员。

patch-package 官方只支持 npm 和 yarn，而不支持 pnpm，不过社区中已经提供了支持pnpm的版本，这里我们来安装一下相应的包:
pnpm i @milahu/patch-package -D
注意: 要改动的包在 package.json 中必须声明确定的版本，不能有~或者^的前缀。
接着，我们进入第三方库的代码中进行修改，先删掉无用的 import 语句，再在命令行输入:
npx patch-package react-virtualized
现在根目录会多出patches目录记录第三方包内容的更改，随后我们在package.json的scripts中增加如下内容：
{
  "scripts": {
    // 省略其它 script
    "postinstall": "patch-package"
  }
}
这样一来，每次安装依赖的时候都会通过 postinstall 脚本自动应用 patches 的修改，解决了团队协作的问题。
 */
