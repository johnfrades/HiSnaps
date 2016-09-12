

jQuery(function($){
	var socket = io.connect();
	var $nickForm = $("#setNick");
	var $nickBox = $("#nickname");
	var $users = $("#users");
	var $messageForm = $("#send-message");
	var $messageBox = $("#message");
	var $chat = $("#chat");


	$nickForm.submit(function(e){
		e.preventDefault();
		socket.emit('new user', $nickBox.val(), function(data){
			if(data){
				$("#nickWrap").hide();
				$("#contentWrap").show();
			} else {
				alert("Username already exists! Try other name.");
			}
		});
		$nickBox.val("");
	});

	socket.on("usernames", function(data){
		$users.html(data.join("<br>"));
	});


	$messageForm.submit(function(e){
		e.preventDefault();
		socket.emit('send message', $messageBox.val());
		$messageBox.val("");
	});

	socket.on('new message', function(data){
		$chat.append('<b>' + data.nick + ": " + '</b>' + data.msg + '<br>');
	});
});