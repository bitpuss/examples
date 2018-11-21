---
layout: post
title: Jackson 解析器
permalink: java-json/jackson-jsonparser.html
class: java
categories: ['java-json']
---

Jackson JsonParser 类是一个低级别的 JSON 解析器。它类似于的 Java 中解析 XML 的 `StAX` 解析器，只不过 JsonParser 是用来解析 JSON 而不是 XML。

Jackson 的 JsonParser 效率低于 Jackson ObjectMapper。JsonParser 比 ObjectMapper 上手更快，但也更麻烦。

## 创建 JsonParser

为了创建 JsonParser 你首先需要创造一个 JsonFactory。JsonFactory 用于创建 JsonParser 实例。JsonFactory 类包含几个 `createParser()` 方法，每个不同的重载方法传入的参数不同。

以下是创建 JsonParser 从字符串中解析 JSON 的示例：

```java
String carJson =
        "{ \"brand\" : \"Mercedes\", \"doors\" : 5 }";

JsonFactory factory = new JsonFactory();
JsonParser  parser  = factory.createParser(carJson);
```

还可以通过一个传入 `Reader`，`InputStream`，`URL`，`byte` 数组或者 `char` 数组的`createParser()` 方法。

## 使用 JsonParser 解析JSON

一旦你创建了一个 `JsonParser`，就可以用它来解析 JSON。`JsonParser` 原理是将 JSON 分解为一系列 Token，你可以逐个迭代。

这是一个 `JsonParser` 简单地循环遍历所有标记并将其打印出来的示例。这不是一个非常有用的示例，但它向你展示了 JSON 被分解为多个标记，它还向你展示了如何遍历标记。

```java
String carJson =
        "{ \"brand\" : \"Mercedes\", \"doors\" : 5 }";

JsonFactory factory = new JsonFactory();
JsonParser  parser  = factory.createParser(carJson);

while(!parser.isClosed()){
    JsonToken jsonToken = parser.nextToken();
    System.out.println("jsonToken = " + jsonToken);
}
```

`isClosed()` 方法返回 false，JSON 源中仍有更多 Token。

通过调用 `JsonParser.nextToken()` 可以获得一个 `JsonToken`。你可以使用 JsonToken 来检查给定的标记。token 类型由类中的一组常量表示 JsonToken。这些常量是：

```java
START_OBJECT
END_OBJECT
START_ARRAY
END_ARRAY
FIELD_NAME
VALUE_EMBEDDED_OBJECT
VALUE_FALSE
VALUE_TRUE
VALUE_NULL
VALUE_STRING
VALUE_NUMBER_INT
VALUE_NUMBER_FLOAT
```

你可以使用这些常量来找出当前的标记的 JsonToken。可以使用 `equals()` 方法进行比较，下面是一个例子：

```java
String carJson =
        "{ \"brand\" : \"Mercedes\", \"doors\" : 5 }";

JsonFactory factory = new JsonFactory();
JsonParser  parser  = factory.createParser(carJson);

Car car = new Car();
while(!parser.isClosed()){
    JsonToken jsonToken = parser.nextToken();

    if(JsonToken.FIELD_NAME.equals(jsonToken)){
        String fieldName = parser.getCurrentName();
        System.out.println(fieldName);

        jsonToken = parser.nextToken();

        if("brand".equals(fieldName)){
            car.brand = parser.getValueAsString();
        } else if ("doors".equals(fieldName)){
            car.doors = parser.getValueAsInt();
        }
    }
}

System.out.println("car.brand = " + car.brand);
System.out.println("car.doors = " + car.doors);
```

如果指向的标记是字段名称，则通过调用 `getCurrentName()` 方法返回当前字段名称。

如果 token 指出是一个 String 类型，可以调用 `getValueAsString()` 返回当前 token 的字符串形式。如果是 int 类型可以调用 `getValueAsInt()` 返回当前 token 值为int。在 JsonParser 具有用于获得当前 token 值作为不同类型的多个类似的方法（例如 boolean，short，long， float，double 等等）。