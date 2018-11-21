---
layout: post
title: 使用 sqlx 操作 MySQL
permalink: go-database/golang-sqlx-example.html
class: golang
categories: ['go-database']
---

MySQL 目前来说是使用最为流行的关系型数据库，golang 操作 mysql 使用最多的包 `go-sql-driver/mysql`。

`sqlx` 包是作为 `database/sql` 包的一个额外扩展包，在原有的 `database/sql` 加了很多扩展，如直接将查询的数据转为结构体，大大简化了代码书写，当然 `database/sql` 包中的方法同样起作用。

github地址：

- https://github.com/go-sql-driver/mysql
- https://github.com/jmoiron/sqlx

golang sql使用：

- [database/sql documentation](http://golang.org/pkg/database/sql/)
- [go-database-sql tutorial](http://go-database-sql.org/)

# 安装

```shell
go get -u github.com/go-sql-driver/mysql
go get -u github.com/jmoiron/sqlx
```

# 连接数据库

```go
var Db *sqlx.DB
db, err := sqlx.Open("mysql", 
    "username:password@tcp(ip:port)/database?charset=utf8")
Db = db
```

# 处理类型（Handle Types)

sqlx 设计和 `database/sql` 使用方法是一样的。包含有 4 种主要的 `handle types`： 

1. `sqlx.DB` - 和 sql.DB 相似，表示数据库。 
2. `sqlx.Tx` - 和 sql.Tx 相似，表示事务。 
3. `sqlx.Stmt` - 和 sql.Stmt 相似，表示 prepared statement。 
4. `sqlx.NamedStmt` - 表示 prepared statement（支持 named parameters）

所有的 `handler types` 都提供了对 `database/sql` 的兼容，意味着当你调用 `sqlx.DB.Query` 时，可以直接替换为 `sql.DB.Query`。这就使得 sqlx 可以很容易的加入到已有的数据库项目中。

此外，sqlx 还有两个 `cursor` 类型： 

1. `sqlx.Rows` - 和 sql.Rows 类似，返回 Queryx。 
2. `sqlx.Row` - 和 sql.Row 类似，返回 QueryRowx。
 
相比 `database/sql` 方法还多了新语法，也就是实现将获取的数据直接转换结构体实现。

```go
Get(dest interface{}, ...) error
Select(dest interface{}, ...) error 
```

**建表**

 以下所有示例均已以下表结构作为操作基础。

```sql
CREATE TABLE `userinfo` (
    `uid` INT(10) NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(64)  DEFAULT NULL,
    `password` VARCHAR(32)  DEFAULT NULL,
    `department` VARCHAR(64)  DEFAULT NULL,
    `email` varchar(64) DEFAULT NULL,
    PRIMARY KEY (`uid`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8
```

 # Exec 使用

`Exec` 和 `MustExec` 从连接池中获取一个连接然后只想对应的 `query` 操作。对于不支持 `ad-hoc query execution` 的驱动，在操作执行的背后会创建一个 `prepared statement`。在结果返回前这个 `connection` 会返回到连接池中。

需要注意的是不同的数据库类型使用的占位符不同，mysql 采用 `?` 作为占位符号。

- MySQL 使用 `?`
- PostgreSQL 使用 `1` `2`等等 
- SQLite 使用 `?` 或 `$1` 
- Oracle 使用 `:name`
 
# Exec 增删改示例

查询语法使用 Query 后续会提到

```go
package main

import (
    _ "github.com/go-sql-driver/mysql"
    "github.com/jmoiron/sqlx"
    "fmt"
)

var Db *sqlx.DB

func init()  {
    db, err := sqlx.Open("mysql", 
        "root:123456@tcp(127.0.0.1:3306)/test?charset=utf8")

    if err != nil {
        fmt.Println("open mysql failed,", err)
        return
    }
    Db = db
}

func main()  {
    result, err := Db.Exec("INSERT INTO userinfo (username, password, department,email) VALUES (?, ?, ?,?)","codebox","123","it","codebox@163.com")

    if err != nil{
        fmt.Println("insert failed,error： ", err)
        return
    }

    id,_ := result.LastInsertId()
    fmt.Println("insert id is :", id)

    _, err1 := Db.Exec("update userinfo set username = ? where uid = ?", "jack", 1)
    if err1 != nil{
        fmt.Println("update failed error:",err1)
    } else {
        fmt.Println("update success!")
    }

    _, err2 := Db.Exec("delete from userinfo where uid = ? ", 1)
    if err2 != nil{
        fmt.Println("delete error:",err2)
    } else{
        fmt.Println("delete success")
    }
}
```

输出结果

```shell
insert id is : 1
update success!
delete success
```

# SQL 预编译

对于大部分的数据库来说，当一个 `query` 执行的时候，SQL 语句在数据库内已经编译过了，其编译是在数据库中，我们可以提前进行编译，以便在其他地方重用。

```go
stmt, err := db.Prepare(`SELECT * FROM place WHERE telcode=?`)
row = stmt.QueryRow(65)
 
tx, err := db.Begin()
txStmt, err := tx.Prepare(`SELECT * FROM place WHERE telcode=?`)
row = txStmt.QueryRow(852)
```

当然 sqlx 还提供了 `Preparex()` 进行扩展，可直接用于结构体转换

```go
stmt, err := db.Preparex(`SELECT * FROM place WHERE telcode=?`)
var p Place
err = stmt.Get(&p, 852)
```

# 查询 - Query

Query 是 `database/sql` 中执行查询主要使用的方法，该方法返回 row 结果。Query 返回一个 `sql.Rows` 对象和一个 `error` 对象。

在使用的时候应该把 `rows` 当成一个游标而不是一系列的结果。尽管数据库驱动缓存的方法不一样，通过 `Next()` 迭代每次获取一列结果，对于查询结果非常巨大的情况下，可以有效的限制内存的使用，`Scan()` 利用反射把 SQL 每一列结果映射到 go 语言的数据类型如 `string`、`[]byte` 等。如果你没有遍历完全部的 `rows` 结果，一定要记得在把 `connection` 返回到连接池之前调用 `rows.Close()`。

Query 返回的 error 有可能是在 server 准备查询的时候发生的，也有可能是在执行查询语句的时候发生的。例如可能从连接池中获取一个坏的连级（尽管数据库会尝试 10 次去发现或创建一个工作连接）。一般来说，错误主要由错误的 SQL 语句，错误的类似匹配，错误的域名或表名等。

在大部分情况下，`Rows.Scan()` 会把从驱动获取的数据进行拷贝，无论驱动如何使用缓存。特殊类型sql.RawBytes可以用来从驱动返回的数据总获取一个 `zero-copy` 的 slice byte。当下一次调用 `Next` 的时候，这个值就不在有效了，因为它指向的内存已经被驱动重写了别的数据。

Query 使用的 connection 在所有的 rows 通过 `Next()` 遍历完后或者调用 `rows.Close()` 后释放。 

```go
package main

import (
    _ "github.com/go-sql-driver/mysql"
    "github.com/jmoiron/sqlx"
    "fmt"
)

var Db *sqlx.DB

func init()  {
    db, err := sqlx.Open("mysql", 
        "root:123456@tcp(127.0.0.1:3306)/test?charset=utf8")

    if err != nil {
        fmt.Println("open mysql failed,", err)
        return
    }
    Db = db
}

func main()  {
    rows, err := Db.Query("SELECT username,password,email FROM userinfo")
    if err != nil {
        fmt.Println("query failed,error： ", err)
        return
    }

    for rows.Next() {  //循环结果
        var username,password,email string
        err = rows.Scan(&username, &password, &email)
        println(username,password,email)
    }
}
```

输出结果

```shell
codebox 123 codebox@163.com
jack 1222 jack@165.com
```

# Queryx

Queryx 和 Query 行为很相似，不过返回一个 `sqlx.Rows` 对象，支持扩展的 scan 行为，同时可将对数据进行结构体转换。

```go
package main

import (
    _ "github.com/go-sql-driver/mysql"
    "github.com/jmoiron/sqlx"
    "fmt"
)

var Db *sqlx.DB

type stu struct {
    Username    string `db:"username"`
    Password    string `db:"password"`
    Department  string `db:"department"`
    Email       string `db:"email"`
}

func init()  {
    db, err := sqlx.Open("mysql", 
        "root:123456@tcp(127.0.0.1:3306)/test?charset=utf8")

    if err != nil {
        fmt.Println("open mysql failed,", err)
        return
    }
    Db = db
}

func main()  {
    rows, err := Db.Queryx("SELECT username,password,email FROM userinfo")
    if err != nil {
        fmt.Println("Qeryx failed,error： ", err)
        return
    }

    for rows.Next() {  //循环结果
        var stu1 stu
        err = rows.StructScan(&stu1)// 转换为结构体
        fmt.Println("stuct data：", stu1.Username, stu1.Password)
    }
}
```

输出结果

```shell
stuct data： codebox 123
stuct data： jack 1222
```

# QueryRow 和 QueryRowx

QueryRow 和 QueryRowx 都是从数据库中获取一条数据，但是 QueryRowx 提供 scan 扩展，可直接将结果转换为结构体。

```go
row := Db.QueryRow("SELECT username,password,email FROM userinfo where uid = ?", 1) 

// QueryRow返回错误，错误通过Scan返回
var username, password, email string
err := row.Scan(&username,&password,&email)
if err != nil {
    fmt.Println(err)
}
fmt.Printf("this is QueryRow res:[%s:%s:%s]\n",username,password,email)

var s stu
err1 := Db.QueryRowx("SELECT username,password,email FROM userinfo where uid = ?",2).StructScan(&s)

if err1 != nil {
    fmt.Println("QueryRowx error :",err1)
} else {
    fmt.Printf("this is QueryRowx res:%v",s)
}
```

输出结果

```shell
this is QueryRow res:[codebox:123:codebox@163.com]
this is QueryRowx res:{jack 1222  jack@165.com}
```

# Get 和 Select

Get 和 Select是一个非常省时的扩展，可直接将结果赋值给结构体，其内部封装了 StructScan 进行转化。Get 用于获取单个结果然后 Scan，Select 用来获取结果切片。

```go
var stus []stu
err := Db.Select(&stus,"SELECT username,password,email FROM userinfo")
if err != nil {
    fmt.Println("Select error",err)
}
fmt.Printf("this is Select res:%v\n",stus)

var s stu
err1 := Db.Get(&s,"SELECT username,password,email FROM userinfo where uid = ?",2)
if err1 != nil {
    fmt.Println("GET error :",err1)
} else {
    fmt.Printf("this is GET res:%v",s)
}
```

输出结果

```shell
this is Select res:[{codebox 123  codebox@163.com} {jack 1222  jack@165.com}]
this is GET res:{jack 1222  jack@165.com}
```

# 事务（Transactions）

事务操作是通过三个方法实现：

- `Begin()`：开启事务
- `Commit()`：提交事务（执行sql)
- `Rollback()`：回滚

```go
tx, err := db.Begin()
err = tx.Exec(...)
err = tx.Commit()

// 或者使用 sqlx 扩展的事务
tx := db.MustBegin()
tx.MustExec(...)
err = tx.Commit()
```

由于事务是一个一直连接的状态，所以Tx对象必须绑定和控制单个连接。一个 Tx 会在整个生命周期中保存一个连接，然后在调用 `Commit` 或 `Rollback()` 的时候释放掉。在调用这几个函数的时候必须十分小心，否则连接会一直被占用直到被垃圾回收。 

```go
tx, err := Db.Beginx()
_, err = tx.Exec("insert into userinfo(username,password) values(?,?)", "Rose","2223")
if err != nil {
    tx.Rollback()
}

_, err = tx.Exec("insert into userinfo(username,password) values(?,?)", "Mick",222)
if err != nil {
    fmt.Println("exec sql error:",err)
    tx.Rollback()
}

err = tx.Commit()
if err != nil {
    fmt.Println("commit error")
}
```

# 连接池设置

默认情况下，连接池增长无限制，并且只要连接池中没有可用的空闲连接，就会创建连接。我们可以使用 `DB.SetMaxOpenConns` 设置池的最大大小。未使用的连接标记为空闲，如果不需要则关闭。要避免建立和关闭大量连接，可以使用 `DB.SetMaxIdleConns` 设置最大空闲连接。

- `DB.SetMaxIdleConns(n int)`：设置最大空闲连接数
- `DB.SetMaxOpenConns(n int)`：设置最大打开的连接数

```go
package main

import (
    _ "github.com/go-sql-driver/mysql"
    "github.com/jmoiron/sqlx"
    "fmt"
)

var Db *sqlx.DB

func init()  {
    db, err := sqlx.Open("mysql", 
        "root:123456@tcp(127.0.0.1:3306)/test?charset=utf8")

    if err != nil {
        fmt.Println("open mysql failed,", err)
        return
    }

    Db = db
    Db.SetMaxOpenConns(30)
    Db.SetMaxIdleConns(15)
}
```