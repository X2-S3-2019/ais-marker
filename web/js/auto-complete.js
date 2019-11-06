// Modal in/out animations

$("#close ,.close ,.overlay").on('click', function(){
	$(".flip-container ,.overlay ,#error ,#success").addClass("hidden");
  $(".flip-container").removeClass("success error")
})

$(".btn").on('click', function(){
	$(".flip-container ,.overlay , #error ,#success").removeClass("hidden");
})

// Error message

$("#error").on('click', function(){
  $(".flip-container").removeClass("success")
	$(".flip-container").toggleClass("error");
  $("#title").remove();
  $(".msg").append("<h2 id='title'>That's an Error</h2>");
})

// Success message

$("#success").on('click', function(){
  $(".flip-container").removeClass("error")
	$(".flip-container").toggleClass("success");
  $("#title").remove();
  $(".msg").append("<h2 id='title'>Message Sent</h2>");
})