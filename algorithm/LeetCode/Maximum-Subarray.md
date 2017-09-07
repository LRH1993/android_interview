## 一、题目

> Find the contiguous subarray within an array (containing at least one number) which has the largest sum. 
>
> For example, given the array [−2,1,−3,4,−1,2,1,−5,4], the contiguous subarray [4,−1,2,1] has the largest sum = 6. 
>
> More practice: If you have figured out the O(n) solution, try coding another solution using the divide and conquer approach, which is more subtle.

## 二、解题思路

**方案一**

典型的DP题：

1. 状态dp[i]：以A[i]为最后一个数的所有max subarray的和。
2. 通项公式：dp[i] = dp[i-1]<=0 ? dp[i] : dp[i-1]+A[i]
3. 由于dp[i]仅取决于dp[i-1]，所以可以仅用一个变量来保存前一个状态，而节省内存。

**方案二**

虽然这道题目用dp解起来很简单，但是题目说了，问我们能不能采用divide and conquer的方法解答，也就是二分法。

假设数组A[left, right]存在最大区间，mid = (left + right) / 2，那么无非就是三中情况：

1. 最大值在A[left, mid - 1]里面
2. 最大值在A[mid + 1, right]里面
3. 最大值跨过了mid，也就是我们需要计算[left, mid - 1]区间的最大值，以及[mid + 1, right]的最大值，然后加上mid，三者之和就是总的最大值

我们可以看到，对于1和2，我们通过递归可以很方便的求解，然后在同第3的结果比较，就是得到的最大值。

## 三、解题代码

方案一

```java
public class Solution {
    /**
     * @param nums: A list of integers
     * @return: A integer indicate the sum of max subarray
     */
    public int maxSubArray(int[] A) {
        int n = A.length;
        int[] dp = new int[n]; //dp[i] means the maximum subarray ending with A[i];
        dp[0] = A[0];
        int max = dp[0];

        for(int i = 1; i < n; i++){
            dp[i] = A[i] + (dp[i - 1] > 0 ? dp[i - 1] : 0);
            max = Math.max(max, dp[i]);
        }

        return max;
    }
}
```

方案二

```java
public class Solution {
    public int maxSubArray(int[] A) {
        int maxSum = Integer.MIN_VALUE;
        return findMaxSub(A, 0, A.length - 1, maxSum);
    }
      
    // recursive to find max sum 
    // may appear on the left or right part, or across mid(from left to right)
    public int findMaxSub(int[] A, int left, int right, int maxSum) {
        if(left > right)    return Integer.MIN_VALUE;
          
        // get max sub sum from both left and right cases
        int mid = (left + right) / 2;
        int leftMax = findMaxSub(A, left, mid - 1, maxSum);
        int rightMax = findMaxSub(A, mid + 1, right, maxSum);
        maxSum = Math.max(maxSum, Math.max(leftMax, rightMax));
          
        // get max sum of this range (case: across mid)
        // so need to expend to both left and right using mid as center
        // mid -> left
        int sum = 0, midLeftMax = 0;
        for(int i = mid - 1; i >= left; i--) {
            sum += A[i];
            if(sum > midLeftMax)    midLeftMax = sum;
        }
        // mid -> right
        int midRightMax = 0; sum = 0;
        for(int i = mid + 1; i <= right; i++) {
            sum += A[i];
            if(sum > midRightMax)    midRightMax = sum;
        }
          
        // get the max value from the left, right and across mid
        maxSum = Math.max(maxSum, midLeftMax + midRightMax + A[mid]);
          
        return maxSum;
    }
}
```

