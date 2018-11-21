---
layout: post
title: Jackson 生成器
permalink: java-json/jackson-jsongenerator.html
class: java
categories: ['java-json']
---

`JsonGenerator` 用于从 Java 对象（或其他任何数据结构）生成 JSON。

## 创建 JsonGenerator

要创建 `JsonGenerator` 必须先创建一个 `JsonFactory` 实例。下面是创建 `JsonFactory` 的方法：

```java
JsonFactory factory = new JsonFactory();
```

一旦你创建了 `JsonFactory` 就可以创建 JsonGenerator 调用 `createGenerator()` 方法。以下是创建一个 `JsonGenerator` 的示例：

```java
JsonFactory factory = new JsonFactory();

JsonGenerator generator = factory.createGenerator(
    new File("data/output.json"), JsonEncoding.UTF8);
```

`createGenerator()` 方法的第一个参数是生成的 JSON 目标。在上面的示例中，参数是一个 `File` 对象。这意味着生成的 JSON 将写入到指定的文件中。`createGenerator()` 方法是重载的，因此该方法的其他版本需要例如 `OutputStream` 等参数，为你提供生成 JSON 写入的不同方式。

`createGenerator()` 方法的第二个参数是生成 JSON 时要使用的字符编码。上面的例子使用 `UTF-8`。

## 使用 JsonGenerator 生成JSON

创建完成后 `JsonGenerator`，即可开始生成 JSON。`JsonGenerator` 包含一组 `write...()` 方法，你可以使用这些方法编写 JSON 对象的各个部分。这是一个使用 JsonGenerator 生成 JSON 的简单示例：

```java
JsonFactory factory = new JsonFactory();

JsonGenerator generator = factory.createGenerator(
    new File("data/output.json"), JsonEncoding.UTF8);

generator.writeStartObject();
generator.writeStringField("brand", "Mercedes");
generator.writeNumberField("doors", 5);
generator.writeEndObject();

generator.close();
```

此示例首先调用 `writeStartObject()` 将写入 `{`。然后示例调用 `writeStringField()` 将`brand` 字段名称和值写入输出。之后调用 `writeNumberField()` 方法，将 `doors` 字段名和值写入输出。最后，调用 `writeEndObject()` 写入 `}`。

`JsonGenerator` 还有许多其他的写入方法。这个例子只展示了其中的一些。

## 关闭 JsonGenerator

完成 JSON 生成后，你应该关闭 `JsonGenerator`。你可以通过调用它的 `close()` 方法来实现。这是关闭 `JsonGenerator` 的方法：

```java
generator.close();
```

关闭 `JsonGenerator` 的时候也会关闭文件或 `OutputStream`，以及其他 `JsonGenerator` 写入生成的 JSON 的位置。
