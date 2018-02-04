## Binder原理

### 1、概述

Android系统中，涉及到多进程间的通信底层都是依赖于Binder IPC机制。例如当进程A中的Activity要向进程B中的Service通信，这便需要依赖于Binder IPC。不仅于此，整个Android系统架构中，大量采用了Binder机制作为IPC（进程间通信，Interprocess Communication）方案。

当然也存在部分其他的IPC方式，如管道、SystemV、Socket等。那么Android为什么不使用这些原有的技术，而是要使开发一种新的叫Binder的进程间通信机制呢？

#### 为什么要使用Binder？

**性能方面**

在移动设备上（性能受限制的设备，比如要省电），广泛地使用跨进程通信对通信机制的性能有严格的要求，Binder相对于传统的Socket方式，更加高效。**Binder数据拷贝只需要一次，而管道、消息队列、Socket都需要2次，共享内存方式一次内存拷贝都不需要，但实现方式又比较复杂。**

**安全方面**

传统的进程通信方式对于通信双方的身份并没有做出严格的验证，比如Socket通信的IP地址是客户端手动填入，很容易进行伪造。然而，Binder机制从协议本身就支持对通信双方做身份校检，从而大大提升了安全性。

### 2、 Binder

#### IPC原理

从进程角度来看IPC（Interprocess Communication）机制

