var TIMEOUT_ERROR_STR = "ERROR: LAYER_TIMEOUT";
/*function showProgress() {
	jQuery( "#overlay" ).show();
}

function hideProgress() {
	jQuery( "#overlay" ).hide();
}
*/
function setCancelFlag() {
	var funcName = '$._ext.setLayerCancelFlag()';
	executeCommonScript(funcName, null, null, null);
}

function setUserDtls(userName, serverAlias) {
	if(userName && serverAlias) {
		var userDetails = userName + "@" + serverAlias;
		gUserName = userName;
		document.getElementById("settingsBtn").title = userDetails;
		document.getElementById("userDtls").innerHTML = userDetails;
	} else {
		gUserName = null;
		document.getElementById("settingsBtn").title = "";
		document.getElementById("userDtls").innerHTML = "";
	}
}

function updateLocaleTexts(appName, appUILocale, thisOS, appSkininfo) {
	document.getElementById("chkIntxt").innerHTML = resourceBundle.CHK_IN_LABEL;
    document.getElementById("quickChkInTxt").innerHTML = resourceBundle.QUICK_CHK_IN_LABEL;
    document.getElementById("lockUnlockTxt").innerHTML = resourceBundle.LOCK_UNLOCK_LABEL;
    document.getElementById("smartCpyTxt").innerHTML = resourceBundle.SMART_COPY_LABEL;
    document.getElementById("revertTxt").innerHTML = resourceBundle.REVERT_LABEL;
    document.getElementById("updateTxt").innerHTML = resourceBundle.UPDATE_LABEL;
    document.getElementById("browserTxt").innerHTML = resourceBundle.BROWSE_LABEL;
    document.getElementById("taskManagerTxt").innerHTML = resourceBundle.WORKFLOW_LABEL;
    if (thisOS.indexOf("Mac") >= 0)
    	document.getElementById("revealTxt").innerHTML = resourceBundle.REVEAL_LABEL_MAC;
    else
    	document.getElementById("revealTxt").innerHTML = resourceBundle.REVEAL_LABEL;
    document.getElementById("statTxt").innerHTML = resourceBundle.STAT_LABEL;
    document.getElementById("resolveLinkTxt").innerHTML = resourceBundle.RESOLVE_LINKS_LABEL;
    document.getElementById("getLockTxt").innerHTML = resourceBundle.GET_LOCKS_LABEL;
    document.getElementById("releaseLockTxt").innerHTML = resourceBundle.RELEASE_LOCK_LABEL;
    document.getElementById("revChangeTxt").innerHTML = resourceBundle.REV_CHANGE_LABEL;
    document.getElementById("revRenamedTxt").innerHTML = resourceBundle.REV_RENAMED_LABEL;
    document.getElementById("revMovedTxt").innerHTML = resourceBundle.REV_MOVED_LABEL;
    document.getElementById("revAddedTxt").innerHTML = resourceBundle.REV_ADDED_LABEL;
    document.getElementById("revAllTxt").innerHTML = resourceBundle.REV_ALL_LABEL;
    document.getElementById("settingsHdr").innerHTML = resourceBundle.USER_SETTINGS;
    document.getElementById("extractLyrTxt").innerHTML = resourceBundle.EXTRACT_LYR;
    document.getElementById("thumbTxt").innerHTML = resourceBundle.GENERATE_THUMB;
    document.getElementById("saveBtn").innerHTML = resourceBundle.SAVE;
    document.getElementById("cancelBtn").innerHTML = resourceBundle.CANCEL;
        
    document.getElementById("imod").title = resourceBundle.MOD_ICON_TOOLTIP;
    document.getElementById("ilock").title = resourceBundle.LOCK_ICON_TOOLTIP;
    document.getElementById("iver").title = resourceBundle.VER_ICON_TOOLTIP;
    if(appName != 'AEFT')
    	document.getElementById("refreshImg").title = resourceBundle.REFRESH_BTN_TOOLTIP+resourceBundle.AUTO_REFRESH_TOOLTIP;
    else 
    	document.getElementById("refreshImg").title = resourceBundle.REFRESH_BTN_TOOLTIP;
    document.getElementById("chkinTd").title = resourceBundle.CHK_IN_TOOLTIP;
    document.getElementById("quickChkinTd").title = resourceBundle.QUICK_CHK_IN_TOOLTIP;
    document.getElementById("lockUnlockTd").title = resourceBundle.LOCK_UNLOCK_TOOLTIP;
    document.getElementById("smartCopyTd").title = resourceBundle.SMART_COPY_TOOLTIP;
    document.getElementById("revertTd").title = resourceBundle.REVERT_TOOLTIP;
    document.getElementById("updateTd").title = resourceBundle.UPDATE_TOOLTIP;
    document.getElementById("browseTd").title = resourceBundle.BROWSE_TOOLTIP;
    document.getElementById("wfTd").title = resourceBundle.WORKFLOW_TOOLTIP;
    document.getElementById("rvlTd").title = resourceBundle.REVEAL_TOOLTIP;
    document.getElementById("statTd").title = resourceBundle.STAT_TOOLTIP;
    document.getElementById("resolveLinks").title = resourceBundle.RESOLVE_LINKS_TOOLTIP;
    
    document.getElementById("searchInput").placeholder = resourceBundle.SEARCH_TXT;
    
    var fontHeight = appSkininfo ? appSkininfo.baseFontSize : 0;
    //if (appUILocale && appUILocale.indexOf("es_") >= 0 && ((thisOS.indexOf("Mac") >= 0 && fontHeight > 9) || (thisOS.indexOf("Mac") < 0 && fontHeight > 10))) {
    if (appUILocale && (appUILocale.indexOf("es_") >= 0 || appUILocale.indexOf("fr_") >= 0 ) ) {
    	jQuery( "#browseDiv" ).css({"padding-bottom": 38+".px"});
    	jQuery( "#wfDiv" ).css({"padding-bottom": 38+".px"});
    	if(appUILocale.indexOf("fr_") >= 0){
    		jQuery( "#rvlDiv" ).css({"padding-bottom": 38+".px"});
        	jQuery( "#statDiv" ).css({"padding-bottom": 38+".px"});
    	}
	}
}

