---
layout: post
title: 编写地道的 Go 代码
permalink: go-best-practices/write-pure-go-code.html
class: golang
categories: ['go-best-practices']
---

在阅读本文之前，我先推荐你阅读官方的 [Effective Go](https://golang.org/doc/effective_go.html){:target="_blank"} 文档，或者是中文翻译版: [高效 Go 编程](https://go-zh.org/doc/effective_go.html){:target="_blank"}，它提供了很多编写标准而高效的 Go 代码指导，本文不会再重复介绍这些内容。

最地道的 Go 代码就是 Go 的标准库的代码，你有空的时候可以多看看 Google 的工程师是如何实现的。

# 注释

可以通过 `/* ... */` 或者 `// ...` 增加注释， `//` 之后应该加一个空格。

如果你想在每个文件中的头部加上注释，需要在版权注释和 `Package` 前面加一个空行，否则版权注释会作为 `Package` 的注释。

```go
// Copyright 2009 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
/*
Package net provides a portable interface for network I/O, including
TCP/IP, UDP, domain name resolution, and Unix domain sockets.
......
*/
package net

......
```

注释应该用一个完整的句子，注释的第一个单词应该是要注释的指示符，以便在 godoc 中容易查找。

注释应该以一个句点 `.` 结束。

# 声明 slice

声明空的 slice 应该使用下面的格式:

```go
var t []string
```

而不是这种格式:

```go
t := []string{}
```

前者声明了一个 nil slice，而后者是一个长度为 0 的非 nil 的 slice。

# 关于字符串大小写

错误字符串不应该大写，应该写成：

```go
fmt.Errorf("failed to write data")
```

而不是写成：

```go
fmt.Errorf("Failed to write data")
```

这是因为这些字符串可能和其它字符串相连接，组合后的字符串如果中间有大写字母开头的单词很突兀，除非这些首字母大写单词是固定使用的单词。

缩写词必须保持一致，比如都大写 `URL` 或者小写 `url`。比如 `HTTP`、`ID` 等。
例如 `sendOAuth` 或者 `oauthSend`。

常量一般声明为 `MaxLength`，而不是以下划线分隔 `MAX_LENGTH` 或者 `MAXLENGTH`。

也就是 Go 语言一般使用 `MixedCaps` 或者 `mixedCaps` 命名的方式区分包含多个单词的名称。

# 处理 error 而不是 panic 或者忽略

为了编写强壮的代码，不用使用_忽略错误，而是要处理每一个错误，尽管代码写起来可能有些繁琐。

尽量不要使用 panic。

# 一些名称

有些单词可能有多种写法，在项目中应该保持一致，比如 Golang 采用的写法:

```go
// marshaling
// unmarshaling
// canceling
// cancelation
```

而不是

```go
// marshalling
// unmarshalling
// cancelling
// cancellation
```

包名应该用单数的形式，比如 `util`、`model`,而不是 `utils`、`models`。

`Receiver` 的名称应该缩写，一般使用一个或者两个字符作为 `Receiver` 的名称，如

```go
func (f foo) method() {
    ...
}
```

如果方法中没有使用 `receiver`，还可以省略 receiver name，这样更清晰的表明方法中没有使用它:

```go
func (foo) method() {
    ...
}
```

# package 级的 Error 变量

通常会把自定义的 Error 放在 package 级别中，统一进行维护:

```go
var (
    ErrCacheMiss = errors.New("memcache: cache miss")
    ErrCASConflict = errors.New("memcache: compare-and-swap conflict")
    ErrNotStored = errors.New("memcache: item not stored")
    ErrServerError = errors.New("memcache: server error")
    ErrNoStats = errors.New("memcache: no statistics available")
    ErrMalformedKey = errors.New("malformed: key is too long or contains invalid characters")
    ErrNoServers = errors.New("memcache: no servers configured or available")
)
```

并且变量以 `Err` 开头。

# 空字符串检查

不要使用下面的方式检查空字符串:

```go
if len(s) == 0 {
    ...
}
```

而是使用下面的方式

```go
if s == "" {
    ...
}
```

下面的方法更是语法不对：

```go
if s == nil || s == "" {
    ...
}
```

# 非空 slice 检查

不要使用下面的方式检查空的slice:

```go
if s != nil && len(s) > 0 {
    ...
}
```

直接比较长度即可：

```go
if len(s) > 0 {
    ...
}
```

同样的道理也适用 `map` 和 `channel`。

# 省略不必要的变量

比如

```go
var whitespaceRegex, _ = regexp.Compile("\\s+")
```

可以简写为

```go
var whitespaceRegex = regexp.MustCompile(`\s+`)
```

有时候你看到的一些第三方的类提供了类似的方法:

```go
func Foo(...) (...,error)
func MustFoo(...) (...)
```

`MustFoo` 一般提供了一个不带 `error` 返回的类型。

# 直接使用 bool 值

对于 `bool` 类型的变量 `var b bool`，直接使用它作为判断条件，而不是使用它和 true/false 进行比较

```go
if b {
    ...
}
if !b {
    ...
}
```

而不是

```go
if b == true {
    ...
}
if b == false {
    ...
}
```

# byte/string slice 相等性比较

不要使用

```go
var s1 []byte
var s2 []byte
...
bytes.Compare(s1, s2) == 0
bytes.Compare(s1, s2) != 0
```

而是:

```go
var s1 []byte
var s2 []byte
...
bytes.Equal(s1, s2) == 0
bytes.Equal(s1, s2) != 0
```

# 检查是否包含子字符串

不要使用 `strings.IndexRune(s1, 'x') > -1` 及其类似的方法 `IndexAny`、`Index` 检查字符串包含，而是使用 `strings.ContainsRune`、`strings.ContainsAny`、`strings.Contains` 来检查。

# 使用类型转换而不是struct字面值

对于两个类型:

```go
type t1 struct {
    a int
    b int
}
type t2 struct {
    a int
    b int
}
```

可以使用类型转换将类型 `t1` 的变量转换成类型 `t2` 的变量，而不是像下面的代码进行转换

```go
v1 := t1{1, 2}
_ = t2{v1.a, v1.b}
```

应该使用类型转换，因为这两个 `struct` 底层的数据结构是一致的。

```go
_ = t2(v1)
```

# 复制 slice

不要使用下面的复制 slice 的方式:

```go
var b1, b2 []byte
for i, v := range b1 { 
    b2[i] = v
}
for i := range b1 { 
    b2[i] = b1[i]
}
```
而是使用内建的copy函数：

```go
copy(b2, b1)
```

# 不要在 for 中使用多此一举的 true

不要这样:

```go
for true {
}
```

而是要这样:

```go
for {
}
```

# 尽量缩短 if

下面的代码:

```go
x := true
if x {
    return true
}
return false
```

可以用 `return x` 代替。

同样下面的代码也可以使用 `return err` 代替：

```go
func fn1() error {
    var err error
    if err != nil {
        return err
    }
    return nil
}
```

```go
func fn1() bool{
    ...
    b := fn()
    if b {
        ... 
        return true
    } else {
        return false
    }
}
```

应该写成:

```go
func fn1() bool{
    ...
    b := fn()
    if !b {
        return false
    }
    ... 
    return true
}
```

也就是减少 if 的分支／缩进。

# append slice

不要这样:

```go
var a, b []int
for _, v := range a {
    b = append(b, v)
}
```

而是要这样

```go
var a, b []int
b = append(b, a...)
```

# 简化 range

```go
var m map[string]int
for _ = range m { 

}

for _, _ = range m {

}
```

可以简化为

```go
for range m {
}
```

对 `slice` 和 `channel` 也适用。

# 正则表达式中使用 raw 字符串避免转义字符

在使用正则表达式时，不要:

```go
regexp.MustCompile("\\.") 
regexp.Compile("\\.")
```

而是直接使用 `raw` 字符串，可以避免大量的 `\` 出现：

```go
regexp.MustCompile(`\.`) 
regexp.Compile(`\.`)
```

# 简化只包含单个 case 的 select

```go
select {
    case <-ch:
}
```

直接写成 `<-ch` 即可。`send` 也一样。

```go
for { 
    select {
    case x := <-ch:
        _ = x
    }
}
```

直接改成 `for-range` 即可。

这种简化只适用包含单个 case 的情况。

# slice 的索引

有时可以忽略 `slice` 的第一个索引或者第二个索引：

```go
var s []int
_ = s[:len(s)]
_ = s[0:len(s)]
```

可以写成 `s[:]`

# 使用 time.Since

下面的代码经常会用到：

```go
_ = time.Now().Sub(t1)
```

可以简写为:

```go
_ = time.Since(t1)
```

使用 `strings.TrimPrefix`／`strings.TrimSuffix` 掐头去尾

不要自己判断字符串是否以 XXX 开头或者结尾，然后自己再去掉 XXX，而是使用现成的函数。

```go
var s1 = "a string value"
var s2 = "a "
var s3 string
if strings.HasPrefix(s1, s2) { 
    s3 = s1[len(s2):]
}
```

可以简化为

```go
var s1 = "a string value"
var s2 = "a "
var s3 = strings.TrimPrefix(s1, s2)
```

# 使用工具检查你的代码

以上的很多优化规则都可以通过工具检查，下面列出了一些有用的工具：

- [go fmt](https://golang.org/pkg/fmt/){:target="_blank"}
- [go vet](https://golang.org/cmd/vet/){:target="_blank"}
- [gosimple](https://github.com/dominikh/go-tools/blob/master/cmd/gosimple){:target="_blank"}
- [keyify](https://github.com/dominikh/go-tools/blob/master/cmd/keyify){:target="_blank"}
- [staticcheck](https://github.com/dominikh/go-tools/blob/master/cmd/staticcheck){:target="_blank"}
- [unused](https://github.com/dominikh/go-tools/blob/master/cmd/unused){:target="_blank"}
- [golint](https://github.com/golang/lint){:target="_blank"}
- [misspell](https://github.com/client9/misspell){:target="_blank"}
- [goimports](https://godoc.org/golang.org/x/tools/cmd/goimports){:target="_blank"}
- [errcheck](https://github.com/kisielk/errcheck){:target="_blank"}
- [aligncheck](https://github.com/opennota/check){:target="_blank"}
