---
layout: post
title: 使用 redigo 操作 Redis
permalink: go-database/golang-redigo-example.html
class: golang
categories: ['go-database']
---

golang 操作 redis 的客户端包有多个比如 redigo、go-redis，github 上 star 最多的莫属 redigo。

- github地址：https://github.com/gomodule/redigo 
- 文档：https://godoc.org/github.com/garyburd/redigo/redis

```shell
$ go get -v github.com/gomodule/redigo
```

# 连接

Conn 接口是与 Redis 协作的主要接口，可以使用 `Dial`、`DialWithTimeout` 或者 `NewConn` 函数来创建连接，当任务完成时，应用程序必须调用 `Close` 函数来完成操作。

```go
package main

import (
    "github.com/garyburd/redigo/redis"
    "fmt"
)

func main()  {
    conn,err := redis.Dial("tcp","127.0.0.1:6379")
    if err != nil {
        fmt.Println("connect redis error :",err)
        return
    }
    defer conn.Close()
}
```

# 命令操作

通过使用 `Conn` 接口中的 `Do` 方法执行 redis 命令，redis命令大全参考：http://doc.redisfans.com/

go 中发送与响应对应类型：

| **Go Type** | **Conversion** |
| ------ | ------ |
| `[]byte` | Sent as is |
| `string` | Sent as is |
| `int`, `int64` | `strconv.FormatInt(v)` |
| `float64` | `strconv.FormatFloat(v, 'g', -1, 64)` |
| `bool` | `true` -> `"1"`, `false` -> `"0"` |
| `nil` | `""` |
| all other types | `fmt.Print(v)` |

Redis 命令响应会用以下 Go 类型表示：

| **Redis Type** | **Go Type** |
| ------ | ------ |
| `error` | `redis.Error` |
| `integer` | `int64` |
| simple string | `string` |
| bulk string | `[]byte` or nil if value not present. |
| array | `[]interface{}` or nil if value not present. |

可以使用GO的类型断言或者reply辅助函数将返回的interface{}转换为对应类型。

操作示例：

## get、set

```go
package main

import (
    "github.com/garyburd/redigo/redis"
    "fmt"
)

func main()  {
    conn,err := redis.Dial("tcp","127.0.0.1:6379")
    if err != nil {
        fmt.Println("connect redis error :",err)
        return
    }

    defer conn.Close()
    _, err = conn.Do("SET", "name", "codebox")
    if err != nil {
        fmt.Println("redis set error:", err)
    }
    name, err := redis.String(conn.Do("GET", "name"))
    if err != nil {
        fmt.Println("redis get error:", err)
    } else {
        fmt.Printf("Got name: %s \n", name)
    }
}
```

后面创建连接的代码都是相同的，此步骤在下面就省略了。

## 设置 key 过期时间

```go
 _, err = conn.Do("expire", "name", 10) //10秒过期
if err != nil {
    fmt.Println("set expire error: ", err)
    return
}
```

## `mget`、`mset`

批量获取和批量设置值

```go
_, err = conn.Do("MSET", "name", "codebox", "age", 18)
if err != nil {
    fmt.Println("redis mset error:", err)
}
res, err := redis.Strings(conn.Do("MGET", "name", "age"))
if err != nil {
    fmt.Println("redis get error:", err)
} else {
    res_type := reflect.TypeOf(res)
    fmt.Printf("res type : %s \n", res_type)
    fmt.Printf("MGET name: %s \n", res)
    fmt.Println(len(res))
}
```

输出结果：

```shell
res type : []string 
MGET name: [codebox 18] 
2
```

## 列表操作

```go
// 省去连接代码...

_, err = conn.Do("LPUSH", "list1", "ele1","ele2","ele3")
if err != nil {
    fmt.Println("redis mset error:", err)
}

res, err := redis.String(conn.Do("LPOP", "list1"))
if err != nil {
    fmt.Println("redis POP error:", err)
} else {
    res_type := reflect.TypeOf(res)
    fmt.Printf("res type : %s \n", res_type)
    fmt.Printf("res  : %s \n", res)
}
```

