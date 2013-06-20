// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

define([
  "app",
  "api",
  "addons/compaction/resources"
],
function(app, FauxtonAPI, compaction) {
  var View = {};

// NOTES: http://wiki.apache.org/couchdb/compaction
// Need to add Cancel button.  where?  In the status?
// Change the selects to be editable?  How can I trigger if the element is entered in manually & doesn't exist? or can I always post "create_target": true,
// can I get from active_tasks using type="compaction"




  View.compactionForm = FauxtonAPI.View.extend({
		template: "addons/compaction/templates/form",
		events:  {
			"submit #compaction": "submit",
			"click input[type=radio]": "enableFields",
			"click .swap": "swapFields",
			"click .options": "toggleAdvancedOptions"
		},
		establish: function(){
			return [ this.collection.fetch()];
		},
		serialize: function(){
			return {
				databases:  this.collection.toJSON()
			};
		},
		toggleAdvancedOptions:  function(e){
			$(e.currentTarget).toggleClass("off");
			$('.advancedOptions').toggle("hidden").find('input').removeAttr('disabled');
		},
		enableFields: function(e){
			var $currentTarget = $(e.currentTarget);
					$currentTarget.parents(".form_set").find('input[type="text"], select').attr('disabled','true').addClass('disabled');
					$currentTarget.parents('.control-group').find('input[type="text"], select').removeAttr('disabled').removeClass('disabled');
		},
		swapFields: function(e){
			//WALL O' VARIABLES
			var $fromSelect = $('#from_name'),
					$toSelect = $('#to_name'),
					$toInput = $('#to_url'),
					$fromInput = $('#from_url'),
					fromSelectVal = $fromSelect.val(),
					fromInputVal = $fromInput.val(),
					toSelectVal = $toSelect.val(),
					toInputVal = $toInput.val();

					$fromSelect.val(toSelectVal);
					$toSelect.val(fromSelectVal);

					$fromInput.val(toInputVal);
					$toInput.val(fromInputVal);
		},
		submit: function(e){
			e.preventDefault();
			this.disableFields(); //disable fields not relevant to submitting

			var formJSON = {};
			_.map($(e.currentTarget).serializeArray(), function(formData){
				if(formData.value !== ''){
					formJSON[formData.name] = formData.value;
				}
			});
			console.log($(e.currentTarget).serializeArray(), formJSON);

			this.inprogressRep = formJSON; //save this for cancelling? how should cancelling work? inside the progress??

			this.startcompaction(formJSON);
		},
		startcompaction: function(json){
			var that = this;
			this.newRepModel.save(json,{
				success: function(resp){
					that.toggleAdvancedOptions(); //close advanced Options
					that.showProgress(json);
				},
				error: function(resp){
					console.log("compaction error", resp);
					var notification = FauxtonAPI.addNotification({
						msg: "Something went wrong. :(",
						type: "error",
						clear: true
					});
				}
			});
		},
		cancelcompaction: function(){
			//need to pass "cancel": true with source & target

		},
		disableFields: function(){
			this.$('input[type=radio]').attr('disabled',true);
			this.$('.advancedOptions:hidden').find('input').attr('disabled',true);
		},
		initialize: function(){
			this.status = this.options.status;
			this.newRepModel = new compaction.Replicate();
		},
		formValidation: function(){
			var $remote = $(this).find("[value='remote']:checked").parents('.control-group').find('input[type=text]'),
					error = false;
			for(var i=0; i<$remote.length; i++){
				if ($remote[i].value =="http://" || $remote[i].value ==" "){
					error = true;
				}
			}
			return error;
		},
		showProgress: function(formData){
			var fetchStatus = this.status.fetch(),
			progressBar = this.insertView("#compactionStatus", new View.compactionProgress({
				formData: formData,
				model: fetchStatus
      }));
      progressBar.render();
		}
  });

	View.compactionProgress = FauxtonAPI.View.extend({
		template: "addons/compaction/templates/progress",
		initialize: function(){
			this.formdata = this.options.formData;
		},
		establish: function(){
			return [this.model.fetch()];
		},
		serialize: function(){
			return {
				to: this.formdata.target,
				from: this.formdata.source,
				percent:  this.model
			};
		}
	});

  return View;
});
