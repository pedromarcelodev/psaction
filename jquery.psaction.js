var PsAction = function(actions) {
	var psActions = {};

	if (typeof actions === "object") {
		if (typeof actions.forEach === "undefined") {
			actions = [actions];
		}
		var acs = {};
		actions.forEach(function(action){
			if (typeof action.name == "string" && typeof action.url == "string"
				&& typeof action.callback == "function") {
				acs[action.name] = action;
			}
		});
		psActions = acs;
	}

	this.hasAction = function(actionName) {
		return typeof psActions[actionName] !== "undefined";
	};

	this.addAction = function(actionName, options) {
		if (typeof actionName === "string" && !this.hasAction(actionName)) {
			if (typeof options.url === "string" && typeof options.callback === "function") {
				psActions[actionName] = options;

				return true;
			}
		}

		return false;
	};

	this.getAction = function(actionName) {
		if (this.hasAction(actionName)) {
			return psActions[actionName];
		}
		return null;
	};

	this.getActions = function() {
		return psActions;
	};
};
(function($){
	$.psAction = new PsAction();

	$.addPsAction = function(actionName, options) {
		$.psAction.addAction(actionName, options);
	};

	$.getPsAction = function(actionName) {
		return $.psAction.getAction(actionName);
	};

	$.fn.executeAction = function() {
		var actionName = this.data('action');
		var action = $.getPsAction(actionName);
		var defaults = {
			method : "GET",
			targetData : undefined,
			targetDataFilter : undefined,
			validate : function() {
				return true;
			},
			preAction : function(data) {},
			posAction : function(data) {},
			onUpload : function(data, event) {},
			onFail : function(a, b, c) {}
		};

		if (action != null) {
			action = $.extend(defaults, action);
			if (typeof action.validate != "function")
				action.validate = function() { return true; };

			if (typeof action.preAction == "function")
				action.preAction({action : action, target : this});

			if (typeof action.defaultAction === "function") {
				action.defaultAction({action : action, target : this});
			} else {
				if (action.validate()) {
					var dataAction = {action : actionName};

					if (typeof action.targetData !== "undefined" && typeof action.targetDataFilter !== "undefined") {
						$(action.targetData).find(action.targetDataFilter).each(function() {
							dataAction[$(this).attr('name')] = $(this).attr('value');
						});
					}
					var ajaxConfig = {
						method : action.method,
						data : dataAction
						// processData: false,
      //   				contentType: false,
						// xhr : function(){
						// 	var xhr = $.ajaxSettings.xhr();
				  //           if (xhr.upload && typeof action.onUpload == "function") {
				  //               xhr.upload.addEventListener(
				  //                   'progress', 
				  //                   function(evt){
				  //                       var total = evt.total;
				  //                       var evtLoaded = evt.loaded || evt.position;

				  //                       if (evt.lengthComputable)
				  //                       {
				  //                           action.onUpload({progress : Math.ceil(evtLoaded / total * 100)}, evt);
				  //                       }
				  //                   }, 
				  //                   false
				  //               );
				  //           }
				  //           return xhr;
						// }
					};
					$.ajax(action.url, ajaxConfig).done(action.callback).fail(action.onFail);
				}
			}

			if (typeof action.posAction == "function")
				action.posAction({action : action, target : this});
		} else {
			console.warn('Action ' + actionName + ' inexistente');
		}

		return this;
	};
})(jQuery);