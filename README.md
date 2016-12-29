# 一个简易的弹幕视频

这个是由[fcc](https://freecodecamp.cn/challenges/design-a-danmu-app)上的弹幕练习改编来的。

[地址](https://jayzangwill.github.io/Barrage/)
因为之前看了一些jQuery源码，这次打算自己封装一个自己的jQuery用来做这个小练习，一来可以减少资源的占用，二来可以锻炼锻炼自己对封装插件的能力。

因为这次封装的jQuery插件只是针对这个练习用的，所以插件有很多地方的容错性是比较差的，不适合用来做其他的。

## 简单介绍一下自己封装的这个“伪jQuery”

插件提供的api有：

* each
* on
* css
* val
* append
* html
* val
* offset

整个插件只有72行，所以体积很小，资源的占用特别少。

## 整个项目的构思

1. 用户播放视频，弹幕开始发射(如果有的话)
2. 用户在输入框输入内容点发送的时候要把用户输入的东西发送到[野狗云](https://www.wilddog.com/)(至于野狗云怎么使用请自行百度，不难)
3. 用户点击清除的时候清除所有弹幕，并且删除所有云端数据。
4. 让弹幕能正常在屏幕上跑起来(视频播放时弹幕跑，暂停时停)

## 开始实现

首先，因为数据是放在野狗云上的，所以得调用野狗云的api。在调api的时候得new一个野狗的实例(这叫起来貌似有点怪)

	ref = new Wilddog("https://jayzangwill.wilddogio.com")//这个地址是野狗云上你的项目设置的地址，这里就以我的为例了
当用户点发送弹幕时需要把用户输入的内容发送到野狗云：

	//提交数据到野狗
	function submitData() {
		data = $("#text").val();
		if(data === "" || data == undefined) {
			return;
		} else {
		//这个是野狗提供的api，从字面上应该很好理解，就是讲数据放到数据库里
			ref.child('message').push(data);
			$("#text").val("");
		}
	}

然后利用野狗提供的api监控云端数据增加时，同时进行弹幕的增加：

	ref.child('message').on('child_added', function(snapshot) {
				var text = snapshot.val();
				var span = creatSpan(text);
				readyMove(span);
	});
	//创建弹幕
	function creatSpan(text) {
		var span = document.createElement("span");
		var textNode = document.createTextNode(text);
		span.appendChild(textNode);
		$(".dm").append(span);
		return span;
	}

弹幕发射前的一些准备，设置弹幕发射时的位置、字体大小、颜色(有待优化)：

	//弹幕移动准备
	function readyMove(span) {
		if(span.time) { //清除定时器
			clearInterval(span.time);
		}
		width = span.offsetWidth;
		span.style.left = -width + "px"; //让弹幕刚开始在屏幕外面
		span.style.color = "rgb(" + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + ")";
		span.style.top = Math.round(Math.random() * (screenHeight - 50)) + "px";
		span.style.fontSize = Math.round(Math.random() * 16 + 16) + "px";
			move(span); //开始发射
	}
	
因为弹幕不多(你可以一次添加很多很多弹幕，但是只要我一点清除，就全没了，在云端的数据同时也被清了)，所以我让弹幕每次走到头的时候又重新发射，每次从新发射都要调用一次这个`readyMove`函数。

可以发现在每次调用这个函数的时候都要清一次定时器，那是因为不清的话会发现弹幕越走越快(到最后你会发现它会越来越接近光速，嘿嘿)，然后才能再调用move函数：

	function move(span) {
		span.time = setInterval(function() { //将定时器放到对应的span标签下，方便清除定时器
			left = span.offsetLeft;
			if(!(left > screenWidth)) {
				span.style.left = left + 1 + "px";
			} else {
				readyMove(span);
				return;
			}
		}, 1);
	}

在move函数里有个定时器，很明显是用来让弹幕跑起来的。值得一提的是我把定时器的返回值放在了`span`标签下，这样做可以在清除定时器的时候找到对应的定时器，在做这东西的时候我想了蛮长时间，最终受到jQuery `Data`函数的一些启发，将定时器绑在对应的`span`标签下，这样就方便清除定时器了，果然看jQuery源码还是有收获的！

接下来搞定字幕在视频播放的时候运动，暂停的时候停下来：

	$video.on("play", function() {
		if(once) {//第一次开始播放时
			//云端数据变化时
			ref.child('message').on('child_added', function(snapshot) {
				var text = snapshot.val();
				var span = creatSpan(text);
				readyMove(span);
			});
			once = false;
		} else {//暂停以后又播放
			$(".dm span").each(function(_, span) {
				move(span);
			});
		}
		$(".control").css("display", "block");
	});

播放的时候得分成两种情况：

1. 第一次开始播放时
2. 暂停以后又播放

如果是第一次播放，得监控云端数据，根据数据的数量创建`span`然后调用`readyMove`；如果是第二种情况的话，就直接给所有`span`加上定时器就得了。
