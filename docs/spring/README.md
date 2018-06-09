# Spring笔记

很老的一些笔记。不知道还能不能用了。

## 注解
* @EnableXXX
* @EventListener
* 多个bean `@Primary`
```java
@Bean(name = "A", initMethod = "init",destroyMethod="close" )
@Primary
```

## 接口
* BeanDefinitionRegistryPostProcessor 接口的使用
* BeanPostProcessor（postProcessBeforeInitialization/postProcessAfterInitialization） / BeanFactoryPostProcessor
* ServletRegistrationBean/FilterRegistrationBean/ServletListenerRegistrationBean 
* ApplicationContextAware / BeanFactoryAware / BeanNameAware
* InitializingBean / DisposableBean
