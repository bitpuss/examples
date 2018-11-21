---
layout: post
title: Java GZIP 示例
permalink: java-compress/gzip-example.html
class: java
categories: ['java-compress']
---

# GZIPInputStream

GZIPInputStream 类（`java.util.zip.GZIPInputStream`）可用于解压使用 GZIP 压缩算法压缩的文件。

## 创建 GZIPInputStream

要使用 `GZIPInputStream` 必须首先创建一个它的实例。

```java
InputStream     fileInputStream = new FileInputStream("myfile.zip");
GZIPInputStream gzipInputStream = new GZIPInputStream(fileInputStream);
```

`GZIPInputStream` 构造函数接收一个 `InputStream` 参数。在上面的例子中，我传递了一个 `FileInputStream` 连接到一个名为 `myfile.zip` 的文件。然后，`GZIPInputStream` 将读取文件中的 GZIP 数据解压。

## 读取 GZIPInputStream 数据

创建完成后，可以从 `GZIPInputStream` 中读取解压的数据，和从其他的 `InputStream` 读取方法一样：

```java
int data = gzipInputStream.read();
while(data != -1){
    // 读取数据
    data = gzipInputStream.read();
}
```

## 关闭 GZIPInputStream

使用完 `GZIPInputStream` 记得关闭它。

```java
gzipInputStream.close();
```

也可以使用 `try-with-resources` 打开一个 `GZIPInputStream`，这样在使用完毕后会自动关闭。

```java
try(GZIPInputStream gzipInputStream = 
    new GZIPInputStream(new FileInputStream("myfile.zip"))) {

    int data = gzipInputStream.read();
    while(data != -1){
        // do something with data
        data = gzipInputStream.read();
    }
}
```

# GZIPOutputStream

GZIPOutputStream 类（`java.util.zip.GZIPOutStream`）可用于 GZIP 压缩数据并将其写入 `OutputStream`。

## 创建 GZIPOutputStream

在使用之前，必须创建一个 `GZIPOutputStream` 实例。下面是一个例子：

```java
FileOutputStream outputStream     = new FileOutputStream("myfile.zip");
GZIPOutputStream gzipOutputStream = new GZIPOutputStream(outputStream);
```

这个例子创建了一个 `GZIPOutputStream` 你可以使用它将你的数据进行 GZIP 压缩然后将压缩数据写入底层 `OutputStream`。

## 写入数据到 GZIPOutputStream

你可以将数据写入到 `GZIPOutputStream`，就像将数据写入其他 `OutputStream` 一样。下面是一个例子：

```java
byte[] data = ... ; // 获取一些字节数据

gzipOutputStream.write(data);
```

当你完成数据写入，必须关闭 `GZIPOutputStream`。可以使用 `close()` 方法关闭：

```java
gzipOutputStream.close();
```

也可以使用 `try-with-resources` 关闭 `GZIPOutputStream`：

```java
try(
    FileOutputStream outputStream     = new FileOutputStream("myfile.zip");
    GZIPOutputStream gzipOutputStream = new GZIPOutputStream(outputStream)
    ) {
        byte[] data = ... ; // 从某处获取数据
        gzipOutputStream.write(data);
}
```

当处理完成后，`GZIPOutputStream` 和 `FileOutputStream` 都会被关闭。