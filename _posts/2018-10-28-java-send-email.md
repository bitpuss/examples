---
layout: post
title: Java 发送邮件示例
permalink: java-email/java-send-email.html
class: java
categories: ['java-email']
---

今天我们将研究使用 `JavaMail` 在 java 程序中发送邮件。发送邮件是实际开发中的常见任务之一，这就是为什么 Java 提供了强大的 `JavaMail API`，我们可以使用它来使用 SMTP 服务器发送电子邮件。JavaMail API 支持用于发送电子邮件的 TLS 和 SSL 身份验证。

# JavaMail 示例

JavaMail API 不是 JDK 标准库的一部分，所以你需要从它的 [官网](https://java.net/projects/javamail/pages/Home){:target="_blank"} 下载它。下载最新版本的 JavaMail 参考实现，并将其包含在项目构建路径中。jar 文件名将是 `javax.mail.jar`。

如果你使用 Maven 构建项目，只需在项目中添加以下依赖即可。

```xml
<dependency>
    <groupId>com.sun.mail</groupId>
    <artifactId>javax.mail</artifactId>
    <version>1.5.5</version>
</dependency>
```

发送电子邮件的Java程序包含以下步骤：

1. 创建 `javax.mail.Session` 对象
2. 创建 `javax.mail.internet.MimeMessage` 对象，在该对象中设置属性，例如收件人电子邮件地址，电子邮件主题，回复电子邮件，电子邮件正文，附件等。
3. 使用 `javax.mail.Transport` 发送电子邮件。
4. 创建会话的逻辑因 SMTP 服务器的类型而异，例如，如果 SMTP 服务器不需要任何身份验证，我们可以创建具有一些简单属性的 `Session` 对象，而如果它需要 TLS 或 SSL 身份验证，则创建的逻辑将有所不同。

所以，我将使用一些实用程序方法创建一个实用程序类来发送电子邮件，然后我将使用此实用程序方法与不同的SMTP服务器。

## JavaMail 示例程序

我们的 `EmailUtil` 类有一个发送电子邮件的方法，它需要 `javax.mail.Session` 和一些其他必需的字段作为参数。为了简单起见，一些参数是写死的，但你可以扩展这个方法传递参数或从配置文件中读取。

```java
import java.io.UnsupportedEncodingException;
import java.util.Date;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.activation.FileDataSource;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;

public class EmailUtil {

    /**
     * 发送 HTML 邮件的工具方法
     * @param session
     * @param toEmail
     * @param subject
     * @param body
     */
    public static void sendEmail(Session session, String toEmail, String subject, String body){
        try {
            MimeMessage msg = new MimeMessage(session);
            // 设置消息头
            msg.addHeader("Content-type", "text/HTML; charset=UTF-8");
            msg.addHeader("format", "flowed");
            msg.addHeader("Content-Transfer-Encoding", "8bit");

            msg.setFrom(new InternetAddress("no_reply@example.com", "NoReply-JD"));
            msg.setReplyTo(InternetAddress.parse("no_reply@example.com", false));
            msg.setSubject(subject, "UTF-8");
            msg.setText(body, "UTF-8");
            msg.setSentDate(new Date());

            msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail, false));
            System.out.println("消息准备OK");
            Transport.send(msg);  

            System.out.println("邮件发送成功");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

请注意，我在 `MimeMessage` 中设置了标题属性，你在邮件客户端中可以看到，其他代码都很简单。

下面用我们的程序来发送一封不需要身份验证的邮件。

## 使用 SMTP 发送邮件无需身份验证

```java
import java.util.Properties;

import javax.mail.Session;

public class SimpleEmail {
	
    public static void main(String[] args) {
        System.out.println("发送邮件开始");
		
        String smtpHostServer = "smtp.example.com";
        String emailID = "email_me@example.com";
	    
        Properties props = System.getProperties();
        props.put("mail.smtp.host", smtpHostServer);

        Session session = Session.getInstance(props, null);
        EmailUtil.sendEmail(session, emailID, "这是测试标题", "此处是测试内容");
    }
}
```

请注意，我使用 `Session.getInstance()` 通过传递 `Properties` 对象来获取 `Session` 对象。我们需要使用 SMTP 服务器主机设置 `mail.smtp.host` 属性。如果 SMTP 服务器不在默认端口（25）上运行，则还需要设置 `mail.smtp.port` 属性。只需使用你的免身份验证 SMTP 服务器运行程序，并将收件人电子邮件设置为您自己的邮箱地址，你就可以马上收到邮件。

这个程序容易理解也可以运行，在实际开发中，大多数SMTP服务器都使用某种身份验证，如 TLS 或 SSL 身份验证。所以，我们现在将看到如何为这些身份验证协议创建 `Session` 对象。

## 使用 TLS 身份验证在 Java SMTP 中发送邮件

```java
import java.util.Properties;

import javax.mail.Authenticator;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;

public class TLSEmail {

    /**
      (SMTP) 服务器发送邮件
      需要 TLS 或 SSL：smtp.gmail.com（使用身份验证）
      Use Authentication: Yes
      Port for TLS/STARTTLS: 587
    */
    public static void main(String[] args) {
        final String fromEmail = "myemailid@gmail.com"; // 需要一个有效的邮箱
        final String password = "mypassword"; // 你的邮箱密码
        final String toEmail = "myemail@yahoo.com"; // 要接收邮件的邮箱
		
        System.out.println("TLSEmail Start");
        Properties props = new Properties();
        props.put("mail.smtp.host", "smtp.gmail.com"); // SMTP 主机
        props.put("mail.smtp.port", "587"); // TLS 端口
        props.put("mail.smtp.auth", "true"); // 启用认证
        props.put("mail.smtp.starttls.enable", "true"); // 启用 STARTTLS
		
        // 创建 Authenticator 对象作为获取 Session 的参数
        Authenticator auth = new Authenticator() {
            // 重写 getPasswordAuthentication 方法
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(fromEmail, password);
            }
        };

        Session session = Session.getInstance(props, auth);
        EmailUtil.sendEmail(session, toEmail,"测试 TLS 邮件标题", "测试 TLS 邮件内容");
    }
}
```

由于我使用的是所有人都可以访问的 GMail SMTP 服务器，你可以在上面的程序中设置你的信息然后运行。

## SSL 身份验证的 Java SMTP 示例

```java
import java.util.Properties;

