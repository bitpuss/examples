---
layout: post
title: Go 日志文件输出示例
permalink: go-log/golang-log-example.html
class: golang
categories: ['go-log']
---

下面是 golang log 包的几个重要函数说明。

```go
// 定义 logger, 传入参数 文件，前缀字符串，flag 标记
func New(out io.Writer, prefix string, flag int) *Logger
 
// 设置 flag 格式
func SetFlags(flag int)
 
// 配置 log 的输出格式
func SetPrefix(prefix string)
```

下面是 golang log 包参数中 flag 的用法。flag 有根据时间的，也有根据 code 行号的。

```go
Ldate         = 1 << iota     // the date: 2009/01/23 形如 2009/01/23 的日期
Ltime                         // the time: 01:23:23   形如 01:23:23   的时间
Lmicroseconds                 // microsecond resolution: 01:23:23.123123.  形如01:23:23.123123   的时间
Llongfile                     // full file name and line number: /a/b/c/d.go:23 全路径文件名和行号
Lshortfile                    // final file name element and line number: d.go:23. overrides Llongfile 文件名和行号
LstdFlags     = Ldate | Ltime // 日期和时间
```

废话不多说，直接通过一个完整的实例说明 golang log 实例。 

```go
package main

import (
    "log"
    "os"
)

func main(){
    // 定义一个文件
    fileName := "ll.log"
    logFile,err  := os.Create(fileName)
    defer logFile.Close()
    if err != nil {
        log.Fatalln("open file error !")
    }

    // 创建一个日志对象
    debugLog := log.New(logFile,"[Debug]",log.LstdFlags)
    debugLog.Println("A debug message here")
    
    // 配置一个日志格式的前缀
    debugLog.SetPrefix("[Info]")
    debugLog.Println("A Info Message here ")
    
    // 配置log的Flag参数
    debugLog.SetFlags(debugLog.Flags() | log.LstdFlags)
    debugLog.Println("A different prefix")
}
```

在 github 中找到了一个老外封装的 go-logging 库包，还真是特别好用。 go-logging 可自定义日志输出的格式和颜色。

```go
package main
 
import (
    "os"
    "fmt"
    "github.com/op/go-logging"
)
 
var log = logging.MustGetLogger("example")
 
var format = logging.MustStringFormatter(
    `%{color}%{time:15:04:05.000} %{shortfunc} > %{level:.4s} %{id:03x}%{color:reset} %{message}`,
)
 
type Password string
 
func (p Password) Redacted() interface{} {
    return logging.Redact(string(p))
}
 
func main() {
    logFile, err := os.OpenFile("log.txt", os.O_WRONLY, 0666)
    if err != nil{
        fmt.Println(err)
    }
    backend1 := logging.NewLogBackend(logFile, "", 0)
    backend2 := logging.NewLogBackend(os.Stderr, "", 0)
 
    backend2Formatter := logging.NewBackendFormatter(backend2, format)
    backend1Leveled := logging.AddModuleLevel(backend1)
    backend1Leveled.SetLevel(logging.INFO, "")
 
    logging.SetBackend(backend1Leveled, backend2Formatter)
 
    log.Debugf("debug %s", Password("secret"))
    log.Info("info")
    log.Notice("notice")
    log.Warning("warning")
    log.Error("codesofun.com")
    log.Critical("太严重了")
}
```

上面的 go-logging 代码运行后的输出:

```shell
$ go run main.go
18:26:36.456 main ▶ DEBU 001 debug ******
18:26:36.456 main ▶ INFO 002 info
18:26:36.456 main ▶ NOTI 003 notice
18:26:36.456 main ▶ WARN 004 warning
18:26:36.456 main ▶ ERRO 005 codesofun.com
18:26:36.456 main ▶ CRIT 006 太严重了
$ cat log.txt
info
notice
warning
codesofun.com
太严重了
```

下面是彩色日志的输出

![日志输出]({{ '/static/images/2018/10/go_logging_color.png' | prepend: site.cdnurl }})

