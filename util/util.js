jQuery.sap.declare("com.jabil.fi.util.util");
jQuery.sap.require("jquery.sap.storage");
/*
 * This method is used for getting the data end points for various calls to back end system . It prepares the back end service call
 */
function getDataEndPoint(datapoint, input1){
	try{
	    switch(datapoint){
	        case "userModel": return portalService+"?ts="+$.now();
	        case "ccModel": return _oResourceBundle.getText("ccModel",[eccOdataService,sapClient])+"&ts="+$.now();
	        case "plantModel": return _oResourceBundle.getText("plantModel",[eccOdataService,input1,sapClient])+"&ts="+$.now();
	        case "pcModel": return _oResourceBundle.getText("pcModel",[eccOdataService,input1,sapClient])+"&ts="+$.now();
	        case "chartModel": return _oResourceBundle.getText("chartModel",[eccOdataService,input1,sapClient])+"&ts="+$.now();
	        case "rcModel": return _oResourceBundle.getText("rcModel",[eccOdataService,sapClient])+"&ts="+$.now();
	    }
	}catch(ex){handleException(ex);}
 }
   function handleRequestFailed(dataModel,message){
	   try{
		   jQuery.sap.require("sap.m.MessageBox");
	    	busyDialog.close();
			   var msgBody = "";
			   var msgTitle = _oResourceBundle.getText("SYS_ERROR");
			   var reload = false;
	    	switch(dataModel){
	    		case "userModel": msgBody=_oResourceBundle.getText("userModel_msg",[message]);reload=true;break;
	    		case "ccModel": msgBody=_oResourceBundle.getText("ccModel_msg",[message]); break;
	    		case "plantModel": msgBody=_oResourceBundle.getText("plantModel_msg",[message]); break;
	    		case "pcModel": msgBody=_oResourceBundle.getText("pcModel_msg",[message]); break;
	    		case "chModel" : msgBody=_oResourceBundle.getText("chModel_msg",[message]); break;
	    		case "tableModel" : msgBody=_oResourceBundle.getText("tableModel_msg",[message]); break;
				case "rcModel" : msgBody=_oResourceBundle.getText("rcModel_msg",[message]); break;
	    	}
	        sap.m.MessageBox.show( msgBody, {
	            icon: sap.m.MessageBox.Icon.ERROR,
	            title: msgTitle,
	            onClose: function(oAction) {if(reload){ location.reload();} }
	            });
	   }catch(ex){handleException(ex);}
    }

   function handleServiceError(model){
	   try{
		   jQuery.sap.require("sap.m.MessageBox");
		   if(model.getData().error != null){
			   var msgBody = model.getData();
			   var msgTitle = _oResourceBundle.getText("SYS_ERROR");
	           sap.m.MessageBox.show( msgBody, {
	                   icon: sap.m.MessageBox.Icon.ERROR,
	                   title: msgTitle
	                   });
		   }
		   busyDialog.close();
	   }catch(ex){handleException(ex);}
   }
   function handleNoRecordFound(input){
	   try{
		   sap.m.MessageToast.show( _oResourceBundle.getText("NoRecordFound",[input]));
		   busyDialog.close();
	   }catch(ex){handleException(ex);}
   }
   function handleException(ex){
	   jQuery.sap.require("sap.m.MessageBox"); 
	   var msgBody = ex.message;
	   var msgTitle = _oResourceBundle.getText("SYS_EXCEPTION");
       sap.m.MessageBox.show( msgBody, {
               icon: sap.m.MessageBox.Icon.ERROR,
               title: msgTitle
               });
	   busyDialog.close();
   }
   function navigateToRestricted(){
	   try{
		   location.href=restAccPage;
	   }catch(ex){handleException(ex);}
   }
   function getErrorText(oEvent){
	   try{
		   var msg = JSON.parse(oEvent.getParameters().responseText);
		   return msg.error.message.value;
	   }catch(ex){
		   return "";
		   }
   }
   function checkBackendURL(){
	   try{
		   if(backendURL==null || backendURL==""){
		       sap.m.MessageBox.show( _oResourceBundle.getText("BACKENDURL_ERROR"), {
		    	   icon: sap.m.MessageBox.Icon.ERROR,
		           title: _oResourceBundle.getText("ERROR")
		       });
			  return false;
		   }
		   return true;
	   }catch(ex){handleException(ex);}
   }
   
   //load user model and backend URL from Portal
	function loadUserModel(view){
		try{
			busyDialog.open();
			var oUserModel = new sap.ui.model.json.JSONModel();
					oUserModel.oData.userName = "";
					oUserModel.oData.backendURL="http://sapngdci.corp.jabil.org:8012";
					oUserModel.oData.client="010";
					sap.ui.getCore().setModel(oUserModel,"userModel");
					backendURL=oUserModel.getData().backendURL;
					sapClient=oUserModel.getData().client;
					//sap.ui.getCore().byId("userMenu").setModel(oUserModel);				
					view.byId("userMenu").setModel(oUserModel);
					loadCCModel(view);
					//set google analytics 
					//PR17192: change of logic for identifying the image based upon the ecc URL
					if(backendURL.toUpperCase().indexOf('DEV')>0){ 
						  ga('create', 'UA-42844441-14', 'auto');
						  ga('send', 'pageview', 'DashboardPage',oUserModel.getData().userName);
						  view.byId('envImg').setSrc(_oResourceBundle.getText("DEV_IMG"));
					}else if(backendURL.toUpperCase().indexOf('STG')>0){
						  ga('create', 'UA-42839648-19', 'auto');
						  ga('send', 'pageview', 'DashboardPage',oUserModel.getData().userName);
						  view.byId('envImg').setSrc(_oResourceBundle.getText("STG_IMG"));
					}else{
						  ga('create', 'UA-42843146-18', 'auto');
						  ga('send', 'pageview', 'DashboardPage',oUserModel.getData().userName);
					}
		}catch(ex){handleException(ex);}
	}
	
	//load the company codes for the user
	function loadCCModel(view){
		try{
			busyDialog.open();
			var companySelect = view.byId("selectCompany");
			var ccModel = new sap.ui.model.json.JSONModel(getDataEndPoint("ccModel"));
			ccModel.attachRequestCompleted(function(){
					//sap.ui.getCore().setModel(ccModel,"ccModel");
					var data = ccModel.getData();
					if(data.d==null ){
						handleServiceError(ccModel);
					}else if(ccModel.getData().d.results == null || ccModel.getData().d.results.length==0){
							handleNoRecordFound("Company Code");
							navigateToRestricted();
					}else{
				//	data.selectedCompany = data.d.results[0].Bukrs;
					ccModel.setSizeLimit(ccModel.getData().d.results.length);
					companySelect.setModel(ccModel);
					//Set the last selected CC from cache
					if(isInitialLoad){
						//companySelect.setSelectedItem(companySelect.getItemByKey());
						companySelect.setSelectedItem(companySelect.getItemByKey(sap.ui.getCore().getModel("selectionData").selectedCC));
					}else{
						companySelect.setSelectedItem(companySelect.getFirstItem());
					}
					//companySelect.setSelectedItem(companySelect.getFirstItem());
					var dialogSelectComp = sap.ui.getCore().byId("selectCompany");
					if(dialogSelectComp != null){
						dialogSelectComp.setModel(ccModel);
					}
					companySelect.fireEvent('change');
					busyDialog.close();
					}
					// that.setProfitCenters();
			}); 
			ccModel.attachRequestFailed(function(oEvent){
				handleRequestFailed("ccModel",getErrorText(oEvent));});
		}catch(ex){handleException(ex);}
	}
	
	function getSelectedPCs(){
		try{
			var returnVal= "";
			//return blank for select all or nothing sel
			if (selectedPCs==null || selectedPCs.length==0) return returnVal;
			//return blank for select all
			if(selectedPCs!=undefined && selectedPCs!="" )
			$.each(selectedPCs.split(","),function(i,pc){
				returnVal += i==0? "Prctr eq '"+pc+"'" : " or Prctr eq '"+pc+"'";
			});
			return returnVal;
		}catch(ex){handleException(ex);}
	}
	
	function getSelectionInput(){
		try{
			var returnVal = "";
			//var selectedCC = sap.ui.getCore().byId("selectCompany").getSelectedItem().getKey();
			var selectedCC = sap.ui.getCore().byId("selectCompany").getSelectedKey();
			var selectedPlant = sap.ui.getCore().byId("selectPlant").getSelectedKey();
			var pcs= getSelectedPCs();
			if(pcs!=null && pcs.length>0){
				pcs= " and ("+pcs+")";
			}
			var selPer = sap.ui.getCore().byId("selectPeriod").getSelectedItem().getKey().split("-");
			var fromDate = $.format.date(sap.ui.getCore().byId("fromDate").getDateValue(),"yyyy-MM-ddT00:00");
			var toDate = $.format.date(sap.ui.getCore().byId("toDate").getDateValue(),"yyyy-MM-ddT00:00");
			var returnVal = "Bukrs eq '"+selectedCC+"' "+pcs+" and (budat ge datetime'"+fromDate+"' and budat le datetime'"+toDate+"') and Monat eq '"+selPer[0]+"' and Gjahr eq '"+selPer[1]+"' and Werks eq '"+selectedPlant+"'";// and Curr eq '"+selectedCurr+"'";
			return  encodeURIComponent(returnVal);
		}catch(ex){handleException(ex);}
	}

	function switchCurrOnTable(table,curr){
		try{
			$.each(table.getColumns(),function(i,obj){
				if(obj.getId().indexOf(curr)>=0|| obj.getId().indexOf("Id")>=0){
					obj.setVisible(true);
				}else{
					obj.setVisible(false);
				}
			});
		}catch(ex){handleException(ex);}
	}

	function getCurrentViewName(view){
		try{
			if(view.getContent()[0]!=null){
				if(view.getContent()[0].getId().indexOf(detailsViewName)>=0){
					return detailsViewName;
				}else if (view.getContent()[0].getId().indexOf(masterViewName)>=0){
					return masterViewName;
			}
			}
		}catch(ex){handleException(ex);}
	}
	
	function validateDashboardInputs(view){
		try{
			var periodDD = view.byId("selectPeriod");
			var fromDate = view.byId("fromDate").getDateValue();
			var toDate = view.byId("toDate").getDateValue();
			if(toDate<fromDate){
				sap.m.MessageToast.show(_oResourceBundle.getText("DATE_RANGE_ERROR"));
				return false;
			}
			var obj = $.grep(periodDD.getModel().getData(),function(period,idx){
			         return ( period.key == periodDD.getSelectedItem().getKey());});
			if(fromDate<obj[0].firstDay || toDate > obj[0].lastDay){
				sap.m.MessageToast.show(_oResourceBundle.getText("DATE_RANGE_ERROR"));
				return false;
			}else{
				return  true;
			}
		}catch(ex){handleException(ex);}
	}
	
	function formatterTotal(status){
		try {
			if(status=="N"){
				this.addStyleClass("statusStylePPVTotal");	
			}
			} catch (e) {	
					return null;
					 handleException(e);
			} 
	}
	

	function saveSelectionData() {
		//Save the selection data for next login
		if(sap.ui.getCore().getModel("selectionData")!= undefined){
			var	selectionData =  sap.ui.getCore().getModel("selectionData");
			_setSelectionInput(selectionData);
		}else{
			var selectionModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("com.jabil.fi.model",
				"/selection_data.json"));
			selectionModel.attachRequestCompleted(function() {
			     sap.ui.getCore().setModel(selectionModel.getData(), "selectionData");	
			     var selectionData =  sap.ui.getCore().getModel("selectionData");
			     _setSelectionInput(selectionData);
			});	
		}
		
		}
		
	function getSavedSelectionData() {
		
		try{
			var selectionData;
			if(sap.ui.getCore().getModel("selectionData")!= undefined){
				selectionData =  sap.ui.getCore().getModel("selectionData");
			}else if(jQuery.sap.storage(jQuery.sap.storage.Type.local).get("selectionData")!=null ){
				selectionData = jQuery.sap.storage(jQuery.sap.storage.Type.local).get("selectionData");
				sap.ui.getCore().setModel(selectionData,"selectionData");
			}else{ // no saved inputs. This will go woth default
				isInitialLoad = false;
			}
			return selectionData;
		}catch(e){handleException(e);}
	}
	function createPCDialog(controller){
		try{
			var pcDialog = new sap.m.Dialog({
				title: _oResourceBundle.getText("SEL_PROFITCENTER"),
				draggable:true,
				contentHeight:"550px",
				contentWidth:"500px",
	            subHeader: new sap.m.Toolbar({content:[new sap.m.CheckBox("selAll",{text:"All", select:controller.handleSelectAll}).addStyleClass("selAllStyle"),new sap.m.Text("pcToolbarText"),new sap.m.SearchField("pcListFilter",{width:"75%", liveChange:controller.handleSearch, search:controller.handleSearch})]}),
				content: new sap.m.List("pcList",{
	               		        mode:sap.m.ListMode.MultiSelect, 
					includeItemInSelection: true,
					select:controller.handleListItemSelected,
					items: {
						path: '/d/results',
						template: new sap.m.StandardListItem({
							title: "{Prctr}",
							description: "{Ktext}",
							type:"Active",
							iconInsert:false,
							iconDensityAware:false
						})
					}
	               			//infoToolbar: new sap.m.Toolbar({content:[new sap.m.Text("pcToolbarText")]})
				}),
	          	  buttons:[
				new sap.m.CheckBox("showSel",{text:"Show Selected", select:controller.handleShowSelected}),
				new sap.m.Button({text:"Clear Selection", press:controller.handleClearSelection}),
				new sap.m.Button({text:"Apply", press:controller.handleConfirm}).addStyleClass("applyBtStyle"),
				new sap.m.Button({text: 'Cancel', press: controller.handleClose })]
			});
			return pcDialog;
		}catch(ex){handleException(ex);}
	}
	function _setSelectionInput(selectionData){
		//selectionData.fromDate =	$.format.date(sap.ui.getCore().byId("fromDate").getDateValue(),"yyyy-MM-ddT00:00");
		//selectionData.toDate =	$.format.date(sap.ui.getCore().byId("toDate").getDateValue(),"yyyy-MM-ddT00:00");
		selectionData.selectPeriod =	{"Key":sap.ui.getCore().byId("selectPeriod").getSelectedItem().getKey(),"Text":sap.ui.getCore().byId("selectPeriod").getSelectedItem().getText()};
		selectionData.selectedCC =	sap.ui.getCore().byId("selectCompany").getSelectedKey();
		selectionData.selectedPlant =	sap.ui.getCore().byId("selectPlant").getSelectedKey();
		selectionData.vSelectedPCs =	sap.ui.getCore().byId("pcList")._aSelectedPaths;
// Set values here !!!!
		jQuery.sap.storage(jQuery.sap.storage.Type.local).put("selectionData", selectionData);
	}
	function searchPeriod(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].key === nameKey) {
            return myArray[i];
        }
    }
	}