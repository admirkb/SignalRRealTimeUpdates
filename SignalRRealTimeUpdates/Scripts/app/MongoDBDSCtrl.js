
appRoot.controller('MongoDBDSCtrl', function ($scope, $filter) {

    $scope.Id = 0;
    $scope.bugsList = [];

    $scope.medialibrariesList = [];
    $scope.xxx = "hellow world";


    var mediaLibrariesHub;

    var init = function () {

        console.log("in init");
        mediaLibrariesHub = $.connection.mongoDBHub;




        $.connection.hub.start().done(function () {

            //alert("Started client hub");
            mediaLibrariesHub.server.getBugs();
        });


        // Methods called on the client (javascript)
        mediaLibrariesHub.client.roll = function () {
            alert("roll called on client in angularjs");
        };
        mediaLibrariesHub.client.taskAll = function (allTasks) {

            var mappedTasks = $.map(allTasks, function (item) {
                return new medialibraryViewModel(item.MediaLibraryId, item.Heading,
                         item.ProgramId, item.Program1, self)
            });

            $scope.medialibrariesList = mappedTasks;
            $scope.$apply();


            //angular.forEach($scope.medialibrariesList, function (item, key) {
            //    alert(key)
            //});

        };
        mediaLibrariesHub.client.addNew = function () {
            alert("addNew called on client in angularjs");
            $scope.medialibrariesList.push(new medialibraryViewModel(999, "Hello",
                         999, "World", self));

            $scope.$apply();
        };
        mediaLibrariesHub.client.delete = function (index) {
            //alert("delete called on client in angularjs");
            $scope.medialibrariesList.splice(index, 1);

            $scope.$apply();
        };

        // Table Bugs
        mediaLibrariesHub.client.bugs = function (allbugs) {
            var mappedbugs = $.map(allbugs, function (item) {
                return new bugsViewModel(item.Id, item.Problem, item.Response, item.DateCreated, item.DateResolved)
            });

            $scope.bugsList = mappedbugs;
            $scope.$apply();
            mappedbugs
        };
        mediaLibrariesHub.client.deleteBug = function (index) {
            //alert("delete called on client in angularjs");
            $scope.bugsList.splice(index, 1);
            $scope.$apply();
        };
        mediaLibrariesHub.client.addBug = function (t) {
            //alert("addBug called on client in angularjs:" );
            $scope.bugsList.push(new bugsViewModel(t.Id, t.Problem, t.Response, t.DateCreated));
            $scope.$apply();
        };
        mediaLibrariesHub.client.updateBug = function (b, key) {
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
        mediaLibrariesHub.client.editNotifyBug = function (b, key) {
            //alert("editnofityBug called on client in angularjs");
            //$scope.bugsList.splice(key, 1);
            $scope.bugsList[key].editColor = "red";
            $scope.bugsList[key].isDisabled = true;
            $scope.$apply();



        };
        mediaLibrariesHub.client.editAllowBug = function (b, key) {
            //alert("editAllowBug called on client in angularjs");
            //$scope.bugsList.push(new bugsViewModel(b.Id, b.Problem, b.Response, b.DateCreated));

            $scope.bugsList[key].editColor = "transparent";
            $scope.bugsList[key].isDisabled = false;
            $scope.$apply();

        };
        mediaLibrariesHub.client.addMeBug = function (b, key) {

            $scope.bugsList[key].id = b.Id;
            $scope.bugsList[key].dateCreated = b.DateCreated;
            $scope.$apply();
        };
        // Methods called on the client (javascript)

    }

    var ret = window.onbeforeunload = function (event) {
        //var message = 'Sure you want to leave?';
        //if (typeof event == 'undefined') {
        //    event = window.event;

        //}
        //if (event) {

        //    event.returnValue = message;
        //}

        $scope.UpdateAll();
        //return message;
    }


    init();

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
    //Task View Model
    function medialibraryViewModel(mediaLibraryId, heading, programId, program1, ownerViewModel) {
        this.mediaLibraryId = mediaLibraryId;
        this.heading = heading;
        this.programId = programId;
        this.program1 = program1;
    }


    // Methods called on the server (c#)
    $scope.GetAll = function () {

        mediaLibrariesHub.server.getAll();

    }
    $scope.Roll = function () {

        mediaLibrariesHub.server.roll();

    }
    $scope.AddNew = function () {

        mediaLibrariesHub.server.addNew(null);

    }
    $scope.Delete = function (index) {

        mediaLibrariesHub.server.delete(index);

    }
    $scope.DeleteBug = function (b, key) {
        var json_b = JSON.stringify(b);
        mediaLibrariesHub.server.deleteBug(json_b, key);

    }
    $scope.AddBug = function () {

        //var b = {problem: "a problem" };
        //mediaLibrariesHub.server.addBug(b)
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
            mediaLibrariesHub.server.addBug(b, key)
                .done(function () {
                    console.log('Success!')
                }).fail(function (e) {
                    console.warn(e);

                });
        }
        else {

            var json_b = JSON.stringify(b);
            mediaLibrariesHub.server.updateBug(json_b, key).done(function () {
                console.log('Success!')
            }).fail(function (e) {
                console.warn(e);
                alert(e)

            });

        }

        $scope.bugsList[key].isEditable = false;
        $scope.bugsList[key].status = "old";

    }

    // Methods called on the server (c#)

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
        var json_b = JSON.stringify(b);
        mediaLibrariesHub.server.editNotifyBug(json_b, key).done(function () {
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
        var json_b = JSON.stringify(b);
        mediaLibrariesHub.server.editAllowBug(json_b, key).done(function () {
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
});

