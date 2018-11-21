---
layout: post
title: Go 操作 XML 文档
permalink: go-basic/golang-xml-example.html
class: golang
categories: ['go-basic']
---

# 简介

Go 的标准库 `encoding/xml` 提供了对 XML 的操作。xml 包提供了两种方式来操作 XML，一种是高阶的方式，一种是低阶的方式。高阶的方式提供了 `Marshal` 和 `Unmarshal` 两个函数分别来编码（将 Go 数据结构转换成 XML）和解码（将 XML 转换成 Go 数据结构）。低阶的方法则基于 `token` 来进行编码和解码。由于低阶的方法更常使用，因此先介绍低阶的方法。

# 低阶方法（Token）

## Token 和 XML 数据结构

低阶方法是以 Token 为单位操纵 XML，Token 有四种类型：

- `StartElement`：用来表示XML开始节点
- `EndElement`：用来表示XML结束节点
- `CharData`：即为XML的原始文本(raw text)
- `Comment`：表示注释

比如

```xml
<!-- comment -->
<action application="answer">raw text</action>
```

上例中，`<action application="answer">` 为 `StartElement`， `</action>` 为  `EndElement`，`raw text` 为 `CharData`，`<!-- -->` 为 `Comment`。进一步的，开始节点和结束节点均有名字，开始节点还可以拥有一个或多个属性。而注释和原始文本仅仅是字符串。在 xml 包中，对以上数据结构进行了封装，如下所示（这里仅列出重要的部分）：

```go
// 名字
type Name struct {
    Space string  // 名称空间，例如 <space:action></space:action>
    Local string  // 名称，例如 <action></action>
}

// 属性
type Attr struct {
    Name  Name
    Value string
}

// 差别联合体类型
// 包含 StartElement,EndElement,CharData,Comment 等类型
type Token interface{}

// 开始节点
type StartElement struct {
    Name Name
    Attr []Attr
}

// 用来产生对应的结束节点
func (e StartElement) End() EndElement 

// 结束节点
type EndElement struct {
    Name Name
}

// raw text
type CharData []byte

// 注释
type Comment []byte
```

## 解码

**解码器**

xml 包提供了一个解码器 `*xml.Decoder`，用来以 Token 方式解码：

```go
type Decoder struct {
    // ...
}

// 用来创建 Decoder，参数为io.Reader
func NewDecoder(r io.Reader) *Decoder  

// 返回下一个Token，解析结束返回io.EOF
func (d *Decoder) Token() (Token, error)  
```

**例子**

有了数据结构和解码器的定义，就可以编写实际例子了，这里以一个打印 XML 结构的例子来说明：

```go
package main

import (
    "bytes"
    "encoding/xml"
    "fmt"
    "io"
    "os"
)

func main() {
    // 要解析的XML如下，为了提高可读性，用+号连接若干字符串，用以进行排版
    data :=
        `<extension name="rtp_multicast_page">` +
            `<condition field="destination_number" expression="^pagegroup$|^7243$">` +
                `<!-- comment -->` +
                `<action application="answer">raw text</action>` +
                `<action application="esf_page_group"/>` +
            `</condition>` +
        `</extension>`

    // 创建一个reader,以满足io.Reader接口
    reader := bytes.NewReader([]byte(data))

    // 以io.Reader为参数，创建解码器
    dec := xml.NewDecoder(reader)

    // 开始遍历解码
    indent := ""    // 控制缩进
    sep := "    "   // 每层的缩进量为四个空格
    for {
        tok, err := dec.Token()  // 返回下一个Token
        // 错误处理
        if err == io.EOF {       // 如果读到结尾，则退出循环
            break
        } else if err != nil {   // 其他错误则退出程序
            os.Exit(1)
        }
        switch tok := tok.(type) {  // Type switch
        case xml.StartElement:      // 开始节点，打印名字和属性
            fmt.Print(indent)
            fmt.Printf("<%s ", tok.Name.Local)
            s := ""
            for _, v := range tok.Attr {
                fmt.Printf(`%s%s="%s"`, s, v.Name.Local, v.Value)
                s = " "
            }
            fmt.Println(">")
            indent += sep     // 遇到开始节点，则增加缩进量
        case xml.EndElement:  // 结束节点，打印名字
            indent = indent[:len(indent)-len(sep)]  // 遇到结束节点，则减少缩进量
            fmt.Printf("%s</%s>\n", indent, tok.Name.Local)
        case xml.CharData:     // 原始字符串，直接打印
            fmt.Printf("%s%s\n", indent, tok)
        case xml.Comment:      // 注释，直接打印
            fmt.Printf("%s<!-- %s -->\n", indent, tok)
        }
    }
}
```

