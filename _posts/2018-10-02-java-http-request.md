---
layout: post
title: 简洁优雅的 Request 使用
permalink: java-http/http-request-example.html
class: java
categories: ['java-http']
---

Java 中常用的 Http Client 有自带的 HttpURLConnection，以及 Apache Http Client。HttpURLConnection 功能比较简单，像参数编码，数据转换这些事情都要自己完成，使用起来很繁琐；而Apache Http Client 虽然功能强大，但是接口设计繁复，学习和编码成本都比较高。

[http-request](https://github.com/kevinsawicki/http-request), 是一个模仿 Python 的 requests 模块来设计的 Http Client，拥有简单而灵活的 API，在容易使用的同时，又能够满足各种高级定制的需求。

# 安装

如果你使用 Maven 的话可以这样引入

```xml
<dependency>
  <groupId>com.github.kevinsawicki</groupId>
  <artifactId>http-request</artifactId>
  <version>6.0</version>
</dependency>
```

没有 Maven 也没关系，它只有一个类，复制 [HttpRequest](https://raw.githubusercontent.com/kevinsawicki/http-request/master/lib/src/main/java/com/github/kevinsawicki/http/HttpRequest.java) 类到你的项目中即可。

# 使用

## 发送 GET 请求

```java
int response = HttpRequest.get("http://codesofun.com").code();
```

上面是发送 GET 请求并获取 HTTP 响应码。

```java
String response = HttpRequest.get("http://codesofun.com").body();
System.out.println("Response was: " + response);
```

上面代码演示了发送 GET 请求并获取响应内容。

## 输出响应到控制台

```java
HttpRequest.get("http://codesofun.com").receive(System.out);
```

## 添加查询参数

```java
HttpRequest request = HttpRequest.get("http://google.com", true, 
                'q', "baseball gloves", "size", 100);
// GET http://google.com?q=baseball%20gloves&size=100

System.out.println(request.toString()); 
```

## 使用一组查询参数

```java
int[] ids = new int[] { 22, 23 };
HttpRequest request = HttpRequest.get("http://google.com", true, "id", ids);
// GET http://google.com?id[]=22&id[]=23

System.out.println(request.toString()); 
```

## 设置 Header

```java
String contentType = HttpRequest.get("http://google.com")
                                .accept("application/json") // 设置请求头
                                .contentType(); // 获取响应头
System.out.println("Response content type was " + contentType);
```

## 发送 POST 请求

```java
int response = HttpRequest.post("http://google.com").send("name=kevin").code();
```

## Basic 认证

```java
int response = HttpRequest.get("http://google.com").basic("username", "p4ssw0rd").code();
```

## POST multipart 参数

```java
HttpRequest request = HttpRequest.post("http://google.com");
request.part("status[body]", "Making a multipart request");
request.part("status[image]", new File("/home/kevin/Pictures/ide.png"));

if (request.ok())
  System.out.println("状态已更新");
```

## POST Form 表单参数

```java
Map<String, String> data = new HashMap<String, String>();
data.put("user", "A User");
data.put("state", "CA");

if (HttpRequest.post("http://google.com").form(data).created())
  System.out.println("用户已创建");
```

## 将响应写入到文件

```java
File output = new File("/output/request.out");
HttpRequest.get("http://google.com").receive(output);
```

## POST 发送文件

```java
File input = new File("/input/data.txt");
int response = HttpRequest.post("http://google.com").send(input).code();
```

## 使用 GZIP 压缩

```java
HttpRequest request = HttpRequest.get("http://google.com");
// Tell server to gzip response and automatically uncompress
request.acceptGzipEncoding().uncompress(true);

String uncompressed = request.body();
System.out.println("Uncompressed response is: " + uncompressed);
```

## 忽略 HTTPS

```java
HttpRequest request = HttpRequest.get("https://google.com");
//Accept all certificates
request.trustAllCerts();

//Accept all hostnames
request.trustAllHosts();
```

## 设置 HTTP 代理

```java
HttpRequest request = HttpRequest.get("https://google.com");
//Configure proxy
request.useProxy("localhost", 8080);

//Optional proxy basic authentication
request.proxyBasic("username", "p4ssw0rd");
```

## 允许重定向

```java
int code = HttpRequest.get("http://google.com").followRedirects(true).code();
```

## 自定义连接工厂

```java
HttpRequest.setConnectionFactory(new ConnectionFactory() {

  public HttpURLConnection create(URL url) throws IOException {
    if (!"https".equals(url.getProtocol()))
      throw new IOException("Only secure requests are allowed");
    return (HttpURLConnection) url.openConnection();
  }

  public HttpURLConnection create(URL url, Proxy proxy) throws IOException {
    if (!"https".equals(url.getProtocol()))
      throw new IOException("Only secure requests are allowed");
    return (HttpURLConnection) url.openConnection(proxy);
  }
});
```

## 异步下载

```java
private class DownloadTask extends AsyncTask<String, Long, File> {
  protected File doInBackground(String... urls) {
    try {
      HttpRequest request =  HttpRequest.get(urls[0]);
      File file = null;
      if (request.ok()) {
        file = File.createTempFile("download", ".tmp");
        request.receive(file);
        publishProgress(file.length());
      }
      return file;
    } catch (HttpRequestException exception) {
      return null;
    }
  }

  protected void onProgressUpdate(Long... progress) {
    Log.d("MyApp", "Downloaded bytes: " + progress[0]);
  }

  protected void onPostExecute(File file) {
    if (file != null)
      Log.d("MyApp", "Downloaded file to: " + file.getAbsolutePath());
    else
      Log.d("MyApp", "Download failed");
  }
}

new DownloadTask().execute("http://google.com");
```