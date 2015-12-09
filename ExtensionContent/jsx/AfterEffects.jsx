$._ext_AEFT={
	run : function() {
	    
		/**********  Replace below sample code with your own JSX code  **********/
	    var appName;	    
	    appName = "Hello AfterEffects";	    
	    alert(appName);
	    /************************************************************************/
	    
	    return appName;
	},
	
	getFilePath : function( isRefresh, showNoFileError ) {
		var filePath = "";
	    var resultStr;
    	try{
    		if(app && app.project) {
    		    var projFile = app.project.file;
    		    if(projFile) {
    		    	var pathURI = $._ext.getNormalizedFSName(projFile.fullName);
        		    if(pathURI){
        		        filePath = decodeURI(pathURI);
        		    }
        		}else if(isRefresh !== 'true' && showNoFileError == 'true'){
                    alert(localize(PROJ_OPEN_MSG));
                }
            }else if(isRefresh !== 'true' && showNoFileError == 'true'){
                alert(localize(PROJ_OPEN_MSG));
            }
    		resultStr = '{"isSuccess": "true", "data": "' + filePath + '"}';
    	}catch(e){
    		var error = e ? e.toString() : "";
    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';
    	}finally{
    		//alert("resultStr : "+resultStr);
    		return resultStr;
    	}    	
    },
    
    saveDocument: function() {
    	var isSaved = 'true';
    	var resultStr;
    	try {
    		if(app && app.project){
    			app.project.save();
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
    
    isChangesSaved : function () {
    	var isSaved = 'false';
    	var resultStr;
    	try {
    		if(app && app.project){
    			isSaved = 'true';
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
    
    preCommitHook : function () {
    	var resultStr = '{"isSuccess": "true", "data": ""}';
    	try{
    		if(app && app.project) {
    			var projPath = "";
    			if(File.fs != "Macintosh") {
    				projPath = $._ext.getNormalizedFSName(app.project.file.parent.fsName);
    			} else {
    				var projFile = $._ext.normalizeFile(app.project.file.parent.fsName);
    				projPath = projFile.fullName.toString();
    			}
    			var actvItem= app.project.activeItem;
    			if(actvItem && actvItem.typeName && actvItem.typeName == localize(COMPOSITION)) {
    				var separator = '\\';
    	            if(File.fs && File.fs.indexOf("Windows") < 0)
    	            	separator = '/';
    	            var thumbName = projPath + separator + '.zmpreview-'+app.project.file.name+'.png';
    	            var thumbFile = $._ext.normalizeFile(thumbName);
    	            app.project.activeItem.saveFrameToPng(app.project.activeItem.time, thumbFile);
    	            if(thumbFile.exists)
                    	resultStr = '{"isSuccess": "true", "data": "' + decodeURI(thumbFile.fullName) + '"}';
                    else
                    	resultStr = '{"isSuccess": "false", "error": "' + localize(THUMB_FAIL_MSG) + '"}';
    			} else {
    				resultStr = '{"isSuccess": "false", "error": ""}';
    				alert(localize(THUMB_COMP_MSG));
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
    
    getExtractedData : function() {
    	var resultStr = '{"isSuccess": "true", "data": ""}';
    	try{
    		if(app && app.project) {
    			var projname = decodeURI(app.project.file.name);
    	        var xmldata = "<file><filename>"+$._ext.getFormattedStr($._ext.getNormalizedFSName(app.project.file.fsName))+"</filename><components>";
    	        var linkedFileStr = "";
    	        var itemCollection = app.project.items;
    	        var index = 0;
    	        w = new $._ext.createProgress(localize(LAYER_EXTRACT_PROGRESS), "", false);
    	        for(var i = 1; i <= itemCollection.length; i++) {
    	        	var item = app.project.item(i);
    	        	var itemLayers = item.layers;
    	            if(itemLayers) {
    	            	item.uid = ++index;
    	            	if(index > 100) {
    						var adj = Math.floor(index/100);
    	            		var progVal = index - 100 * adj;
    	            		w.updateProgress (progVal, "Layers extracted : "+index);
    	            	}
    	            	else { 
    	            		w.updateProgress (index, "Layers extracted : "+index);
    	            	}
    					$.sleep(10);
    	            	var resultObj = $._ext_AEFT.getAEComponentDetails(item, {uid: "", typeName: "Project", name: projname});
    	                xmldata += resultObj.xmlStr;
    	                if(linkedFileStr && linkedFileStr.substring (0, 1) !== "|" && resultObj.linkedStr) {
    	                    linkedFileStr += "|";
    	                }
    	                linkedFileStr += resultObj.linkedStr ? resultObj.linkedStr : "";
    	                for (var j = 1; j <= itemLayers.length; j++) {
    	                	var layerItem = item.layer(j);
    	                	layerItem.uid = ++index;
    	                    //layerItem.id = item.id + "_" + j.toString();
    	                    var layerObj = $._ext_AEFT.getAEComponentDetails(item.layer(j), {uid: item.uid, name: item.name, typeName: item.typeName});
    	                    xmldata += layerObj.xmlStr;
    	                    if(linkedFileStr && linkedFileStr.substring (0, 1) !== "|" && layerObj.linkedStr) {
    	                        linkedFileStr += "|";
    	                    }
    	                    linkedFileStr += layerObj.linkedStr ? layerObj.linkedStr : "";
    	                }
    	            }
    	        }
    	        w.updateProgress (100);
				w.close();
				w = null;
    	        xmldata += "</components></file>";
    	        var xmlDataPath = $._ext.writeToFile(xmldata, decodeURI(app.project.file.name));
				if(xmlDataPath)
					resultStr = '{"isSuccess": "true", "data": "' + xmlDataPath + '", "linkedFileStr" : "' + linkedFileStr + '"}';
				else
					resultStr = '{"isSuccess": "false", "data": ""}';
    		}
    	} catch (e) {
    		alert (e);
    		var error = e ? e.toString() : "";
    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';
    	} finally {
    		if(w) {
				w.close();
				w = null;
			}
    		return resultStr;
    	}
    },
    
    getAEComponentDetails : function( thisLayer, parentObj ) {
    	var xml = "<component compId=\""+thisLayer.uid+"\">";
        var linkedFileStr = "";
        try {
    		xml += $._ext.convertToXML(thisLayer.name, "name");
    	} catch(e) {
    		xml += $._ext.convertToXML("", "name");
    	}

        try {
            xml += $._ext.convertToXML(Math.round((thisLayer.property("opacity")).value) +"%", "Opacity");
        } catch(e) {
            xml += $._ext.convertToXML("", "Opacity");
        }

        try {
            var layerType = "";
            if(!thisLayer.typeName) {
                if(thisLayer instanceof AVLayer)
                    layerType = "AVLayer";
                if(thisLayer instanceof CameraLayer)
                    layerType = "CameraLayer";
                if(thisLayer instanceof LightLayer)
                    layerType = "LightLayer";
                if(thisLayer instanceof ShapeLayer)
                    layerType = "ShapeLayer";
                if(thisLayer instanceof TextLayer)
                    layerType = "TextLayer";
            } else {
                layerType = thisLayer.typeName;
             }
    		xml += $._ext.convertToXML(layerType, "Type");
    	} catch(e) {
    		xml += $._ext.convertToXML("", "Type");
    	}
                    
        try {
            xml += $._ext.convertToXML(parentObj.typeName, "Parent Type");
        } catch(e) {
            xml += $._ext.convertToXML("", "Parent Type");
        }

        try {
    		xml += $._ext.convertToXML(parentObj.name, "parent");
    	} catch(e) {
    		xml += $._ext.convertToXML("", "parent");
    	}

        try {
    		 xml += $._ext.convertToXML(parentObj.uid.toString(), "parentId");
    	} catch(e) {
    		xml += $._ext.convertToXML("", "parentId");
    	}

        try {
           if(thisLayer.source && thisLayer.source.file) {
        	   	if(File.fs != "Macintosh") {
        	   		linkedFileStr = decodeURI($._ext.getNormalizedFSName(thisLayer.source.file.fullName));
        	   		xml += $._ext.convertToXML($._ext.getNormalizedFSName(thisLayer.source.file.fsName).toString(), "Location");
        	   	} else {
        	   		//var linkedFile = $._ext.normalizeFile(thisLayer.source.file.fullName);
        	   		//alert("linkedFile : "+linkedFile.fsName.toString());
        	   		/*linkedFileStr = thisLayer.source.file.fullName.toString();
        	   		xml += $._ext.convertToXML(thisLayer.source.file.fullName.toString(), "Location");*/
        	   		linkedFileStr = $._ext.getNormalizedFSName(thisLayer.source.file.fsName).toString();
        	   		xml += $._ext.convertToXML($._ext.getNormalizedFSName(thisLayer.source.file.fsName).toString(), "Location");
        	   	}
                xml += $._ext.convertToXML(1, "isLinked");
           } else {
               xml += $._ext.convertToXML("", "Location");
               xml += $._ext.convertToXML("", "isLinked");
           }
        } catch(e) {
            xml += $._ext.convertToXML("", "Location");
    		xml += $._ext.convertToXML("", "isLinked");
    	}
        xml += "</component>";
        return {xmlStr: xml, linkedStr: linkedFileStr};
    },
    
    /*writeAEDataToFile : function ( xmlData ) {
	    var extractedFolderPath =  "~/.zm/tmp/extractedData/";
	    var xmlDataPath;
	    try {
	        var XMLFolder = new Folder (extractedFolderPath);
	        if(!XMLFolder.exists)
	            XMLFolder.create();
	        var XMLFile = new File(extractedFolderPath+decodeURI(app.project.file.name)+".xml");
	        XMLFile.open("w");
	        XMLFile.encoding = "UTF8";       // set UTF8
	        XMLFile.write( xmlData );
	        XMLFile.close();
	        xmlDataPath = decodeURI(XMLFile.absoluteURI);
	    }catch(e){
	        throw(e);
	    } finally {
	        return xmlDataPath;
	    }
    },*/
    
    closeActiveDocument : function() {
		if (app && app.project) {
			app.project.close(CloseOptions.SAVE_CHANGES);
			return '{"isSuccess": "true", "data": "' + true + '"}';;
		}
		return '{"isSuccess": "true", "data": "' + false + '"}';
	},
	
	openFile : function( filePath ) {
    	var errorStr = localize(FILE_OPEN_FAIL_MSG)+filePath.toString();
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
	
	resolveLinks : function(tmpFileName) {
		var filePath = "";
    	var resultStr = '{"isSuccess": "true", "data": "success"}';
    	try{
    		if(app && app.project) {
	          var fileMap = $._ext.getLinkedFileMap(tmpFileName);
	          var myProj = app.project;
	          var itemCollection = app.project.items;
			  if (itemCollection) {
				  var index = 0;
				  for(var i = 1 ; i <= itemCollection.length; i++) {
					  var item = app.project.item(i);
	                  var itemLayers = item.layers;
	                  if(itemLayers) {
	                	  ++index;
	                	  for (var j = 1; j <= itemLayers.length; j++) {
	                		  if(fileMap && (++index in fileMap)) {
	                			  var layerItem = item.layer(j);
	                			  if(layerItem && layerItem.source && typeof layerItem.source.replace == "function") {
	                				  var resolveObj = fileMap[index];
	                				  if (!resolveObj)
	                					  continue;
	                				  var replacePath = resolveObj.newPath;
	                				  var replaceFile = $._ext.normalizeFile(replacePath);
	                				  if (!replaceFile || !replaceFile.exists)
	                					  replaceFile = $._ext.searchLinksFromExtFolders(resolveObj);
		                			  if(replaceFile && replaceFile.exists)
		                				  layerItem.source.replace(replaceFile);
	                			  }
	                		  }
	                	  }
	                  }
				  }
			  }
			  $._ext_AEFT.saveDocument();
    		}
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
	
	extractXMP : function() {
		var resultStr = '{"isSuccess": "true", "data": ""}';
		try {
			$._ext.loadXMPLibrary();
			if(app && app.project && app.project.file) {
				var xmpData = app.project.xmpPacket;
				var xmpFolderPath = app.project.file.parent.fsName;
				var separator = '\\';
	            if(File.fs && File.fs.indexOf("Windows") < 0)
	            	separator = '/';
	            var xmpFilePath = xmpFolderPath + separator + ".zmXmp-" + app.project.file.name+".xmp";
	            var xmpFileURI = $._ext.writeDataToFile(xmpData, xmpFolderPath, xmpFilePath);
	            resultStr = '{"isSuccess": "true", "data": "' + xmpFileURI + '"}';
			}
		}catch(e){
			//alert (e);
    		var error = e ? e.toString() : "";
    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';
		}finally{
			$._ext.unloadXMPLibrary();
			return resultStr;
		}
	},
	
};