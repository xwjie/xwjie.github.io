# 配置规范

工作中少不了要制定各种各样的配置文件，这里和大家分享一下工作中我是如何制定配置文件的，这是个人习惯，结合强大的spring，效果很不错。


## 需求

如我们现在有一个这样的配置需求，顶层是Server，有port和shutdown2个属性，包含一个service集合，service对象有name一个属性，并包含一个connector集合，connector对象有port和protocol2个属性。



我一上来不会去考虑是用xml还是json还是数据库配置，我会第一步写好对应的配置bean。如上面的需求，就写3个bean。bean和bean之间的包含关系要体现出来。（使用了lombok）


```java
@Data
public class ServerCfg {
  private int port = 8005;
  private String shutDown = "SHUTDOWN";
  private List<ServiceCfg> services;
}

@Data
public class ServiceCfg {
  private String name;
  private List<ConnectorCfg> connectors;
}

@Data
public class ConnectorCfg {
  private int port = 8080;
  private String protocol = "HTTP/1.1";
}
```

然后找一个地方先用代码产生这个bean：

```java
＠Configuration
public class Configs {

  @Bean
  public ServerCfg createTestBean() {
    ServerCfg server = new ServerCfg();

    // 
    List<ServiceCfg> services = new ArrayList<ServiceCfg>();
    server.setServices(services);

    // 
    ServiceCfg service = new ServiceCfg();
    services.add(service);

    service.setName("Kitty");
    
    // 
    List<ConnectorCfg> connectors = new ArrayList<ConnectorCfg>();
    service.setConnectors(connectors);

    //
    ConnectorCfg connectorhttp11 = new ConnectorCfg();

    connectorhttp11.setPort(8088);
    connectorhttp11.setProtocol("HTTP/1.1");

    connectors.add(connectorhttp11);

    //
    ConnectorCfg connectorAJP = new ConnectorCfg();

    connectorAJP.setPort(8089);
    connectorAJP.setProtocol("AJP");

    connectors.add(connectorAJP);
    
    return server;
  }
}
```

然后先测试，看看是否ok。为了演示，我就直接在controller里面调用一下


```java
@Autowired
ServerCfg cfg;

@GetMapping(value = "/configTest")
@ResponseBody
public ResultBean<ServerCfg> configTest() {
  return new ResultBean<ServerCfg>(cfg);
}
```

测试一下，工作正常。

![](./images/config1.jpg)


然后进行业务代码编写，等到所有功能测试完毕，就是【开发后期】，再来定义配置文件。中途当然少不了修改格式，字段等各种修改，对于我们来说只是修改bean定义，so easy。



都ok了，再决定使用哪种配置文件。如果是json，我们这样：



## JSON格式


把上面接口调用的json复制下来，报存到配置文件。

![](./images/config2.jpg)


json内容

```json
{
  "port": 8005,
  "shutDown": "SHUTDOWN",
  "services": [
    {
      "name": "Kitty",
      "connectors": [
        {
          "port": 8088,
          "protocol": "HTTP/1.1",
          "executor": null
        },
        {
          "port": 8089,
          "protocol": "AJP",
          "executor": null
        }
      ]
    }
  ]
}
```

然后修改config的bean生成的代码为：

```java
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class Configs {
  @Value("classpath:config/tomcat.json")
  File serverConfigJson;
  
  @Bean
  public ServerCfg readServerConfig() throws IOException {
    return new ObjectMapper().readValue(serverConfigJson, ServerCfg.class); 
  }
}
```

代码太简洁了，有没有？！


## XML格式

如果使用XML，麻烦一点，我这里使用XStream序列化和反序列化xml。



首先在bean上增加XStream相关注解

```java
@Data
@XStreamAlias("Server")
public class ServerCfg {

  @XStreamAsAttribute
  private int port = 8005;

  @XStreamAsAttribute
  private String shutDown = "SHUTDOWN";

  private List<ServiceCfg> services;

}

@Data
@XStreamAlias("Service")
public class ServiceCfg {

  @XStreamAsAttribute
  private String name;

  private List<ConnectorCfg> connectors;
}

@Data
@XStreamAlias("Connector")
public class ConnectorCfg {
  @XStreamAsAttribute
  private int port = 8080;
  
  @XStreamAsAttribute
  private String protocol = "HTTP/1.1";
}
```

然后修改产品文件的bean代码如下：

```java
＠Configuration
public class Configs {
  @Value("classpath:config/tomcat.xml")
  File serverConfigXML;

  @Bean
  public ServerCfg readServerConfig() throws IOException {
    return XMLConfig.toBean(serverConfigXML, ServerCfg.class);
  }
}
```

XMLConfig工具类相关代码：

```java
public class XMLConfig {

  public static String toXML(Object obj) {
    XStream xstream = new XStream();

    xstream.autodetectAnnotations(true);
    // xstream.processAnnotations(Server.class);

    return xstream.toXML(obj);
  }

  public static <T> T toBean(String xml, Class<T> cls) {
    XStream xstream = new XStream();

    xstream.processAnnotations(cls);
    T obj = (T) xstream.fromXML(xml);

    return obj;
  }

  public static <T> T toBean(File file, Class<T> cls) {
    XStream xstream = new XStream();

    xstream.processAnnotations(cls);
    T obj = (T) xstream.fromXML(file);

    return obj;
  }

}
```

XStream库需要增加以下依赖：

```xml
<dependency>
  <groupId>com.thoughtworks.xstream</groupId>
  <artifactId>xstream</artifactId>
  <version>1.4.10</version>
</dependency>
```

所以个人爱好，格式推荐json格式配置。


## 配置文件编码禁忌



* 读取配置的代码和业务代码耦合在一起

大忌！千万千万不要！如下，业务代码里面出现了json的配置代码。

```java
public void someServiceCode() {
  // 使用json配置，这里读取到了配置文件，返回的是json格式
  JSONObject config = readJsonConfig();
  
  // 如果某个配置了
  if(config.getBoolean("somekey")){
    // dosomething
  }
  else{
    
  }
}
```

* 开发初期就定配置文件

毫无意义，还导致频繁改动！先定义bean，改bean简单多了。我的习惯是转测试前一天才生成配置文件。

* 手工编写配置文件

应该先写完代码，根据代码生成配置序列化成对应的格式，而不是自己编写配置文件然后用代码读出来。不要做反了。

## 重要思想

最主要的思想是，不要直接和配置文件发生关系，一定要有第三者（这里是配置的bean）。你可以说是中间件，中介都行。 否则，一开始说用xml配置，后面说用json配置，再后面说配置放数据库？这算不算需求变更？你们说算不算？算吗？不算吗？何必这么认真呢？只是1,2行代码的问题，这里使用xml还是json，代码修改量是2行。而且改了测试的话，写个main函数或者junit测试即可，不需要测试业务，工程都不用起，你自己算算节约多少时间。



另外，代码里面是使用spring的习惯，没有spring也是一样的，或者配置的bean你不用spring注入，而用工具类获取也是一样，区别不大。


![晓风轻技术小站](http://www.xiaowenjie.cn/statics/gzh.jpg)

