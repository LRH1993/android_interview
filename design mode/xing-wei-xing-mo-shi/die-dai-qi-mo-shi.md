### 一、迭代器模式定义

迭代器模式提供一种方法顺序访问一个聚合对象中的各个元素，而又不暴露其内部的表示。把游走的任务放在迭代器上，而不是聚合上。这样简化了聚合的接口和实现，也让责任各得其所。

### 二、迭代器模式结构

![](http://upload-images.jianshu.io/upload_images/3985563-7a93b70924fbcc50.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240/format/jpg)

  


  
迭代器模式涉及到以下几个角色：

　　●　　抽象迭代器\(Iterator\)角色：此抽象角色定义出遍历元素所需的接口。

　　●　　具体迭代器\(ConcreteIterator\)角色：此角色实现了Iterator接口，并保持迭代过程中的游标位置。

　　●　　聚集\(Aggregate\)角色：此抽象角色给出创建迭代器\(Iterator\)对象的接口。

　　●　　具体聚集\(ConcreteAggregate\)角色：实现了创建迭代器\(Iterator\)对象的接口，返回一个合适的具体迭代器实例。

　　●　　客户端\(Client\)角色：持有对聚集及其迭代器对象的引用，调用迭代子对象的迭代接口，也有可能通过迭代子操作聚集元素的增加和删除。

**抽象聚集角色类，这个角色规定出所有的具体聚集必须实现的接口。迭代器模式要求聚集对象必须有一个工厂方法，也就是createIterator\(\)方法，以向外界提供迭代器对象的实例。**

```java
public abstract class Aggregate {
    /**
     * 工厂方法，创建相应迭代子对象的接口
     */
    public abstract Iterator createIterator();
}
```

**具体聚集角色类，实现了抽象聚集角色类所要求的接口，也就是createIterator\(\)方法。此外，还有方法getElement\(\)向外界提供聚集元素，而方法size\(\)向外界提供聚集的大小等。**

```java
public class ConcreteAggregate extends Aggregate {

    private Object[] objArray = null;
    /**
     * 构造方法，传入聚合对象的具体内容
     */
    public ConcreteAggregate(Object[] objArray){
        this.objArray = objArray;
    }

    @Override
    public Iterator createIterator() {

        return new ConcreteIterator(this);
    }
    /**
     * 取值方法：向外界提供聚集元素
     */
    public Object getElement(int index){

        if(index 
<
 objArray.length){
            return objArray[index];
        }else{
            return null;
        }
    }
    /**
     * 取值方法：向外界提供聚集的大小
     */
    public int size(){
        return objArray.length;
    }
}
```

**抽象迭代器角色类**

```java
public interface Iterator {
    /**
     * 迭代方法：移动到第一个元素
     */
    public void first();
    /**
     * 迭代方法：移动到下一个元素
     */
    public void next();
    /**
     * 迭代方法：是否为最后一个元素
     */
    public boolean isDone();
    /**
     * 迭代方法：返还当前元素
     */
    public Object currentItem();
}
```

**具体迭代器角色类**

```java
public class ConcreteIterator implements Iterator {
    //持有被迭代的具体的聚合对象
    private ConcreteAggregate agg;
    //内部索引，记录当前迭代到的索引位置
    private int index = 0;
    //记录当前聚集对象的大小
    private int size = 0;

    public ConcreteIterator(ConcreteAggregate agg){
        this.agg = agg;
        this.size = agg.size();
        index = 0;
    }
    /**
     * 迭代方法：返还当前元素
     */
    @Override
    public Object currentItem() {
        return agg.getElement(index);
    }
    /**
     * 迭代方法：移动到第一个元素
     */
    @Override
    public void first() {

        index = 0;
    }
    /**
     * 迭代方法：是否为最后一个元素
     */
    @Override
    public boolean isDone() {
        return (index 
>
= size);
    }
    /**
     * 迭代方法：移动到下一个元素
     */
    @Override
    public void next() {

        if(index 
<
 size)
        {
            index ++;
        }
    }

}
```

**客户端类**

```java
public class Client {

    public void operation(){
        Object[] objArray = {"One","Two","Three","Four","Five","Six"};
        //创建聚合对象
        Aggregate agg = new ConcreteAggregate(objArray);
        //循环输出聚合对象中的值
        Iterator it = agg.createIterator();
        while(!it.isDone()){
            System.out.println(it.currentItem());
            it.next();
        }
    }
    public static void main(String[] args) {

        Client client = new Client();
        client.operation();
    }

}
```

### 三、迭代器模式的应用

如果要问Java中使用最多的一种模式，答案不是单例模式，也不是工厂模式，更不是策略模式，而是迭代器模式，先来看一段代码吧：

```java
public static void print(Collection coll){  
    Iterator it = coll.iterator();  
    while(it.hasNext()){  
        String str = (String)it.next();  
        System.out.println(str);  
    }  
}
```

这个方法的作用是循环打印一个字符串集合，里面就用到了迭代器模式，java语言已经完整地实现了迭代器模式，例如List，Set，Map，而迭代器的作用就是把容器中的对象一个一个地遍历出来。

### 四、迭代器模式的优缺点

##### 优点

①简化了遍历方式，对于对象集合的遍历，还是比较麻烦的，对于数组或者有序列表，我们尚可以通过游标来取得，但用户需要在对集合了解很清楚的前提下，自行遍历对象，但是对于hash表来说，用户遍历起来就比较麻烦了。而引入了迭代器方法后，用户用起来就简单的多了。

②可以提供多种遍历方式，比如说对有序列表，我们可以根据需要提供正序遍历，倒序遍历两种迭代器，用户用起来只需要得到我们实现好的迭代器，就可以方便的对集合进行遍历了。

③封装性良好，用户只需要得到迭代器就可以遍历，而对于遍历算法则不用去关心。

##### 缺点

对于比较简单的遍历（像数组或者有序列表），使用迭代器方式遍历较为繁琐，大家可能都有感觉，像ArrayList，我们宁可愿意使用for循环和get方法来遍历集合。

### 五、迭代器的应用场景

迭代器模式是与集合共生共死的，一般来说，我们只要实现一个集合，就需要同时提供这个集合的迭代器，就像java中的Collection，List、Set、Map等，这些集合都有自己的迭代器。假如我们要实现一个这样的新的容器，当然也需要引入迭代器模式，给我们的容器实现一个迭代器。

但是，由于容器与迭代器的关系太密切了，所以大多数语言在实现容器的时候都给提供了迭代器，并且这些语言提供的容器和迭代器在绝大多数情况下就可以满足我们的需要，所以现在需要我们自己去实践迭代器模式的场景还是比较少见的，我们只需要使用语言中已有的容器和迭代器就可以了。

