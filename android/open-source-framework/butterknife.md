## 一、Butterknife原理

讲到butterknife的原理。这里不得不提一下一般这种注入框架都是运行时注解，即声明注解的生命周期为RUNTIME，然后在运行的时候通过反射完成注入，这种方式虽然简单，但是这种方式多多少少会有性能的损耗。那么有没有一种方法能解决这种性能的损耗呢？   没错，答案肯定是有的，那就是Butterknife用的APT(Annotation Processing Tool)编译时解析技术。

APT大概就是你声明的注解的生命周期为CLASS,然后继承AbstractProcessor类。继承这个类后，在编译的时候，编译器会扫描所有带有你要处理的注解的类，然后再调用AbstractProcessor的process方法，对注解进行处理，那么我们就可以在处理的时候，动态生成绑定事件或者控件的java代码，然后在运行的时候，直接调用bind方法完成绑定。
其实这种方式的好处是我们不用再一遍一遍地写findViewById和onClick了，这个框架在编译的时候帮我们自动生成了这些代码，然后在运行的时候调用就行了。

## 二、源码解析

上面讲了那么多，其实都不如直接解析源码来得直接，下面我们就一步一步来探究大神怎样实现Butterknife的吧。

拿到源码的第一步是从我们调用的地方来突破，那我们就来看看程序里面是怎样调用它的呢？

```java
 @Override protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.simple_activity);
    ButterKnife.setDebug(true);
    ButterKnife.bind(this);

    // Contrived code to use the bound fields.
    title.setText("Butter Knife");
    subtitle.setText("Field and method binding for Android views.");
    footer.setText("by Jake Wharton");
    hello.setText("Say Hello");

    adapter = new SimpleAdapter(this);
    listOfThings.setAdapter(adapter);
  }
```

上面是github上给的例子,我们直接就从 `ButterKnife.bind(this)`入手吧，点进来看看：

```java
  public static Unbinder bind(@NonNull Activity target) {
    return bind(target, target, Finder.ACTIVITY);
  }
```

咦？我再点：

```java
  static Unbinder bind(@NonNull Object target, @NonNull Object source, @NonNull Finder finder) {
    Class<?> targetClass = target.getClass();
    try {
      ViewBinder<Object> viewBinder = findViewBinderForClass(targetClass);
      return viewBinder.bind(finder, target, source);
    } catch (Exception e) {
      throw new RuntimeException("Unable to bind views for " + targetClass.getName(), e);
    }
  }
```

好吧，bind方法主要就是拿到我们绑定的Activity的Class，然后找到这个Class的ViewBinder，最后调用ViewBinder的`bind()`方法，那么问题来了，ViewBinder是个什么鬼？？？我们打开
`findViewBinderForClass()`方法。

```java
 @NonNull
  private static ViewBinder<Object> findViewBinderForClass(Class<?> cls)
      throws IllegalAccessException, InstantiationException {
    ViewBinder<Object> viewBinder = BINDERS.get(cls);
    if (viewBinder != null) {
      return viewBinder;
    }
    String clsName = cls.getName();
    try {
      Class<?> viewBindingClass = Class.forName(clsName + "$$ViewBinder");
      viewBinder = (ViewBinder<Object>) viewBindingClass.newInstance();
    } catch (ClassNotFoundException e) {
      viewBinder = findViewBinderForClass(cls.getSuperclass());
    }
    BINDERS.put(cls, viewBinder);
    return viewBinder;
  }
```

这里我去掉了一些Log信息，保留了关键代码，上面的BINDERS是一个保存了Class为key,`Class$$ViewBinder`为Value的一个LinkedHashMap,主要是做一下缓存，提高下次再来bind的性能。

在第10行的时候，clsName 是我们传入要绑定的Activity类名，这里相当于拿到了`Activity$$ViewBinder`这个东西,这个类又是什么玩意儿？其实从类名可以看出来，相当于Activity的一个内部类，这时候我们就要问了，我们在用的时候没有声明这个类啊？？？从哪里来的？  不要方，其实它就是我们在之前讲原理的时候说到的AbstractProcessor在编译的时候生成的一个类，我们后面再来看它，现在我们继续往下面分析。在第11行就用反射反射了一个viewBinder 实例出来。
刚刚说了，这个方法里面用linkhashMap做了下缓存，所以在15行的时候，就把刚刚反射的viewBinder作为value，Class作为key加入这个LinkedHashMap,下次再bind这个类的时候，就直接在第4行的时候取出来用，提升性能。

