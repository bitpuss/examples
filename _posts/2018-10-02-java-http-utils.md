---
layout: post
title: 构建 Http 请求工具类
permalink: java-http/build-http-utility-class.html
class: java
categories: ['java-http']
---

本文介绍了一个非常实用工具类，它通过发送 `GET/POST` 请求并从服务器接收响应来建立与 HTTP 服务器的连接。我们将使用 `java.net` 包下的 `HttpURLConnection` 构建，创建一个具有用于发送到远程服务器的请求的两种方法：

- `sendGET(requestURL)`: 接收一个 URL 参数
- `sendPOST(requestURL, params)`: 接受一个 URL 参数和 Map 的 POST 参数

两种方法都返回 `HttpURLConnection` 的用远程服务器创建的对象。因此，我们可以在需要时使用此对象来调用 `HttpURLConnection` 类的方法，例如检查 HTTP 状态代码或 HTTP 响应消息。

该类还提供了两种读取服务器响应的方法：

- `readBody()`：返回字符串内容
- `readMultipleBody()`：返回一个字符串列表

顾名思义，如果服务器返回一个简单的响应，如 `String`，第一种方法是合适的。如果服务器返回更大的东西，第二个是合适的。

最后，有一种方法可以关闭与服务器的连接：

- `disconnect()`

# HttpURLConnection 介绍

## 创建 HTTP 连接对象

要得到一个 `HttpURLConnection` HTTP 连接对象，首先需要一个 `URL`，代码如下：

```java
URL obj = new URL(url);
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
```

## 添加 HTTP 请求头

得到 HTTP 连接对象之后，我们就可以进行 HTTP 操作了，我们可以添加任意的 HTTP 请求头，然后执行我们需要的 GET 或者 POST 请求。我们像下面这样，添加两个 HTTP 头（User-Agent 和 Accept-Language）：

```java
con.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64) ...");
con.setRequestProperty("Accept-Language", "en-US,en;q=0.5");
```

对于有些爬虫来说，这个设置是必要的，譬如有很多网站会对请求头中的 `Referer` 进行检查，以此来防爬或者防盗链。又譬如有些网站还会对 `User-Agent` 进行检查，根据这个字段来过滤一些非浏览器的请求。如果请求头设置不对的话，很可能是爬不下正确的数据的。

## HTTP GET

HTTP 协议中定义了很多种 HTTP 请求方法：GET、POST、PUT、DELETE、OPTIONS 等等，其中最常用到的就是 `GET` 和 `POST`，因为在浏览器中大多都是使用这两种请求方法。

使用 `HttpURLConnection` 来发送 GET 请求是非常简单的，通过上面的代码创建并初始化好一个 `HTTP` 连接之后，就可以直接来发送 GET 请求了。

```java
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
String responseBody = readResponseBody(con.getInputStream());
```

可以看到，代码非常简洁，没有任何累赘的代码，甚至没有任何和发送请求相关的代码，请求就是在 `getResponseCode()` 函数中默默的执行了。其中 `readResponseBody()` 方法用于读取流并转换为字符串，具体的实现如下：

```java
// 读取输入流中的数据
private String readResponseBody(InputStream inputStream) throws IOException {
    BufferedReader in = new BufferedReader(
            new InputStreamReader(inputStream));
    String inputLine;
    StringBuffer response = new StringBuffer();
 
    while ((inputLine = in.readLine()) != null) {
        response.append(inputLine);
    }
    in.close();
    return response.toString();
}
```

## HTTP POST

使用 `HttpURLConnection` 来模拟 POST 请求和 GET 请求基本上是一样的，但是有一点不同，由于 POST 请求一般都会向服务端发送一段数据，所以 `HttpURLConnection` 提供了一个方法 `setDoOutput(true)` 来表示有数据要输出给服务端，并可以通过 `getOutputStream()` 得到输出流，我们将要写的数据通过这个输出流 POST 到服务端。

```java
con.setRequestMethod("POST");
con.setDoOutput(true);
DataOutputStream wr = new DataOutputStream(con.getOutputStream());
wr.writeBytes(parameter);
wr.flush();
wr.close();
```

POST 完成之后，和 GET 请求一样，我们通过 `getInputStream()` 函数来读取服务端返回的数据。

# 代码实现

下面是这个类的代码：

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
 
/**
 * 该类封装了通过 HTTP GET/POST 和服务器请求服务器的方法
 * 提供解析来自服务器的响应的方法
 */
public class HttpUtility {
 
    /**
     * HTTP connection
     */
    private static HttpURLConnection httpConn;
 
