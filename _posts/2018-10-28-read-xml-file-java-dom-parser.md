---
layout: post
title: DOM 方式读取 XML
permalink: java-xml/read-xml-file-java-dom-parser.html
class: java
categories: ['java-xml']
---

下面我们将学习如何用 Java 读取 XML 文件。我们还将学习如何使用 DOM 解析器将 java 中的 xml 文件解析为对象。

DOM 方式解析 XML 最容易理解，它将 XML 对象作为 `Document` 加载到内存中，你可以轻松遍历对象中的不同元素和节点。元素和节点的遍历不需要按顺序进行。

# 如何在 Java 中读取 XML 文件

![](https://cdn.journaldev.com/wp-content/uploads/2012/12/how-to-read-xml-file-in-java.jpg)

DOM 方式解析适用于小型 XML 文档，因为它将完整的 XML 文件加载到内存中，因此对一个较大的 XML 文件效率并不高。对于大型 XML 文件，应该使用 [SAX 方式解析](/java-xml/read-xml-file-java-sax-parser.html)。

本文中，我们将读取 XML 文件并将它的内容绑定在对象上。

这是将在此程序中读取的XML文件。

<kbd>employee.xml</kbd>

```xml
<?xml version="1.0"?>
<Employees>
    <Employee>
        <name>biezhi</name>
        <age>18</age>
        <role>Java Developer</role>
        <gender>Male</gender>
    </Employee>
    <Employee>
        <name>Lisa</name>
        <age>35</age>
        <role>CSS Developer</role>
        <gender>Female</gender>
    </Employee>
</Employees>
```

所以这个 XML 是员工列表，要读取这个 XML 文件，我将创建一个类 `Employee`，然后我们将解析 XML 以获取员工列表。

这是 `Employee` 类的结构：

```java
public class Employee {
    private String name;
    private String gender;
    private int age;
    private String role;
    
    // getter setter 省略

    @Override
    public String toString() {
        return "Employee:: Name=" + this.name + " Age=" + this.age + " Gender=" + this.gender +
                " Role=" + this.role;
    }
}
```

请注意，我已重写 `toString()` 方法以打印有关 `employee` 的有用信息。

# Java DOM 解析

这是使用 DOM 解析读取和解析 XML 文件以获取 `Employee` 对象列表的 java 程序。

```java
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

public class XMLReaderDOM {

    public static void main(String[] args) {
        String filePath = "employee.xml";
        File xmlFile = new File(filePath);
        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder dBuilder;
        try {
            dBuilder = dbFactory.newDocumentBuilder();
            Document doc = dBuilder.parse(xmlFile);
            doc.getDocumentElement().normalize();
            System.out.println("根节点:" + doc.getDocumentElement().getNodeName());
            NodeList nodeList = doc.getElementsByTagName("Employee");
            // 现在 XML 作为 Document 加载到内存中，让我们将其转换为 List
            List<Employee> empList = new ArrayList<>();
            for (int i = 0; i < nodeList.getLength(); i++) {
                empList.add(getEmployee(nodeList.item(i)));
            }
            // 输出员工信息
            for (Employee emp : empList) {
                System.out.println(emp.toString());
            }
        } catch (SAXException | ParserConfigurationException | IOException e1) {
            e1.printStackTrace();
        }
    }

    private static Employee getEmployee(Node node) {
        // XMLReaderDOM domReader = new XMLReaderDOM();
        Employee emp = new Employee();
        if (node.getNodeType() == Node.ELEMENT_NODE) {
            Element element = (Element) node;
            emp.setName(getTagValue("name", element));
            emp.setAge(Integer.parseInt(getTagValue("age", element)));
            emp.setGender(getTagValue("gender", element));
            emp.setRole(getTagValue("role", element));
        }
        return emp;
    }

    private static String getTagValue(String tag, Element element) {
        NodeList nodeList = element.getElementsByTagName(tag).item(0).getChildNodes();
        Node node = (Node) nodeList.item(0);
        return node.getNodeValue();
    }

}
```

输出内容如下：

```shell
根节点:Employees
Employee:: Name=biezhi Age=18 Gender=Male Role=Java Developer
Employee:: Name=Lisa Age=35 Gender=Female Role=CSS Developer
```
