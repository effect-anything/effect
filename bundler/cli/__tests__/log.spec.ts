import * as Log from "../src/log"

describe("log.ts", () => {
  it("wait", () => {
    const logMockFn = jest.fn()
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(logMockFn)

    Log.wait("hello")
    expect(logMockFn).toBeCalled()
    expect(logMockFn).toBeCalledWith(Log.prefixes.wait, "hello")

    Log.wait({ hello: "world" })
    expect(logMockFn).toBeCalledWith(Log.prefixes.wait, { hello: "world" })

    consoleSpy.mockRestore()
  })

  it("error", () => {
    const logMockFn = jest.fn()
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(logMockFn)

    Log.error("hello")
    expect(logMockFn).toBeCalled()
    expect(logMockFn).toBeCalledWith(Log.prefixes.error, "hello")

    Log.error({ hello: "world" })
    expect(logMockFn).toBeCalledWith(Log.prefixes.error, { hello: "world" })

    const customError = new Error("throw error message")
    Log.error(customError)
    expect(logMockFn).toBeCalledWith(Log.prefixes.error, customError)

    consoleSpy.mockRestore()
  })

  it("warn", () => {
    const logMockFn = jest.fn()
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(logMockFn)

    Log.warn("hello")
    expect(logMockFn).toBeCalled()
    expect(logMockFn).toBeCalledWith(Log.prefixes.warn, "hello")

    Log.warn({ hello: "world" })
    expect(logMockFn).toBeCalledWith(Log.prefixes.warn, { hello: "world" })

    consoleSpy.mockRestore()
  })

  it("ready", () => {
    const logMockFn = jest.fn()
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(logMockFn)

    Log.ready("hello")
    expect(logMockFn).toBeCalled()
    expect(logMockFn).toBeCalledWith(Log.prefixes.ready, "hello")

    Log.ready({ hello: "world" })
    expect(logMockFn).toBeCalledWith(Log.prefixes.ready, { hello: "world" })

    consoleSpy.mockRestore()
  })

  it("info", () => {
    const logMockFn = jest.fn()
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(logMockFn)

    Log.info("hello")
    expect(logMockFn).toBeCalled()
    expect(logMockFn).toBeCalledWith(Log.prefixes.info, "hello")

    Log.info({ hello: "world" })
    expect(logMockFn).toBeCalledWith(Log.prefixes.info, { hello: "world" })

    consoleSpy.mockRestore()
  })

  it("event", () => {
    const logMockFn = jest.fn()
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(logMockFn)

    Log.event("hello")
    expect(logMockFn).toBeCalled()
    expect(logMockFn).toBeCalledWith(Log.prefixes.event, "hello")

    Log.event({ hello: "world" })
    expect(logMockFn).toBeCalledWith(Log.prefixes.event, { hello: "world" })

    consoleSpy.mockRestore()
  })
})
