### 一、线程同步问题的产生及解决方案

**问题的产生：**

Java允许多线程并发控制，当多个线程同时操作一个可共享的资源变量时（如数据的增删改查），将会导致数据不准确，相互之间产生冲突。

如下例：假设有一个卖票系统，一共有100张票，有4个窗口同时卖。

``` java
public class Ticket implements Runnable {
    // 当前拥有的票数
    private int num = 100;

    public void run() {
        while (true) {
            if (num > 0) {
                try {
                    Thread.sleep(10);
                } catch (InterruptedException e) {
                }
                // 输出卖票信息
                System.out.println(Thread.currentThread().getName() + ".....sale...." + num--);
            }
        }
    }
}
```

``` java
public class Nothing {

    public static void main(String[] args) {
        Ticket t = new Ticket();//创建一个线程任务对象。
        //创建4个线程同时卖票
        Thread t1 = new Thread(t);
        Thread t2 = new Thread(t);
        Thread t3 = new Thread(t);
        Thread t4 = new Thread(t);
        //启动线程
        t1.start();
        t2.start();
        t3.start();
        t4.start();
    }
}
```

输出部分结果：
>Thread-1.....sale....2
><br>Thread-0.....sale....3
><br>Thread-2.....sale....1
><br>Thread-0.....sale....0
><br>Thread-1.....sale....0
><br>Thread-3.....sale....1

显然上述结果是不合理的，对于同一张票进行了多次售出。这就是多线程情况下，出现了数据“**脏读**”情况。即多个线程访问余票num时，当一个线程获得余票的数量，要在此基础上进行-1的操作之前，其他线程可能已经卖出多张票，导致获得的num不是最新的，然后-1后更新的数据就会有误。这就需要线程同步的实现了。

**问题的解决：**

因此加入同步锁以避免在该线程没有完成操作之前，被其他线程的调用，从而保证了该变量的唯一性和准确性。

一共有两种锁，来实现线程同步问题，分别是：`synchronized`和`ReentrantLock`。下面我们就带着上述问题，看看这两种锁是如何解决的。

#### 二、synchronized关键字

##### 1.synchronized简介

1. synchronized实现同步的基础：Java中每个对象都可以作为锁。当线程试图访问同步代码时，必须先获得**对象锁**，退出或抛出异常时必须释放锁。
2. Synchronzied实现同步的表现形式分为：**代码块同步** 和 **方法同步**。

##### 2.synchronized原理

JVM基于进入和退出`Monitor`对象来实现 **代码块同步** 和 **方法同步** ，两者实现细节不同。

**代码块同步：** 在编译后通过将`monitorenter`指令插入到同步代码块的开始处，将`monitorexit`指令插入到方法结束处和异常处，通过反编译字节码可以观察到。任何一个对象都有一个`monitor`与之关联，线程执行`monitorenter`指令时，会尝试获取对象对应的`monitor`的所有权，即尝试获得对象的锁。

**方法同步：** synchronized方法在`method_info结构`有`ACC_synchronized`标记，线程执行时会识别该标记，获取对应的锁，实现方法同步。

两者虽然实现细节不同，但本质上都是对一个对象的监视器（monitor）的获取。**任意一个对象都拥有自己的监视器**，当同步代码块或同步方法时，执行方法的线程必须先获得该对象的监视器才能进入同步块或同步方法，没有获取到监视器的线程将会被阻塞，并进入同步队列，状态变为`BLOCKED`。当成功获取监视器的线程释放了锁后，会唤醒阻塞在同步队列的线程，使其重新尝试对监视器的获取。

**对象、监视器、同步队列和执行线程间的关系如下图：**

