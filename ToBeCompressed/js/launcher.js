function launchCommand(command, isRefresh) {
	var unsupported = false;
	if(!ZmPluginInst.host)
		var host = new ZmPluginInst();
	if (ZmPluginInst.host) {
		var _callback = getRefreshedStatus;
		var showNoFileError = true;
		switch (command) {
			case 'workflow':
			//case 'asset_browser':
			case 'incomingchanges':
			case 'repobrowser':
			//case 'status':
			case 'reveal':
				_callback = issueCommandNoRefresh;
				break;
			case 'asset_browser':
				showNoFileError = false;
				break;
			case 'resolve-links':
				if(ZmPluginInst.host.hostAppCode !== 'PHXS' && ZmPluginInst.host.hostAppCode !== 'ILST' 
					&& ZmPluginInst.host.hostAppCode !== 'PHSP' && ZmPluginInst.host.hostAppCode !== 'AEFT'
						&& ZmPluginInst.host.hostAppCode !== 'IDSN' && ZmPluginInst.host.hostAppCode !== 'PPRO') {
					unsupported = true;
				}
		}
		if (command == 'workflow' || command == 'repobrowser') {
			updateProgress(resourceBundle.LAUNCHING + getCmdLabel(command) + "....", true);
			issueCommand(command, null, null);
		}else {
			if(unsupported == true) {
				showAlert(resourceBundle.UNSUPPORTED_ACTION);
				return;
			}
			if(isRefresh != 'true')
				updateProgress(resourceBundle.LAUNCHING + getCmdLabel(command) + "....", true);
			ZmPluginInst.host.getFilePath(command, _callback, {_isRefresh : isRefresh, _showNoFileError: showNoFileError});
		}
	} else {
		showAlert(resourceBundle.INVALID_HOST);
	}
}

function launchSearch(){ 
	var value = jQuery("#searchInput").val();									// to get the value from the text box
	if(value){																	// check if value is not empty	
		sendCommandRequest(getCommandParam('uberSearch',{searchString:value}), null);     // connecting to intellij for further process
	}
	
}

function sendCommandRequest(params, _callback) {
	try {
		var url = "http://127.0.0.1:7770/webmin/jsp/process/htmlPluginForker.jsp";
		if(params && params['block'])
			hideProgress();
		//var url = "http://127.0.0.1:8443/jsp/process/htmlPluginForker.jsp?username=admin&password=admin";
		var response = jQuery.post(url, params, function(data) {
			var returnFlag;
			var errorMsg;
			try {
				callTimer();
				returnFlag = data.getElementsByTagName("status").item(0)
						.getAttribute("flag");
				errorMsg = data.getElementsByTagName("status").item(0)
						.getAttribute("errorMsg");
				if (returnFlag === 'true') {
					if (_callback) {
						_callback(params);
					}
				} else {
					if(errorMsg)
						showAlert(errorMsg);
					else	
						showAlert(resourceBundle.REQUEST_NOT_COMPLETE_ERR);
				}
			} catch (e) {
				showAlert(resourceBundle.INVALID_DATA_ERR + e);
			}

		});
		response.fail = function() {
			showAlert(resourceBundle.REQUEST_FAILED);
		};
		response.always = function() {
			hideProgress();
		};
	} catch (e) {
		showAlert(resourceBundle.REQUEST_SEND_ERR + e);
	}

}

function showAlert(alertTxt) {
	var extScript = "$._ext.showAlert( '" + alertTxt + "' )";
	evalScript(extScript);
}

var timer;

function setTimer() {
	timer = setTimeout(function(){launchCommand('refresh', 'true');}, 15000);
}
function callTimer() {
	clearTimer();
	setTimer();
}

function clearTimer() {
	if (timer) {
		clearTimeout(timer);
	}
}

