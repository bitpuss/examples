---
layout: post
title: Jackson 注解
permalink: java-json/jackson-annotations.html
class: java
categories: ['java-json']
---

Jackson JSON 工具包包含一组 Java 注解，你可以使用它们来影响如何将 JSON 读对象，或者从对象生成 JSON。本文将向你介绍如何使用这些注解。

# 读取+写入注解

Jackson 包含一组注解，这些注解既影响从 JSON 读取 Java 对象，又影响将 Java 对象写入 JSON。我将这些注解称为 `读取+写入注解`。

## @JsonIgnore

`@JsonIgnore` 用于告诉 Jackson 忽略 Java 对象的某个属性（字段）。将 JSON 读入 Java 对象时，以及将 Java 对象写入 JSON 时，都会忽略该属性。下面是一个使用 `@JsonIgnore` 注解的示例：

```java
import com.fasterxml.jackson.annotation.JsonIgnore;

public class PersonIgnore {
    @JsonIgnore
    public long    personId = 0;
    public String  name = null;
}
```

在上面的类中，`personId` 属性不会从 JSON 读取到对象中，也不会将它写入到 JSON。

## @JsonIgnoreProperties

`@JsonIgnoreProperties` 注解用于指定一个类的属性忽略的列表。`@JsonIgnoreProperties` 注解被用于类声明，而不是上面的单个属性（字段）。下面展示如何使用 `@JsonIgnoreProperties`：

```java
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties({"firstName", "lastName"})
public class PersonIgnoreProperties {
    public long    personId = 0;
    public String  firstName = null;
    public String  lastName  = null;
}
```

在这个示例中，属性 `firstName` 和 `lastName` 将被忽略，因为它们的名称列在 `@JsonIgnoreProperties` 注解上被声明。

## @JsonIgnoreType

`@JsonIgnoreType` 用来标记一个类型（类）被忽略的时候。下面这个示例，展示如何使用 `@JsonIgnoreType`：

```java
import com.fasterxml.jackson.annotation.JsonIgnoreType;

public class PersonIgnoreType {

    @JsonIgnoreType
    public static class Address {
        public String streetName  = null;
        public String houseNumber = null;
        public String zipCode     = null;
        public String city        = null;
        public String country     = null;
    }

    public long    personId = 0;
    public String  name = null;
    public Address address = null;
}
```

在上面的示例中，`Address` 的所有实例将被忽略。

## @JsonAutoDetect

`@JsonAutoDetect` 用于告诉 Jackson 在读取和写入对象时包含非 `public` 的属性。这是一个示例类，展示如何使用 `@JsonAutoDetect`：

```java
import com.fasterxml.jackson.annotation.JsonAutoDetect;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY )
public class PersonAutoDetect {
    private long  personId = 123;
    public String name     = null;
}
```

`JsonAutoDetect.Visibility` 类包含匹配 Java 中的可见常量，包括 `ANY`，`DEFAULT`，`NON_PRIVATE`，`NONE`，`PROTECTED_AND_PRIVATE` 和 `PUBLIC_ONLY`。

# 读取注解

Jackson 还包含一组注解，这些注解只会影响如何将 JSON 解析为对象 - 这意味着它们会影响 Jackson 对 JSON 的读取。我将这些称为 `读取注解`。

## @JsonSetter

`@JsonSetter` 在将 JSON 读入对象时，用于告诉 Jackson 应该将 `setter` 方法的名称与 JSON 对象中的属性名称匹配。如果 Java 类中内部使用的属性名称与 JSON 文件中使用的属性名称不同，那么这个注解很有用。

下面的 Person 类使用 `personId` 作为唯一 id：

```java
public class Person {
    private long   personId = 0;
    private String name     = null;

    public long getPersonId() { return this.personId; }
    public void setPersonId(long personId) { this.personId = personId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
```

但是在 JSON 对象中，使用名称 `id` 而不是 `personId`：

```json
{
  "id"   : 1234,
  "name" : "John"
}
```

如果没有一些帮助，Jackson 也不知道如何将 id 从 JSON 对象映射到 Java 的 `personId` 字段。

`@JsonSetter` 注解可以告诉 Jackson 对于某些指定的 `setter` 方法。在我们的例子中，我们 `setPersonId()` 方法上 使用 `@JsonSetter`。下面是添加 `@JsonSetter` 注解的方式：

```java
public class Person {

    private long   personId = 0;
    private String name     = null;

    public long getPersonId() { return this.personId; }
    @JsonSetter("id")
    public void setPersonId(long personId) { this.personId = personId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
```

