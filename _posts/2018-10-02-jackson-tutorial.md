---
layout: post
title: Jackson 基本使用
permalink: java-json/jackson-tutorial.html
class: java
categories: ['java-json']
---

# 安装

Jackson 的 Java JSON API 由一个核心 JAR 文件（项目）和另外两个使用核心 JAR 文件的 JAR 包组成。Jackson JSON API 中的三个 JAR 文件（项目）是：

- Jackson Core
- Jackson Annotations
- Jackson Databind

这些项目也按顺序互相使用。Jackson Annotation 使用 Jackson Core 功能，Jackson Databind 使用 Jackson Annotation。

要在你的 Java 应用程序中引入 Jackson，你只需要将他们添加到你的 `classpath` 即可，这里我只介绍使用 Maven 的情况。

## Jackson Maven 依赖

将 Jackson 添加到你的 `pom.xml` 文件中。

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-core</artifactId>
    <version>2.9.6</version>
</dependency>

<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-annotations</artifactId>
    <version>2.9.6</version>
</dependency>

<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.9.6</version>
</dependency>
```

请注意，这两个 `jackson-annotations` 和 `jackson-databind` 具有“依赖传递”，以 `jackson-core`（jackson-databind 和 jackson-annotations）。这意味着，如果你打算使用该`jackson-databind` 项目，则只需将其作为依赖项包含在 Maven POM 文件中。然后它将传递上包含其他两个项目作为依赖项。一般我喜欢明确添加依赖项，以便我可以看到我正在使用的东西（但这只是我个人）。

# 基本使用

Jackson ObjectMapper 类（`com.fasterxml.jackson.databind.ObjectMapper`）是 Jackson JSON 解析最简单的方式。Jackson ObjectMapper 可以从字符串，流或文件中解析 JSON，并创建表示已解析 JSON 的 Java 对象或 Map。将 JSON 解析为 Java 对象也称为从 JSON 反序列化 Java 对象。

Jackson ObjectMapper 还可以从 Java 对象创建 JSON。从 Java 对象生成 JSON 也称为将 Java 对象序列化为 JSON。

Jackson ObjectMapper 可以将 JSON 解析为你自己开发的类的对象，或者解析为本教程后面介绍的内置 JSON 树模型的对象。

顺便说一下，它被称为 ObjectMapper 的原因是因为它将 JSON 映射到 Java 对象（反序列化），或将 Java 对象映射到 JSON（序列化）。

## Jackson Databind

ObjectMapper 类位于 `Jackson Databind` 项目中。

## ObjectMapper 示例

这是一个快速的 Jackson ObjectMapper 示例：

```java
ObjectMapper objectMapper = new ObjectMapper();

String carJson =
    "{ \"brand\" : \"Mercedes\", \"doors\" : 5 }";

try {
    Car car = objectMapper.readValue(carJson, Car.class);

    System.out.println("car brand = " + car.getBrand());
    System.out.println("car doors = " + car.getDoors());
} catch (IOException e) {
    e.printStackTrace();
}
```

这个 `Car` 类是我自定义的。和你看到的一样，将 `Car.class` 作为 `readValue()` 方法的第二个参数。`readValue()` 第一个参数是 JSON 源（比如字符串，流或文件）。下面是 Car 类的结构：

```java
public class Car {
    private String brand = null;
    private int doors = 0;

    public String getBrand() { return this.brand; }
    public void   setBrand(String brand){ this.brand = brand;}

