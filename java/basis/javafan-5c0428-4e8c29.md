### 一、代理模式

**定义：**给某个对象提供一个代理对象，并由代理对象控制对于原对象的访问，即客户不直接操控原对象，而是通过代理对象间接地操控原对象。

##### 1、代理模式的理解

代理模式使用代理对象完成用户请求，屏蔽用户对真实对象的访问。现实世界的代理人被授权执行当事人的一些事宜，无需当事人出面，从第三方的角度看，似乎当事人并不存在，因为他只和代理人通信。而事实上代理人是要有当事人的授权，并且在核心问题上还需要请示当事人。  
在软件设计中，使用代理模式的意图也很多，比如因为安全原因需要屏蔽客户端直接访问真实对象，或者在远程调用中需要使用代理类处理远程方法调用的技术细节，也可能为了提升系统性能，对真实对象进行封装，从而达到延迟加载的目的。

##### 2、代理模式的参与者

代理模式的角色分四种：  


![](http://upload-images.jianshu.io/upload_images/3985563-f4d339a69a8b9e92.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

  


  
**主题接口：**Subject 是委托对象和代理对象都共同实现的接口，即代理类的所实现的行为接口。Request\(\) 是委托对象和代理对象共同拥有的方法。  
**目标对象：**ReaSubject 是原对象，也就是被代理的对象。  
**代理对象：**Proxy 是代理对象，用来封装真是主题类的代理类。  
**客户端 ：**使用代理类和主题接口完成一些工作。

##### 3、代理模式的分类

代理的实现分为：

**静态代理：**代理类是在编译时就实现好的。也就是说 Java 编译完成后代理类是一个实际的 class 文件。  
**动态代理：**代理类是在运行时生成的。也就是说 Java 编译完之后并没有实际的 class 文件，而是在运行时动态生成的类字节码，并加载到JVM中。

##### 4、代理模式的实现思路

1.代理对象和目标对象均实现同一个行为接口。

2.代理类和目标类分别具体实现接口逻辑。

3.在代理类的构造函数中实例化一个目标对象。

4.在代理类中调用目标对象的行为接口。

5.客户端想要调用目标对象的行为接口，只能通过代理类来操作。

##### 5、静态代理模式的简单实现

```java
public class ProxyDemo {
    public static void main(String args[]){
        RealSubject subject = new RealSubject();
        Proxy p = new Proxy(subject);
        p.request();
    }
}

interface Subject{
    void request();
}

class RealSubject implements Subject{
    public void request(){
        System.out.println("request");
    }
}

class Proxy implements Subject{
    private Subject subject;
    public Proxy(Subject subject){
        this.subject = subject;
    }
    public void request(){
        System.out.println("PreProcess");
        subject.request();
        System.out.println("PostProcess");
    }
}
```

目标对象\(RealSubject \)以及代理对象（Proxy）都实现了主题接口（Subject）。在代理对象（Proxy）中，通过构造函数传入目标对象\(RealSubject \)，然后重写主题接口（Subject）的request\(\)方法，在该方法中调用目标对象\(RealSubject \)的request\(\)方法，并可以添加一些额外的处理工作在目标对象\(RealSubject \)的request\(\)方法的前后。

**代理模式的好处：**

假如有这样的需求，要在某些模块方法调用前后加上一些统一的前后处理操作，比如在添加购物车、修改订单等操作前后统一加上登陆验证与日志记录处理，该怎样实现？首先想到最简单的就是直接修改源码，在对应模块的对应方法前后添加操作。如果模块很多，你会发现，修改源码不仅非常麻烦、难以维护，而且会使代码显得十分臃肿。

这时候就轮到代理模式上场了，它可以在被调用方法前后加上自己的操作，而不需要更改被调用类的源码，大大地降低了模块之间的耦合性，体现了极大的优势。

静态代理比较简单，上面的简单实例就是静态代理的应用方式，下面介绍本篇文章的主题：动态代理。

### 二、Java反射机制与动态代理

动态代理的思路和上述思路一致，下面主要讲解如何实现。

##### 1、动态代理介绍

动态代理是指在运行时动态生成代理类。即，代理类的字节码将在运行时生成并载入当前代理的 ClassLoader。与静态处理类相比，动态类有诸多好处。

①不需要为\(RealSubject \)写一个形式上完全一样的封装类，假如主题接口（Subject）中的方法很多，为每一个接口写一个代理方法也很麻烦。如果接口有变动，则目标对象和代理类都要修改，不利于系统维护；

②使用一些动态代理的生成方法甚至可以在运行时制定代理类的执行逻辑，从而大大提升系统的灵活性。

###### 2、动态代理涉及的主要类

主要涉及两个类，这两个类都是java.lang.reflect包下的类，内部主要通过反射来实现的。

**java.lang.reflect.Proxy:**这是生成代理类的主类，通过 Proxy 类生成的代理类都继承了 Proxy 类。  
Proxy提供了用户创建动态代理类和代理对象的静态方法，它是所有动态代理类的父类。

**java.lang.reflect.InvocationHandler:**这里称他为"调用处理器"，它是一个接口。当调用动态代理类中的方法时，将会直接转接到执行自定义的InvocationHandler中的invoke\(\)方法。即我们动态生成的代理类需要完成的具体内容需要自己定义一个类，而这个类必须实现 InvocationHandler 接口，通过重写invoke\(\)方法来执行具体内容。

Proxy提供了如下两个方法来创建动态代理类和动态代理实例。

> static Class&lt;?&gt; getProxyClass\(ClassLoader loader, Class&lt;?&gt;... interfaces\) 返回代理类的java.lang.Class对象。第一个参数是类加载器对象（即哪个类加载器来加载这个代理类到 JVM 的方法区），第二个参数是接口（表明你这个代理类需要实现哪些接口），第三个参数是调用处理器类实例（指定代理类中具体要干什么），该代理类将实现interfaces所指定的所有接口，执行代理对象的每个方法时都会被替换执行InvocationHandler对象的invoke方法。
>
> static Object newProxyInstance\(ClassLoader loader, Class&lt;?&gt;\[\] interfaces, InvocationHandler h\) 返回代理类实例。参数与上述方法一致。

对应上述两种方法创建动态代理对象的方式：

```java
        //创建一个InvocationHandler对象
        InvocationHandler handler = new MyInvocationHandler(.args..);
        //使用Proxy生成一个动态代理类
        Class proxyClass = Proxy.getProxyClass(RealSubject.class.getClassLoader(),RealSubject.class.getInterfaces(), handler);
        //获取proxyClass类中一个带InvocationHandler参数的构造器
        Constructor constructor = proxyClass.getConstructor(InvocationHandler.class);
        //调用constructor的newInstance方法来创建动态实例
        RealSubject real = (RealSubject)constructor.newInstance(handler);
```

```java
        //创建一个InvocationHandler对象
        InvocationHandler handler = new MyInvocationHandler(.args..);
        //使用Proxy直接生成一个动态代理对象
        RealSubject real =Proxy.newProxyInstance(RealSubject.class.getClassLoader(),RealSubject.class.getInterfaces(), handler);
```

**newProxyInstance这个方法实际上做了两件事：第一，创建了一个新的类【代理类】，这个类实现了Class\[\] interfaces中的所有接口，并通过你指定的ClassLoader将生成的类的字节码加载到JVM中，创建Class对象；第二，以你传入的InvocationHandler作为参数创建一个代理类的实例并返回。**

Proxy 类还有一些静态方法，比如：

`InvocationHandler getInvocationHandler(Object proxy):`获得代理对象对应的调用处理器对象。

`Class getProxyClass(ClassLoader loader, Class[] interfaces):`根据类加载器和实现的接口获得代理类。

InvocationHandler 接口中有方法：

`invoke(Object proxy, Method method, Object[] args)`  
这个函数是在代理对象调用任何一个方法时都会调用的，方法不同会导致第二个参数method不同，第一个参数是代理对象（表示哪个代理对象调用了method方法），第二个参数是 Method 对象（表示哪个方法被调用了），第三个参数是指定调用方法的参数。

##### 3、动态代理模式的简单实现

```java
public class DynamicProxyDemo {
    public static void main(String[] args) {
        //1.创建目标对象
        RealSubject realSubject = new RealSubject();    
        //2.创建调用处理器对象
        ProxyHandler handler = new ProxyHandler(realSubject);    
       //3.动态生成代理对象
        Subject proxySubject = (Subject)Proxy.newProxyInstance(RealSubject.class.getClassLoader(),
                                                        RealSubject.class.getInterfaces(), handler);   
        //4.通过代理对象调用方法   
        proxySubject.request();    
    }
}

/**
 * 主题接口
 */
interface Subject{
    void request();
}

/**
 * 目标对象类
 */
class RealSubject implements Subject{
    public void request(){
        System.out.println("====RealSubject Request====");
    }
}
/**
 * 代理类的调用处理器
 */
class ProxyHandler implements InvocationHandler{
    private Subject subject;
    public ProxyHandler(Subject subject){
        this.subject = subject;
    }
    @Override
    public Object invoke(Object proxy, Method method, Object[] args)
            throws Throwable {
        //定义预处理的工作，当然你也可以根据 method 的不同进行不同的预处理工作
        System.out.println("====before====");
       //调用RealSubject中的方法
        Object result = method.invoke(subject, args);
        System.out.println("====after====");
        return result;
    }
}
```

可以看到，我们通过newProxyInstance就产生了一个Subject 的实例，即代理类的实例，然后就可以通过Subject .request\(\)，就会调用InvocationHandler中的invoke\(\)方法，传入方法Method对象，以及调用方法的参数，通过Method.invoke调用RealSubject中的方法的request\(\)方法。同时可以在InvocationHandler中的invoke\(\)方法加入其他执行逻辑。

