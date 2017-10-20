### 一、概述

**Java反射机制定义**

Java反射机制是在运行状态中，对于任意一个类，都能够知道这个类中的所有属性和方法；对于任意一个对象，都能够调用它的任意一个方法和属性；这种动态获取的信息以及动态调用对象的方法的功能称为java语言的反射机制。  
**Java 反射机制的功能**

1.在运行时判断任意一个对象所属的类。

2.在运行时构造任意一个类的对象。

3.在运行时判断任意一个类所具有的成员变量和方法。

4.在运行时调用任意一个对象的方法。

5.生成动态代理。

**Java 反射机制的应用场景**

1.逆向代码 ，例如反编译

2.与注解相结合的框架 例如Retrofit

3.单纯的反射机制应用框架 例如EventBus

4.动态生成类框架 例如Gson

### 二、通过Java反射查看类信息

**获得Class对象**  
每个类被加载之后，系统就会为该类生成一个对应的Class对象。通过该Class对象就可以访问到JVM中的这个类。

在Java程序中获得Class对象通常有如下三种方式：

1.使用Class类的forName\(String clazzName\)静态方法。该方法需要传入字符串参数，该字符串参数的值是某个类的全限定名（必须添加完整包名）。

2.调用某个类的class属性来获取该类对应的Class对象。

3.调用某个对象的getClass\(\)方法。该方法是java.lang.Object类中的一个方法。

```java
//第一种方式 通过Class类的静态方法——forName()来实现
class1 = Class.forName("com.lvr.reflection.Person");
//第二种方式 通过类的class属性
class1 = Person.class;
//第三种方式 通过对象getClass方法
Person person = new Person();
Class<?> class1 = person.getClass();
```

**获取class对象的属性、方法、构造函数等**

1.获取class对象的成员变量

```java
Field[] allFields = class1.getDeclaredFields();//获取class对象的所有属性
Field[] publicFields = class1.getFields();//获取class对象的public属性
Field ageField = class1.getDeclaredField("age");//获取class指定属性
Field desField = class1.getField("des");//获取class指定的public属性
```

2.获取class对象的方法

```java
Method[] methods = class1.getDeclaredMethods();//获取class对象的所有声明方法
Method[] allMethods = class1.getMethods();//获取class对象的所有public方法 包括父类的方法
Method method = class1.getMethod("info", String.class);//返回次Class对象对应类的、带指定形参列表的public方法
Method declaredMethod = class1.getDeclaredMethod("info", String.class);//返回次Class对象对应类的、带指定形参列表的方法
```

3.获取class对象的构造函数

```java
Constructor<?>[] allConstructors = class1.getDeclaredConstructors();//获取class对象的所有声明构造函数
Constructor<?>[] publicConstructors = class1.getConstructors();//获取class对象public构造函数
Constructor<?> constructor = class1.getDeclaredConstructor(String.class);//获取指定声明构造函数
Constructor publicConstructor = class1.getConstructor(String.class);//获取指定声明的public构造函数
```

4.其他方法

```java
Annotation[] annotations = (Annotation[]) class1.getAnnotations();//获取class对象的所有注解
Annotation annotation = (Annotation) class1.getAnnotation(Deprecated.class);//获取class对象指定注解
Type genericSuperclass = class1.getGenericSuperclass();//获取class对象的直接超类的 Type
Type[] interfaceTypes = class1.getGenericInterfaces();//获取class对象的所有接口的type集合
```

**获取class对象的信息**

比较多。

```java
boolean isPrimitive = class1.isPrimitive();//判断是否是基础类型
boolean isArray = class1.isArray();//判断是否是集合类
boolean isAnnotation = class1.isAnnotation();//判断是否是注解类
boolean isInterface = class1.isInterface();//判断是否是接口类
boolean isEnum = class1.isEnum();//判断是否是枚举类
boolean isAnonymousClass = class1.isAnonymousClass();//判断是否是匿名内部类
boolean isAnnotationPresent = class1.isAnnotationPresent(Deprecated.class);//判断是否被某个注解类修饰
String className = class1.getName();//获取class名字 包含包名路径
Package aPackage = class1.getPackage();//获取class的包信息
String simpleName = class1.getSimpleName();//获取class类名
int modifiers = class1.getModifiers();//获取class访问权限
Class<?>[] declaredClasses = class1.getDeclaredClasses();//内部类
Class<?> declaringClass = class1.getDeclaringClass();//外部类
```

### 三、通过Java反射生成并操作对象

**生成类的实例对象**

1.使用Class对象的newInstance\(\)方法来创建该Class对象对应类的实例。这种方式要求该Class对象的对应类有默认构造器，而执行newInstance\(\)方法时实际上是利用默认构造器来创建该类的实例。

2.先使用Class对象获取指定的Constructor对象，再调用Constructor对象的newInstance\(\)方法来创建该Class对象对应类的实例。通过这种方式可以选择使用指定的构造器来创建实例。

```java
//第一种方式 Class对象调用newInstance()方法生成
Object obj = class1.newInstance();
//第二种方式 对象获得对应的Constructor对象，再通过该Constructor对象的newInstance()方法生成
Constructor<?> constructor = class1.getDeclaredConstructor(String.class);//获取指定声明构造函数
obj = constructor.newInstance("hello");
```

**调用类的方法**

1.通过Class对象的getMethods\(\)方法或者getMethod\(\)方法获得指定方法，返回Method数组或对象。

2.调用Method对象中的`Object invoke(Object obj, Object... args)`方法。第一个参数对应调用该方法的实例对象，第二个参数对应该方法的参数。

```java
 // 生成新的对象：用newInstance()方法
 Object obj = class1.newInstance();
//首先需要获得与该方法对应的Method对象
Method method = class1.getDeclaredMethod("setAge", int.class);
//调用指定的函数并传递参数
method.invoke(obj, 28);
```

**当通过Method的invoke\(\)方法来调用对应的方法时，Java会要求程序必须有调用该方法的权限。如果程序确实需要调用某个对象的private方法，则可以先调用Method对象的如下方法。**  
**setAccessible\(boolean flag\)：将Method对象的acessible设置为指定的布尔值。值为true，指示该Method在使用时应该取消Java语言的访问权限检查；值为false，则知识该Method在使用时要实施Java语言的访问权限检查。**

**访问成员变量值**

1.通过Class对象的getFields\(\)方法或者getField\(\)方法获得指定方法，返回Field数组或对象。

2.Field提供了两组方法来读取或设置成员变量的值：  
getXXX\(Object obj\):获取obj对象的该成员变量的值。此处的XXX对应8种基本类型。如果该成员变量的类型是引用类型，则取消get后面的XXX。  
setXXX\(Object obj,XXX val\)：将obj对象的该成员变量设置成val值。

```java
//生成新的对象：用newInstance()方法 
Object obj = class1.newInstance();
//获取age成员变量
Field field = class1.getField("age");
//将obj对象的age的值设置为10
field.setInt(obj, 10);
//获取obj对象的age的值
field.getInt(obj);
```



