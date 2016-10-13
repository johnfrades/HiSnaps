//Password Verification
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



$( document ).ready(function() {

$(".hotNav").on('click', function(){
  $.ajax({
    type: 'GET',
    url: '/indexdescsort',
    success: function(data){
      $("#mainContainer").html(data);
    }
  });
});

$(".leastNav").on('click', function(){
  $.ajax({
    type: 'GET',
    url: '/indexascsort',
    success: function(data){
      $("#mainContainer").html(data);
    }
  });
});

$(".freshNav").on('click', function(){
  $.ajax({
    type: 'GET',
    url: '/indexfresh',
    success: function(data){
      $("#mainContainer").html(data);
    }
  });
});


// $("#searchform").on('submit', function(e){
//   e.preventDefault();

//   var searchInp = $("#searchinput");
//   console.log(searchInp.val());

//   $.ajax({
//     url: '/searchresult',
//     method: 'POST',
//     contentType: 'application/json',
//     data: JSON.stringify({ thename: searchInp.val() }),
//     success: function(response){
//       console.log(response);
//       searchInp.val('');
//     }
//   });
// });


//Edit comment MODAL
$(".editBTN").click(function(){
   var $deleteButton = $(this).parents('.content').find('.deleteBTN');
   var $editButton = $(this).parents('.content').find('.editBTN');
   var $submitEditedCommentButton = $(this).parents('.content').find('.submitEditedComment');
   var $theinput = $(this).parents('.content').find('.theinput');
   var $text = $(this).parents('.content').find('.thetext');
   console.log($text.text());
   $theinput.val($text.text());
   $text.hide();
   $submitEditedCommentButton.show();
   $editButton.hide();
   $deleteButton.hide();
   $theinput.show();


   var $selectedText = $text.text();

});



//Liked button
// $(".likeicon").on('click', function(){
// if($(this).css("color") === "rgb(0, 255, 0)"){
//   $(this).css("color", "black");
//   $(this).animate({fontSize: "15px"});
//   $(this).text($(".likedtxt").text().substring(5));
//   $(this).append('<a class="likeicon"><i class="fa fa-arrow-up" aria-hidden="true"></i></a>')
// } else {
//   $(this).css("color", "green");
//   $(this).append("<span class='likedtxt'>Liked</span>");
//   $(this).animate({fontSize: "18px"});
// }  
// });


$(".upicon").on('click', function(){
if($(this).css("color") === "rgb(0, 255, 0)"){
  $(this).css("color", "black");
  $(this).animate({fontSize: "19px"});
  
} else {
  $(this).css("color", 'rgb(0, 255, 0)');
  $(this).animate({fontSize: "23px"});
}  
});

$(".downicon").on('click', function(){
if($(this).css("color") === "rgb(255, 0, 0)"){
  $(this).css("color", "black");
  $(this).animate({fontSize: "19px"});
  
} else {
  $(this).css("color", "rgb(255, 0, 0)");
  $(this).animate({fontSize: "23px"});
}  
});



$(".freshNav").on('click', function(){
  $(".hotNav").removeClass("active");
  $(".leastNav").removeClass("active");
  $(this).addClass("active")
});

var $imageData = '';

$('#upload-input').change(function(){

  var files = $(this).get(0).files;

  if (files.length > 0){
    // create a FormData object which will be sent as the data payload in the
    // AJAX request
    var formData = new FormData();

    // loop through all the selected files and add them to the formData object
    for (var i = 0; i < files.length; i++) {
      var file = files[i];

      // add the files to formData object for the data payload
      formData.append('uploads[]', file, file.name);
      $imageData = formData;
    }
   }
});

$("#buttonSubmit").click(function(){
$.ajax({
      url: '/upload',
      type: 'POST',
      data: $imageData,
      processData: false,
      contentType: false,
      success: function(data){
          console.log('upload successful!\n' + data);
      },
      xhr: function() {
        // create an XMLHttpRequest
        var xhr = new XMLHttpRequest();

      return xhr;
      }
    });
});



$('#navUsername').popover();

$('#iconSearch').popover();

$('#homeNav').on('click', function(){
  $('#homeNav').addClass('active');
});

});


