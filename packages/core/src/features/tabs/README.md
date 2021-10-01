# TabsLayout

根据路由 pathname、query、state、search 加起来 hash 作为 key，如果存在相同 key 则跳转至对应 Tab 页面，如果不存在则新增一个 Tab 页面

如下所示会存在 2 个 Tab 标签页面，

```javascript
let tab1 = {
  pathname: "/page/1",
  location: {
    search: "?page=1",
    query: "",
    state: "",
  },
}

let tab2 = {
  pathname: "/page/2",
  location: {
    search: "?page=2",
    query: "",
    state: "",
  },
}
```

### API

在 TabsLayout 下可使用的 window.tabsUtil 方法

#### switchTo(tabKey)

```javascript
switchTo("TAB_KEY")
```

#### push(path, options)

##### options

- force 不管是否存在都打开一个新标签页 默认 false
- replace history.replace 默认 false
- reload 如果已存在是否刷新 默认 false
- cabllack

```javascript
// 打开新标签
push("/page/1", options)
```

### replace(target, path, options)

// TODO

##### options

- replace history.replace 默认 false
- cabllack

```javascript
// 将 tab1 的 路由 location 信息更新为 /page/3，不会打开新标签页，在原有标签页上刷新
replace("/page/1", "/page/3")

// 使用 history.replace，默认 history.push
replace("/page/1", "/page/3", {
  replace: true,
})
```

### close(options)

##### options

- tab 需要关闭的 Tab，不传默认当前
- backTo 关闭后跳转到的位置，可以是 path 或者 Tab，不传自动找一个
- replace history.replace 默认 false
- reload 如果已存在是否刷新 默认 false
- cabllack

```javascript
// 关闭当前 Tab
close()
```

```javascript
// 在 /pages/1 中调用
close({
  // tab: AnyTab, 关掉特定的一个 Tab
  backTo: "/pages/list",
  reload: true, // 进入 /pages/list 会重新刷新
  // replace: true,
  callback: () => {
    message.success("保存成功")
  },
})
```

```javascript
// 关闭某个 Tab, 自动回到上一个 Tab
close({
  tab: AnyTab, // 某一个 Tab 对象,
})
```

#### closeOther(tab)

#### closeRight(tab, index)

#### goBack(options)

##### options

- backTo 关闭后跳转到的位置，可以是 path 或者 Tab，不传自动找一个
- replace history.replace 默认 false
- reload 如果已存在是否刷新 默认 false
- cabllack

```javascript
goBack()
```

```javascript
// 在 /pages/1 中调用，和 close 区别是不会关掉当前 Tab
goBack({
  backTo: "/pages/list",
  reload: true, // 进入 /pages/list 会重新刷新
  // replace: true,
  callback: () => {
    message.success("保存成功")
  },
})
```

#### reload(tab)

```javascript
// 刷新当前
reload()
// 刷新某一个
reload(ANY_TAB)
```
