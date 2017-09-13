## 一、题目

> There is a stone game.At the beginning of the game the player picks `n` piles of stones in a line.
>
> The goal is to merge the stones in one pile observing the following rules:
>
> 1. At each step of the game, the player can merge two adjacent piles to a new pile.
> 2. The score is the number of stones in the new pile.
>
> You are to determine the **minimum** of the total score.
>
> **Example**
>
> For `[4, 1, 1, 4]`, in the best solution, the total score is `18`:
>
> ```
> 1. Merge second and third piles => [4, 2, 4], score +2
> 2. Merge the first two piles => [6, 4]，score +6
> 3. Merge the last two piles => [10], score +10
> ```
>
> Other two examples:
>
> `[1, 1, 1, 1]` return `8` `[4, 4, 5, 9]` return `43`

一堆石头，每个石头代表一个值。每次可以合并两个相邻的石头，得分是合并后的和。一直合并，同时累计得分，直到变成一个石头，并求出得分最小的值。

## 二、解题思路

这道题可用DP解。

`dp[i][j]`表示合并i到j的石头需要的最小代价。

转移函数：

`dp[i][j]=dp[i][k]+dp[k+1][j]+sum[i][j]` （i<=k<j）。即合并i－j的代价为合并左边部分的代价＋合并右边部分的代价＋合并左右部分的代价（即i－j所有元素的总和）。找到使`dp[i][j]`最小的k。

DP四要素

- State:
  - `dp[i][j]`表示把第i到第j个石子合并到一起的最小花费
- Function:
  - 预处理`sum[i][j]`表示i到j所有石子价值和
  - `dp[i][j] = min(dp[i][k]+dp[k+1][j]+sum[i][j])` 对于所有`k`属于`{i,j}`
- Intialize:
  - for each i
    - `dp[i][i] = 0`
- Answer:
  - `dp[0][n-1]`

区间型DP，利用二维数组下标表示下标范围。 需要注意的是对状态转移方程的理解，也就是对每一种分割方式进行遍历。

## 三、解题代码

```java
public class Solution {
    /**
     * @param A an integer array
     * @return an integer
     */
    public int stoneGame(int[] A) {
        // Write your code here
        // DP
        if(A == null || A.length == 0){
            return 0;
        }

        int n = A.length;
        int[][] sum = new int[n][n];
        for(int i = 0; i < n; i++){
            sum[i][i] = A[i];
            for(int j = i + 1; j < n; j++){
                sum[i][j] = sum[i][j - 1] + A[j];
            }
        }

        int[][] dp = new int[n][n];
        for(int i = 0; i < n; i++){
            dp[i][i] = 0;
        }

        for(int len = 2; len <= n; len++){
            for(int i = 0; i + len - 1 < n; i++){
                int j = i + len - 1;
                int min = Integer.MAX_VALUE;
                for(int k = i; k < j; k++){
                    min = Math.min(min, dp[i][k] + dp[k + 1][j]);
                }
                dp[i][j] = min + sum[i][j];
            }
        }

        return dp[0][n - 1];
    }
}
```

