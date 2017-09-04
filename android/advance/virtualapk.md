## 一、概述

之前一直没有写过插件化相关的博客，刚好最近滴滴和360分别开源了自家的插件化方案，赶紧学习下，写两篇博客，第一篇是滴滴的方案：

- <https://github.com/didi/VirtualAPK>

那么其中的难点很明显是对四大组件支持，因为大家都清楚，四大组件都是需要在AndroidManifest中注册的，而插件apk中的组件是不可能预先知晓名字，提前注册中宿主apk中的，所以现在基本都采用一些hack方案类解决，VirtualAPK大体方案如下：

- Activity：在宿主apk中提前占几个坑，然后通过“欺上瞒下”（这个词好像是360之前的ppt中提到）的方式，启动插件apk的Activity；因为要支持不同的launchMode以及一些特殊的属性，需要占多个坑。
- Service：通过代理Service的方式去分发；主进程和其他进程，VirtualAPK使用了两个代理Service。
- BroadcastReceiver：静态转动态
- ContentProvider：通过一个代理Provider进行分发。

这些占坑的数量并不是固定的，比如Activity想支持某个属性，该属性不能动态设置，只能在Manifest中设置，那就需要去占坑支持。所以占坑数量这些，可以根据自己的需求进行调整。

下面就逐一去分析代码啦~

> 注：本篇博客涉及到的framework逻辑，为API 22. 
> 分期版本为 com.didi.virtualapk:core:0.9.0

## 二、Activity的支持

这里就不按照某个流程一行行代码往下读了，针对性的讲一些关键流程，可能更好阅读一些。

首先看一段启动插件Activity的代码：

```java
final String pkg = "com.didi.virtualapk.demo";
if (PluginManager.getInstance(this).getLoadedPlugin(pkg) == null) {
    Toast.makeText(this, "plugin [com.didi.virtualapk.demo] not loaded", Toast.LENGTH_SHORT).show();
    return;
}

// test Activity and Service
Intent intent = new Intent();
intent.setClassName(pkg, "com.didi.virtualapk.demo.aidl.BookManagerActivity");
startActivity(intent);
```

可以看到优先根据包名判断该插件是否已经加载，所以在插件使用前其实还需要调用

```java
pluginManager.loadPlugin(apk);
```

加载插件。

这里就不赘述源码了，大致为调用`PackageParser.parsePackage`解析apk，获得该apk对应的PackageInfo，资源相关（AssetManager，Resources），DexClassLoader（加载类），四大组件相关集合（mActivityInfos，mServiceInfos，mReceiverInfos，mProviderInfos），针对Plugin的PluginContext等一堆信息，封装为LoadedPlugin对象。

> 详细可以参考`com.didi.virtualapk.internal.LoadedPlugin`类。

ok，如果该插件以及加载过，则直接通过startActivity去启动插件中目标Activity。

### （1）替换Activity

这里大家肯定会有疑惑，该Activity必然没有在Manifest中注册，这么启动不会报错吗？

正常肯定会报错呀，所以我们看看它是怎么做的吧。

跟进startActivity的调用流程，会发现其最终会进入Instrumentation的execStartActivity方法，然后再通过ActivityManagerProxy与AMS进行交互。

而Activity是否存在的校验是发生在AMS端，所以我们在于AMS交互前，提前将Activity的ComponentName进行替换为占坑的名字不就好了么？

这里可以选择hook Instrumentation，或者ActivityManagerProxy都可以达到目标，VirtualAPK选择了hook Instrumentation.

打开`PluginManager`可以看到如下方法：