function loadUI() {
	jQuery( "#overlay" ).hide();
	jQuery( "#progressOverlay" ).hide();
	jQuery( "#resolveLinks" ).hide();	
	jQuery( "#getThumb" ).hide();
	jQuery( "#thumbTxt" ).hide();
	jQuery( "#continuousprogress" ).progressbar({
		value: false
    });
	var hostApp = getHostApp();
	if(hostApp && (hostApp === 'PHXS' || hostApp === 'PHSP' || hostApp === 'ILST' || hostApp === 'AEFT' || hostApp === 'IDSN' || hostApp === 'PPRO'))
		jQuery( "#resolveLinks" ).show();
	if(hostApp && (hostApp == 'AEFT' || hostApp == 'PPRO')) {
		jQuery( "#getThumb" ).show();
		jQuery( "#thumbTxt" ).show();
	}
	jQuery(document).click (function(event) {
		jQuery( "#lockMenu" ).hide();	
		jQuery( "#revertMenu" ).hide();	
		if(jQuery(event.target).closest("div").attr('id') === 'lockDiv') { 
			//jQuery( "#lockMenu" ).css({"top": event.pageY+".px", "left": event.pageX+".px"}).show();
			var lockIcon = jQuery("#lockDiv");
			var pos = lockIcon.position();
			jQuery( "#lockMenu" ).css({"top": (Math.abs(pos.top)+24)+"px", "left": Math.abs(pos.left)+"px"}).show();
		}else if(jQuery(event.target).closest("div").attr('id') === 'revertDiv') {  
			//jQuery( "#revertMenu" ).css({"top": event.pageY+".px", "left": event.pageX+".px"}).show();
			var revertIcon = jQuery("#revertDiv");
			var pos = revertIcon.position();
			jQuery( "#revertMenu" ).css({"top": (Math.abs(pos.top)+24)+"px", "left": Math.abs(pos.left)+"px"}).show();
		}else if(jQuery(event.target).closest("div").attr('class') === 'divBtn'){
			launchCommand(jQuery(event.target).closest("div").attr('data-command'), 'false');
		}
	});
	jQuery( ".hiddenMenu tr" ).click(function(event){
		launchCommand(jQuery(this).attr('id'), 'false');
	});
	jQuery(" #refreshBtn ").click(function(){
		launchCommand('refresh', 'true');
	});
 	// Added by : Nishant
	jQuery("#searchInput").keypress(function(event){                                     // to trace 'enter' button 
		var keycode = (event.keyCode ? event.keyCode : event.which);					
		if(keycode == '13'){															// '13' is keycode of enter
			//alert("pressed enter");
			launchSearch();
		}
	});
	jQuery(" #settingsBtn ").click(function(){
		updateProgress(resourceBundle.LOAD_SETTINGS, true);
		launchCommand('loadSettings', 'true');
		//readUserSettings(updatePropUI, null, null);
		//jQuery( "#overlay" ).show();		
	});
	jQuery(" #cancelBtn ").click(function(){
		jQuery( "#overlay" ).hide();
	});
	jQuery(" #saveBtn ").click(function(){
		updateProgress(resourceBundle.UPDATE_SETTINGS, true);
		launchCommand('saveSettings', 'true');
		//saveProperty();
	});
	//jQuery( " #settingsBtn " ).tooltip();
	/*jQuery(" #progressBtn ").click(function(){
		jQuery( "#overlay" ).show();
		//jQuery( "#progImg" ).show();
	});*/
	/* jQuery( "#progressbar" ).progressbar({
		value: false;
	}); */
	executeCommonScript("$._ext.getZoomProps()");
}

