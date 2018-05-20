# shell常用命令

* whereis  软件名   -->查看软件安装路径

```
[root@ ~]# whereis maven
maven: /etc/maven /usr/share/maven
```

* ps aux  | grep mvn

* nohup mvn spring-boot:run

* kill -9 111

* start mvn spring-boot:run

* 启动mongodb

/usr/local/mongodb/bin/mongod -dbpath=/usr/dbdata --fork --port 27017 --logpath=/usr/local/mongodb/log/work.log --logappend --auth

* 查找文件
find / -name httpd.conf 
find / -name httpd*

* YUM
用YUM安装软件包命令：yum install ~
用YUM删除软件包命令：yum remove ~

* 查看端口被那个程序占用
1. Windows平台

在windows命令行窗口下执行：

```
C:\>netstat -aon|findstr "9050"
TCP 127.0.0.1:9050 0.0.0.0:0 LISTENING 2016
```

看到了吗，端口被进程号为2016的进程占用，继续执行下面命令：

```
C:\>tasklist|findstr "2016"
tor.exe 2016 Console 0 16,064 K
```

很清楚吧，tor占用了你的端口。

2. linux

```
lsof -i :80
```