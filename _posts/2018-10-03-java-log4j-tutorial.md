---
layout: post
title: Log4j 使用教程
permalink: java-logging/log4j-tutorial.html
class: java
categories: ['java-logging']
---

日志是应用软件中不可缺少的部分，Apache 的开源项目 log4j 是一个功能强大的日志组件，提供方便的日志记录。在 Apache 网站：jakarta.apache.org/log4j 可以免费下载到Log4j最新版本的软件包。

# 入门实例

新建一个JAva工程，导入包 `log4j-1.2.17.jar`，整个工程最终目录如下

![](http://static.codeceo.com/images/2015/05/4b08140cb7fc48b1af2646ad4b021735.jpg)

src 同级创建并配置 `log4j.properties`

```
# 配置
log4j.rootLogger = debug,stdout,D,E

# 输出信息到控制台
log4j.appender.stdout = org.apache.log4j.ConsoleAppender
log4j.appender.stdout.Target = System.out
log4j.appender.stdout.layout = org.apache.log4j.PatternLayout
log4j.appender.stdout.layout.ConversionPattern = [%-5p] %d{yyyy-MM-dd HH:mm:ss,SSS} method:%l%n%m%n

# 输出DEBUG 级别以上的日志到=E://logs/error.log
log4j.appender.D = org.apache.log4j.DailyRollingFileAppender
log4j.appender.D.File = E://logs/log.log
log4j.appender.D.Append = true
log4j.appender.D.Threshold = DEBUG 
log4j.appender.D.layout = org.apache.log4j.PatternLayout
log4j.appender.D.layout.ConversionPattern = %-d{yyyy-MM-dd HH:mm:ss}  [ %t:%r ] - [ %p ]  %m%n

# 输出ERROR 级别以上的日志到=E://logs/error.log
log4j.appender.E = org.apache.log4j.DailyRollingFileAppender
log4j.appender.E.File =E://logs/error.log 
log4j.appender.E.Append = true
log4j.appender.E.Threshold = ERROR 
log4j.appender.E.layout = org.apache.log4j.PatternLayout
log4j.appender.E.layout.ConversionPattern = %-d{yyyy-MM-dd HH:mm:ss}  [ %t:%r ] - [ %p ]  %m%n
```

设置日志内容

```java
import org.apache.log4j.Logger;

public class Test {
    
    private static Logger logger = Logger.getLogger(Test.class);  

    public static void main(String[] args) {  
        // 记录debug级别的信息  
        logger.debug("This is debug message.");  
        // 记录info级别的信息  
        logger.info("This is info message.");  
        // 记录error级别的信息  
        logger.error("This is error message.");  
    }  
}
```

输出结果到控制台

![](http://static.codeceo.com/images/2015/05/80700478ec208d187f60107a6a517712.jpg)

再来看输出的文件

![](http://static.codeceo.com/images/2015/05/8a57406bc3f02fcd687fce535fc546ee.jpg)

内容如下，发现已按照要求输出到对应的文档中去了。

![](http://static.codeceo.com/images/2015/05/e3dc8eb3a3841a2f50dd24567f41b4d5.jpg)

![](http://static.codeceo.com/images/2015/05/f82057d8ca93b4f23893cc9e204f1a51.jpg)

# Log4j 基本使用

Log4j 由三个重要的组件构成：日志信息的优先级，日志信息的输出目的地，日志信息的输出格式。日志信息的优先级从高到低有 `ERROR`、`WARN`、 `INFO`、`DEBUG`，分别用来指定这条日志信息的重要程度；日志信息的输出目的地指定了日志将打印到控制台还是文件中；而输出格式则控制了日志信息的显 示内容。

## 定义配置文件

其实您也可以完全不使用配置文件，而是在代码中配置 Log4j 环境。但是，使用配置文件将使您的应用程序更加灵活。Log4j 支持两种配置文件格式，一种是 XML 格式的文件，一种是 Java 特性文件（键=值）。下面我们介绍使用 Java 特性文件做为配置文件的方法：

配置根 Logger，其语法为：

```
log4j.rootLogger = [ level ] , appenderName, appenderName, ...
```

其中，level 是日志记录的优先级，分为 `OFF`、`FATAL`、`ERROR`、`WARN`、`INFO`、`DEBUG`、`ALL` 或者您定义的级别。Log4j 建议只使用四个级别，优先级从高到低分别是 `ERROR`、`WARN`、`INFO`、`DEBUG`。通过在这里定义的级别，您可以控制到应用程序中相应级别的日志信息的开关。比如在这里定义了 `INFO` 级别，则应用程序中所有 `DEBUG` 级别的日志信息将不被打印出来。`appenderName` 就是指 B 日志信息输出到哪个地方。您可以同时指定多个输出目的地。

配置日志信息输出目的地 `Appender`，其语法为：

```
log4j.appender.appenderName = fully.qualified.name.of.appender.class  
log4j.appender.appenderName.option1 = value1  
...
log4j.appender.appenderName.option = valueN
```

其中，Log4j 提供的 `appender` 有以下几种：

```
org.apache.log4j.ConsoleAppender（控制台），  
org.apache.log4j.FileAppender（文件），  
org.apache.log4j.DailyRollingFileAppender（每天产生一个日志文件），  
org.apache.log4j.RollingFileAppender（文件大小到达指定尺寸的时候产生一个新的文件）， 
org.apache.log4j.WriterAppender（将日志信息以流格式发送到任意指定的地方）
```

配置日志信息的格式（布局），其语法为：

```
log4j.appender.appenderName.layout = fully.qualified.name.of.layout.class  
log4j.appender.appenderName.layout.option1 = value1  
...
log4j.appender.appenderName.layout.option = valueN
```

其中，Log4j 提供的 `layout` 有以下几种：

```
org.apache.log4j.HTMLLayout（以HTML表格形式布局），  
org.apache.log4j.PatternLayout（可以灵活地指定布局模式），  
org.apache.log4j.SimpleLayout（包含日志信息的级别和信息字符串），  
org.apache.log4j.TTCCLayout（包含日志产生的时间、线程、类别等等信息）
```

Log4J 采用类似 C语言中的 `printf` 函数的打印格式格式化日志信息，打印参数如下： 

```
%m 输出代码中指定的消息
%p 输出优先级，即 DEBUG，INFO，WARN，ERROR，FATAL  
%r 输出自应用启动到输出该 log 信息耗费的毫秒数  
%c 输出所属的类目，通常就是所在类的全名  
%t 输出产生该日志事件的线程名  
%n 输出一个回车换行符，Windows 平台为 \r\n，Unix平台为 \n
%d 输出日志时间点的日期或时间，默认格式为ISO8601，也可以在其后指定格式
# 比如：%d{yyy MMM dd HH:mm:ss,SSS}，输出类似：2002年10月18日 22：10：28，921  

%l 输出日志事件的发生位置，包括类目名、发生的线程，以及在代码中的行数
# 举例：Testlog4.main(TestLog4.java:10)
```

## 在代码中使用 Log4j

**得到记录器**

使用 Log4j，第一步就是获取日志记录器，这个记录器将负责控制日志信息。其语法为：

```java
public static Logger getLogger( String name)
```

通过指定的名字获得记录器，如果必要的话，则为这个名字创建一个新的记录器。`Name` 一般取本类的名字，比如：

```java
static Logger logger = Logger.getLogger ( ServerWithLog4j.class.getName () )
```

**读取配置文件**

当获得了日志记录器之后，第二步将配置 Log4j 环境，其语法为：

- `BasicConfigurator.configure()`： 自动快速地使用缺省Log4j环境。  
- `PropertyConfigurator.configure(String configFilename)`：读取使用Java的特性文件编写的配置文件。  
- `DOMConfigurator.configure(String filename)`：读取XML形式的配置文件。

**插入记录信息（格式化日志信息）**

当上两个必要步骤执行完毕，您就可以轻松地使用不同优先级别的日志记录语句插入到您想记录日志的任何地方，其语法如下：

```java
logger.debug(Object message);
logger.info(Object message);
logger.warn(Object message);
logger.error(Object message);
```

## 日志级别

每个Logger都被了一个日志级别（log level），用来控制日志信息的输出。日志级别从高到低分为：

- off：最高等级，用于关闭所有日志记录。
- fatal：指出每个严重的错误事件将会导致应用程序的退出。
- error：指出虽然发生错误事件，但仍然不影响系统的继续运行。
- warm：表明会出现潜在的错误情形。
- info：一般和在粗粒度级别上，强调应用程序的运行全程。
- debug：一般用于细粒度级别上，对调试应用程序非常有帮助。
- all：最低等级，用于打开所有日志记录。

上面这些级别是定义在 `org.apache.log4j.Level` 类中。Log4j 只建议使用 4 个级别，优先级从高到低分别是 `error`, `warn`, `info` 和 `debug`。通过使用日志级别，可以控制应用程序中相应级别日志信息的输出。例如，如果使用了 `info` 级别，则应用程序中所有低于 info 级别的日志信息(如debug)将不会被打印出来。

## Web 项目中使用 Log4j

上面代码描述了 Log4j 的简单应用，其实使用 Log4j 也就是这样简单方便。当然除了上面的配置方法，还有其它，比如做一个 J2EE 应用，在 J2EE 应用使用 Log4j，必须先在启动服务时加载 Log4j 的配置文件进行初始化，可以在 `web.xml` 中进行。

1. web 应用的 log4j 使用基本上都采用：新建一个 `servlet`，这个 `servlet` 在 `init` 函数中为 log4j 执行配置。一般就是读入配置文件。所以需要在 `web.xml` 中为这个 servlet 配置，同时设定 `load-on-startup` 为 1。
2. 这个 servlet 配置 log4j 就是读出配置文件，然后调用 `configure` 函数。这里有两个问题：一、需要知道文件在哪里；二、需要正确的文件类型
3. 配置文件位置在 `web.xml` 中配置一个 param 即可，路径一般是相对于 web 的 root 目录
4. 文件类型一般有两种，一个是 Java 的 properpies 文件，另一种是 xml 文件

配置文件的大致内容：log4j 可以指定输出的log级别的最低等级，以及 log 的输出配置格式，每个 log 可以指定多个输出方式。

**创建 Web 工程**

![](http://static.codeceo.com/images/2015/05/dc9759d134b8237d1feae57140377351.jpg)

**配置 web.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>  
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  
    xmlns="http://java.sun.com/xml/ns/javaee"  
    xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"  
    id="WebApp_ID" version="3.0">  
    <display-name>LogLearning</display-name>  

    <servlet>  
        <servlet-name>Log4JTestServlet</servlet-name>  
        <servlet-class>com.mucfc.Log4JTestServlet</servlet-class>  
    </servlet>  

    <!--用来启动 log4jConfigLocation的servlet -->  
    <servlet>  
        <servlet-name>Log4JInitServlet</servlet-name>  
        <servlet-class>com.mucfc.Log4JInitServlet</servlet-class>  
        <init-param>  
            <param-name>log4j-properties-location</param-name>  
            <param-value>/WEB-INF/classes/log4j.properties</param-value>  
        </init-param>  
        <load-on-startup>1</load-on-startup>  
    </servlet>  

    <servlet-mapping>  
        <servlet-name>Log4JTestServlet</servlet-name>  
        <url-pattern>/test</url-pattern>  
    </servlet-mapping>  

</web-app>
```

**配置 log4j.properties**

```
# set log levels
log4j.rootLogger = debug,stdout,D,E  

log4j.appender.stdout = org.apache.log4j.ConsoleAppender  
log4j.appender.stdout.Target = System.out  
log4j.appender.stdout.layout = org.apache.log4j.PatternLayout  
log4j.appender.stdout.layout.ConversionPattern = [%-5p] %d{yyyy-MM-dd HH:mm:ss,SSS} method:%l%n%m%n  

log4j.appender.D = org.apache.log4j.DailyRollingFileAppender  
log4j.appender.D.File = F://logs/log.log  
log4j.appender.D.Append = true  
log4j.appender.D.Threshold = DEBUG   
log4j.appender.D.layout = org.apache.log4j.PatternLayout  
log4j.appender.D.layout.ConversionPattern = %-d{yyyy-MM-dd HH:mm:ss}  [ %t:%r ] - [ %p ]  %m%n  

log4j.appender.E = org.apache.log4j.DailyRollingFileAppender  
log4j.appender.E.File =F://logs/error.log   
log4j.appender.E.Append = true  
log4j.appender.E.Threshold = ERROR   
log4j.appender.E.layout = org.apache.log4j.PatternLayout  
log4j.appender.E.layout.ConversionPattern = %-d{yyyy-MM-dd HH:mm:ss}  [ %t:%r ] - [ %p ]  %m%n
```

**web 容器启动后初始化的 servlet**

<kbd>Log4JInitServlet.java</kbd>

```java
import java.io.File;  
import java.io.IOException;  

import javax.servlet.ServletConfig;  
import javax.servlet.ServletContext;  
import javax.servlet.ServletException;  
import javax.servlet.annotation.WebServlet;  
import javax.servlet.http.HttpServlet;  
import javax.servlet.http.HttpServletRequest;  
import javax.servlet.http.HttpServletResponse;  

import org.apache.log4j.BasicConfigurator;  
import org.apache.log4j.PropertyConfigurator;  

/** 
 * Servlet implementation class Log4JInitServlet 
 */  
@WebServlet("/Log4JInitServlet")  
public class Log4JInitServlet extends HttpServlet {  

    public Log4JInitServlet() {  
        super();  
    }  

    public void init(ServletConfig config) throws ServletException {  
        System.out.println("Log4JInitServlet 正在初始化 log4j日志设置信息");  
        String log4jLocation = config.getInitParameter("log4j-properties-location");  

        ServletContext sc = config.getServletContext();  

        if (log4jLocation == null) {  
            System.err.println("*** 没有 log4j-properties-location 初始化的文件, 所以使用 BasicConfigurator初始化");  
            BasicConfigurator.configure();  
        } else {  
            String webAppPath = sc.getRealPath("/");  
            String log4jProp = webAppPath + log4jLocation;  
            File yoMamaYesThisSaysYoMama = new File(log4jProp);  
            if (yoMamaYesThisSaysYoMama.exists()) {  
                System.out.println("使用: " + log4jProp+"初始化日志设置信息");  
                PropertyConfigurator.configure(log4jProp);  
            } else {  
                System.err.println("*** " + log4jProp + " 文件没有找到， 所以使用 BasicConfigurator初始化");  
                BasicConfigurator.configure();  
            }  
        }  
        super.init(config);  
    }  

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {  
        // TODO Auto-generated method stub  
    }  

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {  
        // TODO Auto-generated method stub  
    }  

}
```

调用日志 `Log4JTestServlet.java`

```java
import java.io.IOException;  

import javax.servlet.ServletConfig;  
import javax.servlet.ServletException;  
import javax.servlet.annotation.WebServlet;  
import javax.servlet.http.HttpServlet;  
import javax.servlet.http.HttpServletRequest;  
import javax.servlet.http.HttpServletResponse;  

import org.apache.log4j.Logger;  

/** 
 * Servlet implementation class Log4JTestServlet 
 */  
@WebServlet("/Log4JTestServlet")  
public class Log4JTestServlet extends HttpServlet {  

    private static Logger logger = Logger.getLogger(Log4JTestServlet.class);   
    public Log4JTestServlet() {  
        super();  
    }  

    public void init(ServletConfig config) throws ServletException {  
        // TODO Auto-generated method stub  
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {  
        // 记录debug级别的信息    
        logger.debug("This is debug message.");    
        // 记录info级别的信息    
        logger.info("This is info message.");    
        // 记录error级别的信息    
        logger.error("This is error message.");    
    }  

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {  
        doGet(request,response);  
    }  
}
```

接下来就是运行了，来看看结果：

![](http://static.codeceo.com/images/2015/05/9c5741445b9699c26a97f8c1c909d6e9.jpg)

输出结果：

![](http://static.codeceo.com/images/2015/05/cda300d256cc7be31f2196070f28e775.jpg)

![](http://static.codeceo.com/images/2015/05/129d046f88ac0d40ed573abb4a455023.jpg)

![](http://static.codeceo.com/images/2015/05/36d1f614028b3b9c834a92ff2b6db9c6.jpg)

## Spring 中使用 Log4j

这里要实现 web 项目中利用 Spring 来使用 Log4j

![](http://static.codeceo.com/images/2015/05/ff4d4c9afff8e734428b1701f6cc7c48.jpg)

接上面的工程，然后再导入 Spring 的包，`web.xml` 增加

```xml
<!-- 设置根目录 -->  
<context-param>    
    <param-name>webAppRootKey</param-name>    
    <param-value>webapp.root</param-value>    
</context-param>    

<context-param>  
    <param-name>log4jConfigLocation</param-name>  
    <param-value>/WEB-INF/classes/log4j.properties</param-value>  
</context-param>  
<!-- 3000表示 开一条watchdog线程每60秒扫描一下配置文件的变化;这样便于日志存放位置的改变 -->  
<context-param>    
    <param-name>log4jRefreshInterval</param-name>    
    <param-value>3000</param-value>    
</context-param>   
<listener>  
    <listener-class>org.springframework.web.util.Log4jConfigListener</listener-class>  
</listener>
```

整个内容如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>  
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  
    xmlns="http://java.sun.com/xml/ns/javaee"
    xsi:schemaLocation="http://java.sun.com/xml/ns/javaee 
    http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"  
    id="WebApp_ID" version="3.0">  

    <display-name>LogLearning</display-name>  
    
    <servlet>  
        <servlet-name>Log4JTestServlet</servlet-name>  
        <servlet-class>com.mucfc.Log4JTestServlet</servlet-class>  
    </servlet>  

    <servlet-mapping>  
        <servlet-name>Log4JTestServlet</servlet-name>  
        <url-pattern>/test</url-pattern>  
    </servlet-mapping>   

    <!-- Spring 容器加载 -->  
    <listener>  
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>  
    </listener>  
    <context-param>  
        <param-name>contextConfigLocation</param-name>  
        <param-value>classpath:applicationContext.xml</param-value>  
    </context-param>   

    <!-- 设置根目录 -->  
    <context-param>    
        <param-name>webAppRootKey</param-name>    
        <param-value>webapp.root</param-value>    
    </context-param>    

    <context-param>  
        <param-name>log4jConfigLocation</param-name>  
        <param-value>/WEB-INF/classes/log4j.properties</param-value>  
    </context-param>  
    <!-- 3000表示 开一条watchdog线程每60秒扫描一下配置文件的变化;这样便于日志存放位置的改变 -->  
    <context-param>    
         <param-name>log4jRefreshInterval</param-name>    
         <param-value>3000</param-value>    
    </context-param>   
    <listener>  
        <listener-class>org.springframework.web.util.Log4jConfigListener</listener-class>  
    </listener>   

</web-app>
```

这里 `Log4JInitServlet.java` 就相当于没用到了。

<kbd>applicationContext.xml</kbd>

```xml
<?xml version="1.0" encoding="UTF-8"?>  
<beans xmlns="http://www.springframework.org/schema/beans"  
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    xmlns:context="http://www.springframework.org/schema/context"  
    xmlns:aop="http://www.springframework.org/schema/aop"  
    xsi:schemaLocation="http://www.springframework.org/schema/beans
                        http://www.springframework.org/schema/beans/spring-beans-3.2.xsd
                        http://www.springframework.org/schema/aop
                        http://www.springframework.org/schema/aop/spring-aop-3.2.xsd
                        http://www.springframework.org/schema/context
                        http://www.springframework.org/schema/context/spring-context-3.2.xsd">  
</beans>
```

这样日志就跟随 Spring 窗口启动而启动了，程序一运行，就会自动把日志打印

![](http://static.codeceo.com/images/2015/05/d5473d7389b204f91a8c81da4fe18843.jpg)

<kbd>log.log</kbd>

![](http://static.codeceo.com/images/2015/05/57b2bda5414cd421ea65ee5da09de2fd.jpg)

`error.log` 为空，因为它只打印 error 级别以上的信息

在你的浏览器访问 http://localhost:8080/test

![](http://static.codeceo.com/images/2015/05/e66c1d45278a9ac19fe37ab91c3b21c2.jpg)

然后打开文件

![](http://static.codeceo.com/images/2015/05/5107e6f30ef1c81cd3be210095780f15.jpg)

![](http://static.codeceo.com/images/2015/05/0603b30d871c140b429a52c79adfae1a.jpg)