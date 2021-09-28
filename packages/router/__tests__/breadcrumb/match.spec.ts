import { createRouteNodeFromConfig, findRouteNodeByPathname } from "../../src/helper"
import {
  getBreadcrumbs,
  matchRouteNodeBreadcrumb,
  getMetaBreadcrumb,
  breadcrumbRegexPathJoin,
} from "../../src/breadcrumb/match"
import type { RouteConfig } from "../../src/types"
import type { RouteNode } from "../../src"

describe("getBreadcrumbs", () => {
  let routeNodes: RouteNode[] = []

  beforeEach(() => {
    routeNodes = createRouteNodeFromConfig([
      {
        path: "/home",
        meta: {
          breadcrumb: {
            "*": "home",
            "/page1*": [
              {
                text: "page1",
                to: "/home/page1",
              },
            ],
            "/page2*": {
              text: "page2",
              to: "/home/page2",
            },
            "/page3*": () => {
              return [
                {
                  text: "page3",
                  to: "/home/page3",
                },
              ]
            },
          },
        },
        children: [
          {
            path: "/page1",
            meta: {
              breadcrumb: {
                "/nested": {
                  text: "nested",
                  to({ pathname }) {
                    return pathname
                  },
                },
              },
            },
            children: [
              {
                path: "/",
                routeProps: {
                  exact: true,
                },
              },
              {
                path: "/nested",
              },
            ],
          },
          {
            path: "/page2",
            meta: {
              breadcrumb: {
                "/nested": {
                  text: "nested",
                },
              },
            },
            children: [
              {
                path: "/",
                routeProps: {
                  exact: true,
                },
              },
              {
                path: "/nested",
              },
            ],
          },
          {
            path: "/page3",
            meta: {
              breadcrumb: {
                "/nested": {
                  text: "nested",
                },
              },
            },
            children: [
              {
                path: "/",
                routeProps: {
                  exact: true,
                },
              },
              {
                path: "/nested",
              },
            ],
          },
        ],
      },
    ])
  })

  it("should match breadcrumbs result", () => {
    const pathname = "/home"

    const findRouteNodes = findRouteNodeByPathname(pathname, routeNodes)

    expect(findRouteNodes).not.toBeUndefined()

    const result = getBreadcrumbs(
      {
        pathname: pathname,
        query: {},
      },
      findRouteNodes
    )

    expect(result).toEqual([{ text: "home", to: "/home/page1" }])
  })

  it("should match breadcrumbs result2", () => {
    const pathname = "/home/page1"

    const findRouteNodes = findRouteNodeByPathname(pathname, routeNodes)

    expect(findRouteNodes).not.toBeUndefined()

    const result = getBreadcrumbs(
      {
        pathname: pathname,
        query: {},
      },
      findRouteNodes
    )

    expect(result).toEqual([
      { text: "home", to: "/home/page1" },
      { text: "page1", to: "/home/page1" },
    ])
  })

  it("should match breadcrumbs result3", () => {
    const pathname = "/home/page1/nested"

    const findRouteNodes = findRouteNodeByPathname(pathname, routeNodes)

    expect(findRouteNodes).not.toBeUndefined()

    const result = getBreadcrumbs(
      {
        pathname: pathname,
        query: {},
      },
      findRouteNodes
    )

    expect(result).toEqual([
      { text: "home", to: "/home/page1" },
      { text: "page1", to: "/home/page1" },
      { text: "nested", to: "/home/page1/nested" },
    ])
  })

  // xit("should match breadcrumbs empty", () => {
  //   const routes = createRouteNodeFromConfig(config)

  //   const pathname = "/a"

  //   const findRoute = findRouteNodeByPathname(pathname, routes)

  //   const result = getBreadcrumbs(
  //     {
  //       pathname: pathname,
  //       query: {},
  //     },
  //     findRoute
  //   )
  // })
})

describe("matchBreadcrumbNode", () => {
  it("should equal [string]", () => {
    const matchBreadcrumbs = matchRouteNodeBreadcrumb(
      {
        pathname: "/a",
        query: {
          a: 1,
        },
      },
      "/a",
      "/a*",
      "hello"
    )

    expect(matchBreadcrumbs).toEqual([{ text: "hello", to: "/a" }])
  })

  it("should equal [object]", () => {
    const matchBreadcrumbs = matchRouteNodeBreadcrumb(
      {
        pathname: "/a",
        query: {
          a: 1,
        },
      },
      "/a",
      "/a*",
      {
        text: "a",
      }
    )

    expect(matchBreadcrumbs).toEqual([{ text: "a", to: "/a" }])
  })

  it("should equal [objectArray]", () => {
    const matchBreadcrumbs = matchRouteNodeBreadcrumb(
      {
        pathname: "/a",
        query: {
          a: 1,
        },
      },
      "/a",
      "/a*",
      [
        {
          text: "a",
        },
        {
          text: "b",
        },
      ]
    )

    expect(matchBreadcrumbs).toEqual([
      { text: "a", to: "/a" },
      { text: "b", to: "/a" },
    ])
  })

  it("should equal [function]", () => {
    const matchBreadcrumbs = matchRouteNodeBreadcrumb(
      {
        pathname: "/a",
        query: {
          a: 1,
        },
      },
      "/a",
      "/a*",
      () => [
        {
          text: "a",
        },
        {
          text: "b",
        },
      ]
    )

    expect(matchBreadcrumbs).toEqual([
      { text: "a", to: "/a" },
      { text: "b", to: "/a" },
    ])
  })
})

describe("breadcrumbRegexPathJoin", () => {
  it("empty split", () => {
    const p = ["/a", "*"]

    expect(breadcrumbRegexPathJoin(...p)).toEqual("/a*")
  })

  it("too much split", () => {
    const p = ["/a", "//*"]

    expect(breadcrumbRegexPathJoin(...p)).toEqual("/a/*")
  })

  it("pass", () => {
    const p = ["/a", "/b", "/c"]

    expect(breadcrumbRegexPathJoin(...p)).toEqual("/a/b/c")
  })

  it("repeat", () => {
    const p = ["/a/", "//b", "/c", "//d", "/e/"]

    expect(breadcrumbRegexPathJoin(...p)).toEqual("/a/b/c/d/e")
  })
})

describe("getMetaBreadcrumb", () => {
  it("should get meta breadcrumbs", () => {
    const config: RouteConfig[] = [
      {
        path: "/a",
        meta: {
          breadcrumb: {
            "*": "a-0",
            "/1": [
              {
                text: "a-1",
                to: "to a-1",
              },
              {
                text: "a-1-1",
                to: "to a-1-1",
              },
            ],
            "/2": {
              text: "a-2",
              to: "to a-2",
            },
            "/3": () => {
              return [
                {
                  text: "a-3",
                  to: "to a-3",
                },
                {
                  text: "a-3-1",
                  to: "to a-3-1",
                },
              ]
            },
          },
        },
      },
      {
        path: "/a/b",
        meta: {
          breadcrumb: {
            "*": "b-0",
            "/1": [
              {
                text: "b-1",
                to: "to b-1",
              },
              {
                text: "b-1-1",
                to: "to b-1-1",
              },
            ],
            "/2": {
              text: "b-2",
              to: "to b-2",
            },
            "/3": () => {
              return [
                {
                  text: "b-3",
                  to: "to b-3",
                },
                {
                  text: "b-3-1",
                  to: "to b-3-1",
                },
              ]
            },
          },
        },
      },
    ]

    const routes = createRouteNodeFromConfig(config)

    const breadcrumbs = getMetaBreadcrumb(routes)

    expect(breadcrumbs).toMatchSnapshot()
  })
})