输出结果

```shell
res type : string 
res  : ele3
```

## hash 操作

```go
// 省去连接代码...

_, err = conn.Do("HSET", "student","name", "codebox", "age", 18)
if err != nil {
    fmt.Println("redis mset error:", err)
}
res, err := redis.Int64(conn.Do("HGET", "student", "age"))
if err != nil {
    fmt.Println("redis HGET error:", err)
} else {
    res_type := reflect.TypeOf(res)
    fmt.Printf("res type : %s \n", res_type)
    fmt.Printf("res  : %d \n", res)
}
```

输出结果

```shell
res type : int64 
res  : 18
```

# Pipelining

管道操作可以理解为并发操作，并通过 `Send()`，`Flush()`，`Receive()` 三个方法实现。客户端可以使用 `Send()` 方法一次性向服务器发送一个或多个命令，命令发送完毕时，使用 `Flush()` 方法将缓冲区的命令输入一次性发送到服务器，客户端再使用 `Receive()` 方法依次按照先进先出的顺序读取所有命令操作结果。

```go
Send(commandName string, args ...interface{}) error
Flush() error
Receive() (reply interface{}, err error)
```

- `Send`：发送命令至缓冲区
- `Flush`：清空缓冲区，将命令一次性发送至服务器
- `Recevie`：依次读取服务器响应结果，当读取的命令未响应时，该操作会阻塞。

```go
// 省去连接代码...

conn.Send("HSET", "student", "name", "codebox", "age","18")
conn.Send("HSET", "student", "Score", "100")
conn.Send("HGET", "student", "age")
conn.Flush()

res1, err := conn.Receive()
fmt.Printf("Receive res1: %v \n", res1)
res2, err := conn.Receive()
fmt.Printf("Receive res2: %v\n",res2)
res3, err := conn.Receive()
fmt.Printf("Receive res3: %s\n",res3)
```

输出结果：

```shell
Receive res1: 0 
Receive res2: 0
Receive res3: 18
```

# 发布/订阅

redis 本身具有发布订阅的功能，其发布订阅功能通过命令 `SUBSCRIBE`(订阅)／`PUBLISH`(发布)实现，并且发布订阅模式可以是多对多模式还可支持正则表达式，发布者可以向一个或多个频道发送消息，订阅者可订阅一个或者多个频道接受消息。

**发布者**

![发布者]({{ '/static/images/2018/10/redis_publish.png' | prepend: site.cdnurl }})

**订阅者**

![订阅者]({{ '/static/images/2018/10/redis_subscribe.png' | prepend: site.cdnurl }})

操作示例，示例中将使用两个 `goroutine` 分别担任发布者和订阅者角色进行演示：

```go
func Subs() {  //订阅者
    // 省去连接代码...

    conn.Send("HSET", "student", "name", "codebox", "age", "18")
    conn.Send("HSET", "student", "Score", "100")
    conn.Send("HGET", "student", "age")
    conn.Flush()

    res1, err := conn.Receive()
    fmt.Printf("Receive res1: %v \n", res1)
    res2, err := conn.Receive()
    fmt.Printf("Receive res2: %v\n",res2)
    res3, err := conn.Receive()
    fmt.Printf("Receive res3: %s\n",res3)
    psc := redis.PubSubConn{conn}
    psc.Subscribe("channel1") //订阅channel1频道
    for {
        switch v := psc.Receive().(type) {
        case redis.Message:
            fmt.Printf("%s: message: %s\n", v.Channel, v.Data)
        case redis.Subscription:
            fmt.Printf("%s: %s %d\n", v.Channel, v.Kind, v.Count)
        case error:
            fmt.Println(v)
            return
        }
    }
}

func Push(message string)  { //发布者
    conn, _ := redis.Dial("tcp", "127.0.0.1:6379")
    _,err1 := conn.Do("PUBLISH", "channel1", message)
    if err1 != nil {
        fmt.Println("pub err: ", err1)
        return
    }
}

func main()  {
    go Subs()
    go Push("this is codebox")
    time.Sleep(time.Second*3)
}
```

