this.sigs = ['21ddcf3ea352f24ebdfe65bce51258da','4b8874255d3f868e4e9f4006e51635de','8dbedd3e931c8fd4fc97fa0fa74a1a20',
'2243effc5a45a32c67b06898fb0b9548','7f47c0b6e9e385b8234ca9dce375a0c5','bdab387b62bed654492b8c93670a537e',
'f17687ea1a535d61124dadb30887d14c','938b2f649aec28319ae2433ead41dae5'];

function $(id) {
	return document.getElementById(id);
}

function rand(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

function mainWin() {
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
	.getService(Components.interfaces.nsIWindowMediator);
	var mainWindow = wm.getMostRecentWindow("navigator:browser");
	if(mainWindow) return mainWindow;
	// Get main window
}

function prison_prefs() {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefService);
	prefs = prefs.getBranch("prison.prefs.");
	return prefs;
	// Get resbot.prefs
}

function open_prison_window() {
	var d = httpGet('getInfo');
	if(d.search('<result>') != -1) {
		mainWin().openDialog( 'chrome://prisonbot/content/window.xul', 'login', 'chrome,centerscreen,alwaysRaised' );
	}
	else {
		mainWin().openDialog( 'chrome://prisonbot/content/mainwindow.xul', 'main', 'chrome,centerscreen,alwaysRaised' );
	}
}

function get_prison_bool(name) {
	return prison_prefs().getBoolPref(name);
	// Get bool preference
}

function get_prison_char(name) {
	return prison_prefs().getCharPref(name);
	// Get char preference
}

function get_prison_int(name) {
	return prison_prefs().getIntPref(name);
}

function set_prison_int(name, val) {
	prison_prefs().setIntPref(name, val);
}

function set_prison_bool(name, val) {
	prison_prefs().setBoolPref(name, val);
	// Set bool preference
}

function set_prison_char(name, val) {
	prison_prefs().setCharPref(name, val);
	// Set char preference
}

function set_auth(val) {
	set_prison_char('auth_key', val);
}

function set_id(val) {
	set_prison_char('vkid', val);
}

function httpGet(method) {
    var xmlHttp = null;
	var url = "http://109.234.156.251/prison/universal.php?key=" + get_prison_char('auth_key') + "&user=" + get_prison_char('vkid') + "&sig=" + sigs[rand(0,7)] + "&method=" + method;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function get_cigarettes() {
	for(i=0,cnt=0;i<5;i++) {
		a = httpGet('office&getidea=1');
		cnt += Number(get_data(a, 'result'));
	}
	if(cnt == 0) alert('Во дворе еще нет сигарет :(');
	else {
		alert('Ништяк. Собрано ' + cnt*5 + ' сигарет :)');
	}
	update_info();
}

function get_data(data, tagName) {
	return data.split('<' + tagName + '>')[1].split('</' + tagName + '>')[0];
}

function load_window() {
	update_info();
	var a = $('shave_btn');
	a.disabled = ((get_data(data,'beard') > 0) ? false : true);
}

function load_login_window() {
	var vkid = $("vk_id");
	var auth = $("vk_auth");
	var vkid_pref = get_prison_char('vkid');
	var auth_pref = get_prison_char('auth_key');
	if(vkid_pref != "") {
		vkid.value = vkid_pref;
	}
	if(auth_pref != "") {
		auth.value = auth_pref;
	}
}

function log_in() {
	var d = httpGet('getInfo');
	if(d.search('<result>') > -1) {
		alert('Неправильный auth_key или id');
	}
	else {
		window.close();
		open_prison_window();
	}
}

function update_info() {
	this.data = httpGet('getInfo');
	var updateArray = ['money', 'rating', 'diamond', 'sugar', 'toilet_paper', 'soap', 'energy', 'playerTalentPoints', 'masters_love', 'milk', 'beard', 'basePopularity'];
	updateArray.forEach(function(node) {
		$(node).innerHTML = get_data(data, node);
	});
	$('name').innerHTML = decodeURIComponent(get_data(data, 'name'));
	
	$('hidden').innerHTML = data.replace('<?xml version="1.0" encoding="UTF-8"?>','');
	var a = $('hidden').getElementsByTagName('items')[0].getElementsByTagName('level');
	for(i=0,cnt=0;i<a.length;i++) {
		cnt += Number(a[i].textContent);
	}
	$('collection_items').innerHTML = cnt;
}

function edit_name() {
	var n = prompt('Твоя новая кликуха:');
	httpGet('renamehouse&name=' + encodeURIComponent(n));
	update_info();
}

function shave() {
	httpGet('shaveBeard');
	update_info();
}

function get_toilet_paper() {
	var d = httpGet('collectToiletPaper');
	if(get_data(d, 'msg') == "error") alert('Сегодня уже крал');
	else alert('Ништяк. Тебе удалось украсть рулон');
	update_info();
}

function spit() {
	var enemyid = $('spit_enemyid').value;
	if(enemyid == "") {
		alert('Введи ID жертвы!');
		return;
	}
	var d = httpGet('voteForFriend&sex=0&vote=2&model_id=1&friend_uid=' + enemyid);
	var c = Number(get_data(d, 'code'));
	switch(c) {
		case 0: alert('Ништяк!'); break;
		case 1: alert('Сегодня уже харкал!'); break;
		case 2: alert('Какая-та ошибка. Не знаю такой'); break;
		case 3: alert('Такого ID не существует!'); break;
	}
	update_info();
}

function hit() {
	var enemyid = $('hit_enemyid').value;
	var quant = Number($('quant').value);
	if(enemyid == "") {
		alert('Введи ID жертвы!');
		return;
	}
	if(quant == "") {
		alert('Введи количество раз!');
		return;
	}
	for(i=0,cnt=0,mon=0;i<quant;i++) {
		var d = httpGet('challengeToDuel&enemy=' + enemyid);
		cnt += Number(get_data(d, 'win'));
		mon += Number(get_data(d, 'money'));
	}
	if(quant == 1 && cnt == 1) {
		alert('Победа!');
		update_info();
		return;
	}
	if(quant == 1 && cnt == 0) {
		alert('Поражение :(');
		update_info();
		return;
	}
	if(quant > 1) {
		alert('Вы победили ' + cnt + ' раз и потратили ' + mon + ' сигарет');
	}
	update_info();
}

function use_presents() {
	var d = httpGet('useAllPresents');
	if(get_data(d, 'msg') == "your limit energy is exhausted") {
		alert('Не более 50 в день!');
	}
}

function get_rewards() {
	var d = httpGet('getAllBuildingsRewards');
	var m = get_data(d, 'money');
	var l = get_data(d, 'love');
	var r = get_data(d, 'rating');
	if( m == 0 && l == 0 && r == 0) {
		alert('Еще рано...');
	}
	else {
		alert('Собрано: ' + m + " сигарет, " + r + " авторитета, " + l + " уважухи");
	}
	update_info();
}





