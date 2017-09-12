## 1.1 题目

> Given n items with size A[i], an integer m denotes the size of a backpack. How full you can fill this backpack?
>
> NoteYou
>
>  can not divide any item into small pieces
>
> .Example
>
> If we have 4 items with size [2, 3, 5, 7], the backpack size is 11, we can select 2, 3 and 5, so that the max size we can fill this backpack is 10. 
>
> If the backpack size is 12. we can select [2, 3, 7] so that we can fulfill the backpack.
>
> You function should return the max size we can fill in the given backpack.

在n个物品中挑选若干物品装入背包，最多能装多满？假设背包的大小为m，每个物品的大小为A[i]。

## 1.2 解题思路

本题是典型的01背包问题，每种类型的物品最多只能选择一件。

1. State:` dp[i][S] `表示前i个物品，取出一些能否组成和为S体积的背包
2. Function:` f[i][S] = f[i-1][S - A[i]] or f[i-1][S]` (A[i]表示第i个物品的大小)

转移方程想得到f[i][S]前i个物品取出一些物品想组成S体积的背包。 那么可以从两个状态转换得到。

   （1）`f[i-1][S - A[i]]` 放入第i个物品，并且前i-1个物品能否取出一些组成和为`S-A[i]` 体积大小的背包。

   （2）`f[i-1][S] `不放入第i个物品， 并且前i-1个物品能否取出一些组成和为S 体积大小的背包。

3. Intialize:` f[1…n][0]` = true; `f[0][1... m] `= false

初始化` f[1...n][0] `表示前1...n个物品，取出一些能否组成和为0 大小的背包始终为真。

其他初始化为假

4. Answer: 寻找使`f[n][S] `值为true的最大的S. （S的取值范围1到m）

## 1.3 解题代码

```java
public class Solution {
    /**
     * @param m: An integer m denotes the size of a backpack
     * @param A: Given n items with size A[i]
     * @return: The maximum size
     */
    public int backPack(int m, int[] A) {
        boolean f[][] = new boolean[A.length + 1][m + 1];
        for (int i = 0; i <= A.length; i++) {
            for (int j = 0; j <= m; j++) {
                f[i][j] = false;
            }
        }
        f[0][0] = true;
        for (int i = 1; i <= A.length; i++) {
            for (int j = 0; j <= m; j++) {
                f[i][j] = f[i - 1][j];
                if (j >= A[i-1] && f[i-1][j - A[i-1]]) {
                    f[i][j] = true;
                }
            } // for j
        } // for i
        
        for (int i = m; i >= 0; i--) {
          for (int j = A.length;j>=0;j--){
              if (f[j][i]) {
                return i;
            }
          }
        }
        
        return 0;
    }
}
```

## 2.1 题目

> Given n items with size A[i] and value V[i], and a backpack with size m. What's the maximum value can you put into the backpack?
>
> Note 
>
> You cannot divide item into small pieces and the total size of items you choose should smaller or equal to m.
>
> Example 
>
> Given 4 items with size [2, 3, 5, 7] and value [1, 5, 2, 4], and a backpack with size 10.
>
> The maximum value is 9.

两个数组，一个表示体积，另一个表示价值，给定一个容积为m的背包，求背包装入物品的最大价值。

## 2.2 解题思路

首先定义状态 K(i,w) 为前 i 个物品放入size为 w 的背包中所获得的最大价值，则相应的状态转移方程为： K(i,w)=max{K(i−1,w),K(i−1,w−wi)+vi}

## 2.3 解题代码

```java
public class Solution {
    /**
     * @param m: An integer m denotes the size of a backpack
     * @param A & V: Given n items with size A[i] and value V[i]
     * @return: The maximum value
     */
     
    public int backPackII(int m, int[] A, int V[]) {
        // write your code here
        int[][] dp = new int[A.length + 1][m + 1];
        for(int i = 0; i <= A.length; i++){
            for(int j = 0; j <= m; j++){
                if(i == 0 || j == 0){
                    dp[i][j] = 0;
                }
                else if(A[i-1] > j){
                    dp[i][j] = dp[(i-1)][j];
                }
                else{
                    dp[i][j] = Math.max(dp[(i-1)][j], dp[(i-1)][j-A[i-1]] + V[i-1]);
                }
            }
        }
        return dp[A.length][m];
    }
}
```

## 3.1 题目

> Given n kind of items with size Ai and value Vi( each item has an infinite number available) and a backpack with size m. What's the maximum value can you put into the backpack?
>
> Notice
>
> You cannot divide item into small pieces and the total size of items you choose should smaller or equal to m.
>
> Example
>
> Given 4 items with size [2, 3, 5, 7] and value [1, 5, 2, 4], and a backpack with size 10. The maximum value is 15.

这道题相比上题变为：重复选择+最大价值。

## 3.2 解题思路

和01背包问题很类似

状态转移方程

不放A[i]

`f[i][j] =f[i-1][j]`

放A[j]

可放多个设为k，

k = j/A[i]

`f[i][j] = f[i-1][j- ki*A[i]] + ki*A[i]`  0<=ki<=k  取最大值    0<=ki*A[i]<=m

## 3.3 解题代码

```java
public class Solution {
    /**
     * 多重背包问题
     * 总体积是m，每个小物品的体积是A[i]
     * 
     * @param m: An integer m denotes the size of a backpack
     * @param A: Given n items with size A[i] 0 开始的 A是
     * @return: The maximum size
     */
    public int backPackIII(int m, int[] A) {
        // write your code here
        int[][] P = new int[A.length+1][m+1];// P[i][j] 前i个物品放在j的空间中的最大价值
        for(int i = 0;i< A.length; i++){
            for(int j = m;j>=1;j--){
                if(j>=A[i]){
                    int k = j/A[i];// 该物品最大可以放k个
                    while(k>=0){
                        if(j>=A[i]*k){
                            P[i+1][j] =Math.max(P[i+1][j], P[i][j-k*A[i]] + k*A[i]);
                        }
                        k--;
                    }
                }
                    
                else
                    P[i+1][j] = Math.max(P[i][j],P[i+1][j]);
            }
        }
        return P[A.length][m];
    }
}
```

