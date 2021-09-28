import { AuthActionTypes, BaseStrategy } from "../base"
import jwtDecode from "jwt-decode"

/**
 * 解码 token 获取信息
 * @param jwt jwtTokenData
 */
const decodeToken = <T>(jwt: JWtTokens | undefined): T => {
  if (!jwt || !jwt.accessToken) {
    throw new Error("token is empty")
  }

  return jwtDecode(jwt.accessToken)
}

export interface JWtTokens {
  accessToken: string
  refreshToken: string
}

/**
 * JWT 登录提交信息
 */
export interface JWTAuthenticationStrategyForm {
  /**
   * 用户名
   */
  username: string
  /**
   * 密码
   */
  password: string
}

export type JWTAuthenticationStrategyOptions<T> = {
  debug?: boolean

  /**
   * 记住登录状态 key
   */
  rememberKey?: string
  /**
   * 存储 token key
   */
  saveKey?: string
  /**
   * header name
   */
  header?: string

  onSubmit: (state: T, args: any) => Promise<JWtTokens>
}

type JWTState<U, E extends Record<string, any>> = {
  /**
   * 是否记住登录
   */
  hasRemembered: boolean
  /**
   * 记住登录状态 key
   */
  rememberKey: string
  /**
   * 存储 token key
   */
  saveKey: string
  /**
   * header name
   */
  header: string

  jwt: JWtTokens | undefined

  user: U | undefined
} & E

export class JWTAuthenticationStrategy<
  U,
  E extends Record<string, any>,
  S extends JWTState<U, E> = JWTState<U, E>
> extends BaseStrategy<S> {
  protected store: S

  public get state() {
    return this.store
  }

  constructor(public readonly options: JWTAuthenticationStrategyOptions<S>) {
    super()

    this.store = {
      hasRemembered: false,
      rememberKey: options.rememberKey || "_REMEMBER_KEY",
      saveKey: options.saveKey || "_SAVE_KEY",
      header: options.header || "Authorization",
      jwt: undefined,
      user: undefined,
    } as S

    // prettier-ignore
    this.restoreTask
      .add(this.hasExistJwtAuthInfo)

    // prettier-ignore
    this.resolveTask
      .add(this.deserializeToken.bind(this))

    // prettier-ignore
    this.signInTask
      .add(async (state, args) => {
        const token = await this.options.onSubmit(state, args)

        if (!token) {
          throw new Error('sign fail')
        }

        state.jwt = token

        localStorage.setItem(state.rememberKey, args.remember + "")

        if (args.remember) {
          localStorage.setItem(state.saveKey, JSON.stringify(state.jwt))
        } else {
          sessionStorage.setItem(state.saveKey, JSON.stringify(state.jwt))
        }

        return state
      })

    this.signOutTask.add((state) => {
      state.user = undefined
      state.jwt = undefined

      return state
    })
  }

  public get user(): U | undefined {
    return this.store.user
  }

  private hasExistJwtAuthInfo(state: S): S {
    const rememberValue = localStorage.getItem(state.rememberKey)

    const hasRemembered = rememberValue === "true"

    if (hasRemembered) {
      state.hasRemembered = hasRemembered
    }

    const saveContent = state.hasRemembered
      ? localStorage.getItem(state.saveKey)
      : sessionStorage.getItem(state.saveKey)

    if (!saveContent) {
      throw new Error("not found save key")
    }

    try {
      const jwtToken = JSON.parse(saveContent) as JWtTokens

      if (jwtToken) {
        state.jwt = jwtToken

        return state
      }

      throw new Error("not found jwt key")
    } catch {
      throw new Error("token json parse error")
    }
  }

  public checkLogin() {
    const { user, jwt } = this.store

    return !!user && !!jwt
  }

  public getExtractHeaders() {
    return {
      [this.store.header]: this.store.jwt?.accessToken,
    }
  }

  protected deserializeToken(state: S): S {
    const decodeUser = decodeToken<U>(state.jwt)

    if (decodeUser) {
      state.user = decodeUser
    }

    return state
  }

  public restore(): Promise<void> {
    return this.restoreTask
      .run(this.store, {})
      .then((state) => this.resolveTask.run(state, {}))
      .then((state) => {
        this.store = state
      })
      .catch((error) => {
        if (this.options.debug) {
          console.log(error)
        }
      })
  }

  public signIn(form: Record<string, any>, remember: boolean): Promise<void> {
    const args = {
      form,
      remember,
    }

    return this.signInTask
      .run(this.store, args)
      .then((state) => this.resolveTask.run(state, {}))
      .then((state) => {
        this.store = state

        this.event.emit(AuthActionTypes.SIGN_IN, this.store)
      })
  }

  public signOut(): Promise<void> {
    return this.signOutTask.run(this.store, {}).then((state) => {
      this.store = state

      this.event.emit(AuthActionTypes.SIGN_OUT, this.store)
    })
  }
}