```java
private void hookInstrumentationAndHandler() {
    try {
        Instrumentation baseInstrumentation = ReflectUtil.getInstrumentation(this.mContext);
        if (baseInstrumentation.getClass().getName().contains("lbe")) {
            // reject executing in paralell space, for example, lbe.
            System.exit(0);
        }

        final VAInstrumentation instrumentation = new VAInstrumentation(this, baseInstrumentation);
        Object activityThread = ReflectUtil.getActivityThread(this.mContext);
        ReflectUtil.setInstrumentation(activityThread, instrumentation);
        ReflectUtil.setHandlerCallback(this.mContext, instrumentation);
        this.mInstrumentation = instrumentation;
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

可以看到首先通过反射拿到了原本的`Instrumentation`对象，拿的过程是首先拿到ActivityThread，由于ActivityThread可以通过静态变量`sCurrentActivityThread`或者静态方法`currentActivityThread()`获取，所以拿到其对象相当轻松。拿到ActivityThread对象后，调用其`getInstrumentation()`方法，即可获取当前的Instrumentation对象。

然后自己创建了一个VAInstrumentation对象，接下来就直接反射将VAInstrumentation对象设置给ActivityThread对象即可。

这样就完成了hook Instrumentation,之后调用Instrumentation的任何方法，都可以在VAInstrumentation进行拦截并做一些修改。

这里还hook了ActivityThread的mH类的Callback，暂不赘述。

刚才说了，可以通过Instrumentation的execStartActivity方法进行偷梁换柱，所以我们直接看对应的方法：

```java
public ActivityResult execStartActivity(
        Context who, IBinder contextThread, IBinder token, Activity target,
        Intent intent, int requestCode, Bundle options) {
    mPluginManager.getComponentsHandler().transformIntentToExplicitAsNeeded(intent);
    // null component is an implicitly intent
    if (intent.getComponent() != null) {
        Log.i(TAG, String.format("execStartActivity[%s : %s]", intent.getComponent().getPackageName(),
                intent.getComponent().getClassName()));
        // resolve intent with Stub Activity if needed
        this.mPluginManager.getComponentsHandler().markIntentIfNeeded(intent);
    }

    ActivityResult result = realExecStartActivity(who, contextThread, token, target,
                intent, requestCode, options);

    return result;

}
```

首先调用transformIntentToExplicitAsNeeded，这个主要是当component为null时，根据启动Activity时，配置的action，data,category等去已加载的plugin中匹配到确定的Activity的。

本例我们的写法ComponentName肯定不为null，所以直接看`markIntentIfNeeded()`方法：

```java
public void markIntentIfNeeded(Intent intent) {
    if (intent.getComponent() == null) {
        return;
    }

    String targetPackageName = intent.getComponent().getPackageName();
    String targetClassName = intent.getComponent().getClassName();
    // search map and return specific launchmode stub activity
    if (!targetPackageName.equals(mContext.getPackageName())
            && mPluginManager.getLoadedPlugin(targetPackageName) != null) {
        intent.putExtra(Constants.KEY_IS_PLUGIN, true);
        intent.putExtra(Constants.KEY_TARGET_PACKAGE, targetPackageName);
        intent.putExtra(Constants.KEY_TARGET_ACTIVITY, targetClassName);
        dispatchStubActivity(intent);
    }
}
```

在该方法中判断如果启动的是插件中类，则将启动的包名和Activity类名存到了intent中，可以看到这里存储明显是为了后面恢复用的。

然后调用了`dispatchStubActivity(intent)`

```java
private void dispatchStubActivity(Intent intent) {
    ComponentName component = intent.getComponent();
    String targetClassName = intent.getComponent().getClassName();
    LoadedPlugin loadedPlugin = mPluginManager.getLoadedPlugin(intent);
    ActivityInfo info = loadedPlugin.getActivityInfo(component);
    if (info == null) {
        throw new RuntimeException("can not find " + component);
    }
    int launchMode = info.launchMode;
    Resources.Theme themeObj = loadedPlugin.getResources().newTheme();
    themeObj.applyStyle(info.theme, true);
    String stubActivity = mStubActivityInfo.getStubActivity(targetClassName, launchMode, themeObj);
    Log.i(TAG, String.format("dispatchStubActivity,[%s -> %s]", targetClassName, stubActivity));
    intent.setClassName(mContext, stubActivity);
}
```

可以直接看最后一行，intent通过setClassName替换启动的目标Activity了！这个stubActivity是由`mStubActivityInfo.getStubActivity(targetClassName, launchMode, themeObj)`返回。

很明显，传入的参数launchMode、themeObj都是决定选择哪一个占坑类用的。

```java
public String getStubActivity(String className, int launchMode, Theme theme) {
    String stubActivity= mCachedStubActivity.get(className);
    if (stubActivity != null) {
        return stubActivity;
    }

    TypedArray array = theme.obtainStyledAttributes(new int[]{
            android.R.attr.windowIsTranslucent,
            android.R.attr.windowBackground
    });
    boolean windowIsTranslucent = array.getBoolean(0, false);
    array.recycle();
    if (Constants.DEBUG) {
        Log.d("StubActivityInfo", "getStubActivity, is transparent theme ? " + windowIsTranslucent);
    }
    stubActivity = String.format(STUB_ACTIVITY_STANDARD, corePackage, usedStandardStubActivity);
    switch (launchMode) {
        case ActivityInfo.LAUNCH_MULTIPLE: {
            stubActivity = String.format(STUB_ACTIVITY_STANDARD, corePackage, usedStandardStubActivity);
            if (windowIsTranslucent) {
                stubActivity = String.format(STUB_ACTIVITY_STANDARD, corePackage, 2);
            }
            break;
        }
        case ActivityInfo.LAUNCH_SINGLE_TOP: {
            usedSingleTopStubActivity = usedSingleTopStubActivity % MAX_COUNT_SINGLETOP + 1;
            stubActivity = String.format(STUB_ACTIVITY_SINGLETOP, corePackage, usedSingleTopStubActivity);
            break;
        }

       // 省略LAUNCH_SINGLE_TASK，LAUNCH_SINGLE_INSTANCE
    }

    mCachedStubActivity.put(className, stubActivity);
    return stubActivity;
}
```

可以看到主要就是根据launchMode去选择不同的占坑类。 
例如：

```java
stubActivity = String.format(STUB_ACTIVITY_STANDARD, corePackage, usedStandardStubActivity);
```

`STUB_ACTIVITY_STANDARD值为："%s.A$%d"`, corePackage值为`com.didi.virtualapk.core`，usedStandardStubActivity为数字值。

所以最终类名格式为：`com.didi.virtualapk.core.A$1`

再看一眼，CoreLibrary下的AndroidManifest中：

```java
<activity android:name=".A$1" android:launchMode="standard"/>
<activity android:name=".A$2" android:launchMode="standard"
    android:theme="@android:style/Theme.Translucent" />

