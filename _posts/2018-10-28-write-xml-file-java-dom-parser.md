---
layout: post
title: DOM 方式写入 XML
permalink: java-xml/write-xml-file-java-dom-parser.html
class: java
categories: ['java-xml']
---

之前我们学习了如何使用 DOM 方式读取 XML 文件以及如何在 java 中修改 XML 文件，今天我们将学习如何使用DOM 写入一个 XML 文件。

这是我们对 XML 文件的要求。

- 根元素将是名为 `"https://codesofun.com/employee"` 的 `Employees`。该根元素将包含 Employees 列表。
- 员工信息将写在 `Employee` 元素中。XML文件中将有两个员工信息。
- 每个员工都有一个名为 `id` 的属性
- Employee 元素将包含四个元素 - `name`，`age`，`role`，`gender`。

这是上面要求的 java 程序。

```java
import java.io.File;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

public class XMLWriterDOM {

    public static void main(String[] args) {
        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder dBuilder;
        try {
            dBuilder = dbFactory.newDocumentBuilder();
            Document doc = dBuilder.newDocument();
            // 添加元素到文档
            Element rootElement =
                doc.createElementNS("https://codesofun.com/employee", "Employees");
            // 添加根节点到文档
            doc.appendChild(rootElement);

            // 添加子元素到根元素下面
            rootElement.appendChild(getEmployee(doc, "1", "biezhi", "18", "Java Developer", "Male"));

            // 添加第二个子元素
            rootElement.appendChild(getEmployee(doc, "2", "Lisa", "35", "Manager", "Female"));

            // 输出到文件，控制台
            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            Transformer transformer = transformerFactory.newTransformer();
            // 美化输出
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            DOMSource source = new DOMSource(doc);

            // 写入XML到文件和控制台
            StreamResult console = new StreamResult(System.out);
            StreamResult file = new StreamResult(new File("/Users/biezhi/emps.xml"));

            // 写入数据
            transformer.transform(source, console);
            transformer.transform(source, file);
            System.out.println("完成");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static Node getEmployee(Document doc, String id, String name, String age, String role,
            String gender) {
        Element employee = doc.createElement("Employee");

        // 设置 id 属性
        employee.setAttribute("id", id);
        // 创建 name 元素
        employee.appendChild(getEmployeeElements(doc, employee, "name", name));
        // 创建 age 元素
        employee.appendChild(getEmployeeElements(doc, employee, "age", age));
        // 创建 role 元素
        employee.appendChild(getEmployeeElements(doc, employee, "role", role));
        // 创建 gender 元素
        employee.appendChild(getEmployeeElements(doc, employee, "gender", gender));
        return employee;
    }

    // 创建文本节点的工具方法
    private static Node getEmployeeElements(Document doc, Element element, String name, String value) {
        Element node = doc.createElement(name);
        node.appendChild(doc.createTextNode(value));
        return node;
    }
}
```

请注意，我创建了两个 `StreamResult`，一个用于在控制台中打印 XML 以进行调试，另一个用于将其写入文件。

这是上面程序的输出XML。

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<Employees xmlns="https://codesofun.com/employee">
    <Employee id="1">
        <name>biezhi</name>
        <age>18</age>
        <role>Java Developer</role>
        <gender>Male</gender>
    </Employee>
    <Employee id="2">
        <name>Lisa</name>
        <age>35</age>
        <role>Manager</role>
        <gender>Female</gender>
    </Employee>
</Employees>
```
