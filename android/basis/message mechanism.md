### 一、消息机制概述

##### 1.消息机制的简介

在Android中使用消息机制，我们首先想到的就是Handler。没错，Handler是Android消息机制的上层接口。Handler的使用过程很简单，通过它可以轻松地将一个任务切换到Handler所在的线程中去执行。通常情况下，Handler的使用场景就是更新UI。  
如下就是使用消息机制的一个简单实例：

```java
public class Activity extends android.app.Activity {
    private Handler mHandler = new Handler(){
        @Override
        public void handleMessage(Message msg) {
            super.handleMessage(msg);
            System.out.println(msg.what);
        }
    };
    @Override
    public void onCreate(Bundle savedInstanceState, PersistableBundle persistentState) {
        super.onCreate(savedInstanceState, persistentState);
        setContentView(R.layout.activity_main);
        new Thread(new Runnable() {
            @Override
            public void run() {
                ...............耗时操作
                Message message = Message.obtain();
                message.what = 1;
                mHandler.sendMessage(message);
            }
        }).start();
    }
}
```

在子线程中，进行耗时操作，执行完操作后，发送消息，通知主线程更新UI。这便是消息机制的典型应用场景。我们通常只会接触到Handler和Message来完成消息机制，其实内部还有两大助手来共同完成消息传递。

##### 2.消息机制的模型

消息机制主要包含：MessageQueue，Handler和Looper这三大部分，以及Message，下面我们一一介绍。

**Message：**需要传递的消息，可以传递数据；

**MessageQueue：**消息队列，但是它的内部实现并不是用的队列，实际上是通过一个单链表的数据结构来维护消息列表，因为单链表在插入和删除上比较有优势。主要功能向消息池投递消息\(MessageQueue.enqueueMessage\)和取走消息池的消息\(MessageQueue.next\)；

**Handler：**消息辅助类，主要功能向消息池发送各种消息事件\(Handler.sendMessage\)和处理相应消息事件\(Handler.handleMessage\)；

**Looper：**不断循环执行\(Looper.loop\)，从MessageQueue中读取消息，按分发机制将消息分发给目标处理者。

##### 3.消息机制的架构

**消息机制的运行流程：**在子线程执行完耗时操作，当Handler发送消息时，将会调用`MessageQueue.enqueueMessage`，向消息队列中添加消息。当通过`Looper.loop`开启循环后，会不断地从线程池中读取消息，即调用`MessageQueue.next`，然后调用目标Handler（即发送该消息的Handler）的`dispatchMessage`方法传递消息，然后返回到Handler所在线程，目标Handler收到消息，调用`handleMessage`方法，接收消息，处理消息。