该例用一个无限 for 循环，不断的获取 Token，然后用 Type Switch 判断类型，根据不同的类型进行处理。最后的输出如下：

```xml
<extension name="rtp_multicast_page">
    <condition field="destination_number" expression="^pagegroup$|^7243$">
        <!--  comment  -->
        <action application="answer">
            raw text
        </action>
        <action application="esf_page_group">
        </action>
    </condition>
</extension>
```

## 编码

**编码器**

xml 包提供了编码器，用以编码：

```go
// 编码器
type Encoder struct {
    // 没有导出任何字段
}
func NewEncoder(w io.Writer) *Encoder // 创建编码器，参数为io.Writer
func (enc *Encoder) EncodeToken(t Token) error  // 编码Token
func (enc *Encoder) Flush() error  // 刷新缓冲区，将已经编码内容写入io.Writer
func (enc *Encoder) Indent(prefix, indent string)  // 用作缩进
```

**例子**

有了编码器的定义，就可以编写实际代码了，假设我们要生成以下 XML：

```xml
<extension name="rtp_multicast_page">
    <condition field="destination_number" expression="^pagegroup$|^7243$">
        <action application="answer">raw text</action>
        <action application="esf_page_group"></action>
    </condition>
</extension>
```

代码如下：

```go
package main

import (
    "bytes"
    "encoding/xml"
    "fmt"
)

// 为了少敲几个字符，声明了attrmap类型和start函数
type attrmap map[string]string  // 属性的键值对容器

// start()用来构建开始节点
func start(tag string, attrs attrmap) xml.StartElement {
    var a []xml.Attr
    for k, v := range attrs {
        a = append(a, xml.Attr{xml.Name{"", k}, v})
    }
    return xml.StartElement{xml.Name{"", tag}, a}
}

func main() {
    // 创建编码器
    buffer := new(bytes.Buffer)
    enc := xml.NewEncoder(buffer)

    // 设置缩进，这里为4个空格
    enc.Indent("", "    ")

    // 开始生成XML
    startExtension := start("extension", attrmap{"name": "rtp_multicast_page"})
    enc.EncodeToken(startExtension)
    startCondition := start("condition", attrmap{"field": "destination_number",
        "expression": "^pagegroup$|^7243$"})
    enc.EncodeToken(startCondition)
    startAction := start("action", attrmap{"application": "answer"})
    enc.EncodeToken(startAction)
    enc.EncodeToken(xml.CharData("raw text"))
    enc.EncodeToken(startAction.End())
    startAction = start("action", attrmap{"application": "esf_page_group"})
    enc.EncodeToken(startAction)
    enc.EncodeToken(startAction.End())
    enc.EncodeToken(startCondition.End())
    enc.EncodeToken(startExtension.End())

    // 写入XML
    enc.Flush()

    // 打印结果
    fmt.Println(buffer)
}
```

# 高阶方法（Marshal 和 Unmarshal）

## 转换规则

- 因为 xml 包是以反射机制实现的转换，因此自定义的结构体必须导出所要转换的字段。
- 通常情况下都是结构体类型和 XML 数据之间互相转换。xml 包定义了结构体和 XML 数据的转换规则。xml 包根据字段的命名，字段的标签来映射XML元素，规则大致如下（仅列出重要部分，详细信息请参见 go 文档）： 
    - 形如 `xml:"value,value,..."` 的结构体标签为 xml 包所解析，第一个 value 对应 XML 中的名字（节点名、属性名）。
    - 字段与 XML 节点名对应关系： 
        - 如果存在名为 `XMLName` 的字段，并且标签中存在名字值，则该名字值为节点名称，否则
        - 如果存在名为 `XMLName` 的字段，并且类型为 `xml.Name`，则该字段的值为节点名称，否则
        - 结构体名称。
    - 字段标签的解析： 
        - `"-"` 忽略该字段
        - `"name,attr"` 字段映射为XML属性，name为属性名
        - `",attr"` 字段映射为XML属性，字段名为属性名
        - `",chardata"` 字段映射为原始字符串
        - `"omitempty"` 若包含此标签则在字段值为0值时忽略此字段
    - 视匿名字段的字段为结构体的字段

