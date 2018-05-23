# SSE

## JavaScript 接收方

```js
var evtSource = new EventSource("SSEServlet"); // 跨越加上  { withCredentials: true } 

// 接收消息( 消息如果已经被EventListener处理后不会到这里）
evtSource.onmessage = function(e) {
  console.log("message: ", e);
}

// 接受指定消息
evtSource.addEventListener("ping", function(e) {
  console.log("ping at: ", e);
}, false);

```

## java发送方

* servlet中需要设置的头

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Character-Encoding: utf-8
```

* servlet

```java
protected void doGet(HttpServletRequest request,
    HttpServletResponse response) throws ServletException, IOException {
  response.setContentType("text/event-stream");
  response.setCharacterEncoding("utf-8");

  for (int i = 0; i < 5; i++) {
    // 指定事件标识
    response.getWriter().write("event:me\n");
    // 格式: data: + 数据 + 2个回车
    response.getWriter().write("data:" + i + "\n\n");
    response.getWriter().flush();
  }
}
```

* 返回 `Flux<ServerSentEvent<T>>`

```java
@RestController
@RequestMapping("/sse")
public class SseController {

    @GetMapping("/randomNumbers")
    public Flux<ServerSentEvent<Integer>> randomNumbers() {
        return Flux.interval(Duration.ofSeconds(1))
                .map(seq -> Tuples.of(seq, ThreadLocalRandom.current().nextInt()))
                .map(data -> ServerSentEvent.<Integer>builder()
                        .event("random")
                        .id(Long.toString(data.getT1()))
                        .data(data.getT2())
                        .build());
    }
}
```

* 或者指定produces为 `MediaType.TEXT_EVENT_STREAM_VALUE`

```java
@GetMapping(value = "/flux", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
```