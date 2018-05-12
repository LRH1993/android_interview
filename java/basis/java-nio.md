### 一、NIO的概念

Java NIO\(New IO\)是一个可以替代标准Java IO API的IO API\(从Java1.4开始\)，Java NIO提供了与标准IO不同的IO工作方式。

所以Java NIO是一种新式的IO标准，与之间的普通IO的工作方式不同。标准的IO基于字节流和字符流进行操作的，而NIO是基于通道\(Channel\)和缓冲区\(Buffer\)进行操作，数据总是从通道读取到缓冲区中，或者从缓冲区写入通道也类似。

**由上面的定义就说明NIO是一种新型的IO，但NIO不仅仅就是等于Non-blocking IO（非阻塞IO），NIO中有实现非阻塞IO的具体类，但不代表NIO就是Non-blocking IO（非阻塞IO）。**

Java NIO 由以下几个核心部分组成：

 - Buffer  
 - Channel  
 - Selector

传统的IO操作面向数据流，意味着每次从流中读一个或多个字节，直至完成，数据没有被缓存在任何地方。NIO操作面向缓冲区，数据从Channel读取到Buffer缓冲区，随后在Buffer中处理数据。

### 二、Buffer的使用

##### 利用Buffer读写数据，通常遵循四个步骤：

1. 把数据写入buffer；  
2. 调用flip；  
3. 从Buffer中读取数据；  
4. 调用buffer.clear\(\)

当写入数据到buffer中时，buffer会记录已经写入的数据大小。当需要读数据时，通过flip\(\)方法把buffer从写模式调整为读模式；在读模式下，可以读取所有已经写入的数据。

当读取完数据后，需要清空buffer，以满足后续写入操作。清空buffer有两种方式：调用clear\(\)，一旦读完Buffer中的数据，需要让Buffer准备好再次被写入，clear会恢复状态值，但不会擦除数据。

##### Buffer的容量，位置，上限（Buffer Capacity, Position and Limit）

buffer缓冲区实质上就是一块内存，用于写入数据，也供后续再次读取数据。这块内存被NIO Buffer管理，并提供一系列的方法用于更简单的操作这块内存。

一个Buffer有三个属性是必须掌握的，分别是：  

 - capacity容量  
 - position位置  
 - limit限制

