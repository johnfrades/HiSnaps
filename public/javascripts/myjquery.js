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
$(".likeicon").on('click', function(){
if($(this).css("color") === "rgb(0, 0, 255)"){
  $(this).css("color", "black");
  $(this).animate({fontSize: "15px"});
  $("#likedtxt").remove();
} else {
  $(this).css("color", "blue");
  $(this).append("<span id='likedtxt'>Liked</span>");
  $(this).animate({fontSize: "18px"});
}  
});





});


