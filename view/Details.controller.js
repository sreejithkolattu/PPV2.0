jQuery.sap.require("sap.ui.core.mvc.Controller");
jQuery.sap.require("com.jabil.fi.util.util");
jQuery.sap.require("com.jabil.fi.util.detailUtil");
jQuery.sap.require("jquery.sap.storage");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
//jQuery.sap.require("com.jabil.fi.lib.util.TableExampleUtils");
sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/Filter',
		'sap/ui/model/Sorter',
		'sap/m/MessageToast',
		'sap/ui/model/json/JSONModel'
	]),
	sap.ui.core.mvc.Controller.extend("com.jabil.fi.view.Details", {
		_oDetailTable: null,
		_oDetailTableModel: null,
		_dtlView: null,
		_oResourceBundle: null,
	

		/** Function : onInit
		 *	1. Load blank table model with formats to maintain the structure 
		 *	2. Load resource bundle & Reason code
		 *   3. get data for Table 
		 *   4. style class for custom fields
		 *   5. set flag to avoid loading table model twice in the initial load
		 */
		onInit: function() {
			try {
				_dtlView = this.getView();
				_oDetailTableModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("com.jabil.fi.model", "/dtls_table.json"));
				_oDetailTableModel.attachRequestCompleted(function() {
					if (_oResourceBundle == undefined) {
						setResourceModel(_dtlView);
					}
					_oDetailTable = _dtlView.byId("detailTable");
					sap.ui.getCore().setModel(_oDetailTableModel, "_oDetailTableModel");
					if (sapClient != undefined) {
						if (sap.ui.getCore().getModel("rcModel") == undefined) {
							loadRCModel(_dtlView);
						} else {
							setreasonCodeDDModel(_dtlView)
						}
						executeTableModel(_dtlView, true);
						viewFlag = "D";
					}
					setCSSForTableHeader(_dtlView);
				});

			} catch (e) {
				handleException(e);
			}
		},

		/****************************************************************
		 *                   FORMATER SECTION
		 ****************************************************************/
		/** Function : statusEnableItem > To enable/disable line item with respect to posting status
		 *	Check posting status  
		 */
		statusEnableItem: function(status) {
			try {
			//	return status != null ? isValidForPosting(status) : false;
			return status != null ? isValidForEnable(status) : false;
			
			} catch (e) {
				handleException(e);
			}
		},

		/** Function : amountFormat 
		 * input >> value
		 * output << amount
		 *	1. As the values are float,integer will not show .00 for integer values
		 *      This will make whole numbers with 00  		
		 */
		amountFormat: function(value) {
			try {
				//return value != null ? parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : value;
				return value != null ? parseFloat(value).toLocaleString('en-US', {minimumFractionDigits: 2}) : value;
			} catch (e) {
				handleException(e);
			}
		},
		/** Function : numaricFormat 
		 * input >> value
		 * output << amount
		 *	1. Need to show separator for these values  		
		 */
		numaricFormat: function(value) {
			try {
				return value != null ? parseInt(value).toLocaleString('en-US') : value;
			} catch (e) {
				handleException(e);
			}
		},
		/** Function : amountFiveDecimalFormat 
		 * input >> value
		 * output << amount
		 *	1. Need to show separator for these values woth five decimal 		
		 */
		amountFiveDecimalFormat: function(value) {
			try {
				return value != null ? parseFloat(value).toLocaleString('en-US', {minimumFractionDigits: 5}) : value;
			} catch (e) {
				handleException(e);
			}
		},
		//x.toLocaleString('en-US', {minimumFractionDigits: 5});
		/** Function : tooltipFormaterComment : tooltip comment icon
		 *	1. Formatting tooltip 
		 *    > if blank , X it will not show tooltip
		 *    > If user selected any comment or enter, it will show that comment 
		 */
		tooltipFormaterComment: function(comments) {
			try {
				if (comments == null || comments == "" || comments == _oResourceBundle.getText("COMMENT_X"))
					return "";
				else
					return comments;
			} catch (e) {
				handleException(e);
			}
		},
		/** Function : statusFormaterComment
		 *	1.  highlight the comment icon
		 */
		statusFormaterComment: function(comments) {
			try {
				if (comments != null && comments == "")
					return "Default";
				else
					return "Emphasized";
			} catch (e) {
				handleException(e);
			}
		},

		/** Function : statusFormaterIcon
		 *	1. Formatting Publishing Status cell's icon 
		 *	2. Return status icon
		 */
		statusFormaterIcon: function(pubStatus) {
			try {
				if (pubStatus != null && pubStatus.toString() != "NaN") {
					if (pubStatus == _oResourceBundle.getText("PUBLISH_X")) {
						return "sap-icon://alert";
					} else if (pubStatus == "") {
						return "";
					} else if (pubStatus.indexOf("S") == 0 || pubStatus.indexOf("RS") == 0) {
						return "sap-icon://flag";
					} else {
						return null;
					}
				}
			} catch (e) {
				return null;
				handleException(e);
			}
		},

		/** Function : statusFormaterColor
		 *	1. Formatting Publishing Status font color
		 *	2. Return status Color
		 */
		statusFormaterColor: function(pubStatus) {

			try {
				if (pubStatus != null && pubStatus.toString() != "NaN") {
					if (pubStatus == "X") {
						return "Error";
					} else if (pubStatus == "") {
						return "None";
					} else if (pubStatus.indexOf("S") == 0 || pubStatus.indexOf("R") == 0 || pubStatus.indexOf("RS") == 0) {
						return "Success";
					} else {
						return null;
					}
				}
			} catch (e) {
				return null;
				handleException(e);
			}

		},

		/** Function : statusFormaterText
		 *	1. Formatting Publishing Status cell text 
		 *	2. Return status format text
		 */
		statusFormaterText: function(pubStatus) {
			try {
				if (pubStatus != null && pubStatus.toString() != "NaN") {
					if (pubStatus == "X") {
						return _oResourceBundle.getText("ERROR");
					} else if (pubStatus == "") {
						return "";
					} else if (pubStatus.indexOf("S") == 0 || pubStatus.indexOf("R") == 0 || pubStatus.indexOf("RS") == 0) {
						return _oResourceBundle.getText("POSTED");
					} else {
						return "";
					}
				}
			} catch (e) {
				return null;
				handleException(e);
			}
		},

		/** Function : statusFormater > Result set
		 *	1. Formatting Result set cell text
		 *	2. if error/posted, will give "view" link
		 */
		statusFormater: function(pubStatus) {
			try {
				if (pubStatus != null && pubStatus.toString() != "NaN") {
					if (pubStatus == "") {
						return "";
					} else {
						return _oResourceBundle.getText("VIEW");
					}
				}
			} catch (e) {
				return null;
				handleException(e);
			}
		},

		/** Function : dateFormater 
		 *	1. Formatting date 
		 *	2. Return formatted date 
		 */
		dateFormater: function(Budat) {
			formatDate(Budat);
		},
		/** Function : onReasoncodeChange  
		 */
		onReasoncodeChange: function(oEvent) {
			try {
				//sap.ui.getCore().getModel("_oDetailTableModel").oData.batchComment = "";
				//_dtlView.byId("batchCommentText").mProperties.type="Default";
				//_dtlView.byId("batchCommentText").invalidate();
			} catch (e) {
				handleException(e);
			}
		},
		/** Function : reasonCodeSel  
		 */
		reasonCodeSel: function(pubStatus) {
			try {
				if (pubStatus != null && pubStatus != "NaN") {
					if (pubStatus == "") {
						return _oResourceBundle.getText("SELECTONE");
					} else {
						var desc = "";
						var rcModel = sap.ui.getCore().getModel("rcModel");
						$.each(sap.ui.getCore().getModel("rcModel").oData, function(idx, item) {
							if (sap.ui.getCore().getModel("rcModel").oData[idx].Reasoncode == pubStatus)
								desc = sap.ui.getCore().getModel("rcModel").oData[idx].Description;
							return true;
						});
						return desc;
					}
				}
			} catch (e) {
				handleException(e);
				return _oResourceBundle.getText("NONE");
			}
		},
		/****************************************************************
		 *                   EVENTS SECTION
		 ****************************************************************/
		/** Function : onrowSelection 
		 *	1. On row selection, it will manage
		 *	    > Select all (without disabled line item)
		 *      > deselect All
		 *      > individual selection
		 *      Show the total sum in the bottom
		 */
		onrowSelection: function(oEvent) {
			try {
				busyDialog.open();
				if (_oDetailTable._oSelection.aSelectedIndices.length == 0) {
					selectAllMode = "";
					_oDetailTable.getFooter().setText(_oResourceBundle.getText("TOTAL_LINES", _oDetailTableModel.oData.tableData.length));
				} else if (_oDetailTable._oSelection.aSelectedIndices.length >= _oDetailTable.getBinding("rows").iLength && (oEvent.getParameters().rowIndices[
						0] == 0 || selectAllMode == "X")) {
					selectAllMode = selectAllMode == "X" ? "" : "X";
					if (selectAllMode == "X") {
						var testArr = [];
						$.each(oEvent.getParameters().rowIndices, function(idx) {
							if (_oDetailTable.getContextByIndex(idx).sPath != undefined) {
								var selRow = _oDetailTable.getContextByIndex(idx).sPath.split("/")[2];
								var selStatus = _oDetailTableModel.oData.tableData[selRow].Status;
								if(isRevenuePostActive){
									if (selStatus.indexOf("RS") == 0 || selStatus.indexOf("N") == 0) {
										testArr.push(idx);
									}
								}else{
									if (selStatus.indexOf("S") == 0 || selStatus.indexOf("RS") == 0 || selStatus.indexOf("N") == 0) {
										testArr.push(idx);
									}
								}
							} else {
								testArr.push(idx);
							}
						});

						testArr = testArr.sort(function(a, b) {
							return b - a
						});
						for (var i = 0; i < testArr.length; i++) {
							_oDetailTable._oSelection.aSelectedIndices.splice(testArr[i], 1);
						}
					} else {
						_oDetailTable._oSelection.aSelectedIndices = [];
						_oDetailTable.getFooter().setText(_oResourceBundle.getText("TOTAL_LINES", _oDetailTableModel.oData.tableData.length));
					}
				} else {
					if (_oDetailTable.getContextByIndex(oEvent.getParameters().rowIndex) != undefined) {
						if( _oDetailTable.getContextByIndex(oEvent.getParameters().rowIndex).sPath != undefined){
							var selRow = _oDetailTable.getContextByIndex(oEvent.getParameters().rowIndex).sPath.split("/", 3)[2];
							var selStatus = _oDetailTableModel.oData.tableData[selRow].Status;
							
							if(isRevenuePostActive){
								if (selStatus.indexOf("RS") == 0 || selStatus.indexOf("N") == 0) {
										if (oEvent.getParameters().rowIndex > -1) {
											var index = _oDetailTable._oSelection.aSelectedIndices.indexOf(oEvent.getParameters().rowIndex)
											_oDetailTable._oSelection.aSelectedIndices.splice(index, 1);
										} else {
											selectAllMode = "";
										}
									}
							}else{
								if (selStatus.indexOf("S") == 0 || selStatus.indexOf("RS") == 0 || selStatus.indexOf("N") == 0) {
									if (oEvent.getParameters().rowIndex > -1) {
										var index = _oDetailTable._oSelection.aSelectedIndices.indexOf(oEvent.getParameters().rowIndex)
										_oDetailTable._oSelection.aSelectedIndices.splice(index, 1);
									} else {
										selectAllMode = "";
									}
								}
							}
						}else{
							if(!(_oDetailTable.getBinding().isExpanded(0))){
								informationMessage(_oResourceBundle.getText("EXPAND_MESSAGE"));
							}
						}
					}
				}
				if (_oDetailTable._oSelection.aSelectedIndices.length != 0) {
					var totPPV = 0;
					var count = 0;
					var selCols = _oDetailTable._oSelection.aSelectedIndices;
					for (var i = 0; i < selCols.length; i++) {
						if(_oDetailTable.getContextByIndex(selCols[i]).sPath!=undefined){
							if (selectedCurr == "Grp") {
								totPPV += parseFloat(_oDetailTableModel.oData.tableData[_oDetailTable.getContextByIndex(selCols[i]).sPath.split("/")[2]].TOTAL_GRP);
								count++;
							} else{
								totPPV += parseFloat(_oDetailTableModel.oData.tableData[_oDetailTable.getContextByIndex(selCols[i]).sPath.split("/")[2]].TOTAL_LCL);
								count++;
							}
						}
					}
					_oDetailTable.getFooter().setText(_oResourceBundle.getText("TOTALPPV_SELECTED", [count, formatToTwoDecimal(totPPV),
						getSelectedCurrency()
					]));
				}
				_oDetailTable.invalidate();
				busyDialog.close();
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},

		/** Function : onGroupPress 
		 *  Table Grouping event
		 *  1) Prepare the grouping
		 *  2) Set the info in footer
		 *  3) Grouping through _handleGrouping method
		 * 
		 */
		onGroupPress: function(oEvent) {
			try {
				busyDialog.open();
				var groupItem = oEvent.getParameters().column.sId.split("--")[1];
				var sPath = oEvent.getParameter("column").getSortProperty();
				var bDescending = false;
				if (oEvent.getParameter("sortOrder") == "Descending") {
					bDescending = true;
				}
				
				_oDetailTable.setFooter(_oResourceBundle.getText("GROUPED_BY", [oEvent.getParameter("column").mAggregations.label.mProperties.text]));
				this._handleGrouping(groupItem, sPath, bDescending); 
			} catch (e) {
				busyDialog.close();
				handleException(e);
			} 
		},
		/** Function : onFilter > Generic Table filter
		 * input >> oEvent
		 * output <<  
		 *	1. This will do generic filter for filter type String 
		 *	2. If grouped, manage it with filter
		 */
		onFilter: function(oEvent) {
			try {
				busyDialog.open();
				var groupFlag;
				if (_oDetailTable.getGroupBy() != null) {
					groupFlag = true;
					_oDetailTable.setEnableGrouping(false);
				}
				var valueModified = oEvent.getSource().mProperties.value;
				var oFilter1 = [];
				$.each(_oDetailTable._aIdxCols2Cells, function(idx) {
					if (_oDetailTable.mAggregations.columns[idx].mProperties.filterProperty != "" && _oDetailTable.mAggregations.columns[idx].mProperties
						.filterType.sName == "String")
						oFilter1.push(new sap.ui.model.Filter(_oDetailTable.mAggregations.columns[idx].mProperties.filterProperty, sap.ui.model.FilterOperator
							.Contains, valueModified));
				});
				var oCombinedFilter = new sap.ui.model.Filter(oFilter1);
				_oDetailTable.getBinding("rows").filter(oCombinedFilter, sap.ui.model.FilterType.Application);
				calculatePPVSum(_dtlView);
			//	_oDetailTable.invalidate();
				_oDetailTableModel.refresh();
				if (groupFlag) {
					_oDetailTable.setEnableGrouping(true);
					calculateGroupSum(_dtlView.byId("detailTable").getGroupBy().split("--")[1], _dtlView);
				}
				busyDialog.close();
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},

		/** Function : onFilterPress : For each column
		 * input >> oEvent
		 * output <<  
		 *	1. Manage different filter for reasoncode,status and Float fields
		 *	2.  
		 */

		onFilterPress: function(oEvent) {
			try { 
				var groupFlag;
				if (_oDetailTable.getGroupBy() != null) {
					groupFlag = true;
					_oDetailTable.setEnableGrouping(false);
				}
				_oDetailTable.mBindingInfos.rows.binding.aFilters = [];
				var filterPath = oEvent.getParameter("column").getFilterProperty();
				var filterType = oEvent.getParameter("column").getFilterType().sName;
				var fValue = oEvent.getParameters().value;
				var filter;
				var finalFilter;
				var blankResonCodeFlag = false;
				// Special case for reson code & Status
				if (oEvent.getParameters().column.sId.split("--")[1] == _oResourceBundle.getText("REASONCODE_FIELD")) {
					fValue = getReasoncodeId(oEvent.getParameters().value);
					if (fValue == "0")
						blankResonCodeFlag = true;
				} else if (oEvent.getParameters().column.sId.split("--")[1] == _oResourceBundle.getText("STATUS_FIELD")) {
					fValue = getStatusTextId(oEvent.getParameters().value);
				}
				var preFilter = _oDetailTable.mBindingInfos.rows.binding.aApplicationFilters;
				if (fValue != "" && fValue != null) {
					if (filterType == "Float") {
						_dtlView.byId(filterPath).setFilterValue("");
						oEvent.getParameters().value = "";
						if (!filterRegex.test(fValue)) {
							informationMessage(_oResourceBundle.getText("INVALID_FILTER_MSG"));
							return false;
						} else { // Get previous filter values		
							filter = customFilterForAmount(filterPath, fValue);
						}
					} else { // if String				
						filter = blankResonCodeFlag ? new sap.ui.model.Filter(filterPath, sap.ui.model.FilterOperator.EQ, "") : new sap.ui.model.Filter(
							filterPath, sap.ui.model.FilterOperator.Contains, fValue);
					}
				} else { // If blank get all values
					filter = new sap.ui.model.Filter({
						path: filterPath,
						operator: sap.ui.model.FilterOperator.NE,
						value1: null
					});
				}
				// Fill previous filters to maintain proper filtering
				finalFilter = [filter];
				if (preFilter != undefined && preFilter.length > 0) {
					for (var i = 0; i < preFilter.length; i++) {
						if (filterPath != preFilter[i].sPath){
							finalFilter.push(preFilter[i]);
							
						}
					}
				}
				_oDetailTable.mBindingInfos.rows.binding.aFilters = [];
				_oDetailTable.getBinding("rows").filter([filter], sap.ui.model.FilterType.Application);
				calculatePPVSum(_dtlView);
				_oDetailTable.invalidate();
				_oDetailTableModel.refresh();
				if (groupFlag) {
					_oDetailTable.setEnableGrouping(true);
					calculateGroupSum(_dtlView.byId("detailTable").getGroupBy().split("--")[1], _dtlView);
				} 
				busyDialog.close();
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},
		/** Function : onSortPress 
		 * input >> oEvent
		 * output <<  
		 *	1. Use Application filter for proper result
		 *	2.  
		 */
		
        
		onSortPress: function(oEvent) {
			try {
				var groupFlag = false;
				var groupPath;
				//var idSet;
				var oFilter = _oDetailTable.mBindingInfos.rows.binding.aApplicationFilters;
				if (_oDetailTable.getGroupBy() != null) {
					groupFlag = true;
					groupPath = _oDetailTable.getGroupBy().split("--")[1];
					_oDetailTable.setEnableGrouping(false);
				}
				var sPath = oEvent.getParameter("column").getSortProperty();
				var bDescending = false;
				if (oEvent.getParameter("sortOrder") == "Descending") {
					bDescending = true;
				}
				for (var i = 0; i < _oDetailTable.getColumns().length; i++) {
					_oDetailTable.getColumns()[i].setSorted(false);
				}
				if (groupFlag) {
					var oSorter2 = new sap.ui.model.Sorter(sPath, bDescending);
					var oSorter1 = new sap.ui.model.Sorter(groupPath, bDescending);
					_oDetailTable.bindAggregation("rows", {
						path: "/tableData",
						sorter: [oSorter1, oSorter2]
					});
				} else {
					var oSorter1 = new sap.ui.model.Sorter(sPath, bDescending);
					_oDetailTable.bindAggregation("rows", {
						path: "/tableData",
						sorter: [oSorter1]
					});
				}
				if (oFilter.length > 0) {
					var oCombinedFilter = new sap.ui.model.Filter(oFilter);
					_oDetailTable.getBinding("rows").filter(oCombinedFilter, sap.ui.model.FilterType.Application);
				}

				oEvent.getParameter("column").setSorted(true);
				oEvent.getParameter("column").setSortOrder(oEvent.getParameter("sortOrder"));
				if (groupFlag) {
					_oDetailTable.setEnableGrouping(true);
					changeGroupHeader(_dtlView);
				} 
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},

		/** Function : handleRestorePersonalization 
		 * input >> oEvent
		 * output <<  
		 *	1. Re-arrange columns with respect to default personalisation
		 *	2. Save it to system
		 */
		handleRestorePersonalization: function(oEvent) {
			try {
				busyDialog.open();
				var personalisationModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("com.jabil.fi.model",
					"/personalisation_data.json"));
				personalisationModel.attachRequestCompleted(function() {
					personalisationData = personalisationModel.getData();
					_removeAllDtlTableColumns(_dtlView, personalisationData);
					_addAllDtlTableColumns(_dtlView, personalisationData.ColumnCollection);

					$.each(personalisationData.ColumnCollection, function(idx, item) {
						item.visible = true;
						_dtlView.byId(item.path).setVisible(item.visible);
					});
					sap.ui.getCore().setModel(personalisationData, "personalisationData");
					jQuery.sap.storage(jQuery.sap.storage.Type.local).put("personalisationData", personalisationData);
					oDetailMultiDialog.setModel(personalisationModel);
					personalisationModel.refresh();
				});

				busyDialog.close();
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},

		/** Function : handleClose > Close for all dialogs
		 * input >> oEvent
		 * output <<  
		 *	1. 
		 *	2.  
		 */
		handleClose: function(oEvent) {
			try {
				oDetailMultiDialog.setModel("");
				oDetailMultiDialog.close();
				oDetailMultiDialog.destroy();
			} catch (e) {
				handleException(e);
			}
		},
		/** Function : onReset > 
		 * input >> oEvent
		 * output <<  
		 *	1. Reset all filter,sorting and grouping
		 */
		onReset: function(oEvent) {
			try {
			//	defaultSort();
				clearTableSelection(_dtlView);
				additionalReset();
				_oDetailTable.invalidate();
			} catch (e) {
				handleException(e);
			}
		},

		/** Function : onResultsetPress >  Result set status
		 * input >> oEvent
		 * output <<  
		 *	1. Status X is error  : get info from backend
		 *	2. Status N is Not allowed to post 
		 *   3. Status S: is success  : get doc number from status
		 */
		onResultsetPress: function(oEvent, sId) {
			try {
				busyDialog.open();
				var selRow = oEvent.oSource.oParent.getBindingContext().sPath.split("/", 3)[2];
				var Status = _oDetailTableModel.oData.tableData[selRow].Status;
				oDetailMultiDialog = sap.ui.xmlfragment("com.jabil.fi.fragment.Resultset", this);
				if (Status == "X") {
					var input = "";
					input += "Buzei='" + _oDetailTableModel.oData.tableData[selRow].Buzei + "',";
					input += "Gjahr='" + _oDetailTableModel.oData.tableData[selRow].Gjahr + "',";
					input += "Belnr='" + _oDetailTableModel.oData.tableData[selRow].Belnr + "',";
					input += "Bukrs='" + _oDetailTableModel.oData.tableData[selRow].Bukrs + "',";
					input += "Status='E'"
					getStatus(input, "X", selRow, oDetailMultiDialog);
				} else {
					if (Status.indexOf("N") == 0) {
						msg = Status.indexOf("N1") >= 0 ? _oResourceBundle.getText("POSTING_IN_PROGRESS") : _oResourceBundle.getText("NOT_ALLOWED_TO_POST");
						state = null;
						icon = null;
					} else {
						// Change in this method ,add to getStatusExcel too
						if(Status.split(":")[1] != null){
							if(Status.split(":")[0]=="S"){
								msg = _oResourceBundle.getText("POSTED_ID_MSG", [(Status.split(":")[1].trim()).substr(0, 10)]);
							}else if(Status.split(":")[0]=="R"){
								msg = _oResourceBundle.getText("REV_POSTED_ID_MSG", [(Status.split(":")[1].trim()).substr(0, 10)]);
							}else if(Status.split(":")[0]=="RS"){
								var postDoc = (Status.split(":")[1]).split("&");
								if(postDoc[1].indexOf("FB01")>1){
									msg = _oResourceBundle.getText("POSTED_BOTH_MSG",[(postDoc[1].trim()).substr(0, 10),(postDoc[0].trim()).substr(0, 10)]);
								}else{
									msg = _oResourceBundle.getText("POSTED_BOTH_MSG",[(postDoc[0].trim()).substr(0, 10),(postDoc[1].trim()).substr(0, 10)]);	
								}
							}
						}else{
							msg = _oResourceBundle.getText("POSTED_ID_UNALAILABLE")
						}
						
						state = "Success";
						icon = "sap-icon://flag";
					}
					oDetailMultiDialog.setModel("");
					var resultSetModel = new sap.ui.model.json.JSONModel();
					resultSetModel.setData({
						icon: icon,
						state: state,
						text: msg
					});
					oDetailMultiDialog.setModel(resultSetModel);
					resultSetModel.refresh();
					busyDialog.close();
				}
				_dtlView.addDependent(oDetailMultiDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", _dtlView, oDetailMultiDialog);
				oDetailMultiDialog.open();
			} catch (e) {
				busyDialog.close();
				andleException(e);
			}
		},
		/** Function : onBatchComment >  
		 * input >> oEvent
		 * output <<  
		 *	1. if the selected key is AP Issue/3 the comment is predefined list 
		 *      otherwise common text  box to enter comment
		 */
		onBatchComment: function(oEvent) {
			try {
				busyDialog.open();
				selKey = _dtlView.byId("selectReasonCode").mProperties.selectedKey;
				//	if(selKey!=""){
				oDetailMultiDialog = sap.ui.xmlfragment("com.jabil.fi.fragment.Comment", this);
				oDetailMultiDialog.setBusy(true);
				_dtlView.addDependent(oDetailMultiDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", _dtlView, oDetailMultiDialog);
				oDetailMultiDialog.open();
				oDetailMultiDialog.setModel("");

				if (selKey != "3") {
					sap.ui.getCore().byId("myCommentid").setVisible(true);
					sap.ui.getCore().byId("apIssueGrp").setVisible(false);
					var commentModel = new sap.ui.model.json.JSONModel();
					commentModel.setData({
						commentAvailable: _oDetailTableModel.oData.batchComment,
						selRow: null,
						batch: true
					});
					oDetailMultiDialog.setModel(commentModel);
					commentModel.refresh();
					oDetailMultiDialog.setBusy(false);
					busyDialog.close();
				} else {
					//sap.ui.getCore().byId("apIssueGrp").setVisible(true); 
					sap.ui.getCore().byId("myCommentid").setVisible(false);
					sap.ui.getCore().byId("apIssueGrp").setEditable(true);
					var apIssueModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("com.jabil.fi.model", "/radio_button_data.json"));
					apIssueModel.attachRequestCompleted(function() {
						apIssueModel.getData().kpComments.push({
							selected: false,
							text: _oResourceBundle.getText("FREETEXT")
						});
						apIssueModel.oData.batch = true;
						oDetailMultiDialog.setModel(apIssueModel);
						if (_oDetailTableModel.oData.batchComment.trim() == _oResourceBundle.getText("DD_INCORRECT_PO"))
							oDetailMultiDialog.getModel().getData().kpComments[0].selected = true;
						else if (_oDetailTableModel.oData.batchComment.trim() == _oResourceBundle.getText("DD_INVOICE_INCORRECT"))
							oDetailMultiDialog.getModel().getData().kpComments[1].selected = true;
						else if (_oDetailTableModel.oData.batchComment.trim() == _oResourceBundle.getText("DD_DNCN"))
							oDetailMultiDialog.getModel().getData().kpComments[2].selected = true;
						else if (_oDetailTableModel.oData.batchComment.trim() == _oResourceBundle.getText("DD_INCORRECT_CONSIGNED"))
							oDetailMultiDialog.getModel().getData().kpComments[3].selected = true;
						else {
							oDetailMultiDialog.getModel().getData().kpComments[4].selected = true;
							sap.ui.getCore().byId("myCommentid").setValue(_oDetailTableModel.oData.batchComment.trim());
							sap.ui.getCore().byId("myCommentid").setVisible(true);
						}

						oDetailMultiDialog.getModel().refresh();
						oDetailMultiDialog.setBusy(false);
						busyDialog.close();
					});
				}
				//	}else{
				//		busyDialog.close();	
				//		informationMessage(_oResourceBundle.getText("REASONCODE_SELECT_MSG"));
				//	}
			} catch (e) {
				oDetailMultiDialog.setBusy(false);
				busyDialog.close();
				handleException(e);
			}
		},
		/** Function : changeAPIssueSel 
		 * input >> oEvent
		 * output <<  
		 *	1. select free text, show else
		 */
		changeAPIssueSel: function(oEvent) {
			if (sap.ui.getCore().byId("apIssueGrp").getSelectedButton().getText() == _oResourceBundle.getText("FREETEXT"))
				sap.ui.getCore().byId("myCommentid").setVisible(true);
			else
				sap.ui.getCore().byId("myCommentid").setVisible(false);
		},

	/** Function : onRemoveComment 
		 * input >> oEvent
		 * output <<  
		 *	1. select free text, show else
		 */
		onRemoveComment: function(oEvent) {
			if (sap.ui.getCore().byId("isResetComment").getSelected()){
				sap.ui.getCore().byId("myCommentid").setVisible(false);
				sap.ui.getCore().byId("apIssueGrp").setVisible(false);
			}else{
				sap.ui.getCore().byId("myCommentid").setVisible(true);
				sap.ui.getCore().byId("apIssueGrp").setVisible(true);
			}
				
		},
		/** Function : onCommentPress 
		 * input >> oEvent
		 * output <<  
		 *	1. if no resoncode, dont allow to enter comment
		 *	2. otherwise check whether comment is available in UI or in backend
		 */
		onCommentPress: function(oEvent) {
			try {
				var selRow = oEvent.oSource.oParent.getBindingContext().sPath.split("/", 3)[2];
			//	if(isValidForCommentAssignment(selRow)){
					busyDialog.open();
					
					var selRecord = _oDetailTableModel.oData.tableData[selRow];
					oDetailMultiDialog = sap.ui.xmlfragment("com.jabil.fi.fragment.Comment", this);
					oDetailMultiDialog.setBusy(true);
					_dtlView.addDependent(oDetailMultiDialog);
					jQuery.sap.syncStyleClass("sapUiSizeCompact", _dtlView, oDetailMultiDialog);
					oDetailMultiDialog.open();
					oDetailMultiDialog.setModel("");
					sap.ui.getCore().byId("myCommentid").setEditable((selRecord.Status.indexOf("S") == 0 || selRecord.Status.indexOf("RS") == 0 || selRecord.Status.indexOf("N") == 0) ? false :true);
					if (_oDetailTableModel.oData.tableData[selRow].Reasoncode != "3") {
						sap.ui.getCore().byId("myCommentid").setVisible(true);
						sap.ui.getCore().byId("apIssueGrp").setVisible(false);
						// If comment is available, get comment from sap
						if (_oDetailTableModel.oData.tableData[selRow].Comments == "X") {
							// Call service with values
							var input = "";
							input += "Buzei='" + _oDetailTableModel.oData.tableData[selRow].Buzei + "',";
							input += "Gjahr='" + _oDetailTableModel.oData.tableData[selRow].Gjahr + "',";
							input += "Belnr='" + _oDetailTableModel.oData.tableData[selRow].Belnr + "',";
							input += "Bukrs='" + _oDetailTableModel.oData.tableData[selRow].Bukrs + "',";
							input += "Status='C'";
							getStatus(input, "C", selRow, oDetailMultiDialog);
						} else {
							var commentModel = new sap.ui.model.json.JSONModel();
							commentModel.setData({
								commentAvailable: _oDetailTableModel.oData.tableData[selRow].Comments,
								selRow: selRow,
								batch: false
							});
							oDetailMultiDialog.setModel(commentModel);
							commentModel.refresh();
							oDetailMultiDialog.setBusy(false);
							busyDialog.close();
						}
	
					} else {
						sap.ui.getCore().byId("apIssueGrp").setVisible(true);
						sap.ui.getCore().byId("myCommentid").setVisible(false);
						sap.ui.getCore().byId("apIssueGrp").setEditable((selRecord.Status.indexOf("S") == 0 || selRecord.Status.indexOf("R") == 0 || selRecord.Status.indexOf("N") == 0) ? false :true);
						var apIssueModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("com.jabil.fi.model", "/radio_button_data.json"));
						apIssueModel.attachRequestCompleted(function() {
							apIssueModel.getData().kpComments.push({
								selected: false,
								text: _oResourceBundle.getText("FREETEXT")
							});
							apIssueModel.oData.selRow = selRow;
							apIssueModel.oData.batch = false;
							oDetailMultiDialog.setModel(apIssueModel);
							if (_oDetailTableModel.oData.tableData[selRow].Comments == "X") {
								// Call service with values
								var input = "";
								input += "Buzei='" + _oDetailTableModel.oData.tableData[selRow].Buzei + "',";
								input += "Gjahr='" + _oDetailTableModel.oData.tableData[selRow].Gjahr + "',";
								input += "Belnr='" + _oDetailTableModel.oData.tableData[selRow].Belnr + "',";
								input += "Bukrs='" + _oDetailTableModel.oData.tableData[selRow].Bukrs + "',";
								input += "Status='C'";
								getStatus(input, "C", selRow, oDetailMultiDialog, _oResourceBundle.getText("AP"));
							} else if (selRecord.Comments.length > 2) {
								if (selRecord.Comments.trim() == _oResourceBundle.getText("DD_INCORRECT_PO"))
									oDetailMultiDialog.getModel().getData().kpComments[0].selected = true;
								else if (selRecord.Comments.trim() == _oResourceBundle.getText("DD_INVOICE_INCORRECT"))
									oDetailMultiDialog.getModel().getData().kpComments[1].selected = true;
								else if (selRecord.Comments.trim() == _oResourceBundle.getText("DD_DNCN"))
									oDetailMultiDialog.getModel().getData().kpComments[2].selected = true;
								else if (selRecord.Comments.trim() == _oResourceBundle.getText("DD_INCORRECT_CONSIGNED"))
									oDetailMultiDialog.getModel().getData().kpComments[3].selected = true;
								else {
									oDetailMultiDialog.getModel().getData().kpComments[4].selected = true;
									sap.ui.getCore().byId("myCommentid").setValue(selRecord.Comments.trim());
									sap.ui.getCore().byId("myCommentid").setVisible(true);
								}
								oDetailMultiDialog.getModel().refresh();
								oDetailMultiDialog.setBusy(false);
								busyDialog.close();
							} else {
								oDetailMultiDialog.setBusy(false);
								busyDialog.close();
							}
						});
					}
		//	}else{
		//			informationMessage(_oResourceBundle.getText("INVALID_REC_COMMENT"));
		//	}
				//	}
			} catch (e) {
				oDetailMultiDialog.setBusy(false);
				busyDialog.close();
				handleException(e);
			}
		},

		/** Function : handleCommentSave >> Save Comment 
		 * input >> oEvent
		 * output <<  
		 *	1. 
		 *	2.  
		 */
		handleCommentSave: function(oEvent) {
			try {
				busyDialog.open();

				// Read col index and replace comment
				if (oDetailMultiDialog.getModel().oData.batch) {
					if(sap.ui.getCore().byId("isResetComment").getSelected()){
						removeBatchCommentFlag = true;
					}else{
						removeBatchCommentFlag = false;
						var selKey = _dtlView.byId("selectReasonCode").mProperties.selectedKey;
						var batchCommentText;
						batchCommentText = selKey != "3" ? sap.ui.getCore().byId("myCommentid").mProperties.value : oDetailMultiDialog.getModel().getData().kpComments[
							sap.ui.getCore().byId("apIssueGrp").getSelectedIndex()].text;
						_oDetailTableModel.oData.batchComment = batchCommentText;
						_dtlView.byId("batchCommentText").mProperties.type = (batchCommentText != "" && batchCommentText != " ") ? "Emphasized" : "Default";
						_dtlView.byId("batchCommentText").invalidate();
					}
				} else {
					var selRow = oDetailMultiDialog.getModel().oData.selRow;
					var selRecord = _oDetailTableModel.oData.tableData[selRow];
					if (selRecord.Status.indexOf("S") != 0 && selRecord.Status.indexOf("RS") != 0 && selRecord.Status.indexOf("N") != 0) { // Save only to editable
						var commentText = "";
						if(!sap.ui.getCore().byId("isResetComment").getSelected()){
							if (selRecord.Reasoncode != "3") {
								commentText = sap.ui.getCore().byId("myCommentid").mProperties.value;
							} else { // if free text, get message from textbox
								if (sap.ui.getCore().byId("apIssueGrp").getSelectedButton().getText() == _oResourceBundle.getText("FREETEXT")) {
									commentText = sap.ui.getCore().byId("myCommentid").mProperties.value;
								} else {
									commentText = oDetailMultiDialog.getModel().getData().kpComments[sap.ui.getCore().byId("apIssueGrp").getSelectedIndex()].text;
								}
							}
						}
						selRecord.Comments = commentText.trim();
						_oDetailTableModel.oData.unSavedComment = "X";
						sap.ui.getCore().setModel("_oDetailTableModel", _oDetailTableModel);
					}
				}
				this.handleClose(oEvent);
				busyDialog.close();
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},

		/** Function : onReasonCodePress 
		 * input >> oEvent
		 * output <<  
		 *	1. 
		 *	2.  
		 */
		onReasonCodePress: function(oEvent) {
			try {
				//	var selRow = oEvent.oSource.oParent.getBindingContext().sPath.split("/", 3)[2];
			var selRow = oEvent.oSource.oParent.getBindingContext().sPath.split("/", 3)[2];
			if(isValidForRCAssignment(selRow)){	
				if (_oDetailTableModel.oData.tableData[oEvent.oSource.oParent.getBindingContext().sPath.split("/", 3)[2]].Status.indexOf("S") != 0 || _oDetailTableModel.oData.tableData[oEvent.oSource.oParent.getBindingContext().sPath.split("/", 3)[2]].Status.indexOf("R") != 0) {
					oDetailMultiDialog = sap.ui.xmlfragment("com.jabil.fi.fragment.ReasonCode", this);
					_dtlView.addDependent(oDetailMultiDialog);
					jQuery.sap.syncStyleClass("sapUiSizeCompact", _dtlView, oDetailMultiDialog);
					oDetailMultiDialog.open();
					oDetailMultiDialog.setModel("");
					var rcModel = new sap.ui.model.json.JSONModel();
					rcModeldata = sap.ui.getCore().getModel("rcModel");
					rcModel.setData(rcModeldata.oData);
					oDetailMultiDialog.setModel(rcModel);
					rcModel.refresh();
					sap.ui.getCore().byId("selTableRow").mProperties.value = oEvent.oSource.oParent.getBindingContext().sPath.split("/", 3)[2];
				}
			}else{
					informationMessage(_oResourceBundle.getText("INVALID_REC_RC"));
			}	
				
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},

		/** Function : onGroupShowPress 
		 * input >> oEvent
		 * output <<  
		 *	1. For group selection 
		 *	2. Sort with respect to PPV value
		 */
		onGroupShowPress: function(oEvent) {
			try {
				if (_oDetailTable.getGroupBy() != null && _oDetailTable.getGroupBy().split("--")[1] != undefined) {
					oDetailMultiDialog = sap.ui.xmlfragment("com.jabil.fi.fragment.TableGroupItem", this);
					_dtlView.addDependent(oDetailMultiDialog);
					jQuery.sap.syncStyleClass("sapUiSizeCompact", _dtlView, oDetailMultiDialog);
					oDetailMultiDialog.open();
					oDetailMultiDialog.setModel("");
					oDetailMultiDialog._oTable.getColumns()[1].mProperties.visible = isLocalCurr;
					if (isLocalCurr) {
						_oDetailTableModel.oData.grpHeader.grpHeaderSum.sort(function(a, b) {
							return parseFloat(b.sumTotalPPVLcl) - parseFloat(a.sumTotalPPVLcl);
						});
						oDetailMultiDialog._oTable.getColumns()[2].mProperties.visible = false;
					} else {
						_oDetailTableModel.oData.grpHeader.grpHeaderSum.sort(function(a, b) {
							return parseFloat(b.sumTotalPPVGrp) - parseFloat(a.sumTotalPPVGrp);
						});
						oDetailMultiDialog._oTable.getColumns()[2].mProperties.visible = true;
					}
					oDetailMultiDialog.setMultiSelect(true);
					grpDetailsModel = new sap.ui.model.json.JSONModel();
					grpDetailsModel.setData(_oDetailTableModel.oData.grpHeader);
					oDetailMultiDialog.setModel(grpDetailsModel);
					grpDetailsModel.refresh();
				}
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},
		/** Function : closeTableGroupFilter > Close for all dialogs
		 * input >> oEvent
		 * output <<  
		 *	1. 
		 *	2.  
		 */
		closeTableGroupFilter: function(oEvent) {
			try {
				if (this._oDialog) {
					this._oDialog.destroy();
				}
			} catch (e) {
				handleException(e);
			}
		},
		/** Function : handleTableGroupFilter 
		 * input >> oEvent
		 * output <<  
		 *	1. Filter table with respect to Group selection
		 *	2.  
		 */
		handleTableGroupFilter: function(oEvent) {
			try {
				if((oDetailMultiDialog._oSearchField.getValue()==="x"||oDetailMultiDialog._oSearchField.getValue()==="X")&&oEvent.sId==="confirm"){
					//
					this.rangeSelection(oEvent,true);
				}
					var filterPath = _oDetailTable.getGroupBy().split("--")[1];
					var aContexts = oEvent.getParameter("selectedContexts");
					var mySet = [];
					var myfilter = [];
					aContexts.map(function(oContext) {
						myfilter.push(new sap.ui.model.Filter(filterPath, sap.ui.model.FilterOperator.EQ, oContext.getObject().groupItem));
						mySet.push({
							groupName: oContext.getObject().groupItem,
							id: oContext.getObject().id,
							count: oContext.getObject().count
						});
					});
					_oDetailTable.setEnableGrouping(false);
					_oDetailTable.getBinding("rows").filter(myfilter, sap.ui.model.FilterType.Application);
					_oDetailTable.setEnableGrouping(true);
					calculateGroupSum(filterPath, _dtlView);
					var mySelection = _oDetailTable._oSelection.aSelectedIndices;
					var selIndex = 0;
					for (var i = 0; i < mySet.length; i++) {
						var count = _oDetailTable.getContextByIndex(selIndex).count;
						selIndex++; // To get record next to header
						for (var j = 0; j < count; j++) {
							var selStatus = _oDetailTable.getContextByIndex(selIndex + j).getObject().Status;
						//	if (!(selStatus.indexOf("S") == 0 || selStatus.indexOf("N") == 0)) {
						// If revenue posting, do diff
						if(isRevenuePostActive){
							if (!(selStatus.indexOf("RS") == 0 ||selStatus.indexOf("N") == 0)) {
								mySelection.push(selIndex + j);
							}
						}else{
							if (!(selStatus.indexOf("RS") == 0 || selStatus.indexOf("S") == 0 ||selStatus.indexOf("N") == 0)) {
								mySelection.push(selIndex + j);
							}
						}
							
						}
						selIndex += count; //To set to next header				
					}
					_oDetailTable._oSelection.aSelectedIndices = mySelection;
					if (_oDetailTable._oSelection.aSelectedIndices.length != 0) {
						var totPPV = 0;
						var count = 0;
						var selCols = _oDetailTable._oSelection.aSelectedIndices;
						for (var i = 0; i < selCols.length; i++) {
							if (selectedCurr == "Grp") {
								totPPV += parseFloat(_oDetailTableModel.oData.tableData[_oDetailTable.getContextByIndex(selCols[i]).sPath.split("/")[2]].TOTAL_GRP);
								count++;
							} else {
								totPPV += parseFloat(_oDetailTableModel.oData.tableData[_oDetailTable.getContextByIndex(selCols[i]).sPath.split("/")[2]].TOTAL_LCL);
								count++;
							}
						}
						_oDetailTable.setFooter(_oResourceBundle.getText("TOTALPPV_SELECTED", [count, formatToTwoDecimal(totPPV), getSelectedCurrency()]));
					}
					_oDetailTable.invalidate();
					oEvent.getSource().getBinding("items").filter([]);
			} catch (e) {
				handleException(e);
			}
		},
	rangeSelection: function(oEvent,isFromGrpFilter) {
		try{
			//	oDetailMultiDialog._oTable._aSelectedPaths=tt
			if(oDetailMultiDialog._oTable._aSelectedPaths.length>1){
				var range1 = parseInt(oDetailMultiDialog._oTable._aSelectedPaths[0].split("/grpHeaderSum/")[1]);
				var range2 = parseInt(oDetailMultiDialog._oTable._aSelectedPaths[1].split("/grpHeaderSum/")[1]);
				var rangeFrom;var rangeTo;
				if(range1>range2){
					rangeFrom = range2;
					rangeTo = range1;
				}else{
					rangeFrom = range1;
					rangeTo = range2;
				}
				var myVal =[];
				for(var i=rangeFrom;i<=rangeTo;i++){
					myVal.push("/grpHeaderSum/"+i);
				}
				oDetailMultiDialog._oTable._aSelectedPaths = myVal;
				// Execute and close the dialog
				oEvent.mParameters.selectedContexts=oDetailMultiDialog._oTable.getSelectedContexts(true);
				if(!isFromGrpFilter){
					this.handleTableGroupFilter(oEvent);
					oDetailMultiDialog._dialog.destroy();
				}
			}
			}catch(e){
				handleException(e);	
			}
	},
		/** Function : handleTableGroupSearch >>  To manage filtering in Group selection screen
		 * input >> oEvent
		 * output <<  
		 *	1. 
		 *	2.  
		 */
		handleTableGroupSearch: function(oEvent) {
			try {
				var sValue = oEvent.getParameter("value");
				if(sValue==="X" || sValue==="x"){
					this.rangeSelection(oEvent,false);
				}else{
					var oFilter;
					var oBinding = oEvent.getSource().getBinding("items");
					if (filterRegex.test(sValue)) {
						oFilter = isLocalCurr ? customFilterForAmount("sumTotalPPVLcl", sValue) : customFilterForAmount("sumTotalPPVGrp", sValue);
						oBinding.filter([oFilter], sap.ui.model.FilterType.Application);
					} else {
						oFilter = new sap.ui.model.Filter("groupName", sap.ui.model.FilterOperator.Contains, sValue);
						oBinding.filter([oFilter]);
					}
				}
			} catch (e) {
				handleException(e);
			}
		},
		/** Function : handleResonCodeSave >> Change in Reason Code Popup for line items 
		 * input >> oEvent
		 * output <<  
		 *	1. If selected reason code is AP ISSUE, clear comment as user has to select comment from given option
		 *	2. set selected reason code
		 */
		handleResonCodeSave: function(oEvent) {
			try {
				busyDialog.open();
				var tableData = _oDetailTableModel.oData.tableData;
				var selRow = sap.ui.getCore().byId("selTableRow").mProperties.value;
				// Read col index and replace comment				
				var rc = sap.ui.getCore().byId("selectReasonCode1").mProperties.selectedKey;
				if(rc !=""){
					rc = rc=="X"?"":rc;
					if (tableData[selRow].Status.indexOf("S") != 0 && tableData[selRow].Status.indexOf("R") != 0 && tableData[selRow].Status.indexOf("N") != 0) {
						tableData[selRow].Reasoncode = rc;
						_oDetailTableModel.oData.unSavedReasonCode.push(tableData[selRow].Belnr);
						sap.ui.getCore().setModel("_oDetailTableModel", _oDetailTableModel);
					}
				}
				this.handleClose(oEvent);
				busyDialog.close();
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},

		/** Function : changeCellReasonCode >> Change in Reason Code DD	 
		 * input >> oEvent
		 * output <<  
		 *	1. 
		 *	2.  
		 */
		changeCellReasonCode: function(oEvent) {
			try {
				var cellReasonCode = oEvent.mParameters.selectedItem.mProperties.key
				var selRow = oEvent.mParameters.id.split("-", 3)[2].replace("row", "");
				if (_oDetailTableModel.oData.tableData[selRow].Status.indexOf("S") != 0 && _oDetailTableModel.oData.tableData[selRow].Status.indexOf("R") != 0 && _oDetailTableModel.oData.tableData[selRow].Status.indexOf("N") != 0)
					_oDetailTableModel.oData.tableData[selRow].Reasoncode = cellReasonCode;
				_oDetailTableModel.oData.unSavedReasonCode.push(_oDetailTableModel.oData.tableData[selRow].Belnr);
				_oDetailTableModel.refresh();
			} catch (e) {
				handleException(e);
			}
		},

		/** Function : onApplyReasonCode >> Apply reason code for selected Rows	 
		 * input >> oEvent
		 * output <<  
		 *	1. 
		 *	2.  
		 */
		onApplyReasonCode: function() {
			try {
				if (_oDetailTable._oSelection.aSelectedIndices.length == 0) {
					informationMessage(_oResourceBundle.getText("NOITEM_SELECTED"));
				} else {
						if(isValidForBatchAssignment()){
							this.openConfirmationDialog("onApplyReasonCode");
						}else{
							informationMessage(_oResourceBundle.getText("INVALID_BATCH")); 
						}
				}
			} catch (e) {
				handleException(e);
			}
		},
		/** Function : _applyReasonCode 	 
		 * input >> 
		 * output <<  
		 *	1. Apply reason code to all selected items
		 *	2. If reason code is AP ISSUE, remove comments
		 *	3. Keep unsaved reason code for verification during posting
		 */
		_applyReasonCode: function() {
			try {
				// Read col index and replace comment
				var rc = _dtlView.byId("selectReasonCode").mProperties.selectedKey;
				var selCols = _oDetailTable._oSelection.aSelectedIndices;
				var tableData = _oDetailTableModel.oData.tableData;
				
				for (var i = 0; i < selCols.length; i++) {
					var currTableItem = tableData[_oDetailTable.getContextByIndex(selCols[i]).sPath.split("/")[2]];
					if (currTableItem.Status.indexOf("S") != 0 && currTableItem.Status.indexOf("R") != 0 && currTableItem.Status.indexOf("N") != 0) {
						if(rc=="X"){
							currTableItem.Reasoncode ="";
						}else if(rc!=""){
							currTableItem.Reasoncode = rc;
						}
						if(removeBatchCommentFlag){
							currTableItem.Comments ="";
						}else if(_oDetailTableModel.oData.batchComment!=""){
							currTableItem.Comments = _oDetailTableModel.oData.batchComment;
						}
						
						_oDetailTableModel.oData.unSavedReasonCode.push(currTableItem.Belnr);
					}
				}
				removeBatchCommentFlag = false;
				sap.ui.getCore().setModel("_oDetailTableModel", _oDetailTableModel);
				_oDetailTableModel.refresh();
				busyDialog.close();
			} catch (e) {
				handleException(e);
			}
		},

		/** Function : _openPersonalizationDialog >>  Column personalisation	 
		 * input >> 
		 * output <<  
		 *	1. get saved personalisation information
		 *	2.  If no information,get default info from json 
		 *       otherwise, set with respect to saved info
		 */
		_openPersonalizationDialog: function() {
			try {
				// associate controller with the fragment
				oDetailMultiDialog = sap.ui.xmlfragment("com.jabil.fi.fragment.PersonalizationDialog", this);
				personalisationData = getSavedPersonalisationData();
				var personalisationModel;
				//if not available, get from jason model
				if (personalisationData == undefined || personalisationData == null) {
					personalisationModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("com.jabil.fi.model",
						"/personalisation_data.json"));
					personalisationModel.attachRequestCompleted(function() {
						sap.ui.getCore().setModel(personalisationModel.getData(), "personalisationData");
						oDetailMultiDialog.setModel(personalisationModel);
						_dtlView.addDependent(oDetailMultiDialog);
						jQuery.sap.syncStyleClass("sapUiSizeCompact", _dtlView, oDetailMultiDialog);
						oDetailMultiDialog.open();
					});
				} else {
					personalisationModel = new sap.ui.model.json.JSONModel();
					personalisationModel.setData(personalisationData);
					oDetailMultiDialog.setModel(personalisationModel);
					_dtlView.addDependent(oDetailMultiDialog);
					jQuery.sap.syncStyleClass("sapUiSizeCompact", _dtlView, oDetailMultiDialog);
					oDetailMultiDialog.open();
				}
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},

		/** Function : onPersonalizationDialogPress >> 
		 * input >> oEvent
		 * output <<    
		 */
		onPersonalizationDialogPress: function(oEvent) {
			try {
				this._openPersonalizationDialog();
			} catch (e) {
				handleException(e);
			}
		},

		/** Function : onColumnMove >> 
		 * input >> 
		 * output <<  
		 *	1. with respect to drag and drop column, rearrange column info
		 *	2.  save it to personalisation
		 */
		onColumnMove: function(oEvent) {
			try {
				// Need to save index of columns
				if (_dtlView != undefined && oEvent.getParameters().column.sId != undefined) {
					var oldIndex = _oDetailTable.indexOfColumn(_dtlView.byId(oEvent.getParameters().column.sId.split("--")[1]));
					var newIndex = oEvent.getParameters().newPos;
					var bigIndex = oldIndex < newIndex ? newIndex : oldIndex;
					var smallIndex = oldIndex < newIndex ? oldIndex : newIndex;
					var incrementFlag = oldIndex < newIndex ? false : true;
					var personalisationData = sap.ui.getCore().getModel("personalisationData");

					$.each(personalisationData.ColumnCollection, function(idx, item) {
						if (item.index == oldIndex) {
							item.index = newIndex;
						} else if (!(item.index > bigIndex || item.index < smallIndex)) {
							if (item.index > smallIndex || item.index == newIndex) {
								item.index = incrementFlag ? item.index + 1 : item.index - 1;
							}
						}
					});
					sap.ui.getCore().setModel(personalisationData, "personalisationData");
					jQuery.sap.storage(jQuery.sap.storage.Type.local).put("personalisationData", personalisationData);
				}
			} catch (e) {
				handleException(e);
			}
		},

		/** Function : handleColVisibilitySave >>  Save Col Visibility 
		 * input >> oEvent
		 * output <<  
		 */
		handleColVisibilitySave: function(oEvent) {
			try {
				var selectedItems = oEvent.mParameters.payload.columns.selectedItems;
				var flag = 0;
				oDetailMultiDialog.getModel().oData.ColumnCollection = setIndexForColumnArray(oDetailMultiDialog.getModel().oData.ColumnCollection,oEvent.mParameters.payload.columns.tableItems);
				oDetailMultiDialog.getModel().oData.ColumnCollection = oDetailMultiDialog.getModel().oData.ColumnCollection.sort(function(a, b) {
					return a.index - b.index;
				});
				_removeAllDtlTableColumns(_dtlView, oDetailMultiDialog.getModel().oData.ColumnCollection);
				_addAllDtlTableColumns(_dtlView, oDetailMultiDialog.getModel().oData.ColumnCollection);
				//Save model to local store
				jQuery.sap.storage(jQuery.sap.storage.Type.local).put("personalisationData", oDetailMultiDialog.getModel().oData);
				oDetailMultiDialog.close();
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},

		/** Function : isUnAssignResonCode
		 * input >> 
		 * output <<  
		 *	1. check is there any unassingment of reasoncode for proper message   
		 */
		isUnAssignResonCode: function() {
			try {
				var selCols = _oDetailTable._oSelection.aSelectedIndices;
				var tableData = _oDetailTableModel.oData.tableData;
				var totalPPVSum = 0;
				// Validate the records with table model to confirm reason codes are saved.
				for (var i = 0; i < selCols.length; i++) {
					var selIndex = _oDetailTable.getContextByIndex(selCols[i]).sPath.split("/")[2];
					if (tableData[selIndex].Status.indexOf("S") != 0 && tableData[selIndex].Status.indexOf("R") != 0 && tableData[selIndex].Status.indexOf("N") != 0) {
						if (tableData[selIndex].Reasoncode == "") {
							return false;
						}
					}
				}
				return true;
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},

		/** Function : onPublishToSap
		 * input >> 
		 * output <<  
		 *	1. Save all record which is having 
		 *		- Reason Code & Not yet Posted
		 *   
		 */
		onPublishToSap: function() {
			try {
				//Google Analytics
				ga('send', 'pageview', 'Publish_PPVDetails', "CC:" + sap.ui.getCore().byId("selectCompany").mProperties.selectedKey);

				if (_oDetailTable._oSelection.aSelectedIndices.length === 0) {
					informationMessage(_oResourceBundle.getText("NOITEM_SELECTED"));
				} else if (isValidToPublish()) {
					if (_oDetailTableModel.oData.unSavedReasonCode.length > 0) {
						var msg = _oResourceBundle.getText("SAVE_REASONCODE_ERROR1_MSG");
						_oDetailTableModel.oData.unSavedReasonCode.forEach(function(entry) {
							msg += entry + " ,";
						});
						busyDialog.close();
						informationMessage(msg);
					} else if (_oDetailTableModel.oData.unSavedComment === "X") {
						var msg = _oResourceBundle.getText("SAVE_REASONCODE_ERROR2_MSG");
						busyDialog.close();
						informationMessage(msg);
					} else {
						this.openConfirmationDialog("onPublishToSap");
					}
				} else {
					busyDialog.close();
					informationMessage(_oResourceBundle.getText("POSTING_VALIDATION_FAIL"));
				}
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},
		/** Function : onPublishToSap
		 * input >> 
		 * output <<  
		 *	1. Save all record which is having 
		 *		- Reason Code & Not yet Posted
		 *   
		 */
		_publishToSap: function() {
			try {
				busyDialog.open();
			//	var toSaveRc = 
			this._getDeltaPostRecordsToUpdate();
			//	if (toSaveRc != null) {
			//		executeUpdateECC(toSaveRc, _dtlView, "POST");
			//	}
			} catch (e) {
				handleException(e);
			}
		},
		/** Function : handleSubmitConfirmSave >> Save Comment 
		 * input >> oEvent
		 * output <<  
		 *	1. 
		 *	2.  
		 */
		handleSubmitConfirmSave: function(oEvent) {
			try {
				var nextAction = sap.ui.getCore().byId("actionInfo").getText();
				sap.ui.getCore().byId("actionInfo").setText("");
				if (nextAction == "onApplyReasonCode") {
					busyDialog.open();
					this._applyReasonCode();
				} else if (nextAction == "onSave") {
					busyDialog.open();
					this._saveReasonCode();
				} else if (nextAction == "onRevenuePost") {
						busyDialog.open();
						this._doRevenuePost();
				} else if (nextAction == "onPublishToSap") {
					busyDialog.open();
					this._publishToSap();
				} else {
					busyDialog.close();
				}
				this.handleClose(oEvent);
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},
		/** Function : openConfirmationDialog >  to confirm before Reasoncode save & Publish     
		 * input >> oEvent
		 * output <<  
		 *	1. 
		 *	2.  
		 */
		openConfirmationDialog: function(selFunction) {
			try {
				busyDialog.open();
				var selCurr = selectedCurr == "Grp" ? grpCurr : lclCurr;
				var msg = "";
				var selCols = _oDetailTable._oSelection.aSelectedIndices;
				oDetailMultiDialog = sap.ui.xmlfragment("com.jabil.fi.fragment.SubmitConfirmDialog", this);
				_dtlView.addDependent(oDetailMultiDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", _dtlView, oDetailMultiDialog);
				oDetailMultiDialog.open();
				sap.ui.getCore().byId("actionInfo").setText(selFunction);
				if (selFunction == "onApplyReasonCode") {
					var resonCodeText = _dtlView.byId("selectReasonCode").getSelectedItem().mProperties.text;
				/*	if (resonCodeText == _oResourceBundle.getText("REMOVERC")) {
						msg = _oResourceBundle.getText("REASONCODE_UNASSIGN_MSG", [selCols.length, this._getSelectedPPVSum().toString(), selCurr]);
					} else if (resonCodeText == _oResourceBundle.getText("SELECTONE")) {
						msg = _oResourceBundle.getText("REASONCODE_UNASSIGN_MSG", [selCols.length, this._getSelectedPPVSum().toString(), selCurr]);
					}else{
						msg = _oResourceBundle.getText("APPLY_REASONCODE_MSG", [_dtlView.byId("selectReasonCode").getSelectedItem().mProperties.text,
							selCols.length, this._getSelectedPPVSum().toString(), selCurr
						]);
					}
					*/
					var reasonCodeMsg="";
					if (resonCodeText == _oResourceBundle.getText("REMOVERC")) {
						reasonCodeMsg = " unassign reason code ";
					} else if (resonCodeText == _oResourceBundle.getText("SELECTONE")) {
						reasonCodeMsg="";
					}else{
						reasonCodeMsg = " apply reason code "+_dtlView.byId("selectReasonCode").getSelectedItem().mProperties.text;
					}
	
					var commentMsg= (_oDetailTableModel.oData.batchComment =="")? "": " add comments" ;
					commentMsg= (removeBatchCommentFlag)? " remove Comment":commentMsg ;
					commentMsg=(reasonCodeMsg!="" && commentMsg!="")?(" & "+commentMsg):commentMsg;
					reasonCodeMsg = (reasonCodeMsg=="")?commentMsg :(reasonCodeMsg+commentMsg);
					
					if(reasonCodeMsg!=""){
						msg = _oResourceBundle.getText("APPLY_REASONCODE_MSG", [reasonCodeMsg,selCols.length, this._getSelectedPPVSum().toString(), selCurr
						]);
						sap.ui.getCore().byId("dialogMsg").setText(msg);
					}else
					sap.ui.getCore().byId("dialogMsg").setText(_oResourceBundle.getText("NO_CHANGE"));
					
					busyDialog.close();
				} else if (selFunction == "onSave") {
					if (this.isUnAssignResonCode()) {
						msg = _oResourceBundle.getText("SAVE_REASONCODE_MSG", [selCols.length, this._getSelectedPPVSum().toString(), selCurr]);
					} else {
						msg = _oResourceBundle.getText("SAVE_UNASSIGN_REASONCODE_MSG", [selCols.length, this._getSelectedPPVSum().toString(), selCurr]);
					}
					sap.ui.getCore().byId("dialogMsg").setText(msg);
					busyDialog.close();
				} else if (selFunction == "onRevenuePost") {
					msg = _oResourceBundle.getText("SAVE_REVENUEPOST_MSG", [selCols.length, this._getSelectedPPVSum().toString(), selCurr]);
					sap.ui.getCore().byId("dialogMsg").setText(msg);
					busyDialog.close();
				} else if (selFunction == "onPublishToSap") {
					msg = _oResourceBundle.getText("PUBLISH_MSG1", [selCols.length, this._getSelectedPPVSum().toString(), selCurr]);
					var msg1 = _oResourceBundle.getText("PUBLISH_MSG2");
					var skippedItems = this._getSkippedLineItem();
					if (skippedItems == "All") {
						msg1 = _oResourceBundle.getText("NOITEM_TO_PUBLISH_MSG");
						sap.ui.getCore().byId("dialogMsg1").setText(msg1);
						sap.ui.getCore().byId("actionInfo").setText("");
					} else if (skippedItems != "") {
						sap.ui.getCore().byId("dialogMsg").setText(msg);
						sap.ui.getCore().byId("dialogMsg1").setText(msg1);
						sap.ui.getCore().byId("dialogMsg2").setText(_oResourceBundle.getText("NOT_ALLOWED_TO_PUBLISH_MSG", [skippedItems]));
					} else {
						sap.ui.getCore().byId("dialogMsg").setText(msg);
						sap.ui.getCore().byId("dialogMsg1").setText(msg1);
					}
					busyDialog.close();
				}
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},

		//

		//	You are about to submit 60 records to SAP with a total PPV of $52,549.00.

		//	This cannot be undone. Submit records now?
		onRevenuePost: function() {
			try {
				//Google Analytics
				ga('send', 'pageview', 'RevenuePosting', "CC:" + sap.ui.getCore().byId("selectCompany").mProperties.selectedKey);
				if (_oDetailTable._oSelection.aSelectedIndices.length == 0) {
					busyDialog.close();
					informationMessage(_oResourceBundle.getText("NOITEM_SELECTED"));
				} else {
					if(isValidForRevenuePosting()){
							this.openConfirmationDialog("onRevenuePost");
					}else{
						informationMessage(_oResourceBundle.getText("REVENUE_INVALID_RECORDS"));
					}
				
				}
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},
		/** Function : onSave
		 * input >> 
		 * output <<  
		 *	1. Save all record which is having 
		 *		- Reason Code & Not yet Posted
		 *   
		 */
		onSave: function() {
			try {
				//Google Analytics
				ga('send', 'pageview', 'Save_PPVDetails', "CC:" + sap.ui.getCore().byId("selectCompany").mProperties.selectedKey);

				if (_oDetailTable._oSelection.aSelectedIndices.length == 0) {
					busyDialog.close();
					informationMessage(_oResourceBundle.getText("NOITEM_SELECTED"));
				} else {
					if(isRecordsValidForSave()){
						this.openConfirmationDialog("onSave");
					}else{
						informationMessage(_oResourceBundle.getText("RC_INVALID_RECORDS")); 
					}
				}
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},
		/** Function : _saveReasonCode
		 * input >> 
		 * output <<  
		 */
		_saveReasonCode: function() {
			try {
				busyDialog.open();
				var toSaveRc = this._getReasonCodeRecordToUpdate();
				if (toSaveRc.NavToSaveRc.length > 0) {
					executeUpdateECC(toSaveRc, _dtlView, "SAVE",true);
				} else {
					busyDialog.close();
					informationMessage(_oResourceBundle.getText("NO_RECORD_TO_SAVE_MSG"));
				}
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},
		/** Function : _doRevenuePost
		 * input >> 
		 * output <<  
		 */
		_doRevenuePost: function() {
			try {
				busyDialog.open();
				var toSaveRc = this._getRevenuePostRecordToUpdate();
				if (toSaveRc.NavToSaveRc.length > 0) {
					executeUpdateECC(toSaveRc, _dtlView, "SAVE");
				} else {
					busyDialog.close();
					informationMessage(_oResourceBundle.getText("NO_RECORD_TO_SAVE_MSG"));
				}
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},

		/** Function : _getSkippedLineItem
		 * input >> 
		 * output <<  
		 */
		_getSkippedLineItem: function() {
			try {
				var skippedNum = 0;
				var selCols = _oDetailTable._oSelection.aSelectedIndices;
				var tableData = _oDetailTableModel.oData.tableData;
				var skippedItems = "";
				for (var i = 0; i < selCols.length; i++) {
					var selIndex = _oDetailTable.getContextByIndex(selCols[i]).sPath.split("/")[2];
					if (tableData[selIndex].Status.indexOf("S") != 0 && tableData[selIndex].Status.indexOf("R") != 0 && tableData[selIndex].Status.indexOf("N") != 0) {
						if (!isValidRecordForPosting(tableData[selIndex].Reasoncode)) {
							skippedNum++;
							skippedItems += tableData[selIndex].Belnr + ',';
						}
					}
				}
				if (skippedNum < selCols.length) {
					return skippedItems;
				} else {
					return "All";
				}
			} catch (e) {
				handleException(e);
			}
		},
		/** Function : _getSelectedPPVSum
		 * input >> 
		 * output <<  
		 *	1. get Total PPV sum of selected records   
		 */
		_getSelectedPPVSum: function() {
			try {
				var selCols = _oDetailTable._oSelection.aSelectedIndices;
				var tableData = _oDetailTableModel.oData.tableData;
				var totalPPVSum = 0;
				// Validate the records with table model to confirm reason codes are saved.
				for (var i = 0; i < selCols.length; i++) {
					var selIndex = _oDetailTable.getContextByIndex(selCols[i]).sPath.split("/")[2];
					//if ((tableData[selIndex].Status.indexOf("S") != 0 || isRevenuePostActive) && tableData[selIndex].Status.indexOf("R") != 0 && tableData[selIndex].Status.indexOf("N") != 0) {
					if ((tableData[selIndex].Status.indexOf("S") != 0 || isRevenuePostActive) && tableData[selIndex].Status.indexOf("N") != 0) {
						if (selectedCurr == "Grp")
							totalPPVSum += parseFloat(tableData[selIndex].TOTAL_GRP);
						else
							totalPPVSum += parseFloat(tableData[selIndex].TOTAL_LCL);

					}
				}
				return formatToTwoDecimal(totalPPVSum);
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},

		/** Function : _getDeltaPostRecordsToUpdate
		 * input >> 
		 * output <<    
		 *	1. Get records and prepare for service
		 *   
		 */
		_getDeltaPostRecordsToUpdate: function() {
			try {
				var selCols = _oDetailTable._oSelection.aSelectedIndices;
				var tableData = _oDetailTableModel.oData.tableData;
				var navToSaveRc = [];
				var toSaveRc = [];
				var selRecord;
				var isValid = true;
				// Get selected columns
				// Validate the records with table model to confirm reason codes are saved.
				for (var i = 0; i < selCols.length; i++) {
					var selIndex = _oDetailTable.getContextByIndex(selCols[i]).sPath.split("/")[2];
					if (tableData[selIndex].Status.indexOf("S") != 0 && tableData[selIndex].Status.indexOf("RS") != 0 && tableData[selIndex].Status.indexOf("N") != 0) {
						if (isValidRecordForPosting(tableData[selIndex].Reasoncode)) {
							selRecord = ({
								"Bukrs": tableData[selIndex].Bukrs,
								"Belnr": tableData[selIndex].Belnr,
								"Gjahr": tableData[selIndex].Gjahr,
								"Buzei": tableData[selIndex].Buzei,
								"Monat": tableData[selIndex].Monat,
								"Budat": tableData[selIndex].budat,
								"Plant": tableData[selIndex].Werks,
								"Matnr": tableData[selIndex].Matnr,
								"Prctr": tableData[selIndex].Prctr,
								"PpvamtLc": tableData[selIndex].TOTAL_LCL.toString(),
								"PpvamtGrp": tableData[selIndex].TOTAL_GRP.toString(),
								"Reasoncode": tableData[selIndex].Reasoncode
							});
							navToSaveRc.push(selRecord);
						}
					}
				}
				if(navToSaveRc.length>0){
					var navToSaveRcTmp = navToSaveRc.sort(function(a, b) {
						    return parseFloat(a.Reasoncode) - parseFloat(b.Reasoncode);
						});
					navToSaveRc = [];
					var reasonCode = navToSaveRcTmp[0].Reasoncode;
					for (var i = 0; i < navToSaveRcTmp.length; i++) {
						if(navToSaveRcTmp[i].Reasoncode == reasonCode){
							navToSaveRc.push(navToSaveRcTmp[i]);
						}else{
							reasonCode = navToSaveRcTmp[i].Reasoncode;
							var	toSaveRc = {
								"Action": "P",
								"NavToSaveRc": navToSaveRc
							};
							executeUpdateECC(toSaveRc, _dtlView, "POST",true);
							navToSaveRc = [];
							navToSaveRc.push(navToSaveRcTmp[i]);
						}
					}	
					
					var	toSaveRc = {
								"Action": "P",
								"NavToSaveRc": navToSaveRc
							};
					executeUpdateECC(toSaveRc, _dtlView, "POST",false);
					navToSaveRc = [];
			
				//	return toSaveRc;
				} else {
					busyDialog.close();
					informationMessage(_oResourceBundle.getText("NO_RECORD_TO_PUBLISH_MSG"));
					//return null;
				}
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},

		/** Function : _getReasonCodeRecordToUpdate
		 * input >> 
		 * output <<  
		 *	1. Get new records with reason code & not posted
		 *   
		 */
		_getReasonCodeRecordToUpdate: function() {
			try {
				var tableData = _oDetailTableModel.oData.tableData;
				var navToSaveRc = [];
				var toSaveRc = [];
				var comment;
				var reasoncode;
				var selCols = _oDetailTable._oSelection.aSelectedIndices;
				for (var i = 0; i < selCols.length; i++) {
					var selIndex = _oDetailTable.getContextByIndex(selCols[i]).sPath.split("/")[2];
					if (tableData[selIndex].Status.indexOf("S") != 0 && tableData[selIndex].Status.indexOf("RS") != 0 && tableData[selIndex].Status.indexOf("N") != 0) {
						comment = tableData[selIndex].Comments;
						reasoncode = tableData[selIndex].Reasoncode;
						if (comment == "") {
							comment = " ";
						}
						if (reasoncode == "") {
							reasoncode = " ";
						}
						navToSaveRc.push({
							"Bukrs": tableData[selIndex].Bukrs,
							"Belnr": tableData[selIndex].Belnr,
							"Gjahr": tableData[selIndex].Gjahr,
							"Buzei": tableData[selIndex].Buzei,
							"Monat": tableData[selIndex].Monat,
							"Budat": tableData[selIndex].budat,
							"Plant": tableData[selIndex].Werks,
							"Matnr": tableData[selIndex].Matnr,
							"Prctr": tableData[selIndex].Prctr,
							"PpvamtLc": tableData[selIndex].TOTAL_LCL.toString(),
							"PpvamtGrp": tableData[selIndex].TOTAL_GRP.toString(),
							"Reasoncode": reasoncode,
							"Comments": comment
						});
					}
				}
				toSaveRc = {
					"Action": "R",
					"NavToSaveRc": navToSaveRc
				};
				return toSaveRc;
			} catch (e) {
				handleException(e);
			}
		},

		/** Function : _getRevenuePostRecordToUpdate
		 * input >> 
		 * output <<  
		 *	1. Get new records with reason code & not posted
		 *   
		 */
		_getRevenuePostRecordToUpdate: function() {
			try {
				var tableData = _oDetailTableModel.oData.tableData;
				var navToSaveRc = [];
				var toSaveRc = [];
				var comment;
				var reasoncode;
				var selCols = _oDetailTable._oSelection.aSelectedIndices;
				for (var i = 0; i < selCols.length; i++) {
					var selIndex = _oDetailTable.getContextByIndex(selCols[i]).sPath.split("/")[2];
					if (tableData[selIndex].Status.indexOf("RS") != 0 && tableData[selIndex].Status.indexOf("R") != 0 && tableData[selIndex].Status.indexOf("N") != 0) {
						comment = tableData[selIndex].Comments;
						reasoncode = tableData[selIndex].Reasoncode;
						if (comment == "") {
							comment = " ";
						}
						if (reasoncode == "") {
							reasoncode = " ";
						}
						navToSaveRc.push({
							"Bukrs": tableData[selIndex].Bukrs,
							"Belnr": tableData[selIndex].Belnr,
							"Gjahr": tableData[selIndex].Gjahr,
							"Buzei": tableData[selIndex].Buzei,
							"Monat": tableData[selIndex].Monat,
							"Budat": tableData[selIndex].budat,
							"Plant": tableData[selIndex].Werks,
							"Matnr": tableData[selIndex].Matnr,
							"Prctr": tableData[selIndex].Prctr,
							"PpvamtLc": tableData[selIndex].TOTAL_LCL.toString(),
							"PpvamtGrp": tableData[selIndex].TOTAL_GRP.toString(),
							"Reasoncode": reasoncode,
							"Comments": comment
						});
					}
				}
				toSaveRc = {
					"Action": "A",
					"NavToSaveRc": navToSaveRc
				};
				return toSaveRc;
			} catch (e) {
				handleException(e);
			}
		},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 */
		onAfterRendering: function() {
			try {
				if (viewFlag != "D") {
					busyDialog.open();
					viewFlag = "D";
					if (sapClient != undefined){
						executeTableModel(_dtlView, true);}
					if(typeof _oDetailTable !== 'undefined'){
						_dtlView.byId("resetTableBtn").firePress();
					}
					if(groupModification){
								additionalReset();
							}
				}
			} catch (e) {
				handleException(e);
			}
		},
		/** Function : onFxShowSwitch 
		 * input >> oEvent
		 * output <<  
		 *	1. Show/Hode Fx Column
		 */
		onFxShowSwitch: function(oEvent) {
			try {
				_dtlView.byId("Fxval").setVisible(oEvent.getParameter("state"));
				_oDetailTable.invalidate();
			} catch (e) {
				handleException(e);
			}
		},

		/** Function : onSwitchCurr 
		 * input >> state
		 * output <<  
		 *	1. Get the state
		 *	2. set the currency as per selection 
		 */
		onSwitchCurr: function(state) {
			try {
				busyDialog.open();
				var curr = state ? "Grp" : "Lc";
				selectedCurr = curr;
				onCurrencyChange(curr, _dtlView);
				if (_oDetailTable.getGroupBy() != null) {
					changeGroupHeader(_dtlView);
				}
				_oDetailTable.invalidate();
				busyDialog.close();
			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		},

		/** Function : onSubmit  >> When user hit main view's submit button
		 * input >> 
		 * output <<  
		 *	1. 
		 *	2.  
		 */
		onSubmit: function(selParameter) {
			try {
				if (sapClient != undefined) {
					if (sap.ui.getCore().getModel("rcModel") == undefined) {
						loadRCModel(_dtlView);
					}
					executeTableModel(_dtlView, true);
				}
			} catch (e) {
				handleException(e);
			}
		},
		/** Function : onSubmit  >> When user hit main view's submit button
		 * input >> 
		 * output <<  
		 *	1. 
		 *	2.  
		 */
		onRefresh: function() {
			try {
				executeTableModel(_dtlView, false);
			} catch (e) {
				handleException(e);
			}
		},

		/** Function : _handleGrouping 
		 * input >> sPath1,sPath2,bDescending
		 * output <<  
		 *	1. Maintain the sorting along with grouping
		 *	2. Get the group sum after grouping
		 */
		_handleGrouping: function(sPath1, sPath2, bDescending) {
	
			try {
				var oFilter = _oDetailTable.mBindingInfos.rows.binding.aApplicationFilters;	
				if (oFilter.length > 0) {
					var oCombinedFilter = new sap.ui.model.Filter(oFilter);
					_oDetailTable.getBinding("rows").filter(oCombinedFilter, sap.ui.model.FilterType.Application);
				}
				_oDetailTable.addEventDelegate({
					onAfterRendering: function() {
						busyDialog.open();
						var tableDelegates = _oDetailTable.aDelegates;
						if (tableDelegates.length > 0) {
							calculateGroupSum(_oDetailTable.getGroupBy().split("--")[1], _dtlView);
							for (var i = 0; i < tableDelegates.length; i++) {
								if (_oDetailTable.aDelegates[i].vThis == "toGrpItemCalc") {
									_oDetailTable.aDelegates.splice(i, 1);
									break;
								}
							}
						}
						//To rearrange sort order after group calculation
						groupSortBugFix();
						//groupCollapse();
						busyDialog.close();
					}
				}, "toGrpItemCalc");

				_oDetailTableModel.refresh();
				busyDialog.close();
				_dtlView.byId("showGroupInfo").setVisible(true);
			} catch (e) {
				handleException(e);
			}

		},

		//export full CC data
		onDataExport: function(oEvent) {

			oDetailMultiDialog = sap.ui.xmlfragment("com.jabil.fi.fragment.InputName", this);
			oDetailMultiDialog.setBusy(true);
			this.getView().addDependent(oDetailMultiDialog);
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), oDetailMultiDialog);
			oDetailMultiDialog.open();
			oDetailMultiDialog.setModel("");
			oDetailMultiDialog.setBusy(false);

		},
		/** Function : onDataExport  
		 * input >> 
		 * output <<  
		 *	1. 
		 *	2.  
		 */
		handleExcelSave: sap.m.Table.prototype.exportData || function(oEvent) {
			try {
				busyDialog.open();
				informationMessage(_oResourceBundle.getText("EXCEL_DOWNLOAD_MSG"));

				var fileName = sap.ui.getCore().byId("fname").getValue();
				oDetailMultiDialog.close();
				oDetailMultiDialog.destroy();

				var recordIndex = [];
				var tableData = _oDetailTableModel.oData.tableData;
				$.each(tableData, function(idx, item) {
					if (item.Comments == "X") {
						recordIndex.push(idx);
					}
				});
				oExport = exportToCSV();
				if (recordIndex.length > 0) {
					for (var i = 0; i < recordIndex.length; i++) {
						var input = "";
						input += "Buzei='" + tableData[recordIndex[i]].Buzei + "',";
						input += "Gjahr='" + tableData[recordIndex[i]].Gjahr + "',";
						input += "Belnr='" + tableData[recordIndex[i]].Belnr + "',";
						input += "Bukrs='" + tableData[recordIndex[i]].Bukrs + "',";
						input += "Status='C'";
						if (i == recordIndex.length - 1) {
							getStatusForExcel(input, recordIndex[i], true, oExport);
						} else {
							getStatusForExcel(input, recordIndex[i], false, null);
						}
					}
				} else {
					oExport.saveFile(getFileName(fileName)).always(function() {
						this.destroy();
						informationMessage(_oResourceBundle.getText("DOWNLOAD_COMPLEATE"));
						busyDialog.close();
					});
				}

			} catch (e) {
				busyDialog.close();
				handleException(e);
			}
		}
	});