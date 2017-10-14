## 一、题目

> Remove all elements from a linked list of integers that have value `val`.
>
> Example
>
> Given `1->2->3->3->4->5->3`, val = 3, you should return the list as `1->2->4->5`

删除链表中等于给定值`val`的所有节点。

## 二、解题思路

删除链表中指定值，找到其前一个节点即可，将 next 指向下一个节点即可

## 三、解题代码

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) { val = x; }
 * }
 */
public class Solution {
    /**
     * @param head a ListNode
     * @param val an integer
     * @return a ListNode
     */
    public ListNode removeElements(ListNode head, int val) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode curr = dummy;
        while (curr.next != null) {
            if (curr.next.val == val) {
                curr.next = curr.next.next;
            } else {
                curr = curr.next;
            }
        }

        return dummy.next;
    }
}
```

