const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

module.exports = {
  configureWebpack: {
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ]
  },
  pages: {
    index: {
      title: '点歌板',
      entry: 'src/main.js'
    },
    manager: {
      title: '设置',
      entry: 'src/manager.js'
    },
  },
  pluginOptions: {
    electronBuilder: {
      preload: {
        preload: 'src/preload.js',
        'manager-preload': 'src/manager-preload.js'
      },
      builderOptions: {
        artifactName: "点歌板-${version}.${ext}",
        win: {
          executableName: "点歌板",
          target: [{ target: "zip" }]
        },
        extraFiles: [
          { from: "manual.txt", to: "使用说明.txt" }
        ]
      }
    }
  }
}