function getRefreshedStatus(cmd, filePath, extraArgs) {
	if(!filePath && cmd != 'loadSettings' && cmd != 'saveSettings' && cmd != 'asset_browser')
		hideProgress();
	try {
		var url = "http://127.0.0.1:7770/webmin/jsp/status/getfilestatusbitsetPlugin.jsp";
		//var url = "http://127.0.0.1:8443/jsp/status/getfilestatusbitset.jsp";
		var params = {
			path : filePath,
			force : true,
			adobe : true
		};
		var statusObj;
		var response = jQuery.post(url, params, function(data) {
			var resultData = data.getElementsByTagName("status").item(0);
			var userName = resultData.getAttribute("userName");
			var serverAlias = resultData.getAttribute("server");
			setUserDtls(userName, serverAlias);
			if(filePath || cmd == "asset_browser") {
				statusObj = {
					code : resultData.getAttribute("code"),
					bitset : resultData.getAttribute("bitset")
				};
			}
		});

		response.fail = function(jqXHR, textStatus, errorThrown) {
			showAlert(resourceBundle.ERROR + response.status+'\n'+resourceBundle.ERROR_THROWN+errorThrown);
		};
		response.always = function() {
			if (!statusObj) {
				//showAlert("No valid status");
			} else {
				if (extraArgs && extraArgs._isRefresh
						&& extraArgs._isRefresh === 'true') {
					refreshStatus(statusObj);
				} else if(cmd != 'loadSettings' && cmd != 'saveSettings') {
					executeActionOnRefresh(cmd, statusObj, filePath);
				}
			}
			
			if(cmd == 'loadSettings') {
				readUserSettings(updatePropUI, null, null);
			}else if(cmd == 'saveSettings') {
				saveProperty();
			}
		};
		if(!filePath) {
			refreshBlankFileStatus();
		}
	} catch (e) {
		showAlert(resourceBundle.ERROR + e);
	}

}

function executeActionOnRefresh(cmd, statusObj, filePath) {
	var code = statusObj.code;
	if (code < 0) {
		statusObj.code = -code;
	}
	var bitset = statusObj.bitset;
	var _isVersioned = isVersioned(code);
	var _isAdded = false;
	var _isNonWc = false;
	var _isModified = isModified(code, bitset);
	if (_isVersioned === true) {
		_isAdded = ADDED.getStatusCode() == code;
		_isNonWc = false;
	} else {
		_isNonWc = isNonWc(code);
	}
	if (ZmPluginInst.host && ZmPluginInst.host.isDefault === false && filePath) {
		switch (cmd) {
		case 'checkIn':
			ZmPluginInst.host.saveDocument(
					(_isVersioned === true || _isAdded === true || _isNonWc === false) ? "commit" : "import",
						retrieveSettings, {
						remotepath : filePath,
						checkModified : true,
						modifiedFlag : _isModified
					});
			break;
		case 'smartCopy':
			if (_isVersioned === true) {
				try{
					var modStatus = updateModStatus(code, statusObj.bitset);
					var modifiedFlag = (modStatus && modStatus === true) ? 1 : 0;
					issueCommand(cmd, null, {remotepath : filePath, modifiedFlag:modifiedFlag});
				} catch (e) {
					hideProgress();
					showAlert(e);
				}
			} else {
				showAlert(resourceBundle.SMART_CPY_UNVERSIONED_ERR);
				hideProgress();
			}
			break;
		case 'update':
			if (_isVersioned !== true || (_isAdded && _isAdded === true)) {
				hideProgress();
				showAlert(resourceBundle.UPDATE_UNVERSIONED_ERR);
			} else {
				ZmPluginInst.host.saveDocument(cmd, closeCurrentDocument, {
					remotepath : filePath
				});
			}
			break;
		case 'lock':
		case 'unlock':
			if (_isVersioned !== true || (_isAdded && _isAdded === true)) {
				hideProgress();
				showAlert(resourceBundle.LOCK_UNLOCK_UNVERSIONED_ERR);
			} else {
				issueCommand(cmd, null, {
					remotepath : filePath
				});
			}
			break;
		case 'revertdata':
		case 'revertrenamed':
		case 'revertmove':
		case 'revertadd':
		case 'revertall':
			if (_isVersioned !== true) {
				hideProgress();
				showAlert(resourceBundle.REVERT_UNVERSIONED_ERR);
			} else {
				ZmPluginInst.host.saveDocument(cmd, closeCurrentDocument, {
					remotepath : filePath
				});
			}
			break;
		case 'quickChkIn':
			ZmPluginInst.host.saveDocument(
					(_isVersioned === true || _isAdded === true) ? "quick_commit" : "quick_import", retrieveSettings, {
						remotepath : filePath,
						checkModified : true,
						modifiedFlag : _isModified
					});
			break;
		case 'asset_browser':
			if (_isVersioned !== true || (_isAdded && _isAdded === true)) {
				issueCommand(cmd, null, {
					remotepath : filePath,
					versionFlag : 0
				});
			} else {
				issueCommand(cmd, null, {
					remotepath : filePath,
					versionFlag : 1
				});
			}
			break;
		case 'resolve-links':
			if (_isVersioned !== true || (_isAdded && _isAdded === true)) {
				hideProgress();
				showAlert(resourceBundle.RESOLVE_LINKS_UNVERSIONED_ERR);
			} else if (_isModified == true){
				issueResolveLinks(cmd, 'false', {
					parentFilePath : filePath
				});
			} else {
				ZmPluginInst.host.isChangesSaved(cmd, issueResolveLinks, {
					parentFilePath : filePath
				});
			}
			break;
		case 'status':
			if (_isVersioned === true) {
				issueCommand(cmd, null, {remotepath : filePath});
			} else {
				showAlert(resourceBundle.STATUS_UNVERSIONED_ERR);
				hideProgress();
			}
			break;
		default:
			hideProgress();
			showAlert(resourceBundle.UNKNOWN_CMD_ERR + cmd);
		}
	} else if (!filePath && cmd == 'asset_browser'){
		issueCommand(cmd, null, {
			remotepath : filePath,
			versionFlag : 0
		});
	}
}

