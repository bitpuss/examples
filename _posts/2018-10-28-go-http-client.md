---
layout: post
title: Go 发送 HTTP 请求
permalink: go-basic/golang-http-client.html
class: golang
categories: ['go-basic']
---

golang 要请求远程网页，可以使用 `net/http` 包中的 `client` 提供的方法实现。

# GET 请求

get 请求可以直接 `http.Get` 方法，非常简单。

```go
func httpGet() {
    resp, err := http.Get("http://www.baidu.com")
    if err != nil {
        // handle error
    }
 
    defer resp.Body.Close()
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        // handle error
    }
 
    fmt.Println(string(body))
}
```

# POST 请求

POST 相关的请求有三种，分别是：`http.post`、`http.postForm`、`http.Do` 请求。

## http.post

```go
func httpPost() {
    resp, err := http.Post("http://www.baidu.com",
        "application/x-www-form-urlencoded",
        strings.NewReader("name=biezhi"))
    if err != nil {
        fmt.Println(err)
    }
    defer resp.Body.Close()
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        // handle error
    }

    fmt.Println(string(body))
}
```

> 注意：请求里面的第二个参数必须带，否则会报错的。

## http.PostForm

```go
func PostData() {
    //client := &http.Client{}
    resp, err := http.PostForm("https://www.baidu.com",
        url.Values{
            "name":   {"biezhi"},
            "website": {"codesofun.com"},
        })
    defer resp.Body.Close()
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        fmt.Println(err)
    }
    fmt.Println(string(body))
}
```

## http.Do

对于比较复杂的 http 请求，我们可以用到 `http.do` 的方式进行请求。有时需要在请求的时候设置头参数、 cookie 之类的数据，就可以使用 `http.Do` 方法。

```go
func httpDo() {
    client := &http.Client{}

    req, err := http.NewRequest("POST", "http://www.baidu.com", 
                strings.NewReader("name=biezhi"))
                
    if err != nil {
        // handle error
    }

    req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
    req.Header.Set("Cookie", "name=biezhi")

    resp, err := client.Do(req)
    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        // handle error
    }
    fmt.Println(string(body))
}
```

同上面的 post 请求，必须要设定 `Content-Type` 为 `application/x-www-form-urlencoded`，post 参数才可正常传递。

如果要发起 `head` 请求可以直接使用 `http client` 的 `head` 方法，比较简单，这里就不再说明。
