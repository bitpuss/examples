---
layout: post
title: Java 异常最佳实践
permalink: java-best-practices/exception-best-practices.html
class: java
categories: ['java-best-practices']
---

# 不要 在catch语句块中压制异常

```java
public class ExceptionExample {
    public FileInputStream testMethod1(){
        File file = new File("test.txt");
        FileInputStream fileInputStream = null;
        try {
            fileInputStream = new FileInputStream(file);
            fileInputStream.read();
        } catch (IOException e) {
            return null;
        }
        return fileInputStream;
    }

    public static void main(String[] args) {
        ExceptionExample instance1 = new ExceptionExample();
        instance1.testMethod1();
    }
}
```

在异常处理时进行异常压制是非常不好的编程习惯，上面的例子中，无论抛出什么异常都会被忽略，以至没有留下任何问题线索。如果在这一层次不知道如何处理异常，最好将异常重新抛出，由上层决定如何处理异常。

# 要在方法定义分句中定义具体的异常

按照 `public FileInputStream testMethod1() throws Exception{` 这种写法，表示该方法会抛出所有受检查异常，这不是一个良好的编程习惯。

在这种情况下，我们最好抛出足够具体的异常，以便调用者进行合适的捕获和处理，例如 `public FileInputStream testMethod1() throws IOException{`。

# 捕获具体的异常

在调用其他模块时，最好捕获由该模块抛出的具体的异常。如果某个被调用模块抛出了多个异常，那么只捕获这些异常的父类是不好的编程习惯。

例如，如果一个模块抛出 `FileNotFoundException` 和 `IOException`，那么调用这个模块的代码最好写两个 `catch` 语句块分别捕获这两个异常，而不要只写一个捕获 `Exception` 的 catch 语句块。
正确的写法如下：

```java
try {
    // 一些代码
} catch(FileNotFoundException e){
    // 处理异常
} catch(IOException e){
    // 处理异常
} 
```

你最好不要这么写：

```java
try {
   // 一些代码
} catch(Exception e) {
    // 处理异常
}
```

# 记得在 finally 语句块中释放资源

当你在代码中建立了数据库连接、文件操作符或者其他需要被及时释放的系统资源，如果你没有及时释放这些资源，会影响到系统的性能。

为了避免这种情况发生，可以使用 Java 7 的 `try(open the resources) {deal with resources}` 语句，如果你还是习惯这种老式写法，则可以按照如下方式写：

```java
finally {
    try {
        if (con != null) {
            con.close();
        }
        if (stat != null) {
            stat.close();
        }
    } catch (SQLException sqlee) {
        sqlee.printStackTrace();
    }
}
```

# 异常会影响性能

异常处理的性能成本非常高，每个 Java 程序员在开发时都应牢记这句话。创建一个异常非常慢，抛出一个异常又会消耗 1~5ms，当一个异常在应用的多个层级之间传递时，会拖累整个应用的性能。

- 仅在异常情况下使用异常
- 在可恢复的异常情况下使用异常

尽管使用异常有利于 Java 开发，但是在应用中最好不要捕获太多的调用栈，因为在很多情况下都不需要打印调用栈就知道哪里出错了。因此，异常消息应该提供恰到好处的信息。

# 使用标准异常

如果使用内建的异常可以解决问题，就不要定义自己的异常。Java API 提供了上百种针对不同情况的异常类型，在开发中首先尽可能使用 Java API 提供的异常，如果标准的异常不能满足你的要求，这时候创建自己的定制异常。尽可能得使用标准异常有利于新加入的开发者看懂项目代码。

# 正确包装异常类型

当需要在应用重新抛出异常时，应该正确得包装原始异常，否则会丢失原始异常，例如下面的例子中：

```java
import java.io.IOException;

public class HelloWorld{
     public static void main(String []args) throws Exception {
        try {
            throw new IOException("IOException");    
        } catch (IOException e) {
            throw new ExampleException1("Example Exception and " + e.getMessage());
        }
     }
}

class ExampleException1 extends Exception{

    public ExampleException1(String s, Throwable t) {
        super(s,t);
    }

    public ExampleException1(String s) {
        super(s);
    }
}
```

这个程序的输出为：

```java
Exception in thread "main" ExampleException1: Example Exception and IOException                                                                                          
        at HelloWorld.main(HelloWorld.java:8)                   
```

这里发现，`IOException` 的调用栈已经丢失了，因为我们在 catch 语句块中没有正确包装 `IOException`。若将 catch 语句块修改成下面这样，这可以发现原始异常的调用栈也被打印出来了。

```java
catch (IOException e) {
    throw new ExampleException1("Example Exception",e);
}
```

这时候的输出如下：

```java
Exception in thread "main" ExampleException1: Example Exception
        at HelloWorld.main(HelloWorld.java:8)
Caused by: java.io.IOException: IOException                                        
        at HelloWorld.main(HelloWorld.java:6)
```

# 避免在 finally 语句块中抛出异常

```java
try {
    method();  // 这里会抛出第一个异常
} finally {
    shutdown(); // 如果 finally 忽略异常，第一个异常将永远丢失
}
```

在上面的这个代码片段中，`finally` 代码块也可能再次抛出异常。如果同时抛出两个异常，则第一个异常的调用栈会丢失。在 `finally` 语句块中最好只做打印错误信息或者关闭资源等操作，避免在 `finally` 语句块中再次抛出异常。

# 不要使用异常控制程序的流程

不应该使用异常控制应用的执行流程，例如，本应该使用 `if` 语句进行条件判断的情况下，你却使用异常处理，这是非常不好的习惯，会严重影响应用的性能。

# 不要捕获 Throwable 类

在应用中不应捕获 `Throwable` 类，Error 是 `Throwable` 类的子类，当应用抛出 `Errors` 的时候，一般都是不可恢复的情况。

# 为异常记录合适的文档

为应用中定义的异常定义合适的文档，如果你写了一个自定义的异常却没有文档，其他开发者会不清楚这个异常的含义，为你定义的异常配备对应的文档是一个非常好的习惯。