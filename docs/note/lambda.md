# Lambda

## lambda 保存中间类
```
-Djdk.internal.lambda.dumpProxyClasses=. -Djava.lang.invoke.MethodHandle.DUMP_CLASS_FILES=true
```

## 设置并行线程池大小
```java
System.setProperty("java.util.concurrent.ForkJoinPool.common.parallelism", "20")
 ```

## 建议单独设置线程池

submit the parallel stream execution to your own ForkJoinPool: yourFJP.submit(() -> stream.parallel().forEach(soSomething)); or

you can change the size of the common pool using system properties: 

>System.setProperty("java.util.concurrent.ForkJoinPool.common.parallelism", "20")

for a target parallelism of 20 threads.

```java
     Runnable r = () -> IntStream
            .range(-42, +42)
            .parallel()
            .map(i -> Thread.activeCount())
            .max()
            .ifPresent(System.out::println);

    ForkJoinPool.commonPool().submit(r).join();
    new ForkJoinPool(42).submit(r).join();
```