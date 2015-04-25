'use strict';
angular.module('starter.services', [])
.service('UserService', function($q, lodash, pouchDB){
    var localDB = pouchDB('compendium');
    var self = this;
    this.selectedCharacter = '';
    this.syncRate = 3600;
    this.init = function() {
        var dfd = $q.defer();
        localDB.get('UserSettings').then(function(resp) {
            lodash.assign(self, resp);
            console.log(self);
            dfd.resolve();
        }).catch(function(err) {
            console.log(err);
            if(err.status === 404) {
                var apiKeys = {
                    _id: 'UserSettings',
                    selectedCharacter: '',
                    syncRate: 3600

                };
                localDB.put(apiKeys).then(function(){
                    dfd.resolve();
                });
            }
        });
        return dfd.promise;
    };
    this.save = function() {
        var dfd = $q.defer();
        localDB.get('UserSettings').then(function(resp) {
            resp.syncRate = self.syncRate;
            resp.selectedCharacter = self.selectedCharacter;
            return localDB.put(resp);
        }).then(function(resp){
            dfd.resolve(resp);
        });
        return dfd.promise;
    };
})
.service('ClockService', function($interval, lodash){
    var self = this;
    this.clock = null;
    this.functionList = [];
    this.start = function(rate) {
        var rateInMilliSeconds = rate * 1000;
        this.clock = $interval(function(){
            lodash.forEach(self.functionList, function(item){
                item();
            });
        }, rateInMilliSeconds);
    };
    this.stop = function() {
        if(!lodash.isUndefined(self.clock)){
            $interval.cancel(self.clock);
        }
    };
    this.addFunction = function(fn) {
        this.functionList.push(fn);
    };
});