## 编码

**Marshal**

xml 包提供了 `Marshal` 方法用于编码XML：

```go
// 接收一个interface{}，遍历其结构，编码为XML
func Marshal(v interface{}) ([]byte, error)

// 和Marshal类似，只不过在编码时加了缩进，用于方便阅读
func MarshalIndent(v interface{}, prefix, indent string) ([]byte, error)
```

**例子**

假设要生成的 XML 如下：

```xml
<extension name="rtp_multicast_page">
    <condition field="destination_number" expression="^pagegroup$|^7243$">
        <action application="answer">raw text</action>
        <action application="esf_page_group"></action>
    </condition>
</extension>
```

Go代码：

```go
package main

import (
    "encoding/xml"
    "fmt"
)

type Action struct {
    XMLName     string `xml:"action"`
    Application string `xml:"application,attr"`
    Data        string `xml:",chardata"`
}

type Condition struct {
    XMLName    string `xml:"condition"`
    Field      string `xml:"field,attr"`
    Expression string `xml:"expression,attr"`
    Actions    []Action
}

type Extension struct {
    XMLName string `xml:"extension"`
    Name    string `xml:"name,attr"`
    Cond    Condition
}

func main() {
    var actions []Action
    actions = append(actions, Action{"", "answer", "raw text"})
    actions = append(actions, Action{"", "esf_page_group", ""})
    condition := Condition{"", "destination_number", "^pagegroup$|^7243$", actions}
    extension := Extension{"", "rtp_multicast_page", condition}

    data, _ := xml.MarshalIndent(extension, "", "    ")
    fmt.Printf("%s\n", data)
}
```

输出为：

```xml
<extension name="rtp_multicast_page">
    <condition field="destination_number" expression="^pagegroup$|^7243$">
        <action application="answer">raw text</action>
        <action application="esf_page_group"></action>
    </condition>
</extension>
```

## 解码

**Unmarshal**

xml 包提供了 `Unmarshal` 方法用于解码 XML：

```go
// 将data解码为v，v通常是结构体
func Unmarshal(data []byte, v interface{}) error
```

**例子**

`Unmarshal` 和 `Marshal` 互为相反操作，结构体不需要修改，只需要将上例的输出改为输入就可以了。

```go
package main

import (
    "encoding/xml"
    "fmt"
)

type Action struct {
    XMLName string
    Application string `xml:"application,attr"`
    Data string `xml:",chardata"`
}

type Condition struct {
    XMLName string `xml:"condition"`
    Field string `xml:"field,attr"`
    Expression string `xml:"expression,attr"`
    Actions []Action
}

type Extension struct {
    XMLName string `xml:"extension"`
    Name string `xml:"name,attr"`
    Cond Condition `xml:"condition"`
}

func main() {
    data := 
        `<extension name="rtp_multicast_page">` +
            `<condition field="destination_number" expression="^pagegroup$|^7243$">` +
                `<Actions application="answer">raw text</Actions>` +
                `<Actions application="esf_page_group"></Actions>` +
            `</condition>` +
        `</extension>`

    var ext Extension
    xml.Unmarshal([]byte(data), &ext)
    fmt.Println(ext)
}
```

结果为：

```shell
{ rtp_multicast_page { destination_number ^pagegroup$|^7243$ [{ answer raw text} { esf_page_group }]}}
```

这正是上一例中的输入。

# 结语

高阶方法和低阶方法各有各的适用场合。高阶方法适用于需要编码和解码整个 XML 并且需要以结构化的数据操纵 XML 的时候。另外高阶方法必须导出结构体，会破坏封装，这很可能是我们不想要的。低阶方法通常用在解析 XML 中的若干节点时使用。 