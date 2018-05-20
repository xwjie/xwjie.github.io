# spring动态注入bean

## 使用的 registerSingleton 方法

```java
public void registerBean(String name, Object obj) {

	// 获取BeanFactory
	DefaultListableBeanFactory defaultListableBeanFactory = (DefaultListableBeanFactory) ctx
			.getAutowireCapableBeanFactory();

	// 动态注册bean.
	defaultListableBeanFactory.registerSingleton(name, obj);
}
```

## 另外一种

```java
ApplicationContext ac = WebApplicationContextUtils.getRequiredWebApplicationContext(request.getServletContext());  
ConfigurableApplicationContext context = (ConfigurableApplicationContext) ac;   
//Bean的实例工厂  
DefaultListableBeanFactory dbf = (DefaultListableBeanFactory) context.getBeanFactory();  
//Bean构建  BeanService.class 要创建的Bean的Class对象  
BeanDefinitionBuilder dataSourceBuider = BeanDefinitionBuilder. genericBeanDefinition(BeanService.class);  
//向里面的属性注入值，提供get set方法  
dataSourceBuider.addPropertyValue("msg", "hello ");  
//dataSourceBuider.setParentName("");  同配置 parent  
//dataSourceBuider.setScope("");   同配置 scope  
//将实例注册spring容器中   bs 等同于  id配置  
dbf.registerBeanDefinition("bs", dataSourceBuider.getBeanDefinition());  
```
 
>注要使用刚注册的 必须通过   getBean("xx")的方式 。这种方式还多用于在**过滤器**中获取容器对象，因为spring不能为**过滤器**注入任何属性  


## 另外一种方法

```java
public void registerBean2(String name, Class<?> beanClass) {
	// 获取BeanFactory
	DefaultListableBeanFactory defaultListableBeanFactory = (DefaultListableBeanFactory) ctx
			.getAutowireCapableBeanFactory();

	// 创建bean信息.
	BeanDefinitionBuilder beanDefinitionBuilder = BeanDefinitionBuilder.genericBeanDefinition(beanClass);

	// beanDefinitionBuilder.addPropertyValue("name","张三");

	// 动态注册bean.
	defaultListableBeanFactory.registerBeanDefinition(name, beanDefinitionBuilder.getBeanDefinition());
}
```