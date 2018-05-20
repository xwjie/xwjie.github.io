# 得到所有的requestmapping

`BeanFactoryUtils.beansOfTypeIncludingAncestors(ctx,
				HandlerMapping.class, true, false);`

```java
	public void name() {

		// 获取所有的RequestMapping
		Map<String, HandlerMapping> allRequestMappings = BeanFactoryUtils.beansOfTypeIncludingAncestors(ctx,
				HandlerMapping.class, true, false);

		for (HandlerMapping handlerMapping : allRequestMappings.values()) {
			// 本项目只需要RequestMappingHandlerMapping中的URL映射
			if (handlerMapping instanceof RequestMappingHandlerMapping) {
				RequestMappingHandlerMapping requestMappingHandlerMapping = (RequestMappingHandlerMapping) handlerMapping;
				Map<RequestMappingInfo, HandlerMethod> handlerMethods = requestMappingHandlerMapping
						.getHandlerMethods();

				for (Map.Entry<RequestMappingInfo, HandlerMethod> requestMappingInfoHandlerMethodEntry : handlerMethods
						.entrySet()) {
					RequestMappingInfo requestMappingInfo = requestMappingInfoHandlerMethodEntry.getKey();
					HandlerMethod mappingInfoValue = requestMappingInfoHandlerMethodEntry.getValue();

					RequestMethodsRequestCondition methodCondition = requestMappingInfo.getMethodsCondition();
					String requestType = first(methodCondition.getMethods()).name();

					PatternsRequestCondition patternsCondition = requestMappingInfo.getPatternsCondition();
					String requestUrl = first(patternsCondition.getPatterns());

					String controllerName = mappingInfoValue.getBeanType().toString();
					String requestMethodName = mappingInfoValue.getMethod().getName();
					Class<?>[] methodParamTypes = mappingInfoValue.getMethod().getParameterTypes();

					System.out.println("打印东西。。。。");
				}

				break;
			}
		}

	}

	private <T> T first(Set<T> patterns) {
		return patterns.iterator().next();
	}
```
