# Controller规范

第一篇文章中，我贴了2段代码，第一个是原生态的，第2段是我指定了接口定义规范，使用AOP技术之后最终交付的代码，从15行到1行，自己感受一下。今天来说说大家关注的AOP如何实现。


先说说Controller规范，主要的内容是就是[接口定义][2]里面的内容，你只要遵循里面的规范，controller就问题不大，除了这些，还有另外的几点：


## 统一返回ResultBean对象

所有函数返回统一的ResultBean/PageResultBean格式，原因见我的接口定义这个贴。没有统一格式，AOP无法玩。当然类名你可以按照自己喜好随便定义，如就叫Result。


## ResultBean不允许往后传

ResultBean/PageResultBean是controller专用的，不允许往后传！往其他地方传之后，可读性立马下降，和传map，json好不了多少。

## Controller只做参数格式的转换

Controller做参数格式的转换，不允许把json，map这类对象传到services去，也不允许services返回json、map。写过代码都知道，map，json这种格式灵活，但是可读性差（
编码一时爽，重构火葬场）。如果放业务数据，每次阅读起来都十分困难，需要从头到尾看完才知道里面有什么，是什么格式。定义一个bean看着工作量多了，但代码清晰多了。



## 参数不允许出现Request，Response 这些对象

和json/map一样，主要是可读性差的问题。一般情况下不允许出现这些参数，除非要操作流。


## 不需要打印日志

日志在AOP里面会打印，而且我的建议是大部分日志在Services这层打印。

:::tip 晓风轻建议
Contorller只做参数格式转换，如果没有参数需要转换的，那么就一行代码。日志/参数校验/权限判断建议放到service里面，毕竟controller基本无法重用，而service重用较多。而我们的单元测试也不需要测试controller，直接测试service即可。
:::

规范里面大部分是 **不要做的项多，要做的比较少**，落地比较容易。

  [1]: http://www.imooc.com/article/27569
  [2]: http://www.imooc.com/article/27664
  [3]: //img.mukewang.com/5ae2af5a0001051b07090460.jpg
  [4]: https://github.com/xwjie/PLMCodeTemplate