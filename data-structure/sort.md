# ![](/assets/排序算法.png)

# 冒泡排序

### 基本思想:

比较相邻的元素。如果第一个比第二个大，就交换他们两个。

对每一对相邻元素作同样的工作，从开始第一对到结尾的最后一对。在这一点，最后的元素应该会是最大的数。 针对所有的元素重复以上的步骤，除了最后一个。持续每次对越来越少的元素重复上面的步骤，直到没有任何一对数字需要比较。

**Java实现**

加入标记状态 flag 若在一次冒泡中，没有交换 则说明可以停止 减少运行时

```java
public static void bubbleSort(int[] numbers) {
    int temp = 0;
    int size = numbers.length;
    boolean flag = true;
    for (int i = 0; i < size - 1&&flag; i++) {
        flag = false;
        for (int j = 0; j < size - 1 - i; j++) {
            if (numbers[j] > numbers[j + 1]) // 交换两数位置
            {
                temp = numbers[j];
                numbers[j] = numbers[j + 1];
                numbers[j + 1] = temp;
                flag = true;
            }
        }
    }
}
```

时间复杂度O\(n\*n\)

# 选择排序算法

### 基本思想：

在要排序的一组数中，选出最小的一个数与第一个位置的数交换；然后在剩下的数当中再找最小的与第二个位置的数交换，如此循环到倒数第二个数和最后一个数比较为止。

**Java 实现**

```java
public static void selectSort(int[] numbers) {
    int size = numbers.length; // 数组长度
    int temp = 0; // 中间变量
    for (int i = 0; i < size-1; i++) {
        int k = i; // 待确定的位置
        // 选择出应该在第i个位置的数
        for (int j = size - 1; j > i; j--) {
            if (numbers[j] < numbers[k]) {
                k = j;
            }
        }
        // 交换两个数
        temp = numbers[i];
        numbers[i] = numbers[k];
        numbers[k] = temp;
    }
}
```

时间复杂度O\(n\*n\) 性能上优于冒泡排序 交换次数少

# 插入排序算法

### 基本思想：

每步将一个待排序的记录，按其顺序码大小插入到前面已经排序的字序列的合适位置（从后向前找到合适位置后），直到全部插入排序完为止。

J**ava 实现**

```java
public static void insertSort(int[] numbers) {
    int size = numbers.length;
    int temp = 0;
    int j = 0;
    for (int i = 1; i < size; i++) {
        temp = numbers[i];
        // 假如temp比前面的值小，则将前面的值后移
        for (j = i; j > 0 && temp < numbers[j - 1]; j--) {
            numbers[j] = numbers[j - 1];
        }
        numbers[j] = temp;
    }
}
```

时间复杂度

O\(n\*n\) 性能上优于冒泡排序和选择排序

# 希尔排序算法

### 基本思想：

先将整个待排序的记录序列分割成为若干子序列分别进行直接插入排序，待整个序列中的记录“基本有序”时，再对全体记录进行依次直接插入排序。

**Java 实现**

```java
/**
 * 希尔排序的原理:根据需求，如果你想要结果从小到大排列，它会首先将数组进行分组，然后将较小值移到前面，较大值
 * 移到后面，最后将整个数组进行插入排序，这样比起一开始就用插入排序减少了数据交换和移动的次数，
 * 可以说希尔排序是加强 版的插入排序 拿数组5, 2,8, 9, 1, 3，4来说，数组长度为7，当increment为3时，数组分为两个序列
 * 5，2，8和9，1，3，4，第一次排序，9和5比较，1和2比较，3和8比较，4和比其下标值小increment的数组值相比较
 * 此例子是按照从小到大排列，所以小的会排在前面，第一次排序后数组为5, 1, 3, 4, 2, 8，9
 * 第一次后increment的值变为3/2=1,此时对数组进行插入排序， 实现数组从大到小排
 */
public static void shellSort(int[] data) {
    int j = 0;
    int temp = 0;
    // 每次将步长缩短为原来的一半
    for (int increment = data.length / 2; increment > 0; increment /= 2) {
        for (int i = increment; i < data.length; i++) {
            temp = data[i];
            for (j = i; j >= increment; j -= increment) {
                if (temp < data[j - increment])// 从小到大排
                {
                    data[j] = data[j - increment];
                } else {
                    break;
                }
            }
            data[j] = temp;
        }
    }
```

时间复杂度O\(n^1.5）

# 堆排序算法

### 基本思想:

堆排序是一种树形选择排序，是对直接选择排序的有效改进。

堆的定义下：具有n个元素的序列 （h1,h2,...,hn\),当且仅当满足（hi&gt;=h2i,hi&gt;=h2i+1）或（hi&lt;=h2i,hi&lt;=h2i+1） \(i=1,2,...,n/2\)时称之为堆。在这里只讨论满足前者条件的堆。由堆的定义可以看出，堆顶元素（即第一个元素）必为最大项（大顶堆）。完全二叉树可以很直观地表示堆的结构。堆顶为根，其它为左子树、右子树。

**思想:**初始时把要排序的数的序列看作是一棵顺序存储的二叉树，调整它们的存储序，使之成为一个 堆，这时堆的根节点的数最大。然后将根节点与堆的最后一个节点交换。然后对前面\(n-1\)个数重新调整使之成为堆。依此类推，直到只有两个节点的堆，并对 它们作交换，最后得到有n个节点的有序序列。从算法描述来看，堆排序需要两个过程，一是建立堆，二是堆顶与堆的最后一个元素交换位置。所以堆排序有两个函数组成。一是建堆的渗透函数，二是反复调用渗透函数实现排序的函数。

J**ava 实现**

