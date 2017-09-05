

### 1.创建表

**语法**

```sql
CREATE TABLE <表名>(<列名> <数据类型>[列级完整性约束条件]
                  [,<列名> <数据类型>[列级完整性约束条件]]…);
```

> 列级完整性约束条件有NULL[可为空]、NOT NULL[不为空]、UNIQUE[唯一]，可以组合使用，但是不能重复和对立关系同时存在。

**示例**

```sql
-- 创建学生表
CREATE TABLE Student
(
  Id INT NOT NULL UNIQUE PRIMARY KEY,
  Name VARCHAR(20) NOT NULL,
  Age INT NULL,
  Gender VARCHAR(4) NULL
);
```

### 2.删除表

**语法**

```sql
DROP TABLE <表名>;
```

**示例**

```sql
-- 删除学生表
DROP TABLE Student;
```

### 3.清空表

**语法**

```sql
TRUNCATE TABLE <表名>;
```

**示例**

```sql
-- 删除学生表
TRUNCATE TABLE Student;
```

### 4.修改表

**语法**

```Sql
-- 添加列
ALTER TABLE <表名> [ADD <新列名> <数据类型>[列级完整性约束条件]]
-- 删除列
ALTER TABLE <表名> [DROP COLUMN <列名>]
-- 修改列
ALTER TABLE <表名> [MODIFY COLUMN <列名> <数据类型> [列级完整性约束条件]]
```

**示例**

```sql
-- 添加学生表`Phone`列
ALTER TABLE Student ADD Phone VARCHAR(15) NULL;
-- 删除学生表`Phone`列
ALTER TABLE Student DROP COLUMN Phone;
-- 修改学生表`Phone`列
ALTER TABLE Student MODIFY Phone VARCHAR(13) NULL;
```

### 5.查询

**语法**

```sql
SELECT [ALL | DISTINCT] <目标列表达式>[,<目标列表达式>]…
  FROM <表名或视图名>[,<表名或视图名>]…
  [WHERE <条件表达式>]
  [GROUP BY <列名> [HAVING <条件表达式>]]
  [ORDER BY <列名> [ASC|DESC]…]
```

> SQL查询语句的顺序：SELECT、FROM、WHERE、GROUP BY、HAVING、ORDER BY。SELECT、FROM是必须的，HAVING子句只能与GROUP BY搭配使用。

**示例** 

```java
SELECT * FROM Student
  WHERE Id>10
  GROUP BY Age HAVING AVG(Age) > 20
  ORDER BY Id DESC
```

### 6.插入

**语法**

```sql
-- 插入不存在的数据
INSERT INTO <表名> [(字段名[,字段名]…)] VALUES (常量[,常量]…);
-- 将查询的数据插入到数据表中
INSERT INTO <表名> [(字段名[,字段名]…)] SELECT 查询语句;
```

**示例**

```sql
-- 插入不存在的数据
INSERT INTO Student (Name,Age,Gender) VALUES ('Andy',30,'女');
-- 将查询的数据插入到数据表中
INSERT INTO Student (Name,Age,Gender)
  SELECT Name,Age,Gender FROM Student_T WHERE Id >10;
```

### 7.更新

**语法**

```sql
UPDATE <表名> SET 列名=值表达式[,列名=值表达式…]
  [WHERE 条件表达式]
```

**示例**

```sql
-- 将Id在(10,100)的Age加1
UPDATE Student SET Age= Age+1 WHERE Id>10 AND Id<100
```

### 8.删除

**语法**

```sql
DELETE FROM <表名> [WHERE 条件表达式]
```

**示例**

```sql
-- 删除Id小于10的数据记录
DELETE FROM Student WHERE Id<10;
```

### 9.索引

索引是一种特殊的查询表，可以被数据库搜索引擎用来加速数据的检索。简单说来，索引就是指向表中数据的指针。数据库的索引同书籍后面的索引非常相像。

例如，如果想要查阅一本书中与某个特定主题相关的所有页面，你会先去查询索引（索引按照字母表顺序列出了所有主题），然后从索引中找到一页或者多页与该主题相关的页面。

索引能够提高 SELECT 查询和 WHERE 子句的速度，但是却降低了包含 UPDATE 语句或 INSERT 语句的数据输入过程的速度。索引的创建与删除不会对表中的数据产生影响。

