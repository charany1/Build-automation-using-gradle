var gUserName;

/*function saveProperty() {
	if(gUserName) {
		var extractLayer = document.getElementById("layerChk").checked;
		var generateThumb = document.getElementById("getThumb").checked;
		var propStr = "enableLayerExtraction="+extractLayer+"|enableThumbExtraction="+generateThumb;
		var propFileName = gUserName+"_plugSettings";
		var funcName = '$._ext.writeToPropFile("'+propFileName + '", "'+propStr+'")';
		executeCommonScript(funcName, savePropCallback, null, null);
	} else {
		showAlert(resourceBundle.SAVE_USER_SETTINGS);
	}
}*/

function saveProperty() {
	var extractLayer = document.getElementById("layerChk").checked;
	var generateThumb = document.getElementById("getThumb").checked;
	var propStr = "enableLayerExtraction="+extractLayer+"|enableThumbExtraction="+generateThumb;
	var propFileName = "plugSettings";
	if(gUserName) {
		propFileName = gUserName+"_plugSettings";
	} 
	var funcName = '$._ext.writeToPropFile("'+propFileName + '", "'+propStr+'")';
	executeCommonScript(funcName, savePropCallback, null, null);
}


function savePropCallback(flag) {
	if(flag && flag == 'true')
		showAlert(resourceBundle.USER_SETTINGS_UPDATED);
	else
		showAlert(resourceBundle.USER_SETTINGS_SAVE_FAILED);
	hideProgress();
	jQuery( "#overlay" ).hide();
}

/*function readUserSettings(_callback, cmd, extraArgs) {
	if(gUserName) {
		var propFileName = gUserName+"_plugSettings";
		var funcName = '$._ext.getUserProps("'+propFileName + '")';
		executeCommonScript(funcName, _callback, cmd, extraArgs);
	} else {
		showAlert(resourceBundle.LOAD_USER_SETTINGS);
	}
}*/

function readUserSettings(_callback, cmd, extraArgs) {
	var propFileName = "plugSettings";
	if(gUserName) {
		propFileName = gUserName+"_plugSettings";
	} 
	var funcName = '$._ext.getUserProps("'+propFileName + '")';
	executeCommonScript(funcName, _callback, cmd, extraArgs);
}

function updatePropUI(result, cmd, extraArgs) {
	if(result) {
		var resultObj = JSON.parse(result);
		var enableLayerExtraction = resultObj.enableLayerExtraction;
		var enableThumbExtraction = resultObj.enableThumbExtraction;
		document.getElementById("layerChk").checked = (enableLayerExtraction == 'true');
		document.getElementById("getThumb").checked = (enableThumbExtraction == 'true');
	} else {
		document.getElementById("layerChk").checked = true;
		document.getElementById("getThumb").checked = true;
	}
	hideProgress();
	jQuery( "#overlay" ).show();
}

function updateProps(result, cmd, extraArgs) {
	if(!extraArgs)
		extraArgs = {};
	if(result) {
		var resultObj = JSON.parse(result);
		extraArgs.enableLayerExtraction = resultObj.enableLayerExtraction;
		extraArgs.enableThumbExtraction = resultObj.enableThumbExtraction;
	} else {
		extraArgs.enableLayerExtraction = 'true';
		extraArgs.enableThumbExtraction = 'true';
	}
	preCommitHook(cmd, extraArgs.enableThumbExtraction, extraArgs);
}