## 一、`<include/>`

<include/>标签在布局优化中是使用最多的一个标签了，它就是为了解决重复定义布局的问题。<include/>标签就相当于C、C++中的include头文件一样，把一些常用的底层的API封装起来，需要的时候引入即可。在一些开源的J2EE中许多XML配置文件也都会使用<include/>标签，将多个配置文件组合成为一个更为复杂的配置文件，如最常见的S2SH。

在以前Android开发中，由于ActionBar设计上的不统一以及兼容性问题，所以很多应用都自定义了一套自己的标题栏titlebar。标题栏我们知道在应用的每个界面几乎都会用到，在这里可以作为一个很好的示例来解释<include/>标签的使用。

下面是一个自定义的titlebar文件：

```xml
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:background="@color/titlebar_bg">
 
    <ImageView android:layout_width="wrap_content"
               android:layout_height="wrap_content"
               android:src="@drawable/gafricalogo" />
</FrameLayout>
```



在应用中使用titlebar布局文件，我们通过<include/>标签,布局文件如下：

```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:orientation="vertical"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/app_bg"
    android:gravity="center_horizontal">
 
    <include layout="@layout/titlebar"/>
 
    <TextView android:layout_width="match_parent"
              android:layout_height="wrap_content"
              android:text="@string/hello"
              android:padding="10dp" />
 
    ...
 
</LinearLayout>
```

在<include/>标签中可以覆盖导入的布局文件root布局的布局属性（如layout_*属性）。

布局示例如下：

```xml
<include android:id="@+id/news_title"
         android:layout_width="match_parent"
         android:layout_height="match_parent"
         layout="@layout/title"/>
```



如果想使用<include/>标签覆盖嵌入布局root布局属性，必须同时覆盖layout_height和layout_width属性，否则会直接报编译时语法错误。

> *Layout parameter layout_height ignored unless layout_width is also specified on <include> tag*

如果<include/>标签已经定义了id，而嵌入布局文件的root布局文件也定义了id，<include>标签的id会覆盖掉嵌入布局文件root的id，如果include标签没有定义id则会使用嵌入文件root的id。

## 二、`<merge/>`

<merge/>标签都是与<include/>标签组合使用的，它的作用就是可以有效减少View树的层次来优化布局。

下面通过一个简单的示例探讨一下<merge/>标签的使用，下面是嵌套布局的layout_text.xml文件：

```Xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical" >
    <TextView
        android:id="@+id/textView"
        android:layout_width="match_parent"
        android:text="Hello World!"
        android:layout_height="match_parent" />
</LinearLayout>
```



一个线性布局中嵌套一个文本视图，主布局如下：

```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/layout_wrap"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical" >
 
    <include
        android:id="@+id/layout_import"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        layout="@layout/layout_text" />
	
</LinearLayout>
```

通过hierarchyviewer我们可以看到主布局View树的部分层级结构如下图：