创建索引需要使用 CREATE INDEX 语句，该语句允许对索引命名，指定要创建索引的表以及对哪些列进行索引，还可以指定索引按照升序或者降序排列。

同 UNIQUE 约束一样，索引可以是唯一的。这种情况下，索引会阻止列中（或者列的组合，其中某些列有索引）出现重复的条目。

**创建索引**

**语法**

```sql
CREATE [UNIQUE] [CLUSTER] INDEX <索引名> ON <表名>(<列名>[<次序>][,<列名>[<次序>]]…);
```

> **UNIQUE**：表明此索引的每一个索引值只对应唯一的数据记录
> **CLUSTER**：表明建立的索引是聚集索引
> **次序**：可选ASC(升序)或DESC(降序)，默认ASC

**示例**

```sql
-- 建立学生表索引：单一字段Id索引倒序
CREATE UNIQUE INDEX INDEX_SId ON Student (Id DESC);
-- 建立学生表索引：多个字段Id、Name索引倒序
CREATE UNIQUE INDEX INDEX_SId_SName ON Student (Id DESC,Name DESC);
```

**删除索引**

**语法**

```sql
DROP INDEX <索引名>;
```

**示例**

```sql
-- 删除学生表索引 INDEX_SId
DROP INDEX INDEX_SId;
```

### 10.视图

视图无非就是存储在数据库中并具有名字的 SQL 语句，或者说是以预定义的 SQL 查询的形式存在的数据表的成分。

视图可以包含表中的所有列，或者仅包含选定的列。视图可以创建自一个或者多个表，这取决于创建该视图的 SQL 语句的写法。

视图，一种虚拟的表，允许用户执行以下操作：

- 以用户或者某些类型的用户感觉自然或者直观的方式来组织数据；
- 限制对数据的访问，从而使得用户仅能够看到或者修改（某些情况下）他们需要的数据；
- 从多个表中汇总数据，以产生报表。

**创建视图**

语法

```sql
CREATE VIEW <视图名>
  AS SELECT 查询子句
  [WITH CHECK OPTION]
```

> **查询子句**：子查询可以是任何SELECT语句，但是常不允许含有`ORDER BY`子句和`DISTINCT`短语；
> **WITH CHECK OPTION**：表示对UPDATE、INSERT、DELETE操作时要保证更新。

**更新视图**：

视图可以在特定的情况下更新：

- SELECT 子句不能包含 DISTINCT 关键字
- SELECT 子句不能包含任何汇总函数（summary functions）
- SELECT 子句不能包含任何集合函数（set functions）
- SELECT 子句不能包含任何集合运算符（set operators）
- SELECT 子句不能包含 ORDER BY 子句
- FROM 子句中不能有多个数据表
- WHERE 子句不能包含子查询（subquery）
- 查询语句中不能有 GROUP BY 或者 HAVING
- 计算得出的列不能更新
- 视图必须包含原始数据表中所有的 NOT NULL 列，从而使 INSERT 查询生效。

**示例**

```sql
CREATE VIEW VIEW_Stu_Man
AS SELECT * FROM Student WHERE Gender = '男'
WITH CHECK OPTION
```

**删除视图**

**语法**

```sql
DROP VIEW <视图名>;
```

**示例**

```sql
DROP VIEW VIEW_Stu_Man;
```

### 11.ORDER BY

**ORDER BY** 子句根据一列或者多列的值，按照升序或者降序排列数据。某些数据库默认以升序排列查询结果。

**语法**

```sql
    SELECT [ALL | DISTINCT] <目标列表达式>[,<目标列表达式>]…
    FROM <表名或视图名>[,<表名或视图名>]…
    [WHERE <条件表达式>] 
    [ORDER BY <列名>] [ASC | DESC];
```

ORDER BY 子句可以同时使用多个列作为排序条件。无论用哪一列作为排序条件，都要确保该列在存在。

**示例**

```sql
SELECT * FROM CUSTOMERS
         ORDER BY NAME DESC
```

### 12.WHERE

**WHERE** 子句用于有条件地从单个表中取回数据或者将多个表进行合并。

如果条件满足，则查询只返回表中满足条件的值。你可以用 WHERE 子句来过滤查询结果，只获取必要的记录。

WHERE 子句不仅可以用于 SELECT 语句，还可以用于 UPDATE、DELETE 等语句。

**语法**

```sql
    SELECT [ALL | DISTINCT] <目标列表达式>[,<目标列表达式>]…
    FROM <表名或视图名>[,<表名或视图名>]…
    WHERE <条件表达式>
```