    /**
     * 使用 GET 方法将 HTTP 请求发送到指定的 URL。
     * 
     * @param requestURL  远程服务器的URL
     * 
     * @return 一个 HttpURLConnection 对象
     * @throws IOException 如果发生任何 IO 错误，则抛出
     */
    public static HttpURLConnection sendGET(String requestURL)
            throws IOException {
        URL url = new URL(requestURL);
        httpConn = (HttpURLConnection) url.openConnection();
        httpConn.setUseCaches(false);
 
        httpConn.setDoInput(true);   // 如果我们读取到服务器的响应，为true
        httpConn.setDoOutput(false); // false 表示这是一个 GET 请求
        return httpConn;
    }
 
    /**
     * 使用 POST 方法将 HTTP 请求发送到指定的 URL。
     *
     * @param requestURL 远程服务器的URL
     * @param params 包含键值对形式的 POST 数据的 Map
     * 
     * @return 一个HttpURLConnection对象
     * @throws IOException 如果发生任何 IO 错误，则抛出
     */
    public static HttpURLConnection sendPOST(String requestURL,
            Map<String, String> params) throws IOException {
        URL url = new URL(requestURL);
        httpConn = (HttpURLConnection) url.openConnection();
        httpConn.setUseCaches(false);
 
        httpConn.setDoInput(true); // true 表示服务器返回响应
 
        StringBuffer requestParams = new StringBuffer();
 
        if (params != null && params.size() > 0) {
 
            httpConn.setDoOutput(true); // true 表示 POST 请求
 
            // 创建 params 字符串，使用 URLEncoder 对它们进行编码
            Iterator<String> paramIterator = params.keySet().iterator();
            while (paramIterator.hasNext()) {
                String key = paramIterator.next();
                String value = params.get(key);
                requestParams.append(URLEncoder.encode(key, "UTF-8"));
                requestParams.append("=").append(
                        URLEncoder.encode(value, "UTF-8"));
                requestParams.append("&");
            }
 
            // 发送 POST 数据
            OutputStreamWriter writer = new OutputStreamWriter(
                    httpConn.getOutputStream());
            writer.write(requestParams.toString());
            writer.flush();
        }
 
        return httpConn;
    }
 
    /**
     * 从服务器的响应中只返回一行。
     * 这个方法是当服务器只返回一行的时候使用。
     *
     * @return 服务器响应的文本
     * @throws IOException 如果发生任何 IO 错误，则抛出
     */
    public static String readBody() throws IOException {
        InputStream inputStream = null;
        if (httpConn != null) {
            inputStream = httpConn.getInputStream();
        } else {
            throw new IOException("Connection is not established.");
        }
        BufferedReader reader = new BufferedReader(new InputStreamReader(
                inputStream));
 
        String response = reader.readLine();
        reader.close();
 
        return response;
    }
 
    /**
     * 返回服务器响应中的行数组。
     * 这个方法是当服务器返回多行内容的时候使用。
     *
     * @return 服务器响应的字符串列表
     * @throws IOException 如果发生任何 IO 错误，则抛出
     */
    public static List<String> readMultipleBody() throws IOException {
        InputStream inputStream = null;
        if (httpConn != null) {
            inputStream = httpConn.getInputStream();
        } else {
            throw new IOException("Connection is not established.");
        }
 
        BufferedReader reader = new BufferedReader(new InputStreamReader(
                inputStream));
        List<String> response = new ArrayList<String>();
 
        String line = "";
        while ((line = reader.readLine()) != null) {
            response.add(line);
        }
        reader.close();
        return response;
    }
     
    /**
     * 断开连接
     */
    public static void disconnect() {
        if (httpConn != null) {
            httpConn.disconnect();
        }
    }
}
```

# 测试代码

下面是如何使用我们构建的工具类。

```java
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
 
public class HttpUtilityTester {
 
    /**
     * 该程序使用 HttpUtility 类向 codebox 发送 GET 请求
     * 并向 Gmail 登录页面发送 POST 请求
     */
    public static void main(String[] args) {
        // 测试发送 GET 请求
        String requestURL = "https://codesofun.com";
        try {
            HttpUtility.sendGET(requestURL);
            List<String> response = HttpUtility.readMultipleBody();
            for (String line : response) {
                System.out.println(line);
            }
        } catch (IOException ex) {
            ex.printStackTrace();
        }
        HttpUtility.disconnect();

        System.out.println("=====================================");
         
        // 测试发送 POST 请求
        Map<String, String> params = new HashMap<String, String>();
        requestURL = "https://accounts.google.com/ServiceLoginAuth";
        params.put("Email", "your_email");
        params.put("Passwd", "your_password");
        
        try {
            HttpUtility.sendPOST(requestURL, params);
            List<String> response = HttpUtility.readMultipleBody();
            for (String line : response) {
                System.out.println(line);
            }
        } catch (IOException ex) {
            ex.printStackTrace();
        }
        HttpUtility.disconnect();
    }
}
```