# thumbnailator缩略图

```xml
<!-- https://mvnrepository.com/artifact/net.coobird/thumbnailator -->
<dependency>
    <groupId>net.coobird</groupId>
    <artifactId>thumbnailator</artifactId>
    <version>0.4.8</version>
</dependency>
```

http://blog.csdn.net/yhhazr/article/details/7866491

```java
	String fileExt = getExt(savePath);

	// 生成缩略图
	if (ThumbnailatorUtils.isSupportedOutputFormat(fileExt)) {
		createThumb(physicalPath);
		savePath += "_800.jpg";
	}

	private static String getExt(String path) {
		int index = path.lastIndexOf('.');
		return path.substring(index + 1).toLowerCase();
	}

	private static void createThumb(String path) throws IOException {
		Thumbnails.of(path).outputFormat("jpg").size(800, 2000).toFile(path + "_800.jpg");
	}

/*   
 * 若图片横比200小，高比300小，不变   
 * 若图片横比200小，高比300大，高缩小到300，图片比例不变   
 * 若图片横比200大，高比300小，横缩小到200，图片比例不变   
 * 若图片横比200大，高比300大，图片按比例缩小，横为200或高为300   
 */   
Thumbnails.of("images/a380_1280x1024.jpg")   
        .size(200, 300)  
        .toFile("c:/a380_200x300.jpg");  
  
Thumbnails.of("images/a380_1280x1024.jpg")   
        .size(2560, 2048)   
        .toFile("c:/a380_2560x2048.jpg");  
```
