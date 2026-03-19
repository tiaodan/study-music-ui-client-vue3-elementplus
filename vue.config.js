const { defineConfig } = require('@vue/cli-service')
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
      overlay: true,  // 关闭错误遮罩层是 false  // 确实好用，为啥之前clade code 自动设置后不行呢？
    },
  },
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
	
  chainWebpack: config => {
    config.plugin('define').tap(definitions => {
      Object.assign(definitions[0]['process.env'], {
        NODE_HOST: '"http://localhost:9003"',
      });
      return definitions;
    });
  },
})
