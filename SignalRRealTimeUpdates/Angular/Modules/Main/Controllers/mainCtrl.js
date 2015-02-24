(function () {
    'use strict';

    angular
        .module('appMain')
        .controller('mainCtrl', mainCtrl)
        .controller('mainDeleteModalCtrl', mainDeleteModalCtrl);


    mainCtrl.$inject = ['$scope', '$modal'];

    function mainCtrl($scope, $modal) {

        var signalRRealTimeUpdatesSQLServerHub;

        // Methods called on the server (c#)

        $scope.DeleteBug = function (b, key) {
            var message = "Do you really want to delete?";

            var size = 'sm';
            var modalInstance = $modal.open({
                templateUrl: 'Angular/Modules/Main/Controllers/html/mainDeleteModalCtrlContent.html',
                controller: 'mainDeleteModalCtrl',
                size: size,
                resolve: {
                    message: function () { return message; },
                }
            });

            modalInstance.result.then(function () {
                console.log('Modal says you want to update: ' + new Date());

                signalRRealTimeUpdatesSQLServerHub.server.deleteBug(b, key);


            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });



        }
        $scope.AddBug = function () {

            //var b = {problem: "a problem" };
            //signalRRealTimeUpdatesSQLServerHub.server.addBug(b)
            //    .done(function () {
            //        console.log('Success!')
            //    }).fail(function (e) {
            //        console.warn(e);

            //    });


        }
        $scope.UpdateBug = function (b, key) {
            // if new call add.
            if (b.status == "new") {
                var b = { problem: b.problem, response: b.response, status: b.status };
                signalRRealTimeUpdatesSQLServerHub.server.addBug(b, key)
                    .done(function () {
                        console.log('Success!')
                    }).fail(function (e) {
                        console.warn(e);

                    });
            }
            else {
                signalRRealTimeUpdatesSQLServerHub.server.updateBug(b, key).done(function () {
                    console.log('Success!')
                }).fail(function (e) {
                    console.warn(e);

                });

            }

            $scope.bugsList[key].isEditable = false;
            $scope.bugsList[key].status = "old";

        }
        $scope.UpdateAll = function () {

            angular.forEach($scope.bugsList, function (b, key) {

                if ($scope.bugsList[key].isEditable == true) {
                    $scope.UpdateBug(b, key);
                }


            });

        };
        $scope.EditBug = function (b, key) {

            $scope.bugsList[key].isEditable = true;
            $scope.bugsList[key].origProblem = $scope.bugsList[key].problem;
            $scope.bugsList[key].origResponse = $scope.bugsList[key].response;

            // Notify to lock others out of this record
            signalRRealTimeUpdatesSQLServerHub.server.editNotifyBug(b, key).done(function () {
                console.log('Success!')
            }).fail(function (e) {
                console.warn(e);

            });


        };
        $scope.CancelBug = function (b, key) {

            $scope.bugsList[key].isEditable = false;
            $scope.bugsList[key].problem = $scope.bugsList[key].origProblem
            $scope.bugsList[key].response = $scope.bugsList[key].origResponse

            // Notify to unlock others out of this record
            signalRRealTimeUpdatesSQLServerHub.server.editAllowBug(b, key).done(function () {
                console.log('Success!')
            }).fail(function (e) {
                console.warn(e);

            });
        };
        $scope.AddToBugsList = function () {

            var key = $scope.bugsList.length;

            $scope.bugsList.push(new bugsViewModel(null, null, null, null));
            $scope.bugsList[key].isEditable = true;
            $scope.bugsList[key].status = "new";

        }

        activate();

        function activate() {

            console.log("Start: activate")
            signalRRealTimeUpdatesSQLServerHub = $.connection.signalRRealTimeUpdatesSQLServerHub;


            $.connection.hub.start().done(function () {

                //alert("Started client hub");
                signalRRealTimeUpdatesSQLServerHub.server.getBugs();
            });


            // Methods called on the client (javascript)

            // Table Bugs
            signalRRealTimeUpdatesSQLServerHub.client.bugs = function (allbugs) {
                var mappedbugs = $.map(allbugs, function (item) {
                    return new bugsViewModel(item.Id, item.Problem, item.Response, item.DateCreated, item.DateResolved)
                });

                $scope.bugsList = mappedbugs;
                $scope.$apply();
                mappedbugs
            };
            signalRRealTimeUpdatesSQLServerHub.client.deleteBug = function (index) {
                //alert("delete called on client in angularjs");
                $scope.bugsList.splice(index, 1);
                $scope.$apply();
            };
            signalRRealTimeUpdatesSQLServerHub.client.addBug = function (t) {
                //alert("addBug called on client in angularjs:" );
                $scope.bugsList.push(new bugsViewModel(t.Id, t.Problem, t.Response, t.DateCreated));
                $scope.$apply();
            };
            signalRRealTimeUpdatesSQLServerHub.client.updateBug = function (b, key) {
                //alert("updateBug called on client in angularjs");

                angular.forEach($scope.bugsList, function (item, key1) {

                    if (key == key1) {
                        item.problem = b.Problem;
                        item.response = b.Response;
                        item.dateCreated = b.DateCreated;
                        item.dateResolved = b.DateResolved;
                        item.editColor = "transparent";
                        item.isDisabled = false;
                        $scope.$apply();
                    }
                });

            };
            signalRRealTimeUpdatesSQLServerHub.client.editNotifyBug = function (b, key) {
                //alert("editnofityBug called on client in angularjs");
                //$scope.bugsList.splice(key, 1);
                $scope.bugsList[key].editColor = "red";
                $scope.bugsList[key].isDisabled = true;
                $scope.$apply();



            };
            signalRRealTimeUpdatesSQLServerHub.client.editAllowBug = function (b, key) {
                //alert("editAllowBug called on client in angularjs");
                //$scope.bugsList.push(new bugsViewModel(b.Id, b.Problem, b.Response, b.DateCreated));

                $scope.bugsList[key].editColor = "transparent";
                $scope.bugsList[key].isDisabled = false;
                $scope.$apply();

            };
            signalRRealTimeUpdatesSQLServerHub.client.addMeBug = function (b, key) {

                $scope.bugsList[key].id = b.Id;
                $scope.bugsList[key].dateCreated = b.DateCreated;
                $scope.$apply();
            };
            // Methods called on the client (javascript)

            console.dir(signalRRealTimeUpdatesSQLServerHub)
            console.log("End: activate")

        }
    }
    //bugs View Model
    function bugsViewModel(id, problem, response, dateCreated, dateResolved) {
        this.id = id;
        this.problem = problem;
        this.response = response;
        this.dateCreated = dateCreated;
        this.dateResolved = dateResolved;
        this.isEditable = false;
        //this.editColor = 'yellow';

    }

    function mainDeleteModalCtrl($scope, $modalInstance, message) {


        $scope.message = message;

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        activate();

        function activate() {


        }
    }
})();
