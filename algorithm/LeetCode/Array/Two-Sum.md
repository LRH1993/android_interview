## 一、题目

>Given an array of integers, return indices of the two numbers such that they add up to a specific target.
>
>You may assume that each input would have exactly one solution.
>
>Example:
>
>Given nums = [2, 7, 11, 15], target = 9,
>Because nums[0] + nums[1] = 2 + 7 = 9,
>return [0, 1].

给定一个整型数组，找出能相加起来等于一个特定目标数字的两个数。

## 二、解题思路

用hashmap，hashmap是内部存储方式为哈希表的map结构。遍历数组，其中key存放目标值减去当前值，value存放对应索引。如果在遍历过程中发现map中存在与当前值相等的key，则返回结果。

## 三、解题代码

```java
public class Solution {
    /*
     * @param numbers : An array of Integer
     * @param target : target = numbers[index1] + numbers[index2]
     * @return : [index1 + 1, index2 + 1] (index1 < index2)
         numbers=[2, 7, 11, 15],  target=9
         return [1, 2]
     */
    public int[] twoSum(int[] numbers, int target) {
        HashMap<Integer,Integer> map = new HashMap<>();

        for (int i = 0; i < numbers.length; i++) {
            if (map.get(numbers[i]) != null) {
                int[] result = {map.get(numbers[i]) + 1, i + 1};
                return result;
            }
            map.put(target - numbers[i], i);
        }
        
        int[] result = {};
        return result;
    }
}
```