`@JsonSetter` 注解中指定的值是与 `setter` 方法匹配的 JSON 字段的名称。在这种情况下，名称是 id 因为这是我们要映射到 `setPersonId()` 方法的 JSON 对象中的字段的名称。

## @JsonAnySetter

`@JsonAnySetter` 告诉 Jackson 为 JSON 对象中的所有无法识别的字段调用相同的 `setter` 方法。所谓 `无法识别` 是指所有尚未映射到 Java 对象中的属性或 `setter` 方法的字段。看看 `Bag` 这个类：

```java
public class Bag {

    private Map<String, Object> properties = new HashMap<>();

    public void set(String fieldName, Object value){
        this.properties.put(fieldName, value);
    }

    public Object get(String fieldName){
        return this.properties.get(fieldName);
    }
}
```

然后看看这个 JSON 对象：

```json
{
  "id"   : 1234,
  "name" : "John"
}
```

Jackson 不能直接将 JSON 对象的 `id` 和 `name` 映射到 `Bag` 类，因为 `Bag` 类没有公共字段和 `setter` 方法。

你可以通过添加 `@JsonAnySetter` 注解告诉 Jackson 为所有无法识别的字段调用 `set()` 方法：

```java
public class Bag {

    private Map<String, Object> properties = new HashMap<>();

    @JsonAnySetter
    public void set(String fieldName, Object value){
        this.properties.put(fieldName, value);
    }

    public Object get(String fieldName){
        return this.properties.get(fieldName);
    }
}
```

现在，Jackson 在遇到 JSON 对象中所有无法识别的字段时调用 `set()` 方法。

需要记住的是，这仅对无法识别的字段有影响。例如，如果你向 `Bag` 类添加了公共 `name` 属性或 `setName(String)` 方法，那么 JSON 对象中的字段将映射到 `name` 属性或者 `setter` 方法上。

## @JsonCreator

`@JsonCreator` 用于告诉 Jackson Java 对象有一个构造函数，它可以将 JSON 对象的字段与 Java 对象的字段进行匹配。

当 `@JsonSetter` 无法使用的时候，`@JsonCreator` 是非常有用的。例如，不可变对象没有任何 `setter` 方法，因此需要将它们的初始值注入构造函数中。以这个 `PersonImmutable` 类为例：

```java
public class PersonImmutable {

    private long   id   = 0;
    private String name = null;

    public PersonImmutable(long id, String name) {
        this.id = id;
        this.name = name;
    }

    public long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

}
```

要告诉 Jackson 它应该调用构造函数进行匹配，我们必须将 `@JsonCreator` 注解添加到 `PersonImmutable` 的构造函数上面。但仅凭这一点还不够，我们还必须在构造函数的参数上添加注解，用来告诉 Jackson 哪些 JSON 对象的字段传递给构造函数的哪个参数。以下是 `PersonImmutable` 类添加 `@JsonCreator` 和 `@JsonProperty` 注解的类：

```java
public class PersonImmutable {

    private long   id   = 0;
    private String name = null;

    @JsonCreator
    public PersonImmutable(
            @JsonProperty("id")  long id,
            @JsonProperty("name") String name  ) {

        this.id = id;
        this.name = name;
    }

    public long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

}
```

注意构造函数上方的注解和构造函数参数前的注解。现在 Jackson 能够从 JSON 对象创建一个 `PersonImmutable` 对象了：

```json
{
  "id"   : 1234,
  "name" : "John"
}
```

## @JacksonInject

`@JacksonInject` 用于将值注入已解析的对象，而不是从 JSON 中读取这些值。例如，假设你正在从各种不同的源下载 person 这个 JSON 对象，并且想知道给定 person 对象来自何处。源可能不包含该信息，但你可以让 Jackson 将它注入到从 JSON 对象创建的 Java 对象中。

要将 Java 类中的字段标记为需要由 Jackson 注入其值的字段，需要添加 `@JacksonInject` 注解。下面是一个示例类 `PersonInject`，在 `source` 字段上方添加了 `@JacksonInject`：

```java
public class PersonInject {

    public long   id   = 0;
    public String name = null;

    @JacksonInject
    public String source = null;
}
```

Jackson 可以在 `source` 字段上注入值，你需要在创建 `ObjectMapper` 的时候多一些设置，下面是一些注入所需的内容：

```java
InjectableValues inject = new InjectableValues.Std().addValue(String.class, "codesofun.com");
PersonInject personInject = new ObjectMapper().reader(inject)
                        .forType(PersonInject.class)
                        .readValue(new File("data/person.json"));
```