现在返回刚刚的bind方法，我们拿到了这个Activity的viewBinder,然后调用它的bind方法。咦？这就完了？？？我们再点进viewBinder的bind方法看看。

```java
public interface ViewBinder<T> {
  Unbinder bind(Finder finder, T target, Object source);
}
```

什么，接口？？？什么鬼？刚刚不是new了一个viewBinder出来么?然后这里就调用了这个viewBinder的bind方法， 不行，我要看一下bind到底是什么鬼！上面说了，Butterknife用了APT技术，那么这里的viewBinder应该就是编译的时候生成的，那么我们就反编译下apk。看看到底生成了什么代码：
下面我们就先用一个简单的绑定TextView的例子，然后反编译出来看看：

```java
public class MainActivity extends AppCompatActivity {

    @Bind(R.id.text_view)
    TextView textView;

    @OnClick(R.id.text_view)
     void onClick(View view) {
        textView.setText("我被click了");
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        ButterKnife.bind(this);
        textView.setText("我还没有被click");
    }
}
```

源代码就这行几行，然后反编译看看：

源代码就多了一个类，`MainActivity$$ViewBinder`，打开看看：

```java
public class MainActivity$$ViewBinder<T extends MainActivity>
  implements ButterKnife.ViewBinder<T>
{
  public void bind(ButterKnife.Finder paramFinder, final T paramT, Object paramObject)
  {
    View localView = (View)paramFinder.findRequiredView(paramObject, 2131492944, "field 'textView' and method 'onClick'");
    paramT.textView = ((TextView)paramFinder.castView(localView, 2131492944, "field 'textView'"));
    localView.setOnClickListener(new DebouncingOnClickListener()
    {
      public void doClick(View paramAnonymousView)
      {
        paramT.onClick(paramAnonymousView);
      }
    });
  }

  public void unbind(T paramT)
  {
    paramT.textView = null;
  }
}
```

还记得刚刚说的，反射了一个`Class$$ViewBinder`么？看这里的类名。现在应该懂了吧？它刚好也是实现了`ButterKnife.ViewBinder<T>`接口，我们说了，在bind方法中，最后调用了ViewBinder的bind方法，先说下几个参数paramFinder其实就是一个Finder,因为我们可以在Activity中使用butterknife,也可以在Fragment和Adapter等中使用butterknife，那么在不同的地方使用butterknife，这个Finder也就不同。在Activity中，其实源码 就是这样子的：

```java
 ACTIVITY {
    @Override protected View findView(Object source, int id) {
      return ((Activity) source).findViewById(id);
    }

    @Override public Context getContext(Object source) {
      return (Activity) source;
    }
  }
```

有没有很熟悉？？？其实还是用的`findViewById`，那么在Dialog和Fragment中，根据不同的地方，实现的方式不同。

这里的paramT和paramObject都是我们要绑定的Activity类，通过代码可以跟踪到。

返回上面的ViewBinder代码，首先调用了Finder的findRequiredView方法，其实这个方法最后经过处理就是调用了findView方法，拿到相应的view，然后再赋值给paramT.textView，刚说了paramT就是那个要绑定的Activity，现在懂了吧？这里通过 paramT.textView 这样的调用方式，说明了Activity中不能把TextView设置为private，不然会报错，其实这里可以用反射来拿到textView的，这里大概也是为了性能着想吧。最后setOnClickListener，`DebouncingOnClickListener`这个Listener其实也是实现了View.OnClickListener 方法，然后在OnClick里面调用了`doClick`方法。流程大概跟踪了一遍。现在还留下最后一块了：

### Butterknife到底是怎样在编译的时候生成代码的？

我们来看一下它的`ButterKnifeProcessor`类，ButterKnifeProcessor是一个继承自AbstractProcessor的类，它是ButterKnife的注解处理器，在编译时，会调用process()，并通过BindingClass + JavaPoet来生成代码。

Init方法：

