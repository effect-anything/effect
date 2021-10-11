import { useStore } from "./context"
import { OpenTab } from "./openTab"

export { OpenTab }

export const useTabActive = () => {
  const { active, activeKey, activeIndex } = useStore((state) => {
    const index = state.findIndexByIdentity(state.identity)

    return {
      active: state.tabs[index],
      activeKey: state.tabs[index]?.tabKey,
      activeIndex: index,
    }
  })

  return {
    active,
    activeKey,
    activeIndex,
  }
}

export const useTabs = () => {
  const { active, activeIndex, activeKey } = useTabActive()

  const tabs = useStore((state) => state.tabs)

  return {
    active,
    activeIndex,
    activeKey,
    tabs,
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
