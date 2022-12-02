sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.piemca.controller.DetailClient", {
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
				this.sContext = "ClientSet('1')";
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

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("DetailClientCreate", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

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
		applyFiltersAndSorters: function(sControlId, sAggregationName, chartBindingInfo) {
			if (chartBindingInfo) {
				var oBindingInfo = chartBindingInfo;
			} else {
				var oBindingInfo = this.getView().byId(sControlId).getBindingInfo(sAggregationName);
			}
			var oBindingOptions = this.updateBindingOptions(sControlId);
			this.getView().byId(sControlId).bindAggregation(sAggregationName, {
				model: oBindingInfo.model,
				path: oBindingInfo.path,
				parameters: oBindingInfo.parameters,
				template: oBindingInfo.template,
				templateShareable: true,
				sorter: oBindingOptions.sorters,
				filters: oBindingOptions.filters
			});

		},
		updateBindingOptions: function(sCollectionId, oBindingData, sSourceId) {
			this.mBindingOptions = this.mBindingOptions || {};
			this.mBindingOptions[sCollectionId] = this.mBindingOptions[sCollectionId] || {};

			var aSorters = this.mBindingOptions[sCollectionId].sorters;
			var aGroupby = this.mBindingOptions[sCollectionId].groupby;

			// If there is no oBindingData parameter, we just need the processed filters and sorters from this function
			if (oBindingData) {
				if (oBindingData.sorters) {
					aSorters = oBindingData.sorters;
				}
				if (oBindingData.groupby || oBindingData.groupby === null) {
					aGroupby = oBindingData.groupby;
				}
				// 1) Update the filters map for the given collection and source
				this.mBindingOptions[sCollectionId].sorters = aSorters;
				this.mBindingOptions[sCollectionId].groupby = aGroupby;
				this.mBindingOptions[sCollectionId].filters = this.mBindingOptions[sCollectionId].filters || {};
				this.mBindingOptions[sCollectionId].filters[sSourceId] = oBindingData.filters || [];
			}

			// 2) Reapply all the filters and sorters
			var aFilters = [];
			for (var key in this.mBindingOptions[sCollectionId].filters) {
				aFilters = aFilters.concat(this.mBindingOptions[sCollectionId].filters[key]);
			}

			// Add the groupby first in the sorters array
			if (aGroupby) {
				aSorters = aSorters ? aGroupby.concat(aSorters) : aGroupby;
			}

			var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : undefined;
			return {
				filters: aFinalFilters,
				sorters: aSorters
			};

		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("DetailClient").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			var oView = this.getView();
			oView.addEventDelegate({
				onBeforeShow: function() {
					if (sap.ui.Device.system.phone) {
						var oPage = oView.getContent()[0];
						if (oPage.getShowNavButton && !oPage.getShowNavButton()) {
							oPage.setShowNavButton(true);
							oPage.attachNavButtonPress(function() {
								this.oRouter.navTo("MasterClient", {}, true);
							}.bind(this));
						}
					}
				}.bind(this)
			});

			var oView = this.getView(),
				oData = {},
				self = this;
			var oModel = new sap.ui.model.json.JSONModel();
			oView.setModel(oModel, "staticDataModel");
			self.oBindingParameters = {};

			oData["sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669066632005"] = {};

			oData["sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669066632005"]["data"] = [{
				"dim0": "SUB TWIST",
				"mea0": "50",
				"__id": 0
			}, {
				"dim0": "SUPER BALL",
				"mea0": "20",
				"__id": 1
			}, {
				"dim0": "REVERSE",
				"mea0": "15",
				"__id": 2
			}, {
				"dim0": "Alti-Vate REVERSE",
				"mea0": "21",
				"__id": 3
			}, {
				"dim0": "TURON",
				"mea0": "23",
				"__id": 4
			}];

			self.oBindingParameters['sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669066632005'] = {
				"path": "/sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669066632005/data",
				"model": "staticDataModel",
				"parameters": {}
			};

			oData["sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669066632005"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oData["sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669145942835"] = {};

			oData["sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669145942835"]["data"] = [{
				"dim0": "Medicina Deportiva",
				"mea0": "70",
				"__id": 0
			}, {
				"dim0": "Reemplazo Articular",
				"mea0": "20",
				"__id": 1
			}, {
				"dim0": "Sistema Geminus",
				"mea0": "10",
				"__id": 2
			}];

			self.oBindingParameters['sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669145942835'] = {
				"path": "/sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669145942835/data",
				"model": "staticDataModel",
				"parameters": {}
			};

			oData["sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669145942835"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oData["sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669146104875"] = {};

			oData["sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669146104875"]["data"] = [{
				"dim0": "Soporte Técnico",
				"mea0": "13",
				"__id": 0
			}, {
				"dim0": "Reconocimiento Mundial",
				"mea0": "40",
				"__id": 1
			}, {
				"dim0": "Fundamento Académico",
				"mea0": "20",
				"__id": 2
			}, {
				"dim0": "10 Años en el Mercado",
				"mea0": "22",
				"__id": 3
			}, {
				"dim0": "Certificaciones de Alta Calidad",
				"mea0": "23",
				"__id": 4
			}, {
				"dim0": "Bajo Costo",
				"mea0": "18",
				"__id": 5
			}];

			self.oBindingParameters['sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669146104875'] = {
				"path": "/sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669146104875/data",
				"model": "staticDataModel",
				"parameters": {}
			};

			oData["sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669146104875"]["vizProperties"] = {
				"plotArea": {
					"dataLabel": {
						"visible": true,
						"hideWhenOverlap": true
					}
				}
			};

			oView.getModel("staticDataModel").setData(oData, true);

			function dateDimensionFormatter(oDimensionValue, sTextValue) {
				var oValueToFormat = sTextValue !== undefined ? sTextValue : oDimensionValue;
				if (oValueToFormat instanceof Date) {
					var oFormat = sap.ui.core.format.DateFormat.getDateInstance({
						style: "short"
					});
					return oFormat.format(oValueToFormat);
				}
				return oValueToFormat;
			}

			var aDimensions = oView.byId("sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669066632005").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669145942835").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669146104875").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

		},
		onAfterRendering: function() {

			var oChart,
				self = this,
				oBindingParameters = this.oBindingParameters,
				oView = this.getView();

			oChart = oView.byId("sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669066632005");
			oChart.bindData(oBindingParameters['sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669066632005']);

			oChart = oView.byId("sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669145942835");
			oChart.bindData(oBindingParameters['sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669145942835']);

			oChart = oView.byId("sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669146104875");
			oChart.bindData(oBindingParameters['sap_IconTabBar_Page_0-content-sap_m_IconTabBar-2-items-sap_m_IconTabFilter-3-content-sap_chart_PieChart-1669146104875']);

		}
	});
}, /* bExport= */ true);
