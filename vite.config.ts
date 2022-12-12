import { defineConfig, normalizePath } from 'vite';
// 引入 path 包注意两点:
// 1. 为避免类型报错，你需要通过 `pnpm i @types/node -D` 安装类型
// 2. tsconfig.node.json 中设置 `allowSyntheticDefaultImports: true`，以允许下面的 default 导入方式
import path from 'path';
import react from '@vitejs/plugin-react';
import viteEslint from 'vite-plugin-eslint';
import viteStylelint from 'vite-plugin-stylelint';
import autoprefixer from 'autoprefixer';
// svg转组件
import svgr from 'vite-plugin-svgr';
// 图片压缩
import viteImagemin from 'vite-plugin-imagemin';
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

// 是否为生产环境，在生产环境一般会注入 NODE_ENV 这个环境变量，见下面的环境变量文件配置
const isProduction = process.env.NODE_ENV === 'production';
// 填入项目的 CDN 域名地址
const CDN_URL = 'xxxxxx';

// 全局 scss 文件的路径
// 用 normalizePath 解决 window 下的路径问题
const variablePath = normalizePath(path.resolve('./src/variable.scss'));
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
    viteImagemin({
      // 无损压缩配置，无损压缩下图片质量不会变差
      optipng: {
        optimizationLevel: 7
      },
      // 有损压缩配置，有损压缩下图片质量可能会变差
      pngquant: {
        quality: [0.8, 0.9]
      },
      // svg 优化
      svgo: {
        plugins: [
          {
            name: 'removeViewBox'
          },
          {
            name: 'removeEmptyAttrs',
            active: false
          }
        ]
      }
    }),
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
  }
});