输出结果

```shell
channel1: subscribe 1
channel1: message: this is codebox
```

# 事务操作

`MULTI`、`EXEC`、`DISCARD` 和 `WATCH` 是构成 Redis 事务的基础，当然我们使用 go 语言对 redis 进行事务操作的时候本质也是使用这些命令。

- `MULTI`：开启事务
- `EXEC`：执行事务
- `DISCARD`：取消事务
- `WATCH`：监视事务中的键变化，一旦有改变则取消事务。

```go
// 省去连接代码...
conn.Send("HSET", "student", "name", "codebox","age","18")
conn.Send("HSET", "student", "Score", "100")
conn.Send("HGET", "student", "age")
conn.Flush()

res1, err := conn.Receive()
fmt.Printf("Receive res1: %v \n", res1)
res2, err := conn.Receive()
fmt.Printf("Receive res2: %v \n",res2)
res3, err := conn.Receive()
fmt.Printf("Receive res3: %s \n",res3)
conn.Send("MULTI")
conn.Send("INCR", "foo")
conn.Send("INCR", "bar")
r, err := conn.Do("EXEC")
fmt.Println(r)
```

输出结果

```shell
[1, 1]
```

# 连接池使用

redis 连接池是通过 pool 结构体实现，以下是源码定义，相关参数说明已经备注：

```go
type Pool struct {
    // Dial is an application supplied function for creating and configuring a
    // connection.
    //
    // The connection returned from Dial must not be in a special state
    // (subscribed to pubsub channel, transaction started, ...).
    Dial func() (Conn, error) //连接方法

    // TestOnBorrow is an optional application supplied function for checking
    // the health of an idle connection before the connection is used again by
    // the application. Argument t is the time that the connection was returned
    // to the pool. If the function returns an error, then the connection is
    // closed.
    TestOnBorrow func(c Conn, t time.Time) error

    // Maximum number of idle connections in the pool.
    MaxIdle int  //最大的空闲连接数，即使没有redis连接时依然可以保持N个空闲的连接，而不被清除，随时处于待命状态

    // Maximum number of connections allocated by the pool at a given time.
    // When zero, there is no limit on the number of connections in the pool.
    MaxActive int //最大的激活连接数，同时最多有N个连接

    // Close connections after remaining idle for this duration. If the value
    // is zero, then idle connections are not closed. Applications should set
    // the timeout to a value less than the server's timeout.
    IdleTimeout time.Duration  //空闲连接等待时间，超过此时间后，空闲连接将被关闭

    // If Wait is true and the pool is at the MaxActive limit, then Get() waits
    // for a connection to be returned to the pool before returning.
    Wait bool  //当配置项为true并且MaxActive参数有限制时候，使用Get方法等待一个连接返回给连接池

    // Close connections older than this duration. If the value is zero, then
    // the pool does not close connections based on age.
    MaxConnLifetime time.Duration
    // contains filtered or unexported fields
}
```

下面是一个例子

```go
var Pool redis.Pool
func init()  {      // init 用于初始化一些参数，先于main执行
    Pool = redis.Pool{
        MaxIdle:     16,
        MaxActive:   32,
        IdleTimeout: 120,
        Dial: func() (redis.Conn, error) {
            return redis.Dial("tcp", "127.0.0.1:6379")
        },
    }
}

func main()  {
    conn :=Pool.Get()
    res,err := conn.Do("HSET", "student", "name", "codebox")
    fmt.Println(res,err)
    res1,err := redis.String(conn.Do("HGET", "student", "name"))
    fmt.Printf("res: %s, error: %v",res1,err)
}
```

输出结果

```shell
0 <nil>
res: codebox, error: <nil>
```