![](http://upload-images.jianshu.io/upload_images/3985563-c38812d8f45810dc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

##### 3.synchronized的使用场景

**①方法同步**

``` java
public synchronized void method1
```

锁住的是该对象,类的其中一个实例，当该对象(仅仅是这一个对象)在不同线程中执行这个同步方法时，线程之间会形成互斥。达到同步效果，但如果不同线程同时对该类的不同对象执行这个同步方法时，则线程之间不会形成互斥，因为他们拥有的是不同的锁。

**②代码块同步**

``` java
synchronized(this){ //TODO }
```

描述同①

**③方法同步**

``` java
public synchronized static void method3
```

锁住的是该类，当所有该类的对象(多个对象)在不同线程中调用这个static同步方法时，线程之间会形成互斥，达到同步效果。

**④代码块同步**
```
synchronized(Test.class){ //TODO}
```
同③

**⑤代码块同步**
```
synchronized(o) {}
```
这里面的o可以是一个任何Object对象或数组，并不一定是它本身对象或者类，谁拥有o这个锁，谁就能够操作该块程序代码。

##### 4.解决线程同步的实例

针对上述方法，具体的解决方式如下：

``` java
public class Ticket implements Runnable {
    // 当前拥有的票数
    private int num = 100;

    public void run() {
        while (true) {
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
            }
            synchronized (this) {
                // 输出卖票信息
                if (num > 0) {
                    System.out.println(Thread.currentThread().getName() + ".....sale...." + num--);
                }

            }
        }
    }
}
```
输出部分结果：
>Thread-2.....sale....10
><br>Thread-1.....sale....9
><br>Thread-3.....sale....8
><br>Thread-0.....sale....7
><br>Thread-2.....sale....6
><br>Thread-1.....sale....5
><br>Thread-2.....sale....4
><br>Thread-1.....sale....3
><br>Thread-3.....sale....2
><br>Thread-0.....sale....1

可以看出实现了线程同步。同时改了一下逻辑，在进入到同步代码块时，先判断现在是否有没有票，然后再买票，防止出现没票还要售出的情况。通过同步代码块实现了线程同步，其他方法也一样可以实现该效果。

### 三、ReentrantLock锁

ReentrantLock，一个可重入的互斥锁，它具有与使用synchronized方法和语句所访问的隐式监视器锁相同的一些基本行为和语义，但功能更强大。（重入锁后面介绍）

##### 1.Lock接口

Lock，锁对象。在Java中锁是用来控制多个线程访问共享资源的方式，一般来说，一个锁能够防止多个线程同时访问共享资源（但有的锁可以允许多个线程并发访问共享资源，比如读写锁，后面我们会分析）。在Lock接口出现之前，Java程序是靠`synchronized`关键字（后面分析）实现锁功能的，而JAVA SE5.0之后并发包中新增了`Lock`接口用来实现锁的功能，它提供了与`synchronized`关键字类似的同步功能，只是在使用时需要显式地获取和释放锁，缺点就是缺少像`synchronized`那样隐式获取释放锁的便捷性，但是却拥有了锁获取与释放的可操作性，可中断的获取锁以及超时获取锁等多种`synchronized`关键字所不具备的同步特性。

Lock接口的主要方法（还有两个方法比较复杂，暂不介绍）：

>**void lock():** 执行此方法时，如果锁处于空闲状态，当前线程将获取到锁。相反，如果锁已经被其他线程持有，将禁用当前线程，直到当前线程获取到锁。
><br>**boolean tryLock()：** 如果锁可用，则获取锁，并立即返回true，否则返回false. 该方法和lock()的区别在于，tryLock()只是"试图"获取锁，如果锁不可用，不会导致当前线程被禁用，当前线程仍然继续往下执行代码。而lock()方法则是一定要获取到锁，如果锁不可用，就一直等待，在未获得锁之前,当前线程并不继续向下执行. 通常采用如下的代码形式调用tryLock()方法：
><br>**void unlock()：** 执行此方法时，当前线程将释放持有的锁. 锁只能由持有者释放，如果线程并不持有锁，却执行该方法，可能导致异常的发生.
><br>**Condition newCondition()：** 条件对象，获取等待通知组件。该组件和当前的锁绑定，当前线程只有获取了锁，才能调用该组件的await()方法，而调用后，当前线程将缩放锁。

##### 2.ReentrantLock的使用

关于ReentrantLock的使用很简单，只需要显示调用，获得同步锁，释放同步锁即可。

``` java
ReentrantLock lock = new ReentrantLock(); //参数默认false，不公平锁
.....................
lock.lock(); //如果被其它资源锁定，会在此等待锁释放，达到暂停的效果
try {
    //操作
} finally {
    lock.unlock();  //释放锁
}
```

##### 3.解决线程同步的实例

针对上述方法，具体的解决方式如下：

``` java
public class Ticket implements Runnable {
    // 当前拥有的票数
    private int num = 100;
    ReentrantLock lock = new ReentrantLock();

    public void run() {
        while (true) {
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
            }

            lock.lock();
            // 输出卖票信息
            if (num > 0) {
                System.out.println(Thread.currentThread().getName() + ".....sale...." + num--);
            }
            lock.unlock();

        }
    }
}
```

### 四、重入锁

当一个线程得到一个对象后，再次请求该对象锁时是可以再次得到该对象的锁的。

具体概念就是：自己可以再次获取自己的内部锁。

Java里面内置锁(synchronized)和Lock(ReentrantLock)都是可重入的。

``` java
public class SynchronizedTest {
    public void method1() {
        synchronized (SynchronizedTest.class) {
            System.out.println("方法1获得ReentrantTest的锁运行了");
            method2();
        }
    }
    public void method2() {
        synchronized (SynchronizedTest.class) {
            System.out.println("方法1里面调用的方法2重入锁,也正常运行了");
        }
    }
    public static void main(String[] args) {
        new SynchronizedTest().method1();
    }
}
```

上面便是synchronized的重入锁特性，即调用method1()方法时，已经获得了锁，此时内部调用method2()方法时，由于本身已经具有该锁，所以可以再次获取。

``` java
public class ReentrantLockTest {
    private Lock lock = new ReentrantLock();
    public void method1() {
        lock.lock();
        try {
            System.out.println("方法1获得ReentrantLock锁运行了");
            method2();
        } finally {
            lock.unlock();
        }
    }
    public void method2() {
        lock.lock();
        try {
            System.out.println("方法1里面调用的方法2重入ReentrantLock锁,也正常运行了");
        } finally {
            lock.unlock();
        }
    }
    public static void main(String[] args) {
        new ReentrantLockTest().method1();
    }
}
```

上面便是ReentrantLock的重入锁特性，即调用method1()方法时，已经获得了锁，此时内部调用method2()方法时， **由于本身已经具有该锁，所以可以再次获取**。

### 五、公平锁

CPU在调度线程的时候是在等待队列里随机挑选一个线程，由于这种随机性所以是无法保证线程**先到先得**的（synchronized控制的锁就是这种非公平锁）。但这样就会产生饥饿现象，即有些线程（优先级较低的线程）可能永远也无法获取CPU的执行权，优先级高的线程会不断的强制它的资源。那么如何解决饥饿问题呢，这就需要公平锁了。公平锁可以保证线程**按照时间的先后顺序**执行，避免饥饿现象的产生。但公平锁的效率比较低，因为要实现顺序执行，需要维护一个有序队列。

ReentrantLock便是一种公平锁，通过在构造方法中传入true就是公平锁，传入false，就是非公平锁。

``` java
public ReentrantLock(boolean fair) {
        sync = fair ? new FairSync() : new NonfairSync();
    }
```

以下是使用公平锁实现的效果：

``` java
public class LockFairTest implements Runnable{
    //创建公平锁
    private static ReentrantLock lock=new ReentrantLock(true);
    public void run() {
        while(true){
            lock.lock();
            try{
                System.out.println(Thread.currentThread().getName()+"获得锁");
            }finally{
                lock.unlock();
            }
        }
    }
    public static void main(String[] args) {
        LockFairTest lft=new LockFairTest();
        Thread th1=new Thread(lft);
        Thread th2=new Thread(lft);
        th1.start();
        th2.start();
    }
}
```

输出结果：
>Thread-1获得锁
><br>Thread-0获得锁
><br>Thread-1获得锁
><br>Thread-0获得锁
><br>Thread-1获得锁
><br>Thread-0获得锁
><br>Thread-1获得锁
><br>Thread-0获得锁
><br>Thread-1获得锁
><br>Thread-0获得锁
><br>Thread-1获得锁
><br>Thread-0获得锁
><br>Thread-1获得锁
><br>Thread-0获得锁
><br>Thread-1获得锁
><br>Thread-0获得锁

这是截取的部分执行结果，分析结果可看出两个线程是交替执行的，几乎不会出现同一个线程连续执行多次。

### 六、synchronized和ReentrantLock的比较

##### 1.区别：

1）Lock是一个接口，而synchronized是Java中的关键字，synchronized是内置的语言实现；

2）synchronized在发生异常时，会自动释放线程占有的锁，因此不会导致死锁现象发生；而Lock在发生异常时，如果没有主动通过unLock()去释放锁，则很可能造成死锁现象，因此使用Lock时需要在finally块中释放锁；

3）Lock可以让等待锁的线程响应中断，而synchronized却不行，使用synchronized时，等待的线程会一直等待下去，不能够响应中断；

4）通过Lock可以知道有没有成功获取锁，而synchronized却无法办到。

5）Lock可以提高多个线程进行读操作的效率。

**总结：ReentrantLock相比synchronized，增加了一些高级的功能。但也有一定缺陷。**

在ReentrantLock类中定义了很多方法，比如：

``` java
isFair()      //判断锁是否是公平锁

isLocked()    //判断锁是否被任何线程获取了

isHeldByCurrentThread()   //判断锁是否被当前线程获取了

hasQueuedThreads()   //判断是否有线程在等待该锁
```

##### 2.两者在锁的相关概念上区别：

**1)可中断锁**