![](http://upload-images.jianshu.io/upload_images/3985563-d7da4f5ba49f6887.png?imageMogr2/auto-orient/strip|imageView2/2/w/1240)

**MessageQueue，Handler和Looper三者之间的关系：**每个线程中只能存在一个Looper，Looper是保存在ThreadLocal中的。主线程（UI线程）已经创建了一个Looper，所以在主线程中不需要再创建Looper，但是在其他线程中需要创建Looper。每个线程中可以有多个Handler，即一个Looper可以处理来自多个Handler的消息。 Looper中维护一个MessageQueue，来维护消息队列，消息队列中的Message可以来自不同的Handler。

![](http://upload-images.jianshu.io/upload_images/3985563-88a27b5906166c63.png?imageMogr2/auto-orient/strip|imageView2/2/w/1240)

下面是消息机制的整体架构图，接下来我们将慢慢解剖整个架构。

![](http://upload-images.jianshu.io/upload_images/3985563-6c25004471646c1f.png?imageMogr2/auto-orient/strip|imageView2/2/w/1240)

从中我们可以看出：  
Looper有一个MessageQueue消息队列；  
MessageQueue有一组待处理的Message；  
Message中记录发送和处理消息的Handler；  
Handler中有Looper和MessageQueue。

### 二、消息机制的源码解析

##### 1.Looper

要想使用消息机制，首先要创建一个Looper。  
**初始化Looper**  
无参情况下，默认调用`prepare(true);`表示的是这个Looper可以退出，而对于false的情况则表示当前Looper不可以退出。。

```java
 public static void prepare() {
        prepare(true);
    }

    private static void prepare(boolean quitAllowed) {
        if (sThreadLocal.get() != null) {
            throw new RuntimeException("Only one Looper may be created per thread");
        }
        sThreadLocal.set(new Looper(quitAllowed));
    }
```

这里看出，不能重复创建Looper，只能创建一个。创建Looper,并保存在ThreadLocal。其中ThreadLocal是线程本地存储区（Thread Local Storage，简称为TLS），每个线程都有自己的私有的本地存储区域，不同线程之间彼此不能访问对方的TLS区域。  
**开启Looper**

```java
public static void loop() {
    final Looper me = myLooper();  //获取TLS存储的Looper对象 
    if (me == null) {
        throw new RuntimeException("No Looper; Looper.prepare() wasn't called on this thread.");
    }
    final MessageQueue queue = me.mQueue;  //获取Looper对象中的消息队列

    Binder.clearCallingIdentity();
    final long ident = Binder.clearCallingIdentity();

    for (;;) { //进入loop的主循环方法
        Message msg = queue.next(); //可能会阻塞,因为next()方法可能会无限循环
        if (msg == null) { //消息为空，则退出循环
            return;
        }

        Printer logging = me.mLogging;  //默认为null，可通过setMessageLogging()方法来指定输出，用于debug功能
        if (logging != null) {
            logging.println(">>>>> Dispatching to " + msg.target + " " +
                    msg.callback + ": " + msg.what);
        }
        msg.target.dispatchMessage(msg); //获取msg的目标Handler，然后用于分发Message 
        if (logging != null) {
            logging.println("<<<<< Finished to " + msg.target + " " + msg.callback);
        }

        final long newIdent = Binder.clearCallingIdentity();
        if (ident != newIdent) {
         
        }
        msg.recycleUnchecked(); 
    }
}
```

loop\(\)进入循环模式，不断重复下面的操作，直到消息为空时退出循环:  
读取MessageQueue的下一条Message（关于next\(\)，后面详细介绍）；  
把Message分发给相应的target。

**当next\(\)取出下一条消息时，队列中已经没有消息时，next\(\)会无限循环，产生阻塞。等待MessageQueue中加入消息，然后重新唤醒。**

**主线程中不需要自己创建Looper，这是由于在程序启动的时候，系统已经帮我们自动调用了**`Looper.prepare()`**方法。查看ActivityThread中的**`main()`**方法，代码如下所示：**

```java
  public static void main(String[] args) {
..........................
        Looper.prepareMainLooper();
  ..........................
        Looper.loop();
  ..........................

    }
```

其中```prepareMainLooper()``方法会调用`prepare(false)`方法。

###### 2.Handler

**创建Handler**

```java
public Handler() {
    this(null, false);
}

public Handler(Callback callback, boolean async) {
   .................................
    //必须先执行Looper.prepare()，才能获取Looper对象，否则为null.
    mLooper = Looper.myLooper();  //从当前线程的TLS中获取Looper对象
    if (mLooper == null) {
        throw new RuntimeException("");
    }
    mQueue = mLooper.mQueue; //消息队列，来自Looper对象
    mCallback = callback;  //回调方法
    mAsynchronous = async; //设置消息是否为异步处理方式
}
```

对于Handler的无参构造方法，默认采用当前线程TLS中的Looper对象，并且callback回调方法为null，且消息为同步处理方式。只要执行的`Looper.prepare()`方法，那么便可以获取有效的Looper对象。

###### 3.发送消息

发送消息有几种方式，但是归根结底都是调用了`sendMessageAtTime()`方法。

在子线程中通过Handler的post\(\)方式或send\(\)方式发送消息，最终都是调用了`sendMessageAtTime()`方法。

**post方法**

```java
 public final boolean post(Runnable r)
    {
       return  sendMessageDelayed(getPostMessage(r), 0);
    }
public final boolean postAtTime(Runnable r, long uptimeMillis)
    {
        return sendMessageAtTime(getPostMessage(r), uptimeMillis);
    }
 public final boolean postAtTime(Runnable r, Object token, long uptimeMillis)
    {
        return sendMessageAtTime(getPostMessage(r, token), uptimeMillis);
    }
 public final boolean postDelayed(Runnable r, long delayMillis)
    {
        return sendMessageDelayed(getPostMessage(r), delayMillis);
    }
```

**send方法**

```java
public final boolean sendMessage(Message msg)
    {
        return sendMessageDelayed(msg, 0);
    }
 public final boolean sendEmptyMessage(int what)
    {
        return sendEmptyMessageDelayed(what, 0);
    } 
public final boolean sendEmptyMessageDelayed(int what, long delayMillis) {
        Message msg = Message.obtain();
        msg.what = what;
        return sendMessageDelayed(msg, delayMillis);
    }
 public final boolean sendEmptyMessageAtTime(int what, long uptimeMillis) {
        Message msg = Message.obtain();
        msg.what = what;
        return sendMessageAtTime(msg, uptimeMillis);
    }
 public final boolean sendMessageDelayed(Message msg, long delayMillis)
    {
        if (delayMillis < 0) {
            delayMillis = 0;
        }
        return sendMessageAtTime(msg, SystemClock.uptimeMillis() + delayMillis);
    }
```

就连子线程中调用Activity中的runOnUiThread\(\)中更新UI，其实也是发送消息通知主线程更新UI，最终也会调用`sendMessageAtTime()`方法。

```java
 public final void runOnUiThread(Runnable action) {
        if (Thread.currentThread() != mUiThread) {
            mHandler.post(action);
        } else {
            action.run();
        }
    }
```

如果当前的线程不等于UI线程\(主线程\)，就去调用Handler的post\(\)方法，最终会调用`sendMessageAtTime()`方法。否则就直接调用Runnable对象的run\(\)方法。

下面我们就来一探究竟，到底`sendMessageAtTime()`方法有什么作用？  
**sendMessageAtTime\(\)**

```java
 public boolean sendMessageAtTime(Message msg, long uptimeMillis) {
       //其中mQueue是消息队列，从Looper中获取的
        MessageQueue queue = mQueue;
        if (queue == null) {
            RuntimeException e = new RuntimeException(
                    this + " sendMessageAtTime() called with no mQueue");
            Log.w("Looper", e.getMessage(), e);
            return false;
        }
        //调用enqueueMessage方法
        return enqueueMessage(queue, msg, uptimeMillis);
    }
```

```java
 private boolean enqueueMessage(MessageQueue queue, Message msg, long uptimeMillis) {
        msg.target = this;
        if (mAsynchronous) {
            msg.setAsynchronous(true);
        }
        //调用MessageQueue的enqueueMessage方法
        return queue.enqueueMessage(msg, uptimeMillis);
    }
```

可以看到sendMessageAtTime\(\)\`方法的作用很简单，就是调用MessageQueue的enqueueMessage\(\)方法，往消息队列中添加一个消息。  
下面来看enqueueMessage\(\)方法的具体执行逻辑。  
**enqueueMessage\(\)**

```java
boolean enqueueMessage(Message msg, long when) {
    // 每一个Message必须有一个target
    if (msg.target == null) {
        throw new IllegalArgumentException("Message must have a target.");
    }
    if (msg.isInUse()) {
        throw new IllegalStateException(msg + " This message is already in use.");
    }
    synchronized (this) {
        if (mQuitting) {  //正在退出时，回收msg，加入到消息池
            msg.recycle();
            return false;
        }
        msg.markInUse();
        msg.when = when;
        Message p = mMessages;
        boolean needWake;
        if (p == null || when == 0 || when < p.when) {
            //p为null(代表MessageQueue没有消息） 或者msg的触发时间是队列中最早的， 则进入该该分支
            msg.next = p;
            mMessages = msg;
            needWake = mBlocked; 
        } else {
            //将消息按时间顺序插入到MessageQueue。一般地，不需要唤醒事件队列，除非
            //消息队头存在barrier，并且同时Message是队列中最早的异步消息。
            needWake = mBlocked && p.target == null && msg.isAsynchronous();
            Message prev;
            for (;;) {
                prev = p;
                p = p.next;
                if (p == null || when < p.when) {
                    break;
                }
                if (needWake && p.isAsynchronous()) {
                    needWake = false;
                }
            }
            msg.next = p;
            prev.next = msg;
        }
        if (needWake) {
            nativeWake(mPtr);
        }
    }
    return true;
}
```

MessageQueue是按照Message触发时间的先后顺序排列的，队头的消息是将要最早触发的消息。当有消息需要加入消息队列时，会从队列头开始遍历，直到找到消息应该插入的合适位置，以保证所有消息的时间顺序。

##### 4.获取消息

当发送了消息后，在MessageQueue维护了消息队列，然后在Looper中通过`loop()`方法，不断地获取消息。上面对`loop()`方法进行了介绍，其中最重要的是调用了`queue.next()`方法,通过该方法来提取下一条信息。下面我们来看一下`next()`方法的具体流程。  
**next\(\)**

```java
Message next() {
    final long ptr = mPtr;
    if (ptr == 0) { //当消息循环已经退出，则直接返回
        return null;
    }
    int pendingIdleHandlerCount = -1; // 循环迭代的首次为-1
    int nextPollTimeoutMillis = 0;
    for (;;) {
        if (nextPollTimeoutMillis != 0) {
            Binder.flushPendingCommands();
        }
        //阻塞操作，当等待nextPollTimeoutMillis时长，或者消息队列被唤醒，都会返回
        nativePollOnce(ptr, nextPollTimeoutMillis);
        synchronized (this) {
            final long now = SystemClock.uptimeMillis();
            Message prevMsg = null;
            Message msg = mMessages;
            if (msg != null && msg.target == null) {
                //当消息Handler为空时，查询MessageQueue中的下一条异步消息msg，为空则退出循环。
                do {
                    prevMsg = msg;
                    msg = msg.next;
                } while (msg != null && !msg.isAsynchronous());
            }
            if (msg != null) {
                if (now < msg.when) {
                    //当异步消息触发时间大于当前时间，则设置下一次轮询的超时时长
                    nextPollTimeoutMillis = (int) Math.min(msg.when - now, Integer.MAX_VALUE);
                } else {
                    // 获取一条消息，并返回
                    mBlocked = false;
                    if (prevMsg != null) {
                        prevMsg.next = msg.next;
                    } else {
                        mMessages = msg.next;
                    }
                    msg.next = null;
                    //设置消息的使用状态，即flags |= FLAG_IN_USE
                    msg.markInUse();
                    return msg;   //成功地获取MessageQueue中的下一条即将要执行的消息
                }
            } else {
                //没有消息
                nextPollTimeoutMillis = -1;
            }
         //消息正在退出，返回null
            if (mQuitting) {
                dispose();
                return null;
            }
            ...............................
    }
}
```

nativePollOnce是阻塞操作，其中nextPollTimeoutMillis代表下一个消息到来前，还需要等待的时长；当nextPollTimeoutMillis = -1时，表示消息队列中无消息，会一直等待下去。  
可以看出`next()`方法根据消息的触发时间，获取下一条需要执行的消息,队列中消息为空时，则会进行阻塞操作。

##### 5.分发消息

在loop\(\)方法中，获取到下一条消息后，执行`msg.target.dispatchMessage(msg)`，来分发消息到目标Handler对象。  
下面就来具体看下`dispatchMessage(msg)`方法的执行流程。  
**dispatchMessage\(\)**

```java
public void dispatchMessage(Message msg) {
    if (msg.callback != null) {
        //当Message存在回调方法，回调msg.callback.run()方法；
        handleCallback(msg);
    } else {
        if (mCallback != null) {
            //当Handler存在Callback成员变量时，回调方法handleMessage()；
            if (mCallback.handleMessage(msg)) {
                return;
            }
        }
        //Handler自身的回调方法handleMessage()
        handleMessage(msg);
    }
}
```

```java
private static void handleCallback(Message message) {
        message.callback.run();
    }
```

**分发消息流程：**  
当Message的`msg.callback`不为空时，则回调方法`msg.callback.run()`;  
当Handler的`mCallback`不为空时，则回调方法`mCallback.handleMessage(msg)`；  
最后调用Handler自身的回调方法`handleMessage()`，该方法默认为空，Handler子类通过覆写该方法来完成具体的逻辑。

**消息分发的优先级：**  
Message的回调方法：`message.callback.run()`，优先级最高；  
Handler中Callback的回调方法：`Handler.mCallback.handleMessage(msg)`，优先级仅次于1；  
Handler的默认方法：`Handler.handleMessage(msg)`，优先级最低。

对于很多情况下，消息分发后的处理方法是第3种情况，即`Handler.handleMessage()`，一般地往往通过覆写该方法从而实现自己的业务逻辑。

### 三、总结

以上便是消息机制的原理，以及从源码角度来解析消息机制的运行过程。可以简单地用下图来理解。

![](http://upload-images.jianshu.io/upload_images/3985563-b3295b67a2b0477f.png?imageMogr2/auto-orient/strip|imageView2/2/w/1240)

