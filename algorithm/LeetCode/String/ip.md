## 一、题目

> Given a string containing only digits, restore it by returning all possible valid IP address combinations.
>
> For example:
> Given `"25525511135"`,
>
> return `["255.255.11.135", "255.255.111.35"]`. (Order does not matter)

给一个由数字组成的字符串。求出其可能恢复为的所有IP地址。

注意 ：中间IP位置不能以0开始，0.01.01.1非法，应该是0.0.101.1或者0.0.10.11

## 二、解题思路

方法一：

直接三种循环暴力求解

方法二：

深度搜索，回溯

## 三、解题代码

方法一

```java
public class Solution {
    /**
     * @param s the IP string
     * @return All possible valid IP addresses
     */
    public ArrayList<String> restoreIpAddresses(String s) {
        ArrayList<String> res = new ArrayList<String>();
        int len = s.length();
        for(int i = 1; i<4 && i<len-2; i++){
            for(int j = i+1; j<i+4 && j<len-1; j++){
                for(int k = j+1; k<j+4 && k<len; k++){
                    String s1 = s.substring(0,i), s2 = s.substring(i,j), s3 = s.substring(j,k), s4 = s.substring(k,len);
                    if(isValid(s1) && isValid(s2) && isValid(s3) && isValid(s4)){
                        res.add(s1+"."+s2+"."+s3+"."+s4);
                    }
                }
            }
        }
        return res;
    }
    public boolean isValid(String s){
        if(s.length()>3 || s.length()==0 || (s.charAt(0)=='0' && s.length()>1) || Integer.parseInt(s)>255)
            return false;
        return true;
    }
}
```

方法二

```java
public class Solution {
    /**
     * @param s the IP string
     * @return All possible valid IP addresses
     */
    public ArrayList<String> restoreIpAddresses(String s) {
        ArrayList<String> result = new ArrayList<String>();
        ArrayList<String> list = new ArrayList<String>();

        if(s.length() <4 || s.length() > 12)
            return result;

        helper(result, list, s , 0);
        return result;
    }

    public void helper(ArrayList<String> result, ArrayList<String> list, String s, int start){
        if(list.size() == 4){
            if(start != s.length())
                return;

            StringBuffer sb = new StringBuffer();
            for(String tmp: list){
                sb.append(tmp);
                sb.append(".");
            }
            sb.deleteCharAt(sb.length()-1);
            result.add(sb.toString());
            return;
        }

        for(int i=start; i<s.length() && i < start+3; i++){
            String tmp = s.substring(start, i+1);
            if(isvalid(tmp)){
                list.add(tmp);
                helper(result, list, s, i+1);
                list.remove(list.size()-1);
            }
        }
    }

    private boolean isvalid(String s){
        if(s.charAt(0) == '0')
            return s.equals("0"); // to eliminate cases like "00", "10"
        int digit = Integer.valueOf(s);
        return digit >= 0 && digit <= 255;
    }
}
```

