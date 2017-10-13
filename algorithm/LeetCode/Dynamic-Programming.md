## 一、动态规划

### 1. 简介

动态规划的本质，是对问题**状态的定义**和**状态转移方程的定义**。

> **dynamic programming** is a method for solving a complex problem by **breaking it down into a collection of simpler subproblems**.

动态规划是通过**拆分问题，**定义问题状态和状态之间的关系，使得问题能够以递推（或者说分治）的方式去解决。

以下介绍，大多都是在说递推的求解方法，但**如何拆分问题**，才是动态规划的核心。

而**拆分问题**，靠的就是**状态的定义**和**状态转移方程的定义**。

### 2. 状态的定义

首先想说大家千万不要被下面的数学式吓到，这里只涉及到了函数相关的知识。

> 给定一个数列，长度为N，
> 求这个数列的最长上升（递增）子数列（LIS）的长度.
> 以
> 1 7 2 8 3 4
> 为例。
> 这个数列的最长递增子数列是 1 2 3 4，长度为4；
> 次长的长度为3， 包括 1 7 8; 1 2 3 等.

要解决这个问题，我们首先要**定义这个问题**和这个问题的子问题。
有人可能会问了，题目都已经在这了，我们还需定义这个问题吗？需要，原因就是这个问题在字面上看，找不出子问题，而没有子问题，这个题目就没办法解决。

> 给定一个数列，长度为N，
> 设![F_{k}](https://www.zhihu.com/equation?tex=F_%7Bk%7D)为：以数列中第k项结尾的最长递增子序列的长度.
> 求![F_{1}..F_{N}](https://www.zhihu.com/equation?tex=F_%7B1%7D..F_%7BN%7D) 中的最大值.

显然，这个新问题与原问题等价。
而对于![F_{k}](https://www.zhihu.com/equation?tex=F_%7Bk%7D)来讲，![F_{1} .. F_{k-1}](https://www.zhihu.com/equation?tex=F_%7B1%7D+..+F_%7Bk-1%7D)都是![F_{k}](https://www.zhihu.com/equation?tex=F_%7Bk%7D)的子问题：因为以第k项结尾的最长递增子序列（下称LIS），包含着以第![1..k-1](https://www.zhihu.com/equation?tex=1..k-1)中某项结尾的LIS。

上述的新问题![F_{k}](https://www.zhihu.com/equation?tex=F_%7Bk%7D)也可以叫做状态，定义中的“![F_{k}](https://www.zhihu.com/equation?tex=F_%7Bk%7D)为数列中第k项结尾的LIS的长度”，就叫做对状态的定义。
之所以把![F_{k}](https://www.zhihu.com/equation?tex=F_%7Bk%7D)做“状态”而不是“问题” ，一是因为避免跟原问题中“问题”混淆，二是因为这个新问题是数学化定义的。

对状态的定义只有一种吗？当然不是

> 给定一个数列，长度为N，
> 设$F_{i,k}$为：
> 在前i项中的，长度为k的最长递增子序列中，最后一位的最小值. 1<=k<=N.
> 若在前i项中，不存在长度为k的最长递增子序列，则$F_{i,k}$为正无穷.
> 求最大的x，使得$F_{N,k}$不为正无穷。

这个新定义与原问题的等价性也不难证明，请读者体会一下。
上述的$F_{i,k}$就是状态，定义中的“$F_{i,k}$为：在前i项中，长度为k的最长递增子序列中，最后一位的最小值”就是对状态的定义。

### 3. 状态转移方程

上述状态定义好之后，状态和状态之间的关系式，就叫做**状态转移方程。**

> 设![F_{k}](https://www.zhihu.com/equation?tex=F_%7Bk%7D)为：以数列中第k项结尾的最长递增子序列的长度.

设A为题中数列，状态转移方程为：

![屏幕快照 2017-09-13 上午9.46.43](/Users/lvruheng/Desktop/屏幕快照 2017-09-13 上午9.46.43.png)

用文字解释一下是：

以第k项结尾的LIS的长度是：保证第i项比第k项小的情况下，以第i项结尾的LIS长度加一的最大值，取遍i的所有值（i小于k）。

第二种定义：

> 设$F_{i,k}$为：在数列前i项中，长度为k的递增子序列中，最后一位的最小值

设A为题中数列，状态转移方程为：

![屏幕快照 2017-09-13 上午9.47.57](/Users/lvruheng/Desktop/屏幕快照 2017-09-13 上午9.47.57.png)

（边界情况需要分类讨论较多，在此不列出，需要根据状态定义导出边界情况。）

大家套着定义读一下公式就可以了，应该不难理解，就是有点绕。

这里可以看出，这里的状态转移方程，就是定义了问题和子问题之间的关系。

可以看出，状态转移方程就是带有条件的递推式。

## 二、目录

本部分内容整理一些LeetCode中关于动态规划的常见问题及Java解决方案，供大家学习动态规划。

- [Distinct Subsequences](/algorithm/LeetCode/Dynamic-Programming/Distinct-Subsequences.md)
- [Longest Common Subsequence](/algorithm/LeetCode/Dynamic-Programming/Longest-Common-Subsequence.md)
- [Longest Increasing Subsequence](/algorithm/LeetCode/Dynamic-Programming/Longest-Increasing-Subsequence.md)
- [Best Time to Buy and Sell Stock](/algorithm/LeetCode/Dynamic-Programming/stock.md)
- [Maximum Subarray](/algorithm/LeetCode/Dynamic-Programming/Maximum-Subarray.md)
- [Maximum Product Subarray](/algorithm/LeetCode/Dynamic-Programming/Maxmimum-Product-Subarray.md)
- [Longest Palindromic Substring](/algorithm/LeetCode/Dynamic-Programming/Longest-Palindromic-Substring.md)
- [BackPack](/algorithm/LeetCode/Dynamic-Programming/backpack.md)
- [Maximal Square](/algorithm/LeetCode/Dynamic-Programming/Maximal-Square.md)
- [Stone Game](/algorithm/LeetCode/Dynamic-Programming/Stone-Game.md)