注意如何通过 `InjectableValues` 的 `addValue()` 给 `source` 字段注入值。另请注意，该值仅与类型 String 相关联，而不是与任何特定字段名称相关联。指定要注入的值的字段需要使用 `@JacksonInject` 注解。

如果你要从多个源下载 person JSON 对象并为每个源注入不同的值，则必须为每个源重复上述代码。

## @JsonDeserialize

`@JsonDeserialize` 用于为 Java 对象中的给定字段指定自定义反序列化类。例如，假设你想优化布尔值的格式 false 和 true 让它变成 0 和 1。

首先，你需要将 `@JsonDeserialize` 注解添加到要使用自定义反序列化的字段中。以下是将 `@JsonDeserialize` 添加到字段的方式：

```java
public class PersonDeserialize {

    public long    id      = 0;
    public String  name    = null;

    @JsonDeserialize(using = OptimizedBooleanDeserializer.class)
    public boolean enabled = false;
}
```

其次，这里的 `@JsonDeserialize` 指定了 `OptimizedBooleanDeserializer` 实现类：

```java
public class OptimizedBooleanDeserializer
    extends JsonDeserializer<Boolean> {

    @Override
    public Boolean deserialize(JsonParser jsonParser,
            DeserializationContext deserializationContext) throws
        IOException, JsonProcessingException {

        String text = jsonParser.getText();
        if("0".equals(text)) return false;
        return true;
    }
}
```

请注意，`OptimizedBooleanDeserializer` 类扩展了 `Boolean`。这样做会使 `deserialize()` 方法返回一个 Boolean 对象。如果要反序列化另一种类型（例如 `java.util.Date`），则必须在泛型括号内指定该类型。

通过调用 `getText()` 方法获取要反序列化的字段的值。然后，你可以将该字符串反序列化为任何值和类型。

最后，你需要输出使用自定义反序列化器和 `@JsonDeserializer` 注解反序列化对象的样子 ：

```java
PersonDeserialize person = objectMapper
        .reader(PersonDeserialize.class)
        .readValue(new File("data/person-optimized-boolean.json"));
```

注意我们首先需要使用 `ObjectMapper.reader()` 方法为类创建一个 Reader，然后调用 `readValue()` 方法获取返回的对象。

# 写入注解

Jackson 还包含一组注解，会影响 Jackson 如何将 Java 对象序列化（写入）到 JSON。

## @JsonInclude

`@JsonInclude` 告诉 Jackson 只在某些情况下包含属性。例如，仅当属性为非 null，非空或遇到某个默认值时，才包含该属性。以下是一个示例，演示如何使用 `@JsonInclude` 注解：

```java
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class PersonInclude {

    public long  personId = 0;
    public String name     = null;
}
```

这个例子仅包含 name 属性，如果为其设置的值为非空，意味着不为null且不是空字符串。

`@JsonInclude` 注解的名称还有很多如 `@JsonIncludeOnlyWhen`，但写作时间会更长，你可能自行查看。

## @JsonGetter

`@JsonGetter` 注解是用来告诉 Jackson 某一个字段值应该从调用来获得 `getter` 方法，而不是通过直接字段访问。如果你的 Java 类使用 JQuery 的风格的 getter 和 setter 那会非常有用。例如，代替使用 `personId()` 和 `personId(long id)` 代替 `getPersonId()` 和 `setPersonId()`。

这是一个名为 `PersonGetter` 的示例类，它显示了 `@JsonGetter` 注解的用法 ：

```java
public class PersonGetter {

    private long  personId = 0;

    @JsonGetter("id")
    public long personId() { return this.personId; }

    @JsonSetter("id")
    public void personId(long personId) { this.personId = personId; }

}
```

如你所见，`personId()` 方法上使用了 `@JsonGetter` 注解。`@JsonGetter` 上设置的值是应该在 JSON 对象中使用的名称。JSON 对象中使用的名称是 id。生成的JSON对象如下所示：

```json
{"id":0}
```

另请注意，`personId(long personId)` 方法使用 `@JsonSetter` 注解，告诉 Jackson 在写入 JSON 对象的时候以 `setter` 方法上的注解值为准。

## @JsonAnyGetter

`@JsonAnyGetter` 注解，你可以使用 Map 作为要序列化 JSON 的容器。以下是 `@JsonAnyGetter` 在 Java 类中使用注解的示例：

```java
public class PersonAnyGetter {

    private Map<String, Object> properties = new HashMap<>();

    @JsonAnyGetter
    public Map<String, Object> properties() {
        return properties;
    }
}
```

