import { TokenSessionStorageManager } from "./session-storage"
import { TokenLocalStorageManager } from "./local-storage"

export type TokenManager = TokenSessionStorageManager | TokenLocalStorageManager

export const getStorage = (type: "local" | "session"): TokenManager => {
  if (type === "local") {
    return new TokenLocalStorageManager()
  } else {
    return new TokenSessionStorageManager()
  }
}

export { TokenSessionStorageManager, TokenLocalStorageManager }
