import { RouteNode } from "../src/node"

describe("route.ts", () => {
  it("createRouteNode", () => {
    const node = new RouteNode({
      path: "/",
      children: [],
    })

    expect(node.path).toMatch("/")
  })
})
