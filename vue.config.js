const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,

  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  // 这里才是控制 devServer 的地方！！
  devServer: {
    //host: '127.0.0.1',           // 关键！允许外部访问0.0.0.0（包括 Caddy）
    host: '0.0.0.0',           // 关键！允许外部访问0.0.0.0（包括 Caddy）
    port: 9001,                // 你现在用的端口,一般ui-mange 用8002
    allowedHosts: 'all',       // Vue CLI 4+ 推荐写法（允许所有域名）
    // allowedHosts: ['www.xx.com', '.xx.com', 'localhost'], // 或者只允许指定域名
    client: {
      overlay: false,  // 关闭错误遮罩层
    },
    // 本地开发代理：/capi/* 转发到后端 9003
    // 开发 (npm run serve)	/capi/user/login/status	devServer → localhost:9003/user/login/status
    // 生产 (npm run build)	/capi/user/login/status	Caddy → localhost:9003/user/login/status
    proxy: {
      '/capi': {
        target: 'http://localhost:9003',
        changeOrigin: true,
        // 如果后端路由不带 /capi 前缀，用 pathRewrite 去掉
        pathRewrite: { '^/capi': '' }
      }
    }
  },
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←

  chainWebpack: config => {
    config.plugin('define').tap(definitions => {
      Object.assign(definitions[0]['process.env'], {
        // 开发和生产都用空，请求都是 /capi/* 相对路径
        // 开发环境：devServer proxy 转发到 9003
        // 生产环境：Caddy 转发到 9003
        NODE_HOST: JSON.stringify(''),
      });
      return definitions;
    });
  },
})

// SEO 预渲染 - 只在生产构建时启用
// 暂时禁用：Puppeteer 预渲染较慢，可能卡住构建
// if (process.env.NODE_ENV === 'production') {
//   const PrerenderSPAPlugin = require('prerender-spa-plugin')
//   module.exports.configureWebpack = {
//     plugins: [
//       new PrerenderSPAPlugin({
//         staticDir: path.join(__dirname, 'dist'),
//         routes: ['/', '/singer', '/search'],
//         renderer: new PrerenderSPAPlugin.PuppeteerRenderer({
//           renderAfterDocumentEvent: 'render-event',
//           headless: true,
//         }),
//       }),
//     ],
//   }
// }