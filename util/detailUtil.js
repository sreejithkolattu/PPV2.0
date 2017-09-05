jQuery.sap.declare("com.jabil.fi.util.detailUtil");
//variable for select/deselect senario
var selectAllMode="";
var _oResourceBundle;
var removeBatchCommentFlag = false;	
	/** Function : isValidForPosting < Status validation
	* input >> Status
	* output << Boolean
	* Validation for Posting status
	* RS : Both revenue & RC posting done
	* S : Only posting
	* R : Only Revenue posting
	*/
	function isValidForPosting(status) {
		try{
			if(status!=null && status.indexOf("RS")===0){	 
				return false ;
			}else if(status.indexOf("S")===0){
				return false;
			}else if(status.indexOf("N")===0){
				return false;
			}else{
				return true;}
		}catch(e){handleException(e);}
	}
	/**
	 */
	function isValidForEnable(status) {
		try{
			if(status!=null && status.indexOf("RS")===0){	 
				return false ;
			}else if(status.indexOf("S")===0 && !isRevenuePostActive){
				return false;
			}else if(status.indexOf("N")===0){
				return false;
			}else{
				return true;}
		}catch(e){handleException(e);}
	}
	/**
	 */
	function revenueStatusFormatText(pubStatus) {	
       try {
    	   if(pubStatus!=null && pubStatus.toString()!== "NaN"){
	            if ( pubStatus === "X") {
	                 return _oResourceBundle.getText("ERROR");
				} else if ( pubStatus === "") {
					return "";		
	            } else if ( pubStatus.indexOf("S") === 0) {
					return _oResourceBundle.getText("POSTED");
	            } else if ( pubStatus.indexOf("R") === 0) {
	            	this.addStyleClass("cyanClass");
					return  _oResourceBundle.getText("POSTED");	
	            } else {
	                 return "";
	            }	  
    	   }
		   } catch (e) {	
				return null;
				handleException(e);
			} 

		}	
	/**
	 */
	function isValidRecordForPosting(reasonCode) {
		try{
			if(reasonCode ==="3" || reasonCode ==="4" || reasonCode ==="5" || reasonCode ==="11" ){						
				return true;
				}
		}catch(e){handleException(e);}
	}
	/**
	 */
	function isRecordsValidForSave() {
		try{
			var selCols = _oDetailTable._oSelection.aSelectedIndices;
			var tableData = _oDetailTableModel.oData.tableData;
			for (var i = 0; i < selCols.length; i++) {
				var selIndex = _oDetailTable.getContextByIndex(selCols[i]).sPath.split("/")[2]; //Revenue posted tiem is allowed to save comment
			if ( tableData[selIndex].Status.indexOf("S") === 0 || tableData[selIndex].Status.indexOf("N") === 0 ||tableData[selIndex].Status.indexOf("RS")=== 0 ) {
							return false;
					}
			}
			return true;
		} catch (e) {
			busyDialog.close();
			handleException(e);
		}
		}
	/**
	 */	
	function isValidForCommentAssignment(selRow) {
		try{
			var tableData = _oDetailTableModel.oData.tableData;
			if ( tableData[selRow].Status.indexOf("S") === 0 ||tableData[selRow].Status.indexOf("RS")=== 0 ) {
					return false;
			}
			return true;
		} catch (e) {
			busyDialog.close();
			handleException(e);
		}
		}
	/**
	 */	
	function isValidForRCAssignment(selRow) {
		try{
			var tableData = _oDetailTableModel.oData.tableData;
			if ( tableData[selRow].Status.indexOf("S") === 0 || tableData[selRow].Status.indexOf("R") === 0 || tableData[selRow].Status.indexOf("RS")=== 0 ) {
					return false;
			}
			return true;
		} catch (e) {
			busyDialog.close();
			handleException(e);
		}
		}
	/**
	 */	
	function isValidForBatchAssignment() {
		try{
			var selCols = _oDetailTable._oSelection.aSelectedIndices;
			var tableData = _oDetailTableModel.oData.tableData;
			for (var i = 0; i < selCols.length; i++) {
				var selIndex = _oDetailTable.getContextByIndex(selCols[i]).sPath.split("/")[2];
				if (tableData[selIndex].Status.indexOf("R") === 0 || tableData[selIndex].Status.indexOf("S") === 0 ||tableData[selIndex].Status.indexOf("RS")=== 0 ) {
						return false;
				}
			}
			return true;
		} catch (e) {
			busyDialog.close();
			handleException(e);
		}
		}
	/**
	 */
	function isValidForRevenuePosting() {
		try {
				var selCols = _oDetailTable._oSelection.aSelectedIndices;
				var tableData = _oDetailTableModel.oData.tableData;
				for (var i = 0; i < selCols.length; i++) {
					var selIndex = _oDetailTable.getContextByIndex(selCols[i]).sPath.split("/")[2];
					if (tableData[selIndex].Status.indexOf("R") === 0 || tableData[selIndex].Status.indexOf("RS")=== 0 ) {
							return false;
					}
				}
				return true;
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		}
	/**
	 */	
	function isRowSelectionDisable(selStatus) {
			if (selStatus.indexOf("SR") === 0 || selStatus.indexOf("N") === 0 || (selStatus.indexOf("S") === 0 && !isRevenuePostActive) ) {
				return true;
			}
		}
	/**
	 */
	function isValidToPublish() {
			try {
				var selCols = _oDetailTable._oSelection.aSelectedIndices;
				var tableData = _oDetailTableModel.oData.tableData;
				var totalPPVSum = 0;
				// Validate the records with table model to confirm reason codes are saved.
				for (var i = 0; i < selCols.length; i++) {
					var selIndex = _oDetailTable.getContextByIndex(selCols[i]).sPath.split("/")[2];
					if (tableData[selIndex].Status.indexOf("S") === 0 || tableData[selIndex].Status.indexOf("RS") === 0 || tableData[selIndex].Status.indexOf("N") === 0 || tableData[selIndex].Reasoncode === "") {
							return false;
					}
				}
				return true;
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		}	
	/**
	*/
	function getStatusTextId(text){	
		try{
			text = text.trim();
			var statusTextId="";
			if(text===""||text==null||text===" "){
				statusTextId= "";
			}else if(text==="Posted" ||text==="posted" ){
				statusTextId= "S:";
			}else if(text==="Error" ||text==="error" ){
				statusTextId= "X";
			}else{	
				statusTextId= "N:";
			}
			return statusTextId;
		}catch(e){handleException(e);}
		}
		
			
	/** 
	*/
	function getErrorMessage(msg) {		
		try{var error="";
			if(msg.responseText.indexOf("<message xml:lang=")>0){
				error = msg.responseText.match(/<message xml:lang="en">([^<]*)<\/message>/)[1];
				return error;
			}else{
				return msg.responseText;
			}
			return "Error";
		}catch(e){handleException(e);}		
	}	
	//------------------------------------- ECC -----------------------------------------------	
		
	/** Function : executeUpdateECC
		* input >> recordToSave,view 
		* output << 
		*	1. Convert input to string
		*	2. Call Odata service
		*	3. If success:
		* 		- Update the  X-CSRF-Token
		*		- Call service to get updated records
		*		- Message for user   
		*/
	function executeUpdateECC(recordToSave,view,type,isRestricted){	
		try{	
			if(sapClient!=undefined){
				var myData = JSON.stringify(recordToSave);
				var modelData = sap.ui.getCore().getModel("_oDetailTableModel").oData;
				sap.ui.getCore().setModel(recordToSave.NavToSaveRc,"postRc");
				busyDialog.open();		
				$.ajax({
					type: "POST",
					  url:_oResourceBundle.getText("REASONCODE_POSTING_SERVICE",[eccOdataService,sapClient])+"&ts="+$.now(),
					  data:myData,
					  contentType: 'application/json',
					  headers: {"X-CSRF-Token": xsrfTokenValue},
					  error : function(msg, textStatus) {
						console.log(textStatus);
						busyDialog.close();						
						errorMessage(getErrorMessage(msg));					 
					  },
					  success : function(data , status, xhr) {
						 var timeDelay=0;
						if(type==="POST" && sap.ui.getCore().getModel("postRc")!=undefined){
							timeDelay =5000;
							var postQ; postQ = sap.ui.getCore().getModel("postQ")!=null?sap.ui.getCore().getModel("postQ"):[]; 
							$.each(sap.ui.getCore().getModel("postRc"),function(id,item){
								if(postQ.indexOf(item)=== -1)postQ.push(item);
								});
							sap.ui.getCore().setModel(postQ,"postQ");
							sap.ui.getCore().setModel(null,"postRc");
						}
						//If posting loop restriction is on
						if(!isRestricted){
							setTimeout(function(){
								executeTableModel(view,false);	
								if(type==="SAVE"){
									_saveButtonUpdation();
								}else{
									informationMessage(_oResourceBundle.getText("ECC_POST_UPDATE_SUCCESS"));
									_oDetailTable._oSelection.aSelectedIndices.length=0;
									_refreshTable();
								}
								}, timeDelay);
						}else{
								executeTableModel(view,false);	
								if(type==="SAVE"){
									_saveButtonUpdation();
								}
						}
					  }
					});
				// clear unSavedReasonCode
				modelData.unSavedReasonCode=[];
				modelData.unSavedComment="";
			}
		}catch(e){handleException(e);}
	}

	/** Function : executeTableModel  >> TABLE MODEL
		* input >> view
		* output << 
		*	1. prepare the inputs for getting table data
		*	2. Get the table data from ECC through oData service	
		*   3. Calculate the sum of respective PPV fields
		*   4. Set teh defaults for table fields
		*/
	function executeTableModel(view,clearFlag){
		try{
			if(sapClient!=undefined){
				if(_oResourceBundle ===undefined){setResourceModel(view);}
				if(clearFlag){clearTableContent(view);}
				busyDialog.open();	
				isLocalCurr = selectedCurr=="Grp"?false:true;
				var _oDetailTableModel = sap.ui.getCore().getModel("_oDetailTableModel"); 
				//Get parameters for call
				this._oRouter = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(view));		
				var selParameter = this._oRouter._oRouter._oRouter._prevRoutes[0].params;
			 	var inputParam1 = _getDetailSelectionInput(selParameter);			 			 	
				$.ajax({
					type: "GET",
					  url: _oResourceBundle.getText("TABLEMODEL_SERVICE",[eccOdataService,inputParam1,sapClient])+"&ts="+$.now(),
					  cache: false,
					  dataType: "json",
					  headers: {"X-CSRF-Token" : "Fetch"},
					  error : function(msg, textStatus) {;
						busyDialog.close();
						errorMessage(getErrorMessage(msg));						
					  },
					  success : function(data, status, xhr) {
					    xsrfTokenValue = xhr.getResponseHeader("X-CSRF-Token");	
					    if(data.d==undefined){
								handleRequestFailed("tableModel");
					    }else if(data.d.results.length===0){
					    		informationMessage(_oResourceBundle.getText("NO_RECORD"));
					    		busyDialog.close();	
					    }else{
					    	if(_oDetailTableModel!==undefined){			    		
					    		_oDetailTableModel.oData.tableData=data.d.results;
								sap.ui.getCore().setModel(_oDetailTableModel,"_oDetailTableModel"); 
								processTableItems();
								_defaultTableSettings(view);
								_oDetailTable = view.byId("detailTable");
								if(_oDetailTable != null){
									_oDetailTable.setModel(_oDetailTableModel);
								}
								if(groupModification){
									additionalReset();
								}
								_oDetailTableModel.refresh();
								_oResourceBundle.getText("TOTAL_LINES",_oDetailTableModel.oData.tableData.length)
					    	}
							busyDialog.close();	
							//To format date values in model
							_ModelFormatChecker();
					    }
					  }				  
					});
				//Google Analytics
				ga('send', 'pageview', 'Get_PPVDetails',"CC:"+sap.ui.getCore().byId("selectCompany").mProperties.selectedKey);
			}else{
				errorMessage("Undefined SAP Client");	
			}
		}catch(e){handleException(e);}
	}
	
	/** Function : getStatus
	* input >> input1,type,selRow,oDetailMultiDialog
	* output << 
	* This function used to get both result status and Comment from ecc
	*	1. if the flag is X, get result status for Error
	*      if the flag is C, get the comment for the respective item
	*/
	function getStatus(input1,type,selRow,oDetailMultiDialog,Rtype){
		try{
			busyDialog.open();
			var statusModel = new sap.ui.model.json.JSONModel(_oResourceBundle.getText("GETSTATUS_SERVICE",[eccOdataService,input1,sapClient])+"&ts="+$.now());
			statusModel.attachRequestCompleted(function(){
				if(statusModel.getData()!= null ){
					var receivedStatus = statusModel.getData().d.Status;
					if(type==="X"){	// The error will send the status X				
					    var state = "Error";
					    var icon = "sap-icon://alert";						
						oDetailMultiDialog.setModel("");
						var resultSetModel = new sap.ui.model.json.JSONModel();
						resultSetModel.setData({icon:icon ,state: state,text:receivedStatus});
						oDetailMultiDialog.setModel(resultSetModel);
						resultSetModel.refresh();
					}else if(Rtype===_oResourceBundle.getText("AP")){							
						if(receivedStatus.trim()===_oResourceBundle.getText("DD_INCORRECT_PO")){
							oDetailMultiDialog.getModel().getData().kpComments[0].selected=true;
						}else if(receivedStatus.trim()===_oResourceBundle.getText("DD_INVOICE_INCORRECT")){
							oDetailMultiDialog.getModel().getData().kpComments[1].selected=true;
						}else if(receivedStatus.trim()===_oResourceBundle.getText("DD_DNCN")){
							oDetailMultiDialog.getModel().getData().kpComments[2].selected=true;
						}else if(receivedStatus.trim()===_oResourceBundle.getText("DD_INCORRECT_CONSIGNED")){
							oDetailMultiDialog.getModel().getData().kpComments[3].selected=true;}
						oDetailMultiDialog.getModel().refresh();
					}else{
						var commentModel = new sap.ui.model.json.JSONModel();
						commentModel.setData({commentAvailable:receivedStatus,selRow:selRow,batch:false});
						oDetailMultiDialog.setModel(commentModel);	
						commentModel.refresh();
					}				
				}else{
					handleRequestFailed(statusType);
				}
				oDetailMultiDialog.setBusy(false);
				busyDialog.close();	
			});
			statusModel.attachRequestFailed(function(){
				oDetailMultiDialog.setBusy(false);
				busyDialog.close();	
				handleRequestFailed("statusModel");
				});
		}catch(e){
			oDetailMultiDialog.setBusy(false);
			handleException(e);
		}
	}

	/** Function : setreasonCodeDDModel 
	    * input >> view
		* output << 
		*/
	function setreasonCodeDDModel(view){
		var reasonCodeDD = view.byId("selectReasonCode");	
		reasonCodeDD.setModel(sap.ui.getCore().getModel("rcModel"));
		var _oDetailTableModel = sap.ui.getCore().getModel("_oDetailTableModel"); 
		_oDetailTableModel.oData.ReasonCodeDD=sap.ui.getCore().getModel("rcModel").oData;
	}
	/** Function : loadRCModel 
	    * input >> view
		* output << 
		*	1. Get the reasoncodes from ECC 
		*   2. Attach to dropdown
		*   3. For the table,add it to _oDetailTableModel
		*/
	function loadRCModel(view){
		try{if(_oResourceBundle ===undefined){setResourceModel(view);}	
			var rcModel = new sap.ui.model.json.JSONModel(getDataEndPoint("rcModel"));
			rcModel.attachRequestCompleted(function(){
				var data = rcModel.getData();
				sap.ui.getCore().setModel(rcModel,"rcModel");
				if(data!==undefined && data.d!==undefined){// && reasonCodeDD != null){
						data.d.results.push({Description: _oResourceBundle.getText("SELECTONE"),Reasoncode: ""});
						data.d.results.push({Description: _oResourceBundle.getText("REMOVERC"),Reasoncode: "X"});
						rcModel.setData(data.d.results);
						if(view!=null){
							setreasonCodeDDModel(view);}
				}else{
					handleRequestFailed("rcModel",_oResourceBundle.getText("NO_DATA_FROM_BACKEND"));
				}			
			});
			rcModel.attachRequestFailed(function(oEvent){
				handleRequestFailed("rcModel",getErrorText(oEvent));});  
		}catch(e){handleException(e);}
	}

	
	/** Function : clearTableContent
	* This function used to clear the table contents 
	*	1. clear Table Content	
	*	1. clear unsaved ReasonCode
	*	1. clear total Lcl values
	*	1. clear total Grp values
	*/
	function clearTableContent(view){
		try{
			if(view!=undefined && sap.ui.getCore().getModel("_oDetailTableModel")!= undefined){
				clearTableSelection(view);
				sap.ui.getCore().getModel("_oDetailTableModel").oData.tableData=[];
				sap.ui.getCore().getModel("_oDetailTableModel").oData.unSavedReasonCode=[];
				sap.ui.getCore().getModel("_oDetailTableModel").oData.unSavedComment="";
				sap.ui.getCore().getModel("_oDetailTableModel").oData.grpHeader=[];
				totalLcl = [ {"sumTotalPPV" : "0","sumAmount" : "0"}];
				totalGrp = [ { "sumTotalPPV" : "0"}];
				sap.ui.getCore().getModel("_oDetailTableModel").oData.TotalLcl = totalLcl;
				sap.ui.getCore().getModel("_oDetailTableModel").oData.TotalGrp = totalGrp;	
				sap.ui.getCore().getModel("_oDetailTableModel").oData.batchComment = "";
				view.byId("batchCommentText").mProperties.type="Default";
				sap.ui.getCore().getModel("_oDetailTableModel").refresh();
				view.byId("detailTable").setNoData(new sap.ui.commons.TextView({text: ""}));
			}
		}catch(e){handleException(e);}
	}
	
	/** Function : changeGroupHeader  
	 * Chanf 
	*/
	function changeGroupHeader(view){
		try{
			$.each(sap.ui.getCore().getModel("_oDetailTableModel").oData.grpHeader.grpHeaderSum,function(id,item){
				view.byId("detailTable").getContextByIndex(item.id).name = selectedCurr=="Grp"?item.nameGrp:item.nameLcl;
			});
		}catch(e){handleException(e);}
	}
	/** Function : getGroupHeader  
	* input >> id,view
	* output << 
	*	1. 	
	*/
	function getGroupHeader(view,idSet,id){
		try{
			if(view.byId("detailTable").getContextByIndex(id)!=undefined && view.byId("detailTable").getContextByIndex(id).name!=undefined){
				if(idSet==undefined){
					idSet={"id":id,"name":view.byId("detailTable").getContextByIndex(id).name};
				}else{
					idSet.push({"id":id,"name":view.byId("detailTable").getContextByIndex(id).name});				
					getGroupHeader(view,idSet,id+view.byId("detailTable").getContextByIndex(id).count+1);					
				}
			}
			return idSet;

		}catch(e){handleException(e);}
	}

	/** Function : setGroupHeader  
	* input >> id,view
	* output << 
	*	1. 	
	*/
	function setGroupHeader(view,idSet){
		try{
			$.each(idSet,function(id,item){
				view.byId("detailTable").getContextByIndex(item.id).name=item.name;
			});
		}catch(e){handleException(e);}
	}
	/** Function : clearGroupHeader  
	* input >> id,view
	* output << 
	*	1. 	
	*/
	function clearGroupHeader(id,view){
		try{
		if(view.byId("detailTable").getContextByIndex(id)!=undefined && view.byId("detailTable").getContextByIndex(id).name!=undefined){
			view.byId("detailTable").getContextByIndex(id).name="";
			view.byId("detailTable").getContextByIndex(id).groupHeader=false;
			clearGroupHeader( id+view.byId("detailTable").getContextByIndex(id).count+1,view);
		}else{
			return true;
			}
		}catch(e){handleException(e);}
	}
	/** Function : informationMessage  
	* input >> message
	* output << 
	*	1. Dispaly the message	
	*/
	function informationMessage(message){
		try{
		 sap.m.MessageToast.show(message, {
				width: "auto"
			});
		}catch(e){handleException(e);}
	}
	/** Function : errorMessage  
	* input >> msgBody
	* output << 	
	*/
	function errorMessage(msgBody){
		try{
		jQuery.sap.require("sap.m.MessageBox");
		var msgTitle = "System Error";
	    sap.m.MessageBox.show( msgBody, {
	            icon: sap.m.MessageBox.Icon.ERROR,
	            title: msgTitle
	            });
		}catch(e){handleException(e);}
	}
	
	/** Function : clearTableSelection  
	* input >> view
	* output << 
	* This method clears the table selections
	*	1. clear Table Selection,sorting and filtering	
	*/
	function clearTableSelection(view){
		try{
			if(view!=undefined ){
				var groupFlag;
				_oDetailTable = view.byId("detailTable");
				_oDetailTable.setSelectionMode("None");
				_oDetailTable.setSelectionMode("MultiToggle");
				if(_oDetailTable.getGroupBy()!=null){
					groupFlag = true;
					_dtlView.byId(_oDetailTable.getGroupBy().split("--")[1]).setGrouped(false)
					_oDetailTable.setEnableGrouping(false);
					_oDetailTable.setGroupBy(null);
					_oDetailTable.setEnableGrouping(true);
				}
				_oDetailTable.setFooter("");
				if(_oDetailTable.getBinding()!=undefined){
					var oListBinding = _oDetailTable.getBinding();			
					clearGroupHeader(0,view);		
					if(oListBinding.aFilters.length>0){
						for (var i=0; i < _oDetailTable.getColumns().length; i++){
							_oDetailTable.getColumns()[i].mProperties.filterValue="";
							_oDetailTable.getColumns()[i].mProperties.filtered=false;
						}
						
					}
		            oListBinding.aSorters = [];
		            oListBinding.aFilters = [];
		            oListBinding.aApplicationFilters = [];
		            _oDetailTable.setGroupBy(null);//To refresh table
				}
			}
			view.byId("showGroupInfo").setVisible(false);
		}catch(e){handleException(e);}
	}
	


	/** Function : formatToTwoDecimal 
	* input >> 
	* output << 
	*	1. adjust to two decimal place	
	*/
	function formatToTwoDecimal(value){
		try{
		value = value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");	
		return value;
		}catch(e){handleException(e);}
	}

	/** Function : getSelectedCurrency 
	* input >> 
	* output << 
	*	1. get currency	
	*/
	function getSelectedCurrency(){
		try{
			return selectedCurr=="Grp"?grpCurr:lclCurr;
		}catch(e){handleException(e);}
	}
	

	/************************************************************** 
	 *           Methods for Excel
	 *************************************************************/
		/** Function : getFileName
	*	1. create file name for excel
	*/
	function getFileName(fileName) {
		try{
			if(fileName === undefined || fileName.length<1){
				var _fcc = sap.ui.getCore().byId("selectCompany").mProperties.selectedKey;
				var _fper = sap.ui.getCore().byId("selectPeriod").getSelectedItem().getKey();
				fileName = _fcc +"_"+_fper;
				if(selectedPCs.length>0 && selectedPCs.length<20){
					fileName+="_"+selectedPCs;
				}
			}
			return _oResourceBundle.getText("FILENAME",fileName);

		}catch(e){
			handleException(e);	
			return "PPV_Records";
		}
	}
	/** Function : getExcelColumns
	*	1. create file name for excel
	*/
	function getExcelColumns() {
		try{
		var excelColumns = [{
				name : _oResourceBundle.getText("Matnr"),
				template : {content : "{Matnr}"}
			}, {
				name : _oResourceBundle.getText("Mtxt"),
				template : {content : "{Mtxt}"}
			}, {
				name : _oResourceBundle.getText("Mtart"),
				template : {content : "{Mtart}"}
			}, {
				name : _oResourceBundle.getText("EXTMATLGRP"),
				template : {content : "{EXTMATLGRP}"}
			}, {
				name : _oResourceBundle.getText("PROCTYP"),
				template : {content : "{PROCTYP}"}
			}, {	
				name : _oResourceBundle.getText("Belnr"),
				template : {content : "{Belnr}"}
			}, {
				name : _oResourceBundle.getText("Blart"),
				template : {content : "{Blart}"}
			}, {
				name : _oResourceBundle.getText("UMMAT"),
				template : {content : "{UMMAT}"}	
			}, {	
				name : _oResourceBundle.getText("Bukrs"),
				template : {content : "{Bukrs}"}
			}, {
				name : _oResourceBundle.getText("Prctr"),
				template : {content : "{Prctr}"}
			}, {	
				name : _oResourceBundle.getText("Lifnr"),
				template : {content : "{Lifnr}"}
			}, {	
				name : _oResourceBundle.getText("Name1"),
				template : {content : "{Name1}"}	
			}, {
				name : _oResourceBundle.getText("Buzei"),
				template : {content : "{Buzei}"}
			}, {	
				name : _oResourceBundle.getText("Gjahr"),
				template : {content : "{Gjahr}"}
			}, {
				name : _oResourceBundle.getText("Monat"),
				template : {content : "{Monat}"}
			}, {
				name : _oResourceBundle.getText("Assigned_By"),
				template : {content : "{Assigned_By}"}
			}, {	
				name : _oResourceBundle.getText("Werks"),
				template : {content : "{Werks}"}
			}, {
				name : _oResourceBundle.getText("Ekgrp"),
				template : {content : "{Ekgrp}"}
			}, {
				name : _oResourceBundle.getText("PURGRPNAME"),
				template : {content : "{PURGRPNAME}"}
			}, {	
				name : _oResourceBundle.getText("budat"),
				template : {content : "{path: 'budat',formatter: '.getDateExcel'}"}
			}, {
				name : _oResourceBundle.getText("GR_DATE"),
				template : {content : "{path: 'GR_DATE',formatter: '.getDateExcel'}"}
			}, {
				name : _oResourceBundle.getText("Ebeln"),
				template : {content : "{Ebeln}"}
			}, {
				name : _oResourceBundle.getText("PSTYP"),
				template : {content : "{PSTYP}"}	
			}, {	
				name : _oResourceBundle.getText("Ebelp"),
				template : {content : "{Ebelp}"}
			}, {
				name : _oResourceBundle.getText("Menge"),
				template : {content : "{Menge}"}
			}, {
				name : _oResourceBundle.getText("PO_WAERS"),
				template : {content : "{PO_WAERS}"}
			}, {
				name : _oResourceBundle.getText("NETPR"),
				template : {content : "{NETPR}"}
			}, {
				name : _oResourceBundle.getText("PO_PRICE_UNIT"),
				template : {content : "{PO_PRICE_UNIT}"}
			}, {
				name : _oResourceBundle.getText("INF_REC_PRC"),
				template : {content : "{INF_REC_PRC}"}
			}, {
				name : _oResourceBundle.getText("INF_PRC_UNIT"),
				template : {content : "{INF_PRC_UNIT}"}
			}, {
				name : _oResourceBundle.getText("INF_WAERS"),
				template : {content : "{INF_WAERS}"}
			}, {	
				name : _oResourceBundle.getText("Zkprs"),
				template : {content : "{Zkprs}"}
			}, {
				name : _oResourceBundle.getText("Peinh"),
				template : {content : "{Peinh}"}
			}, {
				name : _oResourceBundle.getText("ZPLP2"),
				template : {content : "{ZPLP2}"}
			}, {
				name : _oResourceBundle.getText("INV_PRICE"),
				template : {content : "{INV_PRICE}"}
			}, {
				name : _oResourceBundle.getText("WRBTR"),
				template : {content : "{WRBTR}"}
			}, {	
				name : _oResourceBundle.getText("waers"),
				template : {content : "{waers}"}
			},{	
				name : _oResourceBundle.getText("ExlSTPRS_Grp"),
				template : {content : "{STPRS_GRP}"}
			}, {	
				name : _oResourceBundle.getText("ExlSTPRS_Lcl"),
				template : {content : "{STPRS_LCL}"}
			},{	
				name : _oResourceBundle.getText("ExlSTPRS_UM_Grp"),
				template : {content : "{STPRS_UM_GRP}"}
			}, {	
				name : _oResourceBundle.getText("ExlSTPRS_UM_Lcl"),
				template : {content : "{STPRS_UM_LCL}"}	
			}, {	
				name : _oResourceBundle.getText("ExlMr22Grp"),
				template : {content : "{Mr22Grp}"}
			}, {
				name : _oResourceBundle.getText("ExlMr22Lcl"),
				template : {content : "{Mr22Lcl}"}
			}, {	
				name : _oResourceBundle.getText("ExlTotalGrp"),
				template : {content : "{TOTAL_GRP}"}
			},{	
				name : _oResourceBundle.getText("ExlTotalLcl"),
				template : {content : "{TOTAL_LCL}"}
			},{	
				name : _oResourceBundle.getText("DMBE3"),
				template : {content : "{DMBE3}"}	
			}]; 
	/*	if(selectedCurr=="Grp"){
		excelColumns.push(
			{	name : _oResourceBundle.getText("STPRS_LCL"),
				template : {content : "{STPRS_GRP}"}
			}, {	
				name : _oResourceBundle.getText("Mr22Grp"),
				template : {content : "{Mr22Grp}"}
			}, {
				name : _oResourceBundle.getText("TotalGrp"),
				template : {content : "{TOTAL_GRP}"}
			});
		}else{
			excelColumns.push(
			{	name : _oResourceBundle.getText("STPRS_LCL"),
				template : {content : "{STPRS_LCL}"}
			}, {
				name : _oResourceBundle.getText("Mr22Lcl"),
				template : {content : "{Mr22Lcl}"}
			}, {
				name : _oResourceBundle.getText("TotalLcl"),
				template : {content : "{TOTAL_LCL}"}
			});
		}*/
		if(isFxCC){
		excelColumns.push({
			name : _oResourceBundle.getText("Fxval"),
			template : {content : "{Fxval}"}	
		});
			}		
		excelColumns.push({
			name : _oResourceBundle.getText("ReasonCode"),
			template : {content : "{path: 'Reasoncode',formatter: '.getReasoncodeTextExcel'}"}	
		}, {
			name : _oResourceBundle.getText("Comments"),
			template : {content : "{path: 'Comments',formatter: '.getCommentsExcel'}"}	
		}, {
			name : _oResourceBundle.getText("Status"),
			template : {content : "{path: 'Status',formatter: '.getStatusExcel'}"}		
		});
		return excelColumns;
	}catch(e){
		handleException(e);
		}	
	}
	/** Function : exportToCSV   >> EXPORT TO EXCEL
	*	1. get model from instance 	
	*   2. prepare the data for csv
	*/
	function exportToCSV() {
		try{
		var excelColumns = 	getExcelColumns();
		var hiddenColumns = getHiddenColumns();
		for (var i=0; i<hiddenColumns.length; i++){	
		 //excelColumns =	getColumnsInfoForExcel(excelColumns,hiddenColumns[i]);
		 	excelColumns = excelColumns.filter(function( obj ) {
				return obj.name !== hiddenColumns[i];
			});
		}

		var oExport = new sap.ui.core.util.Export({
		exportType : new sap.ui.core.util.ExportTypeCSV({
			separatorChar : ","
		}),
		models :sap.ui.getCore().getModel("_oDetailTableModel"),
		rows : {
			path : "/tableData"
		},
		columns :excelColumns	
		});
		
			return oExport;
		}catch(e){handleException(e);}	
		}
	/**
	 * 
	 */
	function getHiddenColumns(){
		var myItems =[];
		var personalisationData = getSavedPersonalisationData();
			$.each(personalisationData.ColumnCollection, function(idx,item){	
				if(item.visible == false){
					myItems.push(item.text);
				}
			});
			return myItems;
	} 
	/** Function : getDateExcel 
	* input >> value
	* output << 
	*	1. get currency	
	*/
	function getDateExcel(Budat){	
		try{
			if(Budat!=null && Budat.length > 18){
				Budat = Budat.slice(6, 19); 
				var n = parseInt(Budat); 		
				return new Date(n).toLocaleDateString('en-US',{timeZone: 'UTC'}).toString();
			} 
			return "";
		}catch(e){
			return "";
		}
		}
	/** Function : getCommentsExcel 
	* input >> value
	* output << 
	*	1. get currency	
	*/
	function getCommentsExcel(value){	
		try{
			return (value=="" ||value=="X")? "":value;
		}catch(e){handleException(e);}
	}
	/** Function : getStatusExcel 
	* input >> value
	* output << 
	*	1. get currency	
	*/
	function getStatusExcel(value){	
		try{
			if(value!=null){
				if(value.indexOf("S") === 0 || value.indexOf("R") === 0 || value.indexOf("RS") === 0){
					if(value.split(":")[1]!=null && value.indexOf("S") === 0 && value.split(":")[1].length>10){
						return _oResourceBundle.getText("POSTED_ID_MSG",[(value.split(":")[1].trim()).substr(0,10)]);
					}else if(value.split(":")[1]!=null && value.indexOf("R") === 0 && value.split(":")[1].length>10){
						return _oResourceBundle.getText("REV_POSTED_ID_MSG",[(value.split(":")[1].trim()).substr(0,10)]);
					}else if(value.split(":")[1]!=null && value.indexOf("RS") === 0 && value.split(":")[1].length>10){
						return _oResourceBundle.getText("POSTED_BOTH_MSG",[(value.split(":")[1].trim()).substr(0,10)]);	
					}else{
						return _oResourceBundle.getText("POSTED_ID_UNALAILABLE");
					}
				}else if(value.indexOf("N") === 0){
					return _oResourceBundle.getText("NOT_ALLOWED_TO_POST");
				}else if(value === "X"){
					return _oResourceBundle.getText("POSTED_ERROR_MSG");
				}else{
					return "";
				}
			}
			return "";
		}catch(e){handleException(e);}
	}
	/** Function : ReasoncodeText 
	* input >> value
	* output << 
	*	1. get currency	
	*/
	function getReasoncodeTextExcel(value){	
		try{
			if(value!==""&&value!=="0"&&value!=null&&value!=="Select One"){
				for(var i=0;i<sap.ui.getCore().getModel("rcModel").oData.length;i++){
					if(value === sap.ui.getCore().getModel("rcModel").oData[i].Reasoncode){
						return sap.ui.getCore().getModel("rcModel").oData[i].Description;
					}
				}
			}
			return "";
		}catch(e){handleException(e);}
		}
		
		
		
	/** Function : getStatus
	* input >> input1,type,selRow,oDetailMultiDialog
	* output << 
	* This function used to get both result status and Comment from ecc
	*	1. if the flag is X, get result status for Error
	*      if the flag is C, get the comment for the respective item
	*/
	function getStatusForExcel(input1,selRow,isLast){
		try{
			busyDialog.open();
			var statusModel = new sap.ui.model.json.JSONModel(_oResourceBundle.getText("GETSTATUS_SERVICE",[eccOdataService,input1,sapClient])+"&ts="+$.now());			
			statusModel.attachRequestCompleted(function(){
				if(statusModel!= undefined && statusModel.getData()!= null ){
					if(isLast){
						sap.ui.getCore().getModel("_oDetailTableModel").oData.tableData[selRow].Comments = statusModel.getData().d.Status.trim();
						// download exported file
						oExport.saveFile(getFileName()).always(function() {
							this.destroy();				
						});
						busyDialog.close();
					}else{
						sap.ui.getCore().getModel("_oDetailTableModel").oData.tableData[selRow].Comments= statusModel.getData().d.Status.trim();
					}
				}
			});
		statusModel.attachRequestFailed(function(){
			busyDialog.close();	
			informationMessage("Failed few");
			});
		}catch(e){handleException(e);	
		}
	}
	
//------------------------- Excel <<----------------------------------
	/** Function : setResourceModel 
	* input >> 
	* output << 
	*  set resource model for detail view
	*/
	function setResourceModel(view){
		try{
			if(view != null && view.getModel("i18n")!=undefined){
				_oResourceBundle = view.getModel("i18n").getResourceBundle();
			}
		}catch(e){handleException(e);}
	}
	
	/** Function : getSavedPersonalisationData  
	*	1. Check personalisation Data is avaialble other wise
	*   2. Get saved personalisation data from local storage and set it to session
	*/
	function getSavedPersonalisationData() {
		try{
			var personalisationData;
			if(sap.ui.getCore().getModel("personalisationData")!= undefined){
				personalisationData =  sap.ui.getCore().getModel("personalisationData");
			}else if(jQuery.sap.storage(jQuery.sap.storage.Type.local).get("personalisationData")!=null ){
				personalisationData = jQuery.sap.storage(jQuery.sap.storage.Type.local).get("personalisationData");
				sap.ui.getCore().setModel(personalisationData,"personalisationData");
			}else{
				var personalisationModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("com.jabil.fi.model", "/personalisation_data.json"));
				personalisationModel.attachRequestCompleted(function(){
					personalisationData = personalisationModel.getData();
					sap.ui.getCore().setModel(personalisationData,"personalisationData");			 
					
				});	
			}
			return personalisationData;
		}catch(e){handleException(e);}
	}

	/** Function : getReasoncodeId < For filtering reason code
	* input >> value
	* output << 
	*	1.To filter reason code as per below 
	*       i. 0/select one/-Select one-  > show only unassigned reasoncode
	*      ii. If blank, show all reasoncode
	*    
	*/
	function getReasoncodeId(text){	
		try{
			var reasonCodeTest="";
			var modelData = sap.ui.getCore().getModel("_oDetailTableModel").getData();
			if(text===""||text==null){
				reasonCodeTest= "";
			}else if(text==="0" ||text===_oResourceBundle.getText("SELECTONE")|| text==="Select One"){
				reasonCodeTest= "0";
			}else{	
				for(var i=0;i<modelData.ReasonCodeDD.length;i++){
					if (modelData.ReasonCodeDD[i].Description.indexOf(text) > -1) {
						reasonCodeTest = modelData.ReasonCodeDD[i].Reasoncode;
						break;
					}
				}
			}
			return reasonCodeTest;
		}catch(e){handleException(e);}
		}
	/**
	 * 
	 * */
	function customFilterForAmount(filterPath,fValue){	
		try{
			var filter;
			if(fValue.indexOf("<>")>0){
				var item = fValue.split("<>");
				if(item[0].indexOf(">")==0 || item[0].indexOf("<")==0 || item[1].indexOf(">")==0 || item[1].indexOf("<")==0){
					filter1 = _getFilter(filterPath,item[0]);
					filter2 = _getFilter(filterPath,item[1]);
					filter = new sap.ui.model.Filter([filter1,filter2]);
				}else{
					filter = new sap.ui.model.Filter({path:filterPath,operator:sap.ui.model.FilterOperator.BT,value1:parseFloat(item[0].trim()),value2:parseFloat(item[1].trim())});
				}
			}else{
				filter = _getFilter(filterPath,fValue);
			}
			return filter;
		}catch(e){handleException(e);}
		}
	/** Function : setCSSForTableHeader
	* input >> view
	* output << 
	*	1. Formatting the headers 
	*/
	function setCSSForTableHeader(view) {
		try{
		view.byId("sumTotalPPV").addStyleClass("detailTableHeader");

		view.byId("sumWrbtr").addStyleClass("detailTableHeader");
		view.byId("sumFxval").addStyleClass("detailTableHeader");
		view.byId("resultStatus1").addStyleClass("detailTableitem");
		view.byId("resultStatus").addStyleClass("statusLink");	
		view.byId("detailTable").setColumnHeaderHeight(45);
		}catch(e){handleException(e);}
			}
	/** Function : convertModelToFloat 
	* input >> 
	* output << 
	*	1. Convert the model's sum values to Float	
	*/
	function processTableItems(){
		try{
			//for total value
			var sumAmount = 0;sumTotalFxval = 0;
			sumTotalPPVLcl = 0;
			sumTotalPPVGrp = 0;
			_oDetailTableModel = sap.ui.getCore().getModel("_oDetailTableModel"); 
			//process table data items
			//if(_oDetailTableModel.oData.tableData.length>0)
			$.each(_oDetailTableModel.oData.tableData,function(idx,item){
				//convert num value in float
				item.Fxval=parseFloat(item.Fxval);
				item.Menge=parseFloat(item.Menge);
				item.STPRS_LCL=parseFloat(item.STPRS_LCL);
				//If Group price is 0, copy from local price
				// Do similar do in master controller for excel in front page
				item.STPRS_GRP = (item.STPRS_GRP==="0.00"||item.STPRS_GRP==="0")?parseFloat(item.STPRS_LCL):parseFloat(item.STPRS_GRP);
				item.STPRS_UM_LCL=parseFloat(item.STPRS_UM_LCL);
				item.STPRS_UM_GRP = (item.STPRS_UM_GRP==="0.00"||item.STPRS_UM_GRP==="0")?parseFloat(item.STPRS_UM_LCL):parseFloat(item.STPRS_UM_GRP) ;
				item.TOTAL_GRP=parseFloat(item.TOTAL_GRP);
				item.TOTAL_LCL=parseFloat(item.TOTAL_LCL);
				item.WRBTR=parseFloat(item.WRBTR);
				item.Zkprs=parseFloat(item.Zkprs);
				//add the values
				sumTotalFxval+= item.Fxval;	
				sumAmount += item.WRBTR;		
				sumTotalPPVLcl += item.TOTAL_LCL;
				sumTotalPPVGrp += item.TOTAL_GRP;
			
				//disable the line items where needed
				if (item.Blart.slice(-2)=="PR"){
					item.Status="N:Posting Not Allowed";
					//item.Reasoncode="4";
				}
				//check the status of item exist in the post queue
				if(sap.ui.getCore().getModel("postQ")!=null){
					if(item.Status ==="" && itemInPostQ(item)){
						item.Status="N1:Posting In Process";
						//remove the selection for locked items
						for(var i=0;i<_oDetailTable._oSelection.aSelectedIndices.length;i++) {
							if(_oDetailTable._oSelection.aSelectedIndices[i]===idx){
								_oDetailTable._oSelection.aSelectedIndices.splice(i,1);
								}
							}
					}else if(item.Status!=="") {itemInPostQ(item,true);}
				}

			});
			//set the total to table model
			_oDetailTableModel.oData.TotalLcl.sumTotalPPV =  formatToTwoDecimal(sumTotalPPVLcl )+" "+ lclCurr;	
			_oDetailTableModel.oData.TotalLcl.sumAmount =  formatToTwoDecimal(sumAmount );
			_oDetailTableModel.oData.TotalLcl.sumTotalFxval =  formatToTwoDecimal(sumTotalFxval );
			_oDetailTableModel.oData.TotalGrp.sumTotalPPV =  formatToTwoDecimal(sumTotalPPVGrp )+" "+ grpCurr;	
					
		}catch(e){handleException(e);}
	}
	/** Function : onCurrencyChange  
	* In table header : STPRS,TOTAL,sumTotalPPV
	* In table footer : 
	*/
	function onCurrencyChange(currChange,view) {

		try{
			// Use Lcl/Grp as per currency
			var curr = currChange=="Grp"?"Grp":"Lcl";
			// For view
			isLocalCurr = currChange=="Grp"?false:true;
			view.byId('STPRS_LCL').getTemplate().mBindingInfos.text.parts[0].path = "STPRS_"+curr.toUpperCase();
			view.byId('STPRS_UM_LCL').getTemplate().mBindingInfos.text.parts[0].path = "STPRS_UM_"+curr.toUpperCase();
			view.byId('TOTAL_LCL').getTemplate().mBindingInfos.text.parts[0].path = "TOTAL_"+curr.toUpperCase();
			view.byId('Mr22Lcl').getTemplate().mBindingInfos.text.parts[0].path = "Mr22"+curr;
			view.byId('sumTotalPPV').mBindingInfos.text.parts[0].path = "/Total"+curr+"/sumTotalPPV";
		
			// In the initial load, it will be undefined. still we need both sections 
			if(view.byId('sumTotalPPV').mBindingInfos.text.binding!==undefined){
				view.byId('sumTotalPPV').mBindingInfos.text.binding.sPath = "/Total"+curr+"/sumTotalPPV";
			}
			var myData=[];
			var _oDetailTable = view.byId("detailTable");
			var modelData = sap.ui.getCore().getModel("_oDetailTableModel").getData();
			myData = curr == "Lcl"?modelData.TotalLcl:modelData.TotalGrp;
			view.byId('sumTotalPPV').setText(myData.sumTotalPPV);

			//If footer message is having currency, change it			
			if(curr=="Lcl"){
				_oDetailTable.getFooter().setText(_oResourceBundle.getText("LCLCURR_SELECTION_MSG",_oDetailTableModel.oData.tableData.length));
			}else if(curr=="Grp"){
				_oDetailTable.getFooter().setText(_oResourceBundle.getText("GRPCURR_SELECTION_MSG",_oDetailTableModel.oData.tableData.length));
			}	
		}catch(e){handleException(e);}	 
	}
	

	/** Function : calculatePPVSum 
	* input >> 
	* output << 
	*	1. Calculate respective sums for the table	
	*   2. update it to the model
	*   This could be called during the filtering/initila load
	*   There is two scenarios 1.In the initial load  2.other from Detail view
	*/
	function calculatePPVSum(view){

	try{		
		var recordSet;
		var isFromView;
		var tableData; 
		var sumAmount = 0;sumTotalFxval = 0;
		sumTotalPPVLcl = 0;	sumTotalPPVGrp = 0;
		_oDetailTableModel = sap.ui.getCore().getModel("_oDetailTableModel"); 
		tableData = _oDetailTableModel.oData.tableData ;
		if(tableData.length>0){
			if(view!=null){
				recordSet = view.byId("detailTable").getBinding("rows").aIndices;
				isFromView = true;
			}else{
				recordSet = tableData;
				isFromView = false;
			}
			//find sum with respect to diff scenario
		$.each(recordSet, function(idx,item){	
			sumAmount += parseFloat(isFromView?tableData[item].WRBTR:item.WRBTR);		
			sumTotalFxval+= parseFloat(isFromView?tableData[item].Fxval:item.Fxval);
			sumTotalPPVLcl += parseFloat(isFromView?tableData[item].TotalLcl:item.TOTAL_LCL);
			sumTotalPPVGrp += parseFloat(isFromView?tableData[item].TotalGrp:item.TOTAL_GRP);
		});	
		_oDetailTableModel.oData.TotalLcl.sumTotalPPV =  formatToTwoDecimal(sumTotalPPVLcl )+" "+ lclCurr;	
		_oDetailTableModel.oData.TotalLcl.sumAmount =  formatToTwoDecimal(sumAmount );
		_oDetailTableModel.oData.TotalLcl.TotalLcl =  formatToTwoDecimal(sumTotalFxval);
		_oDetailTableModel.oData.TotalGrp.sumTotalPPV =  formatToTwoDecimal(sumTotalPPVGrp )+" "+ grpCurr;
		}
		sap.ui.getCore().setModel(_oDetailTableModel,"_oDetailTableModel"); 
	}catch(e){handleException(e);}	
	
	}
	/** Function : getGroupName 
	 * Formatting group name for date and Reson code
	 * Need to handle both group ison and table group
	*/	
	function getGroupName(groupItem,groupFlag) {
		var	personalisationData = getSavedPersonalisationData();
		var colType ="";
		var groupFieldName ="";
		try{
			if(personalisationData.ColumnCollection.length>0 && groupItem!=null){
				var colSelected = getPersonalizationIndex(personalisationData.ColumnCollection,groupItem);
				if(colSelected !=undefined){
				    var colIndex = colSelected[0].index;
					colType = _oDetailTable.getColumns()[colIndex].mProperties.filterType.sName;
				}
			}
		}catch(e){
				colType="String"; //Default is String
			}
		if(groupFlag!=null && groupFlag!=""){
			if(colType=="Date" && groupFlag.length>20){
		 	//	groupFieldName = $.format.date(parseInt(groupFlag.slice(6, 19)),"MM/dd/yyyy");
		 		groupFieldName = new Date(parseInt(groupFlag.slice(6, 19))).toLocaleDateString('en-US',{timeZone: 'UTC'}).toString();
		 	//}else if(groupItem=="Reasoncode"){
		 	}else if(groupItem=="Reasoncode"){
		 		groupFieldName = getReasoncodeTextExcel(groupFlag);
		 	}else{
		 		groupFieldName = groupFlag;
		 	}
		}
	 	return groupFieldName;
	}
	/** Function : calculateGroupSum 
	*	1. Read the whole group and calculate the sum
	*	2. Keep the sum in the model
	*/	
	function calculateGroupSum(groupItem,view) {
		try{
		 var grpHeaderSum = [];
		 var groupFlag=" "; // Space needed to identify blank
		 var _oDetailTable = view.byId("detailTable");
		 var myRecords = _oDetailTable.getBinding().aIndices;
		 var sumTotalPPVLcl=0,sumTotalPPVGrp=0;
			 			 
		 $.each(myRecords, function(idx,index){
			 if(groupFlag==" ") 
				 groupFlag = _oDetailTable.getBinding().oList[index][groupItem];
			 if(groupFlag!=_oDetailTable.getBinding().oList[index][groupItem]){
			 	var _groupName = getGroupName(groupItem,groupFlag);
				grpHeaderSum.push({
					id:"",count:"",groupName:_groupName,groupItem:groupFlag,
					nameLcl:_groupName +"( Total PPV: "+formatToTwoDecimal(sumTotalPPVLcl)+ lclCurr+" ). Items in group ",
					nameGrp:_groupName +"( Total PPV: "+formatToTwoDecimal(sumTotalPPVGrp)+ grpCurr+" ). Items in group ",
					sumTotalPPVLcl:sumTotalPPVLcl,sumTotalPPVGrp:sumTotalPPVGrp,lclCurrency:lclCurr ,grpCurrency:grpCurr 
					}) ;						
					 
					sumTotalPPVLcl=0,sumTotalPPVGrp=0; 						
					groupFlag = _oDetailTable.getBinding().oList[index][groupItem];
				}	
					sumTotalPPVLcl += parseFloat(_oDetailTable.getBinding().oList[index]["TOTAL_LCL"]);
					sumTotalPPVGrp += parseFloat(_oDetailTable.getBinding().oList[index]["TOTAL_GRP"]);
			}); 
		var _groupName = getGroupName(groupItem,groupFlag);	
		grpHeaderSum.push({
				id:"",
				count:"",
				groupName:_groupName,groupItem:groupFlag,
				nameLcl:_groupName +"( Total PPV: "+formatToTwoDecimal(sumTotalPPVLcl)+ lclCurr+" ). Items in group ",
				nameGrp:_groupName +"( Total PPV: "+formatToTwoDecimal(sumTotalPPVGrp)+ grpCurr+" ). Items in group ",
					sumTotalPPVGrp:sumTotalPPVGrp, 
					sumTotalPPVLcl:sumTotalPPVLcl, 
				lclCurrency:lclCurr ,grpCurrency:grpCurr 
				}) ;
			
		var myGrpHeader=[];
		var index=0;	
		for (var j=0; j<grpHeaderSum.length; j++){	
		if(_oDetailTable.getContextByIndex(index)!=undefined && _oDetailTable.getContextByIndex(index).groupHeader){
			var _tempItem = "";
	     	_tempItem = getGroupName(groupItem,_oDetailTable.getContextByIndex(index).name);
	     	for (var i=0; i<grpHeaderSum.length; i++){
				if(_tempItem == grpHeaderSum[i].groupName){
					grpHeaderSum[i].id=index;
					grpHeaderSum[i].count =_oDetailTable.getContextByIndex(index).count;
					_oDetailTable.getContextByIndex(index).name = selectedCurr=="Grp"? grpHeaderSum[i].nameGrp:grpHeaderSum[i].nameLcl ;
					// next header index
					index+=_oDetailTable.getContextByIndex(index).count+1;	
					break;
				}
	     	}
		}}
			
		sap.ui.getCore().getModel("_oDetailTableModel").oData.grpHeader = {grpHeaderSum:grpHeaderSum };
		}catch(e){handleException(e);}		
	}


	//----------------------------------------------------------------------------------------
	/**
	 * 
	 */
	function getPersonalizationIndex(data,path) {
	  return data.filter(
	      function(data){return data.path == path}
	  );
	}
	/**
	 * 
	 */
	function setIndexForColumnArray(ColumnCollection,tableItems) {
	 	$.each(ColumnCollection, function(idx,item){	
	    var test = tableItems.filter(function(tableItems){return tableItems.columnKey === item.path});
	      item.index = 	test[0].index!=null?test[0].index:idx; 	
	 	});
	 	return ColumnCollection;
	}
	/**
	 * Check if item is in post queue and take action
	 */
	function itemInPostQ(item,flag){
		try{
			var postQ=sap.ui.getCore().getModel("postQ");
			if(postQ===null){ return false;}
			for(var i=0;i<postQ.length;i++){
				if((postQ[i].Belnr  === item.Belnr) && (postQ[i].Bukrs === item.Bukrs) && (postQ[i].Buzei === item.Buzei)  && (postQ[i].Gjahr === item.Gjahr) ){ 
					if(flag){
						if(item.Status==="X") {
							postQ=null;sap.ui.getCore().setModel(null,"postQ"); 
							}else{
								postQ.splice(i,1);
							}
						return true;
					}else{
						return true;
					}
				}
			};
		}catch(e){handleException(e);}
	}