function issueResolveLinks(cmd, isChangesSaved, extraArgs) {
	if(isChangesSaved == 'false') {
		var confirmTxt = resourceBundle.RESOLVE_LINKS_LAYER_REORDER_ERR;
		var noAsDefault = true;
		var confirmTitle = resourceBundle.RESOLVE_LINKS_HEADER;
		var funcName = '$._ext.showConfirm("'+confirmTxt+'", "' + noAsDefault + '", "' + confirmTitle + '")';
		executeCommonScript(funcName, confirmResolveLinks, cmd, extraArgs);
		return;
	}
	issueCommand(cmd, null, extraArgs);	
}

function confirmResolveLinks(resolveLinkFlag, cmd, extraArgs) {
	if(resolveLinkFlag == 'true') {
		issueCommand(cmd, null, extraArgs);
	} else {
		hideProgress();
	}
}

function retrieveSettings(cmd, isSaved, extraArgs) {
	if (isSaved === 'true') {
		readUserSettings(updateProps, cmd, extraArgs);
	} else {
		// TODO: localize errors
		showAlert(resourceBundle.DOC_NOT_SAVED_ERR);
	}
}

function preCommitHook(cmd, enableThumbExtraction, extraArgs) {
	if(enableThumbExtraction == 'true')
		ZmPluginInst.host.preCommitHook(cmd, extractXMP, extraArgs);
	else
		extractXMP(cmd, null, extraArgs);
	/*if (isSaved === 'true') {
		ZmPluginInst.host.preCommitHook(cmd, getExtractedData, extraArgs);
	} else {
		// TODO: localize errors
		showAlert(resourceBundle.DOC_NOT_SAVED_ERR);
	}*/
}

function extractXMP(cmd, previewFile, extraArgs) {
	if (previewFile) {
		if (extraArgs)
			extraArgs.thumbpath = previewFile;
		else
			extraArgs = {
				thumbpath : previewFile
			};
	}
	ZmPluginInst.host.extractXMP(cmd, getExtractedData, extraArgs);
}

