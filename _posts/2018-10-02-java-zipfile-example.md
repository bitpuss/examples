---
layout: post
title: ZipFile 解压缩示例
permalink: java-compress/zipfile-example.html
class: java
categories: ['java-compress']
---

Java ZipFile类（`java.util.zip.ZipFile`）可用于从 ZIP 文件中读取文件。`ZipFile` 类实际上非常容易使用。

# 创建 ZipFile

要使用 ZipFile 类，必须首先创建一个 ZipFile 实例。以下是创建 ZipFile 的示例：

```java
ZipFile zipFile = new ZipFile("d:\\data\\myzipfile.zip");
```

如你所见，ZipFile 类的构造函数只需要传一个参数，这个参数是要打开的 Zip 文件的路径。

# 获得 ZipEntry

Zip 文件中的每个文件都由 ZipEntry（`java.util.zip.ZipEntry`）表示。要从 Zip 包中提取文件，可以使用 ZipFile 的 `getEntry()` 方法 。这是一个调用的例子：

```java
ZipEntry zipEntry = zipFile.getEntry("file1.txt");
```

这个例子中获取的 ZipEntry 表示 `file1.txt` 文件。

如果要提取的文件位于 Zip 包内的一个或多个目录中，请在路径中包含目录，如下所示：

```java
ZipEntry zipEntry = zipFile.getEntry("dir/subdir/file1.txt");
```

# 读取文件

要读取文件内容，你可以使用 ZipFile 来获得一个 InputStream。

```java
ZipEntry zipEntry = zipFile.getEntry("dir/subdir/file1.txt");

InputStream inputStream = this.zipFile.getInputStream(zipEntry);
```

通过 ZipFile 获取到的 InputStream 和你往常使用的输入流都是一样一样的。

# 列出 ZipFile 所有项目

你可以调用 ZipFile 的 `entries()` 方法列出 Zip 中的所有项。

```java
Enumeration<? extends ZipEntry> entries = zipFile.entries();
```

可以像这样遍历方法 `Enumeration`：

```java
Enumeration<? extends ZipEntry> entries = zipFile.entries();

while(entries.hasMoreElements()){
    ZipEntry entry = entries.nextElement();
    if(entry.isDirectory()){
        System.out.println("目录: " + entry.getName());
    } else {
        System.out.println("文件: " + entry.getName());
    }
}
```

# 解压 ZipFile 所有项目

没有简单的方法解压缩 ZipFile 的所有条目。你必须自行实现，为了方便下面演示一个解压缩 ZipFile 中所有条目的代码示例：

```java
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

public class FileUnzipper {

    private String zipFileDir  = null;
    private String zipFileName = null;
    private String unzipDir    = null;

    public FileUnzipper(String zipFileDir, String zipFileName, String unzipDir) {
        this.zipFileDir  = zipFileDir;
        this.zipFileName = zipFileName;
        this.unzipDir    = unzipDir;
    }

    public void unzip() {
        String zipFilePath = this.zipFileDir + File.separator + this.zipFileName;
        try{
            System.out.println("zipFilePath = " + zipFilePath);
            ZipFile zipFile = new ZipFile(zipFilePath);

            Enumeration<? extends ZipEntry> entries = zipFile.entries();

            while(entries.hasMoreElements()){
                ZipEntry entry = entries.nextElement();
                if(entry.isDirectory()){
                    System.out.print("dir  : " + entry.getName());
                    String destPath = this.unzipDir + File.separator + entry.getName();
                    System.out.println(" => " + destPath);
                    File file = new File(destPath);
                    file.mkdirs();
                } else {
                    String destPath = this.unzipDir + File.separator + entry.getName();

                    try(InputStream inputStream = zipFile.getInputStream(entry);
                        FileOutputStream outputStream = new FileOutputStream(destPath);
                    ){
                        int data = inputStream.read();
                        while(data != -1){
                            outputStream.write(data);
                            data = inputStream.read();
                        }
                    }
                    System.out.println("file : " + entry.getName() + " => " + destPath);
                }
            }
        } catch(IOException e){
            throw new RuntimeException("Error unzipping file " + zipFilePath, e);
        }
    }
}
```
