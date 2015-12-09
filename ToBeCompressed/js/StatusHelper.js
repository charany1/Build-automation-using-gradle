var CONFLICTED = (function() {
    var status = "conflicted";
    var statusCode = 0;
    function getStatusCode(){ return statusCode; }
    function getStatus(){ return status; }
    return {
        getStatus: getStatus,
        getStatusCode: getStatusCode
    };
})();

var MODIFIED = (function() {
    var status = "modified";
    var statusCode = 1;
    function getStatusCode(){ return statusCode; }
    function getStatus(){ return status; }
    return {
        getStatus: getStatus,
        getStatusCode: getStatusCode
    };
})();

var DELETED = (function() {
    var status = "deleted";
    var statusCode = 2;
    function getStatusCode(){ return statusCode; }
    function getStatus(){ return status; }
    return {
        getStatus: getStatus,
        getStatusCode: getStatusCode
    };
})();

var READONLY = (function() {
    var status = "read only";
    var statusCode = 3;
    function getStatusCode(){ return statusCode; }
    function getStatus(){ return status; }
    return {
        getStatus: getStatus,
        getStatusCode: getStatusCode
    };
})();

var LOCKED = (function() {
    var status = "locked";
    var statusCode = 4;
    function getStatusCode(){ return statusCode; }
    function getStatus(){ return status; }
    return {
        getStatus: getStatus,
        getStatusCode: getStatusCode
    };
})();

var ADDED = (function() {
    var status = "added";
    var statusCode = 5;
    function getStatusCode(){ return statusCode; }
    function getStatus(){ return status; }
    return {
        getStatus: getStatus,
        getStatusCode: getStatusCode
    };
})();

var UPTO_DATE_NEEDED = (function() {
    var status = "upto date needed";
    var statusCode = 6;
    function getStatusCode(){ return statusCode; }
    function getStatus(){ return status; }
    return {
        getStatus: getStatus,
        getStatusCode: getStatusCode
    };
})();

var RENAMED = (function() {
    var status = "renamed";
    var statusCode = 7;
    function getStatusCode(){ return statusCode; }
    function getStatus(){ return status; }
    return {
        getStatus: getStatus,
        getStatusCode: getStatusCode
    };
})();

var NO_CHANGE = (function() {
	var status = "no change";
    var statusCode = 8;
    function getStatusCode(){ return statusCode; }
    function getStatus(){ return status; }
    return {
        getStatus: getStatus,
        getStatusCode: getStatusCode
    };
})();

var UNVERSIONED = (function() {
    var status = "unversioned";
    var statusCode = 9;
    function getStatusCode(){ return statusCode; }
    function getStatus(){ return status; }
    return {
        getStatus: getStatus,
        getStatusCode: getStatusCode
    };
})();

var IGNORED = (function() {
    var status = "ignored";
    var statusCode = 10;
    function getStatusCode(){ return statusCode; }
    function getStatus(){ return status; }
    return {
        getStatus: getStatus,
        getStatusCode: getStatusCode
    };
})();

var NON_WORKING_COPY = (function() {
    var status = "non working copy";
    var statusCode = 11;
    function getStatusCode(){ return statusCode; }
    function getStatus(){ return status; }
    return {
        getStatus: getStatus,
        getStatusCode: getStatusCode
    };
})();

var MOVED = (function() {
	var status = "moved";
    var statusCode = 12;
    function getStatusCode(){ return statusCode; }
    function getStatus(){ return status; }
    return {
        getStatus: getStatus,
        getStatusCode: getStatusCode
    };
})();

var VERSIONED = (function() {
    var status = "versioned";
    var statusCode = 13;
    function getStatusCode(){ return statusCode; }
    function getStatus(){ return status; }
    return {
        getStatus: getStatus,
        getStatusCode: getStatusCode
    };
})();

var RESURRECTED = (function() {
    var status = "resurrected";
    var statusCode = 14;
    function getStatusCode(){ return statusCode; }
    function getStatus(){ return status; }
    return {
        getStatus: getStatus,
        getStatusCode: getStatusCode
    };
})();

function isNonWc( statusCode ){
	if(statusCode < 0)
		statusCode=statusCode*-1;
	return statusCode == NON_WORKING_COPY.getStatusCode();
}

function isWc( statusCode ){
	return !(isNonWc(statusCode));
}

function isUnVersioned( statusCode ){
	if(statusCode < 0)
		statusCode=statusCode*-1;
	return statusCode == UNVERSIONED.getStatusCode() || statusCode == IGNORED.getStatusCode();
}

function isVersioned( statusCode ){
	if(statusCode < 0)
		statusCode=statusCode*-1;
	return statusCode <= NO_CHANGE.getStatusCode() || statusCode >= MOVED.getStatusCode();
}