```java
public static void heapSort(int[] a){
    int arrayLength = a.length;
    // 循环建堆
    for (int i = 0; i < arrayLength - 1; i++) {
        // 建堆
        buildMaxHeap(a, arrayLength - 1 - i);
        // 交换堆顶和最后一个元素
        swap(a, 0, arrayLength - 1 - i);
        System.out.println(Arrays.toString(a));
    }
}
// 对data数组从0到lastIndex建大顶堆
public static void buildMaxHeap(int[] data, int lastIndex) {
    // 从lastIndex处节点（最后一个节点）的父节点开始
    for (int i = (lastIndex - 1) / 2; i >= 0; i--) {
        // k保存正在判断的节点
        int k = i;
        // 如果当前k节点的子节点存在
        while (k * 2 + 1 <= lastIndex) {
            // k节点的左子节点的索引
            int biggerIndex = 2 * k + 1;
            // 如果biggerIndex小于lastIndex，即biggerIndex+1代表的k节点的右子节点存在
            if (biggerIndex < lastIndex) {
                // 若果右子节点的值较大
                if (data[biggerIndex] < data[biggerIndex + 1]) {
                    // biggerIndex总是记录较大子节点的索引
                    biggerIndex++;
                }
            }
            // 如果k节点的值小于其较大的子节点的值
            if (data[k] < data[biggerIndex]) {
                // 交换他们
                swap(data, k, biggerIndex);
                // 将biggerIndex赋予k，开始while循环的下一次循环，重新保证k节点的值大于其左右子节点的值
                k = biggerIndex;
            } else {
                break;
            }
        }
    }
}
// 交换
private static void swap(int[] data, int i, int j) {
    int tmp = data[i];
    data[i] = data[j];
    data[j] = tmp;
}
```

时间复杂度O\(nlogn）不适合待排序序列较少的情况

# 快速排序算法

### 基本思想：

通过一趟排序将待排序记录分割成独立的两部分，其中一部分记录的关键字均比另一部分关键字小，则分别对这两部分继续进行排序，直到整个序列有序。

J**ava 实现**

```java
/**
 * 快速排序
 * 
 * @param numbers
 *            带排序数组
 */
public static void quick(int[] numbers) {
    if (numbers.length > 0) // 查看数组是否为空
    {
        quickSort(numbers, 0, numbers.length - 1);
    }
}
/**
 * 
 * @param numbers
 *            带排序数组
 * @param low
 *            开始位置
 * @param high
 *            结束位置
 */
public static void quickSort(int[] numbers, int low, int high) {
    if (low >= high) {
        return;
    }
    int middle = getMiddle(numbers, low, high); // 将numbers数组进行一分为二
    quickSort(numbers, low, middle - 1); // 对低字段表进行递归排序
    quickSort(numbers, middle + 1, high); // 对高字段表进行递归排序
}
/**
 * 查找出中轴（默认是最低位low）的在numbers数组排序后所在位置
 * 
 * @param numbers
 *            带查找数组
 * @param low
 *            开始位置
 * @param high
 *            结束位置
 * @return 中轴所在位置
 */
public static int getMiddle(int[] numbers, int low, int high) {
    int temp = numbers[low]; // 数组的第一个作为中轴
    while (low < high) {
        while (low < high && numbers[high] > temp) {
            high--;
        }
        numbers[low] = numbers[high];// 比中轴小的记录移到低端
        while (low < high && numbers[low] < temp) {
            low++;
        }
        numbers[high] = numbers[low]; // 比中轴大的记录移到高端
    }
    numbers[low] = temp; // 中轴记录到尾
    return low; // 返回中轴的位置
}
```

时间复杂度O\(nlogn）

快速排序在序列中元素很少时，效率将比较低，不如插入排序，因此一般在序列中元素很少时使用插入排序，这样可以提高整体效率。

# 归并排序算法

### 基本思想:

归并（Merge）排序法是将两个（或两个以上）有序表合并成一个新的有序表，即把待排序序列分为若干个子序列，每个子序列是有序的。然后再把有序子序列合并为整体有序序列。

**Java 实现**

```java
/**
 * 归并排序
 * 简介:将两个（或两个以上）有序表合并成一个新的有序表 即把待排序序列分为若干个子序列，每个子序列是有序的。然后再把有序子序列合并为整体有序序列
 * 时间复杂度为O(nlogn)
 * 稳定排序方式
 * @param nums 待排序数组
 * @return 输出有序数组
 */
public static int[] sort(int[] nums, int low, int high) {
    int mid = (low + high) / 2;
    if (low < high) {
        // 左边
        sort(nums, low, mid);
        // 右边
        sort(nums, mid + 1, high);
        // 左右归并
        merge(nums, low, mid, high);
    }
    return nums;
}
/**
 * 将数组中low到high位置的数进行排序
 * @param nums 待排序数组
 * @param low 待排的开始位置
 * @param mid 待排中间位置
 * @param high 待排结束位置
 */
public static void merge(int[] nums, int low, int mid, int high) {
    int[] temp = new int[high - low + 1];
    int i = low;// 左指针
    int j = mid + 1;// 右指针
    int k = 0;
    // 把较小的数先移到新数组中
    while (i <= mid && j <= high) {
        if (nums[i] < nums[j]) {
            temp[k++] = nums[i++];
        } else {
            temp[k++] = nums[j++];
        }
    }
    // 把左边剩余的数移入数组
    while (i <= mid) {
        temp[k++] = nums[i++];
    }
    // 把右边边剩余的数移入数组
    while (j <= high) {
        temp[k++] = nums[j++];
    }
    // 把新数组中的数覆盖nums数组
    for (int k2 = 0; k2 < temp.length; k2++) {
        nums[k2 + low] = temp[k2];
    }
}
```

时间复杂度O\(nlogn）

# 各种算法的时间复杂度等性能比较

![](/assets/排序算法比较.png)

