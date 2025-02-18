# API 文档

## 用户模块

### 用户注册
- 请求方法：POST
- URL：/user/register
- 请求参数：
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- 返回示例：
  ```json
  {
    "message": "注册成功",
    "user": {
      "id": "number",
      "username": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```

### 用户登录
- 请求方法：POST
- URL：/user/login
- 请求参数：
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- 返回示例：包含用户信息和 token

### 获取用户信息
- 请求方法：GET
- URL：/user/:id
- 权限要求：需要登录，用户角色
- 返回示例：
  ```json
  {
    "message": "获取用户信息成功",
    "user": {
      "id": "number",
      "username": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```

### 更新用户信息
- 请求方法：PUT
- URL：/user/:id
- 权限要求：需要登录，用户角色
- 请求参数：
  ```json
  {
    "username": "string",
    "email": "string"
  }
  ```
- 返回示例：更新后的用户信息

### 获取用户列表
- 请求方法：GET
- URL：/user
- 权限要求：需要登录，管理员角色
- 查询参数：
  - page：页码（默认：1）
  - limit：每页数量（默认：10）
- 返回示例：
  ```json
  {
    "message": "获取用户列表成功",
    "data": {
      "users": "array",
      "total": "number",
      "page": "number",
      "limit": "number"
    }
  }
  ```

### 删除用户
- 请求方法：DELETE
- URL：/user/:id
- 权限要求：需要登录，管理员角色
- 返回示例：
  ```json
  {
    "message": "删除用户成功"
  }
  ```

## 文章模块

### 创建文章
- 请求方法：POST
- URL：/article
- 权限要求：需要登录
- 请求参数：
  ```json
  {
    "title": "string",
    "content": "string"
  }
  ```

### 获取文章列表
- 请求方法：GET
- URL：/article
- 权限要求：需要登录

### 获取文章详情
- 请求方法：GET
- URL：/article/:id
- 权限要求：需要登录

### 更新文章
- 请求方法：PATCH
- URL：/article/:id
- 权限要求：需要登录
- 请求参数：
  ```json
  {
    "title": "string",
    "content": "string"
  }
  ```

### 删除文章
- 请求方法：DELETE
- URL：/article/:id
- 权限要求：需要登录

## 分类模块

### 创建分类
- 请求方法：POST
- URL：/categories
- 权限要求：需要登录，管理员角色
- 请求参数：
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```

### 获取分类列表
- 请求方法：GET
- URL：/categories
- 权限要求：需要登录
- 查询参数：
  - page：页码（默认：1）
  - limit：每页数量（默认：10）

### 获取分类详情
- 请求方法：GET
- URL：/categories/:id
- 权限要求：需要登录

### 更新分类
- 请求方法：PATCH
- URL：/categories/:id
- 权限要求：需要登录，管理员角色
- 请求参数：
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```

### 删除分类
- 请求方法：DELETE
- URL：/categories/:id
- 权限要求：需要登录，管理员角色