当看到 `@JsonAnyGetter` 注解时，Jackson 将从注解了 Map 的方法中获取返回的内容，并将其中的每个键值对视为属性。换句话说，Map 中的所有键值对都被序列化为 `PersonAnyGetter` 对象的一部分。

## @JsonPropertyOrder

`@JsonPropertyOrder` 注解可以设置哪些字段应该被序列化为 JSON。以下是显示如何使用 `@JsonPropertyOrder` 注解的示例：

```java
@JsonPropertyOrder({"name", "personId"})
public class PersonPropertyOrder {

    public long  personId  = 0;
    public String name     = null;
}
```

通常，Jackson 会根据 `@PersonPropertyOrder` 注解上设置的属性，将其序列化。但是，`@JsonPropertyOrder` 还指定了不同的顺序，其中 name 属性将首先出现，personId 属性在序列化JSON输出中为第二个。

## @JsonRawValue

`@JsonRawValue` 用于告诉 Jackson，这个属性的值应该直接输出，因为它是对 JSON 输出。如果属性是String，通常会将该值括在引号中，但如果添加了 `@JsonRawValue` 注解就不会带引号。

为了更清楚地说明了什么是 `@JsonRawValue`，请在没有 `@JsonRawValue` 的情况下查看这个类：

```java
public class PersonRawValue {
    public long   personId = 0;
    public String address  = "$#";
}
```

序列化的结果是这样：

```json
{"personId":0,"address":"$#"}
```

现在我们在 address 属性上添加 `@JsonRawValue`：

```java
public class PersonRawValue {
    public long   personId = 0;
    @JsonRawValue
    public String address  = "$#";
}
```

Jackson 现在在序列化 address 属性时省略引号。序列化的 JSON 结果如下：

```json
{"personId":0,"address":$#}
```

这当然是无效的 JSON，那你为什么要这样呢？

好吧，如果 address 属性包含一个 JSON 字符串，那么该 JSON 字符串将作为 JSON 对象结构的一部分序列化到最终的 JSON 对象中，而不仅仅是 JSON 对象中 address 字段的字符串。要了解这将如何工作，让我们 address 像这样更改属性的值 ：

```java
public class PersonRawValue {
    public long   personId = 0;
    @JsonRawValue
    public String address  =
            "{ \"street\" : \"Wall Street\", \"no\":1}";

}
```

Jackson 会将其序列化为这个JSON：

```json
{"personId":0,"address":{ "street" : "Wall Street", "no":1}}
```

请注意 JSON 字符串现在是序列化 JSON 结构的一部分。

如果没有 `@JsonRawValue`，Jackson 会将对象序列化为这样：

```json
{"personId":0,"address":"{ \"street\" : \"Wall Street\", \"no\":1}"}
```

请注意 address 属性的值现在如何用引号括起来，并且值内的所有引号都被转义。

## @JsonValue

`@JsonValue` 告诉 Jackson 不应该尝试序列化对象本身，而是在对象上调用一个方法，将对象序列化为 JSON 字符串。请注意，Jackson 将转义自定义序列化返回的 String 内的任何引号，所以你无法返回例如完整的JSON对象。为此，你应该使用 `@JsonRawValue`。

`@JsonValue` 注解被添加到 Jackson 是调用该对象序列化到一个 JSON 字符串的方法。以下是显示如何使用 `@JsonValue` 注解的示例：

```java
public class PersonValue {

    public long   personId = 0;
    public String name = null;

    @JsonValue
    public String toJson(){
        return this.personId + "," + this.name;
    }
}
```

要求 Jackson 序列化 `PersonValue` 对象的输出是这样的：

```json
"0,null"
```

引号由 Jackson 添加。请记住，对象返回的值字符串中的任何引号都会被转义。

## @JsonSerialize

`@JsonSerialize` 注解用于在 Java 对象指定一个字段的自定义序列化器。以下是使用 `@JsonSerialize` 注解的示例：

```java
public class PersonSerializer {

    public long   personId = 0;
    public String name     = "John";

    @JsonSerialize(using = OptimizedBooleanSerializer.class)
    public boolean enabled = false;
}
```

注意字段 enabled 上方的注解 `@JsonSerialize`。

在 `OptimizedBooleanSerializer` 将序列化 true 的h值修改为 1。这是代码：

```java
public class OptimizedBooleanSerializer extends JsonSerializer<Boolean> {

    @Override
    public void serialize(Boolean aBoolean, JsonGenerator jsonGenerator, 
        SerializerProvider serializerProvider) 
    throws IOException, JsonProcessingException {
        if(aBoolean){
            jsonGenerator.writeNumber(1);
        } else {
            jsonGenerator.writeNumber(0);
        }
    }
}
```