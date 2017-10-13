## 一、题目

> Determine whether an integer is a palindrome. Do this without extra space.

给定一个数字，要求判断这个数字是否为回文数字. 比如121就是回文数字，122就不是回文数字.

## 二、解题思路

题目要求只能用O(1)的空间，所以不能考虑把它转化为字符串然后reverse比较的方法。

基本思路是每次去第一位和最后一位，如果不相同则返回false，否则继续直到位数为0。

需要注意的点:

1. 负数不是回文数字.
2. 0是回文数字.

## 三、解题代码

```java
public boolean isPalindrome(int x) {
    if(x<0)
        return false;
    int div = 1;
    while(div<=x/10)
        div *= 10;
    while(x>0)
    {
        if(x/div!=x%10)
            return false;
        x = (x%div)/10;
        div /= 100;
    }
    return true;
}
```

