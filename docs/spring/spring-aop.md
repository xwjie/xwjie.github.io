# spring支持aop

## 配置

xmlns:aop="http://www.springframework.org/schema/aop"
> xsd路径不要写错，可以参考看aop的jar包

http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop.xsd

## 默认已经有AOP的包了，增加 aspectjweaver 即可。

```xml
<!-- https://mvnrepository.com/artifact/org.aspectj/aspectjweaver -->
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
    <version>1.8.10</version>
</dependency>
```
## 切返回指定类型的方法
```xml
<!-- aop -->
<aop:aspectj-autoproxy />
<beans:bean id="controllerAop" class="com.huawei.plm.common.aop.ControllerAOP" />

<aop:config>
	<aop:aspect id="myAop" ref="controllerAop">
		<aop:pointcut id="target" expression="execution(public com.huawei.plm.common.beans.ResultBean *(..))" />
		<!-- 
		<aop:before method="checkValidity" pointcut-ref="target" /> 
		<aop:after method="addLog" pointcut-ref="target" />
		-->

		<aop:around method="handlerControllerMethod" pointcut-ref="target" />
	</aop:aspect>
</aop:config>
```

## 强制使用cglib

To force the use of CGLIB proxies set the value of the proxy-target-class attribute of the <aop:config> element to true:

```xml
<aop:config proxy-target-class="true">
    <!-- other beans defined here... -->
</aop:config>
```

## java代码

```java
public class ControllerAOP {
	public ResultBean<?> handlerControllerMethod(ProceedingJoinPoint pjp) {}
}
```