import javax.mail.Authenticator;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;

public class SSLEmail {

    /**
      (SMTP) 服务器发送邮件
      需要 TLS 或 SSL：smtp.gmail.com（使用身份验证）
      Use Authentication: Yes
      Port for TLS/STARTTLS: 465
    */
    public static void main(String[] args) {
        final String fromEmail = "myemailid@gmail.com"; // 需要一个有效的邮箱
        final String password = "mypassword"; // 你的邮箱密码
        final String toEmail = "myemail@yahoo.com"; // 要接收邮件的邮箱
		
        System.out.println("SSLEmail Start");
        Properties props = new Properties();
        props.put("mail.smtp.host", "smtp.gmail.com"); // SMTP 主机
        props.put("mail.smtp.socketFactory.port", "465"); // SSL 端口
        props.put("mail.smtp.socketFactory.class",
				"javax.net.ssl.SSLSocketFactory"); // SSL 工厂类
        props.put("mail.smtp.auth", "true"); // 启用 SMTP 认证
        props.put("mail.smtp.port", "465"); // SMTP 端口
		
        Authenticator auth = new Authenticator() {
            // 重写 getPasswordAuthentication 方法
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(fromEmail, password);
            }
        };
		
        Session session = Session.getDefaultInstance(props, auth);
        System.out.println("Session 创建");
        EmailUtil.sendEmail(session, toEmail, "发送 SSL 邮件标题", "SSL 邮件内容");
        EmailUtil.sendAttachmentEmail(session, toEmail, "发送 SSL 邮件带附件标题", "SSL 邮件带附件内容");
        EmailUtil.sendImageEmail(session, toEmail, "发送 SSL 邮件带图片标题", "SSL 邮件带图片内容");
    }
}
```

这个程序与 TLS 身份验证几乎相同，只是一些属性不同。如你所见，在调用 `EmailUtil` 类中的其他一些方法来发送附件和图像，但我还没有定义它们。在后面我会展开他们，前面我尽可能保持教程简单。

## JavaMail 示例 - 发送带附件的邮件

要将文件作为附件发送，我们需要创建一个 `javax.mail.internet.MimeBodyPart` 和 `javax.mail.internet.MimeMultipart` 的对象。首先在邮件中添加文本消息的正文，然后使用 `FileDataSource` 将文件附加到多部分正文的第二部分。如下所示：

```java
/**
 * 发送带附件的邮件
 * @param session
 * @param toEmail
 * @param subject
 * @param body
 */
