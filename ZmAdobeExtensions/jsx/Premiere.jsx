$._ext_PPRO={    run : function() {        	/**********  Replace below sample code with your own JSX code  **********/        var appName;	    	    appName = "Hello Premiere";	            alert(appName);        /************************************************************************/                return appName;    },        getFilePath : function( isRefresh ) {		var filePath;	    var resultStr;        var osName = $.os;    	try{    		if(app && app.project) {    		    var filePath = $._ext.getNormalizedFSName(app.project.path);    		    if(filePath) {                     if(osName && osName.indexOf("Mac") < 0) {    		    	  filePath = filePath.substr(4);                      }    		    	//filePath = filePath.replace(':', '');    		    	filePath = filePath.replace(/\\/g, '/');    		    }else if(isRefresh !== 'true'){    	            alert(localize(PROJ_OPEN_MSG));    	        }    	    }else if(isRefresh !== 'true'){    	        alert(localize(PROJ_OPEN_MSG));    	    }    		resultStr = '{"isSuccess": "true", "data": "' + filePath + '"}';    	}catch(e){    		var error = e ? e.toString() : "";    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';    	}finally{    		//alert("resultStr : "+resultStr);    		return resultStr;    	}    	    },        saveDocument: function() {    	var isSaved = 'true';    	var resultStr;    	try {    		if(app && app.project){    			app.project.saveAs($._ext.getNormalizedFSName(app.project.path));    		}    		resultStr = '{"isSuccess": "true", "data": "' + isSaved + '"}';    	}catch(e) {    		alert (e);    		var error = e ? e.toString() : "";    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';    	} finally {    		return resultStr;    	}    },        closeActiveDocument : function() {		if (app && app.project) {			app.project.closeDocument();			return '{"isSuccess": "true", "data": "' + true + '"}';;		}		return '{"isSuccess": "true", "data": "' + false + '"}';	},		openFile : function( filePath ) {    	var errorStr = localize(FILE_OPEN_FAIL_MSG) + filePath.toString();    	var resultStr = '{"isSuccess": "false", "error": "' + errorStr + '"}';    	try {    		if(app)  {    			if (app.project)    				app.project.closeDocument();    			var file = $._ext.normalizeFile(filePath);    			if(file.exists) {    				app.openDocument(file.fsName);    				resultStr = '{"isSuccess": "true", "data": "success"}';    			} else {    				alert(localize(FILE_NOT_AVLBL));    			}    		}    	} catch (e) {    		alert(e);    	} finally {    		return resultStr;    	}	},		isChangesSaved : function () {    	var isSaved = 'false';    	var resultStr;    	try {    		if(app && app.project){    			isSaved = 'true';    		}    		resultStr = '{"isSuccess": "true", "data": "' + isSaved + '"}';    	}catch(e) {    		alert (e);    		var error = e ? e.toString() : "";    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';    	} finally {    		return resultStr;    	}    },		preCommitHook : function() {		var resultStr = '{"isSuccess": "true", "data": ""}';    	try{    		if(app && app.project) {    			app.enableQE();    	        var seq = qe.project.getActiveSequence();    			if(seq != null) {    				var thumbFolderPath = $._ext_PPRO.getProjectParent();    	            var separator = '\\';    	            if(qe.platform == "Macintosh")    	            	separator = '/';    	            var projName = app.project.name;    	            var thumbName = thumbFolderPath + separator  + '.zmpreview-'+ projName;    	            var time = seq.CTI.timecode;     	            seq.exportFramePNG(time, thumbName);     	            var thumbFileName;    	            if(projName) {    	                var extensionIndex = projName.lastIndexOf ('.');    	                thumbFileName =  thumbFolderPath + separator  + '.zmpreview-'+ projName.substring (0, extensionIndex) + '.png';    	            }    	            var thumbFile = $._ext.normalizeFile(thumbFileName);    	            if(thumbFile && thumbFile.exists)                    	resultStr = '{"isSuccess": "true", "data": "' + decodeURI(thumbFile.fullName) + '"}';                    else                    	resultStr = '{"isSuccess": "false", "error": "' + localize(THUMB_FAIL_MSG) + '"}';    			} else {    				resultStr = '{"isSuccess": "false", "error": ""}';    	            alert(localize(THUMB_COMP_MSG));    	        }        	}    	} catch (e) {    		//alert (e);    		var error = e ? e.toString() : "";    		resultStr = '{"isSuccess": "false", "error": "' + localize(THUMB_COMP_MSG) + '"}';    	} finally {    		return resultStr;    	}	},		getProjectParent : function() {		var filePath = app.project.path;		if(File.fs && File.fs.indexOf("Mac") < 0) {	        filePath = filePath.substr(4);	    }	    var parentFolder = $._ext.normalizeFile(filePath).parent.fsName;	    return parentFolder;	},		getExtractedData : function() {		var resultStr = '{"isSuccess": "true", "data": ""}';		try{    		if(app && app.project){    			var extractUsingXMP = true;	            try {	                if (ExternalObject.AdobeXMPScript == undefined) {	                    ExternalObject.AdobeXMPScript = new ExternalObject("lib:AdobeXMPScript");	                }	            } catch (e) {	                extractUsingXMP = false;	            }	            var osName = $.os;	            var filePath = $._ext.getNormalizedFSName(app.project.path);	            if(filePath) {	            	if(osName && osName.indexOf("Mac") < 0) {	            		filePath = filePath.substr(4);	            	}	            }	            var xmldata = "<file><filename>"+filePath+"</filename><components>";	            var resultData;	            if(extractUsingXMP)	            	resultData = $._ext_PPRO.extractUsingXMPParser(xmldata);	            else	            	resultData = $._ext_PPRO.extractUsingXMLParser(xmldata);	            var xmlResult = resultData.xmlData;	            //alert("xmlResult : "+xmlResult);	            var linkedFileStr = resultData.linkedFileStr;	            //alert("linkedFileStr : "+linkedFileStr);	            var xmlDataPath = $._ext.writeToFile(xmlResult, app.project.name);	            //alert("xmlDataPath : "+xmlDataPath);				if(xmlDataPath)					resultStr = '{"isSuccess": "true", "data": "' + xmlDataPath + '", "linkedFileStr" : "' + linkedFileStr + '"}';				else					resultStr = '{"isSuccess": "false", "error": "' + localize(EXTRACT_LAYER_FAIL) + '"}';	        }    	} catch (e) {    		//alert (e);    		var error = e ? e.toString() : "";    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';    	} finally {    		//alert("resultStr : "+resultStr);    		return resultStr;    	}	},		extractUsingXMPParser : function(xmlData) {		var linkedFileStr;	    if (ExternalObject.AdobeXMPScript != undefined) 	    {	        var myProj = app.project;	        var root = myProj.rootItem;	        var children = root.children;	        var num = children.numItems;	        var kPProPrivateProjectMetadataURI = "http://ns.adobe.com/premierePrivateProjectMetaData/1.0/";	        var filefield = "Column.Intrinsic.FilePath";	        for(var i = 0; i < num; i++) {	            var item = children[i];	            var projectMetadata = item.getProjectMetadata();	            var xmp = new XMPMeta(projectMetadata);	            var found_file = xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, filefield);	            //alert("found_File : "+found_file);	            if(found_file) {	                var filePath = xmp.getProperty(kPProPrivateProjectMetadataURI, filefield);	                if(filePath)	                	xmlData += $._ext_PPRO.getPPROLinkXml(i+1, $._ext.getNormalizedFSName(filePath).toString(), false);	                var linkedFile = $._ext.normalizeFile(filePath);	                if(!linkedFileStr) {	                    linkedFileStr=$._ext.getNormalizedFSName(linkedFile.fullName);	                } else {	                    linkedFileStr+='|'+$._ext.getNormalizedFSName(linkedFile.fullName);	                }	            }	            //alert(filePath);	        }	    }	    xmlData += "</components></file>";	    return {xmlData: xmlData, linkedFileStr: linkedFileStr};	},		extractUsingXMLParser : function(xmlData) {		var linkedFileStr;	    var myProj = app.project;	    var root = myProj.rootItem;	    var children = root.children;	    var num = children.numItems;	    var rdf = new Namespace ("http://www.w3.org/1999/02/22-rdf-syntax-ns#");	    for(var i = 0; i < num; i++) {	        var item = children[i];	        var xmp = item.getXMPMetadata();	        var xmpXml = new XML(xmp);	        var xmlChildren = xmpXml.rdf::RDF.rdf::Description.toString();	        var index = xmlChildren.indexOf("<premierePrivateProjectMetaData:Column.Intrinsic.FilePath>");	        var endIndex = xmlChildren.indexOf("</premierePrivateProjectMetaData:Column.Intrinsic.FilePath>");	        if(index >= 0 && endIndex >=0) {	            var filePath = xmlChildren.substring (index+"<premierePrivateProjectMetaData:Column.Intrinsic.FilePath>".length, endIndex);	            xmlData += $._ext_PPRO.getPPROLinkXml(i+1, $._ext.getNormalizedFSName(filePath), true);	            var linkedFile = $._ext.normalizeFile(($._ext.getUnformattedStr(filePath, true)));	            if(!linkedFileStr) {	                linkedFileStr=$._ext.getNormalizedFSName(linkedFile.fullName);	            } else {	                linkedFileStr+='|'+$._ext.getNormalizedFSName(linkedFile.fullName);	            }	            //alert("filePath : "+filePath);	        }	    }	    xmlData += "</components></file>";	    return {xmlData: xmlData, linkedFileStr: linkedFileStr};	},		getPPROLinkXml : function(index, linkPath, formattedStr) {		var xml = "<component compId=\""+index+"\">";	    try {	        xml += $._ext.convertToXML(linkPath, "Location", formattedStr);	    } catch(e) {	        xml += $._ext.convertToXML("", "Location", formattedStr);	    }	    xml += "</component>";	    return xml;	},		resolveLinks : function(tmpFileName) {		var filePath = "";    	var resultStr = '{"isSuccess": "true", "data": "success"}';    	try{    		if(app && app.project) {				var fileMap = $._ext.getLinkedFileMap(tmpFileName);				var relinkUsingXMP = true;				try {	                if (ExternalObject.AdobeXMPScript == undefined) {	                    ExternalObject.AdobeXMPScript = new ExternalObject("lib:AdobeXMPScript");	                }	            } catch (e) {	                relinkUsingXMP = false;	            }	            if(relinkUsingXMP)	            	$._ext_PPRO.relinkUsingXMPParser(fileMap);	             else	            	$._ext_PPRO.relinkUsingXMLParser(fileMap);	        }    		$._ext_PPRO.saveDocument();    		alert(localize(RESOLVE_LINKS_MSG));    		resultStr = '{"isSuccess": "true", "data": "success"}';    	}catch(e){    		var error = e ? e.toString() : "";    		alert(localize(RESOLVE_LINKS_FAIL_MSG)+error);    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';    	}finally{    		//alert(resultStr);    		return resultStr;    	}	},		relinkUsingXMPParser : function(fileMap) {		if (ExternalObject.AdobeXMPScript != undefined) {	        var myProj = app.project;	        var root = myProj.rootItem;	        var children = root.children;	        var num = children.numItems;	        var kPProPrivateProjectMetadataURI = "http://ns.adobe.com/premierePrivateProjectMetaData/1.0/";	        var filefield = "Column.Intrinsic.FilePath";	        for(var i = 0; i < num; i++) {	            var item = children[i];	            var projectMetadata = item.getProjectMetadata();	            var xmp = new XMPMeta(projectMetadata);	            var found_file = xmp.doesPropertyExist(kPProPrivateProjectMetadataURI, filefield);	            if(found_file && item.canChangeMediaPath()) {	                var relinkPath = fileMap[i+1];	                if(relinkPath) {	                    var relinkFile = $._ext.normalizeFile(relinkPath);	                    item.changeMediaPath(relinkFile.fsName);	                }	            }	        }	    }	},		relinkUsingXMLParser : function(fileMap) {		var myProj = app.project;	    var root = myProj.rootItem;	    var children = root.children;	    var num = children.numItems;	    var rdf = new Namespace ("http://www.w3.org/1999/02/22-rdf-syntax-ns#");	    for(var i = 0; i < num; i++) {	        var item = children[i];	        var xmp = item.getXMPMetadata();	        var xmpXml = new XML(xmp);	        var xmlChildren = xmpXml.rdf::RDF.rdf::Description.toString();	        var index = xmlChildren.indexOf("<premierePrivateProjectMetaData:Column.Intrinsic.FilePath>");	        var endIndex = xmlChildren.indexOf("</premierePrivateProjectMetaData:Column.Intrinsic.FilePath>");	        if(index >= 0 && endIndex >=0) {	            var relinkPath = fileMap[i+1];	            if(relinkPath) {	                var relinkFile = $._ext.normalizeFile(relinkPath);	                item.changeMediaPath(relinkFile.fsName);	            }	        }	    }	},	};