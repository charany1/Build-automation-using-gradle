if(typeof($)=='undefined')
	$={};

var zoomProps;
var userSettings;
var layerCancelFlag = 0;
var w; 
var TIMEOUT_LAYER_VAL = 20000;
var TIMEOUT_ERROR_STR = "LAYER_TIMEOUT";

$._ext = {
    //Evaluate a file and catch the exception.
    evalFile : function(path) {
        try {
            $.evalFile(path);
        } catch (e) {alert(localize(EXCEPTION) + e);}
    },
    // Evaluate all the files in the given folder 
    evalFiles: function(jsxFolderPath) {
        var folder = new Folder(jsxFolderPath);
        if (folder.exists) {
            var jsxFiles = folder.getFiles("*.jsx");
            for (var i = 0; i < jsxFiles.length; i++) {
                var jsxFile = jsxFiles[i];
                $._ext.evalFile(jsxFile);
            }
        }
    },
    showAlert : function(alertMsg) {
    	alert(alertMsg);
    },
    
    convertToXML : function ( property, identifier, formattedFlag ){
    	var type = typeof property;
    	if (!formattedFlag && type && type.toLowerCase() == "string") {
    		property = $._ext.getFormattedStr(property);
    	}
    	var xml = "<property>";
    	xml += "<name>" + identifier + "</name>";
    	xml += "<value>" + property + "</value>";
    	xml += "<type>" + type + "</type>";
    	xml += "</property>";
    	//alert("xml : "+xml);
    	return xml;
    },
    
    writeToFile : function( xmlData, xmlFileName ) {
    	var extractedFolderPath =  "~/.zm/tmp/extractedData/";
	    var xmlDataPath;
	    try {
	        var XMLFolder = new Folder (extractedFolderPath);
	        if(!XMLFolder.exists)
	        	XMLFolder.create();
	        var XMLFile;
	        if(xmlFileName)
	        	XMLFile = new File(extractedFolderPath+xmlFileName +".xml");
	        else
	        	XMLFile = new File(extractedFolderPath+app.activeDocument.name.match(/([^\.]+)/)[1] +".xml");
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
	},
	
	getFormattedStr: function ( property ) {
		property = property.replace(/&/g,"&amp;");
	    property = property.replace(/\'/g,"&apos;"); 
	    property = property.replace(/\"/g,"&quot;");
	    property = property.replace(/</g,"&lt;");
	    property = property.replace(/>/g,"&gt;");
	    return property;
	},
	
	getUnformattedStr : function (property, isFile) {
		property = property.replace(/&amp;/g,"&");
	    property = property.replace(/&apos;/g,"'"); 
	    if(!isFile) {
	        property = property.replace(/&quot;/g,"\"");
	        property = property.replace(/&lt;/g,"<");
	        property = property.replace(/&gt;/g,">");
	    }
	    return property;
	},
	
	readTmpFile: function (tmpFileName, filePath, modifiedFlag, appName) {
		var tmpFilePath = "~/.zm/tmp/"+tmpFileName;
		var tmpFile = File(tmpFilePath);
		var fileToBeOpened;
		var resultStr;
		try {
			if(tmpFile.exists) {
				tmpFile.open('r', undefined, undefined);
				if (tmpFile !== '') {
			    	fileToBeOpened = tmpFile.read();
			    	tmpFile.close();
				}
				if(fileToBeOpened) {
					var openFile = $._ext.normalizeFile(fileToBeOpened);
					if(openFile.exists) {
						switch(appName) {
						case ('PHXS'):
						case ('PHSP'):
							resultStr = $._ext_PHXS.openFile(fileToBeOpened);
							break;
						case('ILST'):
							resultStr = $._ext_ILST.openFile(fileToBeOpened);
							break;
						case('IDSN'):
							resultStr = $._ext_IDSN.openFile(fileToBeOpened);
							break;
						case('AEFT'):
							resultStr = $._ext_AEFT.openFile(fileToBeOpened);
							break;
						case('PPRO'):
							resultStr = $._ext_PPRO.openFile(fileToBeOpened);
							break;
						}
					} else {
						resultStr = '{"isSuccess": "true", "data": "' + localize(FILE_NOT_AVLBL) + '"}';
					}
				} else {
					resultStr = '{"isSuccess": "true", "data": "' + localize(FILE_NOT_AVLBL) + '"}';
				}
				if (tmpFile.exists) {
					tmpFile.remove();
				}
			} /*else {
			   alert ("No valid path for file to be opened");
			}*/
		} catch (e) {
			var error = e ? e.toString() : "";
    		resultStr = '{"isSuccess": "false", "error": "' + error + '"}';
		} finally{
			return resultStr;
		}
	},
	
	//method needed because of a bug in extendscript for MAC 
	//	that does not distinguish between /folder and /Volumes/folder 
	normalizeFile : function (filePath) {
		var retVal = File(filePath);
		if (File.fs != "Macintosh")
			return retVal;
		if (retVal.fsName == filePath)
			return retVal;
		var rootVolumeName = File("/").parent.displayName;
        retVal = new File(retVal.fsName.replace(/^\/Volumes\//,"/" + rootVolumeName + "/"));
        return retVal;
	},
	
	getNormalizedFSName : function(filePath) {
		if (File.fs != "Macintosh")
			return filePath;
		var newFile = $._ext.normalizeFile(filePath);
		return newFile.fsName;
	},
	
	getLinkedFileMap : function(tmpFileName) {
		var tmpFilePath = "~/.zm/tmp/"+tmpFileName;
		var tmpFile = File(tmpFilePath);
		var fileMap = $._ext.parseFile(tmpFilePath, "|");
        if (tmpFile.exists) {
			tmpFile.remove();
		}
        return fileMap;
	},
	
	getZoomProps : function() {
		var zoomPropFilePath = "~/.zm/zoom.properties";
		zoomProps = $._ext.parseFile(zoomPropFilePath, "=");
		//return zoomProps;
	},
	
	getZoomProperty : function(propName) {
		if(zoomProps && (propName in zoomProps)) {
			return zoomProps[propName];
		}
		return null;
	},
	
	parseFile : function (filePath, separator) {
		var file = File(filePath);
		var props = {};
		if(file.exists) {
			file.open('r', undefined, undefined);
			while(!file.eof) {
	            var fileMapStr = file.readln();
	            if(fileMapStr && fileMapStr.indexOf(separator) > 0) {
	                var strArr = fileMapStr.split(separator);
	                if(strArr.length === 2) {
	                	props[strArr[0]] = strArr[1];
	                }
	            }
	        }
			file.close();
		}
		return props;
	},
	
	showConfirm : function(confirmText, noAsDefault, title) {
		var confirmVal = confirm(confirmText, noAsDefault == 'true', title);
		return confirmVal.toString();
	},
	
	setLayerCancelFlag : function(_cancelFlag) {
		alert("in setlayercancel");
		try {
			layerCancelFlag = parseInt(_cancelFlag);
		} catch (e) {
			layerCancelFlag = 0;
		}
	},
	
	createProgress : function(title, message, hasCancelButton) {  
		  var win;  
		  if (title == null) {  
		    title = "Work in progress";  
		  }  
		  if (message == null) {  
		    message = "Please wait...";  
		  }  
		  if (hasCancelButton == null) {  
		    hasCancelButton = false;  
		  }  
		  win = new Window("palette", "" + title, undefined);  
		  win.bar = win.add("progressbar", {  
		    x: 20,  
		    y: 12,  
		    width: 300,  
		    height: 20  
		  }, 0, 100);  
		  win.stMessage = win.add("statictext", {  
		    x: 10,  
		    y: 36,  
		    width: 320,  
		    height: 20  
		  }, "" + message);  
		  win.stMessage.justify = 'center';  
		  if (hasCancelButton) {  
		    win.cancelButton = win.add('button', undefined, 'Cancel');  
		    win.cancelButton.onClick = function() {  
		    	win.stMessage.text = "Terminating layer extraction...";
		    	win.exception = new Error(TIMEOUT_ERROR_STR);
		    	//alert("win.exception : "+win.exception);
		    	return win.exception;
		    };  
		  }  
		  this.reset = function(message) {  
		    win.bar.value = 0;  
		    win.stMessage.text = message; 
		    //app.refresh();
		    return win.update();  
		  };  
		  this.updateProgress = function(perc, message) {
			  //alert("exception : "+win.exception)
		    if (win.exception) {
		    	//alert("exception : "+win.exception)
		    	//win.close();  
		    	throw win.exception;  
		    }  
		    if (perc != null) {  
		      win.bar.value = perc;  
		    }  
		    if (message != null) {  
		      win.stMessage.text = message;  
		    }  
		    return win.update();  
		  };  
		  this.close = function() { 
			//alert("in win close");
		    return win.close();  
		  };  
		  win.center(win.parent);  
		  return win.show();  
		},
		
		writeToPropFile : function( propFileName, propStr ) {
			var saveFlag = true;
	    	var propFolderPath =  "~/.zm/settings/adobePlugin/";
		    var propDataPath;
		    var propFile;
		    try {
		        var propFolder = new Folder (propFolderPath);
		        if(!propFolder.exists)
		        	propFolder.create();
		        if(propFileName)
		        	propFile = new File(propFolderPath+propFileName +".properties");
		        if(propFile) {
		        	propFile.open("w");
		        	propFile.encoding = "UTF8";       // set UTF8
		        	var comment = localize(AUTO_GENERATE_MSG) + new Date().toString();
		        	propFile.writeln(comment);
		        	if(propStr) {
		        		var propArr = propStr.split("|");
		        		if(propArr) {
		        			for(var i = 0; i < propArr.length; i++) {
		        				propFile.writeln(propArr[i]);
		        			}
		        		}
		        	}
		        }
		    }catch(e){
		    	saveFlag = false;
		        throw(e);
		    } finally {
		    	if(propFile)
		    		propFile.close();
		    	return saveFlag;
		        //return xmlDataPath;
		    }
		},
		
		getUserProps : function(fileName) {
			var userPropFilePath = "~/.zm/settings/adobePlugin/"+fileName+".properties";
			userSettings = $._ext.parseFile(userPropFilePath, "=");
			var enableLayerExtraction = $._ext.getUserProperty('enableLayerExtraction');
			var enableThumbExtraction = $._ext.getUserProperty('enableThumbExtraction');
			var resultStr = '{"enableLayerExtraction": "' + enableLayerExtraction + '", "enableThumbExtraction" : "' + enableThumbExtraction + '"}';
			return resultStr;
			//return zoomProps;
		},
		
		getUserProperty : function(propName) {
			if(userSettings && (propName in userSettings)) {
				return userSettings[propName];
			}
			return true;
		},
		
		loadXMPLibrary : function(){
		   if ( !ExternalObject.AdobeXMPScript ){
		      try{
		         ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
		      }catch (e){
		         //alert("Can't load XMP Script Library");
		         return false;
		      }
		   }
		   return true;
		},
		
		unloadXMPLibrary : function(){
		   if( ExternalObject.AdobeXMPScript ) {
		      try{
		         ExternalObject.AdobeXMPScript.unload();
		         ExternalObject.AdobeXMPScript = undefined;
		      }catch (e){
		         //alert("Can't unload XMP Script Library");
		      }
		   }
		},
		
		writeDataToFile : function( fileData, folderPath, filePath ) {
			var file;
			var fileURI;
			try {
				var folder = new Folder(folderPath);
				if(!folder.exists)
					folder.create();
				file = new File (filePath);
	            if(file) {
	            	file.open('w');
	            	file.encoding = "UTF8";
	            	file.write(fileData);
	            }
	            fileURI = decodeURI(file.absoluteURI); 
			}catch(e) {
				throw(e);
			}finally{
				file.close();
				return fileURI;
			}
		}
};	