顾名思义，就是可以响应中断的锁。

在Java中，**synchronized就不是可中断锁，而Lock是可中断锁**。如果某一线程A正在执行锁中的代码，另一线程B正在等待获取该锁，可能由于等待时间过长，线程B不想等待了，想先处理其他事情，我们可以让它中断自己或者在别的线程中中断它，这种就是可中断锁。

`lockInterruptibly()`的用法体现了Lock的可中断性。

**2)公平锁**

公平锁即尽量以请求锁的顺序来获取锁。比如同是有多个线程在等待一个锁，当这个锁被释放时，等待时间最久的线程（最先请求的线程）会获得该锁（并不是绝对的，大体上是这种顺序），这种就是公平锁。

非公平锁即无法保证锁的获取是按照请求锁的顺序进行的。这样就可能导致某个或者一些线程永远获取不到锁。

在Java中，synchronized就是非公平锁，它无法保证等待的线程获取锁的顺序。ReentrantLock可以设置成公平锁。

**3)读写锁**

读写锁将对一个资源（比如文件）的访问分成了2个锁，一个读锁和一个写锁。

正因为有了读写锁，才使得多个线程之间的读操作可以并发进行，不需要同步，而写操作需要同步进行，提高了效率。

ReadWriteLock就是读写锁，它是一个接口，ReentrantReadWriteLock实现了这个接口。

