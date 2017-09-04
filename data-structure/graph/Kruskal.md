## 一、最小生成树

在含有n个顶点的连通图中选择n-1条边，构成一棵极小连通子图，并使该连通子图中n-1条边上权值之和达到最小，则称其为连通网的最小生成树。 

![](https://github.com/wangkuiwu/datastructs_and_algorithm/blob/master/pictures/graph/kruskal/01.jpg?raw=true&_=3711504)

例如，对于如上图G4所示的连通网可以有多棵权值总和不相同的生成树。

![](https://github.com/wangkuiwu/datastructs_and_algorithm/blob/master/pictures/graph/kruskal/02.jpg?raw=true&_=3711504)

## 二、克鲁斯卡尔算法介绍

克鲁斯卡尔(Kruskal)算法，是用来求加权连通图的最小生成树的算法。

**基本思想**：按照权值从小到大的顺序选择n-1条边，并保证这n-1条边不构成回路。 

**具体做法**：首先构造一个只含n个顶点的森林，然后依权值从小到大从连通网中选择边加入到森林中，并使森林中不产生回路，直至森林变成一棵树为止。

## **三**、克鲁斯卡尔算法图解

![](https://github.com/wangkuiwu/datastructs_and_algorithm/blob/master/pictures/graph/kruskal/03.jpg?raw=true&_=3711504)

以上图G4为例，来对克鲁斯卡尔进行演示(假设，用数组R保存最小生成树结果)。

**第1步**：将边<E,F>加入R中。 

​    边<E,F>的权值最小，因此将它加入到最小生成树结果R中。 

**第2步**：将边<C,D>加入R中。 

​    上一步操作之后，边<C,D>的权值最小，因此将它加入到最小生成树结果R中。 

**第3步**：将边<D,E>加入R中。 

​    上一步操作之后，边<D,E>的权值最小，因此将它加入到最小生成树结果R中。 

**第4步**：将边<B,F>加入R中。 

​    上一步操作之后，边<C,E>的权值最小，但<C,E>会和已有的边构成回路；因此，跳过边<C,E>。同理，跳过边<C,F>。将边<B,F>加入到最小生成树结果R中。 

**第5步**：将边<E,G>加入R中。 

​    上一步操作之后，边<E,G>的权值最小，因此将它加入到最小生成树结果R中。 

**第6步**：将边<A,B>加入R中。 

​    上一步操作之后，边<F,G>的权值最小，但<F,G>会和已有的边构成回路；因此，跳过边<F,G>。同理，跳过边<B,C>。将边<A,B>加入到最小生成树结果R中。

此时，最小生成树构造完成！它包括的边依次是：**<E,F> <C,D> <D,E> <B,F> <E,G> <A,B>**。

## 四、克鲁斯卡尔算法分析

根据前面介绍的克鲁斯卡尔算法的基本思想和做法，我们能够了解到，克鲁斯卡尔算法重点需要解决的以下两个问题： 

**问题一** 对图的所有边按照权值大小进行排序。 

**问题二** 将边添加到最小生成树中时，怎么样判断是否形成了回路。

问题一很好解决，采用排序算法进行排序即可。

问题二，处理方式是：记录顶点在"最小生成树"中的终点，顶点的终点是"在最小生成树中与它连通的最大顶点"(*关于这一点，后面会通过图片给出说明*)。然后每次需要将一条边添加到最小生存树时，判断该边的两个顶点的终点是否重合，重合的话则会构成回路。 以下图来进行说明：

![](https://github.com/wangkuiwu/datastructs_and_algorithm/blob/master/pictures/graph/kruskal/04.jpg?raw=true&_=3711504)

在将<E,F> <C,D> <D,E>加入到最小生成树R中之后，这几条边的顶点就都有了终点：

> **(01)** C的终点是F。 
>
> **(02)** D的终点是F。 
>
> **(03)** E的终点是F。 
>
> **(04)** F的终点是F。

关于终点，就是将所有顶点按照从小到大的顺序排列好之后；某个顶点的终点就是"与它连通的最大顶点"。 因此，接下来，虽然<C,E>是权值最小的边。但是C和E的重点都是F，即它们的终点相同，因此，将<C,E>加入最小生成树的话，会形成回路。这就是判断回路的方式。

## 五、克鲁斯卡尔算法的代码说明

有了前面的算法分析之后，下面我们来查看具体代码。这里选取"邻接矩阵"进行说明，对于"邻接表"实现的图在后面的源码中会给出相应的源码。

**1. 基本定义**

```java
// 边的结构体
private static class EData {
    char start; // 边的起点
    char end;   // 边的终点
    int weight; // 边的权重

    public EData(char start, char end, int weight) {
        this.start = start;
        this.end = end;
        this.weight = weight;
    }
};
```

EData是邻接矩阵边对应的结构体。

```
public class MatrixUDG {

    private int mEdgNum;        // 边的数量
    private char[] mVexs;       // 顶点集合
    private int[][] mMatrix;    // 邻接矩阵
    private static final int INF = Integer.MAX_VALUE;   // 最大值

    ...
}
```

MatrixUDG是邻接矩阵对应的结构体。mVexs用于保存顶点，mEdgNum用于保存边数，mMatrix则是用于保存矩阵信息的二维数组。例如，mMatrix[i][j]=1，则表示"顶点i(即mVexs[i])"和"顶点j(即mVexs[j])"是邻接点；mMatrix[i][j]=0，则表示它们不是邻接点。

**2. 克鲁斯卡尔算法**

```java
/*
 * 克鲁斯卡尔（Kruskal)最小生成树
 */
public void kruskal() {
    int index = 0;                      // rets数组的索引
    int[] vends = new int[mEdgNum];     // 用于保存"已有最小生成树"中每个顶点在该最小树中的终点。
    EData[] rets = new EData[mEdgNum];  // 结果数组，保存kruskal最小生成树的边
    EData[] edges;                      // 图对应的所有边

    // 获取"图中所有的边"
    edges = getEdges();
    // 将边按照"权"的大小进行排序(从小到大)
    sortEdges(edges, mEdgNum);

    for (int i=0; i<mEdgNum; i++) {
        int p1 = getPosition(edges[i].start);      // 获取第i条边的"起点"的序号
        int p2 = getPosition(edges[i].end);        // 获取第i条边的"终点"的序号

        int m = getEnd(vends, p1);                 // 获取p1在"已有的最小生成树"中的终点
        int n = getEnd(vends, p2);                 // 获取p2在"已有的最小生成树"中的终点
        // 如果m!=n，意味着"边i"与"已经添加到最小生成树中的顶点"没有形成环路
        if (m != n) {
            vends[m] = n;                       // 设置m在"已有的最小生成树"中的终点为n
            rets[index++] = edges[i];           // 保存结果
        }
    }

    // 统计并打印"kruskal最小生成树"的信息
    int length = 0;
    for (int i = 0; i < index; i++)
        length += rets[i].weight;
    System.out.printf("Kruskal=%d: ", length);
    for (int i = 0; i < index; i++)
        System.out.printf("(%c,%c) ", rets[i].start, rets[i].end);
    System.out.printf("\n");
}
```