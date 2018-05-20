# Docker


## 启动容器

```
docker run -it -p 80:80 -d <image_id>
```

## 进入镜像的shell

```
docker run -t -i ubuntu /bin/bash
```

官网是这么说的：

```
docker run: runs a container.
ubuntu: is the image you would like to run.
-t: flag assigns a pseudo-tty or terminal inside the new container.
-i: flag allows you to make an interactive connection by grabbing the standard in (STDIN) of the container.
/bin/bash: launches a Bash shell inside our container.

```

docker run：启动container
ubuntu：你想要启动的image
-t：进入终端
-i：获得一个交互式的连接，通过获取container的输入
/bin/bash：在container中启动一个bash shell

这样就进入container的内部了：

|root@af8bae53bdd3:/#

## 进入运行中的container

```
docker exec -it <container_id> bash
```

## copy文件进去或者copy出来

```
docker cp ntuser.ini 09:/var/www/html
docker cp 09:/var/www/html/index.html d:/
```

09为containeid的前2位。

## 查看容器

```
docker ps 
docker ps -a
```

## docker容器中安装vim

先 apt-get update  重新获取软件包列表 ， 然后 apt-get install vim 安装即可。

```
apt-get install curl
apt-get install net-tools //netstat
```

## 提交修改

```
docker commit -a xiaofengqing -m 'install vim,curl,net-tools' a4 myubuntu
```

## rename image 

iamge 无法重命名，只能用tag 新建一个

```
docker tag <image_id> <新名字>
```

## delete image

```
docker rmi <image_id>
```

## 容器操作

### 重命名

```
docker rename a1917ec9b776 ng
```

### 查看详细

```
docker top ng
```

### 查看容器中运行着哪些进程

```
docker top nginx_dist
UID     PID      PPID     C     STIME     TTY    TIME         CMD
root    24378    18471    0     15:25     ?      00:00:00     nginx: master process nginx -g daemon off;
101     24433    24378    0     15:25     ?      00:00:00     nginx: worker process
```

### 查看容器IP和主机等信息

```
docker inspect nginx_dist |grep 172.17
        "Gateway": "172.17.42.1",
        "IPAddress": "172.17.42.6",
```

连接到容器上，--sig-proxy可以保证 Ctrl+D、Ctrl+C 不会退出

```
 docker attach --sig-proxy=false nginx_dist 
```

## 设置一些别名

```
alias c='docker container ls'
alias d='docker'
alias i='docker images'
alias ll='ls -l'
alias ls='ls -F --color=auto --show-control-chars'
alias r='docker run -i -t -d'
```


## 下载boot2docker

启动的时候会去github下载镜像，手工下载放到这个目录。(用迅雷下载，慢了就暂停再开始，能达到40-60k每秒)

(default) Downloading C:\Users\Administrator\.docker\machine\cache\boot2docker.iso from https://github.com/boot2docker/boot2docker/releases/download/v17.11.0-ce/boot2docker.iso...

C:\Users\Administrator\.docker\machine\cache\boot2docker.iso

刚刚过了几天，最新版怎么变成了下面的了？

(default) Downloading C:\Users\Administrator\.docker\machine\cache\boot2docker.iso from https://github.com/boot2docker/boot2docker/releases/download/v17.09.1-ce/boot2docker.iso...

## 阿里云docker

登录阿里云docker registry:

$ sudo docker login --username=xwjie2016 registry.cn-hangzhou.aliyuncs.com
登录registry的用户名是您的阿里云账号全名，密码是您开通服务时设置的密码。

你可以在镜像管理首页点击右上角按钮修改docker login密码。

从registry中拉取镜像：

```
$ sudo docker pull registry.cn-hangzhou.aliyuncs.com/xiaofengqing/main:[镜像版本号]
将镜像推送到registry：

$ sudo docker login --username=xwjie2016 registry.cn-hangzhou.aliyuncs.com
$ sudo docker tag [ImageId] registry.cn-hangzhou.aliyuncs.com/xiaofengqing/main:[镜像版本号]
$ sudo docker push registry.cn-hangzhou.aliyuncs.com/xiaofengqing/main:[镜像版本号]
其中[ImageId],[镜像版本号]请你根据自己的镜像信息进行填写。
```

## 搜索镜像

https://dev.aliyun.com/search.html

搜索到之后，里面已经有命令，直接复制下来。

```
docker pull registry.cn-zhangjiakou.aliyuncs.com/cytong/redis
docker pull registry.cn-hangzhou.aliyuncs.com/wangbs/mongodb
```

## daocloud 

http://026460a6.m.daocloud.io