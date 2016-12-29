window.onload = function() {
	var ref = new Wilddog("https://jayzangwill.wilddogio.com"),
		data,
		width,
		left,
		once = true,
		canOnce = true,
		time = [],
		$video = $("video"),
		screenWidth = $video.offset().width,
		screenHeight = $video.offset().height;
	window.onresize = function() {
		screenWidth = $video.offset().width;
		screenHeight = $video.offset().height;
	}
	$("#submit").on("click", submitData);
	$("#text").on("keypress", function(even) {
		if(even.keyCode === 13) {
			submitData();
		}
	});
	$("#clean").on("click", function() {
		ref.remove();
		$(".dm").html("");
	});

	ref.on('child_removed', function() {
		$('.dm').html("");
	});
	$video.on("play", function() {
			if(once) { //第一次开始播放时
				//云端数据变化时
				ref.child('message').on('child_added', function(snapshot) {
					var text = snapshot.val();
					var span = creatSpan(text);
					readyMove(span);
				});
				once = false;
			} else { //暂停以后又播放
				$(".dm span").each(function(_, span) {
					move(span);
				});
			}
			$(".control").css("display", "block");
		}).on("pause", function() {
			$(".dm span").each(function() {
				clearInterval(this.time);
			});
			$(".control").css("display", "none");
		}).on("waiting", function() {
			$video.trigger("pause");
		}).on("canplay", function() {
			if(canOnce) {
				canOnce = false;
				return;
			}
			$video.trigger("play");
		});
		//提交数据到野狗
	function submitData() {
		data = $("#text").val();
		if(data === "" || data == undefined) {
			return;
		} else {
			ref.child('message').push(data);
			$("#text").val("");
		}
	}
	//创建span
	function creatSpan(text) {
		var span = document.createElement("span");
		var textNode = document.createTextNode(text);
		span.appendChild(textNode);
		$(".dm").append(span);
		return span;
	}
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
}