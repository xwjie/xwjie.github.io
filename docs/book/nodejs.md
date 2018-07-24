# 同步的轮询
* 重复调用read
* 通过文件描述符上的事件状态来 select
   采用1024长度数组来存储状态，最多同时检查1024个文件描述符
* poll，链表
* epoll，没有事件会休眠，直到事件唤醒。不是遍历查询，不会浪费cpu
* kqueue，类似epoll，只有freebsd系统

# 异步
libeio： 采用线程池与阻塞IO来模拟异步IO。
window下的iocp，内部依然是线程池原理，但线程池由系统内核接手管理。

# 单线程
仅仅js执行在单线程里面，在node中，内部完成io任务另有线程池。
除了用户代码无法并行执行外，所有的io则是可以并行起来的。

# 事件循环
是一个典型的生产者消费者模型，异步io，网络请求是生产者，源源不断为node提供不同类型的事件，这些事件被传递到对于的观察者，事件循环则从观察者哪里取出事件并处理。windows下，这个循环由于icop创建，*nix下基于多线程创建。

观察者有：文件io观察者，网络io观察者，定时器观察者等等，将事件进行了分类。

事件循环，观察者，请求对象，io线程池这4者共同构成了node异步io模型的基本要素。

# setTimeout，setInterval
原理与异步io类似，只是不需要io线程池的参与。调用后的定时器会被插入到定时器观察者内部的一个红黑树中，每次tick执行时，会从该红黑树中迭代取出定时器对象，检查是否超时，如果超过，就形成一个事件，他的回调函数会立即执行。

精度不够，而且采用定时器需要动用红黑树，创建定时器对象和迭代操作。复杂度为O(lg(n))。

# process.nextTick / setImmediate 

process.nextTick() 只需要回调放入队列，下一轮tick取出执行。复杂度为O(1)。

setImmediate，v0.9.1之后实现，ie有。chrome没有。

procee.nextTick属于idel观察者，setImmediate属于check观察者，每一轮事件循环检查中，idle观察者先于io观察者，io观察者限于check观察者。

process.nextTick的回调保存在数组里面，setImmediate保存在链表里面。每次循环，nextTick里面的数组的回调函数会全部执行，而setImmediate里面的每轮执行执行一个。

类似的，NGINX也采用了异步、事件驱动的方法来处理连接。这种处理方式无需（像使用传统架构的服务器一样）为每个请求创建额外的专用进程或者线程，而是在一个工作进程中处理多个连接和请求。为此，NGINX工作在非阻塞的socket模式下，并使用了epoll 和 kqueue这样有效的方法。[相关链接](http://www.infoq.com/cn/articles/thread-pools-boost-performance-9x)

# 异步编程主要解决方案

* 事件发布/订阅模式
   - emmitor.on / emit 
   - EventProxy原理（来自Backbone事件模块）
   - [参考链接](https://github.com/alsotang/node-lessons)
   
* Promise/Deferred模式
   - 先执行异步操作，延迟传递处理的方式。（相对于传统的方式必须先设置回调函数，在执行异步操作）
   - 解决回调嵌套
   - 最早出现在Dojo里面，jq1.5引入。
   
* 流程控制库
   - 尾触发和next
   - async 模块
   - step 模块，更加轻量级

# Promise/Deferred模式

* 3种状态：未完成，完成，失败。
* Promise对象只需要具备then方法即可。then(fulfilledHandler, errorHandler, progressHandler)
* then只接受function，其他忽略。继续返回Promise对象，实现链式调用。
* Deferred主要用于内部，用于维护异步模型的状态；Promise则作用于外部，通过then方法暴露。
* Q模块是Promise/A规范的一个实现，npm install q。[链接](https://blog.csdn.net/ii1245712564/article/details/51419533)





