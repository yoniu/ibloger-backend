<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# NestJS 博客系统后端

## 简介

本项目大部分由 Trae 完成

基于 NestJS 框架开发的博客系统后端服务，提供用户管理、文章管理、分类管理等核心功能。

## 功能特点

### 用户模块
- 用户注册与登录
- JWT 身份认证
- 用户信息管理
- 权限控制

### 文章模块
- 文章的增删改查
- 文章分类管理
- 支持草稿功能

### 分类模块
- 分类的增删改查
- 分类关联文章

## 技术栈

- **框架**: NestJS
- **数据库**: MySQL
- **认证**: JWT (JSON Web Token)

## 环境要求

- Node.js (>= 14.x)
- MySQL (>= 5.7)
- npm 或 yarn

## 快速开始

### 安装依赖

```bash
$ npm install
```

### 运行项目

```bash
# 开发环境
$ npm run start

# 开发环境（监听模式）
$ npm run start:dev

# 生产环境
$ npm run start:prod
```

### 运行测试

```bash
# 单元测试
$ npm run test

# e2e 测试
$ npm run test:e2e

# 测试覆盖率
$ npm run test:cov
```

## API 文档

启动项目后，访问 `/api` 路径查看完整的 API 文档。

更多接口详情请查看 [API.md](API.md)

[ApiFox](https://j8oy2xb7wf.apifox.cn)

## 项目结构

```
src/
├── auth/          # 认证相关
├── user/          # 用户模块
├── article/       # 文章模块
├── category/      # 分类模块
├── filters/       # 全局过滤器
├── interceptors/  # 全局拦截器
└── main.ts        # 应用入口
```

## 支持

Nest 是一个 MIT 许可的开源项目。如果你想支持这个项目，可以 [点击这里](https://docs.nestjs.com/support) 了解更多。

## 联系方式

- 作者 - [油油](https://200011.net)

## 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。
