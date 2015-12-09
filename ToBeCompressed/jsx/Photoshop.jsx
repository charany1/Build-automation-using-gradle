$._ext_PHXS={
    run : function() {
    
    	/**********  Replace below sample code with your own JSX code  **********/
        var appName;	    
	    appName = "Hello Photoshop";	    
        alert(appName);
        /************************************************************************/
        
        return appName;
    },
    
    getFilePath : function( isRefresh, showNoFileError ) {
    	var filePath = "";
    	var resultStr;
    	try{
    		if (app && app.documents) {
    			var docLength = app.documents.length;
    			if(docLength > 0) {
    	            if(app.activeDocument) {
    	            	filePath = $._ext_PHXS.extractFilePath();
    	            	if((!filePath || (filePath && filePath == "")) && isRefresh !== 'true'){
    	            		filePath = "";
    	    	            alert (localize(FILE_OPEN_MSG));
    	            	}
    	            }
    	        } else if(isRefresh !== 'true' && showNoFileError == 'true'){
    	        	filePath = "";
    	            alert (localize(FILE_OPEN_MSG));
    	        }
    		} else if(isRefresh !== 'true' && showNoFileError == 'true'){
    			filePath = "";
	            alert (localize(FILE_OPEN_MSG));
	        }
    		resultStr = '{"isSuccess": "true", "data": "' + filePath + '"}';
    	}catch(e){
    		var error = e ? e.toString() : "";
    		if(error && isRefresh !== 'true') {
    			var errIndex = error.indexOf (localize(ERROR));
    		    if(errIndex === 0) {
    		    	error = error.substr(7);
    		    }
    		    alert(error);
    		}
    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';
    	}finally{
    		return resultStr;
    	}
    },
    
    extractFilePath : function () {
    	var filePath = "";
    	var ref = new ActionReference();  
        ref.putEnumerated( charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );  
        var desc = executeActionGet(ref);  
        if(desc.hasKey(stringIDToTypeID('fileReference'))) 
        	filePath = decodeURI(desc.getPath(stringIDToTypeID('fileReference')));
        return filePath;
    },
    
	 /*saveDocument : function() {
    	var isSaved = 'true';
    	var resultStr;
    	try {
    		if(app && app.activeDocument){
    			if(!app.activeDocument.saved){
    				app.activeDocument.save();
    			}
    			isSaved = app.activeDocument.saved
    		}
    		resultStr = '{"isSuccess": "true", "data": "' + isSaved + '"}';
    	}catch(e) {
    		alert (e);
    		var error = e ? e.toString() : "";
    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';
    	} finally {
    		return resultStr;
    	}
    },*/

    saveDocument : function( checkModified, modifiedFlag ) {
    	var isSaved = 'true';
    	var resultStr;// = '{"isSuccess": "false", "data": ""}';
    	try {
    		if(app && app.activeDocument){
    			isSaved = app.activeDocument.saved;
    			if(checkModified && checkModified == 'true' && isSaved == true && modifiedFlag && modifiedFlag == 'false') {
    				resultStr = '{"isSuccess": "false", "data": ""}';
    				alert(localize(NO_CHANGE_WC));
    			} else {
    				if(!app.activeDocument.saved){
    					$._ext_PHXS.saveFile();
        				//app.activeDocument.save();
        			}
        			isSaved = app.activeDocument.saved;
    			}
    		}
    		if(!resultStr)
    			resultStr = '{"isSuccess": "true", "data": "' + isSaved + '"}';
    	}catch(e) {
    		alert (e);
    		var error = e ? e.toString() : "";
    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';
    	} finally {
    		return resultStr;
    	}
    	
    },
    
    saveFile : function () {
    	var filePath = $._ext_PHXS.extractFilePath();
		var newFile = $._ext.normalizeFile(filePath);
		var idsave = charIDToTypeID( "save" );
	    var desc14 = new ActionDescriptor();
	    var idIn = charIDToTypeID( "In  " );
	    desc14.putPath( idIn, newFile );
	    var idsaveStage = stringIDToTypeID( "saveStage" );
	    var idsaveStageType = stringIDToTypeID( "saveStageType" );
	    var idsaveBegin = stringIDToTypeID( "saveBegin" );
	    desc14.putEnumerated( idsaveStage, idsaveStageType, idsaveBegin );
	    var idDocI = charIDToTypeID( "DocI" );
	    desc14.putInteger( idDocI, 35 );
	    executeAction( idsave, desc14, DialogModes.NO );

	// =======================================================
	    var idsave = charIDToTypeID( "save" );
	    var desc15 = new ActionDescriptor();
	    var idIn = charIDToTypeID( "In  " );
	    desc15.putPath( idIn, newFile );
	    var idDocI = charIDToTypeID( "DocI" );
	    desc15.putInteger( idDocI, 35 );
	    var idsaveStage = stringIDToTypeID( "saveStage" );
	    var idsaveStageType = stringIDToTypeID( "saveStageType" );
	    var idsaveSucceeded = stringIDToTypeID( "saveSucceeded" );
	    desc15.putEnumerated( idsaveStage, idsaveStageType, idsaveSucceeded );
	    executeAction( idsave, desc15, DialogModes.NO );
    },
    
    isChangesSaved : function () {
    	var isSaved = 'false';
    	var resultStr;
    	try {
    		if(app && app.activeDocument){
    			isSaved = app.activeDocument.saved;
    		}
    		resultStr = '{"isSuccess": "true", "data": "' + isSaved + '"}';
    	}catch(e) {
    		alert (e);
    		var error = e ? e.toString() : "";
    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';
    	} finally {
    		return resultStr;
    	}
    },
    
    openFile : function( filePath ) {
    	var errorStr = localize(FILE_OPEN_FAIL_MSG) + filePath.toString();
    	var resultStr = '{"isSuccess": "false", "error": "' + errorStr + '"}';
    	try {
    		if(app)  {
    			var file = $._ext.normalizeFile(filePath);
    			if(file.exists) {
    				app.open (file);
    				resultStr = '{"isSuccess": "true", "data": "success"}';
    			} else {
    				alert(localize(FILE_NOT_AVLBL));
    			} 
    		}
    	} catch (e) {
    		alert(e);
    	} finally {
    		return resultStr;
    	}
	},
    
    getExtractedData : function() {
    	var resultStr = '{"isSuccess": "true", "data": ""}';
    	try{
    		if(app){
        		if(app.activeDocument){
        			var doc = app.activeDocument;
        			var filePaths = null;
        			if(app.version && app.version < "15.2.1")
        				filePaths = $._ext_PHXS.getLinkedPaths();
        			var actvLayer = app.activeDocument.activeLayer;
        			var actvLayerVisibility = actvLayer.visible;
        			var theActiveHistoryState = app.activeDocument.activeHistoryState;
        			if(doc.layers.length > 0){
        				var xmldata = "<file><filename>"+$._ext.getFormattedStr($._ext_PHXS.getFileFSName())+"</filename><components>";
        				var linkedFileStr = "";
        				var index = 0;
        				w = new $._ext.createProgress(localize(LAYER_EXTRACT_PROGRESS), "", true);
        				for (var i=0; i < doc.layers.length; i++){
        					++index;
        					if(index > 100) {
        						var adj = Math.floor(index/100);
        	            		var progVal = index - 100 * adj;
        	            		w.updateProgress (progVal, "Layers extracted : "+index);
        	            	}
        	            	else { 
        	            		w.updateProgress (index, "Layers extracted : "+index);
        	            	}
        					$.sleep(100);
        					if(index % 30 == 0)
        						app.refresh();
        					
        					var resultObj = $._ext_PHXS.iteratePSComponents(doc.layers[i], index, filePaths);
        	                xmldata += resultObj.xmlStr;
        	                if(linkedFileStr && linkedFileStr.substring (0, 1) !== "|" && resultObj.linkedStr) {
        	                    linkedFileStr += "|";
        	                }
        	                linkedFileStr += resultObj.linkedStr ? resultObj.linkedStr : "";
        	                index = resultObj.index ? resultObj.index : index;
        					//xmldata += $._ext_PHXS.iteratePSComponents(doc.layers[i], theActiveHistoryState);
        				}
        				w.updateProgress (100);
        				w.close();
        				w = null;
        				xmldata += "</components></file>";
        				app.activeDocument.activeLayer = actvLayer;
        				try {
        					app.activeDocument.activeLayer.visible = actvLayerVisibility;
        				} catch(e) {
        					//do nothing - when there is only one layer and that's the background layer, changing visiblity gives errors
        				}
        				app.activeDocument.activeHistoryState = theActiveHistoryState;
        				try {
        					if(!app.activeDocument.saved){
        						$._ext_PHXS.saveFile();
                			}
        				} catch (e) {
        					//alert("Error while saving : "+e);
        				}
        				var xmlDataPath = $._ext.writeToFile(xmldata, null);
        				if(xmlDataPath)
        					resultStr = '{"isSuccess": "true", "data": "' + xmlDataPath + '", "linkedFileStr" : "' + linkedFileStr + '"}';
        				else
        					resultStr = '{"isSuccess": "false", "error": "' + localize(EXTRACT_LAYER_FAIL) + '"}';
        			}
        		}
        	}
    	} catch (e) {
    		var error = e ? e.toString() : "";
    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';
    	} finally {
    		if(w) {
    			//w.updateProgress (100);
				w.close();
				w=null;
    		}
    		return resultStr;
    	}
    },
    
    iteratePSComponents : function (thisLayer, index, filePaths) {
    	var visibility = thisLayer.visible;
        app.activeDocument.activeLayer = thisLayer;
        try {
        	app.activeDocument.activeLayer.visible = visibility;
        }catch(e){
        	//do nothing - when there is only one layer and that's the background layer, changing visiblity gives errors
        }        
        thisLayer.uid = index;
        //var xmlStr = $._ext_PHXS.getPSComponentDetails(thisLayer, theActiveHistoryState);
    	var resultObj = $._ext_PHXS.getPSComponentDetails(thisLayer, filePaths);
	    var xmlStr = (resultObj && resultObj.xmlStr) ? resultObj.xmlStr : "";
	    var linkedStr = (resultObj && resultObj.linkedStr) ? resultObj.linkedStr : "";
        if(thisLayer.typename.toLowerCase() == "LayerSet".toLowerCase() && thisLayer.layers.length > 0){
            for(var lsIndex = 0; lsIndex < thisLayer.layers.length; lsIndex++){
            	++index;
            	if(index > 100) {
            		var adj = Math.floor(index/100);
            		var progVal = index - 100 * adj;
            		w.updateProgress (progVal, localize(LAYER_EXTRACT_PROGRESS_LBL)+index);
            	}
            	else {
            		w.updateProgress (index, localize(LAYER_EXTRACT_PROGRESS_LBL)+index);
            	} 
				$.sleep(100);
				if(index % 30 == 0)
					app.refresh();
                //xmlStr += $._ext_PHXS.iteratePSComponents(thisLayer.layers[lsIndex], theActiveHistoryState);
            	 resultObj =  $._ext_PHXS.iteratePSComponents(thisLayer.layers[lsIndex], index, filePaths);
                 xmlStr += resultObj.xmlStr;
                 if(linkedStr && linkedStr.substring (0, 1) !== "|" && resultObj.linkedStr) {
                     linkedStr += "|";
                 }
                 linkedStr += resultObj.linkedStr;
                 index = resultObj.index ? resultObj.index : index;
             }
        }
        //return xmlStr;
        return {xmlStr: xmlStr, linkedStr: linkedStr, index: index};
    },
    
    openSmartObject : function () {
    	try {
            var idplacedLayerEditContents = stringIDToTypeID( "placedLayerEditContents" );
            var desc3 = new ActionDescriptor();
            executeAction( idplacedLayerEditContents, desc3, DialogModes.NO );
            //var layerPath = app.activeDocument.fullName.fsName;
            var layerPath = $._ext_PHXS.getFileFSName();
            var linkedPath = "";
            if(File.fs != "Macintosh")
            	linkedPath = decodeURI(app.activeDocument.fullName);
            else
            	linkedPath = layerPath;
            app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
            return {layerPath: layerPath, linkedPath: linkedPath};
            //return layerPath;
        } catch (e) {
        	alert(e);
        	alert (localize(SEL_LAYER_MSG));
        	throw(e);
        }
    },
    
    getSOAsDocProps : function( smartDoc, filePaths ) {
    	var smartDocXML = "";
    	var linkedFileStr = "";
    	var linkedFlag = 0;
        if(smartDoc) {
	    	if(filePaths && filePaths.length > 0 && smartDoc.layerPath) {
	            var linkedFileIndex = filePaths.indexOf(smartDoc.layerPath.toString());
	            if(linkedFileIndex >= 0)
	                linkedFlag = 1;
	        }
            smartDocXML += $._ext.convertToXML(linkedFlag, "isLinked");
            if(linkedFlag == 1){
            	smartDocXML += $._ext.convertToXML(smartDoc.layerPath.toString(), "Location");
			    linkedFileStr = smartDoc.linkedPath.toString();
            } else {
                smartDocXML += $._ext.convertToXML("", "Location");
             }
         } else {
             smartDocXML += $._ext.convertToXML("", "isLinked");
             smartDocXML += $._ext.convertToXML("", "Location");
         }
        return {xml: smartDocXML, linkedFileStr: linkedFileStr};
	},
	
	getPSComponentDetails : function( thisLayer, filePaths ) {
		var xml = "<component compId=\""+thisLayer.uid+"\">";
	    try {
			xml += $._ext.convertToXML(thisLayer.name, "name");
		} catch(e) {
			xml += $._ext.convertToXML("", "name");
		}
		
		try {
			xml += $._ext.convertToXML(Math.round(thisLayer.opacity) +"%", "Opacity");
		} catch(e) {
			xml += $._ext.convertToXML("", "Opacity");
		}

	    try {
			xml += $._ext.convertToXML(thisLayer.typename, "Type");
		} catch(e) {
			xml += $._ext.convertToXML("", "Type");
		}
	                
	    try {
	        xml += $._ext.convertToXML(thisLayer.parent.typename, "Parent Type");
	    } catch(e) {
	        xml += $._ext.convertToXML("", "Parent Type");
	    }
	    

	    try {
			xml += $._ext.convertToXML(thisLayer.parent.name, "parent");
		} catch(e) {
			xml += $._ext.convertToXML("", "parent");
		}
		
	    try {
			if(thisLayer.parent.typename.toLowerCase() == "LayerSet".toLowerCase()){
		        xml += $._ext.convertToXML(thisLayer.parent.uid, "parentId");
		    }else{
		        xml += $._ext.convertToXML("", "parentId");
		    }
		} catch(e) {
			xml += $._ext.convertToXML("", "parentId");
		}

	    try {
	    	if(thisLayer.typename.toLowerCase() == "LayerSet".toLowerCase()){
				xml += $._ext.convertToXML("", "Kind");
			}else{
				xml += $._ext.convertToXML(thisLayer.kind.toString(), "Kind");
			}
		} catch(e) {
			xml += $._ext.convertToXML("", "Kind");
		}
		var soResultObj;
		var linkedStr;
		if(thisLayer.kind == LayerKind.SMARTOBJECT){
			if(app.version >= "15.2.1") {
				soResultObj = $._ext_PHXS.getSODtlsFromProps();
			} else {
				var currSmartObject = $._ext_PHXS.openSmartObject();
		        soResultObj = $._ext_PHXS.getSOAsDocProps( currSmartObject, filePaths);
			}
	    }else{
	    	soResultObj = $._ext_PHXS.getSOAsDocProps( null, filePaths );
	    }
		if(soResultObj) {
	        xml += soResultObj.xml ? soResultObj.xml : "";
	        linkedStr = soResultObj.linkedFileStr ? soResultObj.linkedFileStr : "";
	    }
	    xml += "</component>";
	    return {xmlStr: xml, linkedStr: linkedStr};
		//return xml;
	},
    
	closeActiveDocument : function() {
		if (app && app.activeDocument) {
			app.activeDocument.close(SaveOptions.SAVECHANGES);
			return '{"isSuccess": "true", "data": "' + true + '"}';;
		}
		return '{"isSuccess": "true", "data": "' + false + '"}';
	},
	
	resolveLinks : function(tmpFileName) {
		var filePath = "";
    	var resultStr = '{"isSuccess": "true", "data": "success"}';;
    	try{
    		if (app && app.documents) {
				var docLength = app.documents.length;
				var fileMap = $._ext.getLinkedFileMap(tmpFileName);
	            var doc =  app.activeDocument;
	            if(doc.layers && doc.layers.length > 0 && fileMap) {
	            	var uid = 0;
	                var actvLayer = doc.activeLayer;
	                var actvLayerVisibility = actvLayer.visible;
	                for (var i=0; i < doc.layers.length; i++){
	                    uid = $._ext_PHXS.iterateAndRelink(doc.layers[i], ++uid, fileMap);
	                }
	                app.activeDocument.activeLayer = actvLayer;
	                try {
	                	app.activeDocument.activeLayer.visible = actvLayerVisibility;	
	                }catch (e) {
	                	//do nothing - when there is only one layer and that's the background layer, changing visiblity gives errors
	                }
	             }
	        }
    		$._ext_PHXS.saveDocument();
    		alert(localize(RESOLVE_LINKS_MSG));
    		resultStr = '{"isSuccess": "true", "data": "success"}';
    	}catch(e){
    		var error = e ? e.toString() : "";
    		alert(localize(RESOLVE_LINKS_FAIL_MSG)+error);
    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';
    	}finally{
    		//alert(resultStr);
    		return resultStr;
    	}
	},
	
	iterateAndRelink : function(thisLayer, uid, fileMap) {
		var visibility = thisLayer.visible;
        app.activeDocument.activeLayer = thisLayer;
        try {
        	app.activeDocument.activeLayer.visible = visibility;	
        }catch (e) {
        	//do nothing - when there is only one layer and that's the background layer, 
        	//changing visiblity gives errors, hence try-catch block
        }
        if(fileMap && (uid in fileMap)) {
        	var resolveObj = fileMap[uid];
        	if(resolveObj) {
	        	var replacePath = resolveObj.newPath;
	            var replaceFile = $._ext.normalizeFile(replacePath);
	            if (!replaceFile || !replaceFile.exists)
	        		replaceFile = $._ext.searchLinksFromExtFolders(resolveObj);
	            if(replaceFile && replaceFile.exists && thisLayer.kind == LayerKind.SMARTOBJECT) {
	            	$._ext_PHXS.relinkSO(replaceFile);
	            }
        	}
        }
	    if(thisLayer.layers && thisLayer.layers.length > 0){
	        for(var lsIndex = 0; lsIndex < thisLayer.layers.length; lsIndex++){
	            uid = $._ext_PHXS.iterateAndRelink(thisLayer.layers[lsIndex], ++uid, fileMap);
	        }
	    }
	    return uid;
	},
	
	relinkSO : function( relinkFile ) {
	    var idplacedLayerReplaceContents = stringIDToTypeID( "placedLayerReplaceContents" );
	    var desc5 = new ActionDescriptor();
	    var idnull = charIDToTypeID( "null" );
	    desc5.putPath( idnull, new File( relinkFile ) );
	    executeAction( idplacedLayerReplaceContents, desc5, DialogModes.NO )
	},
	
	getLinkedPaths : function() {
		var filePaths = new Array();
		var osName = $.os;
		if (osName){
			//var filePath = $._ext_PHXS.getFileFSName();
		    $._ext.loadXMPLibrary();
		    /*var xmpFile = new XMPFile (filePath, XMPConst.UNKNOWN, XMPConst.OPEN_FOR_READ);
		    if(xmpFile) {*/
		    if(app.activeDocument.xmpMetadata) {
		        var xmp = new XMPMeta(app.activeDocument.xmpMetadata.rawData);//xmpFile.getXMP();
		        if(xmp) {
		            var count = xmp.countArrayItems(XMPConst.NS_XMP_MM, "Ingredients");
		            for(var i = 1; i <= count; i++) {
		                var item=  xmp.getProperty(XMPConst.NS_XMP_MM, "Ingredients[" + i + "]/stRef:filePath");
		                var formattedPath;
		                if(osName.indexOf("Mac") >= 0) {
		                	formattedPath = decodeURIComponent(item).replace("file://", "");
		                	if(formattedPath && formattedPath.charAt(0) != '/') {
		                		var index = formattedPath.indexOf('/');
		                		formattedPath = formattedPath.substring(index);
		                	}
		                }else {
		                	formattedPath = unescape(item).replace("file:///","").replace(/\//g, "\\");
		                }
		                filePaths[i-1]=formattedPath;
		            }
		        }
		    }
		    //xmpFile.closeFile(XMPConst.CLOSE_UPDATE_SAFELY);
		    $._ext.unloadXMPLibrary();
		    if (typeof Array.prototype.indexOf != "function") {  
		        Array.prototype.indexOf = function (el) {  
	            for(var i = 0; i < this.length; i++) if(el === this[i]) return i;  
	            	return -1;  
	            }  
		    } 
		}
		return filePaths;
	},
	
    showApp : function () {
    	alert("Hello User from photoshop");
    },
    
    getFileFSName : function() {
		var filePath = $._ext_PHXS.extractFilePath();
		if (!filePath || filePath == "")
			return "";
		/*if (File.fs != "Macintosh") {
			var fsFile = File(filePath);
			return fsFile.fsName;
		}*/
		var newFile = $._ext.normalizeFile(filePath);
		/*var osName = $.os;
		var thisFile = File(filePath);
		var fileFsName = thisFile.fsName;
		if(osName && osName.indexOf("Mac") < 0) {
			return fileFsName;
		}
		var volLen = "/Volumes".length;
		if(fileFsName.indexOf("/Volumes") == 0) {
			return fileFsName.substring(volLen);
		}*/
		return newFile.fsName;
	},
	
	getSODtlsFromProps : function() {
		var smartDocXML = "";
        var linkedFileStr = "";
        var linkedFlag = 0;
        var ref = new ActionReference(); 
        ref.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') ); 
        var desc = executeActionGet(ref); 
        var isLinked = executeActionGet(ref).getObjectValue(stringIDToTypeID('smartObject')).hasKey(charIDToTypeID('Lnk '));
        if(isLinked) {
        	var linkedPath = "";
        	try {
        		linkedPath = executeActionGet(ref).getObjectValue(stringIDToTypeID('smartObject')).getString(charIDToTypeID('Lnk ')); 
            }catch(e) {
            	var path = executeActionGet(ref).getObjectValue(stringIDToTypeID('smartObject')).getPath(charIDToTypeID('Lnk ')); 
                var pathFile = File(path);
                linkedPath = pathFile.fsName;
            }
            var linkedFile = $._ext.normalizeFile(linkedPath);
            //var layerPath = linkedFile.fsName;
            var layerPath = "";
            if(File.fs != "Macintosh") {
            	linkedFileStr = decodeURI(linkedFile.fullName);
            	layerPath = linkedFile.fsName;
            }
            else {
            	linkedFileStr = layerPath = $._ext.getNormalizedLinkPath(linkedPath);
            }
            smartDocXML += $._ext.convertToXML(1, "isLinked");
            smartDocXML += $._ext.convertToXML(layerPath, "Location");
        } else {
            smartDocXML += $._ext.convertToXML(0, "isLinked");
            smartDocXML += $._ext.convertToXML("", "Location");
        }
        return {xml: smartDocXML, linkedFileStr: linkedFileStr};
	},
    
};