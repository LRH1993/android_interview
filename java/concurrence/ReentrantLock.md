## 前言

java5之后，并发包中新增了Lock接口（以及相关实现类）用来实现锁的功能，它提供了与synchronized关键字类似的同步功能。既然有了synchronized这种内置的锁功能，为何要新增Lock接口？先来想象一个场景：手把手的进行锁获取和释放，先获得锁A，然后再获取锁B，当获取锁B后释放锁A同时获取锁C，当锁C获取后，再释放锁B同时获取锁D，以此类推，这种场景下，synchronized关键字就不那么容易实现了，而使用Lock却显得容易许多。

## 定义

```java
public class ReentrantLock implements Lock, java.io.Serializable {
    private final Sync sync;
    abstract static class Sync extends AbstractQueuedSynchronizer {

        /**
         * Performs {@link Lock#lock}. The main reason for subclassing
         * is to allow fast path for nonfair version.
         */
        abstract void lock();

        /**
         * Performs non-fair tryLock.  tryAcquire is implemented in
         * subclasses, but both need nonfair try for trylock method.
         */
        final boolean nonfairTryAcquire(int acquires) {
            final Thread current = Thread.currentThread();
            int c = getState();
            if (c == 0) {
                if (compareAndSetState(0, acquires)) {
                    setExclusiveOwnerThread(current);
                    return true;
                }
            }
            else if (current == getExclusiveOwnerThread()) {
                int nextc = c + acquires;
                if (nextc < 0) // overflow
                    throw new Error("Maximum lock count exceeded");
                setState(nextc);
                return true;
            }
            return false;
        }

        protected final boolean tryRelease(int releases) {
            int c = getState() - releases;
            if (Thread.currentThread() != getExclusiveOwnerThread())
                throw new IllegalMonitorStateException();
            boolean free = false;
            if (c == 0) {
                free = true;
                setExclusiveOwnerThread(null);
            }
            setState(c);
            return free;
        }

    }
    //默认非公平锁
    public ReentrantLock() {
        sync = new NonfairSync();
    }
    //fair为false时，采用公平锁策略
    public ReentrantLock(boolean fair) {    
        sync = fair ? new FairSync() : new NonfairSync();
    }
    public void lock() {
        sync.lock();
    }
    public void unlock() {    sync.release(1);}
    public Condition newCondition() {    
        return sync.newCondition();
    }
    ...
}
```

从源代码可以Doug lea巧妙的采用组合模式把lock和unlock方法委托给同步器完成。

## 使用方式

```java
Lock lock = new ReentrantLock();
Condition condition = lock.newCondition();
lock.lock();
try {
  while(条件判断表达式) {
      condition.wait();
  }
 // 处理逻辑
} finally {
    lock.unlock();
}
```

需要显示的获取锁，并在finally块中显示的释放锁，目的是保证在获取到锁之后，最终能够被释放。

## 非公平锁实现

在非公平锁中，每当线程执行lock方法时，都尝试利用CAS把state从0设置为1。

那么Doug lea是如何实现锁的非公平性呢？
我们假设这样一个场景：

1. 持有锁的线程A正在running，队列中有线程BCDEF被挂起并等待被唤醒；
2. 在某一个时间点，线程A执行unlock，唤醒线程B；
3. 同时线程G执行lock，这个时候会发生什么？线程B和G拥有相同的优先级，这里讲的优先级是指获取锁的优先级，同时执行CAS指令竞争锁。如果恰好线程G成功了，线程B就得重新挂起等待被唤醒。

通过上述场景描述，我们可以看书，即使线程B等了很长时间也得和新来的线程G同时竞争锁，如此的不公平。

```java
static final class NonfairSync extends Sync {
    /**
     * Performs lock.  Try immediate barge, backing up to normal
     * acquire on failure.
     */
    final void lock() {
        if (compareAndSetState(0, 1))
            setExclusiveOwnerThread(Thread.currentThread());
        else
            acquire(1);
    }

    public final void acquire(int arg) {    
        if (!tryAcquire(arg) && 
                acquireQueued(addWaiter(Node.EXCLUSIVE), arg))       
          selfInterrupt();
    }

    protected final boolean tryAcquire(int acquires) {
        return nonfairTryAcquire(acquires);
    }
}
```

下面我们用线程A和线程B来描述非公平锁的竞争过程。

1. 线程A和B同时执行CAS指令，假设线程A成功，线程B失败，则表明线程A成功获取锁，并把同步器中的exclusiveOwnerThread设置为线程A。

