---
layout: post
title: Go BCrypt 存储密码示例
permalink: go-encrypt/golang-bcrypt-example.html
class: golang
categories: ['go-encrypt']
---

安全存储用户密码的原则是：如果网站数据泄露了，密码也不能被还原。

以前常用简单的方式是通过md5 多层加密及加盐。比如：

```shell
md5( md5( password + '用户注册的时间戳' ) )
```

这种可以在安全度不够高的情况下使用，下面介绍一种较为安全的加密方式，使用 GoLang  `golang.org/x/crypto/bcrypt` 模块。

```go
package main

import (
    "fmt"
    "golang.org/x/crypto/bcrypt"
)

func main() {

    passwordOK := "admin"
    passwordERR := "adminxx"

    hash, err := bcrypt.GenerateFromPassword([]byte(passwordOK), bcrypt.DefaultCost)
    if err != nil {
        fmt.Println(err)
    }
    //fmt.Println(hash)

    encodePW := string(hash)  // 保存在数据库的密码，虽然每次生成都不同，只需保存一份即可
    fmt.Println(encodePW)

    // 正确密码验证
    err = bcrypt.CompareHashAndPassword([]byte(encodePW), []byte(passwordOK))
    if err != nil {
        fmt.Println("pw wrong")
    } else {
        fmt.Println("pw ok")
    }

    // 错误密码验证
    err = bcrypt.CompareHashAndPassword([]byte(encodePW), []byte(passwordERR))
    if err != nil {
        fmt.Println("pw wrong")
    } else {
        fmt.Println("pw ok")
    }
}
```

多运行几次，有下面输出

```shell
$ go run pw.go 
$2a$10$hgO0qRlaJtRyHrlPlbqIleHiTc5qCZANGQIDx375GYYV16i0lagqa
pw wrong
$ go run pw.go 
$2a$10$mVAPL9CNFeLJCIcU6Kwx9OPTRssCss.e9OC.O4jh.SBAb0OlyODV.
pw ok
$ go run pw.go 
$2a$10$tm3I/BWUr4kZUr85W/WMLu.q4U2qB5fZ5CvMgOl3ITZ7G2rYfR3oK
pw ok
pw wrong
$ go run pw.go 
$2a$10$sMoypQej4gFVdECYby.E.ecM0XODDShEoEjxmSAzLJNkf1qkxkwee
pw ok
pw wrong
$ go run pw.go 
$2a$10$BmwZfj4aUIaxOfiFUYU0KepjI2x.PmFbxjrN1YxzyPOb/Ee0iOuNm
pw ok
pw wrong
```

> 参考 https://godoc.org/golang.org/x/crypto/bcrypt