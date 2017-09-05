## 一、题目 

>Given a sequence of integers, find the longest increasing subsequence (LIS).
>
>You code should return the length of the LIS.
>
>Example For [5, 4, 1, 2, 3], the LIS is [1, 2, 3], return 3
>
>For [4, 2, 4, 5, 3, 7], the LIS is [4, 4, 5, 7], return 4

## 二、解题思路

## 三、解题代码

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