// ---------------------------------------------------------
//                       PRIVATE METHODS
//---------------------------------------------------------
	/** Function : customFilterForAmount 
	* input >> value
	* output << 
	*	1. This will manage filter inputs like -100<>100 
	*   it is using in both table and group assignment screen
	*/
		function _getFilter(filterPath,fValue){	
		try{
			if(fValue.indexOf("<")===0){
				var filter = new sap.ui.model.Filter({path:filterPath,operator:sap.ui.model.FilterOperator.LE,value1:parseFloat(fValue.slice(1).trim())});
			}else if(fValue.indexOf(">")===0){
				filter = new sap.ui.model.Filter({path:filterPath,operator:sap.ui.model.FilterOperator.GE,value1:parseFloat(fValue.slice(1).trim())});
			}else{
				filter = new sap.ui.model.Filter({path:filterPath,operator:sap.ui.model.FilterOperator.EQ,value1:parseFloat(fValue.trim())});     	
			}
			return filter;
		}catch(e){handleException(e);}
		}
	/** Function : _defaultTableSettings  
	*	1. settings for Column visibility and default Currency set
	*/
	function _defaultTableSettings(view){
	try{
		view.byId("fxSwitch").setVisible(isFxCC);
		if(tableVisibilityFlag==""){
			_manageTableColumnVisibility(view);
			tableVisibilityFlag="X";
		}
			onCurrencyChange(selectedCurr,view); 
	}catch(e){handleException(e);}	
}
	/** Function : _getDetailSelectionInput  >> INPUT FOR DETAILS
	*	1. get parameters as input 	
	*   2. prepare the input statements
	*/
	function _getDetailSelectionInput(selParameter){
	try{
		//Revenue posting		
		var _route = this._oRouter._oRouter._oRouter._prevRoutes[0].params;
		isResonCodePage = (_route[0]==="Reasoncode");
		if(isResonCodePage && _route[1]==="4"){
				isRevenuePostActive = true;
				_dtlView.byId("revenuePostBtn").setVisible(true);
				_dtlView.byId("mySearchField").setWidth("70px");
		}else{
			isRevenuePostActive = false;
			_dtlView.byId("revenuePostBtn").setVisible(false);
			_dtlView.byId("mySearchField").setWidth("100%");
		}
		var returnVal ="";
		var selectedCC = sap.ui.getCore().byId("selectCompany").getSelectedKey();
		var selectedPlant = sap.ui.getCore().byId("selectPlant").getSelectedKey();
		var pcs="";
		if(selParameter[0]!="Prctr"){
			pcs= getSelectedPCs();
			if(pcs!=null && pcs.length>0){
				pcs= " and ("+pcs+")";
			}
		}
		var selPer = sap.ui.getCore().byId("selectPeriod").getSelectedItem().getKey().split("-");
		var fromDate = $.format.date(sap.ui.getCore().byId("fromDate").getDateValue(),"yyyy-MM-ddT00:00");
		var toDate = $.format.date(sap.ui.getCore().byId("toDate").getDateValue(),"yyyy-MM-ddT00:00");
		returnVal = "Bukrs eq '"+selectedCC+"'"+pcs+" and (budat ge datetime'"+fromDate+"' and budat le datetime'"+toDate+"') and Monat eq '"+("0" + selPer[0]).slice(-2)+"' and Gjahr eq '"+selPer[1]+"' and Werks eq '"+selectedPlant+"'";
	
		if(selParameter.length>1){			
			//if(selParameter[1]!= "All" && selParameter[0]!="Prctr")
			returnVal += " and "+selParameter[0] +" eq '"+selParameter[1]+"'";
		}
		return returnVal;
	}catch(e){handleException(e);}
	
}

	/** Function : manageTableColumnVisibility  
	*	1. manage the column visibility and order of columns
	*	2.  
	*/
	function _manageTableColumnVisibility(view) {	
	try{
		
	    if(view!=null){
	    	var personalisationData = getSavedPersonalisationData();
			if(personalisationData!==undefined && personalisationData!= null){	
				_removeAllDtlTableColumns(view,personalisationData);
				_addAllDtlTableColumns(view,personalisationData.ColumnCollection);				
			}else{
				var personalisationModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("com.jabil.fi.model", "/personalisation_data.json"));
				personalisationModel.attachRequestCompleted(function(){
					personalisationData = personalisationModel.getData();
					sap.ui.getCore().setModel(personalisationData,"personalisationData");
					_removeAllDtlTableColumns(view,personalisationData);
					_addAllDtlTableColumns(view,personalisationData.ColumnCollection);		
				 });
			}
	    }
	}catch(e){handleException(e);}
	}

	/** Function : _removeAllDtlTableColumns  
	*	1. Remove all columns form table
	*	2. Remove Fxval separately, as it is not included in the list 
	*/
	function _removeAllDtlTableColumns(view,ColumnCollection) {	
		try{
			$.each(ColumnCollection, function(idx,item){
				view.byId("detailTable").removeColumn(view.byId(item.path));
			});
			view.byId("detailTable").removeColumn(view.byId("Fxval"));
		}catch(e){handleException(e);}
	}
	/** Function : _addAllDtlTableColumns  
	*	1. Add all columns to the table
	*	2. Add Fxval separately, as it is not included in the list 
	*/
	function _addAllDtlTableColumns(view,ColumnCollection) {	
		try{
			$.each(ColumnCollection, function(idx,item){
				try{
					view.byId("detailTable").addColumn(view.byId(item.path));
					if(view.byId(item.path)!==undefined){
						view.byId(item.path).setVisible(item.visible);}
					// Always make Fxval after Total PPV
					 if(item.path==="TOTAL_LCL"){
						 view.byId("detailTable").addColumn(view.byId("Fxval"));
					 }
				}catch(e){handleException(e);}
			}); 
		}catch(e){handleException(e);}
	}

	/** Function : _disableTableItems 
	* 1.If the doc type is PR, 
	*     i. disable the line items
	*    ii. Set reasoncode as 4 and status as 'N:Posting Not Allowed'
	*/
	function _disableTableItems(){
		try{
			$.each(sap.ui.getCore().getModel("_oDetailTableModel").oData.tableData, function(idx,item){	
				if (item.Blart.slice(-2)==="PR"){
					_oDetailTableModel.oData.tableData[idx].Status="N:Posting Not Allowed";
					_oDetailTableModel.oData.tableData[idx].Reasoncode="4";
				}
				//check the status of item exist in the queue
				if(item.Status ==="" && itemInPostQ(item)){
					item.Status="N1:Posting In Process";
					//remove the selection for locked items
					for(var i=0;i<_oDetailTable._oSelection.aSelectedIndices.length;i++) {
						if(_oDetailTable._oSelection.aSelectedIndices[i]===idx){
							_oDetailTable._oSelection.aSelectedIndices.splice(i,1);
							}
						}
				}else if(item.Status!=="") {itemInPostQ(item,true);}
			});
		}catch(e){handleException(e);}
	}
	
	
	
	
	/** Function : groupSortFix
	*  After grouping , sorting order is get affected.
	*  This will reorder the item positions in grouped table
	*/
	function groupSortBugFix(){
			//start
	try{		
		  if(_oDetailTable.getContextByIndex(0).groupHeader!==undefined){
		  	groupModification = true;
		  	var middleItem = Math.floor(_oDetailTable.getBinding().aIndices.length/2);
		  	var lastItem = _oDetailTable.getBinding().aIndices.length -1;
			 if((_oDetailTable.getBinding().aIndices[0] === 1 ||_oDetailTable.getBinding().aIndices[0] === middleItem )&& _oDetailTable.getBinding().aIndices[2] === 2 && (_oDetailTable.getBinding().aIndices[middleItem] === 1 || _oDetailTable.getBinding().aIndices[middleItem] === middleItem)){
			//	Change indices
				_oDetailTable.getContextByIndex(0).oContext.sPath ="/tableData/0" ;
				_oDetailTable.getContextByIndex(2).sPath = "/tableData/1" ;
				_oDetailTable.getContextByIndex(middleItem+1).sPath = "/tableData/"+middleItem;
				_oDetailTable.getBinding().aIndices[0]=0;
				_oDetailTable.getBinding().aIndices[1]=1;
				_oDetailTable.getBinding().aIndices[middleItem]=middleItem;
				
			 }else if((_oDetailTable.getBinding().aIndices[1] === lastItem )&& _oDetailTable.getBinding().aIndices[2] === lastItem-2 &&(_oDetailTable.getBinding().aIndices[middleItem] === (lastItem-1))){
			    var temp = (_oDetailTable.getBinding().aIndices[1] >_oDetailTable.getBinding().aIndices[0])?_oDetailTable.getBinding().aIndices[0]:_oDetailTable.getBinding().aIndices[1] ;
			    _oDetailTable.getContextByIndex(0).oContext.sPath ="/tableData/"+lastItem;
				_oDetailTable.getContextByIndex(2).sPath = "/tableData/"+(lastItem-1);
				_oDetailTable.getContextByIndex(middleItem+1).sPath = "/tableData/"+middleItem;
				_oDetailTable.getBinding().aIndices[0]=0;
				_oDetailTable.getBinding().aIndices[1]=1;
				_oDetailTable.getBinding().aIndices[middleItem]=temp;
			 }
			 _oDetailTableModel.refresh();
			} 
	}catch(e){handleException(e);}
	} 
	/** Function : additionalReset
	*  Resetting additional modifications
	*/
	function additionalReset(){
	try{	
		for (var i=0; i<_oDetailTable.getBinding().aIndices.length; i++){
			_oDetailTable.getContextByIndex(i).sPath = "/tableData/"+(_oDetailTable.getBinding().aIndices[i]).toString();
		}
		_oDetailTableModel.oData.grpHeader.grpHeaderSum=[];
		groupModification=false;
	}catch(e){
		handleException(e);}
	}
	/** Function : formatDate
	*  Format date
	*/
	function formatDate(Budat){
	try {
			if (Budat != null && Budat!== "") {
				Budat = Budat.slice(6, 19);
				var n = parseInt(Budat);
				return new Date(n).toLocaleDateString('en-US',{timeZone: 'UTC'}).toString();
			}
			return "";
		} catch (e) {
			return null;
			handleException(e);
		}
	}
	//Methods for maintain grouped table state after updation
	function _saveButtonUpdation(){
		informationMessage(_oResourceBundle.getText("ECC_SAVE_UPDATE_SUCCESS"));
		if(isResonCodePage){ //Handle record after updation
				if(_oDetailTable!= null &&_oDetailTable.getGroupBy()!=null){
					_refreshTable();
				}else if(_oDetailTable!= null &&_oDetailTable.getGroupBy()==null){//ungrouped table,remove selection
					clearTableSelection(_dtlView);
				}
		}else{
			if(_oDetailTable.getGroupBy()!=null){
				_refreshTable();
			}
		}
		}
	// To refresh after rendering
	function _refreshTable(){
				_refreshNeed = true;
					_oDetailTable.addEventDelegate({
						onAfterRendering: function() {
							if(	_refreshNeed){
								_refreshGroupedTableUpdate();
								_oDetailTable._scrollNext();
							//	_oDetailTable._scrollPageUp();
							}
						}});
						_oDetailTable.refreshRows();
	}
	//restore the selection and group
	function _refreshGroupedTableUpdate(){
		busyDialog.open();
		var tempGroupCol = _oDetailTable.getGroupBy();
		var tempSelectedIndex = _oDetailTable.getSelectedIndices();
		_refreshNeed = false;
		_dtlView.byId("resetTableBtn").firePress();
		_oDetailTable.setEnableGrouping(true);
		_oDetailTable.setGroupBy(tempGroupCol);
		//For reselection of records after refresh
		if(!isResonCodePage){
			for (var i = 0; i < tempSelectedIndex.length; i++) {
				if(i==0)//need one inital call for proper selection
				_oDetailTable._oSelection.addSelectionInterval(tempSelectedIndex[i],tempSelectedIndex[i]);
			    _oDetailTable._oSelection.addSelectionInterval(tempSelectedIndex[i],tempSelectedIndex[i]);
			}
		}
		_oDetailTableModel.refresh();
		busyDialog.close();	
	}
	
	function _ModelFormatChecker(){
		try{
			$.each(_oDetailTableModel.getData().tableData, function(idx,item){	
				item.GR_DATE = item.GR_DATE == null?"":item.GR_DATE;
				item.budat = item.budat == null?"":item.budat;
				item.TmpGR_DATE = formatDate(item.GR_DATE);
				item.TmpBudat = formatDate(item.budat);
			});
		}catch(e){
			handleException(e);}
	}