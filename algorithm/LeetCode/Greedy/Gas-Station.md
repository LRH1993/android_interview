## 一、题目

> There are N gas stations along a circular route, where the amount of gas at station i is gas[i].
>
> You have a car with an unlimited gas tank and it costs cost[i] of gas to travel from station i to its next station (i+1). You begin the journey with an empty tank at one of the gas stations.
>
> Return the starting gas station's index if you can travel around the circuit once, otherwise return -1.
>
> Note: The solution is guaranteed to be unique.

在一条环路上有 *N* 个加油站，其中第 *i* 个加油站有汽油`gas[i]`，并且从第_i_个加油站前往第_i_+1个加油站需要消耗汽油`cost[i]`。

你有一辆油箱容量无限大的汽车，现在要从某一个加油站出发绕环路一周，一开始油箱为空。

求可环绕环路一周时出发的加油站的编号，若不存在环绕一周的方案，则返回`-1`。

## 二、解题思路

首先我们可以得到所有油站的油量totalGas，以及总里程需要消耗的油量totalCost，如果totalCost大于totalGas，那么铁定不能够走完整个里程。

如果totalGas大于totalCost了，那么就能走完整个里程了，假设现在我们到达了第i个油站，这时候还剩余的油量为sum，如果 sum + gas[i] - cost[i]小于0，我们无法走到下一个油站，所以起点一定不在第i个以及之前的油站里面（都铁定走不到第i + 1号油站），起点只能在i + 1后者后面。

## 三、解题代码

```java
public class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        if (gas == null || cost == null || gas.length == 0 || cost.length == 0) {
            return -1;
        }

        int sum = 0;
        int total = 0;
        int index = -1;

        for(int i = 0; i<gas.length; i++) {
            sum += gas[i] - cost[i];
            total += gas[i] - cost[i];
            if(sum < 0) {
                index = i;
                sum = 0;
            }
        }
        return total < 0 ? -1 : index + 1;
        // index should be updated here for cases ([5], [4]);
        // total < 0 is for case [2], [2]
    }
}
```

