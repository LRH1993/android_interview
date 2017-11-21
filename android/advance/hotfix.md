## 一、概述

最新github上开源了很多热补丁动态修复框架，大致有：

- <https://github.com/dodola/HotFix>
- <https://github.com/jasonross/Nuwa>
- <https://github.com/bunnyblue/DroidFix>

上述三个框架呢，根据其描述，原理都来自：[安卓App热补丁动态修复技术介绍](https://mp.weixin.qq.com/s?__biz=MzI1MTA1MzM2Nw==&mid=400118620&idx=1&sn=b4fdd5055731290eef12ad0d17f39d4a&scene=1&srcid=1106Imu9ZgwybID13e7y2nEi#wechat_redirect)，以及[Android dex分包方案](http://my.oschina.net/853294317/blog/308583)，所以这俩篇务必要看。这里就不对三个框架做过多对比了，因为原理都一致，实现的代码可能差异并不是特别大。

有兴趣的直接看这篇原理文章，加上上面框架的源码基本就可以看懂了。当然了，本篇博文也会做个上述框架源码的解析，以及在整个实现过程中用到的技术的解析。

## 二、热修复原理

对于热修复的原理，如果你看了上面的两篇文章，相信你已经大概明白了。重点需要知道的就是，Android的ClassLoader体系，android中加载类一般使用的是`PathClassLoader`和`DexClassLoader`，首先看下这两个类的区别：

- 对于`PathClassLoader`，从文档上的注释来看：

  > Provides a simple {@link ClassLoader} implementation that operates 
  > on a list of files and directories in the local file system, but 
  > does not attempt to load classes from the network. Android uses 
  > this class for its system class loader and for its application 
  > class loader(s).

  可以看出，Android是使用这个类作为其系统类和应用类的加载器。并且对于这个类呢，只能去加载已经安装到Android系统中的apk文件。

- 对于`DexClassLoader`，依然看下注释：

  > A class loader that loads classes from {@code .jar} and 
  > {@code .apk} files containing a {@code classes.dex} entry. 
  > This can be used to execute code not installed as part of an application.

  可以看出，该类呢，可以用来从.jar和.apk类型的文件内部加载classes.dex文件。可以用来执行非安装的程序代码。

  ok，如果大家对于插件化有所了解，肯定对这个类不陌生，插件化一般就是提供一个apk（插件）文件，然后在程序中load该apk，那么如何加载apk中的类呢？其实就是通过这个DexClassLoader，具体的代码我们后面有描述。

ok，到这里，大家只需要明白，Android使用PathClassLoader作为其类加载器，DexClassLoader可以从.jar和.apk类型的文件内部加载classes.dex文件就好了。

上面我们已经说了，Android使用PathClassLoader作为其类加载器，那么热修复的原理具体是？

ok，对于加载类，无非是给个classname，然后去findClass，我们看下源码就明白了。 
`PathClassLoader`和`DexClassLoader`都继承自`BaseDexClassLoader`。在BaseDexClassLoader中有如下源码：

```java
#BaseDexClassLoader
@Override
protected Class<?> findClass(String name) throws ClassNotFoundException {
    Class clazz = pathList.findClass(name);

    if (clazz == null) {
        throw new ClassNotFoundException(name);
    }

    return clazz;
}

#DexPathList
public Class findClass(String name) {
    for (Element element : dexElements) {
        DexFile dex = element.dexFile;

        if (dex != null) {
            Class clazz = dex.loadClassBinaryName(name, definingContext);
            if (clazz != null) {
                return clazz;
            }
        }
    }

    return null;
}

#DexFile
public Class loadClassBinaryName(String name, ClassLoader loader) {
    return defineClass(name, loader, mCookie);
}
private native static Class defineClass(String name, ClassLoader loader, int cookie);
```

可以看出呢，BaseDexClassLoader中有个pathList对象，pathList中包含一个DexFile的集合dexElements，而对于类加载呢，就是遍历这个集合，通过DexFile去寻找。

ok，通俗点说：

> 一个ClassLoader可以包含多个dex文件，每个dex文件是一个Element，多个dex文件排列成一个有序的数组dexElements，当找类的时候，会按顺序遍历dex文件，然后从当前遍历的dex文件中找类，如果找类则返回，如果找不到从下一个dex文件继续查找。(来自：安卓App热补丁动态修复技术介绍)

那么这样的话，我们可以在这个dexElements中去做一些事情，比如，在这个数组的第一个元素放置我们的patch.jar，里面包含修复过的类，这样的话，当遍历findClass的时候，我们修复的类就会被查找到，从而替代有bug的类。

说到这，你可能已经露出笑容了，原来热修复原理这么简单。不过，还存在一个`CLASS_ISPREVERIFIED`的问题，对于这个问题呢，详见：[安卓App热补丁动态修复技术介绍](https://mp.weixin.qq.com/s?__biz=MzI1MTA1MzM2Nw==&mid=400118620&idx=1&sn=b4fdd5055731290eef12ad0d17f39d4a&scene=1&srcid=1106Imu9ZgwybID13e7y2nEi#wechat_redirect)该文有图文详解。

ok，对于`CLASS_ISPREVERIFIED`，还是带大家理一下：

根据上面的文章，在虚拟机启动的时候，当verify选项被打开的时候，如果static方法、private方法、构造函数等，其中的直接引用（第一层关系）到的类都在同一个dex文件中，那么该类就会被打上`CLASS_ISPREVERIFIED`标志。

那么，我们要做的就是，阻止该类打上`CLASS_ISPREVERIFIED`的标志。

注意下，是阻止引用者的类，也就是说，假设你的app里面有个类叫做`LoadBugClass`，再其内部引用了`BugClass`。发布过程中发现`BugClass`有编写错误，那么想要发布一个新的`BugClass`类，那么你就要阻止`LoadBugClass`这个类打上`CLASS_ISPREVERIFIED`的标志。

也就是说，你在生成apk之前，就需要阻止相关类打上`CLASS_ISPREVERIFIED`的标志了。对于如何阻止，上面的文章说的很清楚，让`LoadBugClass`在构造方法中，去引用别的dex文件，比如：hack.dex中的某个类即可。

ok，总结下：

其实就是两件事：1、动态改变BaseDexClassLoader对象间接引用的dexElements；2、在app打包的时候，阻止相关类去打上`CLASS_ISPREVERIFIED`标志。

如果你没有看明白，没事，多看几遍，下面也会通过代码来说明。

## 三、阻止相关类打上`CLASS_ISPREVERIFIED`标志

ok，接下来的代码基本上会通过<https://github.com/dodola/HotFix>所提供的代码来讲解。

那么，这里拿具体的类来说：

大致的流程是：在dx工具执行之前，将`LoadBugClass.class`文件呢，进行修改，再其构造中添加`System.out.println(dodola.hackdex.AntilazyLoad.class)`，然后继续打包的流程。注意：`AntilazyLoad.class`这个类是独立在hack.dex中。

ok，这里大家可能会有2个疑问：

1. 如何去修改一个类的class文件
2. 如何在dx之前去进行疑问1的操作

### (1）如何去修改一个类的class文件

这里我们使用javassist来操作，很简单：

ok，首先我们新建几个类：

```java
package dodola.hackdex;
public class AntilazyLoad
{

}

package dodola.hotfix;
public class BugClass
{
    public String bug()
    {
        return "bug class";
    }
}

package dodola.hotfix;
public class LoadBugClass
{
    public String getBugString()
    {
        BugClass bugClass = new BugClass();
        return bugClass.bug();
    }
}
```

注意下，这里的package，我们要做的是，上述类正常编译以后产生class文件。比如：LoadBugClass.class，我们在LoadBugClass.class的构造中去添加一行：

```java
System.out.println(dodola.hackdex.AntilazyLoad.class)
```

下面看下操作类：

```java
package test;

import javassist.ClassPool;
import javassist.CtClass;
import javassist.CtConstructor;

public class InjectHack
{
    public static void main(String[] args)
    {
        try
        {
            String path = "/Users/zhy/develop_work/eclipse_android/imooc/JavassistTest/";
            ClassPool classes = ClassPool.getDefault();
            classes.appendClassPath(path + "bin");//项目的bin目录即可
            CtClass c = classes.get("dodola.hotfix.LoadBugClass");
            CtConstructor ctConstructor = c.getConstructors()[0];
            ctConstructor
                    .insertAfter("System.out.println(dodola.hackdex.AntilazyLoad.class);");
            c.writeFile(path + "/output");
        } catch (Exception e)
        {
            e.printStackTrace();
        }

    }
}
```

ok，点击run即可了，注意项目中导入javassist-*.jar的包。

首先拿到ClassPool对象，然后添加classpath，如果你有多个classpath可以多次调用。然后从classpath中找到LoadBugClass，拿到其构造方法，在其最后插入一行代码。ok，代码很好懂。

ok，我们反编译看下我们生成的class文件：

![img](http://img.blog.csdn.net/20151117095755788)

ok，关于javassist，如果有兴趣的话，大家可以参考几篇文章学习下：

- <http://www.ibm.com/developerworks/cn/java/j-dyn0916/>
- <http://zhxing.iteye.com/blog/1703305>

### (2）如何在dx之前去进行(1)的操作

ok，这个就结合<https://github.com/dodola/HotFix>的源码来说了。

将其源码导入之后，打开app/build.gradle

```java
apply plugin: 'com.android.application'

task('processWithJavassist') << {
    String classPath = file('build/intermediates/classes/debug')//项目编译class所在目录
    dodola.patch.PatchClass.process(classPath, project(':hackdex').buildDir
            .absolutePath + '/intermediates/classes/debug')//第二个参数是hackdex的class所在目录

}
android {
    applicationVariants.all { variant ->
        variant.dex.dependsOn << processWithJavassist //在执行dx命令之前将代码打入到class中
    }
}
```

你会发现，在执行dx之前，会先执行processWithJavassist这个任务。这个任务的作用呢，就和我们上面的代码一致了。而且源码也给出了，大家自己看下。

ok，到这呢，你就可以点击run了。ok，有兴趣的话，你可以反编译去看看`dodola.hotfix.LoadBugClass`这个类的构造方法中是否已经添加了改行代码。

关于反编译的用法，工具等，参考：<http://blog.csdn.net/lmj623565791/article/details/23564065>

ok，到此我们已经能够正常的安装apk并且运行了。但是目前还未涉及到打补丁的相关代码。

## 四、动态改变BaseDexClassLoader对象间接引用的dexElements

ok，这里就比较简单了，动态改变一个对象的某个引用我们反射就可以完成了。

不过这里需要注意的是，还记得我们之前说的，寻找class是遍历dexElements；然后我们的`AntilazyLoad.class`实际上并不包含在apk的classes.dex中，并且根据上面描述的需要，我们需要将`AntilazyLoad.class`这个类打成独立的hack_dex.jar，注意不是普通的jar，必须经过dx工具进行转化。

具体做法:

```java
jar cvf hack.jar dodola/hackdex/*
dx  --dex --output hack_dex.jar hack.jar 1212
```

如果，你没有办法把那一个class文件搞成jar，去百度一下…

ok，现在有了hack_dex.jar，这个是干嘛的呢？

应该还记得，我们的app中部门类引用了`AntilazyLoad.class`，那么我们必须在应用启动的时候，将这个hack_dex.jar插入到dexElements，否则肯定会出事故的。

那么，Application的onCreate方法里面就很适合做这件事情，我们把hack_dex.jar放到assets目录。

下面看hotfix的源码：

```java
/*
 * Copyright (C) 2015 Baidu, Inc. All Rights Reserved.
 */
package dodola.hotfix;

import android.app.Application;
import android.content.Context;

import java.io.File;

import dodola.hotfixlib.HotFix;

/**
 * Created by sunpengfei on 15/11/4.
 */
public class HotfixApplication extends Application
{

    @Override
    public void onCreate()
    {
        super.onCreate();
        File dexPath = new File(getDir("dex", Context.MODE_PRIVATE), "hackdex_dex.jar");
        Utils.prepareDex(this.getApplicationContext(), dexPath, "hackdex_dex.jar");
        HotFix.patch(this, dexPath.getAbsolutePath(), "dodola.hackdex.AntilazyLoad");
        try
        {
            this.getClassLoader().loadClass("dodola.hackdex.AntilazyLoad");
        } catch (ClassNotFoundException e)
        {
            e.printStackTrace();
        }

    }
}
```

ok，在app的私有目录创建一个文件，然后调用Utils.prepareDex将assets中的hackdex_dex.jar写入该文件。 
接下来HotFix.patch就是去反射去修改dexElements了。我们深入看下源码：

```java
/*
 * Copyright (C) 2015 Baidu, Inc. All Rights Reserved.
 */
package dodola.hotfix;

/**
 * Created by sunpengfei on 15/11/4.
 */
public class Utils {
    private static final int BUF_SIZE = 2048;

    public static boolean prepareDex(Context context, File dexInternalStoragePath, String dex_file) {
        BufferedInputStream bis = null;
        OutputStream dexWriter = null;
        bis = new BufferedInputStream(context.getAssets().open(dex_file));
        dexWriter = new BufferedOutputStream(new FileOutputStream(dexInternalStoragePath));
        byte[] buf = new byte[BUF_SIZE];
        int len;
        while ((len = bis.read(buf, 0, BUF_SIZE)) > 0) {
            dexWriter.write(buf, 0, len);
        }
        dexWriter.close();
        bis.close();
        return true;

}
```

ok，其实就是文件的一个读写，将assets目录的文件，写到app的私有目录中的文件。

下面主要看patch方法

```java
/*
 * Copyright (C) 2015 Baidu, Inc. All Rights Reserved.
 */
package dodola.hotfixlib;

import android.annotation.TargetApi;
import android.content.Context;

import java.io.File;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;

import dalvik.system.DexClassLoader;
import dalvik.system.PathClassLoader;

/* compiled from: ProGuard */
public final class HotFix
{
    public static void patch(Context context, String patchDexFile, String patchClassName)
    {
        if (patchDexFile != null && new File(patchDexFile).exists())
        {
            try
            {
                if (hasLexClassLoader())
                {
                    injectInAliyunOs(context, patchDexFile, patchClassName);
                } else if (hasDexClassLoader())
                {
                    injectAboveEqualApiLevel14(context, patchDexFile, patchClassName);
                } else
                {

                    injectBelowApiLevel14(context, patchDexFile, patchClassName);

                }
            } catch (Throwable th)
            {
            }
        }
    }
 }
```

这里很据系统中ClassLoader的类型做了下判断，原理都是反射，我们看其中一个分支`hasDexClassLoader()`;

```java
private static boolean hasDexClassLoader()
{
    try
    {
        Class.forName("dalvik.system.BaseDexClassLoader");
        return true;
    } catch (ClassNotFoundException e)
    {
        return false;
    }
}


 private static void injectAboveEqualApiLevel14(Context context, String str, String str2)
            throws ClassNotFoundException, NoSuchFieldException, IllegalAccessException
{
    PathClassLoader pathClassLoader = (PathClassLoader) context.getClassLoader();
    Object a = combineArray(getDexElements(getPathList(pathClassLoader)),
            getDexElements(getPathList(
                    new DexClassLoader(str, context.getDir("dex", 0).getAbsolutePath(), str, context.getClassLoader()))));
    Object a2 = getPathList(pathClassLoader);
    setField(a2, a2.getClass(), "dexElements", a);
    pathClassLoader.loadClass(str2);
}
```

首先查找类`dalvik.system.BaseDexClassLoader`，如果找到则进入if体。

在injectAboveEqualApiLevel14中，根据context拿到PathClassLoader，然后通过getPathList(pathClassLoader)，拿到PathClassLoader中的pathList对象，在调用getDexElements通过pathList取到dexElements对象。

ok，那么我们的hack_dex.jar如何转化为dexElements对象呢？

通过源码可以看出，首先初始化了一个DexClassLoader对象，前面我们说过DexClassLoader的父类也是BaseDexClassLoader，那么我们可以通过和PathClassLoader同样的方式取得dexElements。

ok，到这里，我们取得了，系统中PathClassLoader对象的间接引用dexElements，以及我们的hack_dex.jar中的dexElements，接下来就是合并这两个数组了。

可以看到上面的代码使用的是combineArray方法。

合并完成后，将新的数组通过反射的方式设置给pathList.

接下来看一下反射的细节：

```java
private static Object getPathList(Object obj) throws ClassNotFoundException, NoSuchFieldException,
            IllegalAccessException
{
    return getField(obj, Class.forName("dalvik.system.BaseDexClassLoader"), "pathList");
}

private static Object getDexElements(Object obj) throws NoSuchFieldException, IllegalAccessException
{
    return getField(obj, obj.getClass(), "dexElements");
}

private static Object getField(Object obj, Class cls, String str)
            throws NoSuchFieldException, IllegalAccessException
{
    Field declaredField = cls.getDeclaredField(str);
    declaredField.setAccessible(true);
    return declaredField.get(obj);
}
```

其实都是取成员变量的过程，应该很容易懂~~

```java
private static Object combineArray(Object obj, Object obj2)
{
    Class componentType = obj2.getClass().getComponentType();
    int length = Array.getLength(obj2);
    int length2 = Array.getLength(obj) + length;
    Object newInstance = Array.newInstance(componentType, length2);
    for (int i = 0; i < length2; i++)
    {
        if (i < length)
        {
            Array.set(newInstance, i, Array.get(obj2, i));
        } else
        {
            Array.set(newInstance, i, Array.get(obj, i - length));
        }
    }
    return newInstance;
}
```

ok，这里的两个数组合并，只需要注意一件事，将hack_dex.jar里面的dexElements放到新数组前面即可。

到此，我们就完成了在应用启动的时候，动态的将hack_dex.jar中包含的DexFile注入到ClassLoader的dexElements中。这样就不会查找不到AntilazyLoad这个类了。

ok，那么到此呢，还是没有看到我们如何打补丁，哈，其实呢，已经说过了，打补丁的过程和我们注入hack_dex.jar是一致的。

你现在运行HotFix的app项目，点击menu里面的测试：

会弹出：`调用测试方法：bug class`

接下来就看如何完成热修复。

## 五、完成热修复

ok，那么我们假设BugClass这个类有错误，需要修复：

```java
package dodola.hotfix;

public class BugClass
{
    public String bug()
    {
        return "fixed class";
    }
}
```

可以看到字符串变化了：bug class -> fixed class .

然后，编译，将这个类的class->jar->dex。步骤和上面是一致的。

```java
 jar cvf path.jar dodola/hotfix/BugClass.class 
 dx  --dex --output path_dex.jar path.jar 1212
```

拿到path_dex.jar文件。

正常情况下，这个玩意应该是下载得到的，当然我们介绍原理，你可以直接将其放置到sdcard上。

然后在Application的onCreate中进行读取，我们这里为了方便也放置到assets目录，然后在Application的onCreate中添加代码：

```java
public class HotfixApplication extends Application
{

    @Override
    public void onCreate()
    {
        super.onCreate();
        File dexPath = new File(getDir("dex", Context.MODE_PRIVATE), "hackdex_dex.jar");
        Utils.prepareDex(this.getApplicationContext(), dexPath, "hack_dex.jar");
        HotFix.patch(this, dexPath.getAbsolutePath(), "dodola.hackdex.AntilazyLoad");
        try
        {
            this.getClassLoader().loadClass("dodola.hackdex.AntilazyLoad");
        } catch (ClassNotFoundException e)
        {
            e.printStackTrace();
        }

        dexPath = new File(getDir("dex", Context.MODE_PRIVATE), "path_dex.jar");
        Utils.prepareDex(this.getApplicationContext(), dexPath, "path_dex.jar");
        HotFix.patch(this, dexPath.getAbsolutePath(), "dodola.hotfix.BugClass");

    }
}
```

其实就是添加了后面的3行，这里需要说明一下，第一行依旧是复制到私有目录，如果你是sdcard上，那么操作基本是一致的，这里就别问：如果在sdcard或者网络上怎么处理~

ok，那么再次运行我们的app。

![img](http://img.blog.csdn.net/20151117095833727)

ok，最后说一下，说项目中有一个打补丁的按钮，在menu下，那么你也可以不在Application里面添加我们最后的3行。

你运行app后，先点击`打补丁`，然后点击`测试`也可以发现成功修复了。

如果先点击`测试`，再点击`打补丁`，再`测试`是不会变化的，因为类一旦加载以后，不会重新再去重新加载了。

ok，到此，我们的热修复的原理，已经解决方案，我相信已经很详细的介绍完成了，如果你有足够的耐心一定可以实现。中间制作补丁等操作，我们的操作比较麻烦，自动化的话，可以参考<https://github.com/jasonross/Nuwa>。