在指定条件时，可以使用关系运算符和逻辑运算符，例如 `>`、`<`、`=`、`LIKE`、`NOT` 等。

**示例**

```sql
SELECT ID, NAME, SALARY 
    FROM CUSTOMERS
    WHERE SALARY > 2000;
```

### 13.LIKE

**LIKE** 子句通过通配符来将一个值同其他相似的值作比较。可以同 LIKE 运算符一起使用的通配符有两个：

- 百分号（%）
- 下划线（_）

百分号代表零个、一个或者多个字符。下划线则代表单个数字或者字符。两个符号可以一起使用。

**语法**

% 和 _ 的基本语法如下：

```sql
    SELECT FROM table_name
    WHERE column LIKE 'XXXX%'


    SELECT FROM table_name
    WHERE column LIKE '%XXXX%'


    SELECT FROM table_name
    WHERE column LIKE 'XXXX_'


    SELECT FROM table_name
    WHERE column LIKE '_XXXX'


    SELECT FROM table_name
    WHERE column LIKE '_XXXX_'
```

你可以将多个条件用 AND 或者 OR　连接在一起。这里，XXXX　为任何数字值或者字符串。

**示例**

下面这些示例中，每个 WHERE 子句都有不同的 LIKE 子句，展示了 % 和 _ 的用法:

| 语句                        | 描述                      |
| ------------------------- | ----------------------- |
| WHERE SALARY LIKE '200%'  | 找出所有 200 打头的值           |
| WHERE SALARY LIKE '%200%' | 找出所有含有 200 的值           |
| WHERE SALARY LIKE '_00%'  | 找出所有第二位和第三位为 0 的值       |
| WHERE SALARY LIKE '2_%_%' | 找出所有以 2 开始，并且长度至少为 3 的值 |
| WHERE SALARY LIKE '%2'    | 找出所有以 2 结尾的值            |
| WHERE SALARY LIKE '_2%3'  | 找出所有第二位为 2，并且以3结束的值     |
| WHERE SALARY LIKE '2___3' | 找出所有以 2 开头以 3 结束的五位数    |

### 14.HAVING 

HAVING 子句使你能够指定过滤条件，从而控制查询结果中哪些组可以出现在最终结果里面。

WHERE 子句对被选择的列施加条件，而 HAVING 子句则对 GROUP BY 子句所产生的组施加条件。

**语法**

下面可以看到 HAVING 子句在 SELECT 查询中的位置：

```sql
SELECT
FROM
WHERE
GROUP BY
HAVING
ORDER BY
```

在 SELECT 查询中，HAVING 子句必须紧随 GROUP BY 子句，并出现在 ORDER BY 子句（如果有的话）之前。带有 HAVING 子句的 SELECT 语句的语法如下所示：

```sql
SELECT column1, column2
FROM table1, table2
WHERE [ conditions ]
GROUP BY column1, column2
HAVING [ conditions ]
ORDER BY column1, column2
```

**示例**

考虑 CUSTOMERS 表，表中的记录如下所示：

```sql
+----+----------+-----+-----------+----------+
| ID | NAME     | AGE | ADDRESS   | SALARY   |
+----+----------+-----+-----------+----------+
|  1 | Ramesh   |  32 | Ahmedabad |  2000.00 |
|  2 | Khilan   |  25 | Delhi     |  1500.00 |
|  3 | kaushik  |  23 | Kota      |  2000.00 |
|  4 | Chaitali |  25 | Mumbai    |  6500.00 |
|  5 | Hardik   |  27 | Bhopal    |  8500.00 |
|  6 | Komal    |  22 | MP        |  4500.00 |
|  7 | Muffy    |  24 | Indore    | 10000.00 |
+----+----------+-----+-----------+----------+
```

下面是一个有关 HAVING 子句使用的实例，该实例将会筛选出出现次数大于或等于 2 的所有记录。

```sql
SELECT ID, NAME, AGE, ADDRESS, SALARY
FROM CUSTOMERS
GROUP BY age
HAVING COUNT(age) >= 2;
```

其执行结果如下所示：

```sql
+----+--------+-----+---------+---------+
| ID | NAME   | AGE | ADDRESS | SALARY  |
+----+--------+-----+---------+---------+
|  2 | Khilan |  25 | Delhi   | 1500.00 |
+----+--------+-----+---------+---------+
```

