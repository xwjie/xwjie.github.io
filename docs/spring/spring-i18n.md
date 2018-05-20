#  国际化和静态注入

* xml
```xml
<!-- 国际化 -->
<bean id="messageSource"
	class="org.springframework.context.support.ResourceBundleMessageSource">
	<property name="basenames">
		<list>
			<value>format</value>
			<value>exceptions</value>
			<value>windows</value>
		</list>
	</property>
</bean>

<bean
	class="org.springframework.beans.factory.config.MethodInvokingFactoryBean">
	<!-- 指向上面的sysProps Bean -->
	<property name="staticMethod" value="com.huawei.plm.common.utils.CheckUtil.setResources" />
	<!-- 这里配置参数 -->
	<property name="arguments" ref="messageSource">
	</property>
</bean>
```

* java

```java
public class CheckUtil {
	private static final Object[] NullArgs = new Object[0];

	private static MessageSource resources;

	public static void setResources(MessageSource resources) {
		CheckUtil.resources = resources;
	}

	private static void fail(String msgKey) {
		throw new CheckException(resources.getMessage(msgKey, NullArgs, Locale.getDefault()));
	}
}
```