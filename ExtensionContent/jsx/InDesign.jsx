$._ext_IDSN={
    run : function() {
    
    	/**********  Replace below sample code with your own JSX code  **********/
        var appName;	    
	    appName = "Hello InDesign";	    
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
    	            	try{
    	            		var pathURI = $._ext.getNormalizedFSName(app.activeDocument.fullName);
        	    		    if(pathURI){    
        	    		      filePath =  decodeURI(pathURI);
        	    		    }
    	            	} catch (err) {
    	            		if(isRefresh !== 'true' && showNoFileError == 'true'){
    	            			filePath = "";
    	            			alert(localize(FILE_OPEN_MSG));
    	            		}
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
    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';
    	}finally{
    		return resultStr;
    	}
    },
    
    saveDocument : function() {
    	var isSaved = 'true';
    	var resultStr;
    	try {
    		if(app && app.activeDocument){
    			isSaved = app.activeDocument.save();
    		}
    		resultStr = '{"isSuccess": "true", "data": "true"}';
    	}catch(e) {
    		alert (e);
    		var error = e ? e.toString() : "";
    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';
    	} finally {
    		return resultStr;
    	}
    },
    
    openFile : function( filePath ) {
    	var errorStr = localize(FILE_OPEN_FAIL_MSG)+filePath.toString();
    	var resultStr = '{"isSuccess": "false", "error": "' + errorStr + '"}';
    	try {
    		if(app)  {
    			var file = $._ext.normalizeFile(filePath);
    			if(file.exists) {
    				filePath = file.fsName;
    				app.open(filePath, true, OpenOptions.OPEN_ORIGINAL);
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
	
	
    preCommitHook : function () {
    	var resultStr = '{"isSuccess": "true", "data": ""}';
    	try{
    		if(app) {
        		app.jpegExportPreferences.exportResolution = 96; //dpi
                app.jpegExportPreferences.jpegQuality = JPEGOptionsQuality.MEDIUM;
                app.jpegExportPreferences.jpegExportRange = ExportRangeOrAllPages.EXPORT_RANGE;
                app.jpegExportPreferences.pageString = "1";
                
                if(app.activeDocument) {
                	var myDoc = app.activeDocument;
                    var pages = myDoc.pages;
                    var page = pages.firstItem();
                    app.jpegExportPreferences.pageString = page.name;
                    var pathURI = $._ext.getNormalizedFSName(myDoc.filePath);
                    var previewFile = new File (pathURI+"//.zmpreview-"+myDoc.name+".jpg");
                    if(previewFile.exists)
                    	previewFile.remove();
                    myDoc.exportFile(ExportFormat.JPG, previewFile, false);
                    if(previewFile.exists)
                    	resultStr = '{"isSuccess": "true", "data": "' + decodeURI(previewFile.fullName) + '"}';
                    else
                    	resultStr = '{"isSuccess": "false", "error": "' + localize(THUMB_FAIL_MSG) + '"}';
                }
        	}
    	} catch (e) {
    		alert (e);
    		var error = e ? e.toString() : "";
    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';
    	} finally {
    		return resultStr;
    	}
    },
    
	closeActiveDocument : function() {
		if (app && app.activeDocument) {
			app.activeDocument.close(SaveOptions.YES);
			return '{"isSuccess": "true", "data": "' + true + '"}';;
		}
		return '{"isSuccess": "true", "data": "' + false + '"}';
	},
	
	getExtractedData : function() {
		var resultStr = '{"isSuccess": "true", "data": ""}';
    	try{
    		if(app && app.activeDocument){
				var links = app.activeDocument.links;
				var xmldata = "<file><filename>"+$._ext.getFormattedStr($._ext.getNormalizedFSName(app.activeDocument.fullName.fsName))+"</filename><components>";
				var linkedFileStr = "";
				if(links) {
					for(var i = 0; i < links.length; i++) {
						xmldata += $._ext_IDSN.getINDDLinkXml(i+1, $._ext.getNormalizedFSName(links[i].filePath));
						var linkedFile = $._ext.normalizeFile(links[i].filePath);
						if(File.fs != "Macintosh") {
	                        if(!linkedFileStr) {
	                            linkedFileStr=$._ext.getNormalizedFSName(linkedFile.fullName);
	                        } else {
	                            linkedFileStr+='|'+$._ext.getNormalizedFSName(linkedFile.fullName);
	                        }
						} else {
							if(!linkedFileStr) {
	                            linkedFileStr=$._ext.getNormalizedLinkPath(links[i].filePath);
	                        } else {
	                            linkedFileStr+='|'+$._ext.getNormalizedLinkPath(links[i].filePath);
	                        }
						}
                    }
				}
				xmldata += "</components></file>";
				var xmlDataPath = $._ext.writeToFile(xmldata, null);
				if(xmlDataPath)
					resultStr = '{"isSuccess": "true", "data": "' + xmlDataPath + '", "linkedFileStr" : "' + linkedFileStr + '"}';
				else
					resultStr = '{"isSuccess": "false", "error": "' + localize(EXTRACT_LAYER_FAIL) + '"}';
				try {
					if(app && app.activeDocument){
		    			isSaved = app.activeDocument.save();
		    		}
				}catch(e) {
					
				}
        	}
    	} catch (e) {
    		//alert (e);
    		var error = e ? e.toString() : "";
    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';
    	} finally {
    		//alert("resultStr : "+resultStr);
    		return resultStr;
    	}
	    
	},
	
	getINDDLinkXml : function(index, linkPath) {
		var xml = "<component compId=\""+index+"\">";
	    try {
	        xml += $._ext.convertToXML(linkPath, "Location");
	    } catch(e) {
	        xml += $._ext.convertToXML("", "Location");
	    }
	    xml += "</component>";
	    return xml;
	},
	
	isChangesSaved : function () {
    	var isSaved = 'false';
    	var resultStr;
    	try {
    		if(app && app.activeDocument){
    			isSaved = 'true';
    		}
    		resultStr = '{"isSuccess": "true", "data": "' + isSaved + '"}';
    	}catch(e) {
    		alert (e);
    		var error = e ? e.toString() : "";
    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';
    	} finally {
    		//alert(resultStr);
    		return resultStr;
    	}
    },
    
    resolveLinks : function(tmpFileName) {
		var filePath = "";
    	var resultStr = '{"isSuccess": "true", "data": "success"}';
    	try{
    		if (app && app.activeDocument && app.activeDocument.links) {
    			var linksCount = app.activeDocument.links.length;
				var fileMap = $._ext.getLinkedFileMap(tmpFileName);
	            var doc =  app.activeDocument;
	            for(var i = 0; i < linksCount; i++) {
	                var link = app.activeDocument.links[i];
	                if(fileMap && (i+1 in fileMap)) {
	                	var resolveObj = fileMap[i+1];
	                	if (resolveObj) {
		                    var replacePath = resolveObj.newPath;
		                    var replaceFile = $._ext.normalizeFile(replacePath);
		                    if (!replaceFile || !replaceFile.exists)
		    	        		replaceFile = $._ext.searchLinksFromExtFolders(resolveObj);
		                    if(replaceFile && replaceFile.exists)
		                        link.relink(replaceFile);
	                	}
	                 }
	            }
	        }
    		$._ext_IDSN.saveDocument();
    		alert(localize(RESOLVE_LINKS_MSG));
    		resultStr = '{"isSuccess": "true", "data": "success"}';
    	}catch(e){
    		var error = e ? e.toString() : "";
    		alert(localize(RESOLVE_LINKS_FAIL_MSG)+error);
    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';
    	}finally{
    		return resultStr;
    	}
	},
	
	getINDDFileFSName : function(filePath) {
		if (File.fs != "Macintosh")
			return filePath;
		var newFile = $._ext.normalizeFile(filePath);
		return newFile.fsName;
	},
    
};