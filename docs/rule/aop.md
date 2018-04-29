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

:::tip
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

贴一个简单的controller（左边的箭头表示AOP拦截了）。请对比 [程序员你为什么这么累？][1]里面原来的代码查看，没有对比就没有伤害。

![controller][3]



最后说一句，** 有统一的接口定义规范，然后有AOP实现，先有思想再有技术**。技术不是关键，AOP技术也很简单，这个帖子的关键点不是技术，而是习惯和思想，不要捡了芝麻丢了西瓜。网络上讲技术的贴多，讲习惯、风格的少，这些都是我工作多年的行之有效的经验之谈，望有缘人珍惜。


  [1]: http://www.imooc.com/article/27569
  [2]: http://www.imooc.com/article/27664
  [3]: //img.mukewang.com/5ae2af5a0001051b07090460.jpg
  [4]: https://github.com/xwjie/PLMCodeTemplate