# Android全局异常处理

在做android项目开发时，大家都知道如果程序出错了，会弹出来一个强制退出的弹出框，这个本身没什么问题，但是这个UI实在是太丑了，别说用户接受不了，就连我们自己本身可能都接受不了。虽然我们在发布程序时总会经过仔细的测试，但是难免会碰到预料不到的错误。

今天就来自定义一个程序出错时的处理，类似iphone的闪退。(虽然闪退也是用户不愿意看到的，但是在用户体验上明显比那个原生的弹窗好多了)

废话不多说，直接上代码：

## CrashHandler

```Java
/** 
 * 自定义的 异常处理类 , 实现了 UncaughtExceptionHandler接口  
 * 
 */  
public class CrashHandler implements UncaughtExceptionHandler {  
    // 需求是 整个应用程序 只有一个 MyCrash-Handler   
    private static CrashHandler INSTANCE ;  
    private Context context;  
      
    //1.私有化构造方法  
    private CrashHandler(){  
          
    }  
      
    public static synchronized CrashHandler getInstance(){  
        if (INSTANCE == null)  
            INSTANCE = new CrashHandler();  
        return INSTANCE;
    }

    public void init(Context context){  
        this.context = context;
    }  
      
  
    public void uncaughtException(Thread arg0, Throwable arg1) {  
        System.out.println("程序挂掉了 ");  
        // 在此可以把用户手机的一些信息以及异常信息捕获并上传,由于UMeng在这方面有很程序的api接口来调用，故没有考虑
          
        //干掉当前的程序   
        android.os.Process.killProcess(android.os.Process.myPid());  
    }  

}  
```

## CrashApplication

```java
/** 
 * 在开发应用时都会和Activity打交道，而Application使用的就相对较少了。 
 * Application是用来管理应用程序的全局状态的，比如载入资源文件。 
 * 在应用程序启动的时候Application会首先创建，然后才会根据情况(Intent)启动相应的Activity或者Service。 
 * 在本文将在Application中注册未捕获异常处理器。 
 */  
public class CrashApplication extends Application {  
    @Override  
    public void onCreate() {  
        super.onCreate();  
        CrashHandler handler = CrashHandler.getInstance();  
        handler.init(getApplicationContext());
        Thread.setDefaultUncaughtExceptionHandler(handler);  
    }  
}  
```

## 在AndroidManifest.xml中注册

```xml
<?xml version="1.0" encoding="utf-8"?>  
<manifest xmlns:android="http://schemas.android.com/apk/res/android"  
    package="org.wp.activity" android:versionCode="1" android:versionName="1.0">  
    <application android:icon="@drawable/icon" android:label="@string/app_name"  
        android:name=".CrashApplication" android:debuggable="true">  
        <activity android:name=".MainActivity" android:label="@string/app_name">  
            <intent-filter>  
                <action android:name="android.intent.action.MAIN" />  
                <category android:name="android.intent.category.LAUNCHER" />  
            </intent-filter>  
        </activity>  
    </application>  
    <uses-sdk android:minSdkVersion="8" />  
</manifest> 
```

至此，可以测试下在出错的时候程序会直接闪退，并杀死后台进程。当然也可以自定义一些比较友好的出错UI提示，进一步提升用户体验。