# 异步

## 配置springmvc的异步

开启Spring MVC支持配置：继承 `WebMvcConfigurerAdapter` 的配置类DemoMVCConfig

```java
@Override
public void configureAsyncSupport(AsyncSupportConfigurer configurer) {
     configurer.setDefaultTimeout(30*1000L); //tomcat默认10秒
     configurer.setTaskExecutor(mvcTaskExecutor());//所借助的TaskExecutor
 }
 
 @Bean
 public ThreadPoolTaskExecutor mvcTaskExecutor(){
      ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
      executor.setCorePoolSize(10);
      executor.setQueueCapacity(100);
      executor.setMaxPoolSize(25);
      return executor;
  }

 @Override
 public void addViewControllers(ViewControllerRegistry registry) {
     registry.addViewController("/async").setViewName("/async");
 }
```

## return Callable

```java
// After
@RequestMapping(method=RequestMethod.POST)
public Callable<String> processUpload(final MultipartFile file) {

  return new Callable<String>() {
    public Object call() throws Exception {
      // ...
      return "someView";
    }
  };
}
```

## return WebAsyncTask

```java
@RequestMapping(value="/longtimetask", method = RequestMethod.GET)
public WebAsyncTask longTimeTask(){
    System.out.println("/longtimetask被调用 thread id is : " + Thread.currentThread().getId());
    Callable<ModelAndView> callable = new Callable<ModelAndView>() {
        public ModelAndView call() throws Exception {
            Thread.sleep(3000); //假设是一些长时间任务
            ModelAndView mav = new ModelAndView("longtimetask");
            mav.addObject("result", "执行成功");
            System.out.println("执行成功 thread id is : " + Thread.currentThread().getId());
            return mav;
        }
    };
    return new WebAsyncTask(callable);
}
```

其核心是一个 `Callable<ModelAndView>`，事实上，直接返回 `Callable<ModelAndView>` 都是可以的，但我们这里包装了一层，以便做后面提到的**“超时处理”**。

```java
@RequestMapping(value="/longtimetask", method = RequestMethod.GET)
public WebAsyncTask longTimeTask(){
    System.out.println("/longtimetask被调用 thread id is : " + Thread.currentThread().getId());
    
    Callable<ModelAndView> callable = new Callable<ModelAndView>() {
        public ModelAndView call() throws Exception {
            Thread.sleep(3000); //假设是一些长时间任务
            ModelAndView mav = new ModelAndView("longtimetask");
            mav.addObject("result", "执行成功");
            System.out.println("执行成功 thread id is : " + Thread.currentThread().getId());
            return mav;
        }
    };
    
    WebAsyncTask asyncTask = new WebAsyncTask(2000, callable);
    asyncTask.onTimeout(
            new Callable<ModelAndView>() {
                public ModelAndView call() throws Exception {
                    ModelAndView mav = new ModelAndView("longtimetask");
                    mav.addObject("result", "执行超时");
                    System.out.println("执行超时 thread id is ：" + Thread.currentThread().getId());
                    return mav;
                }
            }
    );
    return new WebAsyncTask(3000, callable);
}
```

## return DeferredResult

DeferredResult (new type in Spring MVC 3.2) to complete processing in a thread not known to Spring MVC. 

```java
@RequestMapping("/quotes")
@ResponseBody
public DeferredResult<String> quotes() {
  DeferredResult<String> deferredResult = new DeferredResult<String>();
  // Add deferredResult to a Queue or a Map...
  return deferredResult;
}


// In some other thread...
deferredResult.setResult(data);
// Remove deferredResult from the Queue or Map
```
> good

```java
@GetMapping("/hello3/{latency}")
public DeferredResult<String> hello3(@PathVariable long latency) {
  DeferredResult<String> deferredResult = new DeferredResult<String>();

  CompletableFuture.supplyAsync(() -> TestController.doSomething(latency))
      .whenCompleteAsync(
          (result, throwable) -> deferredResult.setResult(result));

  return deferredResult;
}
```