[![layout_merge01](http://www.sunnyang.com/wp-content/uploads/2016/04/layout_merge01.png)](http://www.sunnyang.com/wp-content/uploads/2016/04/layout_merge01.png)

现在讲嵌套布局跟布局标签更改为<merge/>，merge_text.xml布局文件如下：

```xml
<merge xmlns:android="http://schemas.android.com/apk/res/android" >
 
    <TextView
        android:id="@+id/textView"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:text="Hello World!"/>
 
</merge>
```



然后将主布局<include/>标签中的layout更改为merge_text.xml，运行后重新截图如下:

[![layout_merge02](http://www.sunnyang.com/wp-content/uploads/2016/04/layout_merge02.png)](http://www.sunnyang.com/wp-content/uploads/2016/04/layout_merge02.png)

对比截图就可以发现上面的四层结构，现在已经是三层结构了。当我们使用<merge/>标签的时候，系统会自动忽略merge层级，而把TextView直接放置与<include/>平级。

<merge/>标签在使用的时候需要特别注意布局的类型，例如我的<merge/>标签中包含的是一个LinearLayout布局视图，布局中的元素是线性排列的，如果嵌套进主布局时，include标签父布局时FrameLayout，这种方式嵌套肯定会出问题的，merge中元素会按照FrameLayout布局方式显示。所以在使用的时候，<merge/>标签虽然可以减少布局层级，但是它的限制也不可小觑。

<merge/>只能作为XML布局的根标签使用。当Inflate以<merge/>开头的布局文件时，必须指定一个父ViewGroup，并且必须设定attachToRoot为true。

`View android.view.LayoutInflater.inflate(int resource, ViewGroup root, boolean attachToRoot)`

root不可少，attachToRoot必须为true。

## 三、ViewStub

在开发过程中，经常会遇到这样一种情况，有些布局很复杂但是却很少使用。例如条目详情、进度条标识或者未读消息等，这些情况如果在一开始初始化，虽然设置可见性`View.GONE`,但是在Inflate的时候View仍然会被Inflate，仍然会创建对象，由于这些布局又想到复杂，所以会很消耗系统资源。

ViewStub就是为了解决上面问题的，ViewStub是一个轻量级的View，它一个看不见的，不占布局位置，占用资源非常小的控件。

### 定义ViewStub布局文件

下面是一个ViewStub布局文件：

```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/layout_wrap"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical" >
 
    <ViewStub
        android:id="@+id/stub_image"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:inflatedId="@+id/image_import"
        android:layout="@layout/layout_image" />
 
    <ViewStub
        android:id="@+id/stub_text"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:inflatedId="@+id/text_import"
        android:layout="@layout/layout_text" />
 
</LinearLayout>
```



layout_image.xml文件如下（layout_text.xml类似）：

```Xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:id="@+id/layout_image">
 
    <ImageView
        android:id="@+id/imageView"
        android:layout_width="match_parent"
        android:layout_height="wrap_content" />
 
</LinearLayout>
```



### 加载ViewStub布局文件

动态加载ViewStub所包含的布局文件有两种方式，方式一使用使用inflate()方法，方式二就是使用setVisibility(View.VISIBLE)。

示例java代码如下：

```java
private ViewStub viewStub;
 
protected void onCreate(Bundle savedInstanceState) {
	super.onCreate(savedInstanceState);
	setContentView(R.layout.layout_main2);
	viewStub = (ViewStub) findViewById(R.id.stub_image);
    //viewStub.inflate();//方式一
	viewStub.setVisibility(View.VISIBLE);//方式二
	ImageView imageView = (ImageView) findViewById(R.id.imageView);
	imageView.setImageResource(R.drawable.image);
}
```



示例View层级截图如下：

[![viewstub_view](http://www.sunnyang.com/wp-content/uploads/2016/04/viewstub_view.png)](http://www.sunnyang.com/wp-content/uploads/2016/04/viewstub_view.png)

ViewStub一旦visible/inflated,它自己就不在是View试图层级的一部分了。所以后面无法再使用ViewStub来控制布局，填充布局root布局如果有id，则会默认被android:inflatedId所设置的id取代，如果没有设置android:inflatedId，则会直接使用填充布局id。

由于ViewStub这种使用后即可就置空的策略，所以当需要在运行时不止一次的显示和隐藏某个布局，那么ViewStub是做不到的。这时就只能使用View的可见性来控制了。

layout_*相关属性与include标签相似，如果使用应该在ViewStub上面使用，否则使用在嵌套进来布局root上面无效。

ViewStub的另一个缺点就是目前还不支持merge标签。

## 四、小结

Android布局优化基本上就设计上面include、merge、ViewStub三个标签的使用。在平常开发中布局推荐使用RelativeLayout，它也可以有效减少布局层级嵌套。最后了将merge和include源码附上，ViewStub就是一个View，就不贴出来了。

### Include源码

```java
/**
 * Exercise <include /> tag in XML files.
 */
public class Include extends Activity {
    @Override
    protected void onCreate(Bundle icicle) {
        super.onCreate(icicle);
        setContentView(R.layout.include_tag);
    }
}
```



#### Merge源码

```java
/**
 * Exercise <merge /> tag in XML files.
 */
public class Merge extends Activity {
    private LinearLayout mLayout;
 
    @Override
    protected void onCreate(Bundle icicle) {
        super.onCreate(icicle);
 
        mLayout = new LinearLayout(this);
        mLayout.setOrientation(LinearLayout.VERTICAL);
        LayoutInflater.from(this).inflate(R.layout.merge_tag, mLayout);
 
        setContentView(mLayout);
    }
 
    public ViewGroup getLayout() {
        return mLayout;
    }
}
```

