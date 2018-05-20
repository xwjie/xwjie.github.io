# 正确实现用spring扫描自定义的annotation， BeanPostProcessor

http://www.importnew.com/22934.html

在使用spring时，有时候有会有一些 `自定义annotation` 的需求，比如一些Listener的回调函数。

比如：

```java
@Service
public class MyService {
    @MyListener
    public void onMessage(Message msg){
    }
}
```

一开始的时候，我是在Spring的 `ContextRefreshedEvent` 事件里，通过 `context.getBeansWithAnnotation(Component.class) ` 来获取到所有的bean，然后再检查method是否有 `@MyListener` 的 `annotation`。

后来发现这个方法有缺陷，当有一些spring bean的 `@Scope` 设置为 `session/request` 时，创建bean会失败。

参考：
http://docs.spring.io/spring/docs/current/spring-framework-reference/htmlsingle/#beans-factory-scopes

在网上搜索了一些资料，发现不少人都是用 `context.getBeansWithAnnotation(Component.class)` ，这样子来做的，但是这个方法并不对。

## BeanPostProcessor接口

后来看了下spring jms里的@JmsListener的实现，发现实现BeanPostProcessor接口才是最合理的办法。

```java
public interface BeanPostProcessor {
 
    /**
     * Apply this BeanPostProcessor to the given new bean instance <i>before</i> any bean
     * initialization callbacks (like InitializingBean's {@code afterPropertiesSet}
     * or a custom init-method). The bean will already be populated with property values.
     * The returned bean instance may be a wrapper around the original.
     * @param bean the new bean instance
     * @param beanName the name of the bean
     * @return the bean instance to use, either the original or a wrapped one;
     * if {@code null}, no subsequent BeanPostProcessors will be invoked
     * @throws org.springframework.beans.BeansException in case of errors
     * @see org.springframework.beans.factory.InitializingBean#afterPropertiesSet
     */
    Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException;
 
    /**
     * Apply this BeanPostProcessor to the given new bean instance <i>after</i> any bean
     * initialization callbacks (like InitializingBean's {@code afterPropertiesSet}
     * or a custom init-method). The bean will already be populated with property values.
     * The returned bean instance may be a wrapper around the original.
     * <p>In case of a FactoryBean, this callback will be invoked for both the FactoryBean
     * instance and the objects created by the FactoryBean (as of Spring 2.0). The
     * post-processor can decide whether to apply to either the FactoryBean or created
     * objects or both through corresponding {@code bean instanceof FactoryBean} checks.
     * <p>This callback will also be invoked after a short-circuiting triggered by a
     * {@link InstantiationAwareBeanPostProcessor#postProcessBeforeInstantiation} method,
     * in contrast to all other BeanPostProcessor callbacks.
     * @param bean the new bean instance
     * @param beanName the name of the bean
     * @return the bean instance to use, either the original or a wrapped one;
     * if {@code null}, no subsequent BeanPostProcessors will be invoked
     * @throws org.springframework.beans.BeansException in case of errors
     * @see org.springframework.beans.factory.InitializingBean#afterPropertiesSet
     * @see org.springframework.beans.factory.FactoryBean
     */
    Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException;
 
}
```

所有的bean在创建完之后，都会回调 `postProcessAfterInitialization` 函数，这时就可以确定bean是已经创建好的了。

所以**扫描自定义的annotation**的代码大概是这个样子的：

```java
public class MyListenerProcessor implements BeanPostProcessor {
    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        return bean;
    }
 
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        Method[] methods = ReflectionUtils.getAllDeclaredMethods(bean.getClass());
        if (methods != null) {
            for (Method method : methods) {
                MyListener myListener = AnnotationUtils.findAnnotation(method, MyListener.class);
                // process
            }
        }
        return bean;
    }
}
```

## SmartInitializingSingleton 接口

看spring jms的代码时，发现SmartInitializingSingleton 这个接口也比较有意思。

就是当所有的singleton的bean都初始化完了之后才会回调这个接口。不过要注意是 **4.1 之后**才出现的接口。

```java
public interface SmartInitializingSingleton {
 
    /**
     * Invoked right at the end of the singleton pre-instantiation phase,
     * with a guarantee that all regular singleton beans have been created
     * already. {@link ListableBeanFactory#getBeansOfType} calls within
     * this method won't trigger accidental side effects during bootstrap.
     * <p><b>NOTE:</b> This callback won't be triggered for singleton beans
     * lazily initialized on demand after {@link BeanFactory} bootstrap,
     * and not for any other bean scope either. Carefully use it for beans
     * with the intended bootstrap semantics only.
     */
    void afterSingletonsInstantiated(); 
}
```

https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/beans/factory/SmartInitializingSingleton.html