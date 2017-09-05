## 一、题目 

>Given a sequence of integers, find the longest increasing subsequence (LIS).
>
>You code should return the length of the LIS.
>
>Example For [5, 4, 1, 2, 3], the LIS is [1, 2, 3], return 3
>
>For [4, 2, 4, 5, 3, 7], the LIS is [4, 4, 5, 7], return 4

## 二、解题思路

**方案一：动态规划  时间复杂度O(n*n)**

`dp[i]`表示以i结尾的子序列中LIS的长度。然后我用`dp[j](0<=j<i)`来表示在i之前的LIS的长度。然后我们可以看到，只有当`a[i]>a[j]`的时候，我们需要进行判断，是否将a[i]加入到dp[j]当中。为了保证我们每次加入都是得到一个最优的LIS，有两点需要注意：第一，每一次，a[i]都应当加入最大的那个dp[j]，保证局部性质最优，也就是我们需要找到`max(dp[j](0<=j<i))`；第二，每一次加入之后，我们都应当更新dp[j]的值，显然，`dp[i]=dp[j]+1`。 如果写成递推公式，我们可以得到`dp[i]=max(dp[j](0<=j<i))+(a[i]>a[j]?1:0)`。

**方案二：二分搜索 时间复杂度O(nlogn)**

开一个栈，每次取栈顶元素top和读到的元素temp做比较，如果temp > top 则将temp入栈；如果temp < top则二分查找栈中的比temp大的第1个数，并用temp替换它。 最长序列长度即为栈的大小top。

这也是很好理解的，对于x和y，如果x < y且Stack[y] < Stack[x],用Stack[x]替换Stack[y]，此时的最长序列长度没有改变但序列Q的''潜力''增大了。

举例：原序列为1，5，8，3，6，7

栈为1，5，8，此时读到3，用3替换5，得到1，3，8； 再读6，用6替换8，得到1，3，6；再读7，得到最终栈为1，3，6，7。最长递增子序列为长度4。

## 三、解题代码

方案一：

```java
public int longestIncreasingSubsequence(int[] nums) {
        int []f = new int[nums.length];
        int max = 0;
        for (int i = 0; i < nums.length; i++) {
            f[i] = 1;
            for (int j = 0; j < i; j++) {
                if (nums[j] < nums[i]) {
                    f[i] = f[i] > f[j] + 1 ? f[i] : f[j] + 1;
                }
            }
            if (f[i] > max) {
                max = f[i];
            }
        }
        return max;
    }
```

方案二：

```java
public int findLongest(int[] A, int n) {
        int length = A.length;
        int[] B = new int[length];
        B[0] = A[0];
        int end = 0;
        for (int i = 1; i < length; ++i) {
            // 如果当前数比B中最后一个数还大，直接添加
            if (A[i] >= B[end]) { B[++end] = A[i]; continue;
            }
            // 否则，需要先找到替换位置
            int pos = findInsertPos(B, A[i], 0, end); 
            B[pos] = A[i];
        }
        for (int i = 0; i < B.length; ++i) {
            System.out.println(B[i]);
        }
        return end+ 1; }
    /**
     * 二分查找第一个大于等于n的位置
     */
    private int findInsertPos(int[] B, int n, int start, int end) {
        while (start < end) {
            int mid = start + (end - start) / 2;// 直接使用(high + low) / 2 可能导致溢出
            if (B[mid] < n) {
                start = mid + 1;
            } else if (B[mid] > n) {
                end = mid ;
            } else {
                return mid;
            }
        }
        return start;
    }
```

