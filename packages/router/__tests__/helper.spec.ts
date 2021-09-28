import { createRouteNodeFromConfig, findRouteNodeByPathname, createRouteElements } from "../src/helper"
import * as operators from "../src/operators"
import { RouteNode } from "../src/node"
import type { RouteConfig } from "../src/types"

const makeRouteConfig = (): RouteConfig[] => {
  return [
    {
      path: "/a",
      meta: {},
      children: [
        {
          path: "/p1",
          children: [
            {
              path: "/c",
            },
            {
              path: "/c1",
            },
            {
              path: "/c2",
            },
          ],
        },
        {
          path: "/p2",
          children: [
            {
              path: "/a",
            },
            {
              path: "/b",
            },
            {
              path: "/c/:id",
            },
            {
              path: "/c/detail/:id",
            },
          ],
        },
      ],
    },
    {
      path: "/b",
      children: [
        {
          path: "/:id",
        },
        {
          path: "/test",
        },
        {
          path: "/test/hello",
          children: [
            {
              path: "/id",
            },
            {
              path: "/subPage",
            },
            {
              path: "/detail/:id",
            },
          ],
        },
      ],
    },
  ]
}

describe("createRouteElements", () => {
  it("sample", () => {
    const routeConfig = makeRouteConfig()

    const routeNodes = createRouteNodeFromConfig(routeConfig)

    const routeElements = createRouteElements(routeNodes, {})

    expect(routeElements).toMatchSnapshot()
  })
})

describe("createRouteNodeFromConfig", () => {
  it("sample", () => {
    const routeConfig = makeRouteConfig()

    const routeNodes = createRouteNodeFromConfig(routeConfig)

    expect(routeNodes)
  })
})

describe("operators", () => {
  it("filter", () => {
    const routeConfig = makeRouteConfig()

    const routeNodes = createRouteNodeFromConfig(routeConfig)

    const routeNodes1 = operators.filter((routeNode) => {
      return true
    })(routeNodes)

    expect(routeNodes1).toMatchSnapshot()

    const routeNodes2 = operators.filter((routeNode) => {
      return false
    })(routeNodes)

    expect(routeNodes2).toEqual([])

    expect(routeNodes2).toMatchSnapshot()

    const routeNodes3 = operators.filter((item) => {
      if (item.path === "/b") {
        return false
      }

      return true
    })(routeNodes)

    expect(routeNodes3).toMatchSnapshot()
  })

  it("map", () => {
    const routeConfig = makeRouteConfig()

    const assignMetaVersion = operators.map((node) => {
      return node.updateMeta((m) => {
        m.version = "0.0.2"

        return m
      })
    })

    const assignMetaVersion2 = operators.map((node) => {
      return node.updateMeta((m) => {
        m.version = "0.0.5"

        return m
      })
    })

    const assignMetaVersion3 = operators.map((node) => {
      return node.updateMeta((m) => {
        m.version = "0.0.5"

        return m
      })
    })

    const routeNodes = createRouteNodeFromConfig(routeConfig, [assignMetaVersion])

    expect(routeNodes).toMatchSnapshot()

    const routeNodes2 = assignMetaVersion2(routeNodes)

    const routeNodes3 = assignMetaVersion3(routeNodes)

    expect(routeNodes2).not.toEqual(routeNodes)

    expect(routeNodes2).toEqual(routeNodes3)
  })

  it("reduce", () => {
    const routeConfig = makeRouteConfig()

    const routeNodes = createRouteNodeFromConfig(routeConfig)

    const routeNodes2 = operators.reduce<RouteNode, RouteNode[]>(
      (acc: RouteNode[], routeNode) => acc.concat(routeNode),
      [] as RouteNode[]
    )(routeNodes)

    expect(routeNodes2).toMatchSnapshot()
  })

  it("find", () => {
    const routeConfig = makeRouteConfig()

    const routeNodes = createRouteNodeFromConfig(routeConfig)

    const findRoute = operators.find((x) => x.path === "/a/p1", routeNodes)

    expect(findRoute).not.toBeUndefined()

    expect(findRoute!.path).toEqual("/a/p1")
  })

  it("flat", () => {
    const routeConfig = makeRouteConfig()

    const routeNodes = createRouteNodeFromConfig(routeConfig)

    expect(operators.flat(routeNodes)).toMatchSnapshot()
  })

  it("findRouteNodeByPathname", () => {
    const routeConfig = makeRouteConfig()

    const routeNodes = createRouteNodeFromConfig(routeConfig)

    const findRoute = findRouteNodeByPathname("/a/p2/c/detail/1", routeNodes)

    expect(findRoute).not.toBeUndefined()

    expect(findRoute!.path).toEqual("/a/p2/c/detail/:id")

    expect(findRoute).toMatchSnapshot()
  })
})
