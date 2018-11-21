---
layout: post
title: OkHttp 使用指南
permalink: java-http/okhttp-guide.html
class: java
categories: ['java-http']
---

# 介绍

在这篇文章中，我们将演示发送不同类型的 HTTP 请求，接收和解释 HTTP 响应的基础知识，以及如何配置客户端和 [OkHttp](http://square.github.io/okhttp/){:target="_blank"}。

除此之外，我们还介绍如何自定义 Header，设置超时，以及响应缓存的配置等高级用法。

# OkHttp 概述

OkHttp 是适用于 Android 和 Java 应用程序的高效 HTTP 和 HTTP/2 客户端。

它有一些高级功能，如连接池（对 HTTP/2 不适用），GZIP 压缩和响应缓存，用于避免重复网络请求。

它还能够在连接失败的时候自动从常见的连接问题中恢复，如果服务器有多个 IP 地址，它可以重试对备用地址的请求。

在较复杂的场景下，客户端支持阻塞同步和非阻塞异步调用。

OkHttp 支持 Android 2.3 及更高版本，Java 的最低版本是 1.7。

看完概述之后，我们看一些使用示例。

# 加入 Maven 依赖

首先将 okhttp 的库加入到 `pom.xml` 文件中:

```xml
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>okhttp</artifactId>
    <version>3.11.0</version>
</dependency>
```

如果你使用 Gradle 的话可以这样

```bash
compile 'com.squareup.okhttp3:okhttp:3.11.0'
```

最新版本可以在 [官网](http://square.github.io/okhttp/){:target="_blank"} 或者 [Maven 中心仓库](https://search.maven.org/classic/#search%7Cgav%7C1%7Cg%3A%22com.squareup.okhttp3%22%20AND%20a%3A%22okhttp%22){:target="_blank"} 查看。

# GET 请求示例

## 同步发送 GET

要进行同步 GET 请求，我们需要根据 URL 构造一个 `Request` 对象进行调用。执行后，返回一个 `Response` 对象：

```java
@Test
public void whenGetRequest_thenCorrect() throws IOException {
    Request request = new Request.Builder()
      .url(BASE_URL + "/date")
      .build();
 
    Call call = client.newCall(request);
    Response response = call.execute();
 
    assertThat(response.code(), equalTo(200));
}
```

## 异步发送 GET

要进行异步 GET，我们需要将 `Call` 加入队列。在回调中读取响应，它是只读的。响应头准备就绪后就可以读取了。

读取响应 Body 可能会被禁止。OkHttp 目前不提供任何异步 API 来接收一部分响应体：

```java
@Test
public void whenAsynchronousGetRequest_thenCorrect() {
    Request request = new Request.Builder()
      .url(BASE_URL + "/date")
      .build();
 
    Call call = client.newCall(request);
    call.enqueue(new Callback() {
        public void onResponse(Call call, Response response) 
          throws IOException {
            // ...
        }
         
        public void onFailure(Call call, IOException e) {
            fail();
        }
    });
}
```

## GET 请求查询参数

要向 GET 请求添加一些查询参数，我们可以使用 `HttpUrl.Builder`。构造 URL 后，我们可以将它传递给 `Request` 对象：

```java
@Test
public void whenGetRequestWithQueryParameter_thenCorrect() 
  throws IOException {
     
    HttpUrl.Builder urlBuilder 
      = HttpUrl.parse(BASE_URL + "/query").newBuilder();
    urlBuilder.addQueryParameter("id", "1");
 
    String url = urlBuilder.build().toString();
 
    Request request = new Request.Builder()
      .url(url)
      .build();
    Call call = client.newCall(request);
    Response response = call.execute();
 
    assertThat(response.code(), equalTo(200));
}
```

# Post 请求示例

## 基本 POST 请求

在这个简单的例子中，我们构造一个 `RequestBody` 来发送两个参数 - “username” 和 “password”：

```java
@Test
public void whenSendPostRequest_thenCorrect() 
  throws IOException {
    RequestBody formBody = new FormBody.Builder()
      .add("username", "biezhi")
      .add("password", "123456")
      .build();
 
    Request request = new Request.Builder()
      .url(BASE_URL + "/users")
      .post(formBody)
      .build();
 
    Call call = client.newCall(request);
    Response response = call.execute();
     
    assertThat(response.code(), equalTo(200));
}
```

## POST 授权

在这个例子中，我们将演示如何使用 Basic 身份认证执行 POST，另外我们发送一个 `String` 内容作为请求的主体：

```java
@Test
public void whenSendPostRequestWithAuthorization_thenCorrect() 
  throws IOException {
    String postBody = "test post";
     
    Request request = new Request.Builder()
      .url(URL_SECURED_BY_BASIC_AUTHENTICATION)
      .addHeader("Authorization", Credentials.basic("biezhi", "123456"))
      .post(RequestBody.create(
        MediaType.parse("text/x-markdown; charset=utf-8"), postBody))
      .build();
 
    Call call = client.newCall(request);
    Response response = call.execute();
 
    assertThat(response.code(), equalTo(200));
}
```

## POST 发送 JSON 内容

在这个例子中，我们将发送一个带有 JSON 的 POST 请求作为 `RequestBody`：

```java
@Test
public void whenPostJson_then:Correct() throws IOException {
    String json = "{\"id\":1,\"name\":\"biezhi\"}";
 
    RequestBody body = RequestBody.create(
      MediaType.parse("application/json; charset=utf-8"), json);
 
    Request request = new Request.Builder()
      .url(BASE_URL + "/users/detail")
      .post(body)
      .build();
  
    Call call = client.newCall(request);
    Response response = call.execute();
 
    assertThat(response.code(), equalTo(200));
}
```

## POST Multipart 请求

在这个例子中，我们将发送 POST Multipart 请求。我们需要将 `RequestBody` 构建为 `MultipartBody` 来发送文件、用户名和密码：

```java
@Test
public void whenSendMultipartRequest_thenCorrect() 
  throws IOException {  
    RequestBody requestBody = new MultipartBody.Builder()
      .setType(MultipartBody.FORM)
      .addFormDataPart("username", "biezhi")
      .addFormDataPart("password", "123456")
      .addFormDataPart("file", "file.txt",
        RequestBody.create(MediaType.parse("application/octet-stream"), 
          new File("src/test/resources/test.txt")))
      .build();
 
    Request request = new Request.Builder()
      .url(BASE_URL + "/users/multipart")
      .post(requestBody)
      .build();
 
    Call call = client.newCall(request);
    Response response = call.execute();
 
    assertThat(response.code(), equalTo(200));
}
```

# 文件上传

## 上传一个文件

在这个例子中，我们将看到如何上传文件。我们将使用 `MultipartBody.Builder` 上传 "test.txt" 文件：

```java
@Test
public void whenUploadFile_thenCorrect() throws IOException {
    RequestBody requestBody = new MultipartBody.Builder()
      .setType(MultipartBody.FORM)
      .addFormDataPart("file", "file.txt",
        RequestBody.create(MediaType.parse("application/octet-stream"), 
          new File("src/test/resources/test.txt")))
      .build();
 
    Request request = new Request.Builder()
      .url(BASE_URL + "/users/upload")
      .post(requestBody)
      .build();
 
    Call call = client.newCall(request);
    Response response = call.execute();
 
    assertThat(response.code(), equalTo(200));
}
```

## 获得文件上传进度

最后，让我们看看如何获​​取文件上传的进度。我们将扩展 `RequestBody` 以获得对上传的过程。

首先，这是上传方法：

```java
@Test
public void whenGetUploadFileProgress_thenCorrect() 
  throws IOException {
    RequestBody requestBody = new MultipartBody.Builder()
      .setType(MultipartBody.FORM)
      .addFormDataPart("file", "file.txt",
        RequestBody.create(MediaType.parse("application/octet-stream"), 
          new File("src/test/resources/test.txt")))
      .build();
       
    ProgressRequestWrapper.ProgressListener listener 
      = (bytesWritten, contentLength) -> {
        float percentage = 100f * bytesWritten / contentLength;
        assertFalse(Float.compare(percentage, 100) > 0);
    };
 
    ProgressRequestWrapper countingBody
      = new ProgressRequestWrapper(requestBody, listener);
 
    Request request = new Request.Builder()
      .url(BASE_URL + "/users/upload")
      .post(countingBody)
      .build();
 
    Call call = client.newCall(request);
    Response response = call.execute();
 
    assertThat(response.code(), equalTo(200));
}
```

以下是 `ProgressListener` 接口，它使我们能够查看上传进度：

```java
public interface ProgressListener {
    void onRequestProgress(long bytesWritten, long contentLength);
}
```

这是 `ProgressRequestWrapper` 接口，它是 `RequestBody` 的扩展版本：

```java
public class ProgressRequestWrapper extends RequestBody {
 
    @Override
    public void writeTo(BufferedSink sink) throws IOException {
        BufferedSink bufferedSink;
 
        countingSink = new CountingSink(sink);
        bufferedSink = Okio.buffer(countingSink);
 
        delegate.writeTo(bufferedSink);
 
        bufferedSink.flush();
    }
}
```

最后，这里是 `CountingSink`，它是 `Forwarding Sink` 的扩展版本：

```java
protected class CountingSink extends ForwardingSink {
 
    private long bytesWritten = 0;
 
    public CountingSink(Sink delegate) {
        super(delegate);
    }
 
    @Override
    public void write(Buffer source, long byteCount)
      throws IOException {
        super.write(source, byteCount);
         
        bytesWritten += byteCount;
        listener.onRequestProgress(bytesWritten, contentLength());
    }
}
```

注意：

- 将 `ForwardingSink` 扩展为 "CountingSink" 时，我们重写 `write()` 方法来计算写入（传输）的字节数
- 将 `RequestBody` 扩展到 "ProgressRequestWrapper" 时，我们重写 `writeTo()` 方法来使用我们的 "ForwardingSink"

# 设置自定义 Header

## 在请求上设置 Header

要在 `Request` 上设置任何自定义标头，我们可以调用 `addHeader`：

```java
@Test
public void whenSetHeader_thenCorrect() throws IOException {
    Request request = new Request.Builder()
      .url(SAMPLE_URL)
      .addHeader("Content-Type", "application/json")
      .build();
 
    Call call = client.newCall(request);
    Response response = call.execute();
    response.close();
}
```

## 设置默认 Header

在这个例子中，我们将了解如何在客户端对象上配置默认 Header，而不是在每个请求上设置它。

例如，如果我们想为每个请求设置内容类型 `"application/json"`，我们需要为客户端设置拦截器。下面是代码：

```java
@Test
public void whenSetDefaultHeader_thenCorrect() 
  throws IOException {
     
    OkHttpClient client = new OkHttpClient.Builder()
      .addInterceptor(
        new DefaultContentTypeInterceptor("application/json"))
      .build();
 
    Request request = new Request.Builder()
      .url(SAMPLE_URL)
      .build();
 
    Call call = client.newCall(request);
    Response response = call.execute();
    response.close();
}
```

这是 `DefaultContentTypeInterceptor`，它是 `Interceptor` 的扩展版本：

```java
public class DefaultContentTypeInterceptor implements Interceptor {
     
    public Response intercept(Interceptor.Chain chain) 
      throws IOException {
 
        Request originalRequest = chain.request();
        Request requestWithUserAgent = originalRequest
          .newBuilder()
          .header("Content-Type", contentType)
          .build();
 
        return chain.proceed(requestWithUserAgent);
    }
}
```

请注意，拦截器会将 Header 添加到原始请求中。

# 禁止重定向

在这个例子中，我们将看到如何配置 `OkHttpClient` 以停止重定向。

默认情况下，如果得到一个 `HTTP 301` 响应，则会自动执行重定向。在某些场景中，这可能是正常的，但有时候我们不需要。

为了实现这种行为，当我们构建客户端时，我们需要将 `followRedirects` 设置为 `false`。

请注意，响应将返回 HTTP 301 状态码：

```java
@Test
public void whenSetFollowRedirects_thenNotRedirected() 
  throws IOException {
 
    OkHttpClient client = new OkHttpClient().newBuilder()
      .followRedirects(false)
      .build();
     
    Request request = new Request.Builder()
      .url("http://t.co/I5YYd9tddw")
      .build();
 
    Call call = client.newCall(request);
    Response response = call.execute();
 
    assertThat(response.code(), equalTo(301));
}
```

如果我们使用 `true` 参数打开重定向，客户端将遵循重定向，测试将失败，因为会返回 HTTP 200 状态码。

# 超时设置

当对等方无法访问时，使用超时让调用失败。可能是客户端连接或者网络故障问题，服务器可用性问题或其他任何问题。OkHttp 支持连接的读取和写入超时设置。

在这个例子中，我们使用 1 秒 的 `readTimeout` 构建客户端，而 `URL` 的延迟时间为 2 秒：

```java
@Test
public void whenSetRequestTimeout_thenFail() 
  throws IOException {
    OkHttpClient client = new OkHttpClient.Builder()
      .readTimeout(1, TimeUnit.SECONDS)
      .build();
 
    Request request = new Request.Builder()
      .url(BASE_URL + "/delay/2")
      .build();
  
    Call call = client.newCall(request);
    Response response = call.execute();
 
    assertThat(response.code(), equalTo(200));
}
```

请注意，由于客户端超时时长小于资源响应时间，这个测试会失败。

# 取消调用

使用 `Call.cancel()` 立即停止正在进行的调用。如果当前线程正在写入请求或读取响应，那么会抛出 `IOException`。

当不再需要调用时，使用这个方法来保存网络；比如当用户在 APP 上切换导航的时候：

```java
@Test(expected = IOException.class)
public void whenCancelRequest_thenCorrect() 
  throws IOException {
    ScheduledExecutorService executor
      = Executors.newScheduledThreadPool(1);
 
    Request request = new Request.Builder()
      .url(BASE_URL + "/delay/2")  
      .build();
 
    int seconds = 1;
    long startNanos = System.nanoTime();
 
    Call call = client.newCall(request);
 
    executor.schedule(() -> {
        logger.debug("正在取消调用: " 
            + (System.nanoTime() - startNanos) / 1e9f);
 
        call.cancel();
             
        logger.debug("已经取消调用: "
            + (System.nanoTime() - startNanos) / 1e9f);
         
    }, seconds, TimeUnit.SECONDS);
 
    logger.debug("执行调用耗时: "
      + (System.nanoTime() - startNanos) / 1e9f);
 
    Response response = call.execute();
     
    logger.debug("预计调用会失败，完成耗时: " 
      + (System.nanoTime() - startNanos) / 1e9f, response);
}
```

# 响应缓存

为了缓存响应，你需要一个你可以读写的缓存目录，和缓存大小的限制。这个缓存目录应该是私有的，不信任的程序应不能读取缓存内容。
一个缓存目录同时拥有多个缓存访问是错误的。大多数程序只需要调用一次 `new OkHttp()`，在第一次调用时配置好缓存，然后其他地方只需要调用这个实例就可以了。否则两个缓存示例互相干扰，破坏响应缓存，而且有可能会导致程序崩溃。

响应缓存使用HTTP头作为配置。你可以在请求头中添加 `Cache-Control: max-stale=3600`，OkHttp 缓存会支持。你的服务通过响应头确定响应缓存多长时间，例如使用 `Cache-Control: max-age=9600`。

```java
int cacheSize = 10 * 1024 * 1024;
File  cacheDirectory = new File("/Users/biezhi/src/test/java/cache");
Cache cache          = new Cache(cacheDirectory, cacheSize);

OkHttpClient client = new OkHttpClient.Builder()
        .cache(cache)
        .build();

Request request = new Request.Builder()
        .url("http://publicobject.com/helloworld.txt")
        .build();

Response response1 = client.newCall(request).execute();
if (!response1.isSuccessful()) throw new IOException("Unexpected code " + response1);

String response1Body = response1.body().string();
System.out.println("Response 1 response:          " + response1);
System.out.println("Response 1 cache response:    " + response1.cacheResponse());
System.out.println("Response 1 network response:  " + response1.networkResponse());

Response response2 = client.newCall(request).execute();
if (!response2.isSuccessful()) throw new IOException("Unexpected code " + response2);

String response2Body = response2.body().string();
System.out.println("Response 2 response:          " + response2);
System.out.println("Response 2 cache response:    " + response2.cacheResponse());
System.out.println("Response 2 network response:  " + response2.networkResponse());

System.out.println("Response 2 equals Response 1? " + response1Body.equals(response2Body));
```

输出结果

```shell
Response 1 response:          Response{protocol=http/1.1, code=200, message=OK, url=https://publicobject.com/helloworld.txt}
Response 1 cache response:    null
Response 1 network response:  Response{protocol=http/1.1, code=200, message=OK, url=https://publicobject.com/helloworld.txt}
Response 2 response:          Response{protocol=http/1.1, code=200, message=OK, url=https://publicobject.com/helloworld.txt}
Response 2 cache response:    Response{protocol=http/1.1, code=200, message=OK, url=https://publicobject.com/helloworld.txt}
Response 2 network response:  null
Response 2 equals Response 1? true
```

运行该方法后，第一次调用 `cacheResponse` 会返回 NULL，调用 `networkResponse` 会返回从网络加载的响应。

同时缓存文件夹会写入一些你看不懂的缓存文件，第二次调用 `cacheResponse` 会和前面相反，因为响应已经被缓存，调用 `networkResponse` 会返回 NULL。

