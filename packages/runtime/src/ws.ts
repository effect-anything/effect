import url from "url"
import { EventEmitter } from "events"
import { ReceivedEventMessage } from "./type"

export class WSClient extends EventEmitter {
  public ws: WebSocket | undefined

  constructor() {
    super()
  }

  public createWebsocketInstance() {
    const ws = new WebSocket(
      url.format({
        protocol: window.location.protocol === "https:" ? "wss" : "ws",
        hostname: process.env.WDS_SOCKET_HOST || window.location.hostname,
        port: process.env.WDS_SOCKET_PORT || window.location.port,
        pathname: process.env.WDS_SOCKET_PATH || "/ws",
        slashes: true,
      })
    )

    return ws
  }

  public attach(ws: WebSocket, open?: () => void): void {
    ws.onopen = () => {
      this.emit("open")

      open?.()
    }

    ws.onclose = () => {}

    ws.onmessage = (e) => {
      const message = JSON.parse(e.data) as ReceivedEventMessage

      this.emit("message", message)
    }
  }

  public disconnect() {
    if (this.ws) {
      if (this.ws.readyState === this.ws.OPEN || this.ws.readyState === this.ws.CONNECTING) {
        this.ws.close()
      }
    }
  }

  public reconnect() {
    this.ws = this.createWebsocketInstance()

    this.attach(this.ws, () => {
      this.emit("reconnect")
    })
  }

  public connect() {
    this.ws = this.createWebsocketInstance()

    this.attach(this.ws)
  }
}
