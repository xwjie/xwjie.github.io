# AOP实现

我们需要在AOP里面统一处理异常，包装成相同的对象ResultBean给前台。

## ResultBean定义
ResultBean定义带泛型，使用了**lombok**。

```java
@Data
public class ResultBean<T> implements Serializable {

  private static final long serialVersionUID = 1L;

  public static final int NO_LOGIN = -1;

  public static final int SUCCESS = 0;

  public static final int FAIL = 1;

  public static final int NO_PERMISSION = 2;

  private String msg = "success";

  private int code = SUCCESS;

  private T data;

  public ResultBean() {
    super();
  }

  public ResultBean(T data) {
    super();
    this.data = data;
  }

  public ResultBean(Throwable e) {
    super();
    this.msg = e.toString();
    this.code = FAIL;
  }
}
```

## AOP实现

AOP代码，主要就是打印日志和捕获异常，**异常要区分已知异常和未知异常**，其中未知的异常是我们重点关注的，可以做一些邮件通知啥的，已知异常可以再细分一下，可以**不同的异常返回不同的返回码**：

```java
/**
 * 处理和包装异常
 */
public class ControllerAOP {
  private static final Logger logger = LoggerFactory.getLogger(ControllerAOP.class);

  public Object handlerControllerMethod(ProceedingJoinPoint pjp) {
    long startTime = System.currentTimeMillis();

    ResultBean<?> result;

    try {
      result = (ResultBean<?>) pjp.proceed();
      logger.info(pjp.getSignature() + "use time:" + (System.currentTimeMillis() - startTime));
    } catch (Throwable e) {
      result = handlerException(pjp, e);
    }

    return result;
  }
  
  /**
    * 封装异常信息，注意区分已知异常（自己抛出的）和未知异常
    */
  private ResultBean<?> handlerException(ProceedingJoinPoint pjp, Throwable e) {
    ResultBean<?> result = new ResultBean();

    // 已知异常
    if (e instanceof CheckException) {
      result.setMsg(e.getLocalizedMessage());
      result.setCode(ResultBean.FAIL);
    } else if (e instanceof UnloginException) {
      result.setMsg("Unlogin");
      result.setCode(ResultBean.NO_LOGIN);
    } else {
      logger.error(pjp.getSignature() + " error ", e);
      //TODO 未知的异常，应该格外注意，可以发送邮件通知等
      result.setMsg(e.toString());
      result.setCode(ResultBean.FAIL);
    }

    return result;
  }
}
```

:::tip 晓风轻建议
对于未知异常，给相关责任人发送邮件通知，第一时间知道异常，实际工作中非常有意义。
:::

## 返回码定义

关于怎么样定义返回码，个人经验是 **粗分异常，不能太细**。如没有登陆返回-1，没有权限返回-2，参数校验错误返回1，其他未知异常返回-99等。需要注意的是，定义的时候，**需要调用方单独处理的异常**需要和其他区分开来，比如没有登陆这种异常，调用方不需要单独处理，前台调用请求的工具类统一处理即可。而参数校验异常或者没有权限异常需要调用方提示给用户，没有权限可能除了提示还会附上申请权限链接等，这就是异常的粗分。

:::danger
返回码不要太细，千万不要标题为空返回1，描述为空返回2，字段X非法返回3，这种定义看上去很专业，实际上会把前台和自己累死。
:::

## AOP配置

关于用java代码还是xml配置，这里我倾向于xml配置，因为这个会不定期改动

```xml
<!-- aop -->
  <aop:aspectj-autoproxy />
  <beans:bean id="controllerAop" class="xxx.common.aop.ControllerAOP" />
  <aop:config>
    <aop:aspect id="myAop" ref="controllerAop">
      <aop:pointcut id="target"
        expression="execution(public xxx.common.beans.ResultBean *(..))" />
      <aop:around method="handlerControllerMethod" pointcut-ref="target" />
    </aop:aspect>
  </aop:config>
```

现在知道为什么要返回统一的一个ResultBean了：

* 为了统一格式
* 为了应用AOP
* 为了包装异常信息

分页的PageResultBean大同小异，大家自己依葫芦画瓢自己完成就好了。


## 简单示例

贴一个简单的controller。请对比 [程序员你为什么这么累？][1]里面原来的代码查看，没有对比就没有伤害。

```java
/**
 * 配置对象处理器
 * 
 * @author 晓风轻 https://github.com/xwjie/PLMCodeTemplate
 */
@RequestMapping("/config")
@RestController
public class ConfigController {

  private final ConfigService configService;

  public ConfigController(ConfigService configService) {
    this.configService = configService;
  }

  @GetMapping("/all")
  public ResultBean<Collection<Config>> getAll() {
    return new ResultBean<Collection<Config>>(configService.getAll());
  }

  /**
   * 新增数据, 返回新对象的id
   * 
   * @param config
   * @return
   */
  @PostMapping("/add")
  public ResultBean<Long> add(Config config) {
    return new ResultBean<Long>(configService.add(config));
  }

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

  @PostMapping("/update")
  public ResultBean<Boolean> update(Config config) {
    configService.update(config);
    return new ResultBean<Boolean>(true);
  }
}
```


## 为什么不用ExceptionHandler

这是我发帖后问的最多的一个问题，很多人说为什么不用 ControllerAdvice + ExceptionHandler 来处理异常？觉得是我在重复发明轮子。首先，这2这都是AOP，本质上没有啥区别。而最重要的是ExceptionHandler只能处理异常，而我们的AOP除了处理异常，还有一个很重要的作用是打印日志，统计每一个controller方法的耗时，这在实际工作中也非常重要和有用的特性！

:::tip
就算你使用ExceptionHandler，也不要成功和失败的时候返回不一样的数据格式，否则前台很难写好代码。
:::

## 为什么不用Restful风格

这也是问的比较多的一个问题。如果你提供的接口是给前台调用的，而你又在实际工作中前后台开发都负责的话，我觉得你应该不会问这个问题。诚然，restful风格的定义很优雅，但是在前台调用起来却非常的麻烦，前台通过返回的ResultBean的code来判断成功失败显然比通过http状态码来判断方便太多。第2个原因，使用http状态码返回出错信息也值得商榷。系统出错了返回400我觉得没有问题，但一个参数校验不通过也返回400，我个人觉得是很不合理的，是无法接受的。



:::tip 晓风轻总结
**有统一的接口定义规范，然后有AOP实现，先有思想再有技术**。技术不是关键，AOP技术也很简单，这个帖子的关键点不是技术，而是习惯和思想，不要捡了芝麻丢了西瓜。网络上讲技术的贴多，讲习惯、风格的少，这些都是我工作多年的行之有效的经验之谈，望有缘人珍惜。
:::





  [1]: http://www.imooc.com/article/27569