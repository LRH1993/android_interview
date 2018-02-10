## 一、MVP概述

**MVP，全称 Model-View-Presenter，即模型-视图-层现器**。

提到MVP，就必须要先介绍一下它的前辈MVC，因为MVP正是基于MVC的基础发展而来的。两个之间的关系也是源远流长。

**MVC，全称Model-View-Controller，即模型-视图-控制器。** 具体如下：

**View：对应于布局文件**

Model：业务逻辑和实体模型

Controllor：对应于Activity

但是View对应于布局文件，其实能做的事情特别少，实际上关于该布局文件中的数据绑定的操作，事件处理的代码都在Activity中，造成了Activity既像View又像Controller，使得Activity变得臃肿。

而当将架构改为MVP以后，Presenter的出现，将Actvity视为View层，Presenter负责完成View层与Model层的交互。现在是这样的：

**View 对应于Activity，负责View的绘制以及与用户交互**

Model 依然是业务逻辑和实体模型

Presenter 负责完成View于Model间的交互

下面两幅图通过数据与视图之间的交互清楚地展示了这种变化：

![img](http://upload-images.jianshu.io/upload_images/3985563-4fd0f30f81ae423e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

MVC模式下实际上就是Activty与Model之间交互，View完全独立出来了。

![img](http://upload-images.jianshu.io/upload_images/3985563-7c936f2223dce1de.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

MVP模式通过Presenter实现数据和视图之间的交互，简化了Activity的职责。同时即避免了View和Model的直接联系，又通过Presenter实现两者之间的沟通。

**总结：MVP模式减少了Activity的职责，简化了Activity中的代码，将复杂的逻辑代码提取到了Presenter中进行处理，模块职责划分明显，层次清晰。与之对应的好处就是，耦合度更低，更方便的进行测试。**

### MVC和MVP的区别

![img](http://upload-images.jianshu.io/upload_images/3985563-4472518336d7465e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**MVC中是允许Model和View进行交互的，而MVP中很明显，Model与View之间的交互由Presenter完成。还有一点就是Presenter与View之间的交互是通过接口的。**

还有一点注意：**MVC中V对应的是布局文件，MVP中V对应的是Activity。**

## 二、MVP的简单使用

大多数MVP模式的示例都使用登录案例进行介绍。因为简单方便，同时能提现出MVP的特点。今天我们也以此例进行学习。
使用MVP的好处之一就是模块职责划分明显，层次清晰。
该例的结构图即可展现此优点。

![img](http://upload-images.jianshu.io/upload_images/3985563-3f3d046d40d6bfbc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 1.Model层

在本例中，M0del层负责对从登录页面获取地帐号密码进行验证（一般需要请求服务器进行验证，本例直接模拟这一过程）。
从上图的包结构图中可以看出，Model层包含内容：

①实体类bean

②接口，表示Model层所要执行的业务逻辑

③接口实现类，具体实现业务逻辑，包含的一些主要方法

下面以代码的形式一一展开。



①实体类bean

```java
public class User {
    private String password;
    private String username;

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Override
    public String toString() {
        return "User{" +
                "password='" + password + '\'' +
                ", username='" + username + '\'' +
                '}';
    }
}
```

封装了用户名、密码，方便数据传递。

②接口

```java
public interface LoginModel {
    void login(User user, OnLoginFinishedListener listener);
}
```

其中OnLoginFinishedListener 是presenter层的接口，方便实现回调presenter，通知presenter业务逻辑的返回结果，具体在presenter层介绍。

③接口实现类

```java
public class LoginModelImpl implements LoginModel {
    @Override
    public void login(User user, final OnLoginFinishedListener listener) {
        final String username = user.getUsername();
        final String password = user.getPassword();
        new Handler().postDelayed(new Runnable() {
            @Override public void run() {
                boolean error = false;
                if (TextUtils.isEmpty(username)){
                    listener.onUsernameError();//model层里面回调listener
                    error = true;
                }
                if (TextUtils.isEmpty(password)){
                    listener.onPasswordError();
                    error = true;
                }
                if (!error){
                    listener.onSuccess();
                }
            }
        }, 2000);
    }
}
```

实现Model层逻辑：延时模拟登陆（2s），如果用户名或者密码为空则登陆失败，否则登陆成功。

### 2.View层

视图：将Modle层请求的数据呈现给用户。一般的视图都只是包含用户界面(UI)，而不包含界面逻辑，界面逻辑由Presenter来实现。

从上图的包结构图中可以看出，View包含内容：

①接口，上面我们说过Presenter与View交互是通过接口。其中接口中方法的定义是根据Activity用户交互需要展示的控件确定的。

②接口实现类，将上述定义的接口中的方法在Activity中对应实现具体操作。

下面以代码的形式一一展开。

①接口

```java
public interface LoginView {
    //login是个耗时操作，我们需要给用户一个友好的提示，一般就是操作ProgressBar
    void showProgress();

    void hideProgress();
   //login当然存在登录成功与失败的处理，失败给出提示
    void setUsernameError();

    void setPasswordError();
   //login成功，也给个提示
    void showSuccess();
}
```

上述5个方法都是presenter根据model层返回结果需要view执行的对应的操作。

②接口实现类

即对应的登录的Activity，需要实现LoginView接口。

```java
public class LoginActivity extends AppCompatActivity implements LoginView, View.OnClickListener {
    private ProgressBar progressBar;
    private EditText username;
    private EditText password;
    private LoginPresenter presenter;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        progressBar = (ProgressBar) findViewById(R.id.progress);
        username = (EditText) findViewById(R.id.username);
        password = (EditText) findViewById(R.id.password);
        findViewById(R.id.button).setOnClickListener(this);
       //创建一个presenter对象，当点击登录按钮时，让presenter去调用model层的login()方法，验证帐号密码
        presenter = new LoginPresenterImpl(this);
    }

    @Override
    protected void onDestroy() {
        presenter.onDestroy();
        super.onDestroy();
    }

    @Override
    public void showProgress() {
        progressBar.setVisibility(View.VISIBLE);
    }

    @Override
    public void hideProgress() {
        progressBar.setVisibility(View.GONE);
    }

    @Override
    public void setUsernameError() {
        username.setError(getString(R.string.username_error));
    }

    @Override
    public void setPasswordError() {
        password.setError(getString(R.string.password_error));
    }

    @Override
    public void showSuccess() {
         progressBar.setVisibility(View.GONE);
        Toast.makeText(this,"login success",Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onClick(View v) {
        User user = new User();
        user.setPassword(password.getText().toString());
        user.setUsername(username.getText().toString());
        presenter.validateCredentials(user);
    }

}
```

View层实现Presenter层需要调用的控件操作，方便Presenter层根据Model层返回的结果进行操作View层进行对应的显示。

### 3.Presenter层

Presenter是用作Model和View之间交互的桥梁。
从上图的包结构图中可以看出，Presenter包含内容：

①接口，包含Presenter需要进行Model和View之间交互逻辑的接口，以及上面提到的Model层数据请求完成后回调的接口。

②接口实现类，即实现具体的Presenter类逻辑。

下面以代码的形式一一展开。

①接口

```java
public interface OnLoginFinishedListener {
    void onUsernameError();

    void onPasswordError();

    void onSuccess();
}
```

当Model层得到请求的结果，需要回调Presenter层，让Presenter层调用View层的接口方法。

```java
public interface LoginPresenter {
    void validateCredentials(User user);

    void onDestroy();
}
```

登陆的Presenter 的接口，实现类为LoginPresenterImpl，完成登陆的验证，以及销毁当前view。

②接口实现类

```java
public class LoginPresenterImpl implements LoginPresenter, OnLoginFinishedListener {
    private LoginView loginView;
    private LoginModel loginModel;

    public LoginPresenterImpl(LoginView loginView) {
        this.loginView = loginView;
        this.loginModel = new LoginModelImpl();
    }

    @Override
    public void validateCredentials(User user) {
        if (loginView != null) {
            loginView.showProgress();
        }

        loginModel.login(user, this);
    }

    @Override
    public void onDestroy() {
        loginView = null;
    }

    @Override
    public void onUsernameError() {
        if (loginView != null) {
            loginView.setUsernameError();
            loginView.hideProgress();
        }
    }

    @Override
    public void onPasswordError() {
        if (loginView != null) {
            loginView.setPasswordError();
            loginView.hideProgress();
        }
    }

    @Override
    public void onSuccess() {
        if (loginView != null) {
            loginView.showSuccess();
        }
    }
}
```

由于presenter完成二者的交互，那么肯定需要二者的实现类（通过传入参数，或者new）。

presenter里面有个OnLoginFinishedListener， 其在Presenter层实现，给Model层回调，更改View层的状态， 确保 Model层不直接操作View层。

**示例展示：**

![img](http://upload-images.jianshu.io/upload_images/3985563-216404156964b311.gif?imageMogr2/auto-orient/strip)

[代码地址](https://github.com/LRH1993/MVPdemo)

## 三、总结

MVP模式的整个核心流程：

View与Model并不直接交互，而是使用Presenter作为View与Model之间的桥梁。其中Presenter中同时持有View层的Interface的引用以及Model层的引用，而View层持有Presenter层引用。当View层某个界面需要展示某些数据的时候，首先会调用Presenter层的引用，然后Presenter层会调用Model层请求数据，当Model层数据加载成功之后会调用Presenter层的回调方法通知Presenter层数据加载情况，最后Presenter层再调用View层的接口将加载后的数据展示给用户。

![img](http://upload-images.jianshu.io/upload_images/3985563-03352e00ce8b4083.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)