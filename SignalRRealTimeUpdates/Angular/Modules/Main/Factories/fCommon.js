(function () {
    'use strict';

    angular
        .module('appMain')
        .factory('fCommon', fCommon);


    function fCommon() {

        var service = {
            getDatePlusHours: getDatePlusHours,
            getGuid: getGuid,
            helloWorld: helloWorld,
            getQueryParam: getQueryParam,
            helloWorldAnon: function helloWorld() { alert('Hello WorldNon') },
            getDeDuplicate: getDeDuplicate,
            getRotate: getRotate,
            getLeastCommonMultiple: getLeastCommonMultiple,
            getLeastCommonMultipleByArray: getLeastCommonMultipleByArray,
            find_char_NN: find_char_NN,
            find_char_N: find_char_N,

        };

        String.prototype.find_char_NN = function find_char_NN(s1, s2) {

            function findCharsNN(string1, string2) {
                var hit_map = {}, // object with all matching chars as keys
                    result = "";
                for (var i = 0, len1 = string1.length; i < len1; i++) {
                    var char1 = string1[i];
                    for (var j = 0, len2 = string2.length; j < len2; j++) {
                        var char2 = string2[j];
                        if (char1 == char2 && hit_map[char1] == undefined) {
                            hit_map[char1] = "hit";
                            result += char1;
                        }
                    }
                }
                return result;
            }

            return findCharsNN(s1, s2);
        }
        String.prototype.find_char_N = function find_char_N(s1, s2) {

            function findCharsN(string1, string2) {
                var result = "",
                    chars1 = {}, // characters in the first string
                    chars2 = {}; // characters in the second string
                for (var j = 0, len2 = string2.length; j < len2; j++) {
                    chars2[string2[j]] = true;
                }
                for (var i = 0, len1 = string1.length; i < len1; i++) {
                    var char1 = string1[i];
                    if (chars2[char1] && chars1[char1] == undefined) {
                        chars1[char1] = "hit";
                        result += char1;
                    }
                }
                return result;
            }


            return findCharsN(s1, s2);
        }

        String.prototype.leastCommonMultiple = function leastCommonMultiple(min, max) {

            function leastCommonMultiple(min, max) {
                function range(min, max) {
                    var arr = [];
                    for (var i = min; i <= max; i++) {
                        arr.push(i);
                    }
                    console.dir(arr)
                    return arr;
                }


                function gcd(a, b) {
                    return !b ? a : gcd(b, a % b);
                }

                function lcm(a, b) {
                    return (a * b) / gcd(a, b);
                }

                var multiple = min;
   
                range(min, max).forEach(function (n) {
                    multiple = lcm(multiple, n);

                });

                //var arr = [3, 4, 7]
                //multiple = 3;
                //rangeX(arr).forEach(function (n) {
                //    multiple = lcm(multiple, n);
                //    alert(multiple)

                //});

                return multiple;
            }

            function leastCommonMultipleArray(array) {

                function rangeX(array) {
                    var arr = [];
                    for (var i = 0; i < array.length; i++) {
                        arr.push(array[i]);
                    }
                    console.dir(arr)
                    return arr;
                }

                function gcd(a, b) {
                    return !b ? a : gcd(b, a % b);
                }

                function lcm(a, b) {
                    return (a * b) / gcd(a, b);
                }

                var multiple = array[0];
                rangeX(array).forEach(function (n) {
                    multiple = lcm(multiple, n);
  
                });

                return multiple;
            }

            //return leastCommonMultipleArray([3,4,7]);
            return leastCommonMultiple(min, max);
        }

        String.prototype.leastCommonMultipleByArray = function leastCommonMultipleByArray(array) {

           function leastCommonMultipleArray(array) {

                function rangeX(array) {
                    var arr = [];
                    for (var i = 0; i < array.length; i++) {
                        arr.push(array[i]);
                    }
                    console.dir(arr)
                    return arr;
                }

                function gcd(a, b) {
                    return !b ? a : gcd(b, a % b);
                }

                function lcm(a, b) {
                    return (a * b) / gcd(a, b);
                }

                var multiple = array[0];
                rangeX(array).forEach(function (n) {
                    multiple = lcm(multiple, n);

                });

                return multiple;
            }

           return leastCommonMultipleArray(array);
        }

        String.prototype.deDuplicate = function deDuplicate(arg) {
            this.deDuplicateRemoved = arg.reduce(function (a, b) {
                if (a.indexOf(b) < 0) a.push(b);
                return a;
            }, []);

            return this.deDuplicateRemoved
        }

        Array.prototype.rotate = function (array, n) {
            return array.slice(n, array.length).concat(array.slice(0, n));
        }

        Date.prototype.addHours = function (h) {
            this.setTime(this.getTime() + (h * 60 * 60 * 1000));
            return this;
        }

        String.prototype.guid = function guid() {
            function _p8(s) {
                var p = (Math.random().toString(16) + "000000000").substr(2, 8);
                return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
            }
            return _p8() + _p8(true) + _p8(true) + _p8();
        }



        return service;

        function helloWorld() { alert('Hello World') }
        function getDatePlusHours(hours) {

            var addedHoursDate = new Date().addHours(hours);

            return addedHoursDate;
        }
        function getGuid() { return new String().guid(); }
        function getQueryParam(param) {
            var result = window.location.search.match(
                new RegExp("(\\?|&)" + param + "(\\[\\])?=([^&]*)")
            );

            return result ? result[3] : false;
        }
        function getDeDuplicate(arg) {return new String().deDuplicate(arg); }
        function getRotate(array, n) { return new Array().rotate(array, n); }
        function getLeastCommonMultiple(min, max) { return new String().leastCommonMultiple(min, max); }
        function getLeastCommonMultipleByArray(array) { return new String().leastCommonMultipleByArray(array); }
        function find_char_NN(s1, s2) { return new String().find_char_NN(s1, s2); }
        function find_char_N(s1, s2) { return new String().find_char_N(s1, s2); }

        //def find_char_NN(string1, string2):
        //ret = ""
        //for c in string1:
        //    for cc in string2:
        //        if c == cc:
        //            ret += c
        //break
        //return ret
    
        //def find_char_N(string1, string2):
        //ret = ""
        //infoset = set(list(tring2))
        //for c in string1:
        //    if c in infoset:
        //        ret += c
        //return ret

//         public static char[] getCommonCharNSquard(char[] a, char[] b) {
//  String ret = new String();
  
//        for(int i = 0; i < a.length; i++)
//        for(int j=0; j <b.length; j++) {
//            if(a[i] == b[j]) {
//                if(ret.indexOf(a[i]) == -1)
//                    ret += a[i]; // order of a
//                break; // it may reduce the processing time, but still NSquard
//            }
//        }
  
//        return ret.toCharArray();
//    }
 
// public static char[] getCommonCharN(char[] a, char[] b) {
//  String ret = new String();
//    boolean[] flags = new boolean[256];  //sizeOf(char)=256
  
//    for(int i = 0; i < b.length; i++)
//    flags[b[i]] = true;
  
//    for(int j=0; j <a.length; j++)
//    if(flags[a[j]] == true) {
//        ret += a[j];  // order of a
//        flags[a[j]] = false;
//    }
//    return ret.toCharArray();
//}

//}

    }
})();