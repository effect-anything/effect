# Auth

启动流程

1. 初始化认证服务
	```new AuthenticationStrategy()```
	尝试恢复登录状态
		-> 恢复失败 -> 未登录状态/去登录页面
		-> 登录成功 -> 获取最新用户信息 -> 重定向回首页
2. 初始化 axios
	设置 baseUrl 对返回状态处理
3. 初始化路由模块
	要求登录
		-> 根据 `AuthenticationStrategy.check()` 来判断是否登录/符合权限 
		-> 权限不正确 `AuthenticationStrategy.redirect()`
	不要求登录
		-> `AuthenticationStrategy.pass()`

## 认证服务

### 抽象 AuthenticationStrategy 

现在用的最多的 jwt 验证

#### JWTAuthenticationStrategy

```typescript
abstract class JWTAuthenticationStrategy {
	login() {
    
  }
  
  onResotry() {
    
  }
  
  onLogin () {
    
  }
  
  onLogout() {
    
  }
}
```

#### SSOAuthenticationStrategy

