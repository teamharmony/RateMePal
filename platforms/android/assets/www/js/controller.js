var controller = function(){
	var hostUrl = "http://gazidevworks.org:8080/RateMePal",
		clientId = "rateMePal";
		
	var controller = {
		_self: null,
		init: function(){
			_self = this;
			
			$(document).delegate("#page-signup", "pagebeforeshow", function() {
				_self.signup();
			});
			
			$(document).delegate("#page-login", "pagebeforeshow", function(event, data) {
				openFB.init({appId : '975569862484922', tokenStore: window.localStorage});
				openGL.init({appId : '192806734171-uh405irbgbsg3nu04sf0e7rj54a552e3.apps.googleusercontent.com', tokenStore: window.localStorage});
				
				if(data.prevPage.length > 0){
					_self.welcome();
				} else {
					event.preventDefault();
					_self.checkLogin();
				}
			});
			
			$(document).delegate("#page-forgot", "pagebeforeshow", function() {
				_self.forgot();
			});
			
			$(document).delegate("#page-home", "pagebeforeshow", function() {
				_self.home();
			});
			
		},
				
		welcome: function(){	
			this.$login = $("#page-login");
			
			this.$username = $('#username', this.$login).val("");
			this.$password = $('#password', this.$login).val("");
			
			this.$btnLogin = $('#btnLogin', this.$login);
			this.$btnFB = $('#btnFB', this.$login);
			this.$btnGL = $('#btnGL', this.$login);
			
			this.$btnFB.off('click');
			this.$btnFB.on('click', _self.fbLogin);
			
			this.$btnGL.off('click');
			this.$btnGL.on('click', _self.glLogin);
			
			this.$btnLogin.off('click');
			this.$btnLogin.on('click', jQuery.proxy(_self.onLoginClickHandler, this));
		},
		
		checkLogin: function(){
			if(window.localStorage.rmp_lobin_by === "normal"){
				if(window.localStorage.rmplogin_refresh_token){
					_self.directLoginApp();
				}
			} else if(window.localStorage.rmp_lobin_by === "fb"){
				openFB.getLoginStatus(function(response) {
					if (response.status === "connected") {
						_self.directLoginApp();
					} else {
						$.mobile.navigate("#page-login");
					}
				});
			} else if(window.localStorage.rmp_lobin_by === "gl"){
				openGL.getLoginStatus(function(response) {
					if (response.status === "connected") {
						_self.directLoginApp();
					} else {
						$.mobile.navigate("#page-login");
					}
				});
			} else {
				_self.welcome();
			}
		},
		
		directLoginApp: function(){
			function loginSuccess(){
				$.mobile.navigate('#page-home');
				loginBy = "normal";
			}
			
			function refreshTokenFailure(){
				_self.loading(false);
				$.mobile.navigate("#page-login");
			};
			
			function passwordFailure(){
				_self.loading(false);
				$.mobile.navigate("#page-login");
			};
			
			var authentication = new AuthenticationProxy(hostUrl, clientId, loginSuccess, refreshTokenFailure, passwordFailure);
			authentication.loginWithRefreshToken(window.localStorage.rmplogin_refresh_token);
		},
		
		onLoginClickHandler: function(event){
			_self.loading(true);
			function loginSuccess(){
				window.localStorage.rmp_lobin_by = "normal";
				_self.loading(false);
				$.mobile.navigate("#page-home");
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
			authentication.loginWithPassword(this.$username.val(), this.$password.val());
		},
		
		fbLogin: function(){
			openFB.getLoginStatus(function(response) {
				if (response.status === "connected") {
					_self.socialLogin('fb');
				} else {
					openFB.login(function(response) {
						if (response.status === 'connected') {
							_self.socialLogin('fb');
						} else {
							alert('Facebook login failed: ' + response.error);
						}
					}, {
						scope : 'email,read_stream'
					});
				}
			});
		},
		
		glLogin: function(){
			openGL.getLoginStatus(function(response) {
				if (response.status === "connected") {
					_self.socialLogin('gl');
				} else {
					openGL.login(function(response) {
						if (response.status === 'connected') {
							_self.socialLogin('gl');
						} else {
							alert('Google login failed: ' + response.error);
						}
					}, {scope: 'openid profile email'});
				}
			});
		},
		
		socialLogin: function(sValue){
			var username, password;
			if(sValue === 'fb'){
				username = 'fbAdmin';
				password = 'fbAdmin';
			} else if(sValue === 'gl'){
				username = 'glAdmin';
				password = 'glAdmin';
			}
			_self.loading(true);
			function loginSuccess(){
				loginBy = sValue;
				window.localStorage.rmp_lobin_by = sValue;
				_self.loading(false);
				$.mobile.navigate("#page-home");
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
			authentication.loginWithPassword(username, password);
		},
		
		forgot: function(){
			var that = this;
			this.$forgotPass = $('#page-forgot');
			this.$inpForgotUsername = $('#inpForgotUsername', this.$forgotPass).val("");

			$('#forgotPassForm').off('submit');
			$('#forgotPassForm').submit(function(e) {
				if (that.$inpForgotUsername.val() === "") {
					alert("Enter username.");
				} else {
					_self.loading("show");
					$.ajax({
						url : hostUrl.concat("/password/forgot"),
						type : 'PUT',
						data : {"username" : that.$inpForgotUsername.val()},
					}).done(function(data) {
						_self.loading("hide");
						$.mobile.navigate('#page-login');
					});
				}
				e.preventDefault();
			});
		},
		
		home: function(){
			this.$homePage = $('#page-home');
			this.$btnLogout = $('#btnLogout', this.$homePage);
			
			this.$btnLogout.off('click');
			this.$btnLogout.on('click', _self.logout);
		},
		
		logout: function(){
			window.localStorage.removeItem('rmp_lobin_by');
			window.localStorage.removeItem('rmplogin_refresh_token');
			window.localStorage.removeItem('fbtoken');
			window.localStorage.removeItem('gltoken');
			$.mobile.navigate("#page-login");
		},
		
		signup: function(){
			var that = this;
			this.$signup = $("#page-signup");
			this.$frmSignup = $('#formSignup', this.$signup);
			this.$username = $('#inpUsername', this.$signup).val('');
			this.$email = $('#inpEmail', this.$signup).val('');
			this.$name = $('#inpName', this.$signup).val('');
			this.$password = $('#inpPassword', this.$signup).val('');
			this.$confirmPass = $('#inpConfirmPass', this.$signup).val('');
			this.$contact = $('#inpTelephone', this.$signup).val('');
			this.$imgSignupDisp = $('#imgSignupDisp', this.$signup).attr('src', './images/defaultImg.png');
			this.$btnSignupUpload = $('#btnSignupUpload', this.$signup);
			this.$btnSignup = $('#btnSignup', this.$signup);
			
			this.$error = $('#error', this.$signup).text('');
			
			this.$username.off('focusout');
			this.$username.on('focusout', function(event) {
				that.$username.removeClass('invalidState');
				$.ajax({
					url : hostUrl + "/validate/username",
					type : 'POST',
					data : "username=" + that.$username.val(),
					processData : false,
					contentType : "application/x-www-form-urlencoded"
				}).done(function(data) {
					if (data === 1) {
						that.$username.addClass('invalidState');
						that.$error.text("Invalid Username.");
						that.$error.removeClass('displayNone');
					} else {
						that.$username.removeClass('invalidState');
						that.$error.text("");
						that.$error.addClass('displayNone');
					}
				});
				event .preventDefault();
			});
			
			this.$email.off('focusout');
			this.$email.on('focusout', function(event) {
				that.$email.removeClass('invalidState');
				if (!_self.validateEmail(that.$email.val())) {
					that.$email.addClass('invalidState');
					that.$error.text("Invalid Email.");
					that.$error.removeClass('display');
				} else {
					$.ajax({
						url : hostUrl + "/validate/email",
						type : 'POST',
						data : "email=" + that.$email.val(),
						processData : false,
						contentType : "application/x-www-form-urlencoded"
					}).done(function(data) {
						if (data === 1) {
							that.$email.addClass('invalidState');
							that.$error.text("Invalid Email.");
							that.$error.removeClass('display');
						} else {
							that.$email.removeClass('invalidState');
							that.$error.text("");
							that.$error.addClass('display');
						}
					});
				}
				event.preventDefault();
			});
						
			this.$btnSignupUpload.off('click');
			this.$btnSignupUpload.on('click', function(event){
				navigator.camera.getPicture(onCapturePhotoSuccess, onCapturePhotoError, {
					destinationType : navigator.camera.DestinationType.FILE_URI,
					sourceType : navigator.camera.PictureSourceType.PHOTOLIBRARY
				});

				function onCapturePhotoSuccess(imageData) {
					window.resolveLocalFileSystemURL(imageData, gotFileEntry, onFileSystemURIError);
				}

				function gotFileEntry(fileEntry) {
					//convert all file to base64 formats
					fileEntry.file(function(file) {
						var reader = new FileReader();
						reader.onloadend = function(evt) {
							$('#imgSignupDisp').attr('src', evt.target.result);

							that.pic = _self.dataURItoBlob(evt.target.result);
						};
						reader.readAsDataURL(file);
					}, function(message) {
						alert('Failed because: ' + message);
					});
				}

				function onFileSystemURIError() {
					alert('Failed to resolve local file system URI.');
				}

				function onCapturePhotoError(message) {
					alert('Captured Failed because: ' + message);
				}

				event.preventDefault();
			});
			
			this.$btnSignup.off('click');
			this.$btnSignup.on('click', function(event){
				if (that.$password.val() !== that.$confirmPass.val()) {
					alert("Password and Confirm Password needs to be same.");
				} else if (that.$username.val() != "" && that.$name.val() != "" && that.$email.val() != "" && that.$password.val() != "" && that.$confirmPass.val() != "" && that.$contact.val() != "" ) {
					_self.loading(true);
					var formData = new FormData(that.$frmSignup[0]);
					if (that.pic !== undefined ) {
						formData.append('profilePic', that.pic);
					}
					formData.append('skills', '');
					
					$.ajax({
						url : hostUrl + "/resources",
						type : 'POST',
						data : formData,
						processData : false,
						contentType : false
					}).done(function(data) {
						_self.loading(false);
						$.mobile.navigate('#page-login');
					}).fail(function(jqXHR, textStatus, errorThrown) {
						_self.loading(false);
						alert("Could not register user. Please contact your administrator.");
						//alert(jqXHR + ":" + textStatus + ":" + errorThrown);
						//alert(jqXHR.responseJSON);
					});
				} else {
					alert("Username, name, email, contact and password can not be empty.");
				}
				event.preventDefault();
			});
		},
		
		dataURItoBlob : function(dataURI) {
			var byteString = atob(dataURI.split(',')[1]);

			var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

			var ab = new ArrayBuffer(byteString.length);
			var ia = new Uint8Array(ab);
			for (var i = 0; i < byteString.length; i++) {
				ia[i] = byteString.charCodeAt(i);
			}

			var bb = new Blob([ab], {
				"type" : mimeString
			});
			return bb;
		},
		
		validateEmail : function(email) {
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
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