    public int  getDoors() { return this.doors; }
    public void setDoors (int doors) { this.doors = doors; }
}
```

## ObjectMapper 如何将 JSON 字段与 Java 字段匹配

要正确地使用 Jackson 从 JSON 读取 Java 对象，了解 Jackson 如何将 JSON 对象的字段映射到 Java 对象的字段非常重要，因此下面将解释 Jackson 如何做到这一点。

默认情况下，Jackson 通过将 JSON 字段的名称与 Java 对象中的 `getter` 和 `setter` 方法相匹配，将 JSON 对象的字段映射到 Java 对象中的字段。Jackson 删除了 `getter` 和 `setter` 方法名称的 `“get”` 和 `“set”` 部分，并将剩余名称的第一个字符转换为小写。

例如，有一个名为 `brand` 的 JSON 字段对 Java 中的 getter 和 setter 则是 `getBrand()` 和 `setBrand()`。名为 engineNumber 的 JSON 字段将匹配名为 `getEngineNumber()` 和 `setEngineNumber()` 的方法。

如果需要以不同的方式将 JSON 对象字段与 Java 对象字段匹配，则需要使用自定义序列化程序和反序列化程序，或使用 Jackson 注解。

## Jackson 注解

Jackson 包含一组 Java 注解，你可以使用它们来修改 Jackson 如何在 Java 对象中读取和写入 JSON。

## 从字符串中读取对象

从 JSON 字符串中读取 Java 对象非常简单。你已经看到了一个例子。JSON 字符串被作为第一个参数，传给 `ObjectMapper.readValue()` 方法。这是另一个简化的例子：

```java
ObjectMapper objectMapper = new ObjectMapper();

String carJson =
    "{ \"brand\" : \"Mercedes\", \"doors\" : 5 }";

Car car = objectMapper.readValue(carJson, Car.class);
```

## 从 Reader 读取对象

你还可以从通过 `Reader` 实例加载的 JSON 中读取对象。以下是如何执行此操作的示例：

```java
ObjectMapper objectMapper = new ObjectMapper();

String carJson =
        "{ \"brand\" : \"Mercedes\", \"doors\" : 4 }";
Reader reader = new StringReader(carJson);

Car car = objectMapper.readValue(reader, Car.class);
```

## 从文件中读取对象

从文件中读取 JSON 当然可以通过 `FileReader`（而不是 `StringReader`）来完成，但也可以通过 File 对象来完成。以下是从文件中读取JSON的示例：

```java
ObjectMapper objectMapper = new ObjectMapper();
File file = new File("data/car.json");
Car car = objectMapper.readValue(file, Car.class);
```

## 从 URL 中读取对象

您可以通过 `URL(java.net.URL)` 这样从 JSON 读取对象：

```java
ObjectMapper objectMapper = new ObjectMapper();
URL url = new URL("file:data/car.json");
Car car = objectMapper.readValue(url, Car.class);
```

这个例子中使用文件 URL，但你也可以使用 HTTP URL（类似于 http://codesofun.com/some-data.json）。

## 从 InputStream 中读取对象

也可以通过 InputStream 从 JSON 中读取对象。下面是通过 InputStream 读取 JSON 的示例：

```java
ObjectMapper objectMapper = new ObjectMapper();
InputStream input = new FileInputStream("data/car.json");
Car car = objectMapper.readValue(input, Car.class);
```

## 读取字节数组为对象

Jackson 还支持从 JSON byte 数组中读取对象。下面是从 JSON byte 数组中读取对象的示例：

```java
ObjectMapper objectMapper = new ObjectMapper();
String carJson =
        "{ \"brand\" : \"Mercedes\", \"doors\" : 5 }";

byte[] bytes = carJson.getBytes("UTF-8");
Car car = objectMapper.readValue(bytes, Car.class);
```
## 读取 JSON 数组字符串为对象数组

Jackson ObjectMapper 还可以从 JSON 数组字符串中读取一组对象。以下是从 JSON 数组字符串中读取对象数组的示例：


```java
String jsonArray = "[{\"brand\":\"ford\"}, {\"brand\":\"Fiat\"}]";

ObjectMapper objectMapper = new ObjectMapper();
Car[] cars2 = objectMapper.readValue(jsonArray, Car[].class);
```

> 注意：Car数组类如何作为第二个参数传递给 `readValue()` 方法，用于告诉 `ObjectMapper` 你要读取Car 对象数组。

读取对象数组也适用于除字符串之外的其他 JSON 源。如 File，URL InputStream，Reader 等等。

## 读取 JSON 数组字符串为对象列表

Jackson ObjectMapper 还可以从 JSON 数组字符串中读取 Java 对象列表。下面是从 JSON 数组字符串中读取对象的示例：

```java
String jsonArray = "[{\"brand\":\"ford\"}, {\"brand\":\"Fiat\"}]";

