---
layout: post
title: 使用 gomail 包发送邮件
permalink: go-email/gomail-example.html
class: golang
categories: ['go-email']
---

Gomail 是一个简单、高效的发送电子邮件包，它经过良好的测试和记录。 
Gomail 只能使用 SMTP 服务器发送电子邮件，但是 API 比较灵活的，很容易实现其他方法使用本地 Postfix、API 等发送电子邮件。 

- 项目地址: https://github.com/go-gomail/gomail
- 文档：https://godoc.org/gopkg.in/gomail.v2
- 示例：https://godoc.org/gopkg.in/gomail.v2#example-package

# 特性

Gomail 支持：

- 附件
- 嵌入图像
- HTML 和文本模板
- 特殊字符的自动编码
- SSL 和 TLS
- 使用相同的 SMTP 连接发送多封电子邮件

# 使用

下载 gomail

```shell
go get gopkg.in/gomail.v2
```

使用代码

```go
m := gomail.NewMessage()

// 发件人
m.SetAddressHeader("From", "xxx@foxmail.com" /*"发件人地址"*/, "发件人") 

m.SetHeader("To",                                                            
    m.FormatAddress("xxxx@qq.com", "收件人")) // 收件人
    m.SetHeader("Cc",
    m.FormatAddress("xxxx@foxmail.com", "收件人")) //抄送

m.SetHeader("Bcc",  
    m.FormatAddress("xxxx@gmail.com", "收件人")) // 暗送

m.SetHeader("Subject", "liic测试")     // 主题

//m.SetBody("text/html",xxxxx ") // 可以放 html..还有其他的
m.SetBody("我是正文") // 正文

m.Attach("我是附件")  //添加附件

// 发送邮件服务器、端口、发件人账号、发件人密码
d := gomail.NewPlainDialer("smtp.qq.com", 465, "xxx@foxmail.com", "发件密码") 

if err := d.DialAndSend(m); err != nil {
    log.Println("发送失败", err)
    return
}

log.Println("done.发送成功")
```

运行，发送成功之后，就能收到邮件了。 

# 封装一下

```go
package main
 
import (
    "fmt"
    "bytes"
    "strings"
    "strconv"
    "io/ioutil"
    "html/template"
 
    "github.com/go-gomail/gomail"
    "golang.org/x/text/transform"
    "golang.org/x/text/encoding/simplifiedchinese"
)

EmailNotify struct {
    SmtpS   string
    SmtpP   int
    Fromer  string
    Toers   []string
    Ccers   []string
    EUser   string
    Epasswd string
}

var DefaultEmail *EmailNotify

func init() {
    smtp_s_str := "smtp.163.com"
    smtp_p_str := "25"
    sender_str := "xxxxxx@163.com"
    passwd_str := "xxxxxx"
 
    receivers := []string{}
    receiversStr := ""
    for _, receiverStr := range strings.Split(receiversStr, ";") {
        receivers = append(receivers, strings.TrimSpace(receiverStr))
    }
 
    smtp_p_int, _ := strconv.Atoi(smtp_p_str)
 
    DefaultEmail = &EmailNotify{
        SmtpS:   smtp_s_str,
        SmtpP:   smtp_p_int,
        Fromer:  sender_str,
        Toers:   receivers,
        Ccers:   []string{},
        EUser:   strings.Split(sender_str, "@")[0],
        Epasswd: passwd_str,
    }
}
 
func (en *EmailNotify) SendNotifyWithFile(title, content, filePath, newName string) bool {
    msg := gomail.NewMessage(gomail.SetCharset("utf-8"))
    msg.SetHeader("From", en.Fromer)
    msg.SetHeader("To", en.Toers...)
    msg.SetHeader("Subject", title)
 
    msg.SetBody("text/html", en.renderNotify(content))
 
    //防止中文文件名乱码
    fileName, _ := Utf8ToGbk([]byte(newName))
    msg.Attach(filePath, gomail.Rename(string(fileName)))
 
    mailer := gomail.NewDialer(en.SmtpS, en.SmtpP, en.EUser, en.Epasswd)
    if err := mailer.DialAndSend(msg); err != nil {
        fmt.Println(err.Error())
        panic(err)
    }
    return true
}
 
{% raw %}
func (en *EmailNotify) renderNotify(content string) string {
    tplStr := `<html>
                    <body>
                    {{ . }}
                    </body>
                </html>`
{% endraw %}
 
    outBuf := &bytes.Buffer{}
    tpl := template.New("email notify template")
    tpl, _ = tpl.Parse(tplStr)
    tpl.Execute(outBuf, content)
 
    return outBuf.String()
}

func Utf8ToGbk(s []byte) ([]byte, error) {
    reader := transform.NewReader(bytes.NewReader(s), simplifiedchinese.GBK.NewEncoder())
    d, e := ioutil.ReadAll(reader)
    if e != nil {
        return nil, e
    }
    return d, nil
}
```

# 常用邮箱

列举一些常用的邮箱，可以用来测试：

**QQ 邮箱**

- POP3 服务器地址：qq.com（端口：995） 
- SMTP 服务器地址：smtp.qq.com（端口：465/587）

**163 邮箱**

- POP3 服务器地址：pop.163.com（端口：110） 
- SMTP 服务器地址：smtp.163.com（端口：25）

**126 邮箱**

- POP3 服务器地址：pop.126.com（端口：110） 
- SMTP 服务器地址：smtp.126.com（端口：25）
