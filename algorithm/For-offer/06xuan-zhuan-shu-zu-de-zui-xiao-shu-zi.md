## 一、题目

把一个数组最开始的若干个元素搬到数组的末尾， 我们称之数组的旋转。输入一个递增排序的数组的一个旋转， 输出旋转数组的最小元素。例如数组{3,4,5,1,2 ｝为｛ 1,2,3,4,5}的一个旋转，该数组的最小值为1。

## 二、解题思路

**Step1.**和二分查找法一样，我们用两个指针分别指向数组的第一个元素和最后一个元素。

**Step2.**接着我们可以找到数组中间的元素：

如果该中间元素位于前面的递增子数组，那么它应该大于或者等于第一个指针指向的元素。此时数组中最小的元素应该位于该中间元素的后面。我们可以把第一个指针指向该中间元素，这样可以缩小寻找的范围。如果中间元素位于后面的递增子数组，那么它应该小于或者等于第二个指针指向的元素。此时该数组中最小的元素应该位于该中间元素的前面。

**Step3.**接下来我们再用更新之后的两个指针，重复做新一轮的查找。

## 三、解题代码

```java
public class Test {  
  
    /** 
     * @param numbers 旋转数组 
     * @return 数组的最小值 
     */  
    public static int min(int[] numbers) {  
        // 判断输入是否合法  
        if (numbers == null || numbers.length == 0) {  
            throw new RuntimeException("Invalid input.");  
        }  
  
        // 开始处理的第一个位置  
        int lo = 0;  
        // 开始处理的最后一个位置  
        int hi = numbers.length - 1;  
        // 设置初始值  
        int mi = lo;  
  
        // 确保lo在前一个排好序的部分，hi在排好序的后一个部分  
        while (numbers[lo] >= numbers[hi]) {  
            // 当处理范围只有两个数据时，返回后一个结果  
            // 因为numbers[lo] >= numbers[hi]总是成立，后一个结果对应的是最小的值  
            if (hi - lo == 1) {  
                return numbers[hi];  
            }  
  
            // 取中间的位置  
            mi = lo + (hi - lo) / 2;  
  
            // 如果三个数都相等，则需要进行顺序处理，从头到尾找最小的值  
            if (numbers[mi] == numbers[lo] && numbers[hi] == numbers[mi]) {  
                return minInorder(numbers, lo, hi);  
            }  
  
            // 如果中间位置对应的值在前一个排好序的部分，将lo设置为新的处理位置  
            if (numbers[mi] >= numbers[lo]) {  
                lo = mi;  
            }  
            // 如果中间位置对应的值在后一个排好序的部分，将hi设置为新的处理位置  
            else if (numbers[mi] <= numbers[hi]) {  
                hi = mi;  
            }  
        }  
  
        // 返回最终的处理结果  
        return numbers[mi];  
    }  
  
    /** 
     * 找数组中的最小值 
     * 
     * @param numbers 数组 
     * @param start   数组的起始位置 
     * @param end     数组的结束位置 
     * @return 找到的最小的数 
     */  
    public static int minInorder(int[] numbers, int start, int end) {  
        int result = numbers[start];  
        for (int i = start + 1; i <= end; i++) {  
            if (result > numbers[i]) {  
                result = numbers[i];  
            }  
        }  
        return result;  
    }    
}  

```



