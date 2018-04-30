# 函数编写建议

:::tip
傻瓜都能写出计算机可以读懂的代码，只有优秀的程序员才能写出人能读懂的代码！
:::

在我看来，编写简单的函数是一件简单又困难的事情。简单是因为这没有什么技术难点，困难是因为这是一种思维习惯，很难养成，不写个几年代码，很难写出像样的代码。


大部分的程序员写的都是CRUD、一些业务逻辑的代码，谁实现不了？对于我来说，如果业务逻辑的代码评审，需要人来讲每一个代码做了什么，这样的代码就是不合格的，合格的代码写出来应该像人说话那么简单有条理，基本上是业务怎么样描述需求，写出来的代码就是怎么样的。编写出非开发人员都能看懂的代码，才是我们追求的目标。不要以写出了一些非常复杂的代码而沾沾自喜。好的代码应该是看起来平淡无奇觉得很简单自然，而不是看得人云里雾里的觉得很高深很有技术含量。



如果你做好了我前面几篇文章的要求，编写简单的函数就容易的多，如果你觉得我之前说的去掉local，去掉用户参数这些没有什么必要是小题大做，那么我觉得你写不出简单的函数。从个人经验来说，函数编写的建议有以下几点：



## 不要出现和业务无关的参数

参考我之前的帖子，参数校验和国际化规范，函数参数里面不要出现local，messagesource，request，Response这些参数，第一非常干扰阅读，一堆无关的参数把业务代码都遮掩住了，第二导致你的函数不好测试，如你要构建一个request参数来测试，还是有一定难度的。

## 避免使用Map，Json这些复杂对象作为参数和结果

这类参数看着灵活方便，但是灵活的同义词（代价）就是复杂，最终的结果是可变数多bug多质量差。就好比刻板的同义词就是严谨，最终的结果就是高质量。千万不要为了偷懒少几行代码，就到处把map，json传来传去。其实定义一个bean也相当简单，加上lombok之后，代码量也没有几行，但代码可读性就不可同日而语了。做过开发的人应该很容易体会，你如果接手一个项目，到处的输入输出都是map的话，request从头传到尾，看到这样的代码你会哭的，我相信你会马上崩溃很快离职的。

还有人说用bean的话后面加字段改起来麻烦，你用map还不是一样要加一个key，不是更加麻烦吗？说到底就是懒！



如果一个项目的所有代码都如下面这样，我是会崩溃的！

```java
/**
 * ！！！错误代码示例
 * 1. 和业务无关的参数locale，messagesource
 * 2. 输入输出都是map，根本不知道输入了什么，返回了什么
 * 
 * @param params
 * @param local
 * @param messageSource
 * @return
 */
public Map<String, Object> addConfig(Map<String, Object> params, 
    Locale locale, MessageSource messageSource) {

  Map<String, Object> data = new HashMap<String, Object>();

  try {
    String name = (String) params.get("name");
    String value = (String) params.get("value");
    
    //示例代码，省略其他代码
  }
  catch (Exception e) {
    logger.error("add config error", e);

    data.put("code", 99);
    data.put("msg", messageSource.getMessage("SYSTEMERROR", null, locale));
  }

  return data;
}
```

## 有明确的输入输出和方法名

尽量有清晰的输入输出参数，使人一看就知道函数做了啥。举例：
```java
public void updateUser(Map<String, Object> params){
  long userId = (Long) params.get("id");
  String nickname = (String) params.get("nickname");
  
  //更新代码
}
```

上面的函数，看函数定义你只知道更新了用户对象，但你不知道更新了用户的什么信息。建议写成下面这样：

```java
public void updateUserNickName(long userId, String nickname){
  //更新代码
}
```

你就算不看方法名，只看参数就能知道这个函数只更新了nickname一个字段。多好啊！这是一种思路，并部是说每一个方法都要写成这样。


## 把可能变化的地方封装成函数

编写函数的总体指导思想是抽象和封装，你要把代码的逻辑抽象出来封装成为一个函数，以应对将来可能的变化。以后代码逻辑有变更的时候，单独修改和测试这个函数即可。

这一点相当重要，否则你会觉得怎么需求老变？改代码烦死了。

如何识别可能变的地方，多思考一下就知道了，工作久了就知道了。比如，开发初期，业务说只有管理员才可以删除某个对象，你就应该考虑到后面可能除了管理员，其他角色也可能可以删除，或者说对象的创建者也可以删除，这就是将来潜在的变化，你写代码的时候就要埋下伏笔，把是否能删除做成一个函数。后面需求变更的时候，你就只需要改一个函数。


举例，删除配置项的逻辑，判断一下只有是自己创建的配置项才可以删除，一开始代码是这样的：

```java
/**
 * 删除配置项
 */
@Override
public boolean delete(long id) {
  Config config = configs.get(id);
  
  if(config == null){
    return false;
  }
  
  // 只有自己创建的可以删除
  if (UserUtil.getUser().equals(config.getCreator())) {
    return configs.remove(id) != null;      
  }
  
  return false;
}
```

这里我会识别一下，是否可以删除这个地方就有可能会变化，很有可能以后管理员就可以删除任何人的，那么这里就抽成一个函数：

```java
/**
 * 删除配置项
 */
@Override
public boolean delete(long id) {
  Config config = configs.get(id);
  
  if(config == null){
    return false;
  }
  
  // 判断是否可以删除
  if (canDelete(config)) {
    return configs.remove(id) != null;      
  }
  
  return false;
}

/**
 * 判断逻辑变化可能性大，抽取一个函数
 * 
 * @param config
 * @return
 */
private boolean canDelete(Config config) {
  return UserUtil.getUser().equals(config.getCreator());
}
```

后来想了一下，没有权限应该抛出异常，再次修改为：

```java
/**
 * 删除配置项
 */
@Override
public boolean delete(long id) {
  Config config = configs.get(id);

  if (config == null) {
    return false;
  }

  // 判断是否可以删除
  check(canDelete(config), "no.permission");

  return configs.remove(id) != null;
}
```

这就是简单的**抽象和封装的艺术**。看这些代码，参数多么的简单，很容易理解吧。

这一点非常重要，做好了这点，大部分的小的需求变更对程序员的伤害就会降到最低了！毕竟需求变更大部分都是这些小逻辑的变更。


## 编写能测试的函数

> 程序猿不招妹子们喜爱的根本原因在于追求了错误的目标：更短、更小、更快。

这个非常重要，当然很难实现，很多人做技术之前都觉得代码都会做单元测试，实际上和业务相关的代码单元测试是很难做的。

我觉得要编写能测试的函数主要有以下几点：

第一不要出现乱七八糟的参数，如参数里面有request，response就不好测试，

第二你要把函数写小一点。如果一个功能你service代码只有一个函数，那么你想做单元测试是很难做到的。我的习惯是尽量写小一点，力求每一个函数都可以单独测试（用junit测试或者main函数测试都没有关系）。这样会节约大量的时间，尤其是代码频繁改动的时候。我们应用重启一次需要15分钟以上。新手可以写一个功能可能需要重启10几次，我可能只需要重启几次，节约的时候的很可观的。

第三你要有单独测试每一个函数的习惯。不要一上来就测试整个功能，应该一行一行代码、一个一个函数测试，有了这个习惯，自然就会写出能测试的小函数。所以说，只有喜欢编码的人才能写出好代码。



如我的编码习惯 - 配置规范这篇文章了，我的配置相关代码，都是可以单独测试的，所以配置项的改动不需要测试业务功能，应用都不需要重启。

