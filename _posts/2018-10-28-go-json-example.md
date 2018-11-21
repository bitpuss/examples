---
layout: post
title: Go JSON 解析示例
permalink: go-json/golang-json-example.html
class: golang
categories: ['go-json']
---

# 基本类型

JSON 编解码对应 Go 的默认类型：

- `bool` 对应 JSON boolean
- `float64` 对应 JSON number
- `string` 对应 JSON strings
- `nil` 对应 JSON null

此外，[time.Time](https://golang.org/pkg/time/#Time) 包和数字类型 [math/big](https://golang.org/pkg/math/big/) 可以自动编码为 JSON 字符串。

请注意，JSON 不支持基本整数类型，它们通常可以用浮点数代替。

# 结构体转 JSON

[encoding/json](https://golang.org/pkg/encoding/json/) 包中的函数 [json.Marshal](https://golang.org/pkg/encoding/json/#Marshal) 支持生成 JSON。

```go
type FruitBasket struct {
    Name    string
    Fruit   []string
    Id      int64  `json:"ref"`
    private string // An unexported field is not encoded.
    Created time.Time
}

basket := FruitBasket{
    Name:    "Standard",
    Fruit:   []string{"Apple", "Banana", "Orange"},
    Id:      999,
    private: "Second-rate",
    Created: time.Now(),
}

var jsonData []byte
jsonData, err := json.Marshal(basket)
if err != nil {
    log.Println(err)
}
fmt.Println(string(jsonData))
```

输出:

```json
{"Name":"Standard","Fruit":["Apple","Banana","Orange"],"ref":999,"Created":"2018-04-09T23:00:00Z"}
```

只有可以表示为 JSON 的数据才会被编码; 请参阅 [json.Marshal](https://golang.org/pkg/encoding/json/#Marshal) 完整的规则。

- 只有结构体的导出（公共）字段才会出现在 JSON 输出中。
- 带有 `json:` 标记的字段以其标记名称而不是其变量名称存储。
- 指针将被编码为它们指向的值，或者空指针是否为 `nil`。

# 美化输出

使用 [json.MarshalIndent](https://golang.org/pkg/encoding/json/#MarshalIndent) 函数代替 `json.Marshal` 用于缩进JSON输出。

```go
jsonData, err := json.MarshalIndent(basket, "", "    ")
```

输出:

```json
{
    "Name": "Standard",
    "Fruit": [
        "Apple",
        "Banana",
        "Orange"
    ],
    "ref": 999,
    "Created": "2018-04-09T23:00:00Z"
}
```

# JSON 转结构体

[encoding/json](https://golang.org/pkg/encoding/json/) 包中的函数 [json.Unmarshal](https://golang.org/pkg/encoding/json/#Unmarshal) 用于解析 JSON 数据。

```go
type FruitBasket struct {
    Name    string
    Fruit   []string
    Id      int64 `json:"ref"`
    Created time.Time
}

jsonData := []byte(`
{
    "Name": "Standard",
    "Fruit": [
        "Apple",
        "Banana",
        "Orange"
    ],
    "ref": 999,
    "Created": "2018-04-09T23:00:00Z"
}`)

var basket FruitBasket
err := json.Unmarshal(jsonData, &basket)
if err != nil {
    log.Println(err)
}
fmt.Println(basket.Name, basket.Fruit, basket.Id)
fmt.Println(basket.Created)
```

输出:

```shell
Standard [Apple Banana Orange] 999
2018-04-09 23:00:00 +0000 UTC
```

对于给定的 JSON key `Foo`，Unmarshal 将尝试按以下顺序匹配到 `struct` 字段：

1. 一个带有标签的可导出字段 `json:"Foo"`
2. 一个名为 `Foo` 的导出字段
3. 导出的字段名为 `FOO`，`FoO` 或其他一些不区分大小写的匹配项。

仅解码目标类型中的字段：

- 当你只想选择几个特定字段时，非常有用。
- 目标结构中的任何未导出的字段都不会受到影响。

# 任意对象和数组的转换

[encoding/json](https://golang.org/pkg/encoding/json/) 包使用：

- `map[string]interface{}` 存储一个 JSON 对象
- `[]interface{}` 存储一个 JSON 数组

它会将任何有效的 JSON 数据解析为普通 `interface{}`。

考虑这个JSON数据：

```json
{
    "Name": "Eve",
    "Age": 6,
    "Parents": [
        "Alice",
        "Bob"
    ]
}
```

`json.Unmarshal` 函数会将其解析为一个 map，key 是字符串，值本身存储为空接口：

```go
map[string]interface{}{
    "Name": "Eve",
    "Age":  6.0,
    "Parents": []interface{}{
        "Alice",
        "Bob",
    },
}
```

我们可以使用 `range` 语句迭代 map，并使用 switch 筛选类型来访问值。

```go
jsonData := []byte(`{"Name":"Eve","Age":6,"Parents":["Alice","Bob"]}`)

var v interface{}
json.Unmarshal(jsonData, &v)
data := v.(map[string]interface{})

for k, v := range data {
    switch v := v.(type) {
    case string:
        fmt.Println(k, v, "(string)")
    case float64:
        fmt.Println(k, v, "(float64)")
    case []interface{}:
        fmt.Println(k, "(array):")
        for i, u := range v {
            fmt.Println("    ", i, u)
        }
    default:
        fmt.Println(k, v, "(unknown)")
    }
}
```

输出:

```shell
Name Eve (string)
Age 6 (float64)
Parents (array):
     0 Alice
     1 Bob
```

# 文件

[encoding/json]() 包下封装了 [json.Decoder](https://golang.org/pkg/encoding/json/#Decoder) 和 [json.Encoder](https://golang.org/pkg/encoding/json/#Encoder) 用于读取和写入一些如流。为文件、JSON 数据提供支持。

这个例子中的代码

- 从 Reader（[strings.Reader](https://golang.org/pkg/strings/#Reader)）中读取 JSON 对象
- 从每个对象中删除 Age 字段
- 将对象写入 Write（[os.Stdout](https://golang.org/pkg/os/#pkg-variables)）

```go
const jsonData = `
    {"Name": "Alice", "Age": 25}
    {"Name": "Bob", "Age": 22}
`
reader := strings.NewReader(jsonData)
writer := os.Stdout

dec := json.NewDecoder(reader)
enc := json.NewEncoder(writer)

for {
    // 从 Read one JSON object and store it in a map.
    var m map[string]interface{}
    if err := dec.Decode(&m); err == io.EOF {
        break
    } else if err != nil {
        log.Fatal(err)
    }

    // 遍历 key 并移除 Age 字段
    for k := range m {
        if k == "Age" {
            delete(m, k)
        }
    }

    // 将 map 写入为 JSON 对象
    if err := enc.Encode(&m); err != nil {
        log.Println(err)
    }
}
```

输出:

```json
{"Name":"Alice"}
{"Name":"Bob"}
```