
//var admin = false;
// var iotAccount = "admin"
// var iotName = "管理员"
var admin = false;
if ( iotAccount == "admin" ) {
	admin = true;
	$("html").addClass("admin");
} else {
	if (!debug){
	admin = false;
	$("html").removeClass("admin");
	}
}

$(document).ready(function(){ 
	function newPasswdCheck(){
		if ($(".newPasswd").val().trim().length >= 8 ){
			return $(".newPasswd").val().trim();
		}
		return false;
	}
	function oldPasswdCheck(){
		if ($(".oldPasswd").val().trim().length >= 1 ){
			return $(".oldPasswd").val().trim();
		}
		return false;
	}
	
	// 修改密码
	function passwdModify(newPasswd, oldPasswd){
		let account = $(".account").text().trim();
		$.ajax({
			type: "POST",
			url: url + "/user/modify",
			data: {
				_method:"PUT",
				account:account,
				oldPasswd:oldPasswd,
				newPasswd:newPasswd
			},
			dataType: "json",
			xhrFields: {
				// 允许携带cookie跨域
				withCredentials: true
			},
			crossDomain: true,
			success: function (data) {
				if (data.code == 200) {
					layer.msg("密码修改成功!")
					$.cookie('iot-time', 0, { expires: -1, path: '/' });
					setTimeout(
						function() {
							window.location.href = url + "/login.html";
						}
					,1500);
				}
			},
			error: function(e){
				layer.msg("服务器异常  GET: " + url + "/user/modify/", function(){})
			},
			complete : function(xhr, status) {
				myComplete(xhr, status);
			}
		})
	}
	
	var userList;
	var userListLenth = 0;
	var eachIndex = 0;
	// 删除账号
	function unAuthAccount(account){
		let res = confirm("确认销毁 " + account + " 账号?");
		if ( res ) {
			layer.load(0)
			$.ajax({
				type: "POST",
				url: url + "/user/" + userList[eachIndex].id,
				data: {account:account,_method:"DELETE"},
				dataType: "json",
				xhrFields: {
					// 允许携带cookie跨域
					withCredentials: true
				},
				crossDomain: true,
				success: function (data) {
					layer.closeAll();
					if (data.code == 204) {
						//列表移除,切换下一个账号
						userList.splice(eachIndex,1);
						userListLenth--;
						if ( eachIndex == userListLenth ) eachIndex = 0;
						layer.msg("已删除！");
						if ( userListLenth == 0 ) {
							$(".auth-account").prop("placeholder","暂无需要授权注册的账号")
							$(".auth-msg").prop("placeholder","暂无需要授权账号的昵称")
							$(".auth-account").val("");
							$(".auth-msg").val("");
						} else {
							$(".auth-account").val(userList[eachIndex].account);
							$(".auth-msg").val(userList[eachIndex].name);
						}
					} else {
						layer.msg(data.msg, function(){})
					}
				},
				error: function(e){
					layer.msg("服务器异常  DELETE: " + url + "/user/" + userList[eachIndex].id, function(){})
				},
				complete : function(xhr, status) {
					myComplete(xhr, status);
				}
			})
		}
	}
	// 账号授权
	function authAccount(account){
		let res = confirm("确认授权 " + account + " 账号?");
		if ( res ) {
			layer.load(0)
			$.ajax({
				type: "POST",
				url: url + "/user/auth",
				data: {account:account,_method:"PUT"},
				dataType: "json",
				xhrFields: {
					// 允许携带cookie跨域
					withCredentials: true
				},
				crossDomain: true,
				success: function (data) {
					layer.closeAll();
					if (data.code == 200) {
						//列表移除,切换下一个账号
						userList.splice(eachIndex,1);
						userListLenth--;
						if ( eachIndex == userListLenth ) eachIndex = 0;
						layer.msg("授权成功！");
						if ( userListLenth == 0 ) {
							$(".auth-account").prop("placeholder","暂无需要授权注册的账号")
							$(".auth-msg").prop("placeholder","暂无需要授权账号的昵称")
							$(".auth-account").val("");
							$(".auth-msg").val("");
						} else {
							$(".auth-account").val(userList[eachIndex].account);
							$(".auth-msg").val(userList[eachIndex].name);
						}
					} else {
						layer.msg("授权失败", function(){})
					}
				},
				error: function(e){
					layer.msg("服务器异常  GET: " + url + "/user/modify/", function(){})
				},
				complete : function(xhr, status) {
					myComplete(xhr, status);
				}
			})
		}
	}
	// 查询未授权的所有账号
	function queryNoAuthAccount() {
		// layer.load(0)
		$.ajax({
			type: "GET",
			url: url + "/user/isdeletelist",
			dataType: "json",
			xhrFields: {
				// 允许携带cookie跨域
				withCredentials: true
			},
			crossDomain: true,
			success: function (data) {
				if (data.code == 200) {
					
					userList = data.obj;
					userListLenth = data.obj.length;
					if (userListLenth >= 0) {
						$(".auth-account").val(userList[eachIndex].account);
						$(".auth-msg").val(userList[eachIndex].name);
					}
					
					// 遍历填充
					$(".authpre").on("click", function(){
						if ( ++eachIndex >= userListLenth ) eachIndex = 0;
						$(".auth-account").val(userList[eachIndex].account);
						$(".auth-msg").val(userList[eachIndex].name);
					})
					$(".authnext").on("click", function(){
						if ( --eachIndex < 0 ) eachIndex = userListLenth-1;
						$(".auth-account").val(userList[eachIndex].account);
						$(".auth-msg").val(userList[eachIndex].name);
					})
					$(".unauthbut").on("click", function(){
						// 删除账号
						unAuthAccount($(".auth-account").val());
					})
					$(".authbut").on("click", function(){
						// 确认授权
						authAccount($(".auth-account").val());
					})
				} else {
					// 没有未授权账号
					$(".auth-account").prop("placeholder","暂无需要授权注册的账号")
					$(".auth-msg").prop("placeholder","暂无需要授权账号的昵称")
					$(".auth-account").val("");
					$(".auth-msg").val("");
				}
			},
			error: function(e){
				layer.msg("服务器异常  GET: " + url + "/user/isdeletelist/", function(){})
			},
			complete : function(xhr, status) {
				myComplete(xhr, status);
			}
		})
	}
	
	
	var resetUserList;
	var resetUserListLenth = 0;
	var resetEachIndex = 0;
	// 撤销重置
	function unResetAccount(account){
		let res = confirm("确认撤销 " + account + " 密码重置操作?");
		if ( res ) {
			layer.load(0)
			$.ajax({
				type: "POST",
				url: url + "/user/unreset",
				data: {account:account,_method:"PUT"},
				dataType: "json",
				xhrFields: {
					// 允许携带cookie跨域
					withCredentials: true
				},
				crossDomain: true,
				success: function (data) {
					layer.closeAll();
					if (data.code == 200) {
						//列表移除,切换下一个账号
						resetUserList.splice(resetEachIndex,1);
						resetUserListLenth--;
						if ( resetEachIndex == resetUserListLenth ) resetEachIndex = 0;
						layer.msg(data.msg);
						if ( resetUserListLenth == 0 ) {
							$(".reset-account").prop("placeholder","暂无需要重置密码的账号申请")
							$(".reset-account").val("");
						} else {
							$(".reset-account").val(resetUserList[resetEachIndex].account);
						}
					} else {
						layer.msg(data.msg, function(){})
					}
				},
				error: function(e){
					layer.msg("服务器异常  PUT: " + url + "/user/unreset/", function(){})
				},
				complete : function(xhr, status) {
					myComplete(xhr, status);
				}
			})
		}
	}
	// 重置密码
	function resetAccount(account){
		let res = confirm("确认重置 " + account + " 账号的密码?");
		if ( res ) {
			layer.load(0)
			$.ajax({
				type: "POST",
				url: url + "/user/reset",
				data: {account:account,_method:"PUT"},
				dataType: "json",
				xhrFields: {
					// 允许携带cookie跨域
					withCredentials: true
				},
				crossDomain: true,
				success: function (data) {
					layer.closeAll();
					if (data.code == 200) {
						//列表移除,切换下一个账号
						resetUserList.splice(resetEachIndex,1);
						resetUserListLenth--;
						if ( resetEachIndex == resetUserListLenth ) resetEachIndex = 0;
						layer.msg(data.msg);
						if ( resetUserListLenth == 0 ) {
							$(".reset-account").prop("placeholder","暂无需要重置密码的账号申请")
							$(".reset-account").val("");
						} else {
							$(".reset-account").val(resetUserList[resetEachIndex].account);
						}
					} else {
						layer.msg(data.msg, function(){})
					}
				},
				error: function(e){
					layer.msg("服务器异常  PUT: " + url + "/user/reset/", function(){})
				},
				complete : function(xhr, status) {
					myComplete(xhr, status);
				}
			})
		}
	}
	// 查询重置密码的所有账号
	function queryresetAccount() {
		// layer.load(0)
		$.ajax({
			type: "GET",
			url: url + "/user/resetpasswd",
			dataType: "json",
			xhrFields: {
				// 允许携带cookie跨域
				withCredentials: true
			},
			crossDomain: true,
			success: function (data) {
				if (data.code == 200) {
					
					resetUserList = data.obj;
					resetUserListLenth = data.obj.length;
					if (resetUserListLenth >= 0) {
						$(".reset-account").val(resetUserList[resetEachIndex].account);
					}
					
					// 遍历填充
					$(".resetpre").on("click", function(){
						if ( ++resetEachIndex >= resetUserListLenth ) resetEachIndex = 0;
						$(".reset-account").val(resetUserList[resetEachIndex].account);
					})
					$(".resetnext").on("click", function(){
						if ( --resetEachIndex < 0 ) resetEachIndex = resetUserListLenth-1;
						$(".reset-account").val(resetUserList[resetEachIndex].account);
					})
					$(".unresetbut").on("click", function(){
						// 撤销重置
						unResetAccount($(".reset-account").val());
					})
					$(".resetbut").on("click", function(){
						// 确认重置
						resetAccount($(".reset-account").val());
					})
				} else {
					// 没有未授权账号
					$(".reset-account").prop("placeholder","暂无需要重置密码的账号")
					$(".reset-account").val("");
				}
			},
			error: function(e){
				layer.msg("服务器异常  GET: " + url + "/user/resetpasswd/", function(){})
			},
			complete : function(xhr, status) {
				myComplete(xhr, status);
			}
		})
	}
	
	var authAreaClientId = undefined;
	var authAreaClientSettings = undefined;
	// 监控授权
	function authCheckArea(){
		//监听查询按钮
		$(".queryAcc-btn").on("click", function(){
			layer.load(0)
			$.ajax({
				type: "GET",
				url: url + "/user/username/"　+　$(".query-account").val().trim(),
				dataType: "json",
				xhrFields: {
					// 允许携带cookie跨域
					withCredentials: true
				},
				crossDomain: true,
				success: function (data) {
					layer.closeAll();
					if (data.code == 200) {
						authAreaClientId = data.obj.id;
						$(".query-name").val(data.obj.name);
						if ( data.obj.settings != undefined ) {
							authAreaClientSettings = data.obj.settings;
							let authArea = $.parseJSON(authAreaClientSettings).authArea;
							switch( authArea.peidianshi ){
								case -1:
									$("#peidianshi-monitor").attr("checked", false);
									$("#peidianshi-control").attr("checked", false);
									break;
								case 0:
									$("#peidianshi-monitor").attr("checked", true);
									$("#peidianshi-control").attr("checked", false);
									break;
								case 1:
									$("#peidianshi-monitor").attr("checked", true);
									$("#peidianshi-control").attr("checked", true);
									break;
							}
							
						}
					} else {
						layer.msg(data.msg);
					}
				},
				error: function(e){
					layer.msg("服务器异常  GET: " + url + "/user/username/"　+　$(".query-account").val().trim(), function(){})
				},
				complete : function(xhr, status) {
					myComplete(xhr, status);
				}
			})
		})
		//监听授权按钮  {"theme":"dark","authArea":{"peidianshi":1}}
		$(".monitor-control-auth").on("click", function(){
			if ( authAreaClientId !== undefined && authAreaClientSettings !== undefined ) {
				let settingsJson = $.parseJSON(authAreaClientSettings);
				let peidianshiNum = -1;
				if ( $("#peidianshi-monitor").prop("checked") === true ) peidianshiNum = 0;
				if ( $("#peidianshi-control").prop("checked") === true ) peidianshiNum = 1;
				settingsJson.authArea.peidianshi = peidianshiNum;
				authAreaClientSettings = JSON.stringify(settingsJson);
				layer.load(0)
				$.ajax({
					type: "POST",
					url: url + "/user/"　+　authAreaClientId,
					dataType: "json",
					data: { _method:"PUT", settings:authAreaClientSettings },
					xhrFields: {
						// 允许携带cookie跨域
						withCredentials: true
					},
					crossDomain: true,
					success: function (data) {
						layer.closeAll();
						if (data.code == 200) {
							layer.msg(data.msg);
						} else {
							layer.msg(data.msg, function(){});
						}
					},
					error: function(e){
						layer.msg("服务器异常  GET: " + url + "/user/"　+　authAreaClientId, function(){})
					},
					complete : function(xhr, status) {
						myComplete(xhr, status);
					}
				})
			}
		})
	}
	
	$(".account").text(iotAccount);
	$(".name").text(iotName);

	$(".theme .left").on("click",function(){
		$("html").removeClass("darkness");
	})
	$(".theme .right").on("click",function(){
		$("html").addClass("darkness");
	})
	$(".return").on("click",function(){
		window.location.href = url + "/index.html";
	})
	
	// 修改密码
	$(".passwdModify").on("click", function(){
		let newPasswd = newPasswdCheck();
		if ( newPasswd != false ) {
			let oldPasswd = oldPasswdCheck();
			if ( oldPasswd != false ) {
				passwdModify(newPasswd, oldPasswd);
			} else {
				layer.msg("旧密码输入错误。",function(){})
			}
		} else {
			layer.msg("新密码至少8位",function(){})
		}
	})

	//监听退出登录
	$(".logout").on("click", function(){
		$.cookie('iot-time', "", { expires: -1, path: '/' });
		$.cookie('iot-username', "", { expires: -1, path: '/' });
		$.cookie('iot-name', "", { expires: -1, path: '/' });
		$.cookie('iot-lastPage', "", { expires: -1, path: '/' });
		$.cookie('iot-settings', "", { expires: -1, path: '/' });
		window.location.href = url + "/login.html";
	})
	
	// 管理员
	if ( admin == true ) {
		if (!debug){
		queryNoAuthAccount();
		queryresetAccount();
		}
		authCheckArea();
	}
	
}); 	