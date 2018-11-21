---
layout: post
title: Go MD5 示例
permalink: go-encrypt/golang-md5-example.html
class: golang
categories: ['go-encrypt']
---

# 加密字符串

```go
package main

import (
    "crypto/md5"
    "encoding/hex"
    "fmt"
)

func main() {
    data := []byte("hello world")
    s := fmt.Sprintf("%x", md5.Sum(data))
    fmt.Println(s)

    // 也可以用这种方式
    h := md5.New()
    h.Write(data)
    s = hex.EncodeToString(h.Sum(nil))
    fmt.Println(s)
}
```

输出结果：

```shell
5eb63bbbe01eeed093cb22bb8f5acdc3
5eb63bbbe01eeed093cb22bb8f5acdc3
```

# 计算小文件

```go
package main

import (
    "crypto/md5"
    "fmt"
    "io"
    "os"
)

func main() {
    testFile := "/path/to/file"
    file, err := os.Open(testFile)
    if err != nil {
        fmt.Println(err)
        return
    }
    md5h := md5.New()
    io.Copy(md5h, file)
    fmt.Printf("%x", md5h.Sum([]byte(""))) //md5
}
```

# 计算大文件

```go
package main

import (
    "crypto/md5"
    "fmt"
    "io"
    "math"
    "os"
)

const filechunk = 8192 // 8KB

func main() {
    file, err := os.Open("utf8.txt")
    if err != nil {
        panic(err.Error())
    }

    defer file.Close()

    // 计算文件大小
    info, _ := file.Stat()
    filesize := info.Size()
    blocks := uint64(math.Ceil(float64(filesize) / float64(filechunk)))

    hash := md5.New()

    for i := uint64(0); i < blocks; i++ {
        blocksize := int(math.Min(filechunk, float64(filesize-int64(i*filechunk))))
        buf := make([]byte, blocksize)

        file.Read(buf)
        io.WriteString(hash, string(buf)) // 追加哈希值
    }

    fmt.Printf("%s checksum is %x\n", file.Name(), hash.Sum(nil))
}
```

# 获取程序自身 md5

获取 golang 编译好的包本身的 md5 值，在验证开源的程序有没有被修改时很有用。

```go
package main

import (
    "crypto/md5"
    "encoding/hex"
    "fmt"
    "io"
    "os"
)

func HashFileMd5(filePath string) (string, error) {
    var returnMD5String string
    file, err := os.Open(filePath)
    if err != nil {
        return returnMD5String, err
    }
    defer file.Close()
    hash := md5.New()
    if _, err := io.Copy(hash, file); err != nil {
        return returnMD5String, err
    }
    hashInBytes := hash.Sum(nil)[:16]
    returnMD5String = hex.EncodeToString(hashInBytes)
    return returnMD5String, nil
}

func main() {
    hash, err := HashFileMd5(os.Args[0])
    if err == nil {
        fmt.Println(hash)
    }
}
```