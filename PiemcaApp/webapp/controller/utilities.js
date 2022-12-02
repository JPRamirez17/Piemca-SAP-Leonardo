sap.ui.define([
	"./utilities"
], function() {
	"use strict";

	// class providing static utility methods to retrieve entity default values.

	return {
		getDefaultValuesForDetailClientCreate: function() {
			return {
				"ID": "id-" + Date.now().toString(),
				"Name": "",
				"Type": "",
				"Email": "",
				"Phone": "",
				"Potential": true,
				"Contact": "",
				"Image": "",
				"___FK_b6d2166c1f458fce184a7e9f_00005": ""
			};
		},
		getDefaultValuesForDetailCongressEdit: function() {
			return {
				"ID": "id-" + Date.now().toString(),
				"Name": "",
				"Assistants": 0,
				"Date": null,
				"State": "",
				"___FK_18dcc203d1a9695e183fa668_00006": "",
				"Cost": 0,
				"City1": "",
				"___FK_b6d2166c1f458fce184a7e9f_00011": ""
			};
		},
		getDefaultValuesForDetailCongressCreate: function() {
			return {
				"ID": "id-" + Date.now().toString(),
				"Name": "",
				"Category": "",
				"___FK_fd103d42ea13adbc183d5c08_00012": "",
				"___FK_fd103d42ea13adbc183d5c08_00021": "",
				"___FK_fd103d42ea13adbc183d5c08_00039": "",
				"Description": "",
				"Stock": 0,
				"___FK_481d9ac2494dc9b4184a2981_00007": "",
				"Supplies": "",
				"Image": ""
			};
		},
		getDefaultValuesForDetailSurveyCreate: function() {
			return {
				"ID": "id-" + Date.now().toString(),
				"Time": null,
				"___FK_fd103d42ea13adbc183d5c08_00033": "",
				"___FK_fd103d42ea13adbc183d5c08_00037": "",
				"ClientName": ""
			};
		},
		getDefaultValuesForDetailServiceCreate: function() {
			return {
				"ID": "id-" + Date.now().toString(),
				"___FK_fd103d42ea13adbc183d5c08_00044": ""
			};
		},
		getDefaultValuesForDetailProductEdit: function() {
			return {
				"ID": "id-" + Date.now().toString(),
				"Name": "",
				"Category": "",
				"___FK_fd103d42ea13adbc183d5c08_00012": "",
				"___FK_fd103d42ea13adbc183d5c08_00021": "",
				"___FK_fd103d42ea13adbc183d5c08_00039": "",
				"Description": "",
				"Stock": 0,
				"___FK_481d9ac2494dc9b4184a2981_00007": "",
				"Supplies": "",
				"Image": ""
			};
		}
	};
});
