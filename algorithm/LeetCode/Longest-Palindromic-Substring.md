## 一、题目

> Given a string S, find the longest palindromic substring in S.
>
>  You may assume that the maximum length of S is 1000, and there exists one unique longest palindromic substring.
>
> **Example**
>
> Given the string = `"abcdzdcab"`, return `"cdzdc"`.
>
> **Challenge**
>
> O(n2) time is acceptable. Can you do it in O(n) time.

求一个字符串中的最长回文子串。

## 二、解题思路

### 区间类动态规划

Time O(n^2), Space O(n^2)

用`dp[i][j]`来存DP的状态，需要较多的额外空间: Space O(n^2)

DP的4个要素

- 状态：
  - `dp[i][j]`: s.charAt(i)到s.charAt(j)是否构成一个Palindrome
- 转移方程：
  - `dp[i][j] = s.charAt(i) == s.charAt(j) && (j - i <= 2 || dp[i + 1][j - 1])`
- 初始化：
  - `dp[i][j] = true` when `j - i <= 2`
- 结果：
  - 找 `maxLen = j - i + 1;`，并得到相应longest substring： `longest = s.substring(i, j + 1);`

### 中心扩展

这种方法基本思想是遍历数组，以其中的1个元素或者2个元素作为palindrome的中心，通过辅助函数，寻找能拓展得到的最长子字符串。外层循环 O(n)，内层循环O(n)，因此时间复杂度 Time O(n^2)，相比动态规划二维数组存状态的方法，因为只需要存最长palindrome子字符串本身，这里空间更优化：Space O(1)。

## 三、解题代码

区间DP，Time O(n^2) Space O(n^2)

```java
public class Solution {
    /**
     * @param s input string
     * @return the longest palindromic substring
     */
     public String longestPalindrome(String s) {
         if(s == null || s.length() <= 1) {
             return s;
         }

         int len = s.length();
         int maxLen = 1;
         boolean [][] dp = new boolean[len][len];

         String longest = null;
         for(int k = 0; k < s.length(); k++){
             for(int i = 0; i < len - k; i++){
                 int j = i + k;
                 if(s.charAt(i) == s.charAt(j) && (j - i <= 2 || dp[i + 1][j - 1])){
                     dp[i][j] = true;

                     if(j - i + 1 > maxLen){
                        maxLen = j - i + 1;
                        longest = s.substring(i, j + 1);
                     }
                 }
             }
         }

         return longest;
     }
}
```

Time O(n^2) Space O(1)

```java
public class Solution {
    /**
     * @param s input string
     * @return the longest palindromic substring
     */
    public String longestPalindrome(String s) {
            if (s.isEmpty()) {
                return null;
            }

            if (s.length() == 1) {
                return s;
            }

            String longest = s.substring(0, 1);
            for (int i = 0; i < s.length(); i++) {
                // get longest palindrome with center of i
                String tmp = helper(s, i, i);
                if (tmp.length() > longest.length()) {
                    longest = tmp;
                }

                // get longest palindrome with center of i, i+1
                tmp = helper(s, i, i + 1);
                if (tmp.length() > longest.length()) {
                    longest = tmp;
                }
            }

            return longest;
    }

    // Given a center, either one letter or two letter,
    // Find longest palindrome
    public String helper(String s, int begin, int end) {
        while (begin >= 0 && end <= s.length() - 1 && s.charAt(begin) == s.charAt(end)) {
            begin--;
            end++;
        }
        return s.substring(begin + 1, end);
    }
}
```

