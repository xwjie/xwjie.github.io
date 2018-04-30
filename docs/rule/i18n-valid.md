# 参数校验和国际化

今天我们说说参数校验和国际化，**这些代码没有什么技术含量，却大量充斥在业务代码上**，很可能业务代码只有几行，参数校验代码却有十几行，非常影响代码阅读，所以很有必要把这块的代码量减下去。

今天的目的主要是把之前例子里面的和业务无关的国际化参数隐藏掉，以及如何封装好校验函数。


## 修改前代码

* controller代码
```java
/**
 * ！！！错误范例
 *
 *  根据id删除对象
 * 
 * @param id
 * @param lang
 * @return
 */
@PostMapping("/delete")
public Map<String, Object> delete(long id, String lang) {
  Map<String, Object> data = new HashMap<String, Object>();

  boolean result = false;
  try {
    // 语言（中英文提示不同）
    Locale local = "zh".equalsIgnoreCase(lang) ? Locale.CHINESE
        : Locale.ENGLISH;

    result = configService.delete(id, local);

    data.put("code", 0);

  } catch (CheckException e) {
    // 参数等校验出错，已知异常，不需要打印堆栈，返回码为-1
    data.put("code", -1);
    data.put("msg", e.getMessage());
  } catch (Exception e) {
    // 其他未知异常，需要打印堆栈分析用，返回码为99
    log.error("delete config error", e);

    data.put("code", 99);
    data.put("msg", e.toString());
  }

  data.put("result", result);

  return data;
}
```

其中的lang参数我们需要去掉


* service代码

```java
/**
 * ！！！错误示范
 * 
 * 出现和业务无关的参数local
 * 
 * @param id
 * @param locale
 * @return
 */
public boolean delete(long id, Locale locale) {
  // 参数校验
  if (id <= 0L) {
    if (locale.equals(Locale.CHINESE)) {
      throw new CheckException("非法的ID：" + id);
    } else {
      throw new CheckException("Illegal ID:" + id);
    }
  }

  boolean result = dao.delete(id);

  // 修改操作需要打印操作结果
  logger.info("delete config success, id:" + id + ", result:" + result);

  return dao.delete(id);
}
 ```



## 修改后代码

* controller代码

```java
/**
 * 根据id删除对象
 * 
 * @param id
 * @return
 */
@PostMapping("/delete")
public ResultBean<Boolean> delete(long id) {
  return new ResultBean<Boolean>(configService.delete(id));
}
```


* service代码

```java
public boolean delete(long id) {
  // 参数校验
  check(id > 0L, "id.error", id);

  boolean result = dao.delete(id);

  // 修改操作需要打印操作结果
  logger.info("delete config success, id: {}, result: {}", id, result);

  return result;
}
```


Controll的非业务代码如何去掉参考 Controller规范，下面说说去掉Local参数。


:::tip
业务代码里面不要出现和业务无关的东西，如local，MessageSource 。
:::


去掉国际化参数还是使用的技术还是**ThreadLocal**。国际化信息可以放好几个地方，但建议不要放在每一个url上，除了比较low还容易出很多其他问题。这里演示的是放在cookie上面的例子：


## 用户工具类UserUtil

需要保存用户的国际化信息。

```java
public class UserUtil {

  private final static ThreadLocal<String> tlUser = new ThreadLocal<String>();

  private final static ThreadLocal<Locale> tlLocale = new ThreadLocal<Locale>() {
    protected Locale initialValue() {
      // 语言的默认值
      return Locale.CHINESE;
    };
  };

  public static final String KEY_LANG = "lang";

  public static final String KEY_USER = "user";

  public static void setUser(String userid) {
    tlUser.set(userid);

    // 把用户信息放到log4j
    MDC.put(KEY_USER, userid);
  }

  public static String getUser() {
    return tlUser.get();
  }

  public static void setLocale(String locale) {
    setLocale(new Locale(locale));
  }

  public static void setLocale(Locale locale) {
    tlLocale.set(locale);
  }

  public static Locale getLocale() {
    return tlLocale.get();
  }

  public static void clearAllUserInfo() {
    tlUser.remove();
    tlLocale.remove();

    MDC.remove(KEY_USER);
  }
}
```

## 校验工具类CheckUtil

这里需要调用用户工具类得到用户的语言。还有就是提示信息里面，需要支持传入变量。

```java
package plm.common.utils;

import org.springframework.context.MessageSource;

import plm.common.exceptions.CheckException;

public class CheckUtil {
  private static MessageSource resources;

  public static void setResources(MessageSource resources) {
    CheckUtil.resources = resources;
  }

  public static void check(boolean condition, String msgKey, Object... args) {
    if (!condition) {
      fail(msgKey, args);
    }
  }

  public static void notEmpty(String str, String msgKey, Object... args) {
    if (str == null || str.isEmpty()) {
      fail(msgKey, args);
    }
  }

  public static void notNull(Object obj, String msgKey, Object... args) {
    if (obj == null) {
      fail(msgKey, args);
    }
  }

  private static void fail(String msgKey, Object... args) {
    throw new CheckException(resources.getMessage(msgKey, args, UserUtil.getLocale()));
  }
}
```

这里有几个小技术点：

## spring的静态方法注入

工具类里面使用spring的bean，使用了MethodInvokingFactoryBean的静态方法注入：

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
  <property name="staticMethod" value="plm.common.utils.CheckUtil.setResources" />
  <!-- 这里配置参数 -->
  <property name="arguments" ref="messageSource">
  </property>
</bean>
```

## jdk 的 import static
server里面调用 `check` 方法的时候没有出现类名。这里使用的jdk的import static 特性，可以在ide上配置，请自行google。

```java
 import static plm.common.utils.CheckUtil.*;
```

还有一小点注意，我建议参数非法的时候，**把非法值打印出来**，否则你又要浪费时间看是没有传呢还是传错了，时间就是这样一点点浪费的。

```java
 check(id > 0L, "id.error", id); // 当前非法的id也传入提示出去
```


另外有些项目用valid来校验，从我实际接触来看，用的不多，可能是有短木板吧。如果你的项目valid就能满足，那就更加好了，不需要看了。但是大部分场景，校验比例子复杂N多，提示也千变万化，所以我们还是自己调用函数校验。


做了这几步之后，代码会漂亮很多，记住，代码最主要的不是性能，而是可读性，有了可读性才有才维护性。而去掉无关的代码后的代码，和之前的代码对比一下，自己看吧。