position和limit的具体含义取决于当前buffer的模式。capacity在两种模式下都表示容量。  
下面有张示例图，描诉了不同模式下position和limit的含义：  
![buffers-modes.png](http://upload-images.jianshu.io/upload_images/3985563-74b53331f13ac591.png?imageMogr2/auto-orient/strip|imageView2/2/w/1240)

**容量（Capacity）**

作为一块内存，buffer有一个固定的大小，叫做capacity容量。也就是最多只能写入容量值得字节，整形等数据。一旦buffer写满了就需要清空已读数据以便下次继续写入新的数据。

**位置（Position）**

当写入数据到Buffer的时候需要中一个确定的位置开始，默认初始化时这个位置position为0，一旦写入了数据比如一个字节，整形数据，那么position的值就会指向数据之后的一个单元，position最大可以到capacity-1。  
当从Buffer读取数据时，也需要从一个确定的位置开始。buffer从写入模式变为读取模式时，position会归零，每次读取后，position向后移动。

**上限（Limit）**  
在写模式，limit的含义是我们所能写入的最大数据量。它等同于buffer的容量。  
一旦切换到读模式，limit则代表我们所能读取的最大数据量，他的值等同于写模式下position的位置。  
数据读取的上限时buffer中已有的数据，也就是limit的位置（原position所指的位置）。

##### 分配一个Buffer（Allocating a Buffer）

为了获取一个Buffer对象，你必须先分配。每个Buffer实现类都有一个allocate\(\)方法用于分配内存。下面看一个实例,开辟一个48字节大小的buffer：

```java
ByteBuffer buf = ByteBuffer.allocate(48);
```

开辟一个1024个字符的CharBuffer：

```java
CharBuffer buf = CharBuffer.allocate(1024);
```

##### Buffer的实现类

![](http://upload-images.jianshu.io/upload_images/3985563-0f18367164c56cbd.png?imageMogr2/auto-orient/strip|imageView2/2/w/1240)  
其中MappedByteBuffer比较特殊。Java类库中的NIO包相对于IO 包来说有一个新功能是内存映射文件，日常编程中并不是经常用到，但是在处理大文件时是比较理想的提高效率的手段。其中MappedByteBuffer实现的就是内存映射文件，可以实现大文件的高效读写。 可以参考这两篇文章理解： [\[Java\]\[IO\]JAVA NIO之浅谈内存映射文件原理与DirectMemory](http://blog.csdn.net/szwangdf/article/details/10588489)，[深入浅出MappedByteBuffer](http://www.jianshu.com/p/f90866dcbffc)。

### 三、Channel的使用

Java NIO Channel通道和流非常相似，主要有以下几点区别：

 - 通道可以读也可以写，流一般来说是单向的（只能读或者写）。  
 - 通道可以异步读写。  
 - 通道总是基于缓冲区Buffer来读写。  
 - 正如上面提到的，我们可以从通道中读取数据，写入到buffer；也可以中buffer内读数据，写入到通道中。下面有个示意图：  
![](http://upload-images.jianshu.io/upload_images/3985563-5dcaaf9b7106a7d9.png?imageMogr2/auto-orient/strip|imageView2/2/w/1240)

##### Channel的实现类有：

 - FileChannel  
 - DatagramChannel  
 - SocketChannel  
 - ServerSocketChannel  

还有一些异步IO类，后面有介绍。

FileChannel用于文件的数据读写。 DatagramChannel用于UDP的数据读写。 SocketChannel用于TCP的数据读写。 ServerSocketChannel允许我们监听TCP链接请求，每个请求会创建会一个SocketChannel。

##### Channel使用实例

```java
RandomAccessFile aFile = new RandomAccessFile("data/nio-data.txt", "rw");
    FileChannel inChannel = aFile.getChannel();

    ByteBuffer buf = ByteBuffer.allocate(48);

    int bytesRead = inChannel.read(buf);
    while (bytesRead != -1) {

      System.out.println("Read " + bytesRead);
      buf.flip();

      while(buf.hasRemaining()){
          System.out.print((char) buf.get());
      }

      buf.clear();
      bytesRead = inChannel.read(buf);
    }
    aFile.close();
```

上面介绍了NIO中的两个关键部分Buffer/Channel，对于Selector的介绍，先放一放，先介绍阻塞/非阻塞/同步/非同步的关系。

### 四、阻塞/非阻塞/同步/非同步的关系

为什么要介绍这四者的关系，就是因为Selector是对于多个非阻塞IO流的调度器，通过Selector来实现读写操作。所以有必要理解一下什么是阻塞/非阻塞？

本文讨论的背景是UNIX环境下的network IO。本文最重要的参考文献是Richard Stevens的“**UNIX® Network Programming Volume 1, Third Edition: The Sockets Networking** ”，6.2节“**I/O Models** ”，Stevens在这节中详细说明了各种IO的特点和区别。

Stevens在文章中一共比较了五种IO Model：  

 - blocking IO  
 - nonblocking IO  
 - IO multiplexing  
 - signal driven IO  
 - asynchronous IO。

由于signal driven IO在实际中并不常用，所以我这只提及剩下的四种IO Model。再说一下IO发生时涉及的对象和步骤。对于一个network IO \(这里我们以read举例\)，它会涉及到两个系统对象，一个是调用这个IO的process \(or thread\)，另一个就是系统内核\(kernel\)。

当一个read操作发生时，它会经历两个阶段：   
**1 等待数据准备 \(Waiting for the data to be ready\)**  
**2 将数据从内核拷贝到进程中 \(Copying the data from the kernel to the process\)**

记住这两点很重要，因为这些IO Model的区别就是在两个阶段上各有不同的情况。

**blocking IO**

在UNIX中，默认情况下所有的socket都是blocking，一个典型的读操作流程大概是这样：  
![](http://upload-images.jianshu.io/upload_images/3985563-0346e2299ba48238.gif?imageMogr2/auto-orient/strip|imageView2/2/w/1240)

当用户进程调用了recvfrom这个系统调用，kernel就开始了IO的第一个阶段：准备数据。对于network io来说，很多时候数据在一开始还没有到达（比如，还没有收到一个完整的UDP包），这个时候kernel就要等待足够的数据到来。而在用户进程这边，整个进程会被阻塞。当kernel一直等到数据准备好了，它就会将数据从kernel中拷贝到用户内存，然后kernel返回结果，用户进程才解除block的状态，重新运行起来。**所以，blocking IO的特点就是在IO执行的两个阶段都被block了。**

**non-blocking IO**

UNIX下，可以通过设置socket使其变为non-blocking。当对一个non-blocking socket执行读操作时，流程是这个样子：  
![](http://upload-images.jianshu.io/upload_images/3985563-e25734b5710ad5c2.gif?imageMogr2/auto-orient/strip|imageView2/2/w/1240)  
从图中可以看出，当用户进程发出read操作时，如果kernel中的数据还没有准备好，那么它并不会block用户进程，而是立刻返回一个error。从用户进程角度讲 ，它发起一个read操作后，并不需要等待，而是马上就得到了一个结果。用户进程判断结果是一个error时，它就知道数据还没有准备好，于是它可以再次发送read操作。**一旦kernel中的数据准备好了，并且又再次收到了用户进程的system call，那么它马上就将数据拷贝到了用户内存，然后返回。所以，用户进程其实是需要不断的主动询问kernel数据好了没有。**

**IO multiplexing**

IO multiplexing这个词可能有点陌生，但是如果我说select，epoll，大概就都能明白了。有些地方也称这种IO方式为event driven IO。我们都知道，select/epoll的好处就在于单个process就可以同时处理多个网络连接的IO。它的基本原理就是select/epoll这个function会不断的轮询所负责的所有socket，当某个socket有数据到达了，就通知用户进程。它的流程如图：  
![](http://upload-images.jianshu.io/upload_images/3985563-989498cf42790083.gif?imageMogr2/auto-orient/strip|imageView2/2/w/1240)

当用户进程调用了select，那么整个进程会被block，而同时，kernel会“监视”所有select负责的socket，当任何一个socket中的数据准备好了，select就会返回。这个时候用户进程再调用read操作，将数据从kernel拷贝到用户进程。

这个图和blocking IO的图其实并没有太大的不同，事实上，还更差一些。因为这里需要使用两个system call \(select 和 recvfrom\)，而blocking IO只调用了一个system call \(recvfrom\)。但是，用select的优势在于它可以同时处理多个connection。（多说一句。所以，如果处理的连接数不是很高的话，使用select/epoll的web server不一定比使用multi-threading + blocking IO的web server性能更好，可能延迟还更大。select/epoll的优势并不是对于单个连接能处理得更快，而是在于能处理更多的连接。）

在IO multiplexing Model中，**实际中，对于每一个socket，一般都设置成为non-blocking，**但是，如上图所示，整个用户的process其实是一直被block的。**只不过process是被select这个函数block，而不是被socket IO给block。**

**Asynchronous I/O**

UNIX下的asynchronous IO其实用得很少。先看一下它的流程：  
![](http://upload-images.jianshu.io/upload_images/3985563-39b98967390db195.gif?imageMogr2/auto-orient/strip|imageView2/2/w/1240)  
**用户进程发起read操作之后，立刻就可以开始去做其它的事。** 而另一方面，从kernel的角度，当它受到一个asynchronous read之后，首先它会立刻返回，所以不会对用户进程产生任何block。**然后，kernel会等待数据准备完成，然后将数据拷贝到用户内存，当这一切都完成之后，kernel会给用户进程发送一个signal，告诉它read操作完成了。**

到目前为止，已经将四个IO Model都介绍完了。现在回过头来回答最初的那几个问题：

**blocking和non-blocking的区别在哪，synchronous IO和asynchronous IO的区别在哪？**

先回答最简单的这个：blocking vs non-blocking。前面的介绍中其实已经很明确的说明了这两者的区别。调用blocking IO会一直block住对应的进程直到操作完成，而non-blocking IO在kernel还准备数据的情况下会立刻返回。

在说明synchronous IO和asynchronous IO的区别之前，需要先给出两者的定义。Stevens给出的定义（其实是POSIX的定义）是这样子的：  
**A synchronous I/O operation causes the requesting process to be blocked until that I/O operationcompletes;    An asynchronous I/O operation does not cause the requesting process to be blocked;**

两者的区别就在于synchronous IO做”IO operation”的时候会将process阻塞。

按照这个定义，之前所述的**blocking IO，non-blocking IO，IO multiplexing都属于synchronous IO。**

有人可能会说，non-blocking IO并没有被block啊。这里有个非常“狡猾”的地方，定义中所指的”IO operation”是指真实的IO操作，就是例子中的recvfrom这个system call。non-blocking IO在执行recvfrom这个system call的时候，如果kernel的数据没有准备好，这时候不会block进程。但是，当kernel中数据准备好的时候，recvfrom会将数据从kernel拷贝到用户内存中，这个时候进程是被block了，在这段时间内，进程是被block的。而asynchronous IO则不一样，当进程发起IO 操作之后，就直接返回再也不理睬了，直到kernel发送一个信号，告诉进程说IO完成。在这整个过程中，进程完全没有被block。

各个IO Model的比较如图所示：  
![](http://upload-images.jianshu.io/upload_images/3985563-3f7ade558f749a61.gif?imageMogr2/auto-orient/strip|imageView2/2/w/1240)

经过上面的介绍，会发现non-blocking IO和asynchronous IO的区别还是很明显的。在non-blocking IO中，虽然进程大部分时间都不会被block，但是它仍然要求进程去主动的check，并且当数据准备完成以后，也需要进程主动的再次调用recvfrom来将数据拷贝到用户内存。而asynchronous IO则完全不同。它就像是用户进程将整个IO操作交给了他人（kernel）完成，然后他人做完后发信号通知。在此期间，用户进程不需要去检查IO操作的状态，也不需要主动的去拷贝数据。

### 五、NIO中的blocking IO/nonblocking IO/IO multiplexing/asynchronous IO

上面讲完了IO中的几种模式，虽然是基于UNIX环境下，具体操作系统的知识个人认识很浅，下面就说下自己的个人理解，不对的地方欢迎指正。

首先，标准的IO显然属于blocking IO。

其次，NIO中的实现了SelectableChannel类的对象，可以通过如下方法设置是否支持非阻塞模式：

> SelectableChannel configureBlocking\(boolean block\)：调整此通道的阻塞模式。

如果为 true，则此通道将被置于阻塞模式；如果为 false，则此通道将被置于非阻塞模式   
设置为false的NIO类将是nonblocking IO。

再其次，通过Selector监听实现多个NIO对象的读写操作，显然属于IO multiplexing。关于Selector，其负责调度多个非阻塞式IO，当有其感兴趣的读写操作到来时，再执行相应的操作。Selector执行select\(\)方法来进行轮询查找是否到来了读写操作，这个过程是阻塞的，具体详细使用下面介绍。

最后，在Java 7中增加了asynchronous IO，具体结构和实现类框架如下：

![](http://upload-images.jianshu.io/upload_images/3985563-9c964a961f51edd2.png?imageMogr2/auto-orient/strip|imageView2/2/w/1240)  
篇幅有限，具体使用可以看这篇文章：[Java 学习之路 之 基于TCP协议的网络编程（八十二）](http://www.ithao123.cn/content-7365943.html)。

### 六、Selector使用

Selector是Java NIO中的一个组件，用于检查一个或多个NIO Channel的状态是否处于可读、可写。如此可以实现单线程管理多个channels,也就是可以管理多个网络链接。

通过上面的了解我们知道Selector是一种IO multiplexing的情况。

下面这幅图描述了单线程处理三个channel的情况：  
![](http://upload-images.jianshu.io/upload_images/3985563-e4e2f7a65dd0ce80.png?imageMogr2/auto-orient/strip|imageView2/2/w/1240)

##### 创建Selector\(Creating a Selector\)。创建一个Selector可以通过Selector.open\(\)方法：

```java
Selector selector = Selector.open();
```

##### 注册Channel到Selector上：

```java
channel.configureBlocking(false);
SelectionKey key = channel.register(selector, SelectionKey.OP_READ);
```

Channel必须是非阻塞的。上面对IO multiplexing的图解中可以看出。所以FileChannel不适用Selector，因为FileChannel不能切换为非阻塞模式。Socket channel可以正常使用。

**注意register的第二个参数，这个参数是一个“关注集合”，代表我们关注的channel状态，有四种基础类型可供监听：**

 - Connect  
 - Accept  
 - Read  
 - Write

**一个channel触发了一个事件也可视作该事件处于就绪状态。**

因此当channel与server连接成功后，那么就是“Connetct”状态。server channel接收请求连接时处于“Accept”状态。channel有数据可读时处于“Read”状态。channel可以进行数据写入时处于“Writer”状态。当注册到Selector的所有Channel注册完后，调用Selector的select\(\)方法，将会不断轮询检查是否有以上设置的状态产生，如果产生便会加入到SelectionKey集合中，进行后续操作。

上述的四种就绪状态用SelectionKey中的常量表示如下：

 - SelectionKey.OP\_CONNECT  
 - SelectionKey.OP\_ACCEPT  
 - SelectionKey.OP\_READ  
 - SelectionKey.OP\_WRITE

如果对多个事件感兴趣可利用位的或运算结合多个常量，比如：

int interestSet = SelectionKey.OP\_READ \| SelectionKey.OP\_WRITE;

##### 从Selector中选择channel\(Selecting Channels via a Selector\)

一旦我们向Selector注册了一个或多个channel后，就可以调用select来获取channel。select方法会返回所有处于就绪状态的channel。

select方法具体如下：

> int select\(\)  
> int select\(long timeout\)  
> int selectNow\(\)

select\(\)方法在返回channel之前处于阻塞状态。 select\(long timeout\)和select做的事一样，不过他的阻塞有一个超时限制。

selectNow\(\)不会阻塞，根据当前状态立刻返回合适的channel。

select\(\)方法的返回值是一个int整形，代表有多少channel处于就绪了。也就是自上一次select后有多少channel进入就绪。

举例来说，假设第一次调用select时正好有一个channel就绪，那么返回值是1，并且对这个channel做任何处理，接着再次调用select，此时恰好又有一个新的channel就绪，那么返回值还是1，现在我们一共有两个channel处于就绪，但是在每次调用select时只有一个channel是就绪的。

##### selectedKeys\(\)

在调用select并返回了有channel就绪之后，可以通过选中的key集合来获取channel，这个操作通过调用selectedKeys\(\)方法：

```java
Set<SelectionKey> selectedKeys = selector.selectedKeys();
```

遍历这些SelectionKey可以通过如下方法：

```java
Set<SelectionKey> selectedKeys = selector.selectedKeys();

Iterator<SelectionKey> keyIterator = selectedKeys.iterator();

while(keyIterator.hasNext()) {

    SelectionKey key = keyIterator.next();

    if(key.isAcceptable()) {
        // a connection was accepted by a ServerSocketChannel.

    } else if (key.isConnectable()) {
        // a connection was established with a remote server.

    } else if (key.isReadable()) {
        // a channel is ready for reading

    } else if (key.isWritable()) {
        // a channel is ready for writing
    }

    keyIterator.remove();
}
```

上述循环会迭代key集合，针对每个key我们单独判断他是处于何种就绪状态。

注意keyIterater.remove\(\)方法的调用，Selector本身并不会移除SelectionKey对象，这个操作需要我们手动执行。当下次channel处于就绪是，Selector任然会把这些key再次加入进来。

SelectionKey.channel返回的channel实例需要强转为我们实际使用的具体的channel类型，例如ServerSocketChannel或SocketChannel.

##### wakeUp\(\)

由于调用select而被阻塞的线程，可以通过调用Selector.wakeup\(\)来唤醒即便此时已然没有channel处于就绪状态。具体操作是，在另外一个线程调用wakeup，被阻塞与select方法的线程就会立刻返回。

##### close\(\)

当操作Selector完毕后，需要调用close方法。close的调用会关闭Selector并使相关的SelectionKey都无效。channel本身不管被关闭。

##### 完整的Selector案例

这有一个完整的案例，首先打开一个Selector,然后注册channel，最后调用select\(\)获取感兴趣的操作：

```java
Selector selector = Selector.open();

channel.configureBlocking(false);

SelectionKey key = channel.register(selector, SelectionKey.OP_READ);

while(true) {

  int readyChannels = selector.select();

  if(readyChannels == 0) continue;

  Set<SelectionKey> selectedKeys = selector.selectedKeys();

  Iterator<SelectionKey> keyIterator = selectedKeys.iterator();

  while(keyIterator.hasNext()) {

    SelectionKey key = keyIterator.next();

    if(key.isAcceptable()) {
        // a connection was accepted by a ServerSocketChannel.

    } else if (key.isConnectable()) {
        // a connection was established with a remote server.

    } else if (key.isReadable()) {
        // a channel is ready for reading

    } else if (key.isWritable()) {
        // a channel is ready for writing
    }

    keyIterator.remove();
  }
}
```



