var controller = function () {
	//var hostUrl = "http://localhost:8080/RateMePalMidTier",
	var hostUrl = "http://vps.hilfe.website:8080/RateMePalMidTier",
	clientId = "rateMePal";

	var controller = {
		_self : null,
		init : function () {
			_self = this;

			$(document).delegate("#page-signup", "pagebeforeshow", function () {
				_self.signup();
			});

			$(document).delegate("#page-login", "pagebeforeshow", function (event, data) {
				openFB.init({
					appId : '975569862484922',
					tokenStore : window.localStorage
				});
				openGL.init({
					appId : '192806734171-uh405irbgbsg3nu04sf0e7rj54a552e3.apps.googleusercontent.com',
					tokenStore : window.localStorage
				});

				if (data.prevPage.length > 0) {
					_self.welcome();
				} else {
					event.preventDefault();
					_self.checkLogin();
				}
			});

			$(document).delegate("#page-forgot", "pagebeforeshow", function () {
				_self.forgot();
			});

			$(document).delegate("#page-home", "pagebeforeshow", function () {
				_self.home();
			});
		
			$(document).delegate("#page-customRating", "pagebeforeshow", function () {
				_self.customRating();
			});
			
			$(document).delegate("#page-friends", "pagebeforeshow", function () {
				_self.friends();
			});
		},
		
		friends: function(){
			this.$friendsPage = $('#page-friends');
			this.$friendsList = $('#friendsList',this.$friendsPage);
			this.$peopleList = $('#peopleList',this.$friendsPage);
			this.$inpFriend = $('#txtFriend', this.$friendsPage).val('');
			this.$inpPeople = $('#txtPeople', this.$friendsPage).val('');
			
			this.$inpFriend.off('change');
			this.$inpFriend.on('change', function(event){
				_self.loading(true);
				$.ajax({
					url : hostUrl.concat("/search/friends?access_token=" + window.bearerToken),
					type : 'GET',
					data : {'searchKey':event.currentTarget.value}
				}).done(function(data) {
					_self._showFriends(data);
					_self.loading(false);					
				});
			});
			
			this.$inpPeople.off('change');
			this.$inpPeople.on('change', function(event){
				_self.loading(true);
				$.ajax({
					url : hostUrl.concat("/search/nonFriends?access_token=" + window.bearerToken),
					type : 'GET',
					data : {'searchKey':event.currentTarget.value}
				}).done(function(data) {
					_self._showNonFriends(data);	
					_self.loading(false);
				});
			});
			
			_self.frdAjaxCounter = 2;
			_self.loading(true);
			$.ajax({
				url : hostUrl.concat("/friends?access_token=" + window.bearerToken),
				type : 'GET'
			}).done(function(data) {
				_self._showFriends(data);	
			});
			
			$.ajax({
				url : hostUrl.concat("/friends/notInvited?access_token=" + window.bearerToken),
				type : 'GET'
			}).done(function(data) {
				_self._showNonFriends(data);
			});
		},
		
		_showNonFriends: function(nonFrdsData){
			this.$friendsPage = $('#page-friends');
			this.$peopleList = $('#peopleList',this.$friendsPage);
			this.$peopleCount = $('#peopleCount',this.$friendsPage);
			this.$peopleList.empty();
			
			if(nonFrdsData.length > 0){
				this.$peopleCount.text(nonFrdsData.length + " User Found");
				for(var i=0;i<nonFrdsData.length;i++){
					if(nonFrdsData[i].status === null){
						this.$peopleList.append("<li id='lstItem-"+i+"'><div class='UserProfileImg'><img id='imgHomeDisp' data-inline='true' class='UserProfilePic' src='images/defaultImg.png'></div><div class='UserProfileName'><p class='UserName' id='txtName'>"+ nonFrdsData[i].name +"</p><p class='UserDesignation' id='txtDesignation'>"+ nonFrdsData[i].designation +"</p><div class='RatingBarBlock' id='RatingBarBlock'><div class='UserRatingBar'><div class='userRating' id='usrRate-"+nonFrdsData[i].name+"'></div><span class='connect'> + Connect </span></div></div></div></li>").listview('refresh');
						
						$('#lstItem-'+i).data(nonFrdsData[i]);
					} else if(nonFrdsData[i].status === "1"){
						this.$peopleList.append("<li><div class='UserProfileImg'><img id='imgHomeDisp' data-inline='true' class='UserProfilePic' src='images/defaultImg.png'></div><div class='UserProfileName'><p class='UserName' id='txtName'>"+ nonFrdsData[i].name +"</p><p class='UserDesignation' id='txtDesignation'>"+ nonFrdsData[i].designation +"</p><div class='RatingBarBlock' id='RatingBarBlock'><div class='UserRatingBar'><div class='userRating' id='usrRate-nonFrd"+i+"'></div><span class='requestSent'> Request Sent </span></div></div></div></li>").listview('refresh');
						
						$('#usrRate-nonFrd'+i).raty({readOnly: true, score: 3});
					}
				}
				this.$peopleList.off('click', 'li span');
				this.$peopleList.on('click', 'li span.connect', function(event){
					var sId = event.currentTarget.parentNode.parentNode.parentNode.parentNode.id,
						data = $('#'+ sId).data();
					
					$.ajax({
						url : hostUrl.concat("/friends?access_token=" + window.bearerToken),
						type : 'POST',
						data : {'friendUserName': data.username}
					}).done(function(data) {
						console.log('Friends status updated.');
						_self.friends();
					});
					
				});

				$('#noPeopleResult').addClass('display-none');
				$('#peopleSearchDiv').removeClass('display-none');
			}else{
				$('#noPeopleResult').removeClass('display-none');
				$('#peopleSearchDiv').addClass('display-none');
			}
			
			_self.frdAjaxCounter--;
			if(_self.frdAjaxCounter === 0){
				_self.loading(false);
			}

		},
		
		_showFriends: function(frdsData){
			this.$friendsPage = $('#page-friends');
			this.$friendsList = $('#friendsList',this.$friendsPage);
			this.$friendsCount = $('#friendsCount',this.$friendsPage);
			this.$friendsList.empty();
			
			if(frdsData.length > 0){
				this.$friendsCount.text(frdsData.length + " User Found");
				for(var i=0;i<frdsData.length;i++){
					this.$friendsList.append("<li><div class='UserProfileImg'><img id='imgHomeDisp' data-inline='true' class='UserProfilePic' src='images/defaultImg.png'></div><div class='UserProfileName'><p class='UserName' id='txtName'>"+ frdsData[i].name +"</p><p class='UserDesignation' id='txtDesignation'>"+ frdsData[i].designation +"</p><div class='RatingBarBlock' id='RatingBarBlock'><div class='UserRatingBar'><div id='usrRate-frd"+i+"' class='userRating'></div></div></div></div></li>").listview('refresh');
					
					$('#usrRate-frd'+i).raty({readOnly: true, score: 3});
				}
				
				$('#noFriendsResult').addClass('display-none');
				$('#friendsSearchDiv').removeClass('display-none');
			}else{
				$('#noFriendsResult').removeClass('display-none');
				$('#friendsSearchDiv').addClass('display-none');
			}
			
			_self.frdAjaxCounter--;
			if(_self.frdAjaxCounter === 0){
				_self.loading(false);
			}
		},
		
		
		customRating: function(){
			var that = this, addParameterArr = [], rmParameterArr = [], parameterArr = [];
			this.$customRatingPage = $('#page-customRating');
			this.$addCustomParameter = $('#btnAddParameter', this.$customRatingPage);
			this.$saveCustomParameter = $('#btnSaveParameter', this.$customRatingPage);
			
			this.$customPersonalList = $('#customPersonalList', this.$customRatingPage);
			this.$customProfessionalList = $('#customProfessionalList', this.$customRatingPage);
			this.$inpParameterName = $('#inpParameterName', this.$customRatingPage).val('');
			
			this.$customPersonalList.empty();
			this.$customProfessionalList.empty();
			
			_self.loading(true);
			$.ajax({
				url : hostUrl.concat("/parameters?access_token=" + window.bearerToken),
				type : 'GET'
			}).done(function (data) {
				for(var i=0; i < data.length; i++){
					if(data[i].type === "Personal"){
						that.$customPersonalList.append('<li id="lstItemPersonal-'+ data[i].id +'"> <span class="skills">' + data[i].name + '</span> <span class="skillRating"> <span aria-hidden="true" class="glyphicon glyphicon-minus-sign"></span> </span></li>').listview('refresh');
					} else if(data[i].type === "Professional"){
						that.$customProfessionalList.append('<li id="lstItemProfessional-'+ data[i].id +'"> <span class="skills">' + data[i].name + '</span> <span class="skillRating"> <span aria-hidden="true" class="glyphicon glyphicon-minus-sign"></span> </span></li>').listview('refresh');
					}
				}
				_self.loading(false);
				parameterArr = data;
			});
			
			function removePara(paraId){
				for(var i=0; i < parameterArr.length; i++){
					if(paraId === "lstItemPersonal-"+parameterArr[i].id || paraId === "lstItemProfessional-"+parameterArr[i].id){
						rmParameterArr.push(parameterArr[i]);
						break;
					}
				}
				for(var i=0; i < addParameterArr.length; i++){
					if(paraId === addParameterArr[i].id){
						addParameterArr.splice(i, 1);
						break;
					}
				}
			};
			
			this.$customPersonalList.on('click','li .skillRating span', function(event){
				var id = event.currentTarget.parentNode.parentNode.id;
				$('#' + id).remove();
				removePara(id);
			});
			
			this.$customProfessionalList.on('click','li .skillRating span', function(event){
				var id = event.currentTarget.parentNode.parentNode.id;
				$('#' + id).remove();
				removePara(id);
			});
			
			this.$addCustomParameter.off('click');
			this.$addCustomParameter.on('click', function(event){
				var inpParaName = that.$inpParameterName.val();
				if(that.$inpParameterName.val() != ""){
					if(!_self.arrayContains(inpParaName, parameterArr) && !_self.arrayContains(inpParaName, addParameterArr)){
						if($('#btnCustomProfessionalTab').hasClass('ui-btn-active')){
							addParameterArr.push({"id":"lstItemProfessional-"+inpParaName, "type":"2", "name":inpParaName});
							that.$customProfessionalList.append('<li id="lstItemProfessional-'+ inpParaName +'"> <span class="skills">' + that.$inpParameterName.val() + '</span> <span class="skillRating"> <span aria-hidden="true" class="glyphicon glyphicon-minus-sign"></span> </span></li>').listview('refresh');
						} else {
							addParameterArr.push({"id":"lstItemPersonal-"+inpParaName, "type":"1", "name":inpParaName});
							that.$customPersonalList.append('<li id="lstItemPersonal-'+ inpParaName +'"> <span class="skills">' + inpParaName + '</span> <span class="skillRating"> <span aria-hidden="true" class="glyphicon glyphicon-minus-sign"></span> </span></li>').listview('refresh');
						}
					} else {
						alert("Parameter Name is already added.");
					}
					that.$inpParameterName.val('');
					that.$inpParameterName.focus();
				} else {
					alert("Enter a parameter.");
				}
			});
			
			this.$saveCustomParameter.off('click');
			this.$saveCustomParameter.on('click', function(event){
				var that = this;
				this.removeCounter = rmParameterArr.length;
				this.addCounter = addParameterArr.length;
				
				if(this.removeCounter > 0){
					_self.loading(true);
					for(var i=0; i < rmParameterArr.length; i++){
						$.ajax({
							url : hostUrl.concat("/parameters/"+ rmParameterArr[i].id +"?access_token=" + window.bearerToken),
							type : 'DELETE'
						}).done(function (data) {
							that.removeCounter--;
							console.log("Parameter removed.");
							that.ajaxDoneCallback();
						});
					}
				}
				
				if(this.addCounter > 0){
					_self.loading(true);
					for(var i=0; i < addParameterArr.length; i++){
						$.ajax({
							url : hostUrl.concat("/parameters?access_token=" + window.bearerToken),
							type : 'POST',
							data : {"name": addParameterArr[i].name, "type": addParameterArr[i].type}
						}).done(function (data) {
							that.addCounter--;
							console.log("Parameter added.");
							that.ajaxDoneCallback();
						});
					}
				}
				
				this.ajaxDoneCallback = function(){
					if(this.removeCounter == 0 && this.addCounter == 0){
						$.ajax({
							url : hostUrl.concat("/parameters?access_token=" + window.bearerToken),
							type : 'GET'
						}).done(function (data) {
							parameterArr = data;
							_self.loading(false);
						});
						addParameterArr = [];
						rmParameterArr = [];
					}
				};
				$('#inpParameterName', this.$customRatingPage).focus();
			});
		},
		
		home : function () {
			var that = this;
			this.$homePage = $('#page-home');
			this.$btnLogout = $('#btnLogout', this.$homePage);
			this.$btnHome = $('#btnHome', this.$homePage);
			
			this.$imgUHomeDisp = $('#imgUHomeDisp', this.$homePage);
			this.$txtUName = $('#txtUName', this.$homePage);
			this.$txtUDesignation = $('#txtUDesignation', this.$homePage);
			this.$txtUDesc = $('#txtUDesc', this.$homePage);
			
			this.$lstPersonal = $('#lstPersonal', this.$homePage);
			this.$lstProfessional = $('#lstProfessional', this.$homePage);
			
			this.$btnLogout.off('click');
			this.$btnLogout.on('click', _self.logout);
			
			_self.loading(true);
			$.ajax({
				url : hostUrl.concat("/resources/fetch?access_token=" + window.bearerToken),
				type : 'GET'
			}).done(function(data) {
				that.$txtUName.text(data.name);
				that.$txtUDesignation.text(data.designation);
				that.$txtUDesc.text(data.description);
				$('#userOverallRating').raty({readOnly: true, score: 3});
				$.ajax(   {
					url : hostUrl + "/profilePic/" + data.username,
					type : 'GET',
					async : true
				}).done(function (dataURL) {
					if (dataURL) {
						that.$imgUHomeDisp.attr('src', 'data:image/png;base64,' + dataURL);
					}
				});
				_self.loading(false);
			});
			
			this.$lstPersonal.empty();
			this.$lstProfessional.empty();
			
			$.ajax({
				url : hostUrl.concat("/parameters?access_token=" + window.bearerToken),
				type : 'GET'
			}).done(function (data) {
				for(var i=0; i < data.length; i++){
					if(data[i].type === "Personal"){
						that.$lstPersonal.append('<li id="lstItemPersonal-'+ data[i].id +'"> <span class="skills">' + data[i].name + '</span> <span id="usrRate-'+ data[i].name +'" class="skillRating"> </span></li>').listview('refresh');
					} else if(data[i].type === "Professional"){
						that.$lstProfessional.append('<li id="lstItemProfessional-'+ data[i].id +'"> <span class="skills">' + data[i].name + '</span> <span id="usrRate-'+ data[i].name +'" class="skillRating"> </span></li>').listview('refresh');
					}
					$('#usrRate-'+data[i].name).raty({readOnly: true, score: 3});
				}
			});
			
		},
			
		arrayContains: function(val, arr){
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].name === val) {
					return true;
				}
			}
			return false;
		},
		
		logout : function () {
			window.localStorage.removeItem('rmp_lobin_by');
			window.localStorage.removeItem('rmplogin_refresh_token');
			window.localStorage.removeItem('fbtoken');
			window.localStorage.removeItem('gltoken');
			$.mobile.navigate("#page-login");
		},
		
		welcome : function () {
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

		checkLogin : function () {
			if (window.localStorage.rmp_lobin_by === "normal") {
				if (window.localStorage.rmplogin_refresh_token) {
					_self.directLoginApp();
				}
			} else if (window.localStorage.rmp_lobin_by === "fb") {
				openFB.getLoginStatus(function (response) {
					if (response.status === "connected") {
						_self.directLoginApp();
					} else {
						$.mobile.navigate("#page-login");
					}
				});
			} else if (window.localStorage.rmp_lobin_by === "gl") {
				openGL.getLoginStatus(function (response) {
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

		directLoginApp : function () {
			function loginSuccess() {
				$.mobile.navigate('#page-home');
				loginBy = "normal";
			}

			function refreshTokenFailure() {
				_self.loading(false);
				$.mobile.navigate("#page-login");
			};

			function passwordFailure() {
				_self.loading(false);
				$.mobile.navigate("#page-login");
			};

			var authentication = new AuthenticationProxy(hostUrl, clientId, loginSuccess, refreshTokenFailure, passwordFailure);
			authentication.loginWithRefreshToken(window.localStorage.rmplogin_refresh_token);
		},

		onLoginClickHandler : function (event) {
			var that = this;
			_self.loading(true);
			function loginSuccess() {
				_self.userLogin = that.$username.val();
				window.localStorage.rmp_lobin_by = "normal";
				_self.loading(false);
				$.mobile.navigate("#page-home");
			};

			function refreshTokenFailure() {
				_self.loading(false);
				$.mobile.navigate("#page-login");
			};

			function passwordFailure() {
				_self.loading(false);
				alert('Invalid Username and Password');
			};

			var authentication = new AuthenticationProxy(hostUrl, clientId, loginSuccess, refreshTokenFailure, passwordFailure);
			authentication.loginWithPassword(this.$username.val(), this.$password.val());
		},

		fbLogin : function () {
			openFB.getLoginStatus(function (response) {
				if (response.status === "connected") {
					_self.socialLogin('fb');
				} else {
					openFB.login(function (response) {
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

		glLogin : function () {
			openGL.getLoginStatus(function (response) {
				if (response.status === "connected") {
					_self.socialLogin('gl');
				} else {
					openGL.login(function (response) {
						if (response.status === 'connected') {
							_self.socialLogin('gl');
						} else {
							alert('Google login failed: ' + response.error);
						}
					}, {
						scope : 'openid profile email'
					});
				}
			});
		},

		socialLogin : function (sValue) {
			var username,
			password;
			if (sValue === 'fb') {
				username = 'fbAdmin';
				password = 'fbAdmin';
			} else if (sValue === 'gl') {
				username = 'glAdmin';
				password = 'glAdmin';
			}
			_self.loading(true);
			function loginSuccess() {
				loginBy = sValue;
				window.localStorage.rmp_lobin_by = sValue;
				_self.loading(false);
				$.mobile.navigate("#page-home");
			};

			function refreshTokenFailure() {
				_self.loading(false);
				$.mobile.navigate("#page-login");
			};

			function passwordFailure() {
				_self.loading(false);
				alert('Invalid Username and Password');
			};

			var authentication = new AuthenticationProxy(hostUrl, clientId, loginSuccess, refreshTokenFailure, passwordFailure);
			authentication.loginWithPassword(username, password);
		},

		forgot : function () {
			var that = this;
			this.$forgotPass = $('#page-forgot');
			this.$inpForgotUsername = $('#inpForgotUsername', this.$forgotPass).val("");

			$('#forgotPassForm').off('submit');
			$('#forgotPassForm').submit(function (e) {
				if (that.$inpForgotUsername.val() === "") {
					alert("Enter username.");
				} else {
					_self.loading("show");
					$.ajax({
						url : hostUrl.concat("/password/forgot"),
						type : 'PUT',
						data : {
							"username" : that.$inpForgotUsername.val()
						},
					}).done(function (data) {
						_self.loading("hide");
						$.mobile.navigate('#page-login');
					});
				}
				e.preventDefault();
			});
		},

		signup : function () {
			var that = this;
			this.$signup = $("#page-signup");
			this.$frmSignup = $('#formSignup', this.$signup);
			this.$username = $('#inpUsername', this.$signup).val('');
			this.$email = $('#inpEmail', this.$signup).val('');
			this.$designation = $('#inpDesignation', this.$signup).val('');
			this.$description = $('#inpDescription', this.$signup).val('');
			this.$name = $('#inpName', this.$signup).val('');
			this.$password = $('#inpPassword', this.$signup).val('');
			this.$confirmPass = $('#inpConfirmPass', this.$signup).val('');
			this.$contact = $('#inpTelephone', this.$signup).val('');
			this.$imgSignupDisp = $('#imgSignupDisp', this.$signup).attr('src', './images/defaultImg.png');
			this.$btnSignupUpload = $('#btnSignupUpload', this.$signup);
			this.$btnSignup = $('#btnSignup', this.$signup);

			this.$error = $('#error', this.$signup).text('');

			this.$username.off('focusout');
			this.$username.on('focusout', function (event) {
				that.$username.removeClass('invalidState');
				$.ajax({
					url : hostUrl + "/validate/username",
					type : 'POST',
					data : "username=" + that.$username.val(),
					processData : false,
					contentType : "application/x-www-form-urlencoded"
				}).done(function (data) {
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
				event.preventDefault();
			});

			this.$email.off('focusout');
			this.$email.on('focusout', function (event) {
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
					}).done(function (data) {
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
			this.$btnSignupUpload.on('click', function (event) {
				navigator.camera.getPicture(onCapturePhotoSuccess, onCapturePhotoError, {
					destinationType : navigator.camera.DestinationType.FILE_URI,
					sourceType : navigator.camera.PictureSourceType.PHOTOLIBRARY
				});

				function onCapturePhotoSuccess(imageData) {
					window.resolveLocalFileSystemURL(imageData, gotFileEntry, onFileSystemURIError);
				}

				function gotFileEntry(fileEntry) {
					//convert all file to base64 formats
					fileEntry.file(function (file) {
						var reader = new FileReader();
						reader.onloadend = function (evt) {
							$('#imgSignupDisp').attr('src', evt.target.result);

							that.pic = _self.dataURItoBlob(evt.target.result);
						};
						reader.readAsDataURL(file);
					}, function (message) {
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
			this.$btnSignup.on('click', function (event) {
				if (that.$password.val() !== that.$confirmPass.val()) {
					alert("Password and Confirm Password needs to be same.");
				} else if (that.$username.val() != "" && that.$name.val() != "" && that.$email.val() != "" && that.$password.val() != "" && that.$confirmPass.val() != "" && that.$contact.val() != "") {
					_self.loading(true);
					var formData = new FormData(that.$frmSignup[0]);
					if (that.pic !== undefined) {
						formData.append('profilePic', that.pic);
					}
					//formData.append('skills', '');

					$.ajax({
						url : hostUrl + "/resources",
						type : 'POST',
						data : formData,
						processData : false,
						contentType : false
					}).done(function (data) {
						_self.loading(false);
						$.mobile.navigate('#page-login');
					}).fail(function (jqXHR, textStatus, errorThrown) {
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

		dataURItoBlob : function (dataURI) {
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

		validateEmail : function (email) {
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		},

		loading : function (showOrHide) {
			setTimeout(function () {
				var flag = showOrHide ? "show" : "hide";
				$.mobile.loading(flag);
			}, 0);
		}
	};

	controller.init();
	return controller;
};
