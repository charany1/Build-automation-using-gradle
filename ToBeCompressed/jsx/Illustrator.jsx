$._ext_ILST={
    run : function() {
    
    	/**********  Replace below sample code with your own JSX code  **********/
        var appName;	    
	    appName = "Hello Illustrator";	    
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
    	            	var docPath = app.activeDocument.path;
    	            	var pathURI = app.activeDocument.fullName;
    	    		    if(pathURI){    
    	    		      filePath =  decodeURI(pathURI);
    	    		      //var file = File(filePath);
    	                  if ((!docPath || (docPath && docPath == ""))  && isRefresh !== 'true' && showNoFileError == 'true') {
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
    			if(!app.activeDocument.saved){
    				app.activeDocument.save();
    			}
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
    
    getExtractedData : function() {
    	var resultStr = '{"isSuccess": "true", "data": ""}';
    	try {
    		if(app){
        		if(app.activeDocument){
        			var doc = app.activeDocument;
        			if(doc.layers && doc.layers.length > 0){
        				var normalizedFilePath = $._ext.getNormalizedFSName(doc.fullName.fsName);
        				var xmldata = "<file><filename>"+$._ext.getFormattedStr(normalizedFilePath.toString())+"</filename><components>";
        				var linkedFileStr = "";
        				var index = 0;
        				w = new $._ext.createProgress(localize(LAYER_EXTRACT_PROGRESS), "", false);
        				for (var i=0; i < doc.layers.length; i++){
        					if(index > 100) {
        						var adj = Math.floor(index/100);
        	            		var progVal = index - 100 * adj;
        	            		w.updateProgress (progVal, "Layers extracted : "+index);
        	            	}
        	            	else { 
        	            		w.updateProgress (index, "Layers extracted : "+index);
        	            	}
        					$.sleep(10);
        					var resultObj = $._ext_ILST.iterateAILayers(doc.layers[i], ++index);
        					xmldata += resultObj.xmlStr;
        					if(linkedFileStr && linkedFileStr.substring (0, 1) !== "|" && resultObj.linkedStr) {
        	                    linkedFileStr += "|";
        	                }
        	                linkedFileStr += resultObj.linkedStr ? resultObj.linkedStr : "";
        	                index = resultObj.index ? resultObj.index : index;
        				}
        				w.updateProgress (100);
        				w.close();
        				w = null;
        				xmldata += "</components></file>";
        				var xmlDataPath = $._ext.writeToFile(xmldata, null);
        				if(xmlDataPath)
        					resultStr = '{"isSuccess": "true", "data": "' + xmlDataPath + '", "linkedFileStr" : "' + linkedFileStr + '"}';
        				else
        					resultStr = '{"isSuccess": "false", "data": ""}';
        				//resultStr = '{"isSuccess": "true", "data": "' + xmlDataPath + '"}';
        			}
        		}
        	}
		} catch (e) {
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
  
    iterateAILayers : function( targetLayer, index ) {
    	//targetLayer.uid = targetLayer.name+"_"+index;
    	targetLayer.uid = index;
    	var resultObj = $._ext_ILST.getAILayerLinkDetails(targetLayer, false);
        var xmlStr = (resultObj && resultObj.xmlStr) ? resultObj.xmlStr : "";
        var linkedStr = (resultObj && resultObj.linkedStr) ? resultObj.linkedStr : "";
        //var xmlStr = $._ext_ILST.getAILayerLinkDetails(targetLayer, false);
         if(targetLayer.layers != null && targetLayer.layers.length > 0){
            for (var j = 0; j < targetLayer.layers.length; j++){
            	if(index > 100) {
					var adj = Math.floor(index/100);
            		var progVal = index - 100 * adj;
            		w.updateProgress (progVal, "Layers extracted : "+index);
            	}
            	else { 
            		w.updateProgress (index, "Layers extracted : "+index);
            	}
				$.sleep(10);
            	resultObj = $._ext_ILST.iterateAILayers (targetLayer.layers[j], ++index);
                xmlStr += resultObj.xmlStr;
	            if(linkedStr && linkedStr.substring (0, 1) !== "|" && resultObj.linkedStr) {
	            	linkedStr += "|";
	            }
	            linkedStr += resultObj.linkedStr ? resultObj.linkedStr : "";
	            index = resultObj.index ? resultObj.index : index;
                //xmlStr += $._ext_ILST.iterateAILayers (targetLayer.layers[j], ++index);
            }
        }
        if(targetLayer.pageItems && targetLayer.pageItems.length > 0){
        	resultObj = $._ext_ILST.parseArtItems( targetLayer.pageItems, index );
            xmlStr += resultObj.xmlStr;
            if(linkedStr && linkedStr.substring (0, 1) !== "|" && resultObj.linkedStr) {
                linkedStr += "|";
            }
            linkedStr += resultObj.linkedStr ? resultObj.linkedStr : "";
            index = resultObj.index ? resultObj.index : index;
             //xmlStr +=  $._ext_ILST.parseArtItems( targetLayer.pageItems, ++index );
        }
        return {xmlStr: xmlStr, linkedStr: linkedStr, index:index};
        //return xmlStr;
	},
	
	getAILayerLinkDetails : function( thisObj, isLink ) {
		var xml = "<component compId=\""+thisObj.uid.toString()+"\">";
		var linkedFileStr = "";
	     try {
	    	 var objName = $._ext_ILST.getObjName (thisObj);
	    	 xml += $._ext.convertToXML(objName, "name");
	    	 //alert("objName : "+objName);
	        //xml += $._ext.convertToXML(thisObj.name.toString(), "name");
	    } catch(e) {
	        xml += $._ext.convertToXML("", "name");
	    }
	    try {
	        xml += $._ext.convertToXML(Math.round(thisObj.opacity) +"%", "Opacity");
	    } catch(e) {
	        xml += $._ext.convertToXML("", "Opacity");
	    }
	    try {
	        xml += $._ext.convertToXML(thisObj.typename.toString(), "Type");
	    } catch(e) {
	        xml += $._ext.convertToXML("", "Type");
	    }
	   
	     try {
	        xml += $._ext.convertToXML(thisObj.parent.typename.toString(), "Parent Type");
	    } catch(e) {
	        xml += $._ext.convertToXML("", "Parent Type");
	    }
	    
	     try {
	        if(thisObj.parent.typename.toString().toLowerCase() == "Document".toLowerCase()){
	            xml += $._ext.convertToXML(thisObj.parent.fullName.fsName.toString(), "parent");
	        }else{
	            xml += $._ext.convertToXML(thisObj.parent.name.toString(), "parent");
	        }
	    } catch(e) {
	        xml += $._ext.convertToXML("", "parent");
	    }

	    try {
			if(thisObj.parent.typename.toLowerCase() == "Document".toLowerCase()){
	            xml += $._ext.convertToXML("", "parentId");
	        }else{
	            xml += $._ext.convertToXML(thisObj.parent.uid.toString(), "parentId");
	        }
		} catch(e) {
			xml += $._ext.convertToXML("", "parentId");
		}
		
	    if( isLink ){
	        try {
	        	var location = $._ext.getNormalizedFSName(thisObj.file.fsName.toString());
	        	var linkedPath = "";
	        	if(File.fs != "Macintosh"){
	        		linkedPath = $._ext.getNormalizedFSName(thisObj.file.fullName);
	        	} else {
	        		linkedPath = location;
	        	}	
	            xml += $._ext.convertToXML(location, "Location");
	            linkedFileStr = decodeURI(linkedPath);
	        } catch(e) {
	            xml += $._ext.convertToXML("",  "Location");
	        }
//	        try{
//	            xml += $._ext.convertToXML("link", "Kind");
//	        } catch(e) {
//	            xml += $._ext.convertToXML("",  "Kind");
//	        }
	        try{
	            switch(thisObj.typename){
	            	case "PlacedItem":
	            		try{
	            			 xml += $._ext.convertToXML("1", "isLinked");
					    } catch(e) {
					        xml += $._ext.convertToXML("", "isLinked");
					    }
					    break;
					case "RasterItem":
	            		try{
	            			 xml += $._ext.convertToXML((thisObj.embedded ? "0" : "1"), "isLinked");
					    } catch(e) {
					        xml += $._ext.convertToXML("", "isLinked");
					    }
					    break;
					default:
					    try{
	            			 xml += $._ext.convertToXML("", "isLinked");
					    } catch(e) {
					        xml += $._ext.convertToXML("", "isLinked");
					    }
				}
			} catch(e) {
	            xml += $._ext.convertToXML("",  "isLinked");
	        }
	    }else{
	    	xml += $._ext.convertToXML("", "Location");
	        xml += $._ext.convertToXML("", "isLinked");
	    }    
	    xml += "</component>";
	    return {xmlStr: xml, linkedStr: linkedFileStr};
		//return xml;
	},
	
	parseArtItems : function( artItemlist, index ) {
		var xmlStr = "";
		var linkedStr = "";
	    for(var k=0; k < artItemlist.length; k++){
	         var artItem = artItemlist[k];
	         var artItemName = $._ext_ILST.getObjName (artItem);
	         artItem.uid = ++index;
	         if(index > 100) {
				var adj = Math.floor(index/100);
         		var progVal = index - 100 * adj;
         		w.updateProgress (progVal, "Layers extracted : "+index);
         	}
         	else { 
         		w.updateProgress (index, "Layers extracted : "+index);
         	}
				$.sleep(10);
	         //artItem.uid = artItem.name + "_" + index++;
	         var resultObj = $._ext_ILST.getAILayerLinkDetails(artItem, true);
	         xmlStr += resultObj.xmlStr;
	         if(linkedStr && linkedStr.substring (0, 1) !== "|" && resultObj.linkedStr) {
	            linkedStr += "|";
	         }
	         linkedStr += resultObj.linkedStr ? resultObj.linkedStr : "";
	         //xmlStr += $._ext_ILST.getAILayerLinkDetails(artItem, true);
	         if(artItem.typename == "GroupItem" && artItem.pageItems.length > 0){
	        	 var resultData = $._ext_ILST.parseArtItems(artItem.pageItems, index);
	             xmlStr += resultData.xmlStr;
	             if(linkedStr && linkedStr.substring (0, 1) !== "|" && resultData.linkedStr) {
	            	 linkedStr += "|";
	             }
	             linkedStr += resultData.linkedStr ? resultData.linkedStr : "";
	             index = resultData.index ? resultData.index : index;
	         	//xmlStr += $._ext_ILST.parseArtItems(artItem.pageItems, index++);
	         }
	     }
	    return {xmlStr: xmlStr, linkedStr: linkedStr, index:index};
	    //return xmlStr;
	},
	
	getObjName: function (obj) {
		if (obj && obj.name)
			return obj.name;
		var typeName = obj.typename;
		switch (typeName) {
		case "SymbolItem":
			if (obj.symbol && obj.symbol.name)
				return obj.symbol.name;
			return "< Symbol >";
		case "PlacedItem":
			return "<Linked File>";
		case "RasterItem":
			if (obj.embedded)
				return "<Image>";
			else
				return "<Linked File>";
		 default:
			 return "<" + typeName + ">";
		}                        
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
    	var resultStr = '{"isSuccess": "true", "data": "success"}';
    	try{
    		if(app && app.activeDocument && app.activeDocument.placedItems) {
    			var fileMap = $._ext.getLinkedFileMap(tmpFileName);
    			var doc = app.activeDocument;
                if(doc.layers.length > 0){
                	var index = 0;
                    for (var i=0; i < doc.layers.length; i++){
                        index = $._ext_ILST.iterateAIAndRelink(doc.layers[i], ++index, fileMap);
                    }
                }
            }
    		$._ext_ILST.saveDocument();
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
	
	iterateAIAndRelink : function(targetLayer, index, fileMap) {
		if(fileMap && (index in fileMap)) {
			var resolveObj = fileMap[index];
			if(resolveObj) {
		        var replacePath = resolveObj.newPath;
		        var replaceFile = $._ext.normalizeFile(replacePath);
		        if (!replaceFile || !replaceFile.exists)
	        		replaceFile = $._ext.searchLinksFromExtFolders(resolveObj);
		        if(replaceFile && replaceFile.exists && typeof targetLayer.relink == "function") {
		        	targetLayer.relink(replaceFile);
		        }
			}
	    }
		if(targetLayer.layers != null && targetLayer.layers.length > 0){
	        for (var j = 0; j < targetLayer.layers.length; j++){
	           index = $._ext_ILST.iterateAIAndRelink(targetLayer.layers[j], ++index, fileMap);
	        }
	    }
		if(targetLayer.pageItems && targetLayer.pageItems.length > 0){
	         index = $._ext_ILST.relinkArtItems( targetLayer.pageItems, index, fileMap );
	    }
	    return index;
	},
	
	relinkArtItems : function(artItemlist, index, fileMap) {
		for(var k=0; k < artItemlist.length; k++){
	         var artItem = artItemlist[k];
	         index = $._ext_ILST.iterateAIAndRelink(artItem, ++index, fileMap);
	         if(artItem.typename == "GroupItem" && artItem.pageItems.length > 0){
	         	index = $._ext_ILST.relinkArtItems(artItem.pageItems, index, fileMap);
	         }
	     }
	    return index;
	},
	
	/*getAIFileFSName : function(filePath) {
		if (File.fs != "Macintosh")
			return filePath;
		var newFile = $._ext.normalizeFile(filePath);
		return newFile.fsName;
	},*/
		
};