### 15.DISTINCT

**DISTINCT** 关键字同 SELECT 语句一起使用，可以去除所有重复记录，只返回唯一项。

有时候，数据表中可能会有重复的记录。在检索这些记录的时候，应该只取回唯一的记录，而不是重复的。

**语法**

使用 DISTINCT 关键字去除查询结果中的重复记录的基本语法如下所示：

```sql
    SELECT DISTINCT column1, column2,.....columnN 
    FROM table_name
    WHERE [condition]
```

**示例**

```sql
SELECT DISTINCT SALARY FROM CUSTOMERS
         ORDER BY SALARY
```

去除（SALARY 字段）重复记录。

### 16.AND和OR

**AND** 和 **OR** 运算符可以将多个条件结合在一起，从而过滤 SQL 语句的返回结果。这两个运算符被称作连接运算符。

**AND**

**语法**

```sql
    SELECT column1, column2, columnN 
    FROM table_name
    WHERE [condition1] AND [condition2]...AND [conditionN];
```

将 N 个条件用 AND 运算符结合在一起。对于 SQL 语句要执行的动作来说——无论是事务还是查询，AND 运算符连接的所有条件都必须为 TRUE。

**示例**

```sql
SELECT ID, NAME, SALARY 
    FROM CUSTOMERS
    WHERE SALARY > 2000 AND age < 25;
```

**OR**

**语法**

```sql
    SELECT column1, column2, columnN 
    FROM table_name
    WHERE [condition1] OR [condition2]...OR [conditionN]
```

你可以将 N 个条件用 OR 运算符结合在一起。对于 SQL 语句要执行的动作来说——无论是事务还是查询，OR 运算符连接的所有条件中只需要有一个为 TRUE 即可。

**示例**

```sql
SELECT ID, NAME, SALARY 
    FROM CUSTOMERS
    WHERE SALARY > 2000 OR age < 25;
```

### 17.UNION

**UNION** 子句/运算符用于将两个或者更多的 SELECT 语句的运算结果组合起来。

在使用 UNION 的时候，每个 SELECT 语句必须有相同数量的选中列、相同数量的列表达式、相同的数据类型，并且它们出现的次序要一致，不过长度不一定要相同。

**语法**

```sql
    SELECT column1 [, column2 ]
    FROM table1 [, table2 ]
    [WHERE condition]

    UNION

    SELECT column1 [, column2 ]
    FROM table1 [, table2 ]
    [WHERE condition]
```

这里的条件可以是任何根据你的需要而设的条件。

**示例**

```Sql
SELECT Txn_Date FROM Store_Information
UNION
SELECT Txn_Date FROM Internet_Sales;
```

**UNION ALL 子句：**

UNION ALL 运算符用于将两个 SELECT 语句的结果组合在一起，重复行也包含在内。

**其他类似语句**

**INTERSECT子句**：

用于组合两个 SELECT 语句，但是只返回两个 SELECT 语句的结果中都有的行。

**EXCEPT 子句**：

组合两个 SELECT 语句，并将第一个 SELECT 语句的结果中存在，但是第二个 SELECT 语句的结果中不存在的行返回。

### 18.JOIN

**连接（JOIN）** 子句用于将数据库中两个或者两个以上表中的记录组合起来。连接通过共有值将不同表中的字段组合在一起。

考虑下面两个表，（a）CUSTOMERS 表：

```Sql
    +----+----------+-----+-----------+----------+
    | ID | NAME     | AGE | ADDRESS   | SALARY   |
    +----+----------+-----+-----------+----------+
    |  1 | Ramesh   |  32 | Ahmedabad |  2000.00 |
    |  2 | Khilan   |  25 | Delhi     |  1500.00 |
    |  3 | kaushik  |  23 | Kota      |  2000.00 |
    |  4 | Chaitali |  25 | Mumbai    |  6500.00 |
    |  5 | Hardik   |  27 | Bhopal    |  8500.00 |
    |  6 | Komal    |  22 | MP        |  4500.00 |
    |  7 | Muffy    |  24 | Indore    | 10000.00 |
    +----+----------+-----+-----------+----------+
```

（b）另一个表是 ORDERS 表：

