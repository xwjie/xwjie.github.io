# jvm

## card table / write barrier

如果老年代的对象需要引用新生代的对象，会发生什么呢？

为了解决这个问题，老年代中存在一个 card table ，它是一个512byte大小的块。所有老年代的对象指向新生代对象的引用都会被记录在这个表中。当针对新生代执行GC的时候，只需要查询 card table 来决定是否可以被回收，而**不用查询整个老年代**。这个 card table 由一个 write barrier 来管理。write barrier 给GC带来了很大的性能提升，虽然由此可能带来一些开销，但完全是值得的。

## 反编译

使用 `javap -c StringDemo.class` 反编译看字节码。