2. 竞争失败的线程B，在nonfairTryAcquire方法中，会再次尝试获取锁，

   Doug lea会在多处尝试重新获取锁，应该是在这段时间如果线程A释放锁，线程B就可以直接获取锁而不用挂起

   。完整的执行流程如下：

   ![](http://upload-images.jianshu.io/upload_images/2184951-5bd703829cbdc56a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 公平锁实现

在公平锁中，每当线程执行lock方法时，如果同步器的队列中有线程在等待，则直接加入到队列中。
场景分析：

1. 持有锁的线程A正在running，对列中有线程BCDEF被挂起并等待被唤醒；
2. 线程G执行lock，队列中有线程BCDEF在等待，线程G直接加入到队列的对尾。

所以每个线程获取锁的过程是公平的，等待时间最长的会最先被唤醒获取锁。

```java
static final class FairSync extends Sync {
    private static final long serialVersionUID = -3000897897090466540L;

    final void lock() {
        acquire(1);
    }

    /**
     * Fair version of tryAcquire.  Don't grant access unless
     * recursive call or no waiters or is first.
     */
    protected final boolean tryAcquire(int acquires) {
        final Thread current = Thread.currentThread();
        int c = getState();
        if (c == 0) {
            if (!hasQueuedPredecessors() &&
                compareAndSetState(0, acquires)) {
                setExclusiveOwnerThread(current);
                return true;
            }
        }
        else if (current == getExclusiveOwnerThread()) {
            int nextc = c + acquires;
            if (nextc < 0)
                throw new Error("Maximum lock count exceeded");
            setState(nextc);
            return true;
        }
        return false;
    }
}
```

## 重入锁实现

重入锁，即线程可以重复获取已经持有的锁。在非公平和公平锁中，都对重入锁进行了实现。

```java
    if (current == getExclusiveOwnerThread()) {
        int nextc = c + acquires;
        if (nextc < 0)
            throw new Error("Maximum lock count exceeded");
        setState(nextc);
        return true;
    }
```

## 条件变量Condition

条件变量很大一个程度上是为了解决Object.wait/notify/notifyAll难以使用的问题。

```Java
public class ConditionObject implements Condition, java.io.Serializable {
    /** First node of condition queue. */
    private transient Node firstWaiter;
    /** Last node of condition queue. */
    private transient Node lastWaiter;
    public final void signal() {}
    public final void signalAll() {}
    public final void awaitUninterruptibly() {}  
    public final void await() throws InterruptedException {}
}
```

1. Synchronized中，所有的线程都在同一个object的条件队列上等待。而ReentrantLock中，每个condition都维护了一个条件队列。
2. 每一个**Lock**可以有任意数据的**Condition**对象，**Condition**是与**Lock**绑定的，所以就有**Lock**的公平性特性：如果是公平锁，线程为按照FIFO的顺序从*Condition.await*中释放，如果是非公平锁，那么后续的锁竞争就不保证FIFO顺序了。
3. Condition接口定义的方法，**await**对应于**Object.wait**，**signal**对应于**Object.notify**，**signalAll**对应于**Object.notifyAll**。特别说明的是Condition的接口改变名称就是为了避免与Object中的*wait/notify/notifyAll*的语义和使用上混淆。

先看一个condition在生产者消费者的应用场景：

```java
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Created by j_zhan on 2016/7/13.
 */
public class Queue<T> {
    private final T[] items;
    private final Lock lock = new ReentrantLock();
    private Condition notFull = lock.newCondition();
    private Condition notEmpty = lock.newCondition();
    private int head, tail, count;
    public Queue(int maxSize) {
        items = (T[]) new Object[maxSize];
    }
    public Queue() {
        this(10);
    }

    public void put(T t) throws InterruptedException {
        lock.lock();
        try {
            while (count == items.length) {
                //数组满时，线程进入等待队列挂起。线程被唤醒时，从这里返回。
                notFull.await(); 
            }
            items[tail] = t;
            if (++tail == items.length) {
                tail = 0;
            }
            ++count;
            notEmpty.signal();
        } finally {
            lock.unlock();
        }
    }

    public T take() throws InterruptedException {
        lock.lock();
        try {
            while (count == 0) {
                notEmpty.await();
            }
            T o = items[head];
            items[head] = null;//GC
            if (++head == items.length) {
                head = 0;
            }
            --count;
            notFull.signal();
            return o;
        } finally {
            lock.unlock();
        }
    }
}
```

假设线程AB在并发的往items中插入数据，当items中元素存满时。如果线程A获取到锁，继续添加数据，满足count == items.length条件，导致线程A执行await方法。
**ReentrantLock**是独占锁，同一时刻只有一个线程能获取到锁，所以在lock.lock()和lock.unlock()之间可能有一次释放锁的操作（同样也必然还有一次获取锁的操作）。在Queue类中，不管take还是put，在线程持有锁之后只有await()方法有可能释放锁，然后挂起线程，一旦条件满足就被唤醒，再次获取锁。具体实现如下：

```java
public final void await() throws InterruptedException {
    if (Thread.interrupted())
        throw new InterruptedException();
    Node node = addConditionWaiter();
    int savedState = fullyRelease(node);
    int interruptMode = 0;
    while (!isOnSyncQueue(node)) {
        LockSupport.park(this);
        if ((interruptMode = checkInterruptWhileWaiting(node)) != 0)
            break;
    }
    if (acquireQueued(node, savedState) && interruptMode != THROW_IE)
        interruptMode = REINTERRUPT;
    if (node.nextWaiter != null) // clean up if cancelled
        unlinkCancelledWaiters();
    if (interruptMode != 0)
        reportInterruptAfterWait(interruptMode);
}

private Node addConditionWaiter() {
    Node t = lastWaiter;
    // If lastWaiter is cancelled, clean out.
    if (t != null && t.waitStatus != Node.CONDITION) {
        unlinkCancelledWaiters();
        t = lastWaiter;
    }
    Node node = new Node(Thread.currentThread(), Node.CONDITION);
    if (t == null)
        firstWaiter = node;
    else
        t.nextWaiter = node;
    lastWaiter = node;
    return node;
}
```

await实现逻辑：

1. 将线程A加入到条件等待队列中，如果最后一个节点是取消状态，则从对列中删除。
2. 线程A释放锁，实质上是线程A修改AQS的状态state为0，并唤醒AQS等待队列中的线程B，线程B被唤醒后，尝试获取锁，接下去的过程就不重复说明了。
3. 线程A释放锁并唤醒线程B之后，如果线程A不在AQS的同步队列中，线程A将通过LockSupport.park进行挂起操作。
4. 随后，线程A等待被唤醒，当线程A被唤醒时，会通过acquireQueued方法竞争锁，如果失败，继续挂起。如果成功，线程A从await位置恢复。

假设线程B获取锁之后，执行了take操作和条件变量的signal，signal通过某种实现唤醒了线程A，具体实现如下：

```Java
 public final void signal() {
     if (!isHeldExclusively())
         throw new IllegalMonitorStateException();
     Node first = firstWaiter;
     if (first != null)
         doSignal(first);
 }

 private void doSignal(Node first) {
     do {
         if ((firstWaiter = first.nextWaiter) == null)
             lastWaiter = null;
         first.nextWaiter = null;
     } while (!transferForSignal(first) &&
              (first = firstWaiter) != null);
 }

 final boolean transferForSignal(Node node) {
    if (!compareAndSetWaitStatus(node, Node.CONDITION, 0))
        return false;
    Node p = enq(node); //线程A插入到AQS的等待队列中
    int ws = p.waitStatus;
    if (ws > 0 || !compareAndSetWaitStatus(p, ws, Node.SIGNAL))
        LockSupport.unpark(node.thread);
    return true;
}
```

signal实现逻辑：

1. 接着上述场景，线程B执行了signal方法，取出条件队列中的第一个非CANCELLED节点线程，即线程A。另外，signalAll就是唤醒条件队列中所有非CANCELLED节点线程。遇到CANCELLED线程就需要将其从队列中删除。
2. 通过CAS修改线程A的waitStatus，表示该节点已经不是等待条件状态，并将线程A插入到AQS的等待队列中。
3. 唤醒线程A，线程A和别的线程进行锁的竞争。

## 总结

1. ReentrantLock提供了内置锁类似的功能和内存语义。
2. 此外，ReetrantLock还提供了其它功能，包括定时的锁等待、可中断的锁等待、公平性、以及实现非块结构的加锁、Condition，对线程的等待和唤醒等操作更加灵活，一个ReentrantLock可以有多个Condition实例，所以更有扩展性，不过ReetrantLock需要显示的获取锁，并在finally中释放锁，否则后果很严重。
3. ReentrantLock在性能上似乎优于Synchronized，其中在jdk1.6中略有胜出，在1.5中是远远胜出。那么为什么不放弃内置锁，并在新代码中都使用ReetrantLock？
4. 在java1.5中， 内置锁与ReentrantLock相比有例外一个优点：在线程转储中能给出在哪些调用帧中获得了哪些锁，并能够检测和识别发生死锁的线程。Reentrant的非块状特性任然意味着，获取锁的操作不能与特定的栈帧关联起来，而内置锁却可以。
5. 因为内置锁时JVM的内置属性，所以未来更可能提升synchronized而不是ReentrantLock的性能。例如对线程封闭的锁对象消除优化，通过增加锁粒度来消除内置锁的同步。