```sql
    +-----+---------------------+-------------+--------+
    |OID  | DATE                | CUSTOMER_ID | AMOUNT |
    +-----+---------------------+-------------+--------+
    | 102 | 2009-10-08 00:00:00 |           3 |   3000 |
    | 100 | 2009-10-08 00:00:00 |           3 |   1500 |
    | 101 | 2009-11-20 00:00:00 |           2 |   1560 |
    | 103 | 2008-05-20 00:00:00 |           4 |   2060 |
    +-----+---------------------+-------------+--------+
```

现在，让我们用 SELECT 语句将这个两张表连接（JOIN）在一起：

```sql
    SQL> SELECT ID, NAME, AGE, AMOUNT
            FROM CUSTOMERS, ORDERS
            WHERE  CUSTOMERS.ID = ORDERS.CUSTOMER_ID;
```

上述语句的运行结果如下所示：

```sql
    +----+----------+-----+--------+
    | ID | NAME     | AGE | AMOUNT |
    +----+----------+-----+--------+
    |  3 | kaushik  |  23 |   3000 |
    |  3 | kaushik  |  23 |   1500 |
    |  2 | Khilan   |  25 |   1560 |
    |  4 | Chaitali |  25 |   2060 |
    +----+----------+-----+--------+
```

**SQL 连接类型**

SQL 中有多种不同的连接：

- 内连接（INNER JOIN）：当两个表中都存在匹配时，才返回行。
- 左连接（LEFT JOIN）：返回左表中的所有行，如果左表中行在右表中没有匹配行，则结果中右表中的列返回空值。
- 右连接（RIGHT JOIN）：恰与左连接相反，返回右表中的所有行，如果右表中行在左表中没有匹配行，则结果中左表中的列返回空值。
- 全连接（FULL JOIN）：返回左表和右表中的所有行。当某行在另一表中没有匹配行，则另一表中的列返回空值

**内连接**

**语法**

```sql
SELECT table1.column1, table2.column2...
FROM table1
INNER JOIN table2
ON table1.common_field = table2.common_field;
```

**示例**

考虑如下两个表格，（a）CUSTOMERS 表：

```sql
+----+----------+-----+-----------+----------+
| ID | NAME     | AGE | ADDRESS   | SALARY   |
+----+----------+-----+-----------+----------+
|  1 | Ramesh   |  32 | Ahmedabad |  2000.00 |
|  2 | Khilan   |  25 | Delhi     |  1500.00 |
|  3 | kaushik  |  23 | Kota      |  2000.00 |
|  4 | Chaitali |  25 | Mumbai    |  6500.00 |
|  5 | Hardik   |  27 | Bhopal    |  8500.00 |
|  6 | Komal    |  22 | MP        |  4500.00 |
|  7 | Muffy    |  24 | Indore    | 10000.00 |
+----+----------+-----+-----------+----------+
```

（b）ORDERS 表：

```sql
+-----+---------------------+-------------+--------+
| OID | DATE                |          ID | AMOUNT |
+-----+---------------------+-------------+--------+
| 102 | 2009-10-08 00:00:00 |           3 |   3000 |
| 100 | 2009-10-08 00:00:00 |           3 |   1500 |
| 101 | 2009-11-20 00:00:00 |           2 |   1560 |
| 103 | 2008-05-20 00:00:00 |           4 |   2060 |
+-----+---------------------+-------------+--------+
```

现在，让我们用内连接将这两个表连接在一起：

```sql
    SELECT  ID, NAME, AMOUNT, DATE
     FROM CUSTOMERS
     INNER JOIN ORDERS
     ON CUSTOMERS.ID = ORDERS.CUSTOMER_ID;
```

上述语句将会产生如下结果：

```sql
+----+----------+--------+---------------------+
| ID | NAME     | AMOUNT | DATE                |
+----+----------+--------+---------------------+
|  3 | kaushik  |   3000 | 2009-10-08 00:00:00 |
|  3 | kaushik  |   1500 | 2009-10-08 00:00:00 |
|  2 | Khilan   |   1560 | 2009-11-20 00:00:00 |
|  4 | Chaitali |   2060 | 2008-05-20 00:00:00 |
+----+----------+--------+---------------------+
```

**左连接**

**语法**

```sql
SELECT table1.column1, table2.column2...
FROM table1
LEFT JOIN table2
ON table1.common_field = table2.common_field;
```

这里，给出的条件可以是任何根据你的需要写出的条件。

**示例**

考虑如下两个表格，（a）CUSTOMERS 表：