/*function isLocked( statusCode ){
	if(statusCode < 0)
		statusCode=statusCode*-1;
	return statusCode <= NO_CHANGE.getStatusCode() || statusCode >= MOVED.getStatusCode();
}*/

/*function isModified( statusCode ){
	if(statusCode < 0)
		statusCode=statusCode*-1;
	showAlert("statusCode : "+statusCode);
	return statusCode <= NO_CHANGE.getStatusCode() || statusCode >= MOVED.getStatusCode();
}*/


function isModified (code, bitset) {
	if(!isVersioned(code))
		return !isVersioned(code);
	var isMod = isModifiedBit(bitset);
	var isName = isRenameorMoveBit(bitset);
	return (isMod || isName);
}

function isLockedBit(actionBits) {
	return (actionBits & lockedMask) != 0;
}

function isModifiedBit(actionBits){
	return (actionBits & modifyMask) != 0;
}		

function isRenameorMoveBit(actionBits){
	return isRenamedBit(actionBits) || isMoveBit(actionBits);
}

function isRenamedBit(actionBits){
	return (actionBits & renameMask) != 0;
}

function isMoveBit(actionBits){
	return (actionBits & moveMask) != 0;
}

function refreshStatus ( statusObj ){
	var code = statusObj.code;
	var bitset = statusObj.bitset;
	if (code < 0)
		code = -code;
	updateVersionStatus(code);
	updateLockStatus(code, bitset);
	updateModStatus(code, bitset);
	if(ZmPluginInst.host && ZmPluginInst.host.hostAppCode && ZmPluginInst.host.hostAppCode !== 'AEFT') {
		callTimer();
	}
}

function updateVersionStatus (code) {
	if(isVersioned(code)) {
		jQuery( "#iver" ).attr("src", "./assets/green.png");
		jQuery( "#iver" ).attr("title", resourceBundle.IS_VER);
	} else {
		jQuery( "#iver" ).attr("src", "./assets/red.png");
		if (isNonWc(code)) {
			jQuery( "#iver" ).attr("title", resourceBundle.NOT_WC);
		}else {
			jQuery( "#iver" ).attr("title", resourceBundle.NOT_VER);
		}
	}
}

function updateModStatus (code, bitset) {
	if(!isVersioned(code)) {
		jQuery( "#imod" ).attr("src", "./assets/red.png");
		jQuery( "#imod" ).attr("title", resourceBundle.UNKNOWN_MOD);
		return;
	}
	
	var isMod = isModifiedBit(bitset);
	var isName = isRenameorMoveBit(bitset);
	if (isMod || isName) {
		jQuery( "#imod" ).attr("src", "./assets/red.png");
		var msg;
        if (isMod && isName)
            msg = resourceBundle.IS_MOD_NAME;
        else {
            msg = isMod ? resourceBundle.IS_MOD : resourceBundle.IS_NAME;
        }
        jQuery( "#imod" ).attr("title", msg);
	} else {
		jQuery( "#imod" ).attr("src", "./assets/green.png");
		jQuery( "#imod" ).attr("title", resourceBundle.NOT_MOD);
	}
	return (isMod || isName);
}

function updateLockStatus (code, bitset) {
	if(!isVersioned(code)){
		jQuery( "#ilock" ).attr("src", "./assets/orange.png");
		jQuery( "#ilock" ).attr("title", resourceBundle.UNKNOWN_LOCK);
		return;
	}
	if (isLockedBit(bitset)) {
		jQuery( "#ilock" ).attr("src", "./assets/lock_small.png");
		jQuery( "#ilock" ).attr("title", resourceBundle.IS_LOCKED);
	} else {
		jQuery( "#ilock" ).attr("src", "./assets/lock_open.png");
		jQuery( "#ilock" ).attr("title", resourceBundle.NOT_LOCKED);
	}
}

function refreshBlankFileStatus (){
	jQuery( "#iver" ).attr("src", "./assets/orange.png");
	jQuery( "#imod" ).attr("src", "./assets/orange.png");
	jQuery( "#ilock" ).attr("src", "./assets/orange.png");
	jQuery( "#iver" ).attr("title", resourceBundle.VER_ICON_TOOLTIP);
	jQuery( "#imod" ).attr("title", resourceBundle.MOD_ICON_TOOLTIP);
	jQuery( "#ilock" ).attr("title", resourceBundle.LOCK_ICON_TOOLTIP);
	if(ZmPluginInst.host && ZmPluginInst.host.hostAppCode && ZmPluginInst.host.hostAppCode !== 'AEFT') {
		callTimer();
	}
}


var addMask = 1;
var renameMask = 2;
var moveMask = 4;
var deleteMask = 8;
var renameOrMoveMask = 6;
var modifyMask = 16;      //Shows change in content
var lockedMask = 32;
var conflictMask = 64;