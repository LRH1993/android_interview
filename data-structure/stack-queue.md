## 一、栈

栈（stack），是一种线性存储结构，它有以下几个特点：

(01) 栈中数据是按照"后进先出（LIFO, Last In First Out）"方式进出栈的。

(02) 向栈中添加/删除数据时，只能从栈顶进行操作。

栈通常包括的三种操作：push、peek、pop。

push -- 向栈中添加元素。

peek -- 返回栈顶元素。

pop  -- 返回并删除栈顶元素的操作。

### 1.栈的示意图

[![img](http://images.cnitblog.com/blog/497634/201402/231830345432345.jpg)](http://images.cnitblog.com/blog/497634/201402/231830345432345.jpg)

栈中的数据依次是 30 --> 20 --> 10

 

### 2.出栈

[![img](http://images.cnitblog.com/blog/497634/201402/231830540262932.jpg)](http://images.cnitblog.com/blog/497634/201402/231830540262932.jpg)

**出栈前**：栈顶元素是30。此时，栈中的元素依次是 30 --> 20 --> 10 

**出栈后**：30出栈之后，栈顶元素变成20。此时，栈中的元素依次是 20 --> 10

 

### 3. 入栈

[![img](http://images.cnitblog.com/blog/497634/201402/231831135784303.jpg)](http://images.cnitblog.com/blog/497634/201402/231831135784303.jpg)

**入栈前**：栈顶元素是20。此时，栈中的元素依次是 20 --> 10 

**入栈后**：40入栈之后，栈顶元素变成40。此时，栈中的元素依次是 40 --> 20 --> 10

### 4.栈的Java实现

JDK包中也提供了"栈"的实现，它就是集合框架中的Stack类。 本部分使用数组实现栈，能存储任意类型的数据。

```Java
/**
 * Java : 数组实现的栈，能存储任意类型的数据
 *
 * @author skywang
 * @date 2013/11/07
 */
import java.lang.reflect.Array;

public class GeneralArrayStack<T> {

    private static final int DEFAULT_SIZE = 12;
    private T[] mArray;
    private int count;

    public GeneralArrayStack(Class<T> type) {
        this(type, DEFAULT_SIZE);
    }

    public GeneralArrayStack(Class<T> type, int size) {
        // 不能直接使用mArray = new T[DEFAULT_SIZE];
        mArray = (T[]) Array.newInstance(type, size);
        count = 0;
    }

    // 将val添加到栈中
    public void push(T val) {
        mArray[count++] = val;
    }

    // 返回“栈顶元素值”
    public T peek() {
        return mArray[count-1];
    }

    // 返回“栈顶元素值”，并删除“栈顶元素”
    public T pop() {
        T ret = mArray[count-1];
        count--;
        return ret;
    }

    // 返回“栈”的大小
    public int size() {
        return count;
    }

    // 返回“栈”是否为空
    public boolean isEmpty() {
        return size()==0;
    }

    // 打印“栈”
    public void PrintArrayStack() {
        if (isEmpty()) {
            System.out.printf("stack is Empty\n");
        }

        System.out.printf("stack size()=%d\n", size());

        int i=size()-1;
        while (i>=0) {
            System.out.println(mArray[i]);
            i--;
        }
    }
}
```

## 二、队列

队列（Queue），是一种线性存储结构。它有以下几个特点：
(1) 队列中数据是按照"先进先出（FIFO, First-In-First-Out）"方式进出队列的。
(2) 队列只允许在"队首"进行删除操作，而在"队尾"进行插入操作。
队列通常包括的两种操作：入队列 和 出队列。

### 1.队列的示意图

[![img](http://images.cnitblog.com/blog/497634/201402/231907318284837.jpg)](http://images.cnitblog.com/blog/497634/201402/231907318284837.jpg)

队列中有10，20，30共3个数据。

 

### 2.出队列

[![img](http://images.cnitblog.com/blog/497634/201402/231907485077436.jpg)](http://images.cnitblog.com/blog/497634/201402/231907485077436.jpg)

**出队列前**：队首是10，队尾是30。

**出队列后**：出队列(队首)之后。队首是20，队尾是30。

### 3.入队列

[![img](http://images.cnitblog.com/blog/497634/201402/231908068809877.jpg)](http://images.cnitblog.com/blog/497634/201402/231908068809877.jpg)

**入队列前**：队首是20，队尾是30。

**入队列后**：40入队列(队尾)之后。队首是20，队尾是40。

### 4.队列的Java实现

JDK中的Queue接口就是"队列"，它的实现类也都是队列，用的最多的是LinkedList。本部分使用数组实现队列，能存储任意类型的数据。

```java
/**
 * Java : 数组实现“队列”，只能存储int数据。
 *
 * @author skywang
 * @date 2013/11/07
 */
public class ArrayQueue {

    private int[] mArray;
    private int mCount;

    public ArrayQueue(int sz) {
        mArray = new int[sz];
        mCount = 0;
    }

    // 将val添加到队列的末尾
    public void add(int val) {
        mArray[mCount++] = val;
    }

    // 返回“队列开头元素”
    public int front() {
        return mArray[0];
    }

    // 返回“队首元素值”，并删除“队首元素”
    public int pop() {
        int ret = mArray[0];
        mCount--;
        for (int i=1; i<=mCount; i++)
            mArray[i-1] = mArray[i];
        return ret;
    }

    // 返回“栈”的大小
    public int size() {
        return mCount;
    }

    // 返回“栈”是否为空
    public boolean isEmpty() {
        return size()==0;
    }
}
```

