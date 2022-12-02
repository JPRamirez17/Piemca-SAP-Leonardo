sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.piemca.controller.DetailCongressCreate", {
		handleRouteMatched: function(oEvent) {
			var sAppId = "App637a88c073596301d5115dd3";

			var oParams = {};

			if (sap.ui.Device.system.desktop) {

				this._oRootView = this.getOwnerComponent().getAggregation("rootControl");
				this._oRootView.getController().setMode(sap.m.SplitAppMode.StretchCompressMode);

			} else {

				this._oRootView = this.getOwnerComponent().getAggregation("rootControl");
				this._oRootView.getController().setMode(sap.m.SplitAppMode.StretchCompressMode);

			}
			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function(oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype" && prop.includes("Set")) {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

				}
			}

			if (!this.sContext) {
				this.sContext = "ProductSet('MD11')";
			}

			var oPath;

			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}

		},
		_onButtonPress: function(oEvent) {

			oEvent = jQuery.extend(true, {}, oEvent);
			return new Promise(function(fnResolve) {
					fnResolve(true);
				})
				.then(function(result) {
					var oView = this.getView(),
						oController = this,
						status = true,
						requiredFieldInfo = [];
					if (requiredFieldInfo.length) {
						status = this.handleChangeValuestate(requiredFieldInfo, oView);
					}
					if (status) {
						return new Promise(function(fnResolve, fnReject) {
							var oModel = oController.oModel;

							var fnResetChangesAndReject = function(sMessage) {
								oModel.resetChanges();
								fnReject(new Error(sMessage));
							};
							if (oModel && oModel.hasPendingChanges()) {
								oModel.submitChanges({
									success: function(oResponse) {
										var oBatchResponse = oResponse.__batchResponses[0];
										var oChangeResponse = oBatchResponse.__changeResponses && oBatchResponse.__changeResponses[0];
										if (oChangeResponse && oChangeResponse.data) {
											var sNewContext = oModel.getKey(oChangeResponse.data);
											oView.unbindObject();
											oView.bindObject({
												path: "/" + sNewContext
											});
											if (window.history && window.history.replaceState) {
												window.history.replaceState(undefined, undefined, window.location.hash.replace(encodeURIComponent(oController.sContext), encodeURIComponent(sNewContext)));
											}
											oModel.refresh();
											fnResolve();
										} else if (oChangeResponse && oChangeResponse.response) {
											fnResetChangesAndReject(oChangeResponse.message);
										} else if (!oChangeResponse && oBatchResponse.response) {
											fnResetChangesAndReject(oBatchResponse.message);
										} else {
											oModel.refresh();
											fnResolve();
										}
									},
									error: function(oError) {
										fnReject(new Error(oError.message));
									}
								});
							} else {
								fnResolve();
							}
						});
					}
				}.bind(this))
				.then(function(result) {
					if (result === false) {
						return false;
					} else {
						var oHistory = History.getInstance();
						var sPreviousHash = oHistory.getPreviousHash();
						var oQueryParams = this.getQueryParameters(window.location);

						if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
							window.history.go(-1);
						} else {
							var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
							oRouter.navTo("default", true);
						}

					}
				}.bind(this)).catch(function(err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
		},
		handleChangeValuestate: function(requiredFieldInfo, oView) {
			var status = true;
			if (requiredFieldInfo) {
				requiredFieldInfo.forEach(function(requiredinfo) {
					var input = oView.byId(requiredinfo.id);
					if (input) {
						input.setValueState("None"); //initially set ValueState to None
						if (input.getValue() === '') {
							input.setValueState("Error"); //input is blank set ValueState to error
							status = false;
						} else if (input.getDateValue && !input._bValid) { //since 1.64 ui5 will be providing a function 'isValidValue' that can be used here.
							input.setValueState("Error"); //Invalid Date set ValueState to error
							status = false;
						}
					}
				});
			}
			return status;

		},
		getQueryParameters: function(oLocation) {
			var oQuery = {};
			var aParams = oLocation.search.substring(1).split("&");
			for (var i = 0; i < aParams.length; i++) {
				var aPair = aParams[i].split("=");
				oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
			}
			return oQuery;

		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("DetailCongressCreate").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			var oView = this.getView();
			oView.addEventDelegate({
				onBeforeShow: function() {
					if (sap.ui.Device.system.phone) {
						var oPage = oView.getContent()[0];
						if (oPage.getShowNavButton && !oPage.getShowNavButton()) {
							oPage.setShowNavButton(true);
							oPage.attachNavButtonPress(function() {
								this.oRouter.navTo("MasterCongress", {}, true);
							}.bind(this));
						}
					}
				}.bind(this)
			});

			this.oModel = this.getOwnerComponent().getModel();

		},
		onExit: function() {

			// to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
			var aControls = [{
				"controlId": "sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-1-content-build_simple_form_Form-1668977683188-formContainers-build_simple_form_FormContainer-1-formElements-build_simple_form_FormElement-4-uvqk0o5je5irk3g0rsn111wy2_S2-9fkpzw5tq69bzd19m1c3v10e5_S5-fields-sap_m_ComboBox-1669075484091",
				"groups": ["items"]
			}];
			for (var i = 0; i < aControls.length; i++) {
				var oControl = this.getView().byId(aControls[i].controlId);
				if (oControl) {
					for (var j = 0; j < aControls[i].groups.length; j++) {
						var sAggregationName = aControls[i].groups[j];
						var oBindingInfo = oControl.getBindingInfo(sAggregationName);
						if (oBindingInfo) {
							var oTemplate = oBindingInfo.template;
							oTemplate.destroy();
						}
					}
				}
			}

		}
	});
}, /* bExport= */ true);