```java
  @Override 
public synchronized void init(ProcessingEnvironment env) {
    super.init(env);

    elementUtils = env.getElementUtils();
    typeUtils = env.getTypeUtils();
    filer = env.getFiler();
  }
```

ProcessingEnviroment参数提供很多有用的工具类Elements, Types和Filer。Types是用来处理TypeMirror的工具类，Filer用来创建生成辅助文件。至于ElementUtils嘛，其实ButterKnifeProcessor在运行的时候，会扫描所有的Java源文件，然后每一个Java源文件的每一个部分都是一个Element，比如一个包、类或者方法。

```Java
 @Override public Set<String> getSupportedAnnotationTypes() {
    Set<String> types = new LinkedHashSet<>();

    types.add(BindArray.class.getCanonicalName());
    types.add(BindBitmap.class.getCanonicalName());
    types.add(BindBool.class.getCanonicalName());
    types.add(BindColor.class.getCanonicalName());
    types.add(BindDimen.class.getCanonicalName());
    types.add(BindDrawable.class.getCanonicalName());
    types.add(BindInt.class.getCanonicalName());
    types.add(BindString.class.getCanonicalName());
    types.add(BindView.class.getCanonicalName());
    types.add(BindViews.class.getCanonicalName());

    for (Class<? extends Annotation> listener : LISTENERS) {
      types.add(listener.getCanonicalName());
    }

    return types;
  }
```

getSupportedAnnotationTypes()方法就是告诉ButterKnifeProcessor到底支持那些自定义的注解。我们可以看到，在源代码里面，作者一个一个地把Class文件加到那个LinkedHashSet里面，然后再把LISTENERS也全部加进去。

其实整个类最重要的是**process**方法：

```java
 @Override public boolean process(Set<? extends TypeElement> elements, RoundEnvironment env) {   
   //  拿到所有的注解信息
    Map<TypeElement, BindingClass> targetClassMap = findAndParseTargets(env);
// 遍历 map 里面的所有信息，并生成 java 代码
    for (Map.Entry<TypeElement, BindingClass> entry : targetClassMap.entrySet()) {
      TypeElement typeElement = entry.getKey();
      BindingClass bindingClass = entry.getValue();

      try {
        bindingClass.brewJava().writeTo(filer);
      } catch (IOException e) {
        error(typeElement, "Unable to write view binder for type %s: %s", typeElement,
            e.getMessage());
      }
    }
    return true;
  }
```

这个方法的作用主要是扫描、评估和处理我们程序中的注解，然后生成Java文件。也就是前面说的ViewBinder。首先一进这个函数就调用了`findAndParseTargets`方法，我们就去看看`findAndParseTargets`方法到底做了什么：

```Java
  private Map<TypeElement, BindingClass> findAndParseTargets(RoundEnvironment env) {
    Map<TypeElement, BindingClass> targetClassMap = new LinkedHashMap<>();
    Set<TypeElement> erasedTargetNames = new LinkedHashSet<>();

      // Process each @BindView element.
    for (Element element : env.getElementsAnnotatedWith(BindView.class)) {
      if (!SuperficialValidation.validateElement(element)) continue;
      try {
        parseBindView(element, targetClassMap, erasedTargetNames);
      } catch (Exception e) {
        logParsingError(element, BindView.class, e);
      }
    }

    Observable.from(topLevelClasses)
        .flatMap(new Func1<BindingClass, Observable<?>>() {
          @Override public Observable<?> call(BindingClass topLevelClass) {
            if (topLevelClass.hasViewBindings()) {
              // It has an unbinder class and it will also be the highest unbinder class for all
              // descendants.
              topLevelClass.setHighestUnbinderClassName(topLevelClass.getUnbinderClassName());
            } else {
              // No unbinder class, so null it out so we know we can just return the NOP unbinder.
              topLevelClass.setUnbinderClassName(null);
            }

            // Recursively set up parent unbinding relationships on all its descendants.
            return ButterKnifeProcessor.this.setParentUnbindingRelationships(
                topLevelClass.getDescendants());
          }
        })
        .toCompletable()
        .await();

    return targetClassMap;
  }
```

这里代码炒鸡多，我就不全部贴出来了,只贴出来一部分，这个方法最后还用了rxjava的样子。这个方法的主要的流程如下：

