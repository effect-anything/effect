import WebpackDevServer from "@effect-x/deps/compiled/webpack-dev-server"
import { NextFunction, Request, Response } from "@effect-x/deps/compiled/express"
import { setupProxy } from "./setup-proxy"
import { ConfigHelper } from "../../config/helper"
import { MultiCompiler, Stats } from "@effect-x/deps/compiled/webpack"
import { getOverlayMiddleware } from "@effect-x/stats-format-plugin/middleware/overlay"
import { getLaunchEditorMiddleware } from "@effect-x/stats-format-plugin/middleware/launch-editor"
import type { WebpackDevMiddleware } from "webpack-dev-middleware"
import { json } from "body-parser"

class DevServer {
  public stats: Stats | null = null

  constructor(
    public readonly configHelper: ConfigHelper,
    public readonly app: WebpackDevServer["app"],
    public readonly middleware: WebpackDevMiddleware,
    public readonly compiler: MultiCompiler
  ) {
    this.compiler.compilers[0].hooks.done.tap("DevServer", (stats) => {
      this.stats = stats
    })

    const middlewares: any = [
      getOverlayMiddleware({
        // configHelper: configHelper,
        root: configHelper.projects.all[0].projectPath,
        middleware: this.middleware,
        stats: () => this.stats,
      }),
      getLaunchEditorMiddleware({}),
    ]

    this.app.use(json({}))
    this.app.use(middlewares)
  }

  run(req: Request, res: Response, next: NextFunction) {}
}

export const createDevServer = (configHelper: ConfigHelper, compiler: MultiCompiler) => {
  const webpackDevConfig = {
    allowedHosts: ["all"],
    compress: true,
    static: false,
    hot: false,
    liveReload: false,
    client: false,
    magicHtml: false,
    // https: true,
    // http2: true,
    open: false,
    historyApiFallback: {
      disableDotRule: true,
      // index: configHelper.indexProject,
    },
    webSocketServer: "ws",
    devMiddleware: {
      publicPath: configHelper.args.publicPath.slice(0, -1),
      writeToDisk: false,
      stats: false,
    },
    host: configHelper.args.host,
    port: configHelper.args.port,
    proxy: setupProxy(configHelper),
    onBeforeSetupMiddleware(devServer: WebpackDevServer) {
      // @ts-expect-error
      // eslint-disable-next-line no-new
      new DevServer(configHelper, devServer.app, devServer.middleware, compiler)
    },
  } as WebpackDevServer.Configuration

  return new WebpackDevServer(webpackDevConfig, compiler)
}
