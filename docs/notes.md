webpack 使用的插件库 Tapable

![image](https://user-images.githubusercontent.com/848515/71269677-dd17b980-238a-11ea-8f44-efde419f1da0.png)

基于 Lerna + NPM 解决项目依赖共享，更新，构建，发布问题

#### 一些“微前端”项目

[feature-hub](https://github.com/sinnerschrader/feature-hub)

[web-apps](https://github.com/ringcentral/web-apps)


### 一些文章

[那么什么是-module-federation](https://richlab.design/translations/2020/03/27/webpack-5-module-federation/#%E9%82%A3%E4%B9%88%E4%BB%80%E4%B9%88%E6%98%AF-module-federation)

[基于浏览器的实时构建探索之路](https://richlab.design/blog/2019/12/21/explore-the-way-of-real-time-build-based-on-browser/#%E4%B8%93%E9%A2%98%E4%B8%80-%E6%8F%92%E4%BB%B6%E6%9C%BA%E5%88%B6)

[Webpack 5 Module Federation: JavaScript 架构的变革者](https://zhuanlan.zhihu.com/p/120462530)

[Webpack 5懒加载原理](https://segmentfault.com/a/1190000020233387/)

[探索 webpack5 新特性 Module federation 在腾讯文档的应用](http://www.alloyteam.com/2020/04/14338)

[升级webpack5](https://zhuanlan.zhihu.com/p/81122986)

[EMP微前端](https://mp.weixin.qq.com/s/l0-uCLFRcBBrs4yTiAvryg)

![Facebook Newsfeed示例](https://user-images.githubusercontent.com/9839768/80710807-8c268780-8b19-11ea-8f3f-747153a92a65.jpg)



We have teams that follow the scope comment:

- **@fb-products**: Manage other features.
- **@fb-ads**: Manage ads.
- **@fb-messages**: Manage messages of users.
- **@fb-feeds**: Manage information about newfeed users.
- **@fb-design-system** (pink): Design system team.

## 多版本

[同时运行多个版本](https://jakearchibald.com/2020/multiple-versions-same-time/)

[https://www.buildingmicrofrontends.com/](https://www.buildingmicrofrontends.com/)

## 环境区分

### stage

- local
- test
- pre-production
- production

## Webpack 5

https://github.com/sokra/slides/blob/master/data/webpack-5-whats-new.pdf



## Webpack5 Module Federation

![img](https://miro.medium.com/max/2600/0*jcNZd6Gx5xtDjOoF.png)

ModuleFederationPlugin 中的 name 属性很重要，会被后续流程使用作为区分的唯一标识。

@example/module-name 不合法

example-module-name 合法

需要实现个函数将第一个名称转换至第二个



## 目前遇到的一些困难

### 热更新出错

github issues

[https://github.com/webpack/webpack/issues/11182](https://github.com/webpack/webpack/issues/11182)

 [https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/126](https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/126) 

react-refresh-webpack-plugin 没问题，pmmmwh 给到的结论是 webpack jsonp hmr 运行时错误和我们实际测试得到的结果一致

![image-20200818112136879](/Users/kee/Library/Application Support/typora-user-images/image-20200818112136879.png)


## 开发体验 

### Typescript 设置

https://github.com/module-federation/module-federation-examples/issues/20#issuecomment-644930018

### 本地浏览器启动在线编辑

- code server
- github codespance


### Source-Map

https://t.me/gorshochekvarit/76

https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit

https://segmentfault.com/a/1190000008413860

https://github.com/7rulnik/source-map-js

### Open React in Editor

https://github.com/lahmatiy/component-inspector#react

https://github.com/mshustov/babel-plugin-source-wrapper

### Performance

https://github.com/lahmatiy/react-render-tracker

[webpack stats](https://github.com/statoscope/statoscope)

https://github.com/andrewiggins/v8-deopt-viewer

### Feature-toogles 功能开关

 [feature-toggles](https://martinfowler.com/articles/feature-toggles.html)

https://github.com/Unleash/unleash

[creating-flags](https://docs.launchdarkly.com/guides/best-practices/creating-flags)

[promise-local-storage.js](https://gist.github.com/jlongster/026e5c8d77d16e822275a521bbd8c4bc)

### Doc

https://github.com/react-cosmos/react-cosmos


## 错误处理

nextjs 处理 runtime 错误的 source-map

![image-20210831172033521](/Users/kee/Library/Mobile Documents/27N4MQEA55~pro~writer/Documents/products/image-20210831172033521.png)

## 参考借鉴 UI 组件库

* Adobe 家的 [react-spectrum](https://react-spectrum.adobe.com)
* Atlassian [Atlassian](https://atlassian.design)
* [circuit-ui](https://github.com/sumup-oss/circuit-ui)
* [mantine](https://mantine.dev)
* https://xstyled.dev/docs/overflow/
* https://theme-ui.com/components/forms/
* [What-is-dx-developer](https://medium.com/swlh/what-is-dx-developer-experience-401a0e44a9d9)
* https://codepen.io/favori/pen/WNjMWvb
