---
layout: post
title: DOM 方式修改 XML
permalink: java-xml/modify-xml-file-java-dom-parser.html
class: java
categories: ['java-xml']
---

我们可以使用 DOM 解析器在 java 中修改 XML 文件，包括添加元素，删除元素，修改元素值，修改属性。

# 在 Java 中修改 XML 文件

假设我们有个源 XML 文件。我们将学习如何使用 DOM 解析器在 java 程序中修改或编辑这个 XML 文件。

<kbd>employee.xml</kbd>

```java
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<Employees>
    <Employee id="1">
        <name>biezhi</name>
        <age>18</age>
        <role>Java Developer</role>
        <gender>Male</gender>
    </Employee>
    <Employee id="2">
        <name>Lisa</name>
        <age>35</age>
        <role>CSS Developer</role>
        <gender>Female</gender>
    </Employee>
</Employees>
```

我们将使用以下规则更改修改 xml 文件。

- 根据 Gender 更新所有Employee的 “id” 属性值。对于Male，id 将以 "M/F" 为前缀。
- 通过将 "name" 元素设置为大写来更新它的值。
- 删除 "gender" 元素，因为它现在没有使用。
- 将新元素 "salary" 添加到xml中的所有employee节点。

一旦我们对XML进行了上述修改，我们就会将其保存到不同的文件中。

这是使用 DOM 解析器完成上述所有更新的java程序。

```java
import java.io.File;
import java.io.IOException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

public class ModifyXMLDOM {

    public static void main(String[] args) {
        String filePath = "employee.xml";
        File xmlFile = new File(filePath);
        DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder dBuilder;
        try {
            dBuilder = dbFactory.newDocumentBuilder();
            Document doc = dBuilder.parse(xmlFile);
            doc.getDocumentElement().normalize();
            
            // 更新属性值
            updateAttributeValue(doc);
            
            // 更新元素值
            updateElementValue(doc);
            
            // 删除元素
            deleteElement(doc);
            
            // 添加新元素
            addElement(doc);
            
            // 将更新的结果写入到文件，控制台
            doc.getDocumentElement().normalize();
            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            Transformer transformer = transformerFactory.newTransformer();
            DOMSource source = new DOMSource(doc);
            StreamResult result = new StreamResult(new File("employee_updated.xml"));
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.transform(source, result);
            System.out.println("XML 文件更新成功");
        } catch (SAXException | ParserConfigurationException | IOException | TransformerException e1) {
            e1.printStackTrace();
        }
    }

    private static void addElement(Document doc) {
        NodeList employees = doc.getElementsByTagName("Employee");
        Element emp = null;
        // 循环遍历 employee
        for(int i=0; i<employees.getLength();i++){
            emp = (Element) employees.item(i);
            Element salaryElement = doc.createElement("salary");
            salaryElement.appendChild(doc.createTextNode("10000"));
            emp.appendChild(salaryElement);
        }
    }

    private static void deleteElement(Document doc) {
        NodeList employees = doc.getElementsByTagName("Employee");
        Element emp = null;
        // 循环遍历 employee
        for(int i=0; i<employees.getLength();i++){
            emp = (Element) employees.item(i);
            Node genderNode = emp.getElementsByTagName("gender").item(0);
            emp.removeChild(genderNode);
        }
    }

    private static void updateElementValue(Document doc) {
        NodeList employees = doc.getElementsByTagName("Employee");
        Element emp = null;
        // 循环遍历 employee
        for(int i=0; i<employees.getLength();i++){
            emp = (Element) employees.item(i);
            Node name = emp.getElementsByTagName("name").item(0).getFirstChild();
            name.setNodeValue(name.getNodeValue().toUpperCase());
        }
    }

    private static void updateAttributeValue(Document doc) {
        NodeList employees = doc.getElementsByTagName("Employee");
        Element emp = null;
        // 循环遍历 employee
        for(int i=0; i<employees.getLength();i++){
            emp = (Element) employees.item(i);
            String gender = emp.getElementsByTagName("gender").item(0).getFirstChild().getNodeValue();
            if(gender.equalsIgnoreCase("male")){
                // 设置男性为 M 前缀
                emp.setAttribute("id", "M"+emp.getAttribute("id"));
            }else{
                // 设置女性为 F 前缀
                emp.setAttribute("id", "F"+emp.getAttribute("id"));
            }
        }
    }
}
```

以下给出了来自上述程序的 XML 文件的输出修改版本。

<kbd>employee_updated.xml</kbd>

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<Employees>
    <Employee id="M1">
        <name>BIEZHI</name>
        <age>18</age>
        <role>Java Developer</role>
        <salary>10000</salary>
    </Employee>
    <Employee id="F2">
        <name>LISA</name>
        <age>35</age>
        <role>CSS Developer</role>
        <salary>10000</salary>
    </Employee>
</Employees>
```
