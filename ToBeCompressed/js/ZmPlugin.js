function ZmPluginInst(){
	var hostApp = getHostApp();
	var host;
	switch(hostApp){
	case ('PHXS'):
	case ('PHSP'):
		host = new ZmPhotoshop();
		host.hostAppCode = hostApp;
		break;
		//return host;
	case ('ILST'):
		host = new ZmIllustrator();
		host.hostAppCode = hostApp;
		break;
		//return host;
	case ('IDSN'):
		host = new ZmInDesign();
		host.hostAppCode = hostApp;
		break;
	case ('AEFT'):
		host = new ZmAfterEffects();
		host.hostAppCode = hostApp;
		break;
	case ('PPRO'):
		host = new ZmPremierPro();
		host.hostAppCode = hostApp;
		break;
	default:
		host = new ZmPluginDefault();
		host.hostAppCode = hostApp;
		break;
		//return host;
	}
	ZmPluginInst.host = host;
	return host;
}

function ZmPlugin(){}
ZmPlugin.prototype.showInstance = function (){
	alert('ZmPLugin');
};
ZmPlugin.prototype.getFilePath = function ( cmd, _callback, extraArgs ) {
	var extScript = '.getFilePath("' + extraArgs._isRefresh + '" , "' + extraArgs._showNoFileError + '")';
	executeScript(extScript , cmd, _callback, extraArgs);
	//executeScript(".getFilePath()", cmd, _callback, extraArgs);
};
ZmPlugin.prototype.saveDocument = function ( cmd, _callback, extraArgs ) {
	//updateProgress("Saving Project....", false);
	executeScript(".saveDocument()", cmd, _callback, extraArgs);
};
ZmPlugin.prototype.preCommitHook = function ( cmd, _callback, extraArgs ){
	_callback(cmd, null, extraArgs);
};
ZmPlugin.prototype.getExtractedData = function ( cmd, _callback, extraArgs ){
	_callback(cmd, null, extraArgs);
};
ZmPlugin.prototype.extractXMP = function ( cmd, _callback, extraArgs ){
	_callback(cmd, null, extraArgs);
};
ZmPlugin.prototype.closeActiveDocument = function ( cmd, _callback, extraArgs ) {
	executeScript(".closeActiveDocument()", cmd, _callback, extraArgs);
};
ZmPlugin.prototype.openFile = function ( cmd, _callback, extraArgs ) {
	if (extraArgs.openPath) {
		var extScript = '.openFile("' + extraArgs.openPath + '")';
		executeScript(extScript, cmd, _callback, extraArgs);
	}
};
ZmPlugin.prototype.resolveLinks = function ( cmd, _callback, extraArgs ) {
	var extScript = '.resolveLinks("'+extraArgs.tmpfilename.toString()+'")';
	executeScript(extScript, cmd, _callback, extraArgs);
};
ZmPlugin.prototype.isChangesSaved = function ( cmd, _callback, extraArgs ) {
	//Not implemented - not available for all apps. Check app specific overriden method.
};


function ZmPhotoshop(){}
ZmPhotoshop.prototype = new ZmPlugin();
ZmPhotoshop.prototype.constructor = ZmPhotoshop;
ZmPhotoshop.prototype.isDefault = false;
ZmPhotoshop.prototype.showInstance = function(){
	alert('ZmPhotoshop');
};
ZmPhotoshop.prototype.getExtractedData = function ( cmd, _callback, extraArgs ){
	updateProgress(resourceBundle.EXTRACT_LYR_PROGRESS, false);
	executeScript(".getExtractedData()", cmd, _callback, extraArgs);
};
ZmPhotoshop.prototype.saveDocument = function ( cmd, _callback, extraArgs ){
	//updateProgress("Saving Project....", false);
	var checkModified = false;
	var modifiedFlag = false;
	if(extraArgs) {
		if (extraArgs.checkModified)
			checkModified = extraArgs.checkModified;
		if (extraArgs.modifiedFlag)
			modifiedFlag = extraArgs.modifiedFlag;
	}
	var extScript = '.saveDocument("'+checkModified+'", "'+modifiedFlag+'")';
	executeScript(extScript, cmd, _callback, extraArgs);
};
ZmPhotoshop.prototype.isChangesSaved = function ( cmd, _callback, extraArgs ) {
	executeScript(".isChangesSaved()", cmd, _callback, extraArgs);
};

