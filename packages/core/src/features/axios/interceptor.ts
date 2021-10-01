/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"
import { stringify } from "qs"

const cnReg = /\\u4E00-\\u9FFF/g

export interface SetupAxiosOptions {
  transformRequest?: AxiosRequestConfig["transformRequest"]

  transformResponse?: AxiosRequestConfig["transformResponse"]

  headers?: AxiosRequestConfig["headers"]

  paramsSerializer?: (params: Record<string, unknown>) => string

  timeout?: number

  timeoutErrorMessage?: string

  transformRequestConfig?: (response: AxiosRequestConfig) => any

  validateResponse?: (response: AxiosResponse<any>) => any

  transformError?: (error: AxiosError<any>) => AxiosError<any> | Promise<AxiosError<any>>
}

const defaultAxiosOptions: SetupAxiosOptions = {
  paramsSerializer: (params: any): string => {
    return stringify(params, { arrayFormat: "repeat", skipNulls: true })
  },
  timeout: 120000,
  timeoutErrorMessage: "Request timeout",
}

export const axiosInterceptor = (axios: AxiosInstance, options: SetupAxiosOptions = defaultAxiosOptions): void => {
  axios.defaults.paramsSerializer = options.paramsSerializer ?? defaultAxiosOptions.paramsSerializer
  axios.defaults.timeout = options.timeout ?? defaultAxiosOptions.timeout
  axios.defaults.timeoutErrorMessage = options.timeoutErrorMessage ?? defaultAxiosOptions.timeoutErrorMessage

  axios.defaults.headers = options.headers

  if (options.transformRequest) {
    axios.defaults.transformRequest = options.transformRequest
  }

  if (options.transformResponse) {
    axios.defaults.transformResponse = options.transformResponse
  }

  axios.interceptors.request.use(
    function (config) {
      if (config.url && cnReg.test(config.url)) {
        config.url = encodeURI(config.url)
      }

      if (options.transformRequestConfig) {
        config = options.transformRequestConfig(config)
      }

      return config
    },
    function (error) {
      return error
    }
  )

  axios.interceptors.response.use(
    function (response) {
      if (options.validateResponse) {
        return options.validateResponse(response)
      }

      return response
    },
    function (error: AxiosError<any>) {
      if (options.transformError) {
        return options.transformError(error)
      }

      return error
    }
  )
}
