jQuery.sap.require("sap.ui.core.mvc.Controller");
jQuery.sap.require("com.jabil.fi.lib.highcharts.highcharts");
jQuery.sap.require("com.jabil.fi.lib.highcharts.modules.no-data-to-display");
jQuery.sap.require("com.jabil.fi.lib.highcharts.modules.heatmap");
jQuery.sap.require("com.jabil.fi.lib.highcharts.modules.treemap");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
jQuery.sap.require("com.jabil.fi.util.detailUtil");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");

sap.ui.core.mvc.Controller.extend("com.jabil.fi.view.Master", {
	_oCatalog: null,
 _oResourceBundle: null,

	onInit: function() {
		try{
			this._oView = this.getView();
			if(_oResourceBundle==undefined &&sap.ui.getCore().getModel("i18n")!=undefined)
				_oResourceBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
			switchCurrOnTable(this._oView.byId("ppvCategory"),selectedCurr);
			switchCurrOnTable(this._oView.byId("ppvFavorable"),selectedCurr);
			switchCurrOnTable(this._oView.byId("ppvReasonCode"),selectedCurr);
			switchCurrOnTable(this._oView.byId("ppvUnfavorable"),selectedCurr);
		}catch(ex){handleException(ex);}

	},
	onSwitchCurr: function(state){
		try{
			busyDialog.open();
			selectedCurr = state?"Grp":"Lc";
			var view = this._oView;
			switchCurrOnTable(view.byId("ppvCategory"),selectedCurr);
			switchCurrOnTable(view.byId("ppvFavorable"),selectedCurr);
			switchCurrOnTable(view.byId("ppvReasonCode"),selectedCurr);
			switchCurrOnTable(view.byId("ppvUnfavorable"),selectedCurr);
			this.setHeatMapData(selectedCurr);
		//	this._setFooter(view);
			//sort fav unfav
			var mainResults = this.chModel.getData().d.results[0];
	        var formatter = sap.ui.core.format.NumberFormat.getFloatInstance({maxFractionDigits: 2,groupingEnabled: true,groupingSeparator: ",", decimalSeparator: "."});  
			if(selectedCurr == "Grp"){
				mainResults.NavSelToUnFav.results.sort(function (a, b) {  return formatter.parse(b.AmtGrp)-formatter.parse(a.AmtGrp);});
				mainResults.NavSelToFav.results.sort(function (a, b) {return formatter.parse(a.AmtGrp)-formatter.parse(b.AmtGrp);});
				var totalPPV=0;
				$.each(mainResults.NavSelToHmap.results,function(i,obj){totalPPV+=formatter.parse(obj.AmtGrp);});
				view.byId("totalPPV").setText(formatter.format(totalPPV)+" "+grpCurr);
			}else{
				mainResults.NavSelToUnFav.results.sort(function (a, b) {  return formatter.parse(b.AmtLc)-formatter.parse(a.AmtLc);});
				mainResults.NavSelToFav.results.sort(function (a, b) {return formatter.parse(a.AmtLc)-formatter.parse(b.AmtLc);});
				var totalPPV=0;
				$.each(mainResults.NavSelToHmap.results,function(i,obj){totalPPV+=formatter.parse(obj.AmtLc);});
				view.byId("totalPPV").setText(formatter.format(totalPPV)+" "+mainResults.Curr);
			}
	 		this.chModel.updateBindings(true);
			busyDialog.close();
		}catch(ex){handleException(ex);}
	},
	onSubmit: function(){
		try{
			var view = this._oView; 
			busyDialog.open();
			var sapChartId = this._oView.byId("heatMap").getId();
			var chart = $('#'+sapChartId).highcharts();
			if(chart){
				chart.destroy();
			}
			var that = this;
			//google analytics
			ga('send', 'pageview', 'GetPPVSummary',"CC:"+sap.ui.getCore().byId("selectCompany").mProperties.selectedKey);
	
			this.chModel = new sap.ui.model.json.JSONModel(getDataEndPoint("chartModel",getSelectionInput()));
			this.chModel.attachRequestCompleted(function(){
				// that.pageChanged();
				if(this.getData().d==null ){
					handleServiceError(this);
				}else if(this.getData().d.results == null || this.getData().d.results.length==0){
					handleNoRecordFound("dashboard records");
				}else{
				var mainResults = this.getData().d.results[0];
		        var formatter = sap.ui.core.format.NumberFormat.getFloatInstance({maxFractionDigits: 2,groupingEnabled: true,groupingSeparator: ",", decimalSeparator: "."});//new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2 });  
		        lclCurr = mainResults.Curr; 
				for(var key in mainResults){
				  if(mainResults[key]!=null && mainResults[key].results != null){
					if(mainResults[key].results){
						for(var i=0; i< mainResults[key].results.length; i++){
							mainResults[key].results[i].AmtGrp= formatter.format(mainResults[key].results[i].AmtGrp);
							mainResults[key].results[i].AmtLc= formatter.format(mainResults[key].results[i].AmtLc);
							mainResults[key].results[i].CurrLc = mainResults.Curr;
							mainResults[key].results[i].CurrGrp = grpCurr;
						}
					}
				  } 
				}
				//sort fav and unfav 
				if(selectedCurr == "Grp"){
					mainResults.NavSelToUnFav.results.sort(function (a, b) {  return formatter.parse(b.AmtGrp)-formatter.parse(a.AmtGrp);});
					mainResults.NavSelToFav.results.sort(function (a, b) {  return formatter.parse(a.AmtGrp)-formatter.parse(b.AmtGrp);});
					var totalPPV=0;
					$.each(mainResults.NavSelToHmap.results,function(i,obj){totalPPV+=formatter.parse(obj.AmtGrp);});
					that._oView.byId("totalPPV").setText(formatter.format(totalPPV)+" "+grpCurr);
				}else{
					mainResults.NavSelToUnFav.results.sort(function (a, b) { return formatter.parse(b.AmtLc)-formatter.parse(a.AmtLc);});
					mainResults.NavSelToFav.results.sort(function (a, b) {return formatter.parse(a.AmtLc)-formatter.parse(b.AmtLc);});
					var totalPPV=0;
					$.each(mainResults.NavSelToHmap.results,function(i,obj){totalPPV+=formatter.parse(obj.AmtLc);});
					that._oView.byId("totalPPV").setText(formatter.format(totalPPV)+" "+mainResults.Curr);
				}
				mainResults.NavSelToUnFav.results.length = mainResults.NavSelToUnFav.results.length>10?10:mainResults.NavSelToUnFav.results.length;
				mainResults.NavSelToFav.results.length = mainResults.NavSelToFav.results.length>10?10:mainResults.NavSelToFav.results.length;
				
				//Adding sum info to fav & Unfav
				var totalFavLcl=0;
				var totalFavGrp=0;
				var totalUnfavLcl=0;
				var totalUnfavGrp=0;
				var totalRcLcl=0;
				var totalRcGrp=0;
				$.each(mainResults.NavSelToUnFav.results,function(i,obj){totalUnfavGrp+=formatter.parse(obj.AmtGrp);totalUnfavLcl+=formatter.parse(obj.AmtLc); });
				$.each(mainResults.NavSelToFav.results,function(i,obj){totalFavGrp+=formatter.parse(obj.AmtGrp);totalFavLcl+=formatter.parse(obj.AmtLc);});
				$.each(mainResults.NavSelToRc.results,function(i,obj){totalRcGrp+=formatter.parse(obj.AmtGrp);totalRcLcl+=formatter.parse(obj.AmtLc);});
		
			//	var _totals = {"totalFavLcl":parseFloat(totalFavLcl).toFixed(2),"totalFavGrp":parseFloat(totalFavGrp).toFixed(2),
			//			      "totalUnfavLcl":parseFloat(totalUnfavLcl).toFixed(2),"totalUnfavGrp":parseFloat(totalUnfavGrp).toFixed(2),
			//				  "totalRcLcl":parseFloat(totalRcLcl).toFixed(2),"totalfRcGrp":parseFloat(totalRcGrp).toFixed(2)};
			if(mainResults.NavSelToUnFav.results.length>0)
				mainResults.NavSelToUnFav.results.push({"AmtGrp":formatter.format(totalUnfavGrp),"AmtLc":formatter.format(totalUnfavLcl),"Assigned":"N","CurrGrp":grpCurr,"CurrLc":lclCurr,"Matnr":''});
			if(mainResults.NavSelToFav.results.length>0)
				mainResults.NavSelToFav.results.push({"AmtGrp":formatter.format(totalFavGrp),"AmtLc":formatter.format(totalFavLcl),"Assigned":"N","CurrGrp":grpCurr,"CurrLc":lclCurr,"Matnr":''});
			if(mainResults.NavSelToRc.results.length>0)
				mainResults.NavSelToRc.results.push({"Reasoncode":'',"Descr":"","AmtLc":formatter.format(totalRcLcl),"AmtGrp":formatter.format(totalRcGrp),"CurrGrp":grpCurr,"CurrLc":lclCurr,"POSTED":"N"});
			//	mainResults.Totals=_totals;

				
			
				this.updateBindings(true);
				that.initHeatMap();
				that.setHeatMapData(selectedCurr);
				that._oView.setModel(this);
			//	that._setFooter(that._oView);
				busyDialog.close();
				}
			});
			this.chModel.attachRequestFailed(function(oEvent){
				handleRequestFailed("chModel",getErrorText(oEvent));
				});
		}catch(ex){handleException(ex);}
	},
/*	_setFooter: function(view){
		var Totals = view.getModel().getData().d.results[0].Totals;
		view.byId("ppvFavorable").setFooterText("Total   "+(selectedCurr==="Grp"?(Totals.totalFavGrp+" "+grpCurr):(Totals.totalFavLcl+" "+lclCurr)));
		//view.byId("ppvUnfavorable").setFooterText("Total   "+(selectedCurr==="Grp"?(Totals.totalUnfavGrp+" "+grpCurr):(Totals.totalUnfavLcl+" "+lclCurr)));
		view.byId("ppvReasonCode").setFooterText("Total   "+(selectedCurr==="Grp"?(Totals.totalRcGrp+" "+grpCurr):(Totals.totalRcLcl+" "+lclCurr)));
	}, */

	initHeatMap: function(){
		try{
			var chartDiv = this._oView.byId("heatMap").getId();
			var mainController = this._oView.getParent().getParent().getParent().getController();
			var _subTitle = mainController.getSelectedProfitCenter();
			var _title = mainController.getSelectedCompany();
			var that = this;
			$('#'+chartDiv).highcharts({
				credits: {enabled:false},
		  		colorAxis: {
	            	minColor: '#E42217',
	            	maxColor: '#4E9258'
	        	},
	        	series: [{
	            	type: "treemap",
	            	layoutAlgorithm: 'squarified',
	           	 	data: [],
	           	 	name:  _oResourceBundle.getText("HeatMapSeriesName")
	        	}],
	        	title:{
	        		text: _title
	        	},
	        	subtitle:{
	        		text: _subTitle
	        	},
	        	legend:{
	        		enabled:false
	        	},
	        	tooltip: {
			        formatter: function () {
			            if (typeof this.point.ppvVal != "undefined") {
			               // return 'Profit Center:'+this.point.name+'<br />Total PPV(size): '+ this.point.ppvVal+ '<br />Records Needing Attention: ' + this.point.pendingRC;
			            	 return  _oResourceBundle.getText("HeatMapToolTip",[this.point.name,this.point.ppvVal,this.point.pendingRC]);
			            }
	        		}
	    		},
	    		plotOptions:{
	    			series:{
						events:{
		    				click: function(event){
		    					that.onChartItemPressed("HeatMap",event.point.name);
		    				}
		    			}
	    			}
	    		}
	
		    });
		/*	$('.highcharts-title').click(function(){
				that.onChartItemPressed("HeatMap","All");
		    });*/
		}catch(ex){handleException(ex);}
	},
	setHeatMapData: function(curr){
		try{
	        var formatter = sap.ui.core.format.NumberFormat.getFloatInstance({maxFractionDigits: 2,groupingEnabled: true,groupingSeparator: ",", decimalSeparator: "."});  
			var chartDiv = this._oView.byId("heatMap").getId();
			var chart = $('#'+chartDiv).highcharts();
			if(this.chModel.getData().d.results[0].NavSelToHmap == null || this.chModel.getData().d.results[0].NavSelToHmap.results.length==0){
				handleNoRecordFound("HeatMap records");
			}else{
				var heatMapResults = this.chModel.getData().d.results[0].NavSelToHmap.results;
				var xCategories =[], seriesData = [];
				$.each(heatMapResults,function(idx,ppvCategory){
					var amt=0; var ppvVal;
					if(curr=="Lc") {
						amt=formatter.parse(ppvCategory.AmtLc);
						ppvVal = ppvCategory.AmtLc+" "+ppvCategory.CurrLc;
					}else {
						amt=formatter.parse(ppvCategory.AmtGrp);
						ppvVal = ppvCategory.AmtGrp+" "+ppvCategory.CurrGrp;
					}
					var data = {
			                name: ppvCategory.Prctr,
			                value: amt<0?amt*-1:amt,
			                color: (ppvCategory.Rcpend>0? "#E42217" :"#4E9258"),
				            pendingRC: ppvCategory.Rcpend,
				            ppvVal:ppvVal
				         }; 
					seriesData.push(data);
				}); 
				//normalize the series data
				var maxVal=0;
				$.each(seriesData,function(id,obj){if(obj.value>maxVal)maxVal=obj.value;});
				var minVal = maxVal/10;
				$.each(seriesData,function(id,obj){if(obj.value<minVal)obj.value=minVal;});
				chart.series[0].setData(seriesData);
			}
		}catch(ex){handleException(ex);}
	},
	onChartItemPressed: function(type,typeValue) {
		try{
			var _oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView.getParent().getParent().getParent()));
	        var _oRouter = _oComponent.getRouter();
	        viewFlag = "M";
	        var _entityType;
	        switch(type){
		    	case "ppvFavorable":
				_entityType = "Matnr";
		    	break;
		    	case "ppvUnfavorable":
		    	_entityType = "Matnr";
		    	break;
		    	case "ppvCategory":
		    	_entityType = "Blart";
		    	break;
		    	case "ppvReasonCode":
		    	_entityType = "Reasoncode";
		    	break;
		    	case "HeatMap":
		    	_entityType = "Prctr";
		    	break;
		    	
		    	default: 
		    	_entityType= type;
		    }
	        busyDialog.open();
	        //Google Analtyics
			ga('send', 'pageview', 'ToDetailPage-'+type,_entityType+":"+typeValue);
	        _oRouter.navTo("details", {
	            from: "main",
	            entity: _entityType,
	            value: encodeURIComponent(typeValue)
	        });
		}catch(ex){handleException(ex);}
    },

	/** Function : statusFormater
		* input >> pubStatus
		* output << Status
		*	1. Formatting Publishing Status font color
		*	2. Return status Color
		*/
	statusFormater:function (itemStatus) {
		
       try {
    	   if(itemStatus!=null){
			  if ( itemStatus == "X") {
					return "Success";
			  } else if(itemStatus == "N"){
					return "None";
			 } else {
				return "Error";
			 }	  
    	   }
		   } catch (e) {	
				return "None";
				 handleException(e);
			} 
		
	},
	statusFormaterClass:function (itemStatus) {
       try {
       	return itemStatus == "N"?"statusStylePPVTotal" :"statusStylePPV" ;
		   } catch (e) {	
				return "";
				 handleException(e);
			} 
	},
    onRowClick: function(oEvent){
    	try{
	    	var oSelectedItem = oEvent.getParameter("listItem");
	    	var table = oSelectedItem.getParent();
	    	var tableId = table.data('tableId'),valueField='';
	    	viewFlag = "M";
	    	switch(tableId){
	    		case 'ppvCategory':
					valueField = 'Blart';
					break;
				case 'ppvReasonCode':
					valueField = 'Reasoncode';
					break;
				case 'ppvFavorable':
					valueField = 'Matnr';
					break;
				case 'ppvUnfavorable':
					valueField = 'Matnr';
					break;
	    	}
	    	var sItemName = oSelectedItem.getBindingContext().getProperty(valueField);
	    	if(sItemName!=="" && sItemName!==undefined){
		    	this.onChartItemPressed(tableId,sItemName);
		    	table.removeSelections();
	    	}
    	 }catch(ex){handleException(ex);}
	    },
	    
	     //export full CC data
	    onDataExport: function(oEvent){
	    
	    	oDetailMultiDialog = sap.ui.xmlfragment("com.jabil.fi.fragment.InputName", this);
			oDetailMultiDialog.setBusy(true);
			this.getView().addDependent(oDetailMultiDialog);		
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), oDetailMultiDialog);
			oDetailMultiDialog.open();					
			oDetailMultiDialog.setModel("");
			oDetailMultiDialog.setBusy(false);
	    
	    },
	    //export full CC data
	    handleExcelSave: function(oEvent){
	    try{
	    	_view = this.getView();
	    	var fileName = sap.ui.getCore().byId("fname").getValue();
	    	_view.setBusy(true);
	    	oDetailMultiDialog.close();
			oDetailMultiDialog.destroy();
			//Google Analytics
			ga('send', 'pageview', 'PPV CC Excel Download');
			if(sap.ui.getCore().getModel("rcModel")==undefined){
				loadRCModel();
			}
			//diable export button
		//	var exportBt= oEvent.getSource();
		
		//	exportBt.setBusy(true);
			var expModel = new sap.ui.model.json.JSONModel(_oResourceBundle.getText("TABLEMODEL_SERVICE",[eccOdataService,getSelectionInput(),sapClient])+"&ts="+$.now());
			informationMessage(_oResourceBundle.getText("EXCEL_DOWNLOAD_MSG"));
			expModel.attachRequestCompleted(function(){
				// that.pageChanged();
				if(expModel.getData().d==null ){
					handleServiceError(this);
				}else if(expModel.getData().d.results == null || expModel.getData().d.results.length==0){
					handleNoRecordFound("Excel Download");
				}else{
				//var mainResults = expModel.getData().d.results[0];
					var oExport = new sap.ui.core.util.Export({
						exportType : new sap.ui.core.util.ExportTypeCSV({
							separatorChar : ","
						}),
						models :expModel,
						rows : {
							path : "/d/results"
						},
						columns :getExcelColumns()		
						});
					oExport.saveFile(getFileName(fileName)).always(function() {
						this.destroy();	
					});
				//	exportBt.setBusy(false);
					informationMessage(_oResourceBundle.getText("DOWNLOAD_COMPLEATE"));
				}
				_view.setBusy(false);
			});
			expModel.attachRequestFailed(function(oEvent){
				handleRequestFailed("chModel",getErrorText(oEvent));
				_view.setBusy(false);
				});
		}catch(ex){handleException(ex);}
		_view.setBusy(false);
	    }
   });