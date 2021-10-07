import { useStore } from "./context"
import { OpenTab } from "./openTab"

export { OpenTab }

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

export const useTabs = () => {
  const { switchTo, push, goBack, reload, close, closeRight, closeOthers } = useStore((state) => ({
    switchTo: state.switchTo,
    push: state.push,
    goBack: state.goBack,
    reload: state.reload,
    close: state.close,
    closeRight: state.closeRight,
    closeOthers: state.closeOthers,
  }))

  const { tabs } = useStore((state) => ({
    tabs: state.tabs,
  }))

  const { active, activeIndex, activeKey } = useTabActive()

  return { active, activeIndex, activeKey, tabs, switchTo, push, goBack, reload, close, closeRight, closeOthers }
}
