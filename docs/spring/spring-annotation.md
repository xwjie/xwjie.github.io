# spring得到指定注解的类

```java
@SpringBootApplication
public class Application {

	public static void main(String[] args) throws IOException {
		ConfigurableApplicationContext appCtx = SpringApplication.run(Application.class, args);
		
		final String packageSearchPath = "classpath*:com/ljm/springboot/**/*.class";
		
		final Resource[] resources =
				appCtx.getResources(packageSearchPath);
				
		final SimpleMetadataReaderFactory factory = new
                SimpleMetadataReaderFactory(appCtx);

		for (final Resource resource : resources) {
             final MetadataReader mdReader = factory.getMetadataReader(resource);
             
             final AnnotationMetadata am = mdReader.getAnnotationMetadata();
             Set<String> types = am.getAnnotationTypes();
             for(String type : types) {
            	 if(type.equals(Component.class.getName())) {
            		 System.out.println(resource.getFilename()+" annotationde " + Component.class.getName());
            		 break;
            	 }
             }
             
         }
		 appCtx.close();
	}
}

@Component()
public interface LJMTest {

}
@Component
public interface LJMTest2 {

}
```