function getExtractedData(cmd, xmpFile, extraArgs) {
	if (xmpFile) {
		if (extraArgs)
			extraArgs.xmpFilePath = xmpFile;
		else
			extraArgs = {
				xmpFilePath : xmpFile
			};
	}
	//showProgress();
	if(extraArgs && extraArgs.enableLayerExtraction && extraArgs.enableLayerExtraction == 'true')
		ZmPluginInst.host.getExtractedData(cmd, issueCommand, extraArgs);
	else
		issueCommand(cmd, null, extraArgs);
}

function closeCurrentDocument(cmd, isSaved, extraArgs) {
	ZmPluginInst.host.closeActiveDocument(cmd, issueCommand, extraArgs);
}

function openFile(params) {
	if (params.openPath) {
		ZmPluginInst.host.openFile(null, null, params);
	} /*else {
		showAlert("No valid file path");
	}*/
}

function issueCommand(cmd, appResultObj, extraArgs) {
	//hideProgress();
	updateProgress(resourceBundle.LAUNCHING + getCmdLabel(cmd) + "....", false);
	var _callback = null;
	if (!extraArgs) {
		extraArgs = {};
	}
	/*if(extraArgs && extraArgs._callback)
		_callback = extraArgs._callback;*/
	var _block = false;
	switch (cmd) {
		case 'update':
		case 'revertdata':
		case 'revertrenamed':
		case 'revertmove':
		case 'revertadd':
		case 'revertall':
			/*extraArgs.openPath = extraArgs.remotepath;
			_callback = openFile;
			_block = true;
			break;*/
		case 'smartCopy':
			_callback = getFileToBeOpened;
			_block = true;
			var date = new Date();
			var fileName = date.getDate().toString()+(date.getMonth()+1).toString()+date.getFullYear().toString()+date.getHours().toString()+date.getMinutes().toString()+date.getSeconds().toString()+date.getMilliseconds().toString()+".txt";
			extraArgs.tmpfilename = fileName;
			break;
		case 'import':
			_callback = getFileToBeOpened;
			_block = true;
			var date = new Date();
			var fileName = date.getDate().toString()+(date.getMonth()+1).toString()+date.getFullYear().toString()+date.getHours().toString()+date.getMinutes().toString()+date.getSeconds().toString()+date.getMilliseconds().toString()+".txt";
			extraArgs.tmpfilename = fileName;
		case 'commit':
		case 'quick_commit':
		case 'quick_import':
			_block = true;
			if (appResultObj) {
				extraArgs.epf = appResultObj;
			}
			break;
		case 'resolve-links':
			_callback = resolveLinks;
			_block = true;
			var date = new Date();
			var fileName = date.getDate().toString()+(date.getMonth()+1).toString()+date.getFullYear().toString()+date.getHours().toString()+date.getMinutes().toString()+date.getSeconds().toString()+date.getMilliseconds().toString()+".txt";
			extraArgs.tmpfilename = "relink_"+fileName;
			break;
	}
	extraArgs.block = _block;
	sendCommandRequest(getCommandParam(cmd, extraArgs), _callback);
}

function getFileToBeOpened( params ) {
	if (params && params.tmpfilename) {
		var funcName = '$._ext.readTmpFile("'+params.tmpfilename.toString()+'", "' + params.remotepath + '", "' + params.modifiedFlag + '", "' + ZmPluginInst.host.hostAppCode  +'")';
		executeCommonScript(funcName, null, null, null);
	}
}

function resolveLinks ( params ) {
	if(params && params.tmpfilename) {
//		showAlert("in resolveLinks");
		ZmPluginInst.host.resolveLinks(null, null, params);
	}
}

function issueCommandNoRefresh( cmd, filePath, extraArgs ) {
	if((ZmPluginInst.host && ZmPluginInst.host.isDefault) || !filePath) 
		hideProgress();
	if (ZmPluginInst.host && ZmPluginInst.host.isDefault === false && filePath) {
		issueCommand(cmd, null, {remotepath : filePath});
	} 
}

function getCommandParam(cmd, extraArgs) {
	var params = {
		cmdname : cmd,
		isPlugin : true
	};
	if (extraArgs) {
		for ( var prop in extraArgs) {
			params[prop] = extraArgs[prop];
		}
	}
	return params;
};