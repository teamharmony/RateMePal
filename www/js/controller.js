var controller = function(){
	var hostUrl = "http://gazidevworks.org:8080/ResourceMgmt",
		clientId = "meetMePal";
	var controller = {
		_self: null,
		init: function(){
			_self = this;
			
			$(document).delegate("#page-login", "pagebeforeshow", function() {
				_self.login();
			});
			
			$(document).delegate("#page-signup", "pagebeforeshow", function() {
				_self.signup();
			});
			
			$(document).delegate("#page-forgot", "pagebeforeshow", function() {
				_self.forgot();
			});
		},
		
		login: function(){
			var that = this;
			this.$login = $("#page-login");
			this.$username = $('#username', this.$login).val("");
			this.$password = $('#password', this.$login).val("");
			this.$btnLogin = $('#btnLogin', this.$login);
			
			this.$btnLogin.off('click');
			this.$btnLogin.on('click', [this], function(event){
				var context = event.data[0];
				_self.loading(true);
				function loginSuccess(){
					
					loginBy = "normal";
				};
				
				function refreshTokenFailure(){
					_self.loading(false);
					$.mobile.navigate("#page-login");
				};
				
				function passwordFailure(){
					_self.loading(false);
					alert('Invalid Username and Password');
				};
				
				var authentication = new AuthenticationProxy(hostUrl, clientId, loginSuccess, refreshTokenFailure, passwordFailure);
				authentication.loginWithPassword(context.$username.val(), context.$password.val());
			});
		},
		
		loading: function(showOrHide){
			setTimeout(function(){
				var flag = showOrHide ? "show" : "hide";
				$.mobile.loading(flag);
			}, 0);
		}
	};
	
	controller.init();
	return controller;
};