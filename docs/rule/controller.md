#Controller规范

第一篇文章中，我贴了2段代码，第一个是原生态的，第2段是我指定了接口定义规范，使用AOP技术之后最终交付的代码，从15行到1行，自己感受一下。今天来说说大家关注的AOP如何实现。


先说说Controller规范，主要的内容是就是[接口定义][2]里面的内容，你只要遵循里面的规范，controller就问题不大，除了这些，还有另外的几点：


## 1  所有函数返回统一的ResultBean/PageResultBean格式

原因见我的接口定义这个贴。没有统一格式，AOP无法玩。


## 2 ResultBean/PageResultBean是controller专用的，不允许往后传！


## 3 Controller做参数格式的转换，不允许把json，map这类对象传到services去，也不允许services返回json、map。

一般情况下！写过代码都知道，map，json这种格式灵活，但是可读性差，如果放业务数据，每次阅读起来都比较困难。定义一个bean看着工作量多了，但代码清晰多了。



## 4 参数中一般情况不允许出现Request，Response这些对象

主要是可读性问题。一般情况下不允许，除非要操作流。



## 5 不需要打印日志

日志在AOP里面会打印，而且我的建议是大部分日志在Services这层打印。



规范里面大部分是 **不要做的项多，要做的比较少**，落地比较容易。



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

**AOP配置：**(关于用java代码还是xml配置，这里我倾向于xml配置，因为这个会不定期改动)

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



贴一个简单的controller（左边的箭头表示AOP拦截了）。请对比 [程序员你为什么这么累？][1]里面原来的代码查看，没有对比就没有伤害。

![controller][3]



最后说一句，**先有统一的接口定义规范，然后有AOP实现。先有思想再有技术。**技术不是关键，AOP技术也很简单，这个帖子的关键点不是技术，而是习惯和思想，不要捡了芝麻丢了西瓜。网络上讲技术的贴多，讲习惯、风格的少，这些都是我工作多年的行之有效的经验之谈，望有缘人珍惜。


# =============GITHUB地址==============

所有的代码细节都在已经上了github了，地址 [xwjie/PLMCodeTemplate][4]，欢迎加星。有问题欢迎提出。

觉得有用请点赞加关注，加星，fork，：）

  [1]: http://www.imooc.com/article/27569
  [2]: http://www.imooc.com/article/27664
  [3]: //img.mukewang.com/5ae2af5a0001051b07090460.jpg
  [4]: https://github.com/xwjie/PLMCodeTemplate