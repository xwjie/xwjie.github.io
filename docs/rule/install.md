# 工程使用说明

## jdk

jdk6+。

## idea
使用了[lombok](https://projectlombok.org/)，需要在IDE里面先安装插件。idea中在 `plugins`里面安装 `lombok` 插件重启即可。

![idea-lombok.png](./images/idea-lombok.png)

在 Idea 里面选择 `source`目录导入`Maven`工程，然后在Tomcat里面运行工程即可。 

idea 中需要先安装tomcat插件。

![idea-tomcat.png](./images/idea-tomcat.png)
![idea-tomcat1.png](./images/idea-tomcat1.png)
![idea-tomcat2.png](./images/idea-tomcat2.png)

启动项目，访问地址 `http://localhost:8080/+[应用名（可为空）]` 即可。

## eclipse / sts

使用了[lombok](https://projectlombok.org/)，需要在IDE里面先安装插件。

然后需要把 `source\src\common` 导入为源代码目录即可。（Eclipse里面在该目录选择右键 "Build Path" -> "Use as Source Folder"）

启动项目，访问地址 `http://localhost:8080/plm` 即可。

## 工程目录结构

![目录结构](./images/project.png)

## 工程界面

![主界面](./images/plm.png)