function updateProgress(progressTxt, showFlag){
	jQuery( "#progressTxt" ).html(progressTxt);
	if(showFlag)
		jQuery( "#progressOverlay" ).show();
}

function hideProgress() {
	jQuery( "#progressOverlay" ).hide();
	jQuery( "#progressTxt" ).html("");
}

function getCmdLabel(cmd) {
	var cmdLabel = "";
	switch(cmd) {
		case "checkIn":
		case "import":
		case "commit":
			cmdLabel = resourceBundle.CHK_IN_LABEL;
			break;
		case "quickChkIn":
		case "quick_import":
		case "quick_commit":
			cmdLabel = resourceBundle.QUICK_CHK_IN_LABEL;
			break;
		case "lock":
			cmdLabel = resourceBundle.GET_LOCKS_LABEL;
			break;
		case "unlock":
			cmdLabel = resourceBundle.RELEASE_LOCK_LABEL;
			break;
		case "smartCopy":
			cmdLabel = resourceBundle.SMART_COPY_LABEL;
			break;
		case "revertdata" : 
			cmdLabel = resourceBundle.REV_CHANGE_LABEL;
			break;
		case "revertrenamed":
			cmdLabel = resourceBundle.REV_RENAMED_LABEL;
			break;
		case "revertmove" :
			cmdLabel = resourceBundle.REV_MOVED_LABEL;
			break;
		case "revertadd":
			cmdLabel = resourceBundle.REV_ADDED_LABEL;
			break;
		case "revertall":
			cmdLabel = resourceBundle.REV_ALL_LABEL;
			break;
		case "update":
			cmdLabel = resourceBundle.UPDATE_LABEL;
			break;
		case "asset_browser":
			cmdLabel = resourceBundle.VAB_LAUNCH;
			break;
		case "workflow":
			cmdLabel = resourceBundle.WORKFLOW_LABEL;
			break;
		case "reveal":
			cmdLabel = document.getElementById("revealTxt").innerHTML;
			break;
		case "status":
			cmdLabel = resourceBundle.STAT_LABEL;
			break;
		case "resolve-links":
			cmdLabel = resourceBundle.RESOLVE_LINKS_LABEL;
			break;
	}
	return " "+cmdLabel;
}