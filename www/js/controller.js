var controller = function () {
    //var hostUrl = "http://localhost:8080/RateMePalMidTier",
    var hostUrl = "http://vps.hilfe.website:8080/RateMePalMidTier",
    clientId = "rateMePal", cordova = false;

    var controller = {
        _self : null,
        init : function () {
            _self = this;
            _self.checkLogin();
            //_self.welcome();
            _self.skipNextClick = false;
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
                /*if (data.prevPage.length === 0) {
                    event.preventDefault();
                    _self.checkLogin();
                }*/
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
            
            $(document).delegate("#page-userProfile", "pagebeforeshow", function (event, data) {
                //_self.userProfile(event, data);
            });
            
            $(document).delegate("#page-resetPassword", "pagebeforeshow", function () {
                _self.resetPassword();
            });
            
            $(document).delegate("#page-bulletin", "pagebeforeshow", function () {
                _self.bulletin();
            });
            
            $(document).delegate("#page-rateUserProfile", "pagebeforeshow", function () {
                
            });
            
            $(document).delegate("#page-sendRatingRequest", "pagebeforeshow", function () {
                _self.sendRatingRequest();
            });
            
            $(document).delegate("#page-insta", "pagebeforeshow", function () {
                _self.insta();
            });
            
        },
        
        insta: function(){
            this.$instaPage = $('#page-insta');
            this.$btnLogout = $('#btnLogout', this.$instaPage);
            
            this.$btnLogout.off('click');
            this.$btnLogout.on('click', _self.logout);
        },
        
        bulletin: function(){
            this.$bulletinPage = $('#page-bulletin');
            this.$btnLogout = $('#btnLogout', this.$bulletinPage);
            
            this.$btnLogout.off('click');
            this.$btnLogout.on('click', _self.logout);
            
            _self._showPalRequest();
            _self._showRatingRequest();
        },
        
        _showRatingRequest: function(){
            var that = this;
            this.$bulletinPage = $('#page-bulletin');
            this.$RateReqRecList = $('#rateReqRecList',this.$bulletinPage);
            this.$RateReqSentList = $('#rateReqSentList',this.$bulletinPage);
            this.$RateReqRecList.empty();
            this.$RateReqSentList.empty();
            
            var objRateReqSent = {}, objRateReqRec = {};
            $.ajax({
                url : hostUrl.concat("/dataRequest/byMe?access_token=" + window.bearerToken),
                type : 'GET'
            }).done(function(data) {
                for(var i=0; i<data.length; i++){
                    var obj = data[i];
                    
                    if(obj.friendCreated === 0){
                        if(!objRateReqSent[obj.requestId]){
                            objRateReqSent[obj.requestId] = [];
                        }
                        objRateReqSent[obj.requestId].push(obj);
                    }
                }
                
                $.each(objRateReqSent, function(key, value){
                    //console.log( key + ": " + value );
                    that.$RateReqSentList.append("<li id='lstRateReqSent-"+value[0].requestId+"'><div class='UserProfileImg'><img id='imgRateReqDisp' data-inline='true' class='UserProfilePic' src='images/defaultImg.png'></div><div class='UserProfileName'><p class='UserName' id='txtName'>"+ value[0].friends[0].name +"</p><p class='UserDesignation' id='txtDesignation'>"+ value[0].friends[0].designation +"</p><div class='RatingBarBlock' id='RatingBarBlock'><div class='UserRatingBar'><div id='usrRateReqSent"+value[0].friends[0].username+"' class='userRating'></div></div></div></div></li>").listview('refresh');
                    
                    $("#lstRateReqSent-"+value[0].requestId).data(value);

                    if(value[0].friends[0].username.indexOf('fb') !==-1 || value[0].friends[0].username.indexOf('gl') !==-1){
                        $("#lstRateReqSent-"+value[0].requestId).find('#imgRateReqDisp').attr('src', hostUrl + "/profilePic/" + value[0].friends[0].username);
                    } else {
                        $.ajax({
                            url : hostUrl + "/profilePic/" + value[0].friends[0].username,
                            type : 'GET',
                            context : $("#lstRateReqSent-" + value[0].requestId),
                            async : true
                        }).done(function (dataURL) {
                            if (dataURL) {
                                $(this).find('#imgRateReqDisp').attr('src', 'data:image/png;base64,'+dataURL);
                            }
                        });
                    }
                    

                    var listParam = [];
                    for(var i=0; i<value.length; i++){
                        listParam.push(value[i].detailId);
                    }
                    
                    $.ajax({
                        url : hostUrl.concat("/rating/individualRating?access_token=" + window.bearerToken),
                        type : 'GET',
                        context : $("#lstRateReqSent-"+value[0].requestId),
                        data : {"detailIds":listParam.toString()}
                    }).done(function (data) {
                        var avgHomeRate = 0;
                        for(var i=0; i < data.length; i++){
                            avgHomeRate += data[i].rating;
                        }
                        avgHomeRate = avgHomeRate/data.length;
                        
                        this.find('.userRating').raty({score: avgHomeRate, readOnly: true});
                    });
                });
                
                that.$RateReqSentList.off('click');
                that.$RateReqSentList.on('click', 'li', {info:"rateByMe"}, _self._showRateUserProfile);
            });
            
            $.ajax({
                url : hostUrl.concat("/dataRequest/toMe?access_token=" + window.bearerToken),
                type : 'GET'
            }).done(function(data) {
                for(var i=0; i<data.length; i++){
                    var obj = data[i];
                    
                    if(obj.friendCreated === 0){
                        if(!objRateReqRec[obj.requestId]){
                            objRateReqRec[obj.requestId] = [];
                        }
                        objRateReqRec[obj.requestId].push(obj);
                    }
                }
                
                $.each(objRateReqRec, function(key, value){
                    //console.log( key + ": " + value );
                    that.$RateReqRecList.append("<li id='lstRateReqSent-"+value[0].requestId+"'><div class='UserProfileImg'><img id='imgRateRecDisp' data-inline='true' class='UserProfilePic' src='images/defaultImg.png'></div><div class='UserProfileName'><p class='UserName' id='txtName'>"+ value[0].friends[0].name +"</p><p class='UserDesignation' id='txtDesignation'>"+ value[0].friends[0].designation +"</p><div class='RatingBarBlock' id='RatingBarBlock'><div class='UserRatingBar'><div id='usrRateReqSent"+value[0].friends[0].username+"' class='userRating'></div></div></div></div></li>").listview('refresh');
                    
                    $("#lstRateReqSent-"+value[0].requestId).data(value);

                    if(value[0].friends[0].username.indexOf('fb') !==-1 || value[0].friends[0].username.indexOf('gl') !==-1){
                        $("#lstRateReqSent-"+value[0].requestId).find('#imgRateRecDisp').attr('src', hostUrl + "/profilePic/" + value[0].friends[0].username);
                    } else {
                        $.ajax({
                            url : hostUrl + "/profilePic/" + value[0].friends[0].username,
                            type : 'GET',
                            context : $("#lstRateReqSent-"+value[0].requestId),
                            async : true
                        }).done(function (dataURL) {
                            if (dataURL) {
                                $(this).find('#imgRateRecDisp').attr('src', 'data:image/png;base64,' + dataURL);
                            }
                        });
                    }
                    
                    var listParam = [];
                    for(var i=0; i<value.length; i++){
                        listParam.push(value[i].detailId);
                    }
                    
                    $.ajax({
                        url : hostUrl.concat("/rating/individualRating?access_token=" + window.bearerToken),
                        type : 'GET',
                        context : $("#lstRateReqSent-"+value[0].requestId),
                        data : {"detailIds":listParam.toString()}
                    }).done(function (data) {
                        var avgHomeRate = 0;
                        for(var i=0; i < data.length; i++){
                            avgHomeRate += data[i].rating;
                        }
                        avgHomeRate = avgHomeRate/data.length;
                        
                        this.find('.userRating').raty({score: avgHomeRate, readOnly: true});
                    });
                });
                
                that.$RateReqRecList.off('click');
                that.$RateReqRecList.on('click', 'li', {info:"rateToMe"}, _self._showRateUserProfile);
            });
            
        },
        
        _showRateUserProfile: function(event){
            var that = this;
            this.info = event.data.info;
            this.$rateUserProfile = $('#page-rateUserProfile');
            this.$txtRUName = $('#txtRUName', this.$rateUserProfile);
            this.$txtRUDesignation = $('#txtRUDesignation', this.$rateUserProfile);
            this.$txtRUDesc = $('#txtRUDesc', this.$rateUserProfile);
            
            this.$imgRateUHomeDisp = $('#imgRateUHomeDisp', this.$rateUserProfile);
            this.$rUserOverallRating = $('#rUserOverallRating', this.$rateUserProfile);
            this.$btnRateUSubmit = $('#btnRateUSubmit', this.$rateUserProfile).hide();
            this.$btnRateURateMe = $('#btnRateURateMe', this.$rateUserProfile).hide();
            
            this.$lstURatePersonal = $('#lstURatePersonal', this.$rateUserProfile);
            this.$lstURateProfessional = $('#lstURateProfessional', this.$rateUserProfile);
            
            var data = $(this).data();
            this.dataObj = data;
            
            this.$imgRateUHomeDisp.attr('src', 'images/defaultImg.png');
            this.$txtRUName.text(data[0].friends[0].name);
            this.$txtRUDesignation.text(data[0].friends[0].designation);
            this.$txtRUDesc.text(data[0].friends[0].description);
            
            if(data[0].friends[0].username.indexOf('fb') !==-1 || data[0].friends[0].username.indexOf('gl') !==-1){
                this.$imgRateUHomeDisp.attr('src', hostUrl + "/profilePic/" + data[0].friends[0].username);
            } else {
                $.ajax({
                url : hostUrl + "/profilePic/" + data[0].friends[0].username,
                type : 'GET',
                async : true
            }).done(function (dataURL) {
                if (dataURL) {
                    that.$imgRateUHomeDisp.attr('src', 'data:image/png;base64,' + dataURL);
                }
            });
            }
            
            
            var detailId = [];
            $.each(data, function(){
                detailId.push(this.detailId);
            });
            
            this.detailId = detailId;
            _self.loading(true);
            $.ajax({
                url : hostUrl.concat("/parameters/showUserParameters?access_token=" + window.bearerToken),
                type : 'GET',
                data : {'name': data[0].friends[0].username}
            }).done(function (data) {
                _self.loading(false);
                that.$lstURatePersonal.empty();
                that.$lstURateProfessional.empty();
                
                for(var i=0; i<data.length; i++){
                    if(data[i].type === "Personal"){
                        that.$lstURatePersonal.append('<li id="lstItemURatePersonal-'+ data[i].id +'"> <span class="skills">' + data[i].name + '</span> <span id="usrRating-'+ data[i].id +'" class="skillRating"> </span></li>').listview('refresh');
                        $("#lstItemURatePersonal-"+data[i].id).data(data[i]);
                    } else if(data[i].type === "Professional"){
                        that.$lstURateProfessional.append('<li id="lstItemURateProfessional-'+ data[i].id +'"> <span class="skills">' + data[i].name + '</span> <span id="usrRating-'+ data[i].id +'" class="skillRating"> </span></li>').listview('refresh');
                        $("#lstItemURateProfessional-"+data[i].id).data(data[i]);
                    }
                    
                    //if(that.info === "rateByMe"){
                    $('#usrRating-'+data[i].id).raty({score: 0, readOnly:true});
                    /*} else {
                        $('#usrRating-'+data[i].id).raty({score: 0});
                    }*/
                }   
                
                $.ajax({
                    url : hostUrl.concat("/rating/individualRating?access_token=" + window.bearerToken),
                    type : 'GET',
                    context : $("#lstRateReqSent-"+data[0].requestId),
                    data : {"detailIds": that.detailId.toString()}
                }).done(function (data) {
                    var avgHomeRate = 0;
                    for(var i=0; i < data.length; i++){
                        //if(that.info === "rateByMe"){
                        $('#usrRating-'+data[i].paramId).raty({score: data[i].rating, readOnly: true});
                        //} else {
                        //  $('#usrRating-'+data[i].paramId).raty({score: data[i].rating});
                        //}
                        
                        avgHomeRate += data[i].rating;
                    }
                    avgHomeRate = avgHomeRate/data.length;
                    
                    that.$rUserOverallRating.raty({score: avgHomeRate, readOnly: true});
                });
            });
            
            if(this.info === "rateToMe"){
                this.$btnRateURateMe.show();
            } else if(this.info === "rateByMe"){
                this.$btnRateURateMe.hide();
            }
            
            $.mobile.navigate('#page-rateUserProfile');
            
            this.$btnRateURateMe.off('click');
            this.$btnRateURateMe.on('click', function(event){
                that.$btnRateURateMe.hide();
                that.$btnRateUSubmit.show();

                _self.loading(true);
                $.ajax({
                    url : hostUrl.concat("/parameters/showUserParameters?access_token=" + window.bearerToken),
                    type : 'GET',
                    data : {'name': data[0].friends[0].username}
                }).done(function (data) {
                    
                    that.$lstURatePersonal.empty();
                    that.$lstURateProfessional.empty();
                    
                    for(var i=0; i<data.length; i++){
                        if(data[i].type === "Personal"){
                            that.$lstURatePersonal.append('<li id="lstItemURatePersonal-'+ data[i].id +'"> <span class="skills">' + data[i].name + '</span> <span id="usrRating-'+ data[i].id +'" class="skillRating"> </span></li>').listview('refresh');
                            $("#lstItemURatePersonal-"+data[i].id).data(data[i]);
                        } else if(data[i].type === "Professional"){
                            that.$lstURateProfessional.append('<li id="lstItemURateProfessional-'+ data[i].id +'"> <span class="skills">' + data[i].name + '</span> <span id="usrRating-'+ data[i].id +'" class="skillRating"> </span></li>').listview('refresh');
                            $("#lstItemURateProfessional-"+data[i].id).data(data[i]);
                        }
                        
                        if(that.info === "rateByMe"){
                            $('#usrRating-'+data[i].id).raty({score: 0, readOnly:true});
                        } else {
                            $('#usrRating-'+data[i].id).raty({score: 0});
                        }
                    }   
                    
                    _self.loading(false);
                    $.ajax({
                        url : hostUrl.concat("/rating/individualRating?access_token=" + window.bearerToken),
                        type : 'GET',
                        context : $("#lstRateReqSent-"+data[0].requestId),
                        data : {"detailIds": that.detailId.toString()}
                    }).done(function (data) {
                        var avgHomeRate = 0;
                        for(var i=0; i < data.length; i++){
                            /*if(that.info === "rateByMe"){
                                $('#usrRating-'+data[i].paramId).raty({score: data[i].rating, readOnly: true});
                            } else {
                                $('#usrRating-'+data[i].paramId).raty({score: data[i].rating});
                            }*/
                            
                            avgHomeRate += data[i].rating;
                        }
                        avgHomeRate = avgHomeRate/data.length;
                        
                        that.$rUserOverallRating.raty({score: avgHomeRate, readOnly: true});
                    });
                });

            });

            this.$btnRateUSubmit.off('click');
            this.$btnRateUSubmit.on('click', function(event){
                var data = that.dataObj, rateObj = "[";
                $.each(data, function(){
                    var detailId = this.detailId,
                        paramId = this.paramIds[0].id,
                        rating = $('#usrRating-'+paramId).find('input').val();
                    
                    if(!rating){
                        rating = 0;
                    }
                    rateObj = rateObj.concat("{\"detailId\":"+detailId+",\"paramId\":"+paramId+",\"rating\":"+rating+"},");
                });
                
                rateObj = rateObj.substring(0, rateObj.length-1) + "]";
                $.ajax({
                    url : hostUrl.concat("/rating?access_token=" + window.bearerToken),
                    type : 'POST',
                    beforeSend: function(req) {
                        req.setRequestHeader("Accept", "application/json; charset=UTF-8");
                    },
                    data : rateObj,
                    contentType : 'application/json; charset=UTF-8'
                }).done(function (data) {
                    //console.log(data);
                    $.mobile.navigate('#page-bulletin');
                });
            });
        },
        
        _showPalRequest: function(){
            var that = this;
            this.$bulletinPage = $('#page-bulletin');
            this.$PalReqRecList = $('#palReqRecList',this.$bulletinPage);
            this.$PalReqSentList = $('#palReqSentList',this.$bulletinPage);
            this.$PalReqRecList.empty();
            this.$PalReqSentList.empty();
            
            this.$btnFrdAccept = $('#btnFrdAccept', this.$bulletinPage);
            this.$btnFrdReject = $('#btnFrdAccept', this.$bulletinPage);
            
            $.ajax({
                url : hostUrl.concat("/friends/notInvited?access_token=" + window.bearerToken),
                type : 'GET'
            }).done(function(data) {
                for(var i=0; i<data.length; i++){
                    var obj = data[i];
                    if(obj.status === "4"){
                        that.$PalReqRecList.append("<li id='lstBullitenPalItem-"+i+"'><div class='UserProfileImg'><img id='imgPalReqDisp' data-inline='true' class='UserProfilePic' src='images/defaultImg.png'></div><div class='UserProfileName'><p class='UserName' id='txtName'>"+ obj.name +"</p><p class='UserDesignation' id='txtDesignation'>"+ obj.designation +"</p><div class='RatingBarBlock' id='RatingBarBlock'><div class='UserRatingBar'><div class='userRating' id='usrRate-"+obj.name+"'></div><div class='UserActionDic'><a id='btnFrdAccept' class='acceptReject acceptIcon'><span class='glyphicon glyphicon-thumbs-up' aria-hidden='true'></span> </a><a id='btnFrdReject' class='acceptReject rejectIcon'><span class='glyphicon glyphicon-thumbs-down' aria-hidden='true'></span> </a></div></div></div></div></li>").listview('refresh');
                    } else if(obj.status === "1"){
                        that.$PalReqSentList.append("<li id='lstBullitenPalItem-"+i+"'><div class='UserProfileImg'><img id='imgPalReqDisp' data-inline='true' class='UserProfilePic' src='images/defaultImg.png'></div><div class='UserProfileName'><p class='UserName' id='txtName'>"+ obj.name +"</p><p class='UserDesignation' id='txtDesignation'>"+ obj.designation +"</p><div class='RatingBarBlock' id='RatingBarBlock'><div class='UserRatingBar'><div class='userRating' id='usrRate-nonFrd"+i+"'></div><span class='requestSent'> Request Sent </span></div></div></div></li>").listview('refresh');
                    }
                    $('#lstBullitenPalItem-'+i).data(obj);

                    if(obj.username.indexOf('fb') !==-1 || obj.username.indexOf('gl') !==-1){
                        $('#lstBullitenPalItem-'+i).find('#imgPalReqDisp').attr('src', hostUrl + "/profilePic/" + obj.username);
                    } else {
                        $.ajax({
                            url : hostUrl + "/profilePic/" + obj.username,
                            type : 'GET',
                            context : $('#lstBullitenPalItem-'+i),
                            async : true
                        }).done(function (dataURL) {
                            if (dataURL) {
                                $(this).find('#imgPalReqDisp').attr('src', 'data:image/png;base64,' + dataURL);
                            }
                        });
                    }

                    _self._getAverageRating($('#lstBullitenPalItem-'+i), obj.username);
                }               
            });
            
            this.$PalReqSentList.off('click', 'li');
            this.$PalReqSentList.on('click', 'li', {from:'PalReqRecList'}, _self.showUserProfile);
            
            this.$PalReqRecList.off('click', 'li');
            this.$PalReqRecList.on('click', 'li', {from:'PalReqRecList'}, function(){
                var sId = event.target.parentElement.id, that = this;
                this.listItemData = $('#'+event.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.id).data();
                
                if(sId === "btnFrdAccept"){
                    $.ajax({
                        url : hostUrl.concat("/friends/updateStatus?access_token=" + window.bearerToken),
                        type : 'PUT',
                        data: {'friendUserName':that.listItemData.username, 'status':'2'}
                    }).done(function(data) {
                        _self._showPalRequest();
                        console.log(data);
                    });
                } else if(sId === "btnFrdReject"){
                    $.ajax({
                        url : hostUrl.concat("/friends/updateStatus?access_token=" + window.bearerToken),
                        type : 'PUT',
                        data: {'friendUserName':that.listItemData.username, 'status':'3'}
                    }).done(function(data) {
                        _self._showPalRequest();
                        console.log(data);
                    });
                } else {
                    
                }
            });
            
            
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
                if(!!event.currentTarget.value){
                    _self.loading(true);
                    $.ajax({
                        url : hostUrl.concat("/search/friends?access_token=" + window.bearerToken),
                        type : 'GET',
                        data : {'searchKey':event.currentTarget.value}
                    }).done(function(data) {
                        _self._showFriends(data);
                        _self.loading(false);                   
                    });
                }
            });
            
            this.$inpPeople.off('change');
            this.$inpPeople.on('change', function(event){
                if(!!event.currentTarget.value){
                    _self.loading(true);
                    $.ajax({
                        url : hostUrl.concat("/search/nonFriends?access_token=" + window.bearerToken),
                        type : 'GET',
                        data : {'searchKey':event.currentTarget.value}
                    }).done(function(data) {
                        _self._showNonFriends(data);    
                        _self.loading(false);
                    });
                }
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
            var count = 0;
            if(nonFrdsData.length > 0){
                for(var i=0;i<nonFrdsData.length;i++){
                    if(nonFrdsData[i].status === null || nonFrdsData[i].status === 3){
                        count++;
                        this.$peopleList.append("<li id='lstNonFrdItem-"+i+"'><div class='UserProfileImg'><img id='imgHomeDisp' data-inline='true' class='UserProfilePic' src='images/defaultImg.png'></div><div class='UserProfileName'><p class='UserName' id='txtName'>"+ nonFrdsData[i].name +"</p><p class='UserDesignation' id='txtDesignation'>"+ nonFrdsData[i].designation +"</p><div class='RatingBarBlock' id='RatingBarBlock'><div class='UserRatingBar'><div class='userRating' id='usrRate-nonFrd"+i+"'></div><span class='connect'> + Connect </span></div></div></div></li>").listview('refresh');
                        
                    } else if(nonFrdsData[i].status === "1"){
                        count++;
                        this.$peopleList.append("<li id='lstNonFrdItem-"+i+"'><div class='UserProfileImg'><img id='imgHomeDisp' data-inline='true' class='UserProfilePic' src='images/defaultImg.png'></div><div class='UserProfileName'><p class='UserName' id='txtName'>"+ nonFrdsData[i].name +"</p><p class='UserDesignation' id='txtDesignation'>"+ nonFrdsData[i].designation +"</p><div class='RatingBarBlock' id='RatingBarBlock'><div class='UserRatingBar'><div class='userRating' id='usrRate-nonFrd"+i+"'></div><span class='requestSent'> Request Sent </span></div></div></div></li>").listview('refresh');
                    }
                    $('#usrRate-nonFrd'+i).raty({readOnly: true, score: 0});
                    $('#lstNonFrdItem-'+i).data(nonFrdsData[i]);
                    
                    if(nonFrdsData[i].username.indexOf('fb') !==-1 || nonFrdsData[i].username.indexOf('gl') !==-1){
                        $('#lstNonFrdItem-'+i).find('#imgHomeDisp').attr('src', hostUrl + "/profilePic/" + nonFrdsData[i].username);
                    } else {
                        $.ajax({
                            url : hostUrl + "/profilePic/" + nonFrdsData[i].username,
                            type : 'GET',
                            context : $('#lstNonFrdItem-'+i),
                            async : true
                        }).done(function (dataURL) {
                            if (dataURL) {
                                $(this).find('#imgHomeDisp').attr('src', 'data:image/png;base64,' + dataURL);
                            }
                        });
                    }
                    
                    _self._getAverageRating($('#lstNonFrdItem-'+i), nonFrdsData[i].username);
                    
                }
                this.$peopleCount.text(count + " User Found");
                this.$peopleList.off('click', 'li');
                this.$peopleList.on('click', 'li', {fromPage:'nonFrds'}, _self.showUserProfile);
                
                this.$peopleList.off('click', 'li span.connect');
                this.$peopleList.on('click', 'li span.connect', function(event){
                    event.stopPropagation();
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
            var that = this;
            this.$friendsPage = $('#page-friends');
            this.$friendsList = $('#friendsList',this.$friendsPage);
            this.$friendsCount = $('#friendsCount',this.$friendsPage);
            this.$friendsList.empty();
            $('#sendRatingDiv', this.$friendsPage).addClass('display-none');
            if(frdsData.length > 0){
                this.$friendsCount.text("You have " + frdsData.length + " Pals");
                for(var i=0;i<frdsData.length;i++){
                    this.$friendsList.append("<li id='lstFrdItem-"+i+"'><input id='chkFriend' name='checkbox' class='chkFriend display-none' type='checkbox' value='false'/><div class='UserProfileImg'><img id='imgHomeDisp' data-inline='true' class='UserProfilePic' src='images/defaultImg.png'></div><div class='UserProfileName'><p class='UserName' id='txtName'>"+ frdsData[i].name +"</p><p class='UserDesignation' id='txtDesignation'>"+ frdsData[i].designation +"</p><div class='RatingBarBlock' id='RatingBarBlock'><div class='UserRatingBar'><div id='usrRate-frd"+i+"' class='userRating'></div></div></div></div></li>").listview('refresh');
                    
                    $('#lstFrdItem-'+i).data(frdsData[i]);
                    $('#usrRate-frd'+i).raty({readOnly: true, score: 0});
                    
                    if(frdsData[i].username.indexOf('fb') !==-1 || frdsData[i].username.indexOf('gl') !==-1){
                        $('#lstFrdItem-'+i).find('#imgHomeDisp').attr('src', hostUrl + "/profilePic/" + frdsData[i].username);
                    } else {
                        $.ajax({
                            url : hostUrl + "/profilePic/" + frdsData[i].username,
                            type : 'GET',
                            context : $('#lstFrdItem-'+i),
                            async : true
                        }).done(function (dataURL) {
                            if (dataURL) {
                                $(this).find('#imgHomeDisp').attr('src', 'data:image/png;base64,' + dataURL);
                            }
                        });
                    }
                    
                    _self._getAverageRating($('#lstFrdItem-'+i), frdsData[i].username);
                }
                $('#chkSelectall').prop('checked', false).checkboxradio("refresh");
                this.$friendsList.off('click taphold', 'li');
                this.$friendsList.on('click taphold', 'li', {fromPage: 'frds'}, _self.showUserProfile);
                
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
        
        showUserProfile: function(event){
            var data = $(this).data(), that = this,
            fromPage = event.data.fromPage;
            this.$friendsPage = $('#page-friends');
            this.$friendsList = $('#friendsList',this.$friendsPage);
            
            var isClick = (event.type == 'click');

            if (isClick && !_self.skipNextClick) {
                //run your code for normal click events here...
                if($(event.target).is('input')){
                    var target = $(event.target);
                    if(target.val() === 'false'){
                        $('#chkSelectall').prop('checked', false).checkboxradio("refresh");
                        target.val('true');
                    } else {
                        target.val('false');
                    }
                    
                    var allChk = true;
                    that.$friendsList.find('li').each(function(){
                        if($(this).find('input').val() === 'false'){
                            allChk = false;
                            return false;
                        }
                    });
                    $('#chkSelectall').prop('checked', false).checkboxradio("refresh");
                    if(allChk){
                        $('#chkSelectall').prop('checked', true).checkboxradio("refresh");
                    }
                    
                    return;
                }
                $.mobile.navigate('#page-userProfile');
            
                this.$userProfilePage = $('#page-userProfile');
                this.$imgUHomeDisp = $('#imgUHomeDisp', this.$userProfilePage);
                this.$txtUName = $('#txtUName', this.$userProfilePage);
                this.$txtUDesignation = $('#txtUDesignation', this.$userProfilePage);
                this.$txtUDesc = $('#txtUDesc', this.$userProfilePage);
                this.$rateByCountAvg = $('#rateByCountAvg', this.$userProfilePage);
                this.$userOverallRating = $('#userOverallRating', this.$userProfilePage);
                
                this.$lstUPersonal = $('#lstUPersonal', this.$userProfilePage);
                this.$lstUProfessional = $('#lstUProfessional', this.$userProfilePage);
                
                this.$imgUHomeDisp.attr('src', 'images/defaultImg.png');
                this.$txtUName.text(data.name);
                this.$txtUDesignation.text(data.designation);
                this.$txtUDesc.text(data.description);
                this.$userOverallRating.raty({readOnly: true, score: 0});
                
                this.$connect = $('#connect', this.$userProfilePage).hide();
                this.$requestSent = $('#requestSent', this.$userProfilePage).hide();
                this.$btnRateMe = $('#btnRateMe', this.$userProfilePage).hide();
                this.$btnRateSubmit = $('#btnRateSubmit', this.$userProfilePage).hide();
                
                if(fromPage === "nonFrds"){
                    if(data.status === null){
                        this.$connect.show();
                    } else if(data.status === '1'){
                        this.$requestSent.show();
                    }
                } else if(fromPage === "frds"){
                    this.$btnRateMe.show();
                }
                
                if(data.username.indexOf('fb') !==-1 || data.username.indexOf('gl') !==-1){
                    this.$imgUHomeDisp.attr('src', hostUrl + "/profilePic/" + data.username);
                } else {
                    $.ajax({
                        url : hostUrl + "/profilePic/" + data.username,
                        type : 'GET',
                        async : true
                    }).done(function (dataURL) {
                        if (dataURL) {
                            that.$imgUHomeDisp.attr('src', 'data:image/png;base64,' + dataURL);
                        }
                    });
                }
                            
                this.$connect.off('click');
                this.$connect.on('click', function(){
                    $.ajax({
                        url : hostUrl.concat("/friends?access_token=" + window.bearerToken),
                        type : 'POST',
                        data : {'friendUserName': data.username}
                    }).done(function(data) {
                        console.log('Friends status updated.');
                        that.$connect.hide();
                        that.$requestSent.show();
                    });
                });
                
                _self.loading(true);
                $.ajax({
                    url : hostUrl.concat("/parameters/showUserParameters?access_token=" + window.bearerToken),
                    type : 'GET',
                    data : {'name': data.username}
                }).done(function (data) {
                    
                    that.$lstUPersonal.empty();
                    that.$lstUProfessional.empty();
                    var lstParaId = [];
                    for(var i=0; i<data.length; i++){
                        if(data[i].type === "Personal"){
                            that.$lstUPersonal.append('<li id="lstItemUPersonal-'+ data[i].id +'"> <span class="skills">' + data[i].name + '</span> <span id="usrRate-'+ data[i].id +'" class="skillRating"> </span><span id="rateByCount-'+ data[i].id +'" class="rateByCount"></span></li>').listview('refresh');
                            $("#lstItemUPersonal-"+data[i].id).data(data[i]);
                        } else if(data[i].type === "Professional"){
                            that.$lstUProfessional.append('<li id="lstItemUProfessional-'+ data[i].id +'"> <span class="skills">' + data[i].name + '</span> <span id="usrRate-'+ data[i].id +'" class="skillRating"> </span><span id="rateByCount-'+ data[i].id +'" class="rateByCount"></span></li>').listview('refresh');
                            $("#lstItemUProfessional-"+data[i].id).data(data[i]);
                        }
                        $('#usrRate-'+data[i].id).raty({score: 0, readOnly:true});
                        lstParaId.push(data[i].id);
                    }
                    
                    _self.loading(false);
                    $.ajax({
                        url : hostUrl.concat("/rating/averageForParams?access_token=" + window.bearerToken),
                        type : 'GET',
                        data : {"paramIds":lstParaId.toString()}
                    }).done(function (data) {
                        var avgHomeRate = 0, avgCount = 0;
                        for(var i=0; i < data.length; i++){
                            $('#usrRate-'+data[i].paramId, that.$userProfilePage).raty({score: data[i].rating, readOnly:true});
                            $('#rateByCount-'+data[i].paramId, that.$userProfilePage).text('(' + data[i].count + ' ratings)');
                            avgHomeRate += data[i].rating;
                            avgCount += data[i].count;
                        }
                        avgHomeRate = avgHomeRate/data.length;
                        if(avgCount !== 0){
                            avgCount = Math.round(avgCount/data.length);
                        }
                        
                        that.$userOverallRating.raty({score: avgHomeRate, readOnly: true});
                        that.$rateByCountAvg.text('('+ avgCount + ' ratings)');
                    });
                    
                    
                });
                
                this.$btnRateMe.off('click');
                this.$btnRateMe.on('click', function(){
                    that.$btnRateMe.hide();
                    that.$btnRateSubmit.show();

                    _self.loading(true);
                    $.ajax({
                        url : hostUrl.concat("/parameters/showUserParameters?access_token=" + window.bearerToken),
                        type : 'GET',
                        data : {'name': data.username}
                    }).done(function (data) {
                        that.$lstUPersonal.empty();
                        that.$lstUProfessional.empty();
                        var lstParaId = [];
                        for(var i=0; i<data.length; i++){
                            if(data[i].type === "Personal"){
                                that.$lstUPersonal.append('<li id="lstItemUPersonal-'+ data[i].id +'"> <span class="skills">' + data[i].name + '</span> <span id="usrRate-'+ data[i].id +'" class="skillRating"> </span></li>').listview('refresh');
                                $("#lstItemUPersonal-"+data[i].id).data(data[i]);
                            } else if(data[i].type === "Professional"){
                                that.$lstUProfessional.append('<li id="lstItemUProfessional-'+ data[i].id +'"> <span class="skills">' + data[i].name + '</span> <span id="usrRate-'+ data[i].id +'" class="skillRating"> </span></li>').listview('refresh');
                                $("#lstItemUProfessional-"+data[i].id).data(data[i]);
                            }
                            $('#usrRate-'+data[i].id).raty({score: 0});
                            lstParaId.push(data[i].id);
                        }
                        _self.loading(false);
                        $.ajax({
                            url : hostUrl.concat("/rating/averageForParams?access_token=" + window.bearerToken),
                            type : 'GET',
                            data : {"paramIds":lstParaId.toString()}
                        }).done(function (data) {
                            var avgHomeRate = 0, avgCount = 0;
                            for(var i=0; i < data.length; i++){
                                $('#rateByCount-'+data[i].paramId, that.$userProfilePage).text('(' + data[i].count + ' ratings)');
                                avgHomeRate += data[i].rating;
                                avgCount += data[i].count;
                            }
                            avgHomeRate = avgHomeRate/data.length;
                            if(avgCount !== 0){
                                avgCount = Math.round(avgCount/data.length);
                            }
                            
                            that.$userOverallRating.raty({score: avgHomeRate, readOnly: true});
                            //that.$rateByCountAvg.text('('+ avgCount + ' ratings)');
                        });
                        
                        
                    });
                });

                this.$btnRateSubmit.off('click');
                this.$btnRateSubmit.on('click', function(){
                    _self.loading(true);
                    var paraIds = "";
                    that.$lstUPersonal.find('li').each(function(){
                        var data = $(this).data();
                        paraIds = paraIds.concat("{\"id\":"+data.id+"}"+ ',');
                    });
                    that.$lstUProfessional.find('li').each(function(){
                        var data = $(this).data();
                        paraIds = paraIds.concat("{\"id\":"+data.id+"}"+ ',');
                    });
                    
                    var reqObj = "{\"requestName\":\"FriendRated\",\"friendCreated\":1,\"paramIds\":["+paraIds.substring(0, paraIds.length-1)+"],\"friends\":[{\"username\":\""+_self.userLogin+"\"}]}";
                    $.ajax({
                        url : hostUrl.concat("/dataRequest?access_token=" + window.bearerToken),
                        type : 'POST',
                        beforeSend: function(req) {
                            req.setRequestHeader("Accept", "application/json; charset=UTF-8");
                        },
                        data: reqObj,
                        contentType : 'application/json; charset=UTF-8'
                    }).done(function (data) {
                        var rateObj = "[";
                        console.log("Data Request Send.");
                        for(var i=0; i<data.length; i++){
                            var detailId = data[i].detailId,
                                paramId = data[i].paramIds[0].id,
                                rating = $('#usrRate-'+paramId).find('input').val();
                            
                            if(!rating){
                                rating = 0;
                            }
                            rateObj = rateObj.concat("{\"detailId\":"+detailId+",\"paramId\":"+paramId+",\"rating\":"+rating+"},");
                        }
                        rateObj = rateObj.substring(0, rateObj.length-1) + "]";
                        $.ajax({
                            url : hostUrl.concat("/rating?access_token=" + window.bearerToken),
                            type : 'POST',
                            beforeSend: function(req) {
                                req.setRequestHeader("Accept", "application/json; charset=UTF-8");
                            },
                            data : rateObj,
                            contentType : 'application/json; charset=UTF-8'
                        }).done(function (data) {
                            _self.loading(false);
                            //console.log(data);
                            $.mobile.navigate('#page-friends');
                        });
                    });
                });
            }
            else if (isClick && _self.skipNextClick) {
                //this is where skipped click events will end up...

                //we need to reset our skipNextClick flag here,
                //this way, our next click will not be ignored
                _self.skipNextClick = false;
            }
            else {
                //taphold event

                //to ignore the click event that fires when you release your taphold,
                //we set the skipNextClick flag to true here.
                _self.skipNextClick = false;
                this.$friendsList.find('li').each(function(){
                    $(this).find('input').removeClass('display-none');
                });
                $('#sendRatingDiv', this.$friendsPage).removeClass('display-none');
                this.$chkSelectall = $('#chkSelectall', this.$friendsPage);
                this.$btnReset = $('#btnReset', this.$friendsPage);
                this.$btnSendRatingRequest = $('#btnSendRatingRequest', this.$friendsPage);
                
                this.$chkSelectall.on('click', function(event){
                    that.$friendsList.find('li').each(function(){
                        if($(this).find('input').val() === "false"){
                            $(this).find('input').val(true);
                            $(this).find('input').prop('checked', true);
                        } else {
                            $(this).find('input').val(false);
                            $(this).find('input').prop('checked', false);
                        }
                    });
                });
                
                /*this.$btnReset.on('click', function(event){
                    that.$friendsList.find('li').each(function(){
                        if($(this).find('input').val() === "true"){
                            $('#chkSelectall').prop('checked', false).checkboxradio("refresh");
                            $(this).find('input').val(false);
                            $(this).find('input').prop('checked', false);
                        }
                    });
                });*/
                
                this.$btnSendRatingRequest.on('click', function(event){
                    $.mobile.navigate('#page-sendRatingRequest');
                });
                //run your code for taphold events here...

            }
        },
        
        _getAverageRating: function(context, username){
            $.ajax({
                url : hostUrl.concat("/parameters/showUserParameters?access_token=" + window.bearerToken),
                type : 'GET',
                context : context,
                data : {'name': username}
            }).done(function (data) {
                if(data.length > 0){
                    var lstParamIds = [];
                    for(var i=0; i<data.length; i++){
                        lstParamIds.push(data[i].id);
                    }
                    $.ajax({
                        url : hostUrl.concat("/rating/averageForParams?access_token=" + window.bearerToken),
                        type : 'GET',
                        context : this,
                        data : {"paramIds":lstParamIds.toString()}
                    }).done(function (data) {
                        var avgHomeRate = 0;
                        for(var i=0; i < data.length; i++){
                            //$('#usrHomeRate-'+data[i].paramId).raty({score: data[i].rating});
                            avgHomeRate += data[i].rating;
                        }
                        avgHomeRate = avgHomeRate/data.length;
                        
                        this.find('.userRating').raty({score: avgHomeRate, readOnly: true});
                    });
                }
                
            });
        },
        
        sendRatingRequest: function(){
            var that = this;
            this.$sendRatingRequest = $('#page-sendRatingRequest');
            this.$lstSelectParameter = $('#lstSelectParameter', this.$sendRatingRequest);
            this.$chkSendRatingSelectall = $('#chkSendRatingSelectall', this.$sendRatingRequest);
            this.$btnSendRatingReq = $('#btnSendRatingReq', this.$sendRatingRequest);
            
            this.$friendsPage = $('#page-friends');
            this.$friendsList = $('#friendsList',this.$friendsPage);
            
            _self.loading(true);
            $.ajax({
                url : hostUrl.concat("/parameters?access_token=" + window.bearerToken),
                type : 'GET'
            }).done(function (data) {
                that.$lstSelectParameter.empty();
                for(var i=0; i < data.length; i++){
                    that.$lstSelectParameter.append('<li id="lstSelPersonal-'+ data[i].id +'"> <input type="checkbox" value="false" > <span class="skills">' + data[i].name + '</span> </span></li>').listview('refresh');
                    
                    $('#lstSelPersonal-'+data[i].id).data(data[i]);
                }
                _self.loading(false);
            });
            
            this.$lstSelectParameter.off('click', 'li');
            this.$lstSelectParameter.on('click', 'li', function(event){
                var target = $(this).find('input');
                if(target.val() === 'false'){
                    that.$chkSendRatingSelectall.prop('checked', false).checkboxradio("refresh");
                    target.val('true');
                    //target.prop('checked', true).checkboxradio("refresh");
                } else {
                    target.val('false');
                    //target.prop('checked', false).checkboxradio("refresh");
                }
                
                var allChk = true;
                that.$lstSelectParameter.find('li').each(function(){
                    if($(this).find('input').val() === 'false'){
                        allChk = false;
                        return false;
                    }
                });
                that.$chkSendRatingSelectall.prop('checked', false).checkboxradio("refresh");
                if(allChk){
                    that.$chkSendRatingSelectall.prop('checked', true).checkboxradio("refresh");
                }
            });
            
            this.$chkSendRatingSelectall.off('click');
            this.$chkSendRatingSelectall.on('click', function(){
                that.$lstSelectParameter.find('li').each(function(){
                    if($(this).find('input').val() === "false"){
                        $(this).find('input').val(true);
                        $(this).find('input').prop('checked', true);
                    } else {
                        $(this).find('input').val(false);
                        $(this).find('input').prop('checked', false);
                    }
                });
            });
            
            this.$btnSendRatingReq.off('click');
            this.$btnSendRatingReq.on('click', function(event){
                var paraIds = "", frdsUsername = "";
                that.$lstSelectParameter.find('li').each(function(){
                    if($(this).find('input').val() === 'true'){
                        var data = $(this).data();
                        paraIds = paraIds.concat("{\"id\":"+data.id+"}"+ ',');
                    }
                });
                
                that.$friendsList.find('li').each(function(){
                    if($(this).find('input').val() === 'true'){
                        var data = $(this).data();
                        frdsUsername = frdsUsername.concat("{\"username\":\""+data.username+"\"}"+ ',');
                    }
                });
                
                var reqObj = "{\"requestName\":\"SendFriendReq\",\"friendCreated\":0,\"paramIds\":["+paraIds.substring(0, paraIds.length-1)+"],\"friends\":["+frdsUsername.substring(0,frdsUsername.length-1)+"]}";
                $.ajax({
                    url : hostUrl.concat("/dataRequest?access_token=" + window.bearerToken),
                    type : 'POST',
                    beforeSend: function(req) {
                        req.setRequestHeader("Accept", "application/json; charset=UTF-8");
                    },
                    data: reqObj,
                    contentType : 'application/json; charset=UTF-8'
                }).done(function (data) {
                    console.log("Data Request Send.");
                    $.mobile.navigate('#page-friends');
                });
            });
        },
                
        home : function () {
            _self.loading(false);
            var that = this;
                        
            this.$homePage = $('#page-home');
            this.$btnLogout = $('#btnLogout', this.$homePage);
            this.$btnHome = $('#btnHome', this.$homePage);
                        
            this.$imgUHomeDisp = $('#imgUHomeDisp', this.$homePage);
            this.$imgUHomeDisp.attr('src','./images/defaultImg.png');

            this.$txtUName = $('#txtUName', this.$homePage);
            this.$txtUDesignation = $('#txtUDesignation', this.$homePage);
            this.$txtUDesc = $('#txtUDesc', this.$homePage);
            this.$userHomeAvgRate = $('#userHomeAvgRate',this.$homePage);
            this.$rateByCountAvg = $('#rateByCountAvg',this.$homePage);
            
            this.$lstPersonal = $('#lstPersonal', this.$homePage);
            this.$lstProfessional = $('#lstProfessional', this.$homePage);
            
            this.$btnLogout.off('click');
            this.$btnLogout.on('click', _self.logout);
            
            if(_self.pushNotification){
                _self.pushNotification.setTags({"username":_self.userLogin},
                    function(status) {
                        console.warn('setTags success');
                    },
                    function(status) {
                        console.warn('setTags failed');
                    }
                );  
            }
            
            _self.loading(true);
            $.ajax({
                url : hostUrl.concat("/resources/fetch?access_token=" + window.bearerToken),
                type : 'GET'
            }).done(function(data) {
                that.$txtUName.text(data.name);
                that.$txtUDesignation.text(data.designation);
                that.$txtUDesc.text(data.description);
                that.$userHomeAvgRate.raty({readOnly: true, score: 0});

                if(data.username.indexOf('fb') !==-1 || data.username.indexOf('gl') !==-1){
                    that.$imgUHomeDisp.attr('src', hostUrl + "/profilePic/" + data.username);
                } else {
                    $.ajax(   {
                        url : hostUrl + "/profilePic/" + data.username,
                        type : 'GET',
                        async : true
                    }).done(function (dataURL) {
                        if (dataURL) {
                            that.$imgUHomeDisp.attr('src', 'data:image/png;base64,' + dataURL);
                        }
                    });
                }
                
                _self.loading(false);
            });
            
            this.$lstPersonal.empty();
            this.$lstProfessional.empty();
            
            $.ajax({
                url : hostUrl.concat("/parameters?access_token=" + window.bearerToken),
                type : 'GET'
            }).done(function (data) {
                var lstParaId = [];
                for(var i=0; i < data.length; i++){
                    if(data[i].type === "Personal"){
                        that.$lstPersonal.append('<li id="lstItemPersonal-'+ data[i].id +'"> <span class="skills">' + data[i].name + '</span> <span id="usrHomeRate-'+ data[i].id +'" class="skillRating"> </span><span id="rateByCountHome-'+ data[i].id +'" class="rateByCount"></span></li>').listview('refresh');
                    } else if(data[i].type === "Professional"){
                        that.$lstProfessional.append('<li id="lstItemProfessional-'+ data[i].id +'"> <span class="skills">' + data[i].name + '</span> <span id="usrHomeRate-'+ data[i].id +'" class="skillRating"> </span><span id="rateByCountHome-'+ data[i].id +'" class="rateByCount"></span></li>').listview('refresh');
                    }
                    $('#usrHomeRate-'+data[i].id).raty({readOnly: true, score: 0});
                    $('#rateByCountHome-'+data[i].id).text('(0 ratings)');
                    lstParaId.push(data[i].id);
                }
                
                $.ajax({
                    url : hostUrl.concat("/rating/averageForParams?access_token=" + window.bearerToken),
                    type : 'GET',
                    data : {"paramIds":lstParaId.toString()}
                }).done(function (data) {
                    var avgHomeRate = 0, avgCount = 0;
                    
                    for(var i=0; i < data.length; i++){
                        $('#usrHomeRate-'+data[i].paramId).raty({score: data[i].rating, readOnly: true});
                        $('#rateByCountHome-'+data[i].paramId).text('(' + data[i].count + ' ratings)');
                        avgHomeRate += data[i].rating;
                        avgCount += data[i].count;
                    }
                    avgHomeRate = avgHomeRate/data.length;
                    if(avgCount !== 0){
                        avgCount = Math.round(avgCount/data.length);
                    }
                                        
                    that.$userHomeAvgRate.raty({score: avgHomeRate, readOnly: true});
                    that.$rateByCountAvg.text('('+avgCount + ' ratings)');
                });
            });
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
                            that.$customPersonalList.append('<li id="lstItemPersonal-'+ data[i].name.replace(/\s/g, '') +'"> <span class="skills">' + data[i].name + '</span> <span class="skillRating"> <span aria-hidden="true" class="glyphicon glyphicon-minus-sign"></span> </span></li>').listview('refresh');
                        } else if(data[i].type === "Professional"){
                            that.$customProfessionalList.append('<li id="lstItemProfessional-'+ data[i].name.replace(/\s/g, '') +'"> <span class="skills">' + data[i].name + '</span> <span class="skillRating"> <span aria-hidden="true" class="glyphicon glyphicon-minus-sign"></span> </span></li>').listview('refresh');
                        }
                    }
                }
                _self.loading(false);
                parameterArr = data;
            });
            
            function removePara(paraId){
                for(var i=0; i < parameterArr.length; i++){
                    if(paraId === "lstItemPersonal-"+parameterArr[i].name.replace(/\s/g, '') || paraId === "lstItemProfessional-"+parameterArr[i].name.replace(/\s/g, '')){
                        rmParameterArr.push(parameterArr[i]);
                        break;
                    }
                }
                for(var i=0; i < addParameterArr.length; i++){
                    if(paraId === addParameterArr[i].name.replace(/\s/g, '')){
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
                            addParameterArr.push({"id":"lstItemProfessional-"+inpParaName.replace(/\s/g, ''), "type":"2", "name":inpParaName});
                            that.$customProfessionalList.append('<li id="lstItemProfessional-'+ inpParaName.replace(/\s/g, '') +'"> <span class="skills">' + that.$inpParameterName.val() + '</span> <span class="skillRating"> <span aria-hidden="true" class="glyphicon glyphicon-minus-sign"></span> </span></li>').listview('refresh');
                        } else {
                            addParameterArr.push({"id":"lstItemPersonal-"+inpParaName.replace(/\s/g, ''), "type":"1", "name":inpParaName});
                            that.$customPersonalList.append('<li id="lstItemPersonal-'+ inpParaName.replace(/\s/g, '') +'"> <span class="skills">' + inpParaName + '</span> <span class="skillRating"> <span aria-hidden="true" class="glyphicon glyphicon-minus-sign"></span> </span></li>').listview('refresh');
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
        
        arrayContains: function(val, arr){
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].name === val) {
                    return true;
                }
            }
            return false;
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
                    _self._showAlert("New password and confirm password must match!");
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
            
            if(_self.pushNotification){
                _self.pushNotification.setTags({"username":null},
                    function(status) {
                        console.warn('setTags success');
                        _self.pushNotification.unregisterDevice(
                            function(status) {
                                var pushToken = status;
                                console.warn('push token: ' + pushToken);
                                
                            },
                            function(status) {
                                console.warn(JSON.stringify(['failed to register ', status]));
                            }
                        );
                    },
                    function(status) {
                        console.warn('setTags failed');
                    }
                );
            }
            
            
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
            _self.initPushwoosh();
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
                $.ajax({
                    url : hostUrl.concat("/resources/fetch?access_token=" + window.bearerToken),
                    type : 'GET'
                }).done(function(data) {
                    _self.userLogin = data.username;
                });
                $.mobile.navigate('#page-home');
                window.localStorage.rmp_lobin_by = loginBy;
                if(_self.pushNotification){
                    _self.pushNotification.registerDevice(
                        function(status) {
                            var pushToken = status;
                            _self.pushNotification.setTags({"username":_self.userLogin},
                                function(status) {
                                    console.warn('setTags success');
                                },
                                function(status) {
                                    console.warn('setTags failed');
                                }
                            );
                            console.warn('push token: ' + pushToken);
                        },
                        function(status) {
                            console.warn(JSON.stringify(['failed to register ', status]));
                        }
                    );
                }
                            
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
            console.log("Inside onLoginclick");
            var that = this;
            _self.loading(true);
            function loginSuccess() {
                console.log("Inside login success");
                _self.isResetPasswordRequired();
                _self.userLogin = that.$username.val();
                window.localStorage.rmp_lobin_by = "normal";
                if(_self.pushNotification){
                    _self.pushNotification.registerDevice(
                        function(status) {
                            var pushToken = status;
                            _self.pushNotification.setTags({"username":_self.userLogin},
                                function(status) {
                                    console.warn('setTags success');
                                },
                                function(status) {
                                    console.warn('setTags failed');
                                }
                            );
                            console.warn('push token: ' + pushToken);
                        },
                        function(status) {
                            console.warn(JSON.stringify(['failed to register ', status]));
                        }
                    );
                }               
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
                if(_self.pushNotification){
                    _self.pushNotification.registerDevice(
                        function(status) {
                            var pushToken = status;
                            console.warn('push token: ' + pushToken);
                            _self.pushNotification.setTags({"username":_self.userLogin},
                                function(status) {
                                    console.warn('setTags success');
                                },
                                function(status) {
                                    console.warn('setTags failed');
                                }
                            );
                        },
                        function(status) {
                            console.warn(JSON.stringify(['failed to register ', status]));
                        }
                    );
                }
                
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
            
            if(social === 'fb'){
                $.ajax({
                    url: "https://graph.facebook.com/"+data.id+"/picture?redirect=false&type=large",
                    type: 'GET'
                }).done(function(data){
                    var image = new Image();
                    image.setAttribute('crossOrigin', 'anonymous');
                    image.onload = function () {
                        var canvas = document.createElement('canvas');
                        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
                        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

                        canvas.getContext('2d').drawImage(this, 0, 0);
                        that.profilePic = canvas.toDataURL('image/png');
                        
                        if(that.data.email){
                            formData.append('name', that.data.name);
                            formData.append('email', that.data.email+'_'+new Date().getTime());
                            if(that.social === 'fb'){
                                formData.append('username', 'fb_'+that.data.email);
                                formData.append('password','fbUser');
                            } else if(that.social === 'gl'){
                                formData.append('username', 'gl_'+that.data.email);
                                formData.append('password','glUser');
                            }
                            formData.append('designation', '');
                            formData.append('description', '');
                            formData.append('visible', '1');
                            formData.append('contact', '');
                            if(that.profilePic !== null){
                                formData.append('profilePic', _self.dataURItoBlob(that.profilePic));
                            }
                            
                            $.ajax({
                                url : hostUrl + "/resources",
                                type : 'POST',
                                data : formData,
                                processData : false,
                                contentType : false
                            }).done(function (data) {
                                _self.processSocialLogin(that.data, that.social);
                            }).fail(function (jqXHR, textStatus, errorThrown) {
                                _self.loading("hide");
                            });
                        } else {
                            _self._showAlert('App is not able to fetch your details. Please check your account settings.');
                        }
                        
                    };

                    image.src = data.data.url;
                });
            } else {
                if(that.data.email){
                    formData.append('name', that.data.name);
                    formData.append('email', that.data.email+'_'+new Date().getTime());
                    if(that.social === 'fb'){
                        formData.append('username', 'fb_'+that.data.email);
                        formData.append('password','fbUser');
                    } else if(that.social === 'gl'){
                        formData.append('username', 'gl_'+that.data.email);
                        formData.append('password','glUser');
                    }
                    formData.append('designation', '');
                    formData.append('description', '');
                    formData.append('visible', '1');
                    formData.append('contact', '');
                    if(that.profilePic !== null){
                        formData.append('profilePic', _self.dataURItoBlob(that.profilePic));
                    }
                    
                    $.ajax({
                        url : hostUrl + "/resources",
                        type : 'POST',
                        data : formData,
                        processData : false,
                        contentType : false
                    }).done(function (data) {
                        _self.processSocialLogin(that.data, that.social);
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        _self.loading("hide");
                    });
                } else {
                    _self._showAlert('App is not able to fetch your details. Please check your account settings.');
                }
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
                    sourceType : navigator.camera.PictureSourceType.PHOTOLIBRARY,
                    allowEdit: true,
                    targetWidth: 250,
                    targetHeight: 250
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
                    _self._showAlert('Password and confirm password must match!');
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
        },
        
        initPushwoosh: function(){
            console.log("Inside initPushwoosh");
            if(cordova){
                var pushNotification = cordova.require("com.pushwoosh.plugins.pushwoosh.PushNotification");
                _self.pushNotification = pushNotification;
                //set push notifications handler
                document.addEventListener('push-notification', function(event) {
                    var title = event.notification.title;
                    var userData = event.notification.userdata;
                                             
                    if(typeof(userData) != "undefined") {
                        console.warn('user data: ' + JSON.stringify(userData));
                    }
                                                 
                    console.log(event.notification);
                });
             
                //initialize Pushwoosh with projectid: "GOOGLE_PROJECT_NUMBER", pw_appid : "PUSHWOOSH_APP_ID". This will trigger all pending push notifications on start.
                pushNotification.onDeviceReady({ projectid: "192806734171", pw_appid : "79F49-2DEB6"});
             
                //register for pushes
                /*pushNotification.registerDevice(
                    function(status) {
                        var pushToken = status;
                        console.warn('push token: ' + pushToken);
                    },
                    function(status) {
                        console.warn(JSON.stringify(['failed to register ', status]));
                    }
                );*/
            }
            
        }
        
        
    };

    controller.init();
    return controller;
};
