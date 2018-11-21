---
layout: post
title: Unirest 使用指南
permalink: java-http/unirest-guide.html
class: java
categories: ['java-http']
---

# 简介

Unirest 是 Mashape 的轻量级 HTTP 客户端库。支持 Java，它也可用于 Node.js、.Net、Python、Ruby 等。

在我们开始之前，我们将使用 [mocky.io](https://www.mocky.io/){:target="_blank"} 来处理所有 HTTP 请求。

# 添加 Maven 依赖

首先我们在 `pom.xml` 文件中加入库的依赖。

```xml
<dependency>
    <groupId>com.mashape.unirest</groupId>
    <artifactId>unirest-java</artifactId>
    <version>1.4.9</version>
</dependency>
```

点击 [这里](https://search.maven.org/classic/#search%7Cga%7C1%7Cg%3A%22com.mashape.unirest%22%2C%20a%3A%22unirest-java%22){:target="_blank"} 查看最新的版本。

# 发送简单请求

让我们发送一个简单的 HTTP 请求，来理解框架如何使用：

```java
@Test
public void shouldReturnStatusOkay() {
    HttpResponse<JsonNode> jsonResponse 
      = Unirest.get("http://www.mocky.io/v2/5a9ce37b3100004f00ab5154")
      .header("accept", "application/json").queryString("apiKey", "123")
      .asJson();
 
    assertNotNull(jsonResponse.getBody());
    assertEquals(200, jsonResponse.getStatus());
}
```

可以看到 API 使用起来非常流畅，高效且易于阅读。

我们使用 `header()` 和 `fields()` API 发送 Header 和参数。

并且在请求上调用 `asJson()` 方法；这里还有其他选项，例如 `asBinary()`，`asString()` 和 `asObject()`。

要传递多个 Header 或字段，我们可以创建一个 Map 并将它们分别传递给 `headers(Map<String,Object>)  headers)` 和 `fields(Map<String, String> fields)`：

```java
@Test
public void shouldReturnStatusAccepted() {
    Map<String, String> headers = new HashMap<>();
    headers.put("accept", "application/json");
    headers.put("Authorization", "Bearer 5a9ce37b3100004f00ab5154");
 
    Map<String, Object> fields = new HashMap<>();
    fields.put("name", "biezhi");
    fields.put("id", "PSP123");
 
    HttpResponse<JsonNode> jsonResponse 
      = Unirest.put("http://www.mocky.io/v2/5a9ce7853100002a00ab515e")
      .headers(headers).fields(fields)
      .asJson();
  
    assertNotNull(jsonResponse.getBody());
    assertEquals(202, jsonResponse.getStatus());
}
```

## 传递查询参数

要将数据作为查询字符串传递，我们将使用 `queryString()` 方法：

```java
HttpResponse<JsonNode> jsonResponse 
  = Unirest.get("http://www.mocky.io/v2/5a9ce37b3100004f00ab5154")
  .queryString("apiKey", "123")
```

## 使用路径参数

要传递任何 URL 参数，我们可以使用 `routeParam()` 方法：

```java
HttpResponse<JsonNode> jsonResponse 
  = Unirest.get("http://www.mocky.io/v2/5a9ce37b3100004f00ab5154/{userId}")
  .routeParam("userId", "123")
```

参数占位符名称必须与方法的第一个参数相同。

## 请求体

如果我们的请求需要字符串/JSON主体，我们使用 `body()` 方法传递它：

```java
@Test
public void givenRequestBodyWhenCreatedThenCorrect() {
 
    HttpResponse<JsonNode> jsonResponse 
      = Unirest.post("http://www.mocky.io/v2/5a9ce7663100006800ab515d")
      .body("{\"name\":\"Sam Baeldung\", \"city\":\"viena\"}")
      .asJson();
  
    assertEquals(201, jsonResponse.getStatus());
}
```

## 对象映射

为了在请求中使用 `asObject()` 或 `body()`，我们需要定义对象映射器。为简单起见，我们将使用 Jackson Object Mapper。

我们首先将以下依赖项添加到 `pom.xml`：

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.9.7</version>
</dependency>
```

在 [Maven Central](https://search.maven.org/classic/#search%7Cgav%7C1%7Cg%3A%22com.fasterxml.jackson.core%22%20AND%20a%3A%22jackson-databind%22){:target="_blank"} 上可以查看最新版本。

接下来配置我们的 `ObjectMapper`：

```java
Unirest.setObjectMapper(new ObjectMapper() {
    com.fasterxml.jackson.databind.ObjectMapper mapper 
      = new com.fasterxml.jackson.databind.ObjectMapper();
 
    public String writeValue(Object value) {
        return mapper.writeValueAsString(value);
    }
 
    public <T> T readValue(String value, Class<T> valueType) {
        return mapper.readValue(value, valueType);
    }
});
```

要注意，`setObjectMapper()` 只能调用一次，用来设置 `ObjectMapper`；设置后将用于所有请求和响应。

现在让我们使用自定义一个 `Article` 对象测试新功能：

```java
@Test
public void givenArticleWhenCreatedThenCorrect() {
    Article article 
      = new Article("ID1213", "Guide to Rest", "baeldung");
    HttpResponse<JsonNode> jsonResponse 
      = Unirest.post("http://www.mocky.io/v2/5a9ce7663100006800ab515d")
      .body(article)
      .asJson();
  
    assertEquals(201, jsonResponse.getStatus());
}
```

# 请求方法

与任何 HTTP 客户端都一样，框架为每个 HTTP 谓词提供单独的方法：

**POST**

```java
Unirest.post("http://www.mocky.io/v2/5a9ce7663100006800ab515d")
```

**PUT**

```java
Unirest.put("http://www.mocky.io/v2/5a9ce7663100006800ab515d")
```

**GET**

```java
Unirest.get("http://www.mocky.io/v2/5a9ce7663100006800ab515d")
```

**DELETE**

```java
Unirest.delete("http://www.mocky.io/v2/5a9ce7663100006800ab515d")
```

**PATCH**

```java
Unirest.patch("http://www.mocky.io/v2/5a9ce7663100006800ab515d")
```

**OPTIONS**

```java
Unirest.options("http://www.mocky.io/v2/5a9ce7663100006800ab515d")
```

# 响应方法

获得响应后，请检查状态代码和状态消息：

```java
//...
jsonResponse.getStatus()
 
//...
```

提取 headers:

```java
//...
jsonResponse.getHeaders();
//...
```

获取响应 body:

```java
//...
jsonResponse.getBody();
jsonResponse.getRawBody();
//...
```

> 注意：`getRawBody()` 返回未解析的响应体流，而 `getBody()` 使用前面部分中定义的 ObjectMapper 返回已经解析的 body。

# 处理异步请求

Unirest 还具有处理异步请求的能力 - 使用 `java.util.concurrent.Future` 和回调方法：

```java
@Test
public void whenAysncRequestShouldReturnOk() {
    Future<HttpResponse<JsonNode>> future = Unirest.post(
      "http://www.mocky.io/v2/5a9ce37b3100004f00ab5154?mocky-delay=10000ms")
      .header("accept", "application/json")
      .asJsonAsync(new Callback<JsonNode>() {
 
        public void failed(UnirestException e) {
            // Do something if the request failed
        }
 
        public void completed(HttpResponse<JsonNode> response) {
            // Do something if the request is successful
        }
 
        public void cancelled() {
            // Do something if the request is cancelled
        }
        });
  
    assertEquals(200, future.get().getStatus());
}
```

`com.mashape.unirest.http.async.Callback<T>` 接口提供了三种方法，`failed()`, `cancelled()` 和 `completed()`，根据响应重写相关方法来执行自定义的操作。

# 文件上传

要作为请求的一部分上载或发送文件，将 `java.io.File` 对象作为具有名称文件的字段传递：

```java
@Test
public void givenFileWhenUploadedThenCorrect() {
 
    HttpResponse<JsonNode> jsonResponse = Unirest.post(
      "http://www.mocky.io/v2/5a9ce7663100006800ab515d")
      .field("file", new File("/path/to/file"))
      .asJson();
  
    assertEquals(201, jsonResponse.getStatus());
}
```

我们也可以使用 `ByteStream`:

```java
@Test
public void givenByteStreamWhenUploadedThenCorrect() {
    try (InputStream inputStream = new FileInputStream(
      new File("/path/to/file/artcile.txt"))) {
        byte[] bytes = new byte[inputStream.available()];
        inputStream.read(bytes);
        HttpResponse<JsonNode> jsonResponse = Unirest.post(
          "http://www.mocky.io/v2/5a9ce7663100006800ab515d")
          .field("file", bytes, "article.txt")
          .asJson();
  
        assertEquals(201, jsonResponse.getStatus());
    }
}
```

或者直接使用输入流，在 `fields()` 方法中添加 `ContentType.APPLICATION_OCTET_STREAM` 作为第二个参数，像这样：

```java
@Test
public void givenInputStreamWhenUploadedThenCorrect() {
    try (InputStream inputStream = new FileInputStream(
      new File("/path/to/file/artcile.txt"))) {
 
        HttpResponse<JsonNode> jsonResponse = Unirest.post(
          "http://www.mocky.io/v2/5a9ce7663100006800ab515d")
          .field("file", inputStream, ContentType.APPLICATION_OCTET_STREAM, "article.txt").asJson();
  
        assertEquals(201, jsonResponse.getStatus());
    }
}
```

# Unirest 配置

该框架还支持 HTTP 客户端的经典配置，如连接池，超时，全局标头等。

我们来设置每个请求的连接数和最大连接数：

```java
Unirest.setConcurrency(20, 5);
```

配置连接和 socket 超时：

```java
Unirest.setTimeouts(20000, 15000);
```

这里的时间值以毫秒为单位。

为所有请求设置 HTTP Header：

```java
Unirest.setDefaultHeader("X-app-name", "baeldung-unirest");
Unirest.setDefaultHeader("X-request-id", "100004f00ab5");
```

我们可以随时清除全局 Header：

```java
Unirest.clearDefaultHeaders();
```

有些时候，我们可能需要通过代理服务器发请求：

```java
Unirest.setProxy(new HttpHost("localhost", 8080));
```

要注意的是程序正常关闭或退出，Unirest 会产生一个后台事件循环处理操作，我们需要在退出程序之前关闭这个循环：

```java
Unirest.shutdown();
```
