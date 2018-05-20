# springboot静态文件处理

如果没有使用mvc，把index.html放到static即可访问。

如果使用了 `@EnableWebMvc`  或者 配置了下面类（这里估计自动@EnableWebMvc了）

```java
@Configuration
public class SpringMVCConfig extends WebMvcConfigurerAdapter 
```

静态资源定位于 `src/main/webapp`，需要把文件放在这里。


其实官方解释没有提及一点，就是不能使用@EnableWebMvc，当然如果Spring Boot在classpath里看到有 spring webmvc 也会自动添加@EnableWebMvc (http://spring.io/guides/gs/rest-service/)

如果@EnableWebMvc了，那么就会自动覆盖了官方给出的/static, /public, META-INF/resources, /resources等存放静态资源的目录。而将静态资源定位于src/main/webapp。当需要重新定义好资源所在目录时，则需要主动添加上述的那个配置类，来Override addResourceHandlers方法。