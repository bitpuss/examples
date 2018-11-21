---
layout: post
title: SMTP 发送邮件示例
permalink: go-email/smtp-sendmail-example.html
class: golang
categories: ['go-email']
---

# smtp 

```go
package main

import (
    "log"
    "net/smtp"
)

func send(body string) {
    from := "...@gmail.com"
    pass := "..."
    to := "to_email@example.com"

    msg := "From: " + from + "\n" +
        "To: " + to + "\n" +
        "Subject: Hello there\n\n" +
        body

    err := smtp.SendMail("smtp.gmail.com:587",
        smtp.PlainAuth("", from, pass, "smtp.gmail.com"),
        from, []string{to}, []byte(msg))

    if err != nil {
        log.Printf("smtp error: %s", err)
        return
    }
    
    log.Print("sent, visit http://foobarbazz.mailinator.com")
}

func main() {
    send("hello there")
}
```

# 扩展一下

```go
package main

import (
    "bytes"
    "fmt"
    "mime/quotedprintable"
    "net/smtp"
    "strings"
)

const (
    SMTPServer = "smtp.gmail.com" // Gmail SMTP 服务器
)

type Sender struct {
    User     string
    Password string
}

func NewSender(Username, Password string) Sender {
    return Sender{Username, Password}
}

func (sender Sender) SendMail(Dest []string, Subject, bodyMessage string) {
    msg := "From: " + sender.User + "\n" +
        "To: " + strings.Join(Dest, ",") + "\n" +
        "Subject: " + Subject + "\n" + bodyMessage

    err := smtp.SendMail(SMTPServer+":587",
        smtp.PlainAuth("", sender.User, sender.Password, SMTPServer),
        sender.User, Dest, []byte(msg))

    if err != nil {
        fmt.Printf("smtp error: %s", err)
        return
    }
    fmt.Println("邮件发送成功!")
}

func (sender Sender) WriteEmail(dest []string, contentType, subject, bodyMessage string) string {

    header := make(map[string]string)
    header["From"] = sender.User

    receipient := ""

    for _, user := range dest {
        receipient = receipient + user
    }

    header["To"] = receipient
    header["Subject"] = subject
    header["MIME-Version"] = "1.0"
    header["Content-Type"] = fmt.Sprintf("%s; charset='utf-8'", contentType)
    header["Content-Transfer-Encoding"] = "quoted-printable"
    header["Content-Disposition"] = "inline"

    message := ""

    for key, value := range header {
        message += fmt.Sprintf("%s: %s\r\n", key, value)
    }

    var encodedMessage bytes.Buffer

    finalMessage := quotedprintable.NewWriter(&encodedMessage)
    finalMessage.Write([]byte(bodyMessage))
    finalMessage.Close()

    message += "\r\n" + encodedMessage.String()
    return message
}

func (sender *Sender) WriteHTMLEmail(dest []string, subject, bodyMessage string) string {
    return sender.WriteEmail(dest, "text/html", subject, bodyMessage)
}

func (sender *Sender) WritePlainEmail(dest []string, subject, bodyMessage string) string {
    return sender.WriteEmail(dest, "text/plain", subject, bodyMessage)
}
```

`main.go` 使用

```go
package main

func main() {

    sender := NewSender("<YOUR EMAIL ADDRESS>", "<YOUR EMAIL PASSWORD>")

    // 多个收件人
    Receiver := []string{"abc@gmail.com", "xyz@gmail.com", "helloworld@googlemail.com"}

    Subject := "Testing HTLML Email from golang"
    message := `
    <!DOCTYPE HTML PULBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
    <html>
    <head>
    <meta http-equiv="content-type" content="text/html"; charset=ISO-8859-1">
    </head>
    <body>This is the body<br>
    <div class="moz-signature"><i><br>
    <br>
    Regards<br>
    Alex<br>
    <i></div>
    </body>
    </html>
    `

    bodyMessage := sender.WriteHTMLEmail(Receiver, Subject, message)
    sender.SendMail(Receiver, Subject, bodyMessage)
}
```