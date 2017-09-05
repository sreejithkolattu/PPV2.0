jQuery.sap.declare("com.jabil.fi.util.Global");
//*****************************************************************************************************************************************
//                                                    Global.js
//                                               It contains all the global variables
//*****************************************************************************************************************************************


// global  variables
    //User customer and site
    var backendURL;
    //resource bundle
    var i18nModel;
    var selView;
    var busyDialog;
    var appURL="/jbl.com~jee~ppv_dash/index.html";
    var ALPHA_EXPRESSION_SPECIAL_CHAR=	"^([a-zA-Z.'@,0-9-=*&$#/)( _+ ]{1,100}$)";
    var portalService="/irj/servlet/prt/portal/prtroot/jbl.com~jee~usr_srvc.UserService";
    var showSiteDialog = false;
    var _oDialog;
    var selectedPCs;
    var xsrfTokenValue;
    var eccOdataService="/sap/opu/odata/sap/Z_FI_PPV_SRV";
    var isInitialLoad = true;
	var restAccPage="/irj/go/km/docs/documents/JEPSystem/ExceptionFramework/RestrictedAccessPage.html";
	var viewFlag ="";
	var tableVisibilityFlag ="";
	var masterViewName="masterPage";
	var detailsViewName="DetailsPage";
	var sapClient;
	//For detailed page
    var selectedCurr="Lc" ;
    var lclCurr="";
    var grpCurr="USD";
    var isFxCC=false;
    var isLocalCurr = false;
    var _oResourceBundle;
    var filterRegex = /^(?=.*?[0-9])[0-9()-<>]+$/;
    var isRevenuePostActive = false;
    var groupModification = false;
    var isResonCodePage = false;
    var _refreshNeed = false;