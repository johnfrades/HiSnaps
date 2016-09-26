$( document ).ready(function() {



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
  $(this).css("color", "rgb(0, 255, 0)");
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



});


