(function () {
    'use strict';

    angular
        .module('appMain')
        .controller('mainCtrlPouchDB', mainCtrlPouchDB)
        .controller('mainDeleteModalCtrl', mainDeleteModalCtrl);


    mainCtrlPouchDB.$inject = ['$scope', '$modal', 'fCommon'];

    function mainCtrlPouchDB($scope, $modal, fCommon) {

        //new PouchDB('todos').destroy()
        $scope.db = new PouchDB('todos');
        $scope.pouchDBList = [];

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

                //mappedbugs

                // Draw PouchDB

                $scope.db.allDocs({ include_docs: true, descending: true }, function (err, doc) {
                    redrawTodosUI(doc.rows);

                    doc.rows.forEach(function (doc) {
                        console.dir(doc.doc)
                        $scope.pouchDBList.push(doc.doc)
                    });

                    $scope.$apply();

                });


            };
            signalRRealTimeUpdatesSQLServerHub.client.deleteBug = function (index) {
                //alert("delete called on client in angularjs");

                var bugId = $scope.bugsList[index].id;
                $scope.bugsList.splice(index, 1);
                $scope.$apply();

                $scope.temp = [];
                $scope.db.allDocs({ include_docs: true, descending: true }, function (err, doc) {

                    doc.rows.forEach(function (doc) {
                        if (doc.doc._id == bugId)
                            $scope.temp.push(doc)
                    });

                    //alert($scope.temp.length)
                    $scope.temp.forEach(function (b) {
                        var bug = $scope.db.get(b.doc._id.toString()).then(function (doc) {
                            doc._deleted = true;
                            return $scope.db.put(doc);
                        }).then(function (result) {
                            console.log("doc deleted")

                            $scope.db.allDocs({ include_docs: true, descending: true }, function (err, doc) {
                                redrawTodosUI(doc.rows);


                                $scope.pouchDBList.splice(index, 1);
                                $scope.$apply();

                            });

                        }).catch(function (err) {
                            console.log(err);
                        });


                        //$scope.db.remove(doc);
                        //console.dir(bug)
                    });


                });

            };
            signalRRealTimeUpdatesSQLServerHub.client.addBug = function (t) {
                //alert("addBug called on client in angularjs:" );
                $scope.bugsList.push(new bugsViewModel(t.Id, t.Problem, t.Response, t.DateCreated));
                $scope.$apply();
                var pBug = {
                    _id: t.Id.toString(),
                    problem: t.Problem,
                    dateCreated: t.DateCreated
                };
                $scope.db.put(pBug, function callback(err, result) {
                    if (!err) {
                        console.log('Successfully posted a pBug!');
                        console.dir(pBug);
                        showTodos();
                        $scope.pouchDBList.push(pBug)
                        $scope.$apply();
                    }
                    else {
                        console.log("Error: " + err);
                    }
                });




                $scope.db.allDocs({ include_docs: true, descending: true }, function (err, doc) {
                    redrawTodosUI(doc.rows);
                    console.dir(doc.rows)
                });
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

                var bug = $scope.db.get(b.Id.toString()).then(function (doc) {

                    return $scope.db.put(
                        {
                            _id: b.Id.toString(),
                            _rev: doc._rev,
                            problem: b.Problem,
                            response: b.Response,
                            dateCreated: b.DateCreated,
                            dateResolved: b.DateResolved,
                        }

                        );
                }).then(function (result) {
                    console.log("doc updated")
                    showTodos();
                    angular.forEach($scope.pouchDBList, function (bug) {
                        console.dir(bug)
                        if (bug._id == b.Id) {
                            bug.problem = b.Problem;
                            bug.response = b.Response;
                            bug.dateCreated = b.DateCreated;
                            bug.dateResolved = b.DateResolved;
                            $scope.$apply();
                        }
                    });


                }).catch(function (err) {
                    console.log(err);
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
                var pBug = {
                    _id: b.Id.toString(),
                    problem: b.Problem,
                    dateCreated: b.DateCreated
                };
                $scope.db.put(pBug, function callback(err, result) {
                    if (!err) {
                        console.log('Successfully posted a pBug!');
                        console.dir(pBug);
                        showTodos();
                        $scope.pouchDBList.push(pBug); $scope.$apply();
                    }
                    else {
                        console.log("Error: " + err);
                    }
                });

                $scope.db.allDocs({ include_docs: true, descending: true }, function (err, doc) {
                    redrawTodosUI(doc.rows);
                    console.dir(doc.rows)
                });


            };
            // Methods called on the client (javascript)

            console.dir(signalRRealTimeUpdatesSQLServerHub)
            console.log("End: activate")

        }

        function showTodos() {
            $scope.db.allDocs({ include_docs: true, descending: true }, function (err, doc) {
                redrawTodosUI(doc.rows);

            });
        }

        function redrawTodosUI(todos) {
            var ul = document.getElementById('todo-list');
            ul.innerHTML = '';
            todos.forEach(function (todo) {
                ul.appendChild(createTodoListItem(todo.doc));
            });
        }
        function checkboxChanged(todo, event) {
            todo.completed = event.target.checked;
            $scope.db.put(todo);
        }
        function todoDblClicked(todo) {
            var div = document.getElementById('li_' + todo._id);
            var inputEditTodo = document.getElementById('input_' + todo._id);
            div.className = 'editing';
            inputEditTodo.focus();
        }
        function deleteButtonPressed(todo) {
            $scope.db.remove(todo);
        }
        function todoKeyPressed(todo, event) {
            if (event.keyCode === ENTER_KEY) {
                var inputEditTodo = document.getElementById('input_' + todo._id);
                inputEditTodo.blur();
            }
        }
        function todoBlurred(todo, event) {
            var trimmedText = event.target.value.trim();
            if (!trimmedText) {
                db.remove(todo);
            } else {
                todo.title = trimmedText;
                db.put(todo);
            }
        }
        function createTodoListItem(bug) {


            var labelProblem = document.createElement('label');
            labelProblem.style.margin = "00px 10px 00px 00px";
            labelProblem.appendChild(document.createTextNode("Problem: " + bug.problem));
            var labeResponse = document.createElement('label');
            labeResponse.style.margin = "00px 10px 00px 00px";
            labeResponse.appendChild(document.createTextNode("Response: " + bug.response));

            var labeDateCreated = document.createElement('label');
            labeDateCreated.style.margin = "00px 10px 00px 00px";

            labeDateCreated.appendChild(document.createTextNode("Created: " + quickDateFormat(bug.dateCreated)));

            var labeDateResolved = document.createElement('label');
            if (bug.dateResolved != null) {
                labeDateResolved.appendChild(document.createTextNode("Answered: " + quickDateFormat(bug.dateResolved)));
            }

            var divDisplay = document.createElement('div');
            divDisplay.className = 'view';
            divDisplay.appendChild(labelProblem);
            divDisplay.appendChild(labeResponse);
            divDisplay.appendChild(labeDateCreated);
            divDisplay.appendChild(labeDateResolved);

            //var inputEditTodo = document.createElement('input');
            //inputEditTodo.id = 'input_' + bug._id;
            //inputEditTodo.className = 'edit';
            //inputEditTodo.value = bug.problem;


            var li = document.createElement('li');
            li.id = 'li_' + bug._id;
            li.appendChild(divDisplay);
            //li.appendChild(inputEditTodo);


            return li;
        }
    }

    function quickDateFormat(dateIn) {
        dateIn = new Date(Date.parse(dateIn));
        var dateOut =
            dateIn.getDate().toString() + "/" +
            (dateIn.getMonth() + 1).toString() + "/" +
            dateIn.getFullYear().toString() + " @ " +
            dateIn.getHours().toString() + ":" +
            dateIn.getMinutes().toString();

        return dateOut;
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
