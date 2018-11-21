---
layout: post
title: SAX 解析 XML 的示例
permalink: java-xml/sax-parser-example.html
class: java
categories: ['java-xml']
---

java 中的 SAX Parser 提供了解析 XML 文档的 API。SAX 解析器与 DOM 解析器不同，因为它不会将完整的 XML 加载到内存中按顺序读取 xml 文档。

# SAX Parser

`javax.xml.parsers.SAXParser` 提供了事件驱动的方式解析 XML 文档。该类实现了 `XMLReader` 接口并提供重载版本的 `parse()` 方法，以从 `File`，`InputStream`，`SAX InputSource` 和 `String URI` 读取 XML 文档。

实际的解析由 `Handler` 类完成。我们需要创建自己的处理程序类来解析 XML 文档。我们需要实现`org.xml.sax.ContentHandler` 接口来创建自己的处理程序类。此接口包含回调方法，这些方法在发生任何事件时接收通知。例如 `StartDocument`，`EndDocument`，`StartElement`，`EndElement`，`CharacterData` 等。

`org.xml.sax.helpers.DefaultHandler` 提供了 `ContentHandler` 接口的默认实现，我们可以扩展这个类来处理自己的程序。建议扩展此类，因为我们可能只需要很少的方法来实现，扩展该类可以让我们的代码更清晰，更易于维护。

# SAX 解析器示例

现在我们来看看 SAX 解析器示例程序，稍后我会解释不同的功能。

<kbd>employees.xml</kbd>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Employees>
    <Employee id="1">
        <age>18</age>
        <name>biezhi</name>
        <gender>Male</gender>
        <role>Java Developer</role>
    </Employee>
    <Employee id="2">
        <age>35</age>
        <name>Lisa</name>
        <gender>Female</gender>
        <role>CEO</role>
    </Employee>
    <Employee id="3">
        <age>40</age>
        <name>Tom</name>
        <gender>Male</gender>
        <role>Manager</role>
    </Employee>
    <Employee id="4">
        <age>25</age>
        <name>Meghna</name>
        <gender>Female</gender>
        <role>Manager</role>
    </Employee>
</Employees>
```

因此，我们将 XML 文件存储在文件系统中的某个位置，通过查看它，我们可以得出结论，它包含 Employee 列表。每个员工都有 id 属性和 age，name，gender，role。

我们将使用 SAX 解析器来解析此 XML 并绑定数据到 Employee 对象列表。

这是表示来自 XML 的 Employee 元素的 Employee 对象。

```java
public class Employee {
    private int id;
    private String name;
    private String gender;
    private int age;
    private String role;

    // getter setter 省略
    
    @Override
    public String toString() {
        return "Employee:: ID="+this.id+" Name=" + this.name + " Age=" + this.age + " Gender=" + this.gender +
                " Role=" + this.role;
    }
}
```

让我们创建自己的 SAX Parser Handler 类，扩展 `DefaultHandler` 类。

```java
import java.util.ArrayList;
import java.util.List;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

public class MyHandler extends DefaultHandler {

    // 列出持有 Employees 对象
    private List<Employee> empList = null;
    private Employee emp = null;

    public List<Employee> getEmpList() {
        return empList;
    }

    boolean bAge = false;
    boolean bName = false;
    boolean bGender = false;
    boolean bRole = false;

    @Override
    public void startElement(String uri, String localName, String qName, Attributes attributes)
            throws SAXException {

        if (qName.equalsIgnoreCase("Employee")) {
            // 创建一个新的 Employee 并将其放在 Map 中
            String id = attributes.getValue("id");
            // 初始化 Employee 对象
            emp = new Employee();
            emp.setId(Integer.parseInt(id));
            // 初始化 list
            if (empList == null)
                empList = new ArrayList<>();
        } else if (qName.equalsIgnoreCase("name")) {
            // 设置字段的布尔值，将用于设置Employee变量
            bName = true;
        } else if (qName.equalsIgnoreCase("age")) {
            bAge = true;
        } else if (qName.equalsIgnoreCase("gender")) {
            bGender = true;
        } else if (qName.equalsIgnoreCase("role")) {
            bRole = true;
        }
    }

    @Override
    public void endElement(String uri, String localName, String qName) throws SAXException {
        if (qName.equalsIgnoreCase("Employee")) {
            // 添加 Employee 对象到 list
            empList.add(emp);
        }
    }

    @Override
    public void characters(char ch[], int start, int length) throws SAXException {
        if (bAge) {
            // age 元素，设置 Employee age
            emp.setAge(Integer.parseInt(new String(ch, start, length)));
            bAge = false;
        } else if (bName) {
            emp.setName(new String(ch, start, length));
            bName = false;
        } else if (bRole) {
            emp.setRole(new String(ch, start, length));
            bRole = false;
        } else if (bGender) {
            emp.setGender(new String(ch, start, length));
            bGender = false;
        }
    }
}
```

`MyHandler` 仅将 Employee 对象列表作为字段包含 `getter` 方法。这些 `Employee` 对象将添加到事件处理程序方法中。此外，我们还有一个 `Employee` 字段，用于创建 `Employee` 对象，一旦设置了所有字段，就将其添加到员工列表中。

# 要覆盖的 SAX 解析器方法

重写的主要方法是 `startElement()`，`endElement()` 和 `characters()`。

当找到任何 `start` 元素时，SAXParser 开始解析文档，`startElement()` 方法被调用。我们重写此方法以设置将用于标识元素的布尔变量。

每次遇到 `startElement` 方法并且 `qName` 为 `Employee` 时，创建新的 `Employee` 对象。

SAXParser 在元素中找到字符数据时调用 `characters()` 方法。我们使用布尔字段将值设置为在 Employee 对象中更新字段。

Employee 对象添加到每当我们发现员工结束元素标签列表中的位置时候调 `endElement()`。

下面是使用 `MyHandler` 将上面的 XML 解析为 Employee 对象列表的测试程序。

```java
import java.io.File;
import java.io.IOException;
import java.util.List;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;

import org.xml.sax.SAXException;

public class XMLParserSAX {

    public static void main(String[] args) {
        SAXParserFactory saxParserFactory = SAXParserFactory.newInstance();
        try {
            SAXParser saxParser = saxParserFactory.newSAXParser();
            MyHandler handler = new MyHandler();
            saxParser.parse(new File("/Users/pankaj/employees.xml"), handler);
            // 获取 Employees list
            List<Employee> empList = handler.getEmpList();
            // 输出员工信息
            for(Employee emp : empList)
                System.out.println(emp);
        } catch (ParserConfigurationException | SAXException | IOException e) {
            e.printStackTrace();
        }
    }
}
```

下面是程序的输出

```shell
Employee:: ID=1 Name=biezhi Age=18 Gender=Male Role=Java Developer
Employee:: ID=2 Name=Lisa Age=35 Gender=Female Role=CEO
Employee:: ID=3 Name=Tom Age=40 Gender=Male Role=Manager
Employee:: ID=4 Name=Meghna Age=25 Gender=Female Role=Manager
```

`SAXParserFactory` 提供工厂方法来获取 `SAXParser` 实例。我们将 `File` 对象与 `MyHandler` 实例一起传递给 `parse` 方法来处理回调事件。

SAXParser 在开始时有点混乱，但如果您正在处理大型 XML 文档，它提供了比 DOM Parser 更高效的读取方法。