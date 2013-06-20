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
  "addons/compaction/resources",
  "addons/compaction/views"
],
function(app, FauxtonAPI, compaction, Views) {
  var  RepRouteObject = FauxtonAPI.RouteObject.extend({
    layout: "one_pane",
    routes: {
      "compaction": "defaultView"
    },
    apiUrl: function() {
      return app.host+"/_compaction";
    },
    crumbs: [],
    defaultView: function(){
			this.databases = new compaction.DBList({}),
      this.tasks = new compaction.Tasks({}); //replace with with a call to active tasks when that is merged in
			this.setView("#dashboard-content", new Views.compactionForm({
				collection: this.databases,
        status:  this.tasks
			}));
    }
  });


	compaction.RouteObjects = [RepRouteObject];

  return compaction;
});
