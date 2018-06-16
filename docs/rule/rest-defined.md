# 接口定义常见问题

工作中，少不了要定义各种接口，系统集成要定义接口，前后台掉调用也要定义接口。接口定义一定程度上能反应程序员的编程功底。列举一下工作中我发现大家容易出现的问题：

## 返回格式不统一

同一个接口，有时候返回数组，有时候返回单个；成功的时候返回对象，失败的时候返回错误信息字符串。工作中有个系统集成就是这样定义的接口，真是辣眼睛。这个对应代码上，返回的类型是map，json，object，都是不应该的。实际工作中，我们会定义一个统一的格式，就是ResultBean，分页的有另外一个PageResultBean


::: danger 错误范例
返回map可读性不好，不知道里面是什么
:::
```java
@PostMapping("/delete")
public Map<String, Object> delete(long id, String lang) {

}
```
::: danger 错误范例
成功返回boolean，失败返回string，大忌
:::
```java
@PostMapping("/delete")
public Object delete(long id, String lang) {
  try {
    boolean result = configService.delete(id, local);
    return result;
  } catch (Exception e) {
    log.error(e);
    return e.toString();
  }
}
```

## 没有考虑失败情况

一开始只考虑成功场景，等后面测试发现有错误情况，怎么办，改接口呗，前后台都改，劳民伤财无用功。

::: danger 错误范例
不返回任何数据，没有考虑失败场景，容易返工
:::
```java
@PostMapping("/update")
public void update(long id, xxx) {

}
```

## 出现和业务无关的输入参数

如lang语言，当前用户信息 都不应该出现参数里面，应该从**当前会话**里面获取。后面讲ThreadLocal会说到怎么样去掉。除了代码可读性不好问题外，尤其是参数出现当前用户信息的，这是个严重问题。

::: danger 错误范例
（当前用户删除数据）参数出现lang和userid，尤其是userid，大忌
:::
```java
@PostMapping("/delete")
public Map<String, Object> delete(long id, String lang, String userId) {

}
```

## 出现复杂的参数

一般情况下，不允许出现例如json字符串这样的参数，这种参数可读性极差。应该定义对应的bean。

::: danger 错误范例
参数出现json格式，可读性不好，代码也难看
:::
```java
@PostMapping("/update")
public Map<String, Object> update(long id, String jsonStr) {

}
```

## 没有返回应该返回的数据

例如，新增接口一般情况下应该返回新对象的id标识，这需要编程经验。新手定义的时候因为前台没有用就不返回数据或者只返回true，这都是不恰当的。别人要不要是别人的事情，你该返回的还是应该返回。

::: danger 错误范例
约定俗成，新建应该返回新对象的信息(对象或者ID)，只返回boolean容易导致返工
:::
```java
@PostMapping("/add")
public boolean add(xxx) {
  //xxx
  return configService.add();
}
```

:::tip 相关讨论
当时在知乎上发帖的时候，有人认为返回给前台的信息应该越少越好，避免出现信息泄露问题。这个觉悟是对的，但对象ID并不是敏感信息，这里返回没有问题。
:::

很多人看了我的这篇文章`程序员你为什么这么累？`，都觉得里面的技术也很简单，没有什么特别的地方，但是，实现这个代码框架之前，就是要你的接口的统一的格式ResultBean，aop才好做。有些人误解了，我那篇文章说的都不是技术，重点说的是编码习惯工作方式，如果你重点还是放在什么技术上，那我也帮不了你了。同样，如果我后面的关于习惯和规范的帖子，你重点还是放在技术上的话，那是丢了西瓜捡芝麻，有很多贴还是没有任何技术点呢。


:::tip 晓风轻总结
统一的接口规范，能帮忙规避很多无用的返工修改和可能出现的问题。能使代码可读性更加好，利于进行aop和自动化测试这些额外工作。大家一定要重视。
:::




