var controller = function () {
	//var hostUrl = "http://localhost:8080/RateMePalMidTier",
	var hostUrl = "http://vps.hilfe.website:8080/RateMePalMidTier",
	clientId = "rateMePal";

	var controller = {
		_self : null,
		init : function () {
			_self = this;
			_self.checkLogin();
			//_self.welcome();
			
			openFB.init({
				appId : '975569862484922',
				tokenStore : window.localStorage
			});
			openGL.init({
				appId : '192806734171-uh405irbgbsg3nu04sf0e7rj54a552e3.apps.googleusercontent.com',
				tokenStore : window.localStorage
			});
			
			document.addEventListener("backbutton", _self.backButtonHandler, false);
			
			$(document).delegate("#page-signup", "pagebeforeshow", function () {
				_self.signup();
			});

			$(document).delegate("#page-login", "pagebeforeshow", function (event, data) {
				_self.welcome();
				if (data.prevPage.length === 0) {
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
			
			$(document).delegate("#page-resetPassword", "pagebeforeshow", function () {
				_self.resetPassword();
			});
		},
		
		resetPassword: function(){
			var that = this;
			this.$resetPasswordPage = $('#page-resetPassword');
			this.$inpOldPass = $('#oldPassword', this.$resetPasswordPage);
			this.$inpNewPass = $('#newPassword', this.$resetPasswordPage);
			this.$inpConfirmNewPass = $('#confirmPassword', this.$resetPasswordPage);
			this.$error1 = $('#error1', this.$resetPasswordPage);
			this.$btnUpdate = $('#btnUpdate', this.$resetPasswordPage);
			
			this.$inpOldPass.val('');
			this.$inpNewPass.val('');
			this.$inpConfirmNewPass.val('');
			this.$inpOldPass.off('focusout');
			this.$inpOldPass.on('focusout', function(){
				_self._setInputState(that.$inpOldPass, "", 0, that.$error1);
				if(that.$inpOldPass.val() === ''){
					_self._setInputState(that.$inpOldPass, "Old password cannot be empty.", 1, that.$error1);
				}
			});
			this.$inpNewPass.off('focusout');
			this.$inpNewPass.on('focusout', function(){
				_self._setInputState(that.$inpNewPass, "", 0, that.$error1);
				if(that.$inpNewPass.val() === ''){
					_self._setInputState(that.$inpNewPass, "New password cannot be empty.", 1, that.$error1);
				}
			});
			this.$inpConfirmNewPass.off('focusout');
			this.$inpConfirmNewPass.on('focusout', function(){
				_self._setInputState(that.$inpConfirmNewPass, "", 0, that.$error1);
				if(that.$inpConfirmNewPass.val() === ''){
					_self._setInputState(that.$inpConfirmNewPass, "Confrim new password cannot be empty.", 1, that.$error1);
				}
			});
			
			this.$btnUpdate.off('click');
			this.$btnUpdate.on('click', function(){
				if(that.$inpNewPass.val() !== that.$inpConfirmNewPass.val()){
					_self._showAlert("New password and Confirm new password neds to be same.");
				} else {
					_self.loading(true);
					$.ajax({
						url : hostUrl.concat("/password/reset?access_token=" + window.bearerToken),
						type : 'PUT',
						data : {
							"username" : _self.userLogin,
							"password" : that.$inpNewPass.val()
						}
					}).done(function (o) {
						_self.loading(false);
						$.mobile.navigate('#page-home');
					});
				}
			});
		},
		
		backButtonHandler: function(event){
			if($.mobile.activePage.is('#page-login')){
				navigator.app.exitApp();
			} else if($.mobile.activePage.is('#page-home')){
				_self.logout();
			} else {
				navigator.app.backHistory();
			}
		},
		
		logout : function () {
			function onConfirm(button){
				if(button === 1){	
					_self.loading(true);
					$.ajax({
						url : hostUrl.concat("/logout?access_token=" + window.bearerToken),
						type : 'GET'
					}).done(function () {
						_self.loading(false);
						if (window.localStorage.rmp_lobin_by === "fb") {
							openFB.logout(function () {
								_self.clearAll();
							});
						} else if (window.localStorage.rmp_lobin_by === "gl") {
							openGL.logout(function () {
								_self.clearAll();
							});
						} else {
							_self.clearAll();
						}
					});
				}
			}
			navigator.notification.confirm(
				'Are you sure you want to logout?',  // message
				onConfirm,              // callback to invoke with index of button pressed
				'Logout',            // title
				['Yes','No']          // buttonLabels
			);
		},
		
		clearAll: function(){
			$.mobile.navigate("#page-login");
			window.localStorage.removeItem('rmp_lobin_by');
			window.localStorage.removeItem('rmplogin_refresh_token');
			window.localStorage.removeItem('fbtoken');
			window.localStorage.removeItem('gltoken');
		},
		
		friends: function(){
			this.$friendsPage = $('#page-friends');
			this.$btnLogout = $('#btnLogout', this.$friendsPage);
			
			this.$friendsList = $('#friendsList',this.$friendsPage);
			this.$peopleList = $('#peopleList',this.$friendsPage);
			this.$inpFriend = $('#txtFriend', this.$friendsPage).val('');
			this.$inpPeople = $('#txtPeople', this.$friendsPage).val('');
			
			this.$btnLogout.off('click');
			this.$btnLogout.on('click', _self.logout);
			
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
					if(data[i].name === 'Honesty' || data[i].name === 'Personality' || data[i].name === 'Optimism' || data[i].name === 'Social' || data[i].name === 'Team player' || data[i].name === 'Leadership' || data[i].name === 'Communication' || data[i].name === 'Management'){
						
					} else {
						if(data[i].type === "Personal"){
							that.$customPersonalList.append('<li id="lstItemPersonal-'+ data[i].id +'"> <span class="skills">' + data[i].name + '</span> <span class="skillRating"> <span aria-hidden="true" class="glyphicon glyphicon-minus-sign"></span> </span></li>').listview('refresh');
						} else if(data[i].type === "Professional"){
							that.$customProfessionalList.append('<li id="lstItemProfessional-'+ data[i].id +'"> <span class="skills">' + data[i].name + '</span> <span class="skillRating"> <span aria-hidden="true" class="glyphicon glyphicon-minus-sign"></span> </span></li>').listview('refresh');
						}
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
						_self._showAlert("Parameter Name is already added.");
					}
					that.$inpParameterName.val('');
					that.$inpParameterName.focus();
				} else {
					_self._showAlert("Enter a parameter.");
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
			_self.loading(false);
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
						that.$lstPersonal.append('<li id="lstItemPersonal-'+ data[i].id +'"> <span class="skills">' + data[i].name + '</span> <span id="usrRate-'+ data[i].id +'" class="skillRating"> </span></li>').listview('refresh');
					} else if(data[i].type === "Professional"){
						that.$lstProfessional.append('<li id="lstItemProfessional-'+ data[i].id +'"> <span class="skills">' + data[i].name + '</span> <span id="usrRate-'+ data[i].id +'" class="skillRating"> </span></li>').listview('refresh');
					}
					$('#usrRate-'+data[i].id).raty({readOnly: true, score: 3});
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
				
		welcome : function () {
			this.$login = $("#page-login");

			this.$username = $('#username', this.$login).val("");
			this.$password = $('#password', this.$login).val("");

			this.$btnLogin = $('#btnLogin', this.$login);
			this.$btnFB = $('#btnFB', this.$login);
			this.$btnGL = $('#btnGL', this.$login);

			this.$btnFB.off('click');
			this.$btnFB.on('click', function(){
				_self.loading(true);
				openFB.getLoginStatus(function (response) {
					if (response.status === "connected") {
						_self.getSocialData('fb');
					} else {
						openFB.login(function (response) {
							if (response.status === 'connected') {
								_self.getSocialData('fb');
							} else {
								alert('Facebook login failed: ' + response.error);
							}
						}, {
							scope : 'email,read_stream,public_profile'
						});
					}
				});
			});

			this.$btnGL.off('click');
			this.$btnGL.on('click', function(){
				_self.loading(true);
				openGL.getLoginStatus(function (response) {
					if (response.status === "connected") {
						_self.getSocialData('gl');
					} else {
						openGL.login(function (response) {
							if (response.status === 'connected') {
								_self.getSocialData('gl');
							} else {
								alert('Google login failed: ' + response.error);
							}
						}, {
							scope : 'openid profile email'
						});
					}
				});
			});

			this.$btnLogin.off('click');
			this.$btnLogin.on('click', jQuery.proxy(_self.onLoginClickHandler, this));
		},

		checkLogin : function () {
			_self.welcome();
			if (window.localStorage.rmp_lobin_by === "normal") {
				if (window.localStorage.rmplogin_refresh_token) {
					_self.directLoginApp("normal");
				}
			} else if (window.localStorage.rmp_lobin_by === "fb") {
				openFB.getLoginStatus(function (response) {
					if (response.status === "connected") {
						_self.directLoginApp("fb");
					} else {
						$.mobile.navigate("#page-login");
					}
				});
			} else if (window.localStorage.rmp_lobin_by === "gl") {
				openGL.getLoginStatus(function (response) {
					if (response.status === "connected") {
						_self.directLoginApp("gl");
					} else {
						$.mobile.navigate("#page-login");
					}
				});
			}
		},

		directLoginApp : function (loginBy) {
			function loginSuccess() {
				$.mobile.navigate('#page-home');
				window.localStorage.rmp_lobin_by = loginBy;
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
				_self.isResetPasswordRequired();
				_self.userLogin = that.$username.val();
				window.localStorage.rmp_lobin_by = "normal";
			};

			function refreshTokenFailure() {
				_self.loading(false);
				$.mobile.navigate("#page-login");
			};

			function passwordFailure() {
				_self.loading(false);
				_self._showAlert('Invalid Username and Password.');
			};

			var authentication = new AuthenticationProxy(hostUrl, clientId, loginSuccess, refreshTokenFailure, passwordFailure);
			authentication.loginWithPassword(this.$username.val(), this.$password.val());
		},

		getSocialData : function (social) {
			if(social === 'fb'){
				openFB.api({
					path: '/me',
					params:{'fields':'name,email,picture'},
					success: function (data) {
						_self._checkIfSocialUserExist(data,'fb');
					},
					error: function (error) {
						console.log(error.message);
					}
				});
			} else if(social === 'gl'){
				openGL.api({
					path: '/userinfo',
					success: function (data) {
						_self._checkIfSocialUserExist(data,'gl');
					},
					error: function (error) {
						alert(error.message);
					}
				});
			}
		},
		
		_checkIfSocialUserExist: function(data, social){
			var that = this;
			this.socialData = data;
			this.social = social;
			$.ajax({
				url : hostUrl + "/validate/username",
				type : 'POST',
				data : "username=" + social + '_' +  data.email,
				processData : false,
				contentType : "application/x-www-form-urlencoded"
			}).done(function (data) {
				if (data === 1) {
					_self.processSocialLogin(that.socialData, that.social);
				} else {
					_self.registerSocialUser(that.socialData, that.social);
				}
			});
		},
		
		processSocialLogin: function(data, social){
			var that = this;
			this.data = data;
			this.social = social;
			function loginSuccess() {
				_self.userLogin = that.social+'_'+that.data.email;
				window.localStorage.rmp_lobin_by = that.social;
				_self.loading(false);
				$.mobile.navigate("#page-home");
			};

			function refreshTokenFailure() {
				_self.loading(false);
				$.mobile.navigate("#page-login");
			};

			function passwordFailure() {
				_self.loading(false);
				//_self._showAlert('Invalid Username and Password.');
			};

			var authentication = new AuthenticationProxy(hostUrl, clientId, loginSuccess, refreshTokenFailure, passwordFailure);
			if(this.social === 'fb'){
				authentication.loginWithPassword('fb_'+data.email, 'fbUser');
			} else if(this.social === 'gl'){
				authentication.loginWithPassword('gl_'+data.email, 'glUser');
			}
			
		},
		
		registerSocialUser: function(data, social){
			var that = this, formData = new FormData();
			this.data = data;
			this.social = social;
			
			if(data.email){
				formData.append('name', data.name);
				formData.append('email', data.email+'_'+new Date().getTime());
				if(social === 'fb'){
					formData.append('username', 'fb_'+data.email);
					formData.append('password','fbUser');
				} else if(social === 'gl'){
					formData.append('username', 'gl_'+data.email);
					formData.append('password','glUser');
				}
				formData.append('designation', '');
				formData.append('description', '');
				formData.append('contact', '');
				formData.append('visible', '1');
				
				$.ajax({
					url : hostUrl + "/resources",
					type : 'POST',
					data : formData,
					processData : false,
					contentType : false
				}).done(function (data) {
					_self.processSocialLogin(that.data, that.social);
				}).fail(function (jqXHR, textStatus, errorThrown) {
					_self.loading(false);
				});
			} else {
				_self._showAlert('App is not able to fetch your details. Please check your account settings.');
			}
			
		},
		
		forgot : function () {
			var that = this;
			this.$forgotPass = $('#page-forgot');
			this.$inpForgotUsername = $('#inpForgotUsername', this.$forgotPass).val("");

			$('#forgotPassForm').off('submit');
			$('#forgotPassForm').submit(function (e) {
				if (that.$inpForgotUsername.val() === "") {
					_self._showAlert("Enter username.");
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

		isResetPasswordRequired: function(){
			$.ajax({
				url : hostUrl.concat("/password/reset?access_token=" + window.bearerToken),
				type : 'GET',
				data : { "username" : _self.userLogin }
			}).done(function (data) {
				if (data == 0) {
					$.mobile.navigate('#page-home');
				} else {
					$.mobile.navigate('#page-resetPassword');
				}
			});
		},
		
		_setInputState: function(control, message, data, errorControl){
			if(data === 1){
				control.addClass('invalidState');
				errorControl.text(message);
				errorControl.removeClass('displayNone');
			} else {
				control.removeClass('invalidState');
				errorControl.text("");
				errorControl.addClass('displayNone');
			}
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
			this.$error = $('#error', this.$signup);
			
			this.$contact.off('focusout');
			this.$contact.on('focusout', function(){
				_self._setInputState(that.$contact, " ", 0, that.$error);
				if(that.$contact.val() === ''){
					_self._setInputState(that.$contact, "Contact cannot be empty.", 1, that.$error);
				}
			});
			
			this.$password.off('focusout');
			this.$password.on('focusout', function(){
				_self._setInputState(that.$password, " ", 0, that.$error);
				if(that.$password.val() === ''){
					_self._setInputState(that.$password, "Password cannot be empty.", 1, that.$error);
				}
			});
			
			this.$confirmPass.off('focusout');
			this.$confirmPass.on('focusout', function(){
				_self._setInputState(that.$confirmPass, " ", 0, that.$error);
				if(that.$confirmPass.val() === ''){
					_self._setInputState(that.$confirmPass, "Confirm password cannot be empty.", 1, that.$error);
				}
			});
			
			this.$error = $('#error', this.$signup).text('');
			this.$designation.off('focusout');
			this.$designation.on('focusout', function(){
				_self._setInputState(that.$designation, " ", 0, that.$error);
				if(that.$designation.val() === ''){
					_self._setInputState(that.$designation, "Designation cannot be empty.", 1, that.$error);
				}
			});
			
			this.$description.off('focusout');
			this.$description.on('focusout', function(){
				_self._setInputState(that.$description, " ", 0, that.$error);
				if(that.$description.val() === ''){
					_self._setInputState(that.$description, "Description cannot be empty.", 1, that.$error);
				}
			});
			
			this.$name.off('focusout');
			this.$name.on('focusout', function(){
				_self._setInputState(that.$name, " ", 0, that.$error);
				if(that.$name.val() === ''){
					_self._setInputState(that.$name, "Name cannot be empty.", 1, that.$error);
				}
			});
			
			this.$username.off('focusout');
			this.$username.on('focusout', function (event) {
				_self._setInputState(that.$username, " ", 0, that.$error);
				if(that.$username.val() === ''){
					_self._setInputState(that.$username, "Username cannot be empty.", 1, that.$error);
				} else {
					$.ajax({
						url : hostUrl + "/validate/username",
						type : 'POST',
						data : "username=" + that.$username.val(),
						processData : false,
						contentType : "application/x-www-form-urlencoded"
					}).done(function (data) {
						_self._setInputState(that.$username, "Username is already taken.", data, that.$error);
					});
				}
				event.preventDefault();
			});

			this.$email.off('focusout');
			this.$email.on('focusout', function (event) {
				_self._setInputState(that.$email, " ", 0, that.$error)
				if(that.$email.val() === ''){
					_self._setInputState(that.$email, "Email cannot be empty.", 1, that.$error);
				} else if (!_self.validateEmail(that.$email.val())) {
					_self._setInputState(that.$email, "Email is already taken.", 1, that.$error);
				} else {
					$.ajax({
						url : hostUrl + "/validate/email",
						type : 'POST',
						data : "email=" + that.$email.val(),
						processData : false,
						contentType : "application/x-www-form-urlencoded"
					}).done(function (data) {
						_self._setInputState(that.$email, "Invalid Email.", data, that.$error);
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
				if(that.$username.val() === '' || that.$email.val() === '' || that.$designation.val() === '' || that.$description.val() === '' || that.$name.val() === '' || that.$password.val() === '' || that.$confirmPass.val() === '' || that.$contact.val() === ''){
					_self._showAlert('All fields are mandatory.');
				} else if(that.$password.val() !== that.$confirmPass.val()){
					_self._showAlert('Password and confirm password needs to be same.');
				} else {
					_self.loading(true);
					var formData = new FormData(that.$frmSignup[0]);
					if (that.pic !== undefined) {
						formData.append('profilePic', that.pic);
					}
					
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
						_self._showAlert("Could not register user. Please contact your administrator.");
					});
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
		},
		
		_showAlert: function(message){
			navigator.notification.alert(message, null, 'Rate Me Pal', 'OK')
		},
		
		_showConfirm: function(message, confirmCallback){
			navigator.notification.confirm(message, confirmCallback, 'RateMePal', ['Yes','No'])
		}
	};

	controller.init();
	return controller;
};
