 function readURL(input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    $('#blah')
                        .attr('src', e.target.result)
                        .width(30)
                        .height(30)
                };
				$('#blah').css("visibility","visible")
                reader.readAsDataURL(input.files[0]);
            }
        }

function showPopup(){
	$("#forgotPassPopUpBody,#forgotPassPopUpBody p").fadeIn("slow");
}
function hidePopup(){
	$("#forgotPassPopUpBody").fadeOut("slow");
}
function showCreateAccount(){
	$(".loginPage").fadeOut("slow");
	$(".createAccountPage").fadeIn("slow");
}
function showLogin(){
	$(".createAccountPage").fadeOut("slow");
	$(".loginPage").fadeIn("slow");
}
function showLoginNext(){
	$(".loginPage").fadeOut("slow");
	$(".cmmingsoonBox").fadeIn("slow");
}
function logout(){
	$(".loginPage").fadeIn("slow");
	$(".cmmingsoonBox").fadeOut("slow");
}
function showLoinAfterCreate(){
	$(".loginPage").fadeIn("slow");
	$(".createAccountPage").fadeOut("slow");
}
