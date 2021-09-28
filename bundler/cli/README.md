Cli Options

### Dev Command

'--cwd'
'--env', '部署环境 dev、test、prod 默认为 dev
'--projects'
'--exclude'
'--include'
'--open', '是否打开调试页面 默认 true,false 禁止自动打开
'--port',
'--output',
'--hot', '是否使用热更新 默认不启动
'--fastRefresh',
'--profile',
'--cache',
'--publicPath',
'--check',
'--devtool',
'--sourcemap',
'--analyze', '生成分析报告 默认为 false
'--debug',

### Build Command

'--cwd'
'--env', '部署环境 dev、test、prod 默认为 dev
'--projects'
'--exclude'
'--include'
'--output',
'--profile',
'--cache',
'--publicPath',
'--check',
'--devtool',
'--sourcemap',
'--analyze', '生成分析报告 默认为 false
'--debug',

- 所使用到的环境变量
- process.env.BROWSER
- process.env.BROWSER_ARGS
- process.env.BABEL_ENV = "development"
- process.env.NODE_ENV = "development"
- process.env.WDS_SOCKET_HOST
- process.env.WDS_SOCKET_PATH = '/ws'
- process.env.WDS_SOCKET_PORT
- process.env.CI
