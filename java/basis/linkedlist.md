## 一、概述
> LinkedList，相对于ArrayList，大家可能平时使用LinkedList要少一些，其实有时候使用LinkedList比ArrayList效率高很多，当然，这得视情况而定。

本文将带大家深入LinkedList源码，分析其背后的实现原理，以便以后在合适的情况下进行使用。

之前我所知道的LinkedList的知识：

- LinkedList底层是链表结构
- 插入和删除比较快（O(1)），查询则相对慢一些（O(n)）
- 因为是链表结构，所以分配的空间不要求是连续的

## 二、链表
> 因为LinkedList源码中很多地方是进行链表操作,所以先带大家复习一下链表的基础知识.

### 1. 单链表

![](http://olg7c0d2n.bkt.clouddn.com/18-5-8/63677937.jpg)

一个节点中包含数据和下一个节点的指针(注意,是下一个节点的指针,而不是下一个节点数据的指针),尾节点没有下一个节点,所以指向null.访问某个节点只能从头节点开始查找,然后依次往后遍历.

### 2. 单向循环链表

![](http://olg7c0d2n.bkt.clouddn.com/18-5-8/47063362.jpg)

单向循环链表比单链表多了一个尾节点的指针指向的是头结点.

### 3. 双向链表

![](http://olg7c0d2n.bkt.clouddn.com/18-5-8/73677769.jpg)

双向链表的每个节点包含以下数据:上一个节点的指针,自己的数据,下一个节点的指针.尾节点没有下一个节点,所以指向null.这样的结构,比如我拿到链表中间的一个节点,即可以往前遍历,也可以往后遍历.

### 4. 双向循环链表

![](http://olg7c0d2n.bkt.clouddn.com/18-5-8/5983848.jpg)

双向循环链表的尾节点的下一个节点是头结点,头节点的上一个节点是尾节点.

## 三、LinkedList的继承关系

![](http://olg7c0d2n.bkt.clouddn.com/18-5-8/60559373.jpg)

源码中的定义:
```java
public class LinkedList<E>
    extends AbstractSequentialList<E>
    implements List<E>, Deque<E>, Cloneable, java.io.Serializable
```
- AbstractSequentialList这个类提供了List的一个骨架实现接口，以尽量减少实现此接口所需的工作量由“顺序访问”数据存储（如链接列表）支持。对于随机访问数据（如数组），应使用AbstractList优先于此类。

- 实现了List接口,意味着LinkedList元素是有序的,可以重复的,可以有null元素的集合.

- Deque是Queue的子接口,Queue是一种队列形式,而Deque是双向队列,它支持从两个端点方向检索和插入元素.

- 实现了Cloneable接口,标识着可以它可以被复制.注意,ArrayList里面的clone()复制其实是浅复制(不知道此概念的赶快去查资料,这知识点非常重要).

- 实现了Serializable 标识着集合可被序列化。

## 四、看LinkedList源码前的准备

### 1. 节点定义

```java
private static class Node<E> {
    E item;  //该节点的数据
    Node<E> next; //指向下一个节点的指针
    Node<E> prev; //指向上一个节点的指针

    Node(Node<E> prev, E element, Node<E> next) {
        this.item = element;
        this.next = next;
        this.prev = prev;
    }
}
```

Node是LinkedList的静态内部类.

为什么是静态内部类?我觉得可能原因如下:普通内部类会有外部类的强引用,而静态内部类就没有.有外部类的强引用的话,很容易造成内存泄漏,写成静态内部类可以避免这种情况的发生.

### 2. 成员变量

看构造方法之前先看看几个属性:

```java
//链表长度
transient int size = 0;
/**
* 头结点
*/
transient Node<E> first;

/**
* 尾节点
*/
transient Node<E> last;
```

这里为什么要存在一个成员变量尾节点?我感觉是为了方便,比如查找相应索引处元素+插入元素到最后.查找相应索引处元素时,先判断索引是在前半段还是在后半段,如果是在后半段,那么直接从尾节点出发,从后往前进行查找,这样速度更快.在插入元素到最后时,可以直接通过尾节点方便的进行插入.

### 3. 构造方法
下面是构造方法源码:

```java
/**
* 构造一个空列表
*/
public LinkedList() {
}

/**
* 构造列表通过指定的集合
*/
public LinkedList(Collection<? extends E> c) {
    this();
    addAll(c);
}
```

两个构造方法都比较简单,就是构造一个列表,其中的addAll()方法待会儿放到后面分析.

**思考:为什么LinkedList没有提供public LinkedList(int initialCapacity)这种构建指定大小列表的构造方式?**

因为ArrayList有这种构造方法`public ArrayList(int initialCapacity)`,ArrayList提供这种构造方法的好处在于在知道需要多大的空间的情况下,可以按需构造列表,无需浪费多余的空间和不必要的生成新数组的操作.而LinkedList可以很轻松动态的增加元素(O(1)),所以没必要一开始就构造一个有很多元素的列表,到时需要的时候再按需加上去就行了.

## 五、添加元素

### 1. add(E e)

方法作用:将e添加到链表末尾,返回是否添加成功

```java
/**
* 添加指定元素到链表尾部
*/
public boolean add(E e) {
    linkLast(e);
    return true;
}
/**
* Links e as last element.将e添加到尾部
*/
void linkLast(E e) {
    //1. 暂记尾节点
    final Node<E> l = last;
    //2. 构建节点 前一个节点是之前的尾节点
    final Node<E> newNode = new Node<>(l, e, null);
    //3. 新建的节点是尾节点了
    last = newNode;
    //4. 判断之前链表是否为空  
    //为空则将新节点赋给头结点(相当于空链表插入第一个元素,头结点等于尾节点)
    //非空则将之前的尾节点指向新节点
    if (l == null)
        first = newNode;
    else
        l.next = newNode;
    //5. 链表长度增加
    size++;
    modCount++;
}
```

大体思路:

1. 构建一个新的节点
2. 将该新节点作为新的尾节点.如果是空链表插入第一个元素,那么头结点=尾节点=新节点;如果不是,那么将之前的尾节点指向新节点.
3. 增加链表长度

**小细节**
`boolean add(E e)`添加成功返回true,添加失败返回false.我们在代码中没有看到有返回false的情况啊,直接在代码中写了个返回true,什么判断条件都没有,啊??

![](http://olg7c0d2n.bkt.clouddn.com/18-4-20/58741120.jpg)

仔细想想,分配内存空间不是必须是连续的,所以只要是还能给它分配空间,就不会添加失败.当空间不够分配时(内存溢出),会抛出OutOfMemory.


### 2. addLast(E e)

方法作用:添加元素到末尾.  内部实现和`add(E e)`一样.

```java
public void addLast(E e) {
    linkLast(e);
}
```

### 3. addFirst(E e) 

方法作用:添加元素到链表头部

```java
public void addFirst(E e) {
    linkFirst(e);
}
/**
* 添加元素到链表头部
*/
private void linkFirst(E e) {
    //1. 记录头结点
    final Node<E> f = first;
    //2. 创建新节点  next指针指向之前的头结点
    final Node<E> newNode = new Node<>(null, e, f);
    //3. 新建的节点就是头节点了
    first = newNode;
    //4. 判断之前链表是否为空  
    //为空则将新节点赋给尾节点(相当于空链表插入第一个元素,头结点等于尾节点)
    //非空则将之前的头结点的prev指针指向新节点
    if (f == null)
        last = newNode;
    else
        f.prev = newNode;
    //5. 链表长度增加
    size++;
    modCount++;
}
```

大体思路:

1. 构建一个新的节点
2. 将该新节点作为新的头节点.如果是空链表插入第一个元素,那么头结点=尾节点=新节点;如果不是,那么将之前的头节点的prev指针指向新节点.
3. 增加链表长度

### 4. push(E e)

方法作用:添加元素到链表头部   这里的意思比拟压栈.和pop(出栈:移除链表第一个元素)相反.

内部实现是和`addFirst()`一样的.

```java
public void push(E e) {
    addFirst(e);
}
```

### 5. offer(),offerFirst(E e),offerLast(E e)

方法作用:添加元素到链表头部.  内部实现其实就是`add(e)`

```java
public boolean offer(E e) {
    return add(e);
}
public boolean offerFirst(E e) {
    addFirst(e);
    return true;
}

/**
* 添加元素到末尾
*/
public boolean offerLast(E e) {
    addLast(e);
    return true;
}
```

### 6. add(int index, E element)

方法作用:添加元素到指定位置,可能会抛出`IndexOutOfBoundsException`

```java
//添加元素到指定位置
public void add(int index, E element) {
    //1. 越界检查
    checkPositionIndex(index);

    //2. 判断一下index大小
    //如果是和list大小一样,那么就插入到最后
    //否则插入到index处
    if (index == size)
        linkLast(element);
    else
        linkBefore(element, node(index));
}

//检查是否越界
private void checkPositionIndex(int index) {
    if (!isPositionIndex(index))
        throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
}

/**
* Returns the (non-null) Node at the specified element index.
返回指定元素索引处的（非空）节点。
*/
Node<E> node(int index) {
    // assert isElementIndex(index);

    /**
    * 这里的思想非常巧妙,如果index在链表的前半部分,那么从first开始往后查找
    否则,从last往前面查找
    */
    //1. 如果index<size/2 ,即index在链表的前半部分
    if (index < (size >> 1)) {
        //2. 记录下第一个节点
        Node<E> x = first;
        //3. 循环从第一个节点开始往后查,直到到达index处,返回index处的元素
        for (int i = 0; i < index; i++)
            x = x.next;
        return x;
    } else {
        //index在链表的后半部分
        //4. 记录下最后一个节点
        Node<E> x = last;
        //5. 循环从最后一个节点开始往前查,直到到达index处,返回index处的元素
        for (int i = size - 1; i > index; i--)
            x = x.prev;
        return x;
    }
}
/**
* Links e as last element.
将e链接到list最后一个元素
*/
void linkLast(E e) {
    //1. 记录最后一个元素l
    final Node<E> l = last;
    //2. 构建一个新节点,数据为e,前一个是l,后一个是null
    final Node<E> newNode = new Node<>(l, e, null);
    //3. 现在新节点是最后一个元素了,所以需要记录下来
    last = newNode;
    //4. 如果之前list为空,那么first=last=newNode,只有一个元素
    if (l == null)
        first = newNode;
    else
        //5. 非空的话,那么将之前的最后一个指向新的节点
        l.next = newNode;
    //6. 链表长度+1
    size++;
    modCount++;
}

/**
* Inserts element e before non-null Node succ.
在非null节点succ之前插入元素e。
*/
void linkBefore(E e, Node<E> succ) {
    // assert succ != null;
    //1. 记录succ的前一个节点
    final Node<E> pred = succ.prev;
    //2. 构建一个新节点,数据是e,前一个节点是pred,下一个节点是succ
    final Node<E> newNode = new Node<>(pred, e, succ);
    //3. 将新节点作为succ的前一个节点
    succ.prev = newNode;
    //4. 判断pred是否为空
    //如果为空,那么说明succ是之前的头节点,现在新节点在succ的前面,所以新节点是头节点
    if (pred == null)
        first = newNode;
    else
        //5. succ的前一个节点不是空的话,那么直接将succ的前一个节点指向新节点就可以了
        pred.next = newNode;
    //6. 链表长度+1
    size++;
    modCount++;
}
```

大体思路:

1. 首先判断一下插入的位置是在链表的最后还是在链表中间.
2. 如果是插入到链表末尾,那么将之前的尾节点指向新节点
3. 如果是插入到链表中间
    1. 需要先找到链表中index索引处的节点.
    2. 将新节点赋值为index处节点的前一个节点
    3. 将index处节点的前一个节点的next指针赋值为新节点

> 哇,这里描述起来有点困难,,,,不知道我描述清楚没有.如果没看懂我的描述,看一下代码+再结合代码注释+画一下草图应该更清晰一些.

### 6. addAll(int index, Collection<? extends E> c)

方法作用:将指定集合的所有元素插入到index位置

```java
//将指定集合的所有元素插入到末尾位置
public boolean addAll(Collection<? extends E> c) {
    return addAll(size, c);
}

//将指定集合的所有元素插入到index位置
public boolean addAll(int index, Collection<? extends E> c) {
    //1. 入参合法性检查
    checkPositionIndex(index);

    //2. 将集合转成数组
    Object[] a = c.toArray();
    //3. 记录需要插入的集合元素个数
    int numNew = a.length;
    //4. 如果个数为0,那么插入失败,不继续执行了
    if (numNew == 0)
        return false;

    //5. 判断一下index与size是否相等
    //相等则插入到链表末尾
    //不相等则插入到链表中间  index处   
    Node<E> pred, succ;   
    if (index == size) {
        succ = null;
        pred = last;
    } else {
        //找到index索引处节点  这样就可以方便的拿到该节点的前后节点信息
        succ = node(index);
        //记录index索引处节点前一个节点
        pred = succ.prev;
    }

    //6. 循环将集合中所有元素连接到pred后面
    for (Object o : a) {
        @SuppressWarnings("unchecked") E e = (E) o;
        Node<E> newNode = new Node<>(pred, e, null);
        //如果前一个是空,那么将新节点作为头结点
        if (pred == null)
            first = newNode;
        else
            //指向新节点
            pred.next = newNode;
        pred = newNode;
    }

    //7. 判断succ是否为空
    //为空的话,那么集合的最后一个元素就是尾节点
    //非空的话,那么将succ连接到集合的最后一个元素后面
    if (succ == null) {
        last = pred;
    } else {
        pred.next = succ;
        succ.prev = pred;
    }

    //8. 链表长度+numNew
    size += numNew;
    modCount++;
    return true;
}
```

大体思路:

1. 将需要添加的集合转成数组a
2. 判断需要插入的位置index是否等于链表长度size,如果相等则插入到链表最后;如果不相等,则插入到链表中间,还需要找到index处节点succ,方便拿到该节点的前后节点信息.
3. 记录index索引处节点的前一个节点pred,循环将集合中所有元素连接到pred的后面
4. 将集合最后一个元素的next指针指向succ,将succ的prev指针指向集合的最后一个元素

## 六、删除元素

### 1. remove(),removeFirst()

方法作用: 移除链表第一个元素

```java
/**
* 移除链表第一个节点
*/
public E remove() {
    return removeFirst();
}

/**
* 移除链表第一个节点
*/
public E removeFirst() {
    final Node<E> f = first;
    //注意:如果之前是空链表,移除是要报错的哟
    if (f == null)
        throw new NoSuchElementException();
    return unlinkFirst(f);
}

/**
* Unlinks non-null first node f.
* 将第一个节点删掉
*/
private E unlinkFirst(Node<E> f) {
    // assert f == first && f != null;
    //1. 记录第一个节点的数据值
    final E element = f.item;
    //2. 记录下一个节点
    final Node<E> next = f.next;
    //3. 将第一个节点置空  帮助GC回收
    f.item = null;
    f.next = null; // help GC
    //4. 记录头节点
    first = next;
    //5. 如果下一个节点为空,那么链表无节点了    如果不为空,将头节点的prev指针置为空
    if (next == null)
        last = null;
    else
        next.prev = null;
    //6. 链表长度-1
    size--;
    modCount++;
    //7. 返回删除的节点的数据值
    return element;
}
```

大体思路:其实就是将第一个节点移除并置空,然后将第二个节点作为头节点.思路还是非常清晰的,主要是对细节的处理.

### 2. remove(int index)

方法作用:移除指定位置元素

```java
//移除指定位置元素
public E remove(int index) {
    //检查入参是否合法
    checkElementIndex(index);
    //node(index)找到index处的节点  
    return unlink(node(index));
}

//移除节点x
E unlink(Node<E> x) {
    // assert x != null;
    //1. 记录该节点数据值,前一个节点prev,后一个节点next
    final E element = x.item;
    final Node<E> next = x.next;
    final Node<E> prev = x.prev;

    //2. 判断前一个节点是否为空
    if (prev == null) {
        //为空的话,那么说明之前x节点是头节点  这时x的下一个节点成为头节点
        first = next;
    } else {
        //非空的话,将前一个节点的next指针指向x的下一个节点
        prev.next = next;
        //x的prev置为null
        x.prev = null;
    }

    //3. 判断x后一个节点是否为空
    if (next == null) {
        //为空的话,那么说明之前x节点是尾节点,这时x的前一个节点成为尾节点
        last = prev;
    } else {
        //为空的话,将x的下一个节点的prev指针指向prev(x的前一个节点)
        next.prev = prev;
        //x的next指针置空
        x.next = null;
    }

    //4. x节点数据值置空
    x.item = null;
    //5. 链表长度-1
    size--;
    modCount++;
    //6. 将x节点的数据值返回
    return element;
}
```

大体思路:
1. 首先找到index索引处的节点(这样就可以方便的获取该节点的前后节点),记为x
2. 记录x的前(prev)后(next)节点
3. 将x的前一个节点prev节点的next指针指向next,将x节点的后一个节点的prev指针指向prev节点.
4. 将x节点置空,链表长度-1

### 3. remove(Object o)

方法作用:从此链表中删除第一次出现的指定元素o

```java
public boolean remove(Object o) {
    //1. 判断o是否为空
    if (o == null) {
        //为null  循环,找第一个数据值为null的节点
        for (Node<E> x = first; x != null; x = x.next) {
            if (x.item == null) {
                //删除该节点
                unlink(x);
                return true;
            }
        }
    } else {
        //非空  循环,找第一个与o的数据值相等的节点
        for (Node<E> x = first; x != null; x = x.next) {
            if (o.equals(x.item)) {
                //删除该节点
                unlink(x);
                return true;
            }
        }
    }
    return false;
}
```

大体思路:

1. 首先判断入参是否为null
2. 如果为null,那么循环遍历链表,从头节点开始往后查找,找到第一个节点的数据值为null的,直接删除该节点.
3. 如果非null,那么循环遍历链表,从头节点开始往后查找,找到第一个节点的数据值为o的,直接删除该节点.

这里的循环遍历链表的代码,我觉得还是比较通用的,从头节点开始,通过不断的将x赋值为下一个元素,直到遍历到为null的地方结束,这样就完美的遍历完了链表所有节点.

### 4. removeFirstOccurrence(Object o)

方法作用:从此链表中删除第一次出现的指定元素o.  内部其实就是上面的remove(o);

```java
public boolean removeFirstOccurrence(Object o) {
    return remove(o);
}
```

### 5. removeLast()

方法作用:移除最后一个元素并返回

```java
public E removeLast() {
    final Node<E> l = last;
    //如果链表是空的,那么就要抛出一个错误
    if (l == null)
        throw new NoSuchElementException();
    return unlinkLast(l);
}
/**
* Unlinks non-null last node l.
移除链表最后一个元素
*/
private E unlinkLast(Node<E> l) {
    // assert l == last && l != null;

    //1. 记录尾节点数据值
    final E element = l.item;
    //2. 找到尾节点的前一个节点prev
    final Node<E> prev = l.prev;
    //3. 将尾节点置空  方便GC
    l.item = null;
    l.prev = null; // help GC
    //4. 将last赋值为prev  
    last = prev;
    //5. 判断prev是否为null
    //为空的话,说明之前链表就只有1个节点,现在删了之后,头节点和尾节点都为null了
    //非空,直接将新任尾节点的next指针指向null
    if (prev == null)
        first = null;
    else
        prev.next = null;
    //6. 链表长度-1
    size--;
    modCount++;
    //7. 返回之前尾节点数据值
    return element;
}
```

大体思路:

1. 判断链表是否有节点, 没有节点直接抛错误....
2. 首先找到倒数第二个节点(可能没有哈,没有的话,说明链表只有一个节点)prev
3. 然后将尾节点置空,prev的next指针指向null

### 6. removeLastOccurrence(Object o)


方法作用:从此链表中删除最后一次出现的指定元素o.    

实现:其实和上面的remove(o)是一样的,只不过这里遍历时是从尾节点开始往前查找的.

```java
public boolean removeLastOccurrence(Object o) {
    if (o == null) {
        for (Node<E> x = last; x != null; x = x.prev) {
            if (x.item == null) {
                unlink(x);
                return true;
            }
        }
    } else {
        for (Node<E> x = last; x != null; x = x.prev) {
            if (o.equals(x.item)) {
                unlink(x);
                return true;
            }
        }
    }
    return false;
}
```

### 7. poll()

方法作用:获取第一个元素的同时删除第一个元素,当链表无节点时,不会报错.  这里的unlinkFirst()上面已分析过.

```java
public E poll() {
    final Node<E> f = first;
    return (f == null) ? null : unlinkFirst(f);
}
```

### 8. pop()

方法作用:获取第一个元素的同时删除第一个元素,当链表无节点时,会报错.

```java
public E pop() {
    return removeFirst();
}
public E removeFirst() {
    final Node<E> f = first;
    if (f == null)
        throw new NoSuchElementException();
    return unlinkFirst(f);
}

```

## 七、修改元素

### 1. set(int index, E element) 

方法作用:设置index处节点数据值为element

```java
public E set(int index, E element) {
    //1. 入参检测
    checkElementIndex(index);
    //2. 找到index处节点,上面已分析该方法
    Node<E> x = node(index);
    //3. 保存该节点旧值
    E oldVal = x.item;
    //4. 替换为新值
    x.item = element;
    //5. 将旧值返回
    return oldVal;
}
```

大体思路:非常简单,就是首先找到index处节点,替换该节点数据值


## 八、查询元素

### 1. element()

方法作用:获取链表第一个元素.   方法比较简单,就是将链表头节点数据值进行返回

```java
public E element() {
    return getFirst();
}
public E getFirst() {
    final Node<E> f = first;
    if (f == null)
        throw new NoSuchElementException();
    return f.item;
}
```

### 2. get(int index)

方法作用:获取指定索引处元素.   方法比较简单,就是通过node(index)找到index索引处节点,然后返回其数据值

```java
public E get(int index) {
    //1. 入参检测
    checkElementIndex(index);
    //2. 获取指定索引处节点数据值
    return node(index).item;
}
```

### 3. getFirst()

方法作用:获取链表第一个元素.   非常简单,就是将first的数据值返回

```java
public E getFirst() {
    final Node<E> f = first;
    if (f == null)
        throw new NoSuchElementException();
    return f.item;
}
```

### 4. getLast()

方法作用:获取链表最后一个元素.   非常简单,就是将last的数据值返回

```java
public E getLast() {
    final Node<E> l = last;
    if (l == null)
        throw new NoSuchElementException();
    return l.item;
}
```

### 5. 通过listIterator()遍历

> 这也是查询的一种,哈哈

我们先来看看`listIterator(int index)`方法,就是new了一个ListItr进行返回.ListItr是LinkedList的内部类.

```java
public ListIterator<E> listIterator(int index) {
    checkPositionIndex(index);
    return new ListItr(index);
}
```

接下来,我们看看这个内部类:

```java
private class ListItr implements ListIterator<E> {
    //上一次返回的节点
    private Node<E> lastReturned;
    //下一个节点
    private Node<E> next;
    //下一个节点索引
    private int nextIndex;
    private int expectedModCount = modCount;

    ListItr(int index) {
        // assert isPositionIndex(index);
        //如果是最后一个节点,那么返回next是null    
        //如果不是最后一个节点,那么找到该index索引处节点
        next = (index == size) ? null : node(index);
        nextIndex = index;
    }

    public boolean hasNext() {
        //判断是否还有下一个元素
        return nextIndex < size;
    }

    //获取下一个元素
    public E next() {
        checkForComodification();
        //1. 如果没有下一个元素   抛异常
        if (!hasNext())
            throw new NoSuchElementException();

        //2. 记录上一次遍历到的节点
        lastReturned = next;
        //3. 往后移
        next = next.next;
        //4. 索引+1
        nextIndex++;
        //5. 将遍历到的节点数据值返回
        return lastReturned.item;
    }

    public boolean hasPrevious() {
        //判断是否还有前一个元素
        return nextIndex > 0;
    }

    //获取前一个元素
    public E previous() {
        checkForComodification();
        //1. 如果没有前一个元素,则抛异常
        if (!hasPrevious())
            throw new NoSuchElementException();

        //2. 当next是null的时候,赋值为last     
        //不是null的时候,往前移动
        lastReturned = next = (next == null) ? last : next.prev;
        //3. index-1  因为是往前
        nextIndex--;
        //4. 将遍历到的节点数据值返回
        return lastReturned.item;
    }

    public int nextIndex() {
        return nextIndex;
    }

    public int previousIndex() {
        return nextIndex - 1;
    }

    //移除当前遍历到的元素
    public void remove() {
        checkForComodification();
        //1. 移除当前遍历到的元素为null,直接抛错误
        if (lastReturned == null)
            throw new IllegalStateException();

        //2. 记录当前节点的下一个节点
        Node<E> lastNext = lastReturned.next;
        //3. 删除当前节点
        unlink(lastReturned);
        //4. 如果next == lastReturned,说明当前是从前往后遍历的,那么将next赋值为下一个节点
        //如果不相等,那么说明是从后往前遍历的,这时只需要将index-1就行了
        if (next == lastReturned)
            next = lastNext;
        else
            nextIndex--;
        //5. 将移除的节点置空
        lastReturned = null;
        expectedModCount++;
    }

    //设置当前正在遍历的节点的值   啥?用ListIterator居然可以在遍历的时候修改值,,666
    public void set(E e) {
        if (lastReturned == null)
            throw new IllegalStateException();
        checkForComodification();
        //设置当前遍历的节点的值
        lastReturned.item = e;
    }

    //添加一个值
    public void add(E e) {
        checkForComodification();
        lastReturned = null;
        //如果next为null,那么添加到最后
        //否则,将e元素添加到next的前面
        if (next == null)
            linkLast(e);
        else
            linkBefore(e, next);
        nextIndex++;
        expectedModCount++;
    }

    public void forEachRemaining(Consumer<? super E> action) {
        Objects.requireNonNull(action);
        //循环 往后遍历   没遍历一个节点就回调当前节点的数据值
        while (modCount == expectedModCount && nextIndex < size) {
            action.accept(next.item);
            lastReturned = next;
            next = next.next;
            nextIndex++;
        }
        checkForComodification();
    }

    //判断一下该列表是否被其他线程改过(在迭代过程中)   修改过则抛异常
    final void checkForComodification() {
        if (modCount != expectedModCount)
            throw new ConcurrentModificationException();
    }
}
```

**这里的ListIterator有点强**

- ListIterator只能用于List及其子类型。
- 有add()方法,可以往链表中添加对象
- 可以通过hasNext()和next()往后顺序遍历,也可以通过hasPrevious()和previous()实现往前遍历
- 可以通过nextIndex()和previousIndex()返回当前索引处的位置
- 可以通过set()实现当前遍历对象的修改

## 九、总结

好了,又到了总结的时候,相信各位认真看完的应该对链表的基本操作非常熟悉了.

下面我们来总结一下LinkedList的关键点

**LinkedList关键点**

- 底层是双向链表存储数据,并且记录了头节点和尾节点
- 添加元素非常快,如果是添加到头部和尾部的话更快,因为已经记录了头节点和尾节点,只需要链接一下就行了. 如果是添加到链表的中间部分的话,那么多一步操作,需要先找到添加索引处的元素(因为需要链接到这里),才能进行添加.
- 遍历的时候,建议采用forEach()进行遍历,这样可以在每次获取下一个元素时都非常轻松(`next = next.next;`).  然后如果是通过`fori`和`get(i)`的方式进行遍历的话,效率是极低的,每次`get(i)`都需要从最前面(或者最后面)开始往后查找i索引处的元素,效率很低.
- 删除也是非常快,只需要改动一下指针就行了,代价很小.