```sql
+----+----------+-----+-----------+----------+
| ID | NAME     | AGE | ADDRESS   | SALARY   |
+----+----------+-----+-----------+----------+
|  1 | Ramesh   |  32 | Ahmedabad |  2000.00 |
|  2 | Khilan   |  25 | Delhi     |  1500.00 |
|  3 | kaushik  |  23 | Kota      |  2000.00 |
|  4 | Chaitali |  25 | Mumbai    |  6500.00 |
|  5 | Hardik   |  27 | Bhopal    |  8500.00 |
|  6 | Komal    |  22 | MP        |  4500.00 |
|  7 | Muffy    |  24 | Indore    | 10000.00 |
+----+----------+-----+-----------+----------+
```

（b）ORDERS 表：

```sql
+-----+---------------------+-------------+--------+
| OID | DATE                |          ID | AMOUNT |
+-----+---------------------+-------------+--------+
| 102 | 2009-10-08 00:00:00 |           3 |   3000 |
| 100 | 2009-10-08 00:00:00 |           3 |   1500 |
| 101 | 2009-11-20 00:00:00 |           2 |   1560 |
| 103 | 2008-05-20 00:00:00 |           4 |   2060 |
+-----+---------------------+-------------+--------+
```

现在，让我们用左连接将这两个表连接在一起：

```sql
    SELECT  ID, NAME, AMOUNT, DATE
     FROM CUSTOMERS
     LEFT JOIN ORDERS
     ON CUSTOMERS.ID = ORDERS.CUSTOMER_ID;
```

上述语句将会产生如下结果：

```sql
+----+----------+--------+---------------------+
| ID | NAME     | AMOUNT | DATE                |
+----+----------+--------+---------------------+
|  1 | Ramesh   |   NULL | NULL                |
|  2 | Khilan   |   1560 | 2009-11-20 00:00:00 |
|  3 | kaushik  |   3000 | 2009-10-08 00:00:00 |
|  3 | kaushik  |   1500 | 2009-10-08 00:00:00 |
|  4 | Chaitali |   2060 | 2008-05-20 00:00:00 |
|  5 | Hardik   |   NULL | NULL                |
|  6 | Komal    |   NULL | NULL                |
|  7 | Muffy    |   NULL | NULL                |
+----+----------+--------+---------------------+
```

**右连接**

**语法**

```sql
SELECT table1.column1, table2.column2...
FROM table1
RIGHT JOIN table2
ON table1.common_field = table2.common_field;
```

这里，给出的条件可以是任何根据你的需要写出的条件。

**示例**

考虑如下两个表格，（a）CUSTOMERS 表：

```sql
+----+----------+-----+-----------+----------+
| ID | NAME     | AGE | ADDRESS   | SALARY   |
+----+----------+-----+-----------+----------+
|  1 | Ramesh   |  32 | Ahmedabad |  2000.00 |
|  2 | Khilan   |  25 | Delhi     |  1500.00 |
|  3 | kaushik  |  23 | Kota      |  2000.00 |
|  4 | Chaitali |  25 | Mumbai    |  6500.00 |
|  5 | Hardik   |  27 | Bhopal    |  8500.00 |
|  6 | Komal    |  22 | MP        |  4500.00 |
|  7 | Muffy    |  24 | Indore    | 10000.00 |
+----+----------+-----+-----------+----------+
```

（b）ORDERS 表：

```sql
+-----+---------------------+-------------+--------+
| OID | DATE                |          ID | AMOUNT |
+-----+---------------------+-------------+--------+
| 102 | 2009-10-08 00:00:00 |           3 |   3000 |
| 100 | 2009-10-08 00:00:00 |           3 |   1500 |
| 101 | 2009-11-20 00:00:00 |           2 |   1560 |
| 103 | 2008-05-20 00:00:00 |           4 |   2060 |
+-----+---------------------+-------------+--------+
```

现在，让我们用右连接将这两个表连接在一起：

```sql
    SELECT  ID, NAME, AMOUNT, DATE
     FROM CUSTOMERS
     RIGHT JOIN ORDERS
     ON CUSTOMERS.ID = ORDERS.CUSTOMER_ID;
```

上述语句将会产生如下结果：

```Sql
+------+----------+--------+---------------------+
| ID   | NAME     | AMOUNT | DATE                |
+------+----------+--------+---------------------+
|    3 | kaushik  |   3000 | 2009-10-08 00:00:00 |
|    3 | kaushik  |   1500 | 2009-10-08 00:00:00 |
|    2 | Khilan   |   1560 | 2009-11-20 00:00:00 |
|    4 | Chaitali |   2060 | 2008-05-20 00:00:00 |
+------+----------+--------+---------------------+
```

