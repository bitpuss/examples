---
layout: post
title: XPath 使用示例
permalink: java-xml/xpath-example.html
class: java
categories: ['java-xml']
---

欢迎来到 Java XPath 示例教程。XPath 提供了定义 XML 文档的语法。`XPath Expression` 是一种查询语言，用于根据查询字符串选择部分 XML 文档。使用 XPath 表达式，我们可以在任何满足查询字符串的 xml 文档中找到节点。

# Java XPath

`javax.xml.xpath` 包提供 Java 中的 XPath 支持。要创建 `XPathExpression`，XPath API 提供工厂方法：

```java
XPathFactory xpathFactory = XPathFactory.newInstance();
XPath xpath = xpathFactory.newXPath();
XPathExpression expr = xpath.compile(XPATH_EXPRESSION_STRING);
Object result = expr.evaluate(Object item, QName returnType);
```

XPath 支持的返回类型在 `XPathConstants` 类中定义：

1. `XPathConstants.STRING`
2. `XPathConstants.NUMBER`
3. `XPathConstants.BOOLEAN`
4. `XPathConstants.NODE`
5. `XPathConstants.NODESET`

# XPath 示例

在这个 XPath 示例教程中，我们有以下 xml 文件。

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

我们将在 XPath 示例程序中实现以下方法。

1. 一个方法，它将返回输入ID的 Employee Name。
2. 返回员工姓名，年龄大于输入年龄的姓名。
3. 女员工姓名返回清单。

这是 XPath 示例程序的最终实现类：

<kbd>XPathQueryExample.java</kbd>

```java
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

public class XPathQueryExample {

    public static void main(String[] args) {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        DocumentBuilder builder;
        Document doc = null;
        try {
            builder = factory.newDocumentBuilder();
            doc = builder.parse("/Users/biezhi/employees.xml");

            // 创建工厂对象
            XPathFactory xpathFactory = XPathFactory.newInstance();

            // 创建 XPath 实例
            XPath xpath = xpathFactory.newXPath();

            String name = getEmployeeNameById(doc, xpath, 4);
            System.out.println("ID = 4 的员工姓名: " + name);

            List<String> names = getEmployeeNameWithAge(doc, xpath, 30);
            System.out.println(" '年龄>30' 的员工:" + Arrays.toString(names.toArray()));

            List<String> femaleEmps = getFemaleEmployeesName(doc, xpath);
            System.out.println("所有女性员工名:" +
                    Arrays.toString(femaleEmps.toArray()));

        } catch (ParserConfigurationException | SAXException | IOException e) {
            e.printStackTrace();
        }
    }

    private static List<String> getFemaleEmployeesName(Document doc, XPath xpath) {
        List<String> list = new ArrayList<>();
        try {
            // 创建工厂对象
            XPathExpression expr =
                xpath.compile("/Employees/Employee[gender='Female']/name/text()");
            // 在 XML 文档中执行表达式
            NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
            for (int i = 0; i < nodes.getLength(); i++)
                list.add(nodes.item(i).getNodeValue());
        } catch (XPathExpressionException e) {
            e.printStackTrace();
        }
        return list;
    }

    private static List<String> getEmployeeNameWithAge(Document doc, XPath xpath, int age) {
        List<String> list = new ArrayList<>();
        try {
            XPathExpression expr =
                xpath.compile("/Employees/Employee[age>" + age + "]/name/text()");
            NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
            for (int i = 0; i < nodes.getLength(); i++)
                list.add(nodes.item(i).getNodeValue());
        } catch (XPathExpressionException e) {
            e.printStackTrace();
        }
        return list;
    }

    private static String getEmployeeNameById(Document doc, XPath xpath, int id) {
        String name = null;
        try {
            XPathExpression expr =
                xpath.compile("/Employees/Employee[@id='" + id + "']/name/text()");
            name = (String) expr.evaluate(doc, XPathConstants.STRING);
        } catch (XPathExpressionException e) {
            e.printStackTrace();
        }
        return name;
    }
}
```

当我们运行 XPath 示例程序时，会产生以下输出。

```shell
ID = 4 的员工姓名: Meghna
'年龄>30' 的员工::[Lisa, Tom]
所有女性员工名:[Lisa, Meghna]
```

请注意，前几行是将 XML 文件作为 Document 读取。然后我们在所有方法中重用 Document 和 XPath 对象。上面的程序显示了 `NODESET` 和 `STRING` 的示例作为结果对象。