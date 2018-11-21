---
layout: post
title: FTP 文件上传示例
permalink: java-ftp/upload-example.html
class: java
categories: ['java-ftp']
---

要实现将文件从本地计算机上传到远程 FTP 服务器，[Apache Commons Net](http://commons.apache.org/net){:target="_blank"} 是一个首选库。它具有简单全面的 API，可以轻松地将上传文件到 FTP 服务器。

# Apache Commons Net API

`FTPClient` 类提供了六种 `storeXXX()` 的方法，用于通过 FTP 协议将本地文件传输到远程服务器：

1. `boolean      storeFile(String remote, InputStream local)`
2. `OutputStream storeFileStream(String remote)`
3. `boolean      storeUniqueFile(InputStream local)`
4. `boolean      storeUniqueFile(String remote, InputStream local)`
5. `OutputStream storeUniqueFileStream()`
6. `OutputStream storeUniqueFileStream(String remote)`

这么多方法有什么区别？什么时候使用哪一个？可以通过以下方式分类：

- 通过提供本地文件的 `InputStream`（具有 InputStream 作为参数的那些方法）来存储文件。当我们不关心字节如何从本地文件传输到远程文件时，可以使用这种类型的方法，只需让系统完成输入和输出。
- 通过写一个存储文件的 `OutputStream` 连接的（那些返回一个 `OutputStream` 方法的）。当我们想要控制字节传输方式时，需要这种类型的方法，方法是编写我们自己的代码来从本地文件读取字节，并通过 `OutputStream` 对象将这些字节写入远程文件。如果我们想通过计算在所需的总字节数上传输的字节数来显示上载的进度，这种方式非常有用。

上面两种方式可以结合使用：

- 显式命名远程文件（接受名为 `remote` 参数的那些方法）。
- 让服务器使用唯一名称命名远程文件（那些没有 `remote` 参数的方法）。

尽管 `storeXXX()` 方法有些错综复杂，但实际上常用的只有两种，它们是：

- `boolean storeFile(String remote, InputStream local)`
- `OutputStream storeFileStream(String remote)`

除了 `storeXXX()` 方法之外，还需要在文件传输之前和之后调用另外两个：

- `boolean setFileType(int fileType)`: 确定将哪种文件类型（`FTP.ASCII_FILE_TYPE` 或  `FTP.BINARY_FILE_TYPE`）用于文件传输。默认类型是 `ASCII`（纯文本文件），但应将其设置为二进制类型以便处理任何文件。必须在文件传输开始之前调用此方法。
- `boolean completePendingCommand()`: 在文件传输完成后调用该方法，用于处理是否成功传输。如果成功完成则返回 true，否则返回 false。我们应该检查这个方法的返回值，以确保上传实际成功。但是，对于某些 `storeXXX()` 方法，这个方法可能不是必须的。

> 注意：默认情况下，FTP 协议通过打开客户端端口建立数据连接，并允许服务器连接到此端口。这称为本地活动模式，但它通常被防火墙阻止，所以可能会导致文件传输无法正常工作。不过 FTP 协议还有另一种模式，即本地被动模式，通过打开服务器上的端口来建立连接，以便客户端连接，这种方式不会被防火墙阻止。

所以建议切换到 **本地被动模式** 传送数据，通过调用 FTPClient 类的 `enterLocalPassiveMode()` 方法。

# 上传文件的正确步骤

要使用 `Apache Commons Net API` 正确编写代码以将文件上载到FTP服务器，应遵循以下步骤：

1. 连接并登录服务器
2. 进入本地被动模式进行数据连接
3. 设置要传输到二进制的文件类型
4. 为本地文件创建一个 `InputStream`
5. 构造服务器上远程文件的路径，路径可以是绝对路径或相对于当前工作目录
6. 调用一个 `storeXXX()` 方法开始文件传输，有两种方式：
    - 使用基于 `InputStream` 的方法：这是最简单的方法，因为我们让系统完成细节。没有其他代码，只需将 `InputStream` 对象传递给适当的方法，例如 `storeFile(String remote，InputStream local)` 方法。
    - 使用基于 `OutputStream` 的方法：这是更复杂的方式，但更多的控制。通常，我们必须编写一些从本地文件的 `InputStream` 读取字节的代码，并将这些字节写入由 `storeXXX()` 方法返回的 `OutputStream` 中，例如 `storeFileStream(String remote)` 方法。
7. 关闭打开的 `InputStream` 和 `OutputStream`
8. 调用 `completePendingCommand()` 方法来完成传输
9. 注销并断开与服务器的连接

> 注意：我们应该检查 storeXXX() 和 completePendingCommand() 方法的返回值，以确保上传成功。

# 代码示例

下面的代码演示了如何使用以下两种方法将本地文件上传到 FTP 服务器

- `boolean storeFile(String remote, InputStream local)`
- `OutputStream storeFileStream(String remote)`

你可以通过 Maven 方式引入依赖，或者在 http://commons.apache.org/net/download_net.cgi 下载 jar 包。

**Maven 方式**

```xml
<dependency>
    <groupId>commons-net</groupId>
    <artifactId>commons-net</artifactId>
    <version>3.6</version>
</dependency>
```

在 `storeFile()` 方法之后，没有必要调用 `completePendingCommand()` 方法。这是完整的源代码：

```java
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPClient;

/**
 * 使用 Apache Commons Net API 完成本地文件上传到 FTP 服务器
 */
public class FTPUploadFileDemo {

    public static void main(String[] args) {
        String server = "www.myserver.com";
        int port = 21;
        String user = "user";
        String pass = "pass";

        FTPClient ftpClient = new FTPClient();
        try {
            ftpClient.connect(server, port);
            ftpClient.login(user, pass);
            ftpClient.enterLocalPassiveMode();
            ftpClient.setFileType(FTP.BINARY_FILE_TYPE);

            // #1: 使用 InputStream 上传第一个文件
            File firstLocalFile = new File("D:/Test/Projects.zip");

            String firstRemoteFile = "Projects.zip";
            InputStream inputStream = new FileInputStream(firstLocalFile);

            System.out.println("开始上传第一个文件");
            boolean done = ftpClient.storeFile(firstRemoteFile, inputStream);
            inputStream.close();
            if (done) {
                System.out.println("The first file is uploaded successfully.");
            }

            // #2: 使用 OutputStream 上传第二个文件
            File secondLocalFile = new File("E:/Test/Report.doc");
            String secondRemoteFile = "test/Report.doc";
            inputStream = new FileInputStream(secondLocalFile);

            System.out.println("开始上传第二个文件");
            OutputStream outputStream = ftpClient.storeFileStream(secondRemoteFile);
            byte[] bytesIn = new byte[4096];
            int read = 0;

            while ((read = inputStream.read(bytesIn)) != -1) {
                outputStream.write(bytesIn, 0, read);
            }
            inputStream.close();
            outputStream.close();

            boolean completed = ftpClient.completePendingCommand();
            if (completed) {
                System.out.println("两个文件上传成功");
            }
        } catch (IOException ex) {
            System.out.println("Error: " + ex.getMessage());
            ex.printStackTrace();
        } finally {
            try {
                if (ftpClient.isConnected()) {
                    ftpClient.logout();
                    ftpClient.disconnect();
                }
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
    }
}
```