function ZmIllustrator(){}
ZmIllustrator.prototype = new ZmPlugin();
ZmIllustrator.prototype.constructor = ZmIllustrator;
ZmIllustrator.prototype.isDefault = false;
ZmIllustrator.prototype.showInstance = function(){
	alert('ZmIllustrator');
};
ZmIllustrator.prototype.getExtractedData = function ( cmd, _callback, extraArgs ){
	updateProgress(resourceBundle.EXTRACT_LYR_PROGRESS, false);
	executeScript(".getExtractedData()", cmd, _callback, extraArgs);
};
ZmIllustrator.prototype.isChangesSaved = function ( cmd, _callback, extraArgs ) {
	executeScript(".isChangesSaved()", cmd, _callback, extraArgs);
};

function ZmInDesign(){}
ZmInDesign.prototype = new ZmPlugin();
ZmInDesign.prototype.constructor = ZmInDesign;
ZmInDesign.prototype.isDefault = false;
ZmInDesign.prototype.showInstance = function(){
	alert('ZmInDesign');
};
/*ZmInDesign.prototype.preCommitHook = function( cmd, _callback, extraArgs ){
	executeScript(".preCommitHook()", cmd, _callback, extraArgs);
};*/
ZmInDesign.prototype.getExtractedData = function ( cmd, _callback, extraArgs ){
	updateProgress(resourceBundle.EXTRACT_LINKS_PROGRESS, false);
	executeScript(".getExtractedData()", cmd, _callback, extraArgs);
};
ZmInDesign.prototype.isChangesSaved = function ( cmd, _callback, extraArgs ){
	executeScript(".isChangesSaved()", cmd, _callback, extraArgs);
};

function ZmAfterEffects(){}
ZmAfterEffects.prototype = new ZmPlugin();
ZmAfterEffects.prototype.constructor = ZmAfterEffects;
ZmAfterEffects.prototype.isDefault = false;
ZmAfterEffects.prototype.showInstance = function(){
	alert('ZmAfterEffects');
};
ZmAfterEffects.prototype.preCommitHook = function( cmd, _callback, extraArgs ){
	//executeCommonScript('$._ext.getZoomProperty("GET_THUMB_FROM_PLUGIN")', getThumb, cmd, extraArgs);
	updateProgress(resourceBundle.EXTRACT_THUMB_PROGRESS, false);
	executeScript(".preCommitHook()", cmd, _callback, extraArgs);
};
ZmAfterEffects.prototype.getExtractedData = function ( cmd, _callback, extraArgs ){
	updateProgress(resourceBundle.EXTRACT_COMP_PROGRESS, false);
	executeScript(".getExtractedData()", cmd, _callback, extraArgs);
};
ZmAfterEffects.prototype.extractXMP = function ( cmd, _callback, extraArgs ){
	executeScript(".extractXMP()", cmd, _callback, extraArgs);
};
ZmAfterEffects.prototype.isChangesSaved = function ( cmd, _callback, extraArgs ) {
	executeScript(".isChangesSaved()", cmd, _callback, extraArgs);
};

function ZmPremierPro(){}
ZmPremierPro.prototype = new ZmPlugin();
ZmPremierPro.prototype.constructor = ZmPremierPro;
ZmPremierPro.prototype.isDefault = false;
ZmPremierPro.prototype.showInstance = function(){
	alert('ZmPremierPro');
};
ZmPremierPro.prototype.closeActiveDocument = function( cmd, _callback, extraArgs ){
	_callback( cmd, null, extraArgs );
};
ZmPremierPro.prototype.preCommitHook = function( cmd, _callback, extraArgs ){
	//executeCommonScript('$._ext.getZoomProperty("GET_THUMB_FROM_PLUGIN")', getThumb, cmd, extraArgs);
	updateProgress(resourceBundle.EXTRACT_LINKS_PROGRESS, false);
	executeScript(".preCommitHook()", cmd, _callback, extraArgs);
};
ZmPremierPro.prototype.getExtractedData = function ( cmd, _callback, extraArgs ){
	executeScript(".getExtractedData()", cmd, _callback, extraArgs);
};
ZmPremierPro.prototype.isChangesSaved = function ( cmd, _callback, extraArgs ) {
	executeScript(".isChangesSaved()", cmd, _callback, extraArgs);
};


