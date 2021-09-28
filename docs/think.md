# Product thinking

## Some chat record
期望的还是融合一些现代化UI，逻辑业务在里面，还有交互最佳实践之类的，

我想做这个东西，目标之一就是让后端开发更容易，因为css，html 这些很烦人，坑

做一些更高级别的抽象，直接用即便不懂 react 写得少，但是还是很直观的

```jsx
<Page>
 <Form schema="user-create-schema" />
 <UserStatus />
 <UserList />
 <XXXTable />
</Page>
```

对，不仅仅是UI组件，而且还能自动绑定到接口，数据获取这些统统都包含了

最近的趋势不是low code什么的吗，无代码，低代码，我想的反而是相反的，不能拆分太细，而是做整合，这一个大功能直接放上去就能用，把常用的大功能都做出来不就行了吗。

然后就是商业化，付费点，普通的组件集成环境都是免费开源。但是例如数据管理功能，可集成可单独使用就有希望商业化

这里面的确是很多东西，不容易

还有之前提过的 websocket， 如果整个系统是实时的，这个就更是卖点了

对于普通免费应用，并不需要花费就能享受这一些，设计感的，可二次开发，稳定快速的东西还是有希望。
付费应用就是更多高级组件/功能，而且得是很容易运行，容易二次开发，后端可能麻烦点，代码生成的问题，就是二次开发容易，但没办法享受后续更新，各种脚手架也是有这个问题，享受不到脚手架后续更新，因为最初是copy的

能把这堆问题优化给出一个解决方案，并且有好看的UI交互，有了以后再运营，推广一下 并不是没有机会，做的就是一个小的解决方案，满足一部分就行，

做这些小程序,h5的确是我们的弱势哈哈 卷不过别人，

我那个朋友不是做UI的，他是搞设计平面这些，我就是想看看结合这些能不能搞点东西，

nextjs然后他们也在做商业化，提供一个自带了很多业务功能组件的项目，例如支付啊，商品啊 什么的，给那些电商可以用，他们就是帮助用户更好构建的产品

但是lowcode做定制化的方案倒是有点新商业方案，比如把定制化的活儿放在平台上外包卖出去。
或者平台抽象出基建的能力，卖基建能力。用户只管写码不关心怎么配环境

# 项目结构

## @effect-x/root

整个 @effect-x git 项目 root， 项目 private 的并不会上传至 npm

## @effect-x/cli

## @effect-x/deps

## @effect-x/presets

## @effect-x/pack

## @effect-x/eslint-config

## @effect-x/prettier-config

## @effect-x/core

## @effect-x/runtime

- entry
- hot
  - client
  - indication
  - overlay
  - source
  - effect
- middleware
	- sourcemap middleware
	- launch editor middleware
- logger
	- logs

## @effect-x/router

## @effect-x/auth

- Plugins
- JSON Web Token
- OAuth

## @effect-x/ui

- Button
  - Button-Group
  - 
- Alert
  - Notify
- Table

## @effect-x/layouts

# Products

## @effect-x/launch

 本身是一个用组件写的页面，然后启动后用来开发组件，这 TM 是自举啊！

- [ ] 使用 module federation 实现则可能需要放弃 hot reload， react fast refresh 功能
- [ ] ...

### Features

#### Doc

项目文档编写

#### Component Developer

组件开发



Window Management

```react
# Key Bindging
# SHIFT + Up/Down/Left/Right Arrow

// Global Window manager store
/**
 * Tile windows structure
 * [RowIndex]
 * [ColumnIndex]
 *
 * Example:
 * [[0, 0, 0, 0],
 *  [0, 0, 0, 0]]
 **/
const useTileWindow = () => {
	// hasNewRow
  // insert to ?
}
```

Keybing Manager

```react
// global event listener
// dispatch event

const useKeyBinding = () => {
  // active
  // 
}
```
