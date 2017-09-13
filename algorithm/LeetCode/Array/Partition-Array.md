## 一、题目

> Given an array nums of integers and an int k, partition the array (i.e move the elements in "nums") such that:
>
> - All elements < k are moved to the left
> - All elements >= k are moved to the right
> - Return the partitioning index, i.e the first index i nums[i] >= k.
>
> *Notice*
>
> You should do really partition in array nums instead of just counting the numbers of integers smaller than k.
>
> If all elements in nums are smaller than k, then return nums.length

## 二、解题思路

根据给定的k，也就是类似于Quick Sort中的pivot，将array从两头进行缩进，时间复杂度 O(n)

## 三、解题代码

```java
public class Solution {
    private void swap(int i, int j, int[] arr) {
        int tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    /**
     *@param nums: The integer array you should partition
     *@param k: As description
     *return: The index after partition
     */
    public int partitionArray(int[] nums, int k) {

        int pl = 0;
        int pr = nums.length - 1;
        while (pl <= pr) {
            while (pl <= pr && nums[pl] < k) {
                pl++;
            }
            while (pl <= pr && nums[pr] >= k) {
                pr--;
            }
            if (pl <= pr) {
                swap(pl, pr, nums);
                pl++;
                pr--;
            }
        }
        return pl;
    }
}
```

