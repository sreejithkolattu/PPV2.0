jQuery.sap.require("com.jabil.fi.util.util");
jQuery.sap.require("com.jabil.fi.util.Global");
jQuery.sap.require("com.jabil.fi.util.jquery-dateFormat");

sap.ui.controller("com.jabil.fi.view.Main", {
	onInit: function() {
		try{
			busyDialog = new sap.m.BusyDialog();
			if(_oResourceBundle===undefined &&sap.ui.getCore().getModel("i18n")!=undefined){
				_oResourceBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();}
			if (sap.ui.Device.support.touch === false) {
				this.getView().addStyleClass("sapUiSizeCompact");
			}
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
			this._oRouter = this._oComponent.getRouter();
			this.initDialogFilter();
			this.selectedPCs = "";
			_oDialog = createPCDialog(this);//sap.ui.xmlfragment("com.jabil.fi.fragment.PCMultiSelect", this);
			var that = this;
			
			getSavedSelectionData();
			//load period 
			this.setPeriodData();
			// Set initial values
			this._dialogFilter.open();
			$('.dialogFilterBox').find('span.sapUiHiddenPlaceholder').each(function (index){
				var thisId = $(this).attr('id');
				sap.ui.getCore().byId(thisId.substring(thisId.lastIndexOf("-")+1)).setVisible(true).addStyleClass("filterLabel");
			});
		}catch(ex){handleException(ex);}

	},
	onAfterRendering: function(){
		//load user info and company code info
		try{
			loadUserModel(this.getView());
		}catch(ex){handleException(ex);}
	},
/*	setInputSelection: function(){
		  	this.getView().byId("selectPeriod").setSelectedItem("");
		  	sap.ui.getCore().byId("selectPeriod").setSelectedItem("");
		  	this.getView().byId("fromDate").setSelectedItem("");
		  	sap.ui.getCore().byId("fromDate").setSelectedItem("");
		  	this.getView().byId("toDate").setSelectedItem("");
		  	sap.ui.getCore().byId("toDate").setSelectedItem("");
	},*/
	handlePlantSelection: function(oEvent){
			var plantSelect = this.getView().byId("selectPlant");
			var dialogSelectPlant = sap.ui.getCore().byId("selectPlant");
			plantSelect.setSelectedItem(oEvent.getSource().getSelectedItem());
			dialogSelectPlant.setSelectedItem(oEvent.getSource().getSelectedItem());
		},
	handleCCSelection: function(oEvent){
		try{// To keep initial status after odata service.
			var isInitial = (isInitialLoad)?true:false;
			var selectedCC = oEvent.getSource().getSelectedKey();
			busyDialog.open();
			//check if its Fx CC
			var ccObj = $.grep(oEvent.getSource().getModel().getData().d.results,function(period,idx){
	            return ( period.Bukrs == selectedCC);});
			if(ccObj.length>0){
				isFxCC= ccObj[0].Fxrel == "X" || ccObj[0].Fxrel == "x";
			}
		  	//select the data in main view and dialog
		  	this.getView().byId("selectCompany").setSelectedItem(oEvent.getSource().getSelectedItem());
		  	sap.ui.getCore().byId("selectCompany").setSelectedItem(oEvent.getSource().getSelectedItem());

		  	//getProfit centre for selected company code
		  	var input1 = "('"+selectedCC+"')";
			var pcModel = new sap.ui.model.json.JSONModel(getDataEndPoint("pcModel",input1));
			pcModel.attachRequestCompleted(function(){
					if(pcModel.getData().d==null ){
						handleServiceError(pcModel);
					}else{
					if(pcModel.getData().d.results == null || pcModel.getData().d.results.length==0){
						handleNoRecordFound("Profit Center");
					 }else{
						 pcModel.setSizeLimit(pcModel.getData().d.results.length);
					 }
			    	_oDialog.setModel(pcModel);
			    	sap.ui.getCore().byId("pcToolbarText").setText("(0/"+pcModel.getData().d.results.length+")");
			    	// clear the old search filter

					sap.ui.getCore().byId("pcList").getBinding("items").filter([]);
					sap.ui.getCore().byId("pcListFilter").setValue("");
					sap.ui.getCore().byId("selAll").setSelected(false);
					sap.ui.getCore().byId("showSel").setSelected(false);
					sap.ui.getCore().byId("pcList").removeSelections();
					selectedPCs="";
					
					if(isInitial){
					selectionData =  sap.ui.getCore().getModel("selectionData");
					if(selectionData.vSelectedPCs.length>0){
						sap.ui.getCore().byId("pcList")._aSelectedPaths = selectionData.vSelectedPCs;
						for(var i=0;i<selectionData.vSelectedPCs.length;i++){
							itemIndex = selectionData.vSelectedPCs[i].split("results/");
							sap.ui.getCore().byId("pcList").getItems()[itemIndex[1]].mProperties.selected = true
						}
					}
					}
					busyDialog.close();
					}
			});
			pcModel.attachRequestFailed(function(oEvent){				
				handleRequestFailed("pcModel",getErrorText(oEvent));
				});
				
				//getPlant for selected company code
			var _view = this.getView();
		 	var inputPlant = "Bukrs eq "+"('"+selectedCC+"')";
		  	var plantModel = new sap.ui.model.json.JSONModel(getDataEndPoint("plantModel",inputPlant));
		  	plantModel.attachRequestCompleted(function(){
		  		if(plantModel.getData().d==null ){
						handleServiceError(plantModel);
				}else{
					if(plantModel.getData().d.results == null || plantModel.getData().d.results.length==0){
						handleNoRecordFound("Plant");
					 }else{
					 	var plantSelect = _view.byId("selectPlant");
					 	var dialogSelectPlant = sap.ui.getCore().byId("selectPlant");
						 plantModel.setSizeLimit(plantModel.getData().d.results.length);
						 plantSelect.setModel(plantModel);
						 dialogSelectPlant.setModel(plantModel);
						 if(isInitial){
							plantSelect.setSelectedItem(plantSelect.getItemByKey(sap.ui.getCore().getModel("selectionData").selectedPlant));
							dialogSelectPlant.setSelectedItem(plantSelect.getItemByKey(sap.ui.getCore().getModel("selectionData").selectedPlant));
							isInitialLoad =false;
						 }else{
							plantSelect.setSelectedItem(plantSelect.getFirstItem());
							dialogSelectPlant.setSelectedItem(plantSelect.getFirstItem());
						 }
					 }
				}
		  	});
			plantModel.attachRequestFailed(function(oEvent){				
				handleRequestFailed("plantModel",getErrorText(oEvent));
				});	
				
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), _oDialog);
		}catch(ex){handleException(ex);}

	},
	onUserMenuPress: function (oEvent) {
		/*try{
		 	var oButton = oEvent.getSource();
	
				// create menu only once
				if (!this._menu) {
					this._menu = sap.ui.xmlfragment(
						"com.jabil.fi.fragment.UserMenu",
						this
					);
					this.getView().addDependent(this._menu);
				}
	
				var eDock = sap.ui.core.Popup.Dock;
				this._menu.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
		}catch(ex){handleException(ex);}*/
	},
	setPeriodData: function() {
		try{
			var periodData = [];
			var today = new Date();
			 
			for(var i=0;i<12;i++){
				var firstOfThisMonth = new Date(today.getFullYear(),today.getMonth()-i);
				var firstofNextMonth = new Date(today.getFullYear(),today.getMonth()-i+1);
				var lastofThisMonth= new Date(firstofNextMonth.setDate(firstofNextMonth.getDate()-1));
				var fyM;var fy;
	            if(firstOfThisMonth.getMonth()< 8 ) { 
	               fyM = firstOfThisMonth.getMonth()+5;
	               fyM = fyM <10? "0"+ fyM: fyM; 
	              fy=firstOfThisMonth.getFullYear();
	            } else { 
	               fyM = firstOfThisMonth.getMonth()-7;
	               fyM = fyM <10? "0"+ fyM: fyM; 
	               fy=(firstOfThisMonth.getFullYear() + 1);
	            } 
	              var key =fyM+"-"+fy;
				periodData.push({key:key,firstDay:firstOfThisMonth, lastDay:lastofThisMonth, month:fyM, year: fy, period: $.format.date(firstOfThisMonth,"MMM, yyyy") });
			}	
			if(isInitialLoad){
			 	selectionData =  sap.ui.getCore().getModel("selectionData");
			    var currPeriodData = searchPeriod(selectionData.selectPeriod.Key ,periodData)
			 }else{
			 	var currPeriodData = periodData[0];
			 }
			var periodModel = new sap.ui.model.json.JSONModel(periodData);
			//set date range in view
			var periodSelect = this.getView().byId('selectPeriod');
			if(periodSelect !=null){
				periodSelect.setModel(periodModel);
				if(isInitialLoad){
					periodSelect.setSelectedItem(periodSelect.getItemByKey(selectionData.selectPeriod.Key));
				}else{
					periodSelect.setSelectedItem(periodSelect.getFirstItem());
				}
			}
			this.getView().byId("fromDate").setDateValue(currPeriodData.firstDay);
			this.getView().byId("toDate").setDateValue(currPeriodData.lastDay);
	
			var dialogPeriodSelect = sap.ui.getCore().byId("selectPeriod");
			if(dialogPeriodSelect != null){
				dialogPeriodSelect.setModel(periodModel);
					if(isInitialLoad){
					dialogPeriodSelect.setSelectedItem(periodSelect.getItemByKey(selectionData.selectPeriod.Key));
				}else{
					dialogPeriodSelect.setSelectedItem(dialogPeriodSelect.getFirstItem());
				}
			}
			//set date range and select items on dialog box
			sap.ui.getCore().byId("fromDate").setDateValue(currPeriodData.firstDay);
			sap.ui.getCore().byId("toDate").setDateValue(currPeriodData.lastDay);
		}catch(ex){handleException(ex);}

	},
	//set date range to first and last of month when period is selected
	setDateRange: function(oEvent){
		try{
			var periodSelect = oEvent.getSource();
		  	var selectedPeriodKey = periodSelect.getSelectedKey();
		  	//select the data in main view and dialog
		  	this.getView().byId("selectPeriod").setSelectedItem(periodSelect.getSelectedItem());
		  	sap.ui.getCore().byId("selectPeriod").setSelectedItem(periodSelect.getSelectedItem());
		  	
			var selectedPeriod = $.grep(periodSelect.getModel().getData(),function(period,idx){
	            return ( period.key == selectedPeriodKey);});
		  	//set the date range on 
			sap.ui.getCore().byId("fromDate").setDateValue(selectedPeriod[0].firstDay);
			sap.ui.getCore().byId("toDate").setDateValue(selectedPeriod[0].lastDay);
			//set the date on main view
			 this.getView().byId('fromDate').setDateValue(selectedPeriod[0].firstDay);
			 this.getView().byId('toDate').setDateValue(selectedPeriod[0].lastDay);
		}catch(ex){handleException(ex);}
	},
	handleFromDateChange: function(oEvent){
		try{
			sap.ui.getCore().byId("fromDate").setDateValue(oEvent.getSource().getDateValue());
			//set the date on main view
			this.getView().byId('fromDate').setDateValue(oEvent.getSource().getDateValue());
		}catch(ex){handleException(ex);}

	},
	handleToDateChange: function(oEvent){
		try{
			sap.ui.getCore().byId("toDate").setDateValue(oEvent.getSource().getDateValue());
			//set the date on main view
			this.getView().byId('toDate').setDateValue(oEvent.getSource().getDateValue());
		}catch(ex){handleException(ex);}
	},
	getSelectedCompany:function(){
		try{
			var selectedItem = this.getView().byId('selectCompany').getSelectedItem();
			return selectedItem.getText();
		}catch(ex){handleException(ex);}
	},
	getSelectedProfitCenter: function(){
		try{
			return this.selectedPCs;
		}catch(ex){handleException(ex);}
	},
	onFilterSubmit: function(oEvent){
		try{
			if(validateDashboardInputs(this.getView())){
				var btn = oEvent.getSource();
				if(btn.data('isFromDialog')){
					this._dialogFilter.close();
				}
				var currView = this.getView().byId('fioriContent').getContent()[0];
				switch(getCurrentViewName(currView)){
					case masterViewName: currView.getController().onSubmit(); break;
					case detailsViewName: currView.getController().onSubmit(); break;
				}
				// Save selection data
				saveSelectionData();
			}
		}catch(ex){handleException(ex);}
	},
	onCurrencySwitch: function(oEvent){
		try{
			var currView = this.getView().byId('fioriContent').getContent()[0];
			switch(getCurrentViewName(currView)){
				case masterViewName: currView.getController().onSwitchCurr(oEvent.getSource().getState()); break;
				case detailsViewName: currView.getController().onSwitchCurr(oEvent.getSource().getState()); break;
			}
		}catch(ex){handleException(ex);}
	},
	initDialogFilter: function(){
		try{
			if (!this._dialogFilter) {
					this._dialogFilter = sap.ui.xmlfragment(
						"com.jabil.fi.fragment.MainDialogFilter",
						this
					);
					// sap.ui.getCore().byId("dateSeparator").setVisible(false);
			}
		}catch(ex){handleException(ex);}
	},
	showDialogFilter:function(){
		try{
			this.initDialogFilter();
			this._dialogFilter.open();
		}catch(ex){handleException(ex);}
	},
	closeDialog:function(oEvent){
		try{
			this._dialogFilter.close();
		}catch(ex){handleException(ex);}
	},
	showProfitCenters: function (oEvent) {
		try{
			_oDialog.open();
		}catch(ex){handleException(ex);}
	},
	
	handleSearch: function(oEvent) {
		try{
			var pcList =sap.ui.getCore().byId("pcList");
			var sValue = oEvent.getParameter("newValue");
			if(sValue!=null){
				var oFilter = new sap.ui.model.Filter("Prctr", sap.ui.model.FilterOperator.Contains, sValue);
				var oBinding = pcList.getBinding("items");
				sValue.length>0?oBinding.filter([oFilter]):oBinding.filter([]);
			}
	    	sap.ui.getCore().byId("pcToolbarText").setText("("+pcList.getSelectedItems().length+"/"+pcList.getModel().getData().d.results.length+")")
		}catch(ex){handleException(ex);}
	},
	handleConfirm: function(oEvent){
		try{
			var pcList =sap.ui.getCore().byId("pcList");
			pcList.getBinding("items").filter([]);
			var selectedItems = pcList.getSelectedItems();//oEvent.getParameter("selectedItems");
			var oController = this;
			selectedPCs = '';
			$.each(selectedItems, function(idx,item){
				selectedPCs += (selectedPCs.length > 0? ',': '');
				selectedPCs += item.getTitle();
			});
			//var aContexts = oEvent.getParameter("selectedContexts");
			pcList.getBinding("items").filter([]);
			_oDialog.close();
		}catch(ex){handleException(ex);}
	},
	handleClose: function(oEvent) {
		try{
			var pcList =sap.ui.getCore().byId("pcList");
			//var aContexts = oEvent.getParameter("selectedContexts");
			pcList.getBinding("items").filter([]);
			_oDialog.close();
		}catch(ex){handleException(ex);}
	},
	handleSelectAll: function(oEvent){
		try{
			var pcList =sap.ui.getCore().byId("pcList");
			if(oEvent.getSource().getSelected()){
				pcList.selectAll();
			}else{
				pcList.removeSelections();
			}
	    	sap.ui.getCore().byId("pcToolbarText").setText("("+pcList.getSelectedItems().length+"/"+pcList.getModel().getData().d.results.length+")")
		}catch(ex){handleException(ex);}

	},
	handleClearSelection: function(oEvent){
		try{
			var pcList =sap.ui.getCore().byId("pcList");
			sap.ui.getCore().byId("selAll").setSelected(false);
			sap.ui.getCore().byId("showSel").setSelected(false);
			pcList.removeSelections();
	    	sap.ui.getCore().byId("pcToolbarText").setText("(0/"+pcList.getModel().getData().d.results.length+")")
		}catch(ex){handleException(ex);}
	},
	handleListItemSelected: function(oEvent){
		try{
			var pcList =sap.ui.getCore().byId("pcList");
	    	sap.ui.getCore().byId("pcToolbarText").setText("("+pcList.getSelectedItems().length+"/"+pcList.getModel().getData().d.results.length+")")
		}catch(ex){handleException(ex);}
	},
	handleShowSelected: function(oEvent){
		try{
			var pcList =sap.ui.getCore().byId("pcList");
			if(oEvent.getSource().getSelected()){
				var filters=[];
				$.each(pcList.getSelectedItems(),function(id,item){
					filters.push(new sap.ui.model.Filter("Prctr", sap.ui.model.FilterOperator.EQ, item.getTitle()));
				});
				pcList.getBinding("items").filter(filters);
			}else{
				pcList.getBinding("items").filter([]);
				sap.ui.getCore().byId("pcListFilter").setValue("");
			}
	    	sap.ui.getCore().byId("pcToolbarText").setText("("+pcList.getSelectedItems().length+"/"+pcList.getModel().getData().d.results.length+")")

		}catch(ex){handleException(ex);}
	},
	goHome: function(){
		try{ 
		if(window.location != ""){
			this._oRouter.navTo("main", {
            	from: "details"
       		});
		}
		}catch(ex){handleException(ex);}
	}
});