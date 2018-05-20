# npm

## 清楚缓存

```
npm cache clean

--reset-cache

node node_modules/react-native/local-cli/cli.js start --reset-cache
"scripts": {
    "start": "node node_modules/react-native/local-cli/cli.js start --reset-cache",
```

## 增加用户
```
$ npm adduser    
Username: your name
Password: your password
Email: yourmail[@gmail](/user/gmail).com
```

成功之后，npm会把认证信息存储在~/.npmrc中，并且可以通过以下命令查看npm当前使用的用户：

```
$ npm whoami
```

## 发布组件

```
npm init
```

 
   