public static void sendAttachmentEmail(Session session, String toEmail, String subject, String body){
    try {
        MimeMessage msg = new MimeMessage(session);
        msg.addHeader("Content-type", "text/HTML; charset=UTF-8");
        msg.addHeader("format", "flowed");
        msg.addHeader("Content-Transfer-Encoding", "8bit");
	      
        msg.setFrom(new InternetAddress("no_reply@example.com", "NoReply-JD"));
        msg.setReplyTo(InternetAddress.parse("no_reply@example.com", false));
        msg.setSubject(subject, "UTF-8");
        msg.setSentDate(new Date());
        msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail, false));
	      
        // 创建文本正文
        BodyPart messageBodyPart = new MimeBodyPart();
        // 填充文本消息
        messageBodyPart.setText(body);
         
        // 创建附件正文
        Multipart multipart = new MimeMultipart();
        // 添加文本消息
        multipart.addBodyPart(messageBodyPart);

        // 第二部分是附件
        messageBodyPart = new MimeBodyPart();
        String filename = "abc.txt";
        DataSource source = new FileDataSource(filename);
        messageBodyPart.setDataHandler(new DataHandler(source));
        messageBodyPart.setFileName(filename);
        multipart.addBodyPart(messageBodyPart);
        // 设置消息
        msg.setContent(multipart);

        // 发送消息
        Transport.send(msg);
        System.out.println("带附件的邮件发送成功!!");
    }catch (MessagingException e) {
        e.printStackTrace();
    } catch (UnsupportedEncodingException e) {
        e.printStackTrace();
    }
}
```

该程序看起来可能看起来很复杂，其实很简单，只需为文本消息创建一个正文部分，然后为附件创建另一个正文部分，然后将它们添加到多部分。你可以扩展这个方法添加多个附件。

# JavaMail 示例 – 发送带图片的邮件

由于我们可以创建 HTML 正文消息，如果图片在某个服务器上，我们可以使用 img 元素在消息中显示它们。但有时我们希望将图像附加到电子邮件中，然后在电子邮件正文中使用它。你可能见过很多带图片附件的邮件。

有个技巧是像任何其他附件一样附加图像文件，然后为图像文件设置 `Content-ID` Header，然后在电子邮件消息正文中使用相同的内容 ID `<img src='cid:image_id'>`。

```java
/**
 * 发送带图片的邮件

 * @param session
 * @param toEmail
 * @param subject
 * @param body
 */
public static void sendImageEmail(Session session, String toEmail, String subject, String body){
    try {
        MimeMessage msg = new MimeMessage(session);
        msg.addHeader("Content-type", "text/HTML; charset=UTF-8");
        msg.addHeader("format", "flowed");
        msg.addHeader("Content-Transfer-Encoding", "8bit");  
        msg.setFrom(new InternetAddress("no_reply@example.com", "NoReply-JD"));
        msg.setReplyTo(InternetAddress.parse("no_reply@example.com", false));
        msg.setSubject(subject, "UTF-8");
        msg.setSentDate(new Date());
        msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail, false));
	      
        // 创建消息正文
        BodyPart messageBodyPart = new MimeBodyPart();
        messageBodyPart.setText(body);
         
        // 创建带附件的正文
        Multipart multipart = new MimeMultipart();
        // 添加文本消息
        multipart.addBodyPart(messageBodyPart);

        // 第二部分图片附件
        messageBodyPart = new MimeBodyPart();
        String filename = "image.png";
        DataSource source = new FileDataSource(filename);
        messageBodyPart.setDataHandler(new DataHandler(source));
        messageBodyPart.setFileName(filename);
        //Trick is to add the content-id header here
        messageBodyPart.setHeader("Content-ID", "image_id");
        multipart.addBodyPart(messageBodyPart);

        // 第三部分显示图片到邮件正文中
        messageBodyPart = new MimeBodyPart();
        messageBodyPart.setContent("<h1>图片附件</h1>" +
        		     "<img src='cid:image_id'>", "text/html");
        multipart.addBodyPart(messageBodyPart);
         
        // 设置消息
        msg.setContent(multipart);

        // 发送邮件
        Transport.send(msg);
        System.out.println("EMail Sent Successfully with image!!");
    } catch (MessagingException e) {
        e.printStackTrace();
    } catch (UnsupportedEncodingException e) {
        e.printStackTrace();
    }
}
```

## JavaMail API 常见问题

1. `java.net.UnknownHostException`：当你的系统无法解析 SMTP 服务器的 IP 地址时，可能是 IP 地址不存在或者从你的网络无法访问。例如，GMail SMTP服务器是 `smtp.gmail.com`，如果我使用 `smtp.google.com`，就会报这个异常。如果主机名是正确的，请尝试通过命令行 ping 服务器以确保它可以从你的系统访问。

```shell
» ping smtp.gmail.com
PING gmail-smtp-msa.l.google.com (64.233.187.108): 56 data bytes
64 bytes from 64.233.187.108: icmp_seq=0 ttl=46 time=38.308 ms
64 bytes from 64.233.187.108: icmp_seq=1 ttl=46 time=42.247 ms
64 bytes from 64.233.187.108: icmp_seq=2 ttl=46 time=38.164 ms
64 bytes from 64.233.187.108: icmp_seq=3 ttl=46 time=53.153 ms
```

2. 如果您的程序卡在 `Transport.send()` 方法调用中，请检查 SMTP 端口是否正确。如果是正确的，那么使用 `telnet` 验证它是否可从你的机器访问，可能会有如下输出：

```shell
» telnet smtp.gmail.com 587
Trying 2607:f8b0:400e:c02::6d...
Connected to gmail-smtp-msa.l.google.com.
Escape character is '^]'.
220 mx.google.com ESMTP sx8sm78485186pab.5 - gsmtp
HELO
250 mx.google.com at your service
```

以上是 JavaMail 的示例，使用不同身份验证协议，附件和图像的 SMTP 服务器在 java 中发送邮件的全部内容。希望能帮助你解决 Java 中发送邮件的需求。