### 一、泛型和Class类

从JDK 1.5 后，Java中引入泛型机制，Class类也增加了泛型功能，从而允许使用泛型来限制Class类，例如：String.class的类型实际上是Class&lt;String&gt;。如果Class对应的类暂时未知，则使用Class&lt;?&gt;\(?是通配符\)。通过反射中使用泛型，可以避免使用反射生成的对象需要强制类型转换。

泛型的好处众多，最主要的一点就是避免类型转换，防止出现ClassCastException，即类型转换异常。以下面程序为例：

```java
public class ObjectFactory {
    public static Object getInstance(String name){
        try {
            //创建指定类对应的Class对象
            Class cls = Class.forName(name);
            //返回使用该Class对象创建的实例
            return cls.newInstance();
        } catch (ClassNotFoundException | InstantiationException | IllegalAccessException e) {
            e.printStackTrace();
            return null;
        }
    }

}
```

上面程序是个工厂类，通过指定的字符串创建Class对象并创建一个类的实例对象返回。但是这个对象的类型是Object对象，取出实例后需要强制类型转换。  
如下例：

```java
Date date = (Date) ObjectFactory.getInstance("java.util.Date");
```

或者如下：

```java
String string = (String) ObjectFactory.getInstance("java.util.Date");
```

上面代码在编译时不会有任何问题，但是运行时将抛出ClassCastException异常，因为程序试图将一个Date对象转换成String对象。

但是泛型的出现后，就可以避免这种情况。

```java
public class ObjectFactory {
    public static <T> T getInstance(Class<T> cls) {
        try {
            // 返回使用该Class对象创建的实例
            return cls.newInstance();
        } catch (InstantiationException | IllegalAccessException e) {
            e.printStackTrace();
            return null;
        }
    }

}
```

在上面程序的getInstance\(\)方法中传入一个Class&lt;T&gt;参数，这是一个泛型化的Class对象，调用该Class对象的newInstance\(\)方法将返回一个T对象。

```java
String instance = ObjectFactory.getInstance(String.class);
```

通过传入`String.class`便知道T代表String，所以返回的对象是String类型的，避免强制类型转换。

当然Class类引入泛型的好处不止这一点，在以后的实际应用中会更加能体会到。

### 二、使用反射来获取泛型信息

通过指定类对应的 Class 对象，可以获得该类里包含的所有 Field，不管该 Field 是使用 private 修饰，还是使用 public 修饰。获得了 Field 对象后，就可以很容易地获得该 Field 的数据类型，即使用如下代码即可获得指定 Field 的类型。

```java
// 获取 Field 对象 f 的类型
Class<?> a = f.getType();
```

但这种方式只对普通类型的 Field 有效。如果该 Field 的类型是有泛型限制的类型，如 Map&lt;String, Integer&gt; 类型，则不能准确地得到该 Field 的泛型参数。

为了获得指定 Field 的泛型类型，应先使用如下方法来获取指定 Field 的类型。

```java
// 获得 Field 实例的泛型类型
Type type = f.getGenericType();
```

然后将 Type 对象强制类型转换为 ParameterizedType 对象，ParameterizedType 代表被参数化的类型，也就是增加了泛型限制的类型。ParameterizedType 类提供了如下两个方法。

**getRawType\(\)：**返回没有泛型信息的原始类型。

**getActualTypeArguments\(\)：**返回泛型参数的类型。

下面是一个获取泛型类型的完整程序。

```java
public class GenericTest
{
    private Map<String , Integer> score;
    public static void main(String[] args)
        throws Exception
    {
        Class<GenericTest> clazz = GenericTest.class;
        Field f = clazz.getDeclaredField("score");
        // 直接使用getType()取出Field类型只对普通类型的Field有效
        Class<?> a = f.getType();
        // 下面将看到仅输出java.util.Map
        System.out.println("score的类型是:" + a);
        // 获得Field实例f的泛型类型
        Type gType = f.getGenericType();
        // 如果gType类型是ParameterizedType对象
        if(gType instanceof ParameterizedType)
        {
            // 强制类型转换
            ParameterizedType pType = (ParameterizedType)gType;
            // 获取原始类型
            Type rType = pType.getRawType();
            System.out.println("原始类型是：" + rType);
            // 取得泛型类型的泛型参数
            Type[] tArgs = pType.getActualTypeArguments();
            System.out.println("泛型类型是:");
            for (int i = 0; i < tArgs.length; i++) 
            {
                System.out.println("第" + i + "个泛型类型是：" + tArgs[i]);
            }
        }
        else
        {
            System.out.println("获取泛型类型出错！");
        }
    }
}
```

输出结果：

> score 的类型是: interface java.util.Map  
> 原始类型是: interface java.util.Map  
> 泛型类型是:  
> 第 0 个泛型类型是: class java.lang.String  
> 第 1 个泛型类型是：class java.lang.Integer

从上面的运行结果可以看出，直接使用 Field 的 getType\(\) 方法只能获取普通类型的 Field 的数据类型：对于增加了泛型参数的类型的 Field，应该使用 getGenericType\(\) 方法来取得其类型。

Type 也是 java.lang.reflect 包下的一个接口，该接口代表所有类型的公共高级接口，Class 是 Type 接口的实现类。Type 包括原始类型、参数化类型、数组类型、类型变量和基本类型等。

