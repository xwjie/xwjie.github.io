# session fixation攻击

## 什么是session fixation攻击

Session fixation有人翻译成“Session完成攻击”[1]，实际上fixation是确知和确定的意思，在此是指Web服务的会话ID是确知不变的，攻击者为受害着确定一个会话ID从而达到攻击的目的。在维基百科中专门有个词条Session fixation，在此引述其攻击情景，防范策略参考原文。


## 攻击情景
原文中Alice是受害者，她使用的一个银行网站http://unsafe/存在session fixation漏洞，Mallory是攻击者，他想盗窃Alice的银行中的存款，而Alice会点击Mallory发给她的网页连接（原因可能是Alice认识Mallory，或者她自己的安全意识不强）。

### 攻击情景1：最简单：服务器接收任何会话ID

过程如下：

Mallory发现http://unsafe/接收任何会话ID，而且会话ID通过URL地址的查询参数携带到服务器，服务器不做检查
Mallory给Alice发送一个电子邮件，他可能假装是银行在宣传自己的新业务，例如，“我行推出了一项新服务，率先体验请点击：http://unsafe/?SID=I_WILL_KNOW_THE_SID"，I_WILL_KNOW_THE_SID是Mallory选定的一个会话ID。
Alice被吸引了，点击了 http://unsafe/?SID=I_WILL_KNOW_THE_SID，像往常一样，输入了自己的帐号和口令从而登录到银行网站。
因为服务器的会话ID不改变，现在Mallory点击 http://unsafe/?SID=I_WILL_KNOW_THE_SID 后，他就拥有了Alice的身份。可以为所欲为了。

### 攻击情景2：服务器产生的会话ID不变

过程如下：

Mallory访问 http://unsafe/ 并获得了一个会话ID（SID），例如服务器返回的形式是：Set-Cookie: SID=0D6441FEA4496C2
Mallory给Alice发了一个邮件：”我行推出了一项新服务，率先体验请点击：http://unsafe/?SID=0D6441FEA4496C2"
Alice点击并登录了，后面发生的事与情景1相同

### 攻击情景3：跨站cookie(cross-site cooking)

利用浏览器的漏洞，即使 http://good 很安全，但是，由于浏览器管理cookie的漏洞，使恶意网站 http://evil/ 能够向浏览器发送 http://good 的cookie。过程如下：

Mallory给Alice发送一个邮件“有个有趣的网站：http://evil 很好玩，不妨试试”
Alice访问了这个链接，这个网站将一个会话ID取值为I_WILL_KNOW_THE_SID 的 http://good/ 域的cookie设置到浏览器中。
Mallory又给Alice发了个邮件：“我行推出了一项新服务，率先体验请点击：http://good/”
如果Alice登录了，Mallory就可以利用这个ID了