ObjectMapper objectMapper = new ObjectMapper();
List<Car> cars1 = objectMapper.readValue(jsonArray, new TypeReference<List<Car>>(){});
```

> 注意：给 `readValue()` 方法传递一个 `TypeReference` 参数，这个参数告诉 Jackson 读取 JSON 数据到 List<Car> 对象。

## 读取 JSON 字符串为 Map

Jackson ObjectMapper 还可以从 JSON 字符串中读取 Map。如果你事先不知道要确切的 JSON 结构，这可能很有用。通常，你把 JSON 对象读入 Map。JSON 对象中的每个字段都将成为 Java 中的键值对。

以下是使用 Jackson 从 JSON 字符串中读取 Map 的示例：

```java
String jsonObject = "{\"brand\":\"ford\", \"doors\":5}";

ObjectMapper objectMapper = new ObjectMapper();
Map<String, Object> jsonMap = objectMapper.readValue(jsonObject,
    new TypeReference<Map<String,Object>>(){});
```

## 忽略未知的 JSON 字段

有时，JSON 中的字段数多于你希望从 JSON 中读取的 Java 对象中的字段数。默认情况下，Jackson 在这种情况下抛出异常，说它不知道字段 xyz，因为它在 Java 对象中找不到。

但是，有时应该允许 JSON 中的字段多于相应的 Java 对象中的字段。例如，如果要从 REST 服务解析 JSON，该服务包含的数据远远超出你的需要。在这种情况下，Jackson 允许使用配置忽略这些额外的字段。以下是配置 Jackson ObjectMapper 以忽略未知字段的方式：

```java
objectMapper.configure(
    DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
```

## 空值导致解析原始类型失败

当 JSON 字符串中包含一个字段，其值为 `null`，它在相应的 Java 对象是一个基本类型（int，long，float，double）。来看看这个 Car 类：

```java
public class Car {
    private String brand = null;
    private int doors = 0;

    public String getBrand() { return this.brand; }
    public void   setBrand(String brand){ this.brand = brand;}

    public int  getDoors(){ return this.doors; }
    public void setDoors (int doors) { this.doors = doors; }
}
```

注意 `doors` 字段是 `int` 类型，Java 中的基本类型（不是对象）。

现在假设有一个对应于 Car 对象的 JSON 字符串，如下所示：

```json
{ "brand":"Toyota", "doors":null }
```

`doors` 字段的值是 `null`。Java 中的原始类型没有 NULL。所以 Jackson ObjectMapper 默认忽略 null 原始字段的值。但是，你可以将 ObjectMapper 配置为解析不到 NULL 时失败。下面是如何配置 Jackson ObjectMapper 为原始字段解析失败：

```java
ObjectMapper objectMapper = new ObjectMapper();
objectMapper.configure(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, true);
```

随着 `FAIL_ON_NULL_FOR_PRIMITIVES` 配置值设置为 `true`，当你解析空 JSON 到原始 Java 字段时会抛出一个异常。下面是一个例子，它将解析失败，因为 JSON 字段包含 null：

```java
ObjectMapper objectMapper = new ObjectMapper();
objectMapper.configure(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, true);

String carJson = "{ \"brand\":\"Toyota\", \"doors\":null }";
Car car = objectMapper.readValue(carJson, Car.class);
```

请注意 JSON 字符串如何将 `doors` 字段设置为null。从此代码抛出的异常将如下所示：

```java
Exception in thread "main" com.fasterxml.jackson.databind.exc.MismatchedInputException:
    Cannot map `null` into type int
    (set DeserializationConfig.DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES to 'false' to allow)
 at [Source: (String)
    "{ "brand":"Toyota", "doors":null }"; line: 1, column: 29] (through reference chain: jackson.Car["doors"])
```

## 自定义反序列化

有时，你可能希望以一种和默认方式不同的解析方式将 JSON 字符串读取到 Java 对象中。你可以将自定义反序列化器添加到 ObjectMapper 用于特殊需求。

下面是在 Jackson 中注册和使用自定义反序列化器的方法：

```java
String json = "{ \"brand\" : \"Ford\", \"doors\" : 6 }";

SimpleModule module =
        new SimpleModule("CarDeserializer", new Version(3, 1, 8, null, null, null));
module.addDeserializer(Car.class, new CarDeserializer(Car.class));

ObjectMapper mapper = new ObjectMapper();
mapper.registerModule(module);

Car car = mapper.readValue(json, Car.class);
```

以下是 `CarDeserializer` 的类结构：

```java
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;

import java.io.IOException;

public class CarDeserializer extends StdDeserializer<Car> {

    public CarDeserializer(Class<?> vc) {
        super(vc);
    }

    @Override
    public Car deserialize(JsonParser parser, DeserializationContext deserializer) throws IOException {
        Car car = new Car();
        while(!parser.isClosed()){
            JsonToken jsonToken = parser.nextToken();

            if(JsonToken.FIELD_NAME.equals(jsonToken)){
                String fieldName = parser.getCurrentName();
                System.out.println(fieldName);

                jsonToken = parser.nextToken();

                if("brand".equals(fieldName)){
                    car.setBrand(parser.getValueAsString());
                } else if ("doors".equals(fieldName)){
                    car.setDoors(parser.getValueAsInt());
                }
            }
        }
        return car;
    }
}
```

## 将对象写为 JSON

Jackson ObjectMapper 还可用于从对象生成 JSON。你可以使用以下其中一个方法：

- `writeValue()`
- `writeValueAsString()`
- `writeValueAsBytes()`

以下是从 Car 对象生成 JSON 的示例，如前面示例中使用的那样：

```java
ObjectMapper objectMapper = new ObjectMapper();

Car car = new Car();
car.brand = "BMW";
car.doors = 4;

objectMapper.writeValue(
    new FileOutputStream("data/output-2.json"), car);
```

这个例子中先创建一个 ObjectMapper 和一个 Car 实例，最后调用 `ObjectMapper` 的 `writeValue()` 方法将 Car 对象 写为 JSON，并将它写入到给定的 `FileOutputStream`。

ObjectMapper 的 `writeValueAsString()` 和 `writeValueAsBytes()` 方法从对象生成 JSON，并返回所生成的 JSON 作为 `String` 或 `byte` 数组。下面是一个例子：

```java
ObjectMapper objectMapper = new ObjectMapper();

Car car = new Car();
car.brand = "BMW";
car.doors = 4;

String json = objectMapper.writeValueAsString(car);
System.out.println(json);
```

这个例子的 JSON 输出是：

```json
{"brand":"BMW","doors":4}
```

## 自定义序列化

有时你希望将 Java 对象序列化为 JSON 的方式与 Jackson 默认方式不同。例如，你可能希望在 JSON 中使用与 Java 对象中不同的字段名称，或者你可能希望完全忽略某些字段。

Jackson 允许你在 `ObjectMapper` 上面设置自定义序列化器。序列化方法支持注册某个类，然后在 ObjectMapper 要求序列化 Car 对象。下面是一个示例，说明如何为某个类注册自定义序列化：

```java
CarSerializer carSerializer = new CarSerializer(Car.class);
ObjectMapper objectMapper = new ObjectMapper();

SimpleModule module =
        new SimpleModule("CarSerializer", new Version(2, 1, 3, null, null, null));
module.addSerializer(Car.class, carSerializer);

objectMapper.registerModule(module);

Car car = new Car();
car.setBrand("Mercedes");
car.setDoors(5);

String carJson = objectMapper.writeValueAsString(car);
```

Jackson 自定义序列化程序示例生成的字符串如下所示：

```json
{"producer":"Mercedes","doorCount":5}
```

这个 `CarSerializer` 类看起来像这样：

```java
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

import java.io.IOException;

public class CarSerializer extends StdSerializer<Car> {

    protected CarSerializer(Class<Car> t) {
        super(t);
    }

    public void serialize(Car car, JsonGenerator jsonGenerator,
                          SerializerProvider serializerProvider)
            throws IOException {

        jsonGenerator.writeStartObject();
        jsonGenerator.writeStringField("producer", car.getBrand());
        jsonGenerator.writeNumberField("doorCount", car.getDoors());
        jsonGenerator.writeEndObject();
    }
}
```

> 注意：`serialize()` 方法的第二个参数是 Jackson JsonGenerator 对象。你可以使用此实例序列化对象 - 在本例中为 Car 对象。

## Jackson 日期格式化

默认情况下，Jackson 会将 `java.util.Date` 对象序列化为 `long` 值，即自 1970年1月1日 以来的毫秒数。但是，Jackson 还支持将日期格式化为字符串。

### Date 转 long

首先，我将向你演示默认的 Jackson 日期格式，该格式将 Date 序列化为 long，自1970年1月1日以来的毫秒数（其long表示）。这是一个包含 Date 字段的示例 Java 类：

```java
public class Transaction {
    private String type = null;
    private Date date = null;

    public Transaction() {
    }

    public Transaction(String type, Date date) {
        this.type = type;
        this.date = date;
    }

    // getter setter 省略
}
```

使用 Jackson 序列化 `Transaction` 对象和序列化任何其他 Java 对象一样。以下是代码：

```java
Transaction transaction = new Transaction("transfer", new Date());

ObjectMapper objectMapper = new ObjectMapper();
String output = objectMapper.writeValueAsString(transaction);

System.out.println(output);
```

示例打印的输出类似于：

```json
{"type":"transfer","date":1540010001301}
```

> 注意：`date` 字段的格式：它是一个 long 数字，正如上面所解释的那样。

### Date 转 String

将 Date 序列化为 long 对人类来说不是很易读。因此 Jackson 也支持文本日期格式。你指定的 Jackson 日期格式通过设置使用 `SimpleDateFormat上ObjectMapper`。以下是设置 `SimpleDateFormat` 的例子：

```java
SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
objectMapper2.setDateFormat(dateFormat);

String output2 = objectMapper2.writeValueAsString(transaction);
System.out.println(output2);
```

示例打印的输出看起来类似于：

```json
{"type":"transfer","date":"2018-10-20"}
```

> 注意：该 date 字段现在格式化为 String。


## Jackson 树模型

Jackson 有一个内置的树模型，可用于表示 JSON 对象。如果你不知道你将收到的 JSON 看起来如何，或者你出于某种原因不能（或者只是不想）创建一个类来表示它，那么 Jackson 的树模型很有用。

Jackson 树模型由 `JsonNode` 类表示。你可以使用 Jackson ObjectMapper 将 JSON 解析为 JsonNode 树模型，就像和使用自己的类一样。

### Jackson 树模型示例

这是一个简单的 Jackson 树模型示例：

```java
String carJson =
        "{ \"brand\" : \"Mercedes\", \"doors\" : 5 }";

ObjectMapper objectMapper = new ObjectMapper();
try {
    JsonNode node = objectMapper.readValue(carJson, JsonNode.class);
} catch (IOException e) {
    e.printStackTrace();
}
```

如你所见，只需要在传递第二个参数的时候传入 `JsonNode.class` 即可。

### JsonNode 类

将 JSON 解析为 JsonNode（或 JsonNode 实例树）后，可以操作 JsonNode 树模型。这是一个 JsonNode 示例，显示如何访问 JSON 字段，数组和嵌套对象：

```java
String carJson =
        "{ \"brand\" : \"Mercedes\", \"doors\" : 5," +
        "  \"owners\" : [\"John\", \"Jack\", \"Jill\"]," +
        "  \"nestedObject\" : { \"field\" : \"value\" } }";

ObjectMapper objectMapper = new ObjectMapper();
try {
    JsonNode node = objectMapper.readValue(carJson, JsonNode.class);
    JsonNode brandNode = node.get("brand");
    String brand = brandNode.asText();
    System.out.println("brand = " + brand);

    JsonNode doorsNode = node.get("doors");
    int doors = doorsNode.asInt();
    System.out.println("doors = " + doors);

    JsonNode array = node.get("owners");
    JsonNode jsonNode = array.get(0);
    String john = jsonNode.asText();
    System.out.println("john  = " + john);

    JsonNode child = node.get("nestedObject");
    JsonNode childField = child.get("field");
    String field = childField.asText();
    System.out.println("field = " + field);
} catch (IOException e) {
    e.printStackTrace();
}
```

请注意，JSON 字符串现在包含一个名为的数组字段 `owners` 和一个名为 `nestedObject` 的嵌套对象字段。

无论你是访问字段，数组还是嵌套对象，都可以使用该类的 `get()` 方法。通过提供字符串作为 `get()` 方法的参数，你可以访问 JsonNode 的字段。如果 JsonNode 表示数组，则需要将索引传递给 `get()` 方法。索引指定要获取的数组中的元素。

`Jackson ObjectMapper` 的教程到这里就结束啦，希望这篇教程对你有用！