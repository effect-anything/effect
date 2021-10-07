import { useStore } from "./context"
import { TabLocation } from "./openTab"
import { CloseMethodOptions, CloseRightMethodOptions, ReloadMethodOptions } from "./state"

export const useTabActive = () => {
  const { active, activeKey, activeIndex } = useStore((state) => {
    const idx = state.findIndexByLocation(state.location)

    return {
      active: state.tabs[idx],
      activeKey: state.tabs[idx]?.tabKey,
      activeIndex: idx,
    }
  })

  return {
    active,
    activeKey,
    activeIndex,
  }
}

export interface TabItem {
  index: number

  key: string

  tabKey: string

  location: TabLocation

  component: any

  properties: Record<string, any>

  isHead: boolean

  isLast: boolean

  reload(): void

  canClose: boolean

  close(): void

  canCloseRight: boolean

  closeRight(): void

  canCloseOthers: boolean

  closeOthers(): void
}

export const useTabs = () => {
  const { active, activeIndex, activeKey } = useTabActive()

  const enhanceTabs: TabItem[] = useStore((state) =>
    state.tabs.map((tab, index) => {
      const gt1 = state.tabs.length > 1
      const isHead = index === 0
      const isLast = index === state.tabs.length - 1

      return {
        index: index,
        tabKey: tab.tabKey,
        key: tab.properties.key,
        properties: tab.properties,
        component: tab.content,
        location: tab.location,
        isHead,
        isLast,
        reload: (options?: Omit<ReloadMethodOptions, "tab">) => reload({ ...options, tab }),
        canClose: gt1,
        close: (options?: Omit<CloseMethodOptions, "tab">) => close({ ...options, tab }),
        canCloseRight: gt1 && !isLast,
        closeRight: (options?: Omit<CloseRightMethodOptions, "tab">) => closeRight({ ...options, tab }),
        canCloseOthers: gt1,
        closeOthers: (options?: Omit<CloseRightMethodOptions, "tab">) => closeOthers({ ...options, tab }),
      }
    })
  )

  const { reload, close, closeRight, closeOthers } = useStore((state) => ({
    switchTo: state.switchTo,
    push: state.push,
    goBack: state.goBack,
    reload: state.reload,
    close: state.close,
    closeRight: state.closeRight,
    closeOthers: state.closeOthers,
  }))

  return {
    active,
    activeIndex,
    activeKey,
    tabs: enhanceTabs,
  }
}

export const useTabsAction = () => {
  const { active, activeIndex, activeKey } = useTabActive()

  const tabs = useStore((state) => state.tabs)

  const { switchTo, push, goBack, reload, close, closeRight, closeOthers } = useStore((state) => ({
    switchTo: state.switchTo,
    push: state.push,
    goBack: state.goBack,
    reload: state.reload,
    close: state.close,
    closeRight: state.closeRight,
    closeOthers: state.closeOthers,
  }))

  return { active, activeIndex, activeKey, tabs, switchTo, push, goBack, reload, close, closeRight, closeOthers }
}
