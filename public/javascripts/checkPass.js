function checkPass(){ 
	var pass1 = document.getElementById('pass1');
	var pass2 = document.getElementById('pass2');
	var message = document.getElementById('confirmMessage');
	var btn = document.querySelector('#buttonSubmit');

		if(pass1.value == pass2.value){
			btn.disabled = false;
			pass2.style.backgroundColor = "#66cc66";
			message.style.color = "#66cc66";
			message.innerHTML = "Passwords Matched!"
		}else{
			btn.disabled = true;
			pass2.style.backgroundColor = "#ff6666";
			message.style.color = "#ff6666";
			message.innerHTML = "Passwords Do Not Match!"
		 }
} 