function ZmPluginDefault(){}
ZmPluginDefault.prototype = new ZmPlugin();
ZmPluginDefault.prototype.constructor = ZmPluginDefault;
ZmPluginDefault.prototype.isDefault = true;
ZmPluginDefault.prototype.getFilePath = function ( isRefresh ){
	//showAlert("Host app unavailable");
};

function getHostApp(){
	var csInterface = new CSInterface();
	return csInterface.hostEnvironment.appName;
}

function testInstance(){
	var host = new ZmPluginInst();
	host.showInstance();
}

function getThumb(result, cmd, extraArgs) {
	if(result && result.toString().toUpperCase() == "TRUE") {
		executeScript(".preCommitHook()", cmd, getExtractedData, extraArgs);
	} else{
		getExtractedData(cmd, null, extraArgs);
	}
}

function executeScript ( funcName, cmd, _callback, extraArgs ) {
	if(ZmPluginInst.host && ZmPluginInst.host.hostAppCode){
		var extScript = "$._ext_" + ZmPluginInst.host.hostAppCode + funcName;
		var resultJson = "";
		//showAlert("extScript : "+extScript);
		evalScript(extScript, function(result){
			//hideProgress();
			try{
				//showAlert("result : "+result);
				resultJson = result;
				var resultObj = JSON.parse(result);
				//showAlert("isSuccess : "+resultObj.isSuccess);
				var isSuccess = resultObj.isSuccess;
				var resultData;
				if(isSuccess === 'true'){
					resultData = resultObj.data;
					var linkedFileStr = resultObj.linkedFileStr;
					if(linkedFileStr){
						if (!extraArgs){ 
							extraArgs = {}; 
						}
						extraArgs.linkedFileStr = linkedFileStr;
					}
					if (_callback) {
						_callback( cmd, resultData, extraArgs );
					}
				} else {
					var error = "";
					if(extraArgs && extraArgs._isRefresh && extraArgs._isRefresh == 'true') {
						_callback( cmd, null, extraArgs );
					} else {
						if(resultObj) {
							error = resultObj.error;
						}
						if(error && error.toString().toUpperCase() != TIMEOUT_ERROR_STR) {
							showAlert(resourceBundle.ACTION_NOT_COMPLETE+extScript + "	"+resourceBundle.ERROR+error);
							hideProgress();
						}
						else if(error && error.toString().toUpperCase() == TIMEOUT_ERROR_STR)
							_callback( cmd, null, extraArgs );
						else{
							hideProgress();
						}
					}
				}
			} catch (e) {
				showAlert(resourceBundle.SCRIPT_FAILURE+e.toString()+"	"+resourceBundle.RESULT_FROM_SCRIPT +" : "+resultJson);
				/*showAlert("e.toString().toUpperCase() : "+e.toString().toUpperCase());
				if(e.toString().toUpperCase() != "LAYER_TIMEOUT")
					showAlert(resourceBundle.SCRIPT_FAILURE+e.toString());
				else if(e.toString().toUpperCase() == "LAYER_TIMEOUT") {
					if (_callback) {
						_callback( cmd, null, extraArgs );
					}
				}*/
			}
		});
	}else{
		showAlert(resourceBundle.INVALID_HOST);
	}
}


function executeCommonScript(funcName, _callback, cmd, extraArgs) {
	evalScript(funcName, function(result){
		if(_callback) {
			_callback(result, cmd, extraArgs);
		}
		/*try{
			//showAlert("result : "+result);
			var resultObj = JSON.parse(result);
			//showAlert("isSuccess : "+resultObj.isSuccess);
			var isSuccess = resultObj.isSuccess;
			var resultData;
			if(isSuccess === 'true'){
				resultData = resultObj.data;
				if (_callback) {
					_callback( { openPath : resultData} );
				}
			} else {
				var error = "";
				if(resultObj) {
					error = resultObj.error;
				}
				showAlert("Could not complete action : "+extScript + "\n Error : "+error);
				//TODO: handle error 
			}
		} catch (e) {
			showAlert("Script failure : "+e.toString());
		}*/
	});
}