<!-- Stub Activities -->
<activity android:name=".B$1" android:launchMode="singleTop"/>
<activity android:name=".B$2" android:launchMode="singleTop"/>
<activity android:name=".B$3" android:launchMode="singleTop"/>
// 省略很多...    123456789123456789
```

就完全明白了。

到这里就可以看到，替换我们启动的Activity为占坑Activity，将我们原本启动的包名，类名存储到了Intent中。

这样做只完成了一半，为什么这么说呢？

### (2) 还原Activity

因为欺骗过了AMS，AMS执行完成后，最终要启动的不可能是占坑Activity，还应该是我们的启动的目标Activity呀。

这里需要知道Activity的启动流程：

AMS在处理完启动Activity后，会调用：`app.thread.scheduleLaunchActivity`，这里的thread对应的server端未我们ActivityThread中的ApplicationThread对象(binder可以理解有一个client端和一个server端)，所以会调用`ApplicationThread.scheduleLaunchActivity`方法，在其内部会调用mH类的sendMessage方法，传递的标识为`H.LAUNCH_ACTIVITY`，进入调用到ActivityThread的handleLaunchActivity方法->ActivityThread#handleLaunchActivity->mInstrumentation.newActivity()。

> ps:这里流程不清楚没关系，暂时理解为最终会回调到Instrumentation的newActivity方法即可，细节可以自己去查看结合老罗的blog理解。

关键的来了，最终又到了Instrumentation的newActivity方法，还记得这个类我们已经改为VAInstrumentation啦：

直接看其newActivity方法：

```java
@Override
public Activity newActivity(ClassLoader cl, String className, Intent intent) throws InstantiationException, IllegalAccessException, ClassNotFoundException {
    try {
        cl.loadClass(className);
    } catch (ClassNotFoundException e) {
        LoadedPlugin plugin = this.mPluginManager.getLoadedPlugin(intent);
        String targetClassName = PluginUtil.getTargetActivity(intent);

        if (targetClassName != null) {
            Activity activity = mBase.newActivity(plugin.getClassLoader(), targetClassName, intent);
            activity.setIntent(intent);

          // 省略兼容性处理代码
            return activity;
        }
    }

    return mBase.newActivity(cl, className, intent);
}
```

核心就是首先从intent中取出我们的目标Activity，然后通过plugin的ClassLoader去加载（还记得在加载插件时，会生成一个LoadedPlugin对象，其中会对应其初始化一个DexClassLoader）。

这样就完成了Activity的“偷梁换柱”。

还没完，接下来在`callActivityOnCreate`方法中：

```java
 @Override