**全连接**

**语法**

```sql
SELECT table1.column1, table2.column2...
FROM table1
FULL JOIN table2
ON table1.common_field = table2.common_field;
```

这里，给出的条件可以是任何根据你的需要写出的条件。

**示例**

考虑如下两个表格，（a）CUSTOMERS 表：

```Sql
+----+----------+-----+-----------+----------+
| ID | NAME     | AGE | ADDRESS   | SALARY   |
+----+----------+-----+-----------+----------+
|  1 | Ramesh   |  32 | Ahmedabad |  2000.00 |
|  2 | Khilan   |  25 | Delhi     |  1500.00 |
|  3 | kaushik  |  23 | Kota      |  2000.00 |
|  4 | Chaitali |  25 | Mumbai    |  6500.00 |
|  5 | Hardik   |  27 | Bhopal    |  8500.00 |
|  6 | Komal    |  22 | MP        |  4500.00 |
|  7 | Muffy    |  24 | Indore    | 10000.00 |
+----+----------+-----+-----------+----------+
```

（b）ORDERS 表：

```Sql
+-----+---------------------+-------------+--------+
| OID | DATE                |          ID | AMOUNT |
+-----+---------------------+-------------+--------+
| 102 | 2009-10-08 00:00:00 |           3 |   3000 |
| 100 | 2009-10-08 00:00:00 |           3 |   1500 |
| 101 | 2009-11-20 00:00:00 |           2 |   1560 |
| 103 | 2008-05-20 00:00:00 |           4 |   2060 |
+-----+---------------------+-------------+--------+
```

现在让我们用全连接将两个表连接在一起：

```sql
    SELECT  ID, NAME, AMOUNT, DATE
     FROM CUSTOMERS
     FULL JOIN ORDERS
     ON CUSTOMERS.ID = ORDERS.CUSTOMER_ID;
```

上述语句将会产生如下结果：

```sql
+------+----------+--------+---------------------+
| ID   | NAME     | AMOUNT | DATE                |
+------+----------+--------+---------------------+
|    1 | Ramesh   |   NULL | NULL                |
|    2 | Khilan   |   1560 | 2009-11-20 00:00:00 |
|    3 | kaushik  |   3000 | 2009-10-08 00:00:00 |
|    3 | kaushik  |   1500 | 2009-10-08 00:00:00 |
|    4 | Chaitali |   2060 | 2008-05-20 00:00:00 |
|    5 | Hardik   |   NULL | NULL                |
|    6 | Komal    |   NULL | NULL                |
|    7 | Muffy    |   NULL | NULL                |
|    3 | kaushik  |   3000 | 2009-10-08 00:00:00 |
|    3 | kaushik  |   1500 | 2009-10-08 00:00:00 |
|    2 | Khilan   |   1560 | 2009-11-20 00:00:00 |
|    4 | Chaitali |   2060 | 2008-05-20 00:00:00 |
+------+----------+--------+---------------------+
```

如果你所用的数据库不支持全连接，比如 MySQL，那么你可以使用 UNION ALL子句来将左连接和右连接结果组合在一起：

```sql
    SELECT  ID, NAME, AMOUNT, DATE
     FROM CUSTOMERS
     LEFT JOIN ORDERS
     ON CUSTOMERS.ID = ORDERS.CUSTOMER_ID
UNION ALL
     SELECT  ID, NAME, AMOUNT, DATE
     FROM CUSTOMERS
     RIGHT JOIN ORDERS
     ON CUSTOMERS.ID = ORDERS.CUSTOMER_ID
```

### 19.常用函数

**COUNT**函数是 SQL 中最简单的函数了，对于统计由 SELECT 语句返回的记录非常有用。

要理解 COUNT 函数，请考虑 employee_tbl 表，表中的记录如下所示：

```sql
    SELECT * FROM employee_tbl;
    +------+------+------------+--------------------+
    | id   | name | work_date  | daily_typing_pages |
    +------+------+------------+--------------------+
    |    1 | John | 2007-01-24 |                250 |
    |    2 | Ram  | 2007-05-27 |                220 |
    |    3 | Jack | 2007-05-06 |                170 |
    |    3 | Jack | 2007-04-06 |                100 |
    |    4 | Jill | 2007-04-06 |                220 |
    |    5 | Zara | 2007-06-06 |                300 |
    |    5 | Zara | 2007-02-06 |                350 |
    +------+------+------------+--------------------+
    7 rows in set (0.00 sec)
```

