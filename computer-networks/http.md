### 一、 HTTP请求和响应步骤

![](http://upload-images.jianshu.io/upload_images/3985563-ef43bfa84bb68de1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

以上完整表示了HTTP请求和响应的7个步骤，下面从TCP/IP协议模型的角度来理解HTTP请求和响应如何传递的。

### 二、TCP/IP协议

TCP/IP协议模型（Transmission Control Protocol/Internet Protocol），包含了一系列构成互联网基础的网络协议，是Internet的核心协议，通过20多年的发展已日渐成熟，并被广泛应用于局域网和广域网中，目前已成为事实上的国际标准。TCP/IP协议簇是一组不同层次上的多个协议的组合，通常被认为是一个四层协议系统，与OSI的七层模型相对应。

HTTP协议就是基于TCP/IP协议模型来传输信息的。  


![](http://upload-images.jianshu.io/upload_images/3985563-e533b0cdd7fca359.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

  


  
\(1\). 链路层

也称作数据链路层或网络接口层（在第一个图中为网络接口层和硬件层），通常包括操作系统中的设备驱动程序和计算机中对应的网络接口卡。它们一起处理与电缆（或其他任何传输媒介）的物理接口细节。ARP（地址解析协议）和RARP（逆地址解析协议）是某些网络接口（如以太网和令牌环网）使用的特殊协议，用来转换IP层和网络接口层使用的地址。

\(2\). 网络层

也称作互联网层（在第一个图中为网际层），处理分组在网络中的活动，例如分组的选路。在TCP/IP协议族中，网络层协议包括IP协议（网际协议），ICMP协议（Internet互联网控制报文协议），以及IGMP协议（Internet组管理协议）。

IP是一种网络层协议，提供的是一种不可靠的服务，它只是尽可能快地把分组从源结点送到目的结点，但是并不提供任何可靠性保证。同时被TCP和UDP使用。TCP和UDP的每组数据都通过端系统和每个中间路由器中的IP层在互联网中进行传输。

ICMP是IP协议的附属协议。IP层用它来与其他主机或路由器交换错误报文和其他重要信息。

IGMP是Internet组管理协议。它用来把一个UDP数据报多播到多个主机。

\(3\). 传输层

主要为两台主机上的应用程序提供端到端的通信。在TCP/IP协议族中，有两个互不相同的传输协议：TCP（传输控制协议）和UDP（用户数据报协议）。

TCP为两台主机提供高可靠性的数据通信。它所做的工作包括把应用程序交给它的数据分成合适的小块交给下面的网络层，确认接收到的分组，设置发送最后确认分组的超时时钟等。由于运输层提供了高可靠性的端到端的通信，因此应用层可以忽略所有这些细节。为了提供可靠的服务，TCP采用了超时重传、发送和接收端到端的确认分组等机制。

UDP则为应用层提供一种非常简单的服务。它只是把称作数据报的分组从一台主机发送到另一台主机，但并不保证该数据报能到达另一端。一个数据报是指从发送方传输到接收方的一个信息单元（例如，发送方指定的一定字节数的信息）。UDP协议任何必需的可靠性必须由应用层来提供。

\(4\). 应用层

应用层决定了向用户提供应用服务时通信的活动。TCP/IP 协议族内预存了各类通用的应用服务。包括 HTTP，FTP（File Transfer Protocol，文件传输协议），DNS（Domain Name System，域名系统）服务。  


![](http://upload-images.jianshu.io/upload_images/3985563-1891c256487e9d85.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

  


  
当应用程序用TCP传送数据时，数据被送入协议栈中，然后逐个通过每一层直到被当作一串比特流送入网络。其中每一层对收到的数据都要增加一些首部信息（有时还要增加尾部信息），该过程如图所示。

![](http://upload-images.jianshu.io/upload_images/3985563-5d534a249b4825a9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

  


  
当目的主机收到一个以太网数据帧时，数据就开始从协议栈中由底向上升，同时去掉各层协议加上的报文首部。每层协议盒都要去检查报文首部中的协议标识，以确定接收数据的上层协议。这个过程称作分用（Demultiplexing）。协议是通过目的端口号、源I P地址和源端口号进行解包的。

通过以上步骤我们从TCP/IP模型的角度来理解了一次HTTP请求与响应的过程。

下面这张图更清楚明白：

![](http://upload-images.jianshu.io/upload_images/3985563-ecf824604debcdf1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

  


下面具体来看如何进行一步步操作的。

### 三、TCP三次握手

TCP是面向连接的，无论哪一方向另一方发送数据之前，都必须先在双方之间建立一条连接。在TCP/IP协议中，TCP协议提供可靠的连接服务，连接是通过三次握手进行初始化的。三次握手的目的是同步连接双方的序列号和确认号并交换 TCP窗口大小信息。  


![](http://upload-images.jianshu.io/upload_images/3985563-f2fe3775bd2678c2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

| 回合 | 说明 |
| ---- | ------------------ |
| 第一次握手 | 建立连接。客户端发送连接请求报文段，将SYN位置为1，Sequence Number为x；然后，客户端进入SYN\_SEND状态，等待服务器的确认； |
| 第二次握手 | 服务器收到SYN报文段。服务器收到客户端的SYN报文段，需要对这个SYN报文段进行确认，设置Acknowledgment Number为x + 1\(Sequence Number + 1\)；同时，自己自己还要发送SYN请求信息，将SYN位置为1，Sequence Number为y；服务器端将上述所有信息放到一个报文段（即SYN + ACK报文段）中，一并发送给客户端，此时服务器进入SYN\_RECV状态； |
| 第三次握手 | 客户端收到服务器的SYN + ACK报文段。然后将Acknowledgment Number设置为y + 1，向服务器发送ACK报文段，这个报文段发送完毕以后，客户端和服务器端都进入ESTABLISHED状态，完成TCP三次握手。 |

##### 为什么要三次握手

为了防止已失效的连接请求报文段突然又传送到了服务端，因而产生错误。

**具体例子：** ——“已失效的连接请求报文段”的产生在这样一种情况下：

client发出的第一个连接请求报文段并没有丢失，而是在某个网络结点长时间的滞留了，以致延误到连接释放以后的某个时间才到达server。本来这是一个早已失效的报文段。但server收到此失效的连接请求报文段后，就误认为是client再次发出的一个新的连接请求。于是就向client发出确认报文段，同意建立连接。假设不采用“三次握手”，那么只要server发出确认，新的连接就建立了。由于现在client并没有发出建立连接的请求，因此不会理睬server的确认，也不会向server发送数据。但server却以为新的运输连接已经建立，并一直等待client发来数据。这样，server的很多资源就白白浪费掉了。采用“三次握手”的办法可以防止上述现象发生。

例如刚才那种情况，client不会向server的确认发出确认。server由于收不到确认，就知道client并没有要求建立连接。”

### 四、HTTP协议

##### Http是什么？

通俗来讲，他就是计算机通过网络进行通信的规则，是一个基于请求与响应，无状态的，应用层的协议，常基于TCP/IP协议传输数据。目前任何终端（手机，笔记本电脑。。）之间进行任何一种通信都必须按照Http协议进行，否则无法连接。

**四个基于：**

**请求与响应：** 客户端发送请求，服务器端响应数据

**无状态的：** 协议对于事务处理没有记忆能力，客户端第一次与服务器建立连接发送请求时需要进行一系列的安全认证匹配等，因此增加页面等待时间，当客户端向服务器端发送请求，服务器端响应完毕后，两者断开连接，也不保存连接状态，一刀两断！恩断义绝！从此路人！下一次客户端向同样的服务器发送请求时，由于他们之前已经遗忘了彼此，所以需要重新建立连接。

**应用层：** Http是属于应用层的协议，配合TCP/IP使用。

**TCP/IP：** Http使用TCP作为它的支撑运输协议。HTTP客户机发起一个与服务器的TCP连接，一旦连接建立，浏览器（客户机）和服务器进程就可以通过套接字接口访问TCP。

**针对无状态的一些解决策略：**

有时需要对用户之前的HTTP通信状态进行保存，比如执行一次登陆操作，在30分钟内所有的请求都不需要再次登陆。于是引入了Cookie技术。

HTTP/1.1想出了持久连接（HTTP keep-alive）方法。其特点是，只要任意一端没有明确提出断开连接，则保持TCP连接状态，在请求首部字段中的Connection: keep-alive即为表明使用了持久连接。等等还有很多……

下面开始讲解重头戏：HTTP请求报文，响应报文，对应于上述步骤的2，3，4，5，6。

HTTP报文是面向文本的，报文中的每一个字段都是一些ASCII码串，各个字段的长度是不确定的。HTTP有两类报文：请求报文和响应报文。

### 五、HTTP请求报文

一个HTTP请求报文由请求行（request line）、请求头部（header）、空行和请求数据4个部分组成，下图给出了请求报文的一般格式。  


![](http://upload-images.jianshu.io/upload_images/3985563-cd59a3899ef546e1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

  


##### 1.请求行

请求行分为三个部分：请求方法、请求地址和协议版本

**请求方法**

HTTP/1.1 定义的请求方法有8种：GET、POST、PUT、DELETE、PATCH、HEAD、OPTIONS、TRACE。

最常的两种GET和POST，如果是RESTful接口的话一般会用到GET、POST、DELETE、PUT。

**请求地址**

URL：统一资源定位符，是一种自愿位置的抽象唯一识别方法。

组成：&lt;协议&gt;：//&lt;主机&gt;：&lt;端口&gt;/&lt;路径&gt;

**端口和路径有时可以省略（HTTP默认端口号是80）**

如下例：  


![](http://upload-images.jianshu.io/upload_images/3985563-54ce5eca048253be.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

  


  
有时会带参数，GET请求

**协议版本**

协议版本的格式为：HTTP/主版本号.次版本号，常用的有HTTP/1.0和HTTP/1.1

##### 2.请求头部

请求头部为请求报文添加了一些附加信息，由“名/值”对组成，每行一对，名和值之间使用冒号分隔。

常见请求头如下：  


![](http://upload-images.jianshu.io/upload_images/3985563-539378eee14fa322.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

  


  
请求头部的最后会有一个空行，表示请求头部结束，接下来为请求数据，这一行非常重要，必不可少。

##### 3.请求数据

可选部分，比如GET请求就没有请求数据。

下面是一个POST方法的请求报文：

> POST 　/index.php　HTTP/1.1 　　 请求行  
> Host: localhost  
> User-Agent: Mozilla/5.0 \(Windows NT 5.1; rv:10.0.2\) Gecko/20100101 Firefox/10.0.2　　请求头  
> Accept: text/html,application/xhtml+xml,application/xml;q=0.9,_/_;q=0.8  
> Accept-Language: zh-cn,zh;q=0.5  
> Accept-Encoding: gzip, deflate  
> Connection: keep-alive  
> Referer:[http://localhost/](http://localhost/)  
> Content-Length：25  
> Content-Type：application/x-www-form-urlencoded  
> 　　空行  
> username=aa&password=1234　　请求数据

### 六、HTTP响应报文

![](http://upload-images.jianshu.io/upload_images/3985563-c6ee8f8526f59fc0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

  


  
HTTP响应报文主要由状态行、响应头部、空行以及响应数据组成。

##### 1.状态行

由3部分组成，分别为：协议版本，状态码，状态码描述。

其中协议版本与请求报文一致，状态码描述是对状态码的简单描述，所以这里就只介绍状态码。

**状态码**

状态代码为3位数字。

 - 1xx：指示信息——表示请求已接收，继续处理。
 - 2xx：成功——表示请求已被成功接收、理解、接受。
 - 3xx：重定向——要完成请求必须进行更进一步的操作。
 - 4xx：客户端错误——请求有语法错误或请求无法实现。
 - 5xx：服务器端错误——服务器未能实现合法的请求。

下面列举几个常见的：

![](http://upload-images.jianshu.io/upload_images/3985563-8f3bf059bc4365e3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

  


##### 2.响应头部

与请求头部类似，为响应报文添加了一些附加信息

常见响应头部如下：

![](http://upload-images.jianshu.io/upload_images/3985563-33ed95479f541a07.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

  


##### 3.响应数据

用于存放需要返回给客户端的数据信息。

下面是一个响应报文的实例：

> HTTP/1.1 200 OK　　状态行  
> Date: Sun, 17 Mar 2013 08:12:54 GMT　　响应头部  
> Server: Apache/2.2.8 \(Win32\) PHP/5.2.5  
> X-Powered-By: PHP/5.2.5  
> Set-Cookie: PHPSESSID=c0huq7pdkmm5gg6osoe3mgjmm3; path=/  
> Expires: Thu, 19 Nov 1981 08:52:00 GMT  
> Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0  
> Pragma: no-cache  
> Content-Length: 4393  
> Keep-Alive: timeout=5, max=100  
> Connection: Keep-Alive  
> Content-Type: text/html; charset=utf-8  
> 　　空行
>
> &lt;html&gt;　　响应数据  
> &lt;head&gt;  
> &lt;title&gt;HTTP响应示例&lt;title&gt;  
> &lt;/head&gt;  
> &lt;body&gt;  
> Hello HTTP!  
> &lt;/body&gt;  
> &lt;/html&gt;

关于请求头部和响应头部的知识点很多，这里只是简单介绍。

通过以上步骤，数据已经传递完毕，HTTP/1.1会维持持久连接，但持续一段时间总会有关闭连接的时候，这时候据需要断开TCP连接。

### 七、TCP四次挥手

当客户端和服务器通过三次握手建立了TCP连接以后，当数据传送完毕，肯定是要断开TCP连接的啊。那对于TCP的断开连接，这里就有了神秘的“四次分手”。


![](http://upload-images.jianshu.io/upload_images/3985563-c1c59148f8b26c43.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

  
| 回合 | 说明 |
| ------ | ------------------ |
| 第一次分手 | 主机1（可以使客户端，也可以是服务器端），设置Sequence Number，向主机2发送一个FIN报文段；此时，主机1进入FIN\_WAIT\_1状态；这表示主机1没有数据要发送给主机2了； |
| 第二次分手 | 主机2收到了主机1发送的FIN报文段，向主机1回一个ACK报文段，Acknowledgment Number为Sequence Number加1；主机1进入FIN\_WAIT\_2状态；主机2告诉主机1，我“同意”你的关闭请求； |
| 第三次分手 | 主机2向主机1发送FIN报文段，请求关闭连接，同时主机2进入LAST\_ACK状态； |
| 第四次分手 | 主机1收到主机2发送的FIN报文段，向主机2发送ACK报文段，然后主机1进入TIME\_WAIT状态；主机2收到主机1的ACK报文段以后，就关闭连接；此时，主机1等待2MSL后依然没有收到回复，则证明Server端已正常关闭，那好，主机1也可以关闭连接了。 |

##### 为什么要四次分手

TCP协议是一种面向连接的、可靠的、基于字节流的运输层通信协议。TCP是全双工模式，这就意味着，当主机1发出FIN报文段时，只是表示主机1已经没有数据要发送了，主机1告诉主机2，它的数据已经全部发送完毕了；但是，这个时候主机1还是可以接受来自主机2的数据；当主机2返回ACK报文段时，表示它已经知道主机1没有数据发送了，但是主机2还是可以发送数据到主机1的；当主机2也发送了FIN报文段时，这个时候就表示主机2也没有数据要发送了，就会告诉主机1，我也没有数据要发送了，之后彼此就会愉快的中断这次TCP连接。

通过以上步骤便完成了HTTP的请求和响应，进行了数据传递，这其中涉及到需要知识点，都进行了逐一了解。