可以通过readLock()获取读锁，通过writeLock()获取写锁。

**4)绑定多个条件**

一个ReentrantLock对象可以同时绑定多个Condition对象，而在synchronized中，锁对象的wait()和notify()或notifyAll()方法可以实现一个隐含的条件，如果要和多余一个条件关联的时候，就不得不额外地添加一个锁，而ReentrantLock则无须这么做，只需要多次调用new Condition()方法即可。

##### 3.性能比较
在性能上来说，如果竞争资源不激烈，两者的性能是差不多的，而 **当竞争资源非常激烈时（即有大量线程同时竞争），此时ReentrantLock的性能要远远优于synchronized** 。所以说，在具体使用时要根据适当情况选择。

在JDK1.5中，synchronized是性能低效的。因为这是一个重量级操作，它对性能最大的影响是阻塞的是实现，挂起线程和恢复线程的操作都需要转入内核态中完成，这些操作给系统的并发性带来了很大的压力。相比之下使用Java提供的ReentrankLock对象，性能更高一些。到了JDK1.6，发生了变化，对synchronize加入了很多优化措施，有自适应自旋，锁消除，锁粗化，轻量级锁，偏向锁等等。导致在JDK1.6上synchronize的性能并不比Lock差。官方也表示，他们也更支持synchronize，在未来的版本中还有优化余地，所以还是提倡在synchronized能实现需求的情况下，优先考虑使用synchronized来进行同步。