var controller = function(){
	
	var controller = {
		init: function(){
			$(document).delegate("#page-login", "pagebeforeshow", function() {
				
			});
			
			$(document).delegate("#page-forgot", "popupbeforeposition", function() {
				alert('beforePOs');
			});
		}
	};
	
	controller.init();
	return controller;
};