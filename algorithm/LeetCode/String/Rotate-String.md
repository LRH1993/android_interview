## 一、题目

> Given a string and an offset, rotate string by offset. (rotate from left to right)
>
> Example
>
> Given `"abcdefg"`.
>
> offset=0 => "abcdefg"
> offset=1 => "gabcdef"
> offset=2 => "fgabcde"
> offset=3 => "efgabcd"
>
> Challenge
>
> Rotate in-place with O(1) extra memory.

给定一个字符串和一个偏移量，根据偏移量旋转字符串(从左向右旋转)

## 二、解题思路

常见的翻转法应用题，仔细观察规律可知翻转的分割点在从数组末尾数起的offset位置。先翻转前半部分，随后翻转后半部分，最后整体翻转。

## 三、解题代码

```java
public class Solution {
    /*
     * param A: A string
     * param offset: Rotate string with offset.
     * return: Rotated string.
     */
    public char[] rotateString(char[] A, int offset) {
        if (A == null || A.length == 0) {
            return A;
        }

        int len = A.length;
        offset %= len;
        reverse(A, 0, len - offset - 1);
        reverse(A, len - offset, len - 1);
        reverse(A, 0, len - 1);

        return A;
    }

    private void reverse(char[] str, int start, int end) {
        while (start < end) {
            char temp = str[start];
            str[start] = str[end];
            str[end] = temp;
            start++;
            end--;
        }
    }
}
```

