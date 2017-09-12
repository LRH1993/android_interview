## 一、前言

### 行为型模式

行为型模式\(Behavioral Pattern\)是对在不同的对象之间划分责任和算法的抽象化。

行为型模式不仅仅关注类和对象的结构，而且重点关注它们之间的相互作用。

通过行为型模式，可以更加清晰地划分类与对象的职责，并研究系统在运行时实例对象 之间的交互。在系统运行时，对象并不是孤立的，它们可以通过相互通信与协作完成某些复杂功能，一个对象在运行时也将影响到其他对象的运行。

行为型模式分为类行为型模式和对象行为型模式两种：

* 类行为型模式：类的行为型模式使用继承关系在几个类之间分配行为，类行为型模式主要通过多态等方式来分配父类与子类的职责。
* 对象行为型模式：对象的行为型模式则使用对象的聚合关联关系来分配行为，对象行为型模式主要是通过对象关联等方式来分配两个或多个类的职责。根据“合成复用原则”，系统中要尽量使用关联关系来取代继承关系，因此大部分行为型设计模式都属于对象行为型设计模式。

### 包含模式

* **职责链模式\(Chain of Responsibility\)**
* **命令模式\(Command\)**
* **解释器模式\(Interpreter\)**
* **迭代器模式\(Iterator\)**
* **中介者模式\(Mediator\)**
* **备忘录模式\(Memento\)**
* **观察者模式\(Observer\)**
* **状态模式\(State\)**
* **策略模式\(Strategy\)**
* **模板方法模式\(Template Method\)**
* **访问者模式\(Visitor\)**


## 二、目录

本部分没有包含以上所有模式，仅介绍了几种常用的。

- [命令模式](/design-mode/Behavioral-Pattern/Command-Pattern.md)
- [迭代器模式](/design-mode/Behavioral-Pattern/Iterator-Pattern.md)
- [观察者模式](/design-mode/Behavioral-Pattern/Observer-Pattern.md)
- [策略模式](/design-mode/Behavioral-Pattern/Strategy-Pattern.md)
- [模板方法模式](/design-mode/Behavioral-Pattern/Template-Method.md)

