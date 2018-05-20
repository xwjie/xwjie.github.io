# Cookie

## document.cookie

"cookienoparam=cookienoparamcookienoparam; cookiename=cookievalue"

js 的 document上也可以增加cookie

document.cookie='a=b';
	"a=b"

document.cookie
	"cookienoparam=cookienoparamcookienoparam; a=b; cookiename=cookievalue"

## 会话cookie和持久cookie的区别

如果不设置过期时间，则表示这个cookie生命周期为浏览器会话期间，只要关闭浏览器窗口，cookie就消失了。这种生命期为浏览会话期的cookie被称为会话cookie。会话cookie一般不保存在硬盘上而是保存在内存里。

如果设置了过期时间，浏览器就会把cookie保存到硬盘上，关闭后再次打开浏览器，这些cookie依然有效直到超过设定的过期时间。

存储在硬盘上的cookie可以在不同的浏览器进程间共享，比如两个IE窗口。而对于保存在内存的cookie，不同的浏览器有不同的处理方式。

## 如何为cookie 设置 HttpOnly  

将cookie设置成HttpOnly是为了 `防止XSS攻击`，窃取cookie内容，这样就增加了cookie的安全性，即便是这样，也不要将重要信息存入cookie。

如何在Java中设置cookie是HttpOnly呢？

Servlet 2.5 API 不支持 cookie设置HttpOnly
http://docs.oracle.com/cd/E17802_01/products/products/servlet/2.5/docs/servlet-2_5-mr2/

```xml
<!-- Servlet -->
		<dependency>
			<groupId>javax.servlet</groupId>
			<artifactId>servlet-api</artifactId>
			<version>2.5</version>
			<scope>provided</scope>
		</dependency>
```

建议升级Tomcat7.0，它已经实现了Servlet3.0
http://tomcat.apache.org/tomcat-7.0-doc/servletapi/javax/servlet/http/Cookie.html

但是苦逼的是现实是，老板是不会让你升级的。那就介绍另外一种办法：

利用 `HttpResponse` 的 `addHeader` 方法，设置 `Set-Cookie` 的值

cookie字符串的格式：`key=value; Expires=date; Path=path; Domain=domain; Secure; HttpOnly`

```java
//设置cookie
response.addHeader("Set-Cookie", "uid=112; Path=/; HttpOnly");

//设置多个cookie
response.addHeader("Set-Cookie", "uid=112; Path=/; HttpOnly");
response.addHeader("Set-Cookie", "timeout=30; Path=/test; HttpOnly");

//设置https的cookie
response.addHeader("Set-Cookie", "uid=112; Path=/; Secure; HttpOnly");
```

## HttpSession常见问题 

（在本小节中session的含义为⑤和⑥的混合） 

### 1、session在何时被创建 

一个常见的误解是以为session在有客户端访问时就被创建，然而事实是直到某server端程序调用 HttpServletRequest.getSession(true)这样的语句时才被创建，注意如果JSP没有显示的使用 <% @page session="false"%> 关闭session，则JSP文件在编译成Servlet时将会自动加上这样一条语句 HttpSession session = HttpServletRequest.getSession(true);这也是JSP中隐含的 session对象的来历。 

由于session会消耗内存资源，因此，如果不打算使用session，应该在所有的JSP中关闭它。 

### 2、session何时被删除 

综合前面的讨论，session在下列情况下被删除

* a.程序调用HttpSession.invalidate();
* 或 b.距离上一次收到客户端发送的session id时间间隔超过了session的超时设置;
* 或 c.服务器进程被停止（非持久session） 

### 3、如何做到在浏览器关闭时删除session 

严格的讲，做不到这一点。可以做一点努力的办法是在所有的客户端页面里使用javascript代码window.oncolose来监视浏览器的关闭动作，然后向服务器发送一个请求来删除session。但是对于浏览器崩溃或者强行杀死进程这些非常规手段仍然无能为力。 

### 4、有个HttpSessionListener是怎么回事 

你可以创建这样的listener去监控session的创建和销毁事件，使得在发生这样的事件时你可以做一些相应的工作。注意是session的创建和销毁动作触发listener，而不是相反。类似的与HttpSession有关的listener还有 HttpSessionBindingListener，HttpSessionActivationListener和 HttpSessionAttributeListener。 

### 5、存放在session中的对象必须是可序列化的吗 

不是必需的。要求对象可序列化只是为了session能够在集群中被复制或者能够持久保存或者在必要时server能够暂时把session交换出内存。在 Weblogic Server的session中放置一个不可序列化的对象在控制台上会收到一个警告。我所用过的某个iPlanet版本如果 session中有不可序列化的对象，在session销毁时会有一个Exception，很奇怪。 