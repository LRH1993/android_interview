## 一、题目

> Given an integer array, find a subarray where the sum of numbers is zero. Your code should return the index of the first number and the index of the last number.
>
> **Example**
>
> Given `[-3, 1, 2, -3, 4]`, return `[0, 2]` or `[1, 3]`.

给定一个整数数组，找到和为零的子数组。你的代码应该返回满足要求的子数组的起始位置和结束位置

## 二、解题思路

记录每一个位置的sum，存入HashMap中，如果某一个sum已经出现过，那么说明中间的subarray的sum为0. 时间复杂度O(n)，空间复杂度O(n)

## 三、解题代码

```java
public class Solution {
    /**
     * @param nums: A list of integers
     * @return: A list of integers includes the index of the first number
     *          and the index of the last number
     */
    public ArrayList<Integer> subarraySum(int[] nums) {
        // write your code here

        int len = nums.length;

        ArrayList<Integer> ans = new ArrayList<Integer>();
        HashMap<Integer, Integer> map = new HashMap<Integer, Integer>();

        map.put(0, -1);

        int sum = 0;
        for (int i = 0; i < len; i++) {
            sum += nums[i];

            if (map.containsKey(sum)) {
                ans.add(map.get(sum) + 1);
                ans.add(i);
                return ans;
            }

            map.put(sum, i);
        }

        return ans;
    }
}
```

