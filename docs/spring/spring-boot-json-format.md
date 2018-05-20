# Spring Boot 日期数据格式转换@JsonFormat实例

需要保证是是默认的转换器，就是jackson的转换器

com.fasterxml.jackson.annotation.JsonFormat

一开始配置了下面转换器，@JsonFormat就不可用。

```java
@Configuration
@EnableAspectJAutoProxy
@EnableWebMvc
@ComponentScan(basePackages = { "rugal.sample.controller", "cn.xiaowenjie" })
public class SpringMVCApplicationContext extends WebMvcConfigurerAdapter {

//	@Override
//	public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
//		GsonHttpMessageConverter messageConverter = new GsonHttpMessageConverter();
//		List<MediaType> supportedMediaTypes = new ArrayList<>();
//		supportedMediaTypes.add(MediaType.APPLICATION_JSON);
//		messageConverter.setSupportedMediaTypes(supportedMediaTypes);
//		converters.add(messageConverter);
//	}
}

```

## Spring Boot 日期数据格式转换@JsonFormat实例


pojo的bean里面通常会有Date类型的数据，直接通过@ResponseBody返回出去的是一个长整型时间戳（从1970到该变量时间的毫秒数），关于原因，网上很多，此处不细讲。如果想要返回自定义的日期格式，如：yyyymmddhhmmss，需做相关处理，网上有很多处理方式，大体都是继承、重写，比较复杂。实际上JSON已有注解@JsonFormat支持，使用实例：

```java
@JsonFormat(timezone = "GMT+8", pattern = "yyyyMMddHHmmss")
private Date createTime;
```

作用：

1）入参时，请求报文只需要传入yyyymmddhhmmss字符串进来，则自动转换为Date类型数据。
2）出参时，Date类型的数据自动转换为14位的字符串返回出去。

详细可参阅： 

http://fasterxml.github.io/jackson-annotations/javadoc/2.0.0/com/fasterxml/jackson/annotation/JsonFormat.html

## 相关的其他注解

* @JsonIgnoreProperties 

此注解是类注解，作用是json序列化时将Java bean中的一些属性忽略掉，序列化和反序列化都受影响。 
```java
@JsonIgnoreProperties(value = { "word" })  
```

* @JsonIgnore 

此注解用于属性或者方法上（最好是属性上），作用和上面的@JsonIgnoreProperties一样。

* @JsonSerialize
 此注解用于属性或者getter方法上，用于在序列化时嵌入我们自定义的代码，比如序列化一个double时在其后面限制两位小数点。 `@JsonSerialize(using = CustomDoubleSerialize.class) ` 

```java
@Component
public class CustomDateSerialize extends JsonSerializer<Date> {

	private static final SimpleDateFormat dateFormat = new SimpleDateFormat("MM-dd hh:mm");

	@Override
	public void serialize(Date date, JsonGenerator gen, SerializerProvider provider)
			throws IOException, JsonProcessingException {
		String formattedDate = dateFormat.format(date);
		gen.writeString(formattedDate);
	}

}
``

* @JsonDeserialize
 此注解用于属性或者setter方法上，用于在反序列化时可以嵌入我们自定义的代码，类似于上面的@JsonSerialize  @JsonDeserialize(using = CustomDateDeserialize.class) 