public void callActivityOnCreate(Activity activity, Bundle icicle) {
    final Intent intent = activity.getIntent();
    if (PluginUtil.isIntentFromPlugin(intent)) {
        Context base = activity.getBaseContext();
        try {
            LoadedPlugin plugin = this.mPluginManager.getLoadedPlugin(intent);
            ReflectUtil.setField(base.getClass(), base, "mResources", plugin.getResources());
            ReflectUtil.setField(ContextWrapper.class, activity, "mBase", plugin.getPluginContext());
            ReflectUtil.setField(Activity.class, activity, "mApplication", plugin.getApplication());
            ReflectUtil.setFieldNoException(ContextThemeWrapper.class, activity, "mBase", plugin.getPluginContext());

            // set screenOrientation
            ActivityInfo activityInfo = plugin.getActivityInfo(PluginUtil.getComponent(intent));
            if (activityInfo.screenOrientation != ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED) {
                activity.setRequestedOrientation(activityInfo.screenOrientation);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    mBase.callActivityOnCreate(activity, icicle);
}
```

设置了修改了mResources、mBase（Context）、mApplication对象。以及设置一些可动态设置的属性，这里仅设置了屏幕方向。

这里提一下，将mBase替换为PluginContext，可以修改Resources、AssetManager以及拦截相当多的操作。

看一眼代码就清楚了：

原本Activity的部分get操作

```java
# ContextWrapper
@Override
public AssetManager getAssets() {
    return mBase.getAssets();
}

@Override
public Resources getResources()
{
    return mBase.getResources();
}

@Override
public PackageManager getPackageManager() {
    return mBase.getPackageManager();
}

@Override
public ContentResolver getContentResolver() {
    return mBase.getContentResolver();
}
```

直接替换为：

```java
# PluginContext

@Override
public Resources getResources() {
    return this.mPlugin.getResources();
}

@Override
public AssetManager getAssets() {
    return this.mPlugin.getAssets();
}

@Override
public ContentResolver getContentResolver() {
    return new PluginContentResolver(getHostContext());
}
```

看得出来还是非常巧妙的。可以做的事情也非常多，后面对ContentProvider的描述也会提现出来。

好了，到此Activity就可以正常启动了。

下面看Service。

## 三、Service的支持

Service和Activity有点不同，显而易见的首先我们也会将要启动的Service类替换为占坑的Service类，但是有一点不同，在Standard模式下多次启动同一个占坑Activity会创建多个对象来对象我们的目标类。而Service多次启动只会调用onStartCommond方法，甚至常规多次调用bindService，seviceConn对象不变，甚至都不会多次回调bindService方法（多次调用可以通过给Intent设置不同Action解决）。

还有一点，最明显的差异是，Activity的生命周期是由用户交互决定的，而Service的声明周期是我们主动通过代码调用的。

也就是说，start、stop、bind、unbind都是我们显示调用的，所以我们可以拦截这几个方法，做一些事情。

Virtual Apk的做法，即将所有的操作进行拦截，都改为startService，然后统一在onStartCommond中分发。

下面看详细代码：

### (1) hook IActivityManager

再次来到PluginManager，发下如下方法：

```java
private void hookSystemServices() {
    try {
        Singleton<IActivityManager> defaultSingleton = (Singleton<IActivityManager>) ReflectUtil.getField(ActivityManagerNative.class, null, "gDefault");
        IActivityManager activityManagerProxy = ActivityManagerProxy.newInstance(this, defaultSingleton.get());

        // Hook IActivityManager from ActivityManagerNative
        ReflectUtil.setField(defaultSingleton.getClass().getSuperclass(), defaultSingleton, "mInstance", activityManagerProxy);

        if (defaultSingleton.get() == activityManagerProxy) {
            this.mActivityManager = activityManagerProxy;
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

首先拿到ActivityManagerNative中的gDefault对象，该对象返回的是一个`Singleton<IActivityManager>`,然后拿到其mInstance对象，即IActivityManager对象（可以理解为和AMS交互的binder的client对象）对象。

然后通过动态代理的方式，替换为了一个代理对象。

那么重点看对应的InvocationHandler对象即可，该代理对象调用的方法都会辗转到其invoke方法：

```java
@Override
public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    if ("startService".equals(method.getName())) {
        try {
            return startService(proxy, method, args);
        } catch (Throwable e) {
            Log.e(TAG, "Start service error", e);
        }
    } else if ("stopService".equals(method.getName())) {
        try {
            return stopService(proxy, method, args);
        } catch (Throwable e) {
            Log.e(TAG, "Stop Service error", e);
        }
    } else if ("stopServiceToken".equals(method.getName())) {
        try {
            return stopServiceToken(proxy, method, args);
        } catch (Throwable e) {
            Log.e(TAG, "Stop service token error", e);
        }
    }
    // 省略bindService，unbindService等方法
}    
```

当我们调用startService时，跟进代码，可以发现调用流程为：

```java
startService->startServiceCommon->ActivityManagerNative.getDefault().startService
```

这个getDefault刚被我们hook，所以会被上述方法拦截，然后调用：`startService(proxy, method, args)`

```Java
private Object startService(Object proxy, Method method, Object[] args) throws Throwable {
    IApplicationThread appThread = (IApplicationThread) args[0];
    Intent target = (Intent) args[1];
    ResolveInfo resolveInfo = this.mPluginManager.resolveService(target, 0);
    if (null == resolveInfo || null == resolveInfo.serviceInfo) {
        // is host service
        return method.invoke(this.mActivityManager, args);
    }

    return startDelegateServiceForTarget(target, resolveInfo.serviceInfo, null, RemoteService.EXTRA_COMMAND_START_SERVICE);
}
```

先不看代码，考虑下我们这里唯一要做的就是通过Intent保存关键数据，替换启动的Service类为占坑类。

所以直接看最后的方法：

```java
private ComponentName startDelegateServiceForTarget(Intent target,
                                                    ServiceInfo serviceInfo,
                                                    Bundle extras, int command) {
    Intent wrapperIntent = wrapperTargetIntent(target, serviceInfo, extras, command);
    return mPluginManager.getHostContext().startService(wrapperIntent);
}
```

最后一行就是启动了，那么替换的操作应该在wrapperTargetIntent中完成：

```java
private Intent wrapperTargetIntent(Intent target, ServiceInfo serviceInfo, Bundle extras, int command) {
    // fill in service with ComponentName
    target.setComponent(new ComponentName(serviceInfo.packageName, serviceInfo.name));
    String pluginLocation = mPluginManager.getLoadedPlugin(target.getComponent()).getLocation();

    // start delegate service to run plugin service inside
    boolean local = PluginUtil.isLocalService(serviceInfo);
    Class<? extends Service> delegate = local ? LocalService.class : RemoteService.class;
    Intent intent = new Intent();
    intent.setClass(mPluginManager.getHostContext(), delegate);
    intent.putExtra(RemoteService.EXTRA_TARGET, target);
    intent.putExtra(RemoteService.EXTRA_COMMAND, command);
    intent.putExtra(RemoteService.EXTRA_PLUGIN_LOCATION, pluginLocation);
    if (extras != null) {
        intent.putExtras(extras);
    }

    return intent;
}
```

果不其然，重新初始化了Intent，设置了目标类为LocalService（多进程时设置为RemoteService），然后将原本的Intent存储到`EXTRA_TARGET`，携带command为`EXTRA_COMMAND_START_SERVICE`，以及插件apk路径。

### （2）代理分发

那么接下来代码就到了LocalService的onStartCommond中啦：

```java
@Override
public int onStartCommand(Intent intent, int flags, int startId) {
    // 省略一些代码...

    Intent target = intent.getParcelableExtra(EXTRA_TARGET);
    int command = intent.getIntExtra(EXTRA_COMMAND, 0);
    if (null == target || command <= 0) {
        return START_STICKY;
    }

    ComponentName component = target.getComponent();
    LoadedPlugin plugin = mPluginManager.getLoadedPlugin(component);

    switch (command) {
        case EXTRA_COMMAND_START_SERVICE: {
            ActivityThread mainThread = (ActivityThread)ReflectUtil.getActivityThread(getBaseContext());
            IApplicationThread appThread = mainThread.getApplicationThread();
            Service service;

            if (this.mPluginManager.getComponentsHandler().isServiceAvailable(component)) {
                service = this.mPluginManager.getComponentsHandler().getService(component);
            } else {
                try {
                    service = (Service) plugin.getClassLoader().loadClass(component.getClassName()).newInstance();

                    Application app = plugin.getApplication();
                    IBinder token = appThread.asBinder();
                    Method attach = service.getClass().getMethod("attach", Context.class, ActivityThread.class, String.class, IBinder.class, Application.class, Object.class);
                    IActivityManager am = mPluginManager.getActivityManager();

                    attach.invoke(service, plugin.getPluginContext(), mainThread, component.getClassName(), token, app, am);
                    service.onCreate();
                    this.mPluginManager.getComponentsHandler().rememberService(component, service);
                } catch (Throwable t) {
                    return START_STICKY;
                }
            }

            service.onStartCommand(target, 0, this.mPluginManager.getComponentsHandler().getServiceCounter(service).getAndIncrement());
            break;
        }
        // 省略下面的代码
         case EXTRA_COMMAND_BIND_SERVICE:break;
         case EXTRA_COMMAND_STOP_SERVICE:break;
         case EXTRA_COMMAND_UNBIND_SERVICE:break;
}
```

这里代码很简单了，根据command类型，比如`EXTRA_COMMAND_START_SERVICE`，直接通过plugin的ClassLoader去load目标Service的class，然后反射创建实例。比较重要的是，Service创建好后，需要调用它的attach方法，这里凑够参数，然后反射调用即可，最后调用onCreate、onStartCommand收工。然后将其保存起来，stop的时候取出来调用其onDestroy即可。

bind、unbind以及stop的代码与上述基本一致，不在赘述。

唯一提醒的就是，刚才看到还hook了一个方法叫做：`stopServiceToken`，该方法是什么时候用的呢？

主要有一些特殊的Service，比如IntentService，其stopSelf是由自身调用的，最终会调用`mActivityManager.stopServiceToken`方法，同样的中转为STOP操作即可。

## 四、BroadcastReceiver的支持

这个比较简单，直接解析Manifest后，静态转动态即可。

相关代码在LoadedPlugin的构造方法中：

```java
for (PackageParser.Activity receiver : this.mPackage.receivers) {
    receivers.put(receiver.getComponentName(), receiver.info);

    try {
        BroadcastReceiver br = BroadcastReceiver.class.cast(getClassLoader().loadClass(receiver.getComponentName().getClassName()).newInstance());
        for (PackageParser.ActivityIntentInfo aii : receiver.intents) {
            this.mHostContext.registerReceiver(br, aii);
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

可以看到解析到receiver信息后，直接通过pluginClassloader去loadClass拿到receiver对象，然后调用this.mHostContext.registerReceiver即可。

开心，最后一个了~

## 五、ContentProvider的支持

### （1）hook IContentProvider

ContentProvider的支持依然是通过代理分发。

看一段CP使用的代码：

```java
Cursor bookCursor = getContentResolver().query(bookUri, new String[]{"_id", "name"}, null, null, null);
```

这里用到了PluginContext，在生成Activity、Service的时候，为其设置的Context都为PluginContext对象。

所以当你调用getContentResolver时，调用的为PluginContext的getContentResolver。

```java
@Override
public ContentResolver getContentResolver() {
    return new PluginContentResolver(getHostContext());
}
```

返回的是一个PluginContentResolver对象，当我们调用query方法时，会辗转调用到 
`ContentResolver.acquireUnstableProvider`方法。该方法被PluginContentResolver中复写:

```java
protected IContentProvider acquireUnstableProvider(Context context, String auth) {
    try {
        if (mPluginManager.resolveContentProvider(auth, 0) != null) {
            return mPluginManager.getIContentProvider();
        }

        return (IContentProvider) sAcquireUnstableProvider.invoke(mBase, context, auth);
    } catch (Exception e) {
        e.printStackTrace();
    }

    return null;
}
```

如果调用的auth为插件apk中的provider，则直接返回`mPluginManager.getIContentProvider()`。

```java
public synchronized IContentProvider getIContentProvider() {
    if (mIContentProvider == null) {
        hookIContentProviderAsNeeded();
    }

    return mIContentProvider;
}
```

咦，又看到一个hook方法：

```java
private void hookIContentProviderAsNeeded() {
    Uri uri = Uri.parse(PluginContentResolver.getUri(mContext));
    mContext.getContentResolver().call(uri, "wakeup", null, null);
    try {
        Field authority = null;
        Field mProvider = null;
        ActivityThread activityThread = (ActivityThread) ReflectUtil.getActivityThread(mContext);
        Map mProviderMap = (Map) ReflectUtil.getField(activityThread.getClass(), activityThread, "mProviderMap");
        Iterator iter = mProviderMap.entrySet().iterator();
        while (iter.hasNext()) {
            Map.Entry entry = (Map.Entry) iter.next();
            Object key = entry.getKey();
            Object val = entry.getValue();
            String auth;
            if (key instanceof String) {
                auth = (String) key;
            } else {
                if (authority == null) {
                    authority = key.getClass().getDeclaredField("authority");
                    authority.setAccessible(true);
                }
                auth = (String) authority.get(key);
            }
            if (auth.equals(PluginContentResolver.getAuthority(mContext))) {
                if (mProvider == null) {
                    mProvider = val.getClass().getDeclaredField("mProvider");
                    mProvider.setAccessible(true);
                }
                IContentProvider rawProvider = (IContentProvider) mProvider.get(val);
                IContentProvider proxy = IContentProviderProxy.newInstance(mContext, rawProvider);
                mIContentProvider = proxy;
                Log.d(TAG, "hookIContentProvider succeed : " + mIContentProvider);
                break;
            }
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

前两行比较重要，第一行是拿到了占坑的provider的uri，然后主动调用了其call方法。 
如果你跟进去，会发现，其会调用acquireProvider->mMainThread.acquireProvider->ActivityManagerNative.getDefault().getContentProvider->installProvider。简单来说，其首先调用已经注册provider，得到返回的IContentProvider对象。

这个IContentProvider对象是在ActivityThread.installProvider方法中加入到mProviderMap中。

而ActivityThread对象又容易获取，mProviderMap又是它成员变量，那么也容易获取，所以上面的一大坨（除了前两行）代码，就为了拿到占坑的provider对应的IContentProvider对象。

然后通过动态代理的方式，进行了hook，关注InvocationHandler的实例IContentProviderProxy。

IContentProvider能干吗呢？其实就能拦截我们正常的query、insert、update、delete等操作。

拦截这些方法干嘛？

当然是修改uri啦，把用户调用的uri，替换为占坑provider的uri，再把原本的uri作为参数拼接在占坑provider的uri后面即可。

好了，直接看invoke方法：

```java
@Override
public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    Log.v(TAG, method.toGenericString() + " : " + Arrays.toString(args));
    wrapperUri(method, args);

    try {
        return method.invoke(mBase, args);
    } catch (InvocationTargetException e) {
        throw e.getTargetException();
    }
}
```

直接看wrapperUri

```java
private void wrapperUri(Method method, Object[] args) {
    Uri uri = null;
    int index = 0;
    if (args != null) {
        for (int i = 0; i < args.length; i++) {
            if (args[i] instanceof Uri) {
                uri = (Uri) args[i];
                index = i;
                break;
            }
        }
    }

    // 省略部分代码

    PluginManager pluginManager = PluginManager.getInstance(mContext);
    ProviderInfo info = pluginManager.resolveContentProvider(uri.getAuthority(), 0);
    if (info != null) {
        String pkg = info.packageName;
        LoadedPlugin plugin = pluginManager.getLoadedPlugin(pkg);
        String pluginUri = Uri.encode(uri.toString());
        StringBuilder builder = new StringBuilder(PluginContentResolver.getUri(mContext));
        builder.append("/?plugin=" + plugin.getLocation());
        builder.append("&pkg=" + pkg);
        builder.append("&uri=" + pluginUri);
        Uri wrapperUri = Uri.parse(builder.toString());
        if (method.getName().equals("call")) {
            bundleInCallMethod.putString(KEY_WRAPPER_URI, wrapperUri.toString());
        } else {
            args[index] = wrapperUri;
        }
    }
}
```

从参数中找到uri，往下看，搞了个StringBuilder首先加入占坑provider的uri，然后将目标uri，pkg,plugin等参数等拼接上去，替换到args中的uri，然后继续走原本的流程。

假设是query方法，应该就到达我们占坑provider的query方法啦。

### （2）代理分发

占坑如下：

```xml
<provider
    android:name="com.didi.virtualapk.delegate.RemoteContentProvider"
    android:authorities="${applicationId}.VirtualAPK.Provider"
    android:process=":daemon" />
```

打开RemoteContentProvider，直接看query方法：

```java
@Override
public Cursor query(Uri uri, String[] projection, String selection,
                    String[] selectionArgs, String sortOrder) {

    ContentProvider provider = getContentProvider(uri);
    Uri pluginUri = Uri.parse(uri.getQueryParameter(KEY_URI));
    if (provider != null) {
        return provider.query(pluginUri, projection, selection, selectionArgs, sortOrder);
    }

    return null;
}
```

可以看到通过传入的生成了一个新的provider,然后拿到目标uri，在直接调用provider.query传入目标uri即可。

那么这个provider实际上是这个代理类帮我们生成的：

```java
private ContentProvider getContentProvider(final Uri uri) {
    final PluginManager pluginManager = PluginManager.getInstance(getContext());
    Uri pluginUri = Uri.parse(uri.getQueryParameter(KEY_URI));
    final String auth = pluginUri.getAuthority();
    // 省略了缓存管理
    LoadedPlugin plugin = pluginManager.getLoadedPlugin(uri.getQueryParameter(KEY_PKG));
    if (plugin == null) {
        try {
            pluginManager.loadPlugin(new File(uri.getQueryParameter(KEY_PLUGIN)));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    final ProviderInfo providerInfo = pluginManager.resolveContentProvider(auth, 0);
    if (providerInfo != null) {
        RunUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    LoadedPlugin loadedPlugin = pluginManager.getLoadedPlugin(uri.getQueryParameter(KEY_PKG));
                    ContentProvider contentProvider = (ContentProvider) Class.forName(providerInfo.name).newInstance();
                    contentProvider.attachInfo(loadedPlugin.getPluginContext(), providerInfo);
                    sCachedProviders.put(auth, contentProvider);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }, true);
        return sCachedProviders.get(auth);
    }
    return null;
}
```

很简单，取出原本的uri，拿到auth，在通过加载plugin得到providerInfo，反射生成provider对象，在调用其attachInfo方法即可。

其他的几个方法：insert、update、delete、call逻辑基本相同，就不赘述了。

感觉这里其实通过hook AMS的getContentProvider方法也能完成上述流程，感觉好像可以更彻底，不需要依赖PluginContext了。

## 六、总结

总结下，其实就是文初的内容，可以看到VritualApk大体方案如下：

- Activity：在宿主apk中提前占几个坑，然后通过“欺上瞒下”（这个词好像是360之前的ppt中提到）的方式，启动插件apk的Activity；因为要支持不同的launchMode以及一些特殊的属性，需要占多个坑。
- Service：通过代理Service的方式去分发；主进程和其他进程，VirtualAPK使用了两个代理Service。
- BroadcastReceiver：静态转动态。
- ContentProvider：通过一个代理Provider进行分发。