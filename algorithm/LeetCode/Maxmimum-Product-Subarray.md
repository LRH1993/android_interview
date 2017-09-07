## 一、题目

> Find the contiguous subarray within an array (containing at least one number) which has the largest product.
>
> For example, given the array [2,3,-2,4], the contiguous subarray [2,3] has the largest product = 6.

在一个数组中，寻找一个连续子数组使得成绩最大。

## 二、解题思路

这题是求数组中子区间的最大乘积，对于乘法，我们需要注意，负数乘以负数，会变成正数，所以解这题的时候我们需要维护两个变量，当前的最大值，以及最小值，最小值可能为负数，但没准下一步乘以一个负数，当前的最大值就变成最小值，而最小值则变成最大值了。

DP的四要素

- 状态：
  - `max_product[i]`: 以nums[i]结尾的max subarray product
  - `min_product[i]`: 以nums[i]结尾的min subarray product
- 方程：
  - `max_product[i] = getMax(max_product[i-1] * nums[i], min_product[i-1] * nums[i], nums[i])`
  - `min_product[i] = getMin(max_product[i-1] * nums[i], min_product[i-1] * nums[i], nums[i])`
- 初始化：
  - `max_product[0] = min_product[0] = nums[0]`
- 结果：
  - 每次循环中 max_product[i] 的最大值

## 三、解题代码

```java
public class Solution {
    /**
     * @param nums: an array of integers
     * @return: an integer
     */
    public int maxProduct(List<Integer> nums) {
        int[] max = new int[nums.size()];
        int[] min = new int[nums.size()];
        
        min[0] = max[0] = nums.get(0);
        int result = nums.get(0);
        for (int i = 1; i < nums.size(); i++) {
            min[i] = max[i] = nums.get(i);
            if (nums.get(i) > 0) {
                max[i] = Math.max(max[i], max[i - 1] * nums.get(i));
                min[i] = Math.min(min[i], min[i - 1] * nums.get(i));
            } else if (nums.get(i) < 0) {
                max[i] = Math.max(max[i], min[i - 1] * nums.get(i));
                min[i] = Math.min(min[i], max[i - 1] * nums.get(i));
            }
            
            result = Math.max(result, max[i]);
        }
        
        return result;
    }
}
```

