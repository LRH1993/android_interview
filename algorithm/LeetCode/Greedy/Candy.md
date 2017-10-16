## 一、题目

> There are N children standing in a line. Each child is assigned a rating value.
>
> You are giving candies to these children subjected to the following requirements:
>
> Each child must have at least one candy. Children with a higher rating get more candies than their neighbors. What is the minimum candies you must give?

有 *N* 个小孩站成一列。每个小孩有一个评级。

按照以下要求，给小孩分糖果：

- 每个小孩至少得到一颗糖果。
- 评级越高的小孩可以比他相邻的两个小孩得到更多的糖果。

需最少准备多少糖果？

## 二、解题思路

首先我们会给每个小朋友一颗糖果，然后从左到右，假设第i个小孩的等级比第i - 1个小孩高，那么第i的小孩的糖果数量就是第i - 1个小孩糖果数量在加一。再我们从右到左，如果第i个小孩的等级大于第i + 1个小孩的，同时第i个小孩此时的糖果数量小于第i + 1的小孩，那么第i个小孩的糖果数量就是第i + 1个小孩的糖果数量加一。

## 三、解题代码

```java
public class Solution {
    public int candy(int[] ratings) {
        if(ratings == null || ratings.length == 0) {
            return 0;
        }

        int[] count = new int[ratings.length];
        Arrays.fill(count, 1);
        int sum = 0;
        for(int i = 1; i < ratings.length; i++) {
            if(ratings[i] > ratings[i - 1]) {
                count[i] = count[i - 1] + 1;
            }
        }

        for(int i = ratings.length - 1; i >= 1; i--) {
            sum += count[i];
            if(ratings[i - 1] > ratings[i] && count[i - 1] <= count[i]) {  // second round has two conditions
                count[i-1] = count[i] + 1;
            }
        }
        sum += count[0];
        return sum;
    }
}
```

