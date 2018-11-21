---
layout: post
title: Go Channel 示例
permalink: go-basic/golang-channel.html
class: golang
categories: ['go-basic']
---

# Channel 示例

Channel 是连接协程(goroutine)的 channel 。你可以向一个 channel 写入数据然后从另外一个 channel 读取数据。

```go
package main

import "fmt"

func main() {

    // 使用 make(chan 数据类型) 来创建一个 Channel
    // Channel 的类型就是它们所传递的数据的类型
    messages := make(chan string)

    // 使用 channel <- 语法来向一个Channel写入数据
    // 这里我们从一个新的协程向 messages channel 写入数据ping
    go func() { messages <- "ping" }()

    // 使用 <-channel 语法来从Channel读取数据
    // 这里我们从 main 函数所在的协程来读取刚刚写入
    // messages channel 的数据
    msg := <-messages
    fmt.Println(msg)
}
```

运行结果

```shell
ping
```

当我们运行程序的时候，数据 ping 成功地从一个协程传递到了另外一个协程。

默认情况下，协程之间的通信是同步的，也就是说数据的发送端和接收端必须配对使用。Channel 的这种特点使得我们可以不用在程序结尾添加额外的代码也能够获取协程发送端发来的信息。因为程序执行到 `msg:=<-messages` 的时候被阻塞了，直到获得发送端发来的信息才继续执行。

# Channel 同步

我们使用 Channel 来同步协程之间的执行。

下面的例子是通过获取同步 channel 数据来阻塞程序执行的方法来等待另一个协程运行结束的。
也就是说 `main` 函数所在的协程在运行到 `<-done` 语句的时候将一直等待 `worker` 函数所在的协程执行完成，向 channel 写入数据才会（从 channel 获得数据）继续执行。

```go
package main

import "fmt"
import "time"

// 这个 worker 函数将以协程的方式运行
//  channel done被用来通知另外一个协程这个 worker 函数已经执行完成
func worker(done chan bool) {
    fmt.Print("working...")
    time.Sleep(time.Second)
    fmt.Println("done")

    // 向 channel 发送一个数据，表示 worker 函数已经执行完成
    done <- true
}

func main() {

    // 使用协程来调用 worker 函数，同时将 channel done 传递给协程
    // 以使得协程可以通知别的协程自己已经执行完成
    done := make(chan bool, 1)
    go worker(done)

    // 一直阻塞，直到从 worker 所在协程获得一个 worker 执行完成的数据
    <-done
}
```

运行结果

```shell
working...done
```

如果我们从 `main` 函数里面移除 `<-done` 语句，那么 `main` 函数在 `worker` 协程开始运行之前就结束了。

# Channel 方向

当使用 channel 作为函数的参数时，你可以指定该 channel 是只读的还是只写的。这种设置有时候会提高程序的参数类型安全。

```go
package main

import "fmt"

// 这个 ping 函数只接收能够发送数据的 channel 作为参数，试图从这个 channel 接收数据
// 会导致编译错误，这里只写的定义方式为 chan<- string 表示这个类型为
// 字符串的 channel 为只写 channel 
func ping(pings chan<- string, msg string) {
    pings <- msg
}

// pong 函数接收两个 channel 参数，一个是只读的 pings，使用 <-chan string 定义
// 另外一个是只写的 pongs，使用 chan<- string来定义
func pong(pings <-chan string, pongs chan<- string) {
    msg := <-pings
    pongs <- msg
}

func main() {
    pings := make(chan string, 1)
    pongs := make(chan string, 1)
    ping(pings, "passed message")
    pong(pings, pongs)
    fmt.Println(<-pongs)
}
```

运行结果

```shell
passed message
```

其实这个例子就是把信息首先写入 `pings` channel 里面，然后在 `pong` 函数里面再把信息从 `pings` channel 里面读出来再写入 `pongs` channel 里面，最后在 `main` 函数里面将信息从 `pongs` channel 里面读出来。

在这里，`pings` 和 `pongs` 事实上是可读且可写的，不过作为参数传递的时候，函数参数限定了 channel 的方向。不过 `pings` 和 `pongs` 在 `ping` 和 `pong` 函数里面还是可读且可写的。只是 `ping` 和 `pong` 函数调用的时候把它们当作了只读或者只写。

# Channel 缓冲

默认情况下，channel 是不带缓冲区的。

发送端发送数据，同时必须又接收端相应的接收数据。

而带缓冲区的 channel 则允许发送端的数据发送和接收端的数据获取处于异步状态，就是说发送端发送的数据可以放在缓冲区里面，可以等待接收端去获取数据，而不是立刻需要接收端去获取数据。

不过由于缓冲区的大小是有限的，所以还是必须有接收端来接收数据的，否则缓冲区一满，数据发送端就无法再发送数据了。

```go
package main

import "fmt"

func main() {

    // 这里我们定义了一个可以存储字符串类型的带缓冲 channel 
    // 缓冲区大小为 2
    messages := make(chan string, 2)

    // 因为 messages 是带缓冲的 channel ，我们可以同时发送两个数据
    // 而不用立刻需要去同步读取数据
    messages <- "buffered"
    messages <- "channel"

    // 然后我们和上面例子一样获取这两个数据
    fmt.Println(<-messages)
    fmt.Println(<-messages)
}
```

运行结果

```shell
buffered
channel
```

# Channel 遍历

我们知道 `range` 函数可以遍历数组，切片，字典等。这里我们还可以使用 `range` 函数来遍历通道以接收通道数据。

```go
package main

import "fmt"

func main() {

    // 我们遍历 queue 通道里面的两个数据
    queue := make(chan string, 2)
    queue <- "one"
    queue <- "two"
    close(queue)

    // range 函数遍历每个从通道接收到的数据，因为 queue 再发送完两个
    // 数据之后就关闭了通道，所以这里我们 range 函数在接收到两个数据
    // 之后就结束了。如果上面的 queue 通道不关闭，那么 range 函数就不
    // 会结束，从而在接收第三个数据的时候就阻塞了。
    for elem := range queue {
        fmt.Println(elem)
    }
}
```

运行结果

```shell
one
two
```

# Channel Select

Go 的 `select` 关键字可以让你同时等待多个 channel 操作，将协程（goroutine）， channel （channel）和 select 结合起来构成了 Go 的一个强大特性。

```go
package main

import "time"
import "fmt"

func main() {

    // 本例中，我们从两个 channel 中选择
    c1 := make(chan string)
    c2 := make(chan string)

    // 为了模拟并行协程的阻塞操作，我们让每个 channel 在一段时间后再写入一个值
    go func() {
        time.Sleep(time.Second * 1)
        c1 <- "one"
    }()
    go func() {
        time.Sleep(time.Second * 2)
        c2 <- "two"
    }()

    // 我们使用 select 来等待这两个 channel 的值，然后输出
    for i := 0; i < 2; i++ {
        select {
        case msg1 := <-c1:
            fmt.Println("received", msg1)
        case msg2 := <-c2:
            fmt.Println("received", msg2)
        }
    }
}
```

输出结果

```shell
received one
received two
```

如我们所期望的，程序输出了正确的值。对于 `select` 语句而言，它不断地检测 channel 是否有值过来，一旦发现有值过来，立刻获取输出。