现在，假设你想要统计上表中记录的总数，那么可以依如下所示步骤达到目的：

```sql
    SELECT COUNT(*) FROM employee_tbl ;
    +----------+
    | COUNT(*) |
    +----------+
    |        7 |
    +----------+
    1 row in set (0.01 sec)
```

类似地，如果你想要统计 Zara 的数目，就可以像下面这样：

```sql
    SELECT COUNT(*) FROM employee_tbl
        WHERE name="Zara";
    +----------+
    | COUNT(*) |
    +----------+
    |        2 |
    +----------+
    1 row in set (0.04 sec)
```

**注意：**所有的 SQL 查询都是不区分大小写的，因此在 WHERE 子句的条件中，ZARA 和 Zara 是没有任何区别的。

**CONCAT** 函数用于将两个字符串连接为一个字符串，试一下下面这个例子：

```sql
    SELECT CONCAT('FIRST ', 'SECOND');
    +----------------------------+
    | CONCAT('FIRST ', 'SECOND') |
    +----------------------------+
    | FIRST SECOND               |
    +----------------------------+
    1 row in set (0.00 sec)
```

要对 **CONCAT** 函数有更为深入的了解，请考虑 **employee_tbl** 表，表中记录如下所示：

```sql
    SELECT * FROM employee_tbl;
    +------+------+------------+--------------------+
    | id   | name | work_date  | daily_typing_pages |
    +------+------+------------+--------------------+
    |    1 | John | 2007-01-24 |                250 |
    |    2 | Ram  | 2007-05-27 |                220 |
    |    3 | Jack | 2007-05-06 |                170 |
    |    3 | Jack | 2007-04-06 |                100 |
    |    4 | Jill | 2007-04-06 |                220 |
    |    5 | Zara | 2007-06-06 |                300 |
    |    5 | Zara | 2007-02-06 |                350 |
    +------+------+------------+--------------------+
    7 rows in set (0.00 sec)
```

现在，假设你想要将上表中所有的姓名（name）、id和工作日（work_date）连接在一起，那么可以通过如下的命令来达到目的：

```sql
    SELECT CONCAT(id, name, work_date)
        FROM employee_tbl;
    +-----------------------------+
    | CONCAT(id, name, work_date) |
    +-----------------------------+
    | 1John2007-01-24             |
    | 2Ram2007-05-27              |
    | 3Jack2007-05-06             |
    | 3Jack2007-04-06             |
    | 4Jill2007-04-06             |
    | 5Zara2007-06-06             |
    | 5Zara2007-02-06             |
    +-----------------------------+
    7 rows in set (0.00 sec)
```

**SUM**函数用于找出表中记录在某字段处的总和。

要理解 **SUM** 函数，请考虑 **employee_tbl** 表，表中记录如下所示：

```sql
    SELECT * FROM employee_tbl;
    +------+------+------------+--------------------+
    | id   | name | work_date  | daily_typing_pages |
    +------+------+------------+--------------------+
    |    1 | John | 2007-01-24 |                250 |
    |    2 | Ram  | 2007-05-27 |                220 |
    |    3 | Jack | 2007-05-06 |                170 |
    |    3 | Jack | 2007-04-06 |                100 |
    |    4 | Jill | 2007-04-06 |                220 |
    |    5 | Zara | 2007-06-06 |                300 |
    |    5 | Zara | 2007-02-06 |                350 |
    +------+------+------------+--------------------+
    7 rows in set (0.00 sec)
```

现在，假设你想要获取 daily_typing_pages 的总和，那么你可以用如下命令来达到目的：

```sql
    SELECT SUM(daily_typing_pages)
        FROM employee_tbl;
    +-------------------------+
    | SUM(daily_typing_pages) |
    +-------------------------+
    |                    1610 |
    +-------------------------+
    1 row in set (0.00 sec)
```

你还可以使用 **GROUP BY** 子句来得出不同记录分组的总和。下面的例子将会计算得出每个人的总和，，你将能够得到每个人打的总页数。

```sql
    SELECT name, SUM(daily_typing_pages)
        FROM employee_tbl GROUP BY name;
```