![img](http://upload-images.jianshu.io/upload_images/3985563-a3722ee387793114.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

每个Android的进程，只能运行在自己进程所拥有的虚拟地址空间。例如，对应一个4GB的虚拟地址空间，其中3GB是用户空间，1GB是内核空间。当然内核空间的大小是可以通过参数配置调整的。对于用户空间，不同进程之间是不能共享的，而内核空间却是可共享的。Client进程向Server进程通信，恰恰是利用进程间可共享的内核内存空间来完成底层通信工作的。Client端与Server端进程往往采用ioctl等方法与内核空间的驱动进行交互。

#### Binder原理

Binder通信采用C/S架构，从组件视角来说，包含Client、Server、ServiceManager以及Binder驱动，其中ServiceManager用于管理系统中的各种服务。架构图如下所示：

![img](http://upload-images.jianshu.io/upload_images/3985563-5ff2c4816543c433.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**Binder通信的四个角色**

**Client进程**：使用服务的进程。

**Server进程**：提供服务的进程。

**ServiceManager进程**：ServiceManager的作用是将字符形式的Binder名字转化成Client中对该Binder的引用，使得Client能够通过Binder名字获得对Server中Binder实体的引用。

**Binder驱动**：驱动负责进程之间Binder通信的建立，Binder在进程之间的传递，Binder引用计数管理，数据包在进程之间的传递和交互等一系列底层支持。

**Binder运行机制**

图中Client/Server/ServiceManage之间的相互通信都是基于Binder机制。既然基于Binder机制通信，那么同样也是C/S架构，则图中的3大步骤都有相应的Client端与Server端。

**注册服务(addService)**：Server进程要先注册Service到ServiceManager。该过程：Server是客户端，ServiceManager是服务端。

**获取服务(getService)**：Client进程使用某个Service前，须先向ServiceManager中获取相应的Service。该过程：Client是客户端，ServiceManager是服务端。

**使用服务**：Client根据得到的Service信息建立与Service所在的Server进程通信的通路，然后就可以直接与Service交互。该过程：Client是客户端，Server是服务端。

图中的Client，Server，Service Manager之间交互都是虚线表示，是由于它们彼此之间不是直接交互的，而是都通过与Binder驱动进行交互的，从而实现IPC通信（Interprocess Communication）方式。其中Binder驱动位于内核空间，Client，Server，Service Manager位于用户空间。Binder驱动和Service Manager可以看做是Android平台的基础架构，而Client和Server是Android的应用层，开发人员只需自定义实现Client、Server端，借助Android的基本平台架构便可以直接进行IPC通信。

**Binder运行的实例解释**

首先我们看看我们的程序跨进程调用系统服务的简单示例，实现浮动窗口部分代码：

```java
//获取WindowManager服务引用
WindowManager wm = (WindowManager) getSystemService(getApplication().WINDOW_SERVICE);
//布局参数layoutParams相关设置略...
View view = LayoutInflater.from(getApplication()).inflate(R.layout.float_layout, null);
//添加view
wm.addView(view, layoutParams);
```

**注册服务(addService)：** 在Android开机启动过程中，Android会初始化系统的各种Service，并将这些Service向ServiceManager注册（即让ServiceManager管理）。这一步是系统自动完成的。

**获取服务(getService)：** 客户端想要得到具体的Service直接向ServiceManager要即可。客户端首先向ServiceManager查询得到具体的Service引用，通常是Service引用的代理对象，对数据进行一些处理操作。即第2行代码中，得到的wm是WindowManager对象的引用。

**使用服务：** 通过这个引用向具体的服务端发送请求，服务端执行完成后就返回。即第6行调用WindowManager的addView函数，将触发远程调用，调用的是运行在systemServer进程中的WindowManager的addView函数。

**使用服务的具体执行过程**

![img](http://upload-images.jianshu.io/upload_images/3985563-727dd63017d2113b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

1. Client通过获得一个Server的代理接口，对Server进行调用。
2. 代理接口中定义的方法与Server中定义的方法是一一对应的。
3. Client调用某个代理接口中的方法时，代理接口的方法会将Client传递的参数打包成Parcel对象。
4. 代理接口将Parcel发送给内核中的Binder Driver。
5. Server会读取Binder Driver中的请求数据，如果是发送给自己的，解包Parcel对象，处理并将结果返回。
6. 整个的调用过程是一个同步过程，在Server处理的时候，Client会Block住。**因此Client调用过程不应在主线程。**

## AIDL的使用

### 1.AIDL的简介

AIDL (Android Interface Definition Language) 是一种接口定义语言，用于生成可以在Android设备上两个进程之间进行进程间通信(Interprocess Communication, IPC)的代码。如果在一个进程中（例如Activity）要调用另一个进程中（例如Service）对象的操作，就可以使用AIDL生成可序列化的参数，来完成进程间通信。

**简言之，AIDL能够实现进程间通信，其内部是通过Binder机制来实现的，后面会具体介绍，现在先介绍AIDL的使用。**

### 2.AIDL的具体使用

AIDL的实现一共分为三部分，一部分是客户端，调用远程服务。一部分是服务端，提供服务。最后一部分，也是最关键的是AIDL接口，用来传递的参数，提供进程间通信。

先在服务端创建AIDL部分代码。

**AIDL文件**
通过如下方式新建一个AIDL文件

![img](http://upload-images.jianshu.io/upload_images/3985563-4ea35902ebf6fa51.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**默认生成格式**

```java
interface IBookManager {
    /**
     * Demonstrates some basic types that you can use as parameters
     * and return values in AIDL.
     */
    void basicTypes(int anInt, long aLong, boolean aBoolean, float aFloat,
            double aDouble, String aString);
}
```

默认如下格式，由于本例要操作Book类，实现两个方法，添加书本和返回书本列表。

**定义一个Book类，实现Parcelable接口。**

```java
public class Book implements Parcelable {
    public int bookId;
    public String bookName;

    public Book() {
    }

    public Book(int bookId, String bookName) {
        this.bookId = bookId;
        this.bookName = bookName;
    }

    public int getBookId() {
        return bookId;
    }

    public void setBookId(int bookId) {
        this.bookId = bookId;
    }

    public String getBookName() {
        return bookName;
    }

    public void setBookName(String bookName) {
        this.bookName = bookName;
    }

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeInt(this.bookId);
        dest.writeString(this.bookName);
    }

    protected Book(Parcel in) {
        this.bookId = in.readInt();
        this.bookName = in.readString();
    }

    public static final Parcelable.Creator<Book> CREATOR = new Parcelable.Creator<Book>() {
        @Override
        public Book createFromParcel(Parcel source) {
            return new Book(source);
        }

        @Override
        public Book[] newArray(int size) {
            return new Book[size];
        }
    };
}
```

由于AIDL只支持数据类型:基本类型（int，long，char，boolean等），String，CharSequence，List，Map，其他类型必须使用import导入，即使它们可能在同一个包里，比如上面的Book。

**最终IBookManager.aidl 的实现**

```java
// Declare any non-default types here with import statements
import com.lvr.aidldemo.Book;

interface IBookManager {
    /**
     * Demonstrates some basic types that you can use as parameters
     * and return values in AIDL.
     */
    void basicTypes(int anInt, long aLong, boolean aBoolean, float aFloat,
            double aDouble, String aString);

    void addBook(in Book book);

    List<Book> getBookList();

}
```

**注意：如果自定义的Parcelable对象，必须创建一个和它同名的AIDL文件，并在其中声明它为parcelable类型。**

**Book.aidl**

```Java
// Book.aidl
package com.lvr.aidldemo;

parcelable Book;
```

以上就是AIDL部分的实现，一共三个文件。

然后Make Project ，SDK为自动为我们生成对应的Binder类。

在如下路径下：

![img](http://upload-images.jianshu.io/upload_images/3985563-53d6a0fdeafefa74.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

其中该接口中有个重要的内部类Stub ，继承了Binder 类，同时实现了IBookManager接口。
这个内部类是接下来的关键内容。

```java
public static abstract class Stub extends android.os.Binder implements com.lvr.aidldemo.IBookManager{}
```

**服务端**
服务端首先要创建一个Service用来监听客户端的连接请求。然后在Service中实现Stub 类，并定义接口中方法的具体实现。

```java
//实现了AIDL的抽象函数
private IBookManager.Stub mbinder = new IBookManager.Stub() {
    @Override
    public void basicTypes(int anInt, long aLong, boolean aBoolean, float aFloat, double aDouble, String aString) throws RemoteException {
        //什么也不做
    }

    @Override
    public void addBook(Book book) throws RemoteException {
        //添加书本
        if (!mBookList.contains(book)) {
            mBookList.add(book);
        }
    }

    @Override
    public List<Book> getBookList() throws RemoteException {
        return mBookList;
    }
};
```

当客户端连接服务端，服务端就会调用如下方法：

```java
public IBinder onBind(Intent intent) {
    return mbinder;
}
```

就会把Stub实现对象返回给客户端，该对象是个Binder对象，可以实现进程间通信。
本例就不真实模拟两个应用之间的通信，而是让Service另外开启一个进程来模拟进程间通信。

``` xml
<service
    android:name=".MyService"
    android:process=":remote">
    <intent-filter>
        <category android:name="android.intent.category.DEFAULT" />
        <action android:name="com.lvr.aidldemo.MyService" />
    </intent-filter>
</service>
```

`android:process=":remote"`设置为另一个进程。`<action android:name="com.lvr.aidldemo.MyService"/>`是为了能让其他apk隐式bindService。**通过隐式调用的方式来连接service，需要把category设为default，这是因为，隐式调用的时候，intent中的category默认会被设置为default。**

**客户端**

**首先将服务端工程中的aidl文件夹下的内容整个拷贝到客户端工程的对应位置下，由于本例的使用在一个应用中，就不需要拷贝了，其他情况一定不要忘记这一步。**

客户端需要做的事情比较简单，首先需要绑定服务端的Service。

```java
Intent intentService = new Intent();
intentService.setAction("com.lvr.aidldemo.MyService");
intentService.setPackage(getPackageName());
intentService.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
MyClient.this.bindService(intentService, mServiceConnection, BIND_AUTO_CREATE);
Toast.makeText(getApplicationContext(), "绑定了服务", Toast.LENGTH_SHORT).show();
```

将服务端返回的Binder对象转换成AIDL接口所属的类型，接着就可以调用AIDL中的方法了。

```java
if (mIBookManager != null) {
    try {
        mIBookManager.addBook(new Book(18, "新添加的书"));
        Toast.makeText(getApplicationContext(), mIBookManager.getBookList().size() + "", Toast.LENGTH_SHORT).show();
    } catch (RemoteException e) {
        e.printStackTrace();
    }
}
```

### 3.AIDL的工作原理

Binder机制的运行主要包括三个部分：注册服务、获取服务和使用服务。
其中注册服务和获取服务的流程涉及C的内容，由于个人能力有限，就不予介绍了。

本篇文章主要介绍使用服务时，AIDL的工作原理。

#### ①.Binder对象的获取

Binder是实现跨进程通信的基础，那么Binder对象在服务端和客户端是共享的，是同一个Binder对象。在客户端通过Binder对象获取实现了IInterface接口的对象来调用远程服务，然后通过Binder来实现参数传递。

那么如何维护实现了IInterface接口的对象和获取Binder对象呢？

**服务端获取Binder对象并保存IInterface接口对象**
Binder中两个关键方法：

```java
public class Binder implement IBinder {
    void attachInterface(IInterface plus, String descriptor)

    IInterface queryLocalInterface(Stringdescriptor) //从IBinder中继承而来
    ..........................
}
```

Binder具有被跨进程传输的能力是因为它实现了IBinder接口。系统会为每个实现了该接口的对象提供跨进程传输，这是系统给我们的一个很大的福利。

**Binder具有的完成特定任务的能力是通过它的IInterface的对象获得的**，我们可以简单理解attachInterface方法会将（descriptor，plus）作为（key,value）对存入Binder对象中的一个Map<String,IInterface>对象中，Binder对象可通过attachInterface方法持有一个IInterface对象（即plus）的引用，并依靠它获得完成特定任务的能力。queryLocalInterface方法可以认为是根据key值（即参数 descriptor）查找相应的IInterface对象。

在服务端进程，通过实现`private IBookManager.Stub mbinder = new IBookManager.Stub() {}`抽象类，获得Binder对象。
并保存了IInterface对象。

```java
public Stub() {
    this.attachInterface(this, DESCRIPTOR);
}
```

**客户端获取Binder对象并获取IInterface接口对象**

通过bindService获得Binder对象

```java
MyClient.this.bindService(intentService, mServiceConnection, BIND_AUTO_CREATE);
```

然后通过Binder对象获得IInterface对象。

```java
private ServiceConnection mServiceConnection = new ServiceConnection() {
    @Override
    public void onServiceConnected(ComponentName name, IBinder binder) {
        //通过服务端onBind方法返回的binder对象得到IBookManager的实例，得到实例就可以调用它的方法了
        mIBookManager = IBookManager.Stub.asInterface(binder);
    }

    @Override
    public void onServiceDisconnected(ComponentName name) {
        mIBookManager = null;
    }
};
```

其中`asInterface(binder)`方法如下：

```java
public static com.lvr.aidldemo.IBookManager asInterface(android.os.IBinder obj) {
    if ((obj == null)) {
        return null;
    }
    android.os.IInterface iin = obj.queryLocalInterface(DESCRIPTOR);
    if (((iin != null) && (iin instanceof com.lvr.aidldemo.IBookManager))) {
        return ((com.lvr.aidldemo.IBookManager) iin);
    }
    return new com.lvr.aidldemo.IBookManager.Stub.Proxy(obj);
}
```

先通过`queryLocalInterface(DESCRIPTOR);`查找到对应的IInterface对象，然后判断对象的类型，如果是同一个进程调用则返回IBookManager对象，由于是跨进程调用则返回Proxy对象，即Binder类的代理对象。

#### ②.调用服务端方法

获得了Binder类的代理对象，并且通过代理对象获得了IInterface对象，那么就可以调用接口的具体实现方法了，来实现调用服务端方法的目的。

以addBook方法为例，调用该方法后，客户端线程挂起，等待唤醒：

```java
    @Override public void addBook(com.lvr.aidldemo.Book book) throws android.os.RemoteException
    {
        ..........
        //第一个参数：识别调用哪一个方法的ID
        //第二个参数：Book的序列化传入数据
        //第三个参数：调用方法后返回的数据
        //最后一个不用管
        mRemote.transact(Stub.TRANSACTION_addBook, _data, _reply, 0);
        _reply.readException();
    }
    ..........
}
```

省略部分主要完成对添加的Book对象进行序列化工作，然后调用`transact`方法。

Proxy对象中的transact调用发生后，会引起系统的注意，系统意识到Proxy对象想找它的真身Binder对象（系统其实一直存着Binder和Proxy的对应关系）。于是系统将这个请求中的数据转发给Binder对象，Binder对象将会在onTransact中收到Proxy对象传来的数据，于是它从data中取出客户端进程传来的数据，又根据第一个参数确定想让它执行添加书本操作，于是它就执行了响应操作，并把结果写回reply。代码概略如下：

```java
case TRANSACTION_addBook: {
    data.enforceInterface(DESCRIPTOR);
    com.lvr.aidldemo.Book _arg0;
    if ((0 != data.readInt())) {
        _arg0 = com.lvr.aidldemo.Book.CREATOR.createFromParcel(data);
    } else {
        _arg0 = null;
    }
    //这里调用服务端实现的addBook方法
    this.addBook(_arg0);
    reply.writeNoException();
    return true;
}
```

然后在`transact`方法获得`_reply`并返回结果，本例中的addList方法没有返回值。

客户端线程被唤醒。**因此调用服务端方法时，应开启子线程，防止UI线程堵塞，导致ANR。**