- 扫描所有具有注解的类，然后根据这些类的信息生成BindingClass，最后生成以TypeElement为键,BindingClass为值的键值对。
- 循环遍历这个键值对，根据TypeElement和BindingClass里面的信息生成对应的java类。例如AnnotationActivity生成的类即为`Cliass$$ViewBinder`类。

因为我们之前用的例子是绑定的一个View，所以我们就只贴了解析View的代码。好吧，这里遍历了所有带有`@BindView`的Element，然后对每一个Element进行解析，也就进入了`parseBindView`这个方法中：

```java
private void parseBindView(Element element, Map<TypeElement, BindingClass> targetClassMap,
      Set<TypeElement> erasedTargetNames) {
    TypeElement enclosingElement = (TypeElement) element.getEnclosingElement();

   // 判断是否被注解在属性上，如果该属性是被 private 或者 static 修饰的，则出错
    // 判断是否被注解在错误的包中，若包名以“android”或者“java”开头，则出错
    boolean hasError = isInaccessibleViaGeneratedCode(BindView.class, "fields", element)
        || isBindingInWrongPackage(BindView.class, element);

    // Verify that the target type extends from View.
    TypeMirror elementType = element.asType();
    if (elementType.getKind() == TypeKind.TYPEVAR) {
      TypeVariable typeVariable = (TypeVariable) elementType;
      elementType = typeVariable.getUpperBound();
    }
    // 判断元素是不是View及其子类或者Interface
    if (!isSubtypeOfType(elementType, VIEW_TYPE) && !isInterface(elementType)) {
      error(element, "@%s fields must extend from View or be an interface. (%s.%s)",
          BindView.class.getSimpleName(), enclosingElement.getQualifiedName(),
          element.getSimpleName());
      hasError = true;
    }

    if (hasError) {
      return;
    }

    // Assemble information on the field.
    int id = element.getAnnotation(BindView.class).value();

    BindingClass bindingClass = targetClassMap.get(enclosingElement);
    if (bindingClass != null) {
      ViewBindings viewBindings = bindingClass.getViewBinding(id);
      if (viewBindings != null) {
        Iterator<FieldViewBinding> iterator = viewBindings.getFieldBindings().iterator();
        if (iterator.hasNext()) {
          FieldViewBinding existingBinding = iterator.next();
          error(element, "Attempt to use @%s for an already bound ID %d on '%s'. (%s.%s)",
              BindView.class.getSimpleName(), id, existingBinding.getName(),
              enclosingElement.getQualifiedName(), element.getSimpleName());
          return;
        }
      }
    } else {
      bindingClass = getOrCreateTargetClass(targetClassMap, enclosingElement);
    }

    String name = element.getSimpleName().toString();
    TypeName type = TypeName.get(elementType);
    boolean required = isFieldRequired(element);

    FieldViewBinding binding = new FieldViewBinding(name, type, required);
    bindingClass.addField(id, binding);

    // Add the type-erased version to the valid binding targets set.
    erasedTargetNames.add(enclosingElement);
  }
```



```java
  int id = element.getAnnotation(BindView.class).value();
```

都是在拿到注解信息，然后验证注解的target的类型是否继承自view，然后上面这一行代码获得我们要绑定的View的id，再从targetClassMap里面取出BindingClass(这个BindingClass是管理了所有关于这个注解的一些信息还有实例本身的信息，其实最后是通过BindingClass来生成java代码的)，如果targetClassMap里面不存在的话，就在

```java
      bindingClass = getOrCreateTargetClass(targetClassMap, enclosingElement);
```

这里生成一个，我们进去看一下`getOrCreateTargetClass`：

```java
private BindingClass getOrCreateTargetClass(Map<TypeElement, BindingClass> targetClassMap,
      TypeElement enclosingElement) {
    BindingClass bindingClass = targetClassMap.get(enclosingElement);
    if (bindingClass == null) {
      String targetType = enclosingElement.getQualifiedName().toString();
      String classPackage = getPackageName(enclosingElement);
      boolean isFinal = enclosingElement.getModifiers().contains(Modifier.FINAL);
      String className = getClassName(enclosingElement, classPackage) + BINDING_CLASS_SUFFIX;
      String classFqcn = getFqcn(enclosingElement) + BINDING_CLASS_SUFFIX;

      bindingClass = new BindingClass(classPackage, className, isFinal, targetType, classFqcn);
      targetClassMap.put(enclosingElement, bindingClass);
    }
    return bindingClass;
  }
```

