sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.piemca.controller.DetailCongressEdit", {
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
				this.sContext = "CongressSet('1')";
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
		_onOverflowToolbarButtonPress: function(oEvent) {
			var oView = this.getView(),
				status = true,
				requiredFieldInfo = [{
					"id": "sap_IconTabBar_Page_0-uvqk0o5je5irk3g0rsn111wy2_S2-content-build_simple_form_Form-1669070408767-formContainers-build_simple_form_FormContainer-1-9fkpzw5tq69bzd19m1c3v10e5_S5-formElements-build_simple_form_FormElement-1669074959130-fields-sap_m_DatePicker-1669075240279-3m60r4glyf0102eg3y5ejl0i6_S6"
				}];
			if (requiredFieldInfo.length) {
				status = this.handleChangeValuestate(requiredFieldInfo, oView);
			}
			if (status) {

				var oSourceBindingContext = oEvent.getSource().getBindingContext();

				return new Promise(function(fnResolve, fnReject) {
					var bHasPendingChanges = false;
					var oModel;

					oModel = this.getView().getModel();
					bHasPendingChanges = oModel && oModel.hasPendingChanges();

					if (bHasPendingChanges) {
						var sUserMessage = "Please save your changes, first";
						fnReject(new Error(sUserMessage));
					} else {
						var oNewEntityInstance = Utilities.getDefaultValuesForDetailCongressCreate();
						oNewEntityInstance["___FK_fd103d42ea13adbc183d5c08_00021"] = oSourceBindingContext.getProperty("ID");

						oModel = this.getView().getModel();
						var oNewBindingContext = oModel.createEntry("ProductSet", {
							properties: oNewEntityInstance
						});

						this.doNavigate("DetailCongressCreate", oNewBindingContext, fnResolve);
					}
				}.bind(this)).catch(function(err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
			}

		},
		doNavigate: function(sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet, sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function(bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

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
		_onButtonPress: function(oEvent) {

			var oSource = oEvent.getSource();
			var oSourceBindingContext = oSource.getBindingContext();

			return new Promise(function(fnResolve, fnReject) {
				if (oSourceBindingContext) {
					var oModel = oSourceBindingContext.getModel();
					var fnSync = function() {
						oModel.detachRequestCompleted(fnRefreshCompleted);
						oModel.detachRequestFailed(fnRefreshFailed);
					};
					var fnRefreshCompleted = function() {
						fnSync();
						fnResolve();
					};
					var fnRefreshFailed = function() {
						fnSync();
						fnReject(new Error("refresh failed"));
					};
					var fnResolveAfterRefresh = function() {
						oModel.attachRequestCompleted(fnRefreshCompleted);
						oModel.attachRequestFailed(fnRefreshFailed);
						oModel.refresh(true, true);
					};

					oModel.remove(oSourceBindingContext.getPath(), {
						success: function() {
							fnResolveAfterRefresh();
						},
						error: function() {
							oModel.refresh();
							fnReject(new Error("remove failed"));
						}
					});
				}
			}).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onButtonPress1: function(oEvent) {

			oEvent = jQuery.extend(true, {}, oEvent);
			return new Promise(function(fnResolve) {
					fnResolve(true);
				})
				.then(function(result) {
					var oView = this.getView(),
						oController = this,
						status = true,
						requiredFieldInfo = [{
							"id": "sap_IconTabBar_Page_0-uvqk0o5je5irk3g0rsn111wy2_S2-content-build_simple_form_Form-1669070408767-formContainers-build_simple_form_FormContainer-1-9fkpzw5tq69bzd19m1c3v10e5_S5-formElements-build_simple_form_FormElement-1669074959130-fields-sap_m_DatePicker-1669075240279-3m60r4glyf0102eg3y5ejl0i6_S6"
						}];
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
							var fnSync = function() {
								oModel.detachRequestCompleted(fnRefreshCompleted);
								oModel.detachRequestFailed(fnRefreshFailed);
							};
							var fnRefreshCompleted = function() {
								fnSync();
								fnResolve();
							};
							var fnRefreshFailed = function() {
								fnSync();
								fnReject(new Error("refresh failed"));
							};
							var fnResolveAfterRefresh = function() {
								oModel.attachRequestCompleted(fnRefreshCompleted);
								oModel.attachRequestFailed(fnRefreshFailed);
								oModel.refresh(true, true);
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
											fnResolveAfterRefresh();
										} else if (oChangeResponse && oChangeResponse.response) {
											fnResetChangesAndReject(oChangeResponse.message);
										} else if (!oChangeResponse && oBatchResponse.response) {
											fnResetChangesAndReject(oBatchResponse.message);
										} else {
											fnResolveAfterRefresh();
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

						var oBindingContext = oEvent.getSource().getBindingContext();

						return new Promise(function(fnResolve) {

							this.doNavigate("MasterCongress", oBindingContext, fnResolve, "");
						}.bind(this));

					}
				}.bind(this)).catch(function(err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("DetailCongressEdit").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
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
				"controlId": "sap_IconTabBar_Page_0-uvqk0o5je5irk3g0rsn111wy2_S2-content-build_simple_form_Form-1669070408767-formContainers-build_simple_form_FormContainer-1-formElements-build_simple_form_FormElement-2-fields-sap_m_ComboBox-1669070615043-9fkpzw5tq69bzd19m1c3v10e5_S5-3m60r4glyf0102eg3y5ejl0i6_S6",
				"groups": ["items"]
			}, {
				"controlId": "sap_IconTabBar_Page_0-uvqk0o5je5irk3g0rsn111wy2_S2-content-build_simple_form_Form-1669070408767-formContainers-build_simple_form_FormContainer-1-9fkpzw5tq69bzd19m1c3v10e5_S5-3m60r4glyf0102eg3y5ejl0i6_S6-formElements-build_simple_form_FormElement-1669126368158-fields-sap_m_ComboBox-1669126470017",
				"groups": ["items"]
			}, {
				"controlId": "sap_IconTabBar_Page_0-uvqk0o5je5irk3g0rsn111wy2_S2-9fkpzw5tq69bzd19m1c3v10e5_S5-3m60r4glyf0102eg3y5ejl0i6_S6-content-build_simple_Table-1669076550722",
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