这里面其实很简单，就是获取一些这个注解所修饰的变量的一些信息，比如类名呀，包名呀，然后`className`这里就赋值成`Class$$ViewHolder`了，因为：

```java
  private static final String BINDING_CLASS_SUFFIX = "$$ViewBinder";
```

然后把这个解析后的bindingClass加入到targetClassMap里面。

返回刚刚的`parseBindView`中，根据view的信息生成一个FieldViewBinding，最后添加到上边生成的BindingClass实例中。这里基本完成了解析工作。最后回到`findAndParseTargets`中：

```java
Observable.from(topLevelClasses)
        .flatMap(new Func1<BindingClass, Observable<?>>() {
          @Override public Observable<?> call(BindingClass topLevelClass) {
            if (topLevelClass.hasViewBindings()) {
              topLevelClass.setHighestUnbinderClassName(topLevelClass.getUnbinderClassName());
            } else {

              topLevelClass.setUnbinderClassName(null);
            }
            return ButterKnifeProcessor.this.setParentUnbindingRelationships(
                topLevelClass.getDescendants());
          }
        })
        .toCompletable()
        .await();
```

这里用到了rxjava，其实这里主要的工作是建立上面的绑定的所有的实例的解绑的关系，因为我们绑定了，最后在代码中还是会解绑的。这里预先处理好了这些关系。因为这里要递归地完成解绑，所以用了flatmap，flatmap把每一个创建出来的 Observable 发送的事件，都集中到同一个 Observable 中，然后这个 Observable 负责将这些事件统一交给 Subscriber 。

回到我们的process中， 现在解析完了annotation,该生成java文件了，我再把代码贴一下：

```java
 @Override public boolean process(Set<? extends TypeElement> elements, RoundEnvironment env) {
    Map<TypeElement, BindingClass> targetClassMap = findAndParseTargets(env);

    for (Map.Entry<TypeElement, BindingClass> entry : targetClassMap.entrySet()) {
      TypeElement typeElement = entry.getKey();
      BindingClass bindingClass = entry.getValue();

      try {
        bindingClass.brewJava().writeTo(filer);
      } catch (IOException e) {
        error(typeElement, "Unable to write view binder for type %s: %s", typeElement,
            e.getMessage());
      }
    }

    return true;
  }
```

遍历刚刚得到的targetClassMap ，然后再一个一个地通过

```java
bindingClass.brewJava().writeTo(filer);
```

来生成java文件。然而生成的java文件也是根据上面的信息来用字符串拼接起来的，然而这个工作在brewJava()中完成了：

```java
  JavaFile brewJava() {
    TypeSpec.Builder result = TypeSpec.classBuilder(className)
        .addModifiers(PUBLIC)
        .addTypeVariable(TypeVariableName.get("T", ClassName.bestGuess(targetClass)));
    if (isFinal) {
      result.addModifiers(Modifier.FINAL);
    }

    if (hasParentBinding()) {
      result.superclass(ParameterizedTypeName.get(ClassName.bestGuess(parentBinding.classFqcn),
          TypeVariableName.get("T")));
    } else {
      result.addSuperinterface(ParameterizedTypeName.get(VIEW_BINDER, TypeVariableName.get("T")));
    }

    result.addMethod(createBindMethod());

    if (hasUnbinder() && hasViewBindings()) {
      // Create unbinding class.
      result.addType(createUnbinderClass());

      if (!isFinal) {
        // Now we need to provide child classes to access and override unbinder implementations.
        createUnbinderCreateUnbinderMethod(result);
      }
    }

    return JavaFile.builder(classPackage, result.build())
        .addFileComment("Generated code from Butter Knife. Do not modify!")
        .build();
  }
```

这里用到了java中的javapoet技术，不了解的童鞋可以传送到[github上面](https://github.com/square/javapoet)，也是square的杰作，这个不在这篇文章的讲解范围内，有兴趣的童鞋可以去看看，很不错的开源项目。