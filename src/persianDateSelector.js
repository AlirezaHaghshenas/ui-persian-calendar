angular.module('ui.persianDateSelector', ['ui.bootstrap'])
.directive('uiPersianDateSelector', function () {
    return {
        restrict: 'E',
        scope: {
            date: '='
        },
        templateUrl: '../src/persianDateSelector.html',
        controller: ['$scope', '$filter', function ($scope, $filter) {
            $scope.weeks = [];
            $scope.year;
            $scope.month;
            $scope.MonthName;
            $scope.dayOfWeek;
            $scope.time;

            $scope.activeInfo = {
                year: null,
                month: null,
                day: null
            };

            $scope.toggled = function (open) {
                console.log('Dropdown is now: ', open);
            };

            $scope.toggleDropdown = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                //$scope.status.isopen = !$scope.status.isopen;
            };

            $scope.selectDate = function (day) {
                if (day) {
                    $scope.activeInfo.day = day.day;
                    if (day.dayOfWeek == 0)
                        day.dayOfWeek = 7;
                    $scope.dayOfWeek = PERSIAN_WEEKDAYS[parseInt(day.dayOfWeek) - 1];
                }

                var dateParts = jd_to_gregorian(persian_to_jd($scope.activeInfo.year, $scope.activeInfo.month, $scope.activeInfo.day));
                $scope.date = dateParts[0].toString() + '-' + dateParts[1].toString() + '-' + dateParts[2].toString() + 'T' + $scope.time;

                //jquery
                var obj = $(this).parents('.dropdown-menu')[0];
                $(obj).css('display', 'none');
                $('.dropdown').parents('.ui-grid-viewport')[0].scrollTop += 1;
            }

            $scope.nextYear = function (year) {
                $scope.year++;
            }

            $scope.previousYear = function (year) {
                $scope.year--;
            }

            $scope.nextMonth = function (month) {
                $scope.month++;
            }

            $scope.previousMonth = function (month) {
                $scope.month--;
            }

            $scope.updateDays = function () {
                var month = $scope.month;
                var year = $scope.year;
                if (year == null || month == null) {
                    $scope.weeks = [];
                    return;
                }
                month = parseInt(month.toString());
                year = parseInt(year.toString());
                if (month < 1) {
                    month = 12;
                    year--;
                }
                if (month > 12) {
                    month = 1;
                    year++;
                }
                if (year < 1300) {
                    year = 1300;
                }
                if (year > 1500) {
                    year = 1500;
                }
                $scope.year = year;
                $scope.month = month;
                if ($scope.activeInfo.year == year && $scope.activeInfo.month == month) {
                    return;
                }
                $scope.activeInfo.year = year;
                $scope.activeInfo.month = month;
                $scope.weeks = [];
                var daysCount;
                if (month <= 6) {
                    daysCount = 31;
                } else if (month < 12 || leap_persian(year)) {
                    daysCount = 30;
                } else {
                    daysCount = 29;
                }
                var day = 1;
                var dayOfWeek = mod(jwday(persian_to_jd(year, month, day)) + 1, 7);

                while (day <= daysCount) {
                    if (day == 1 || dayOfWeek == 7) {
                        $scope.weeks.push([]);
                        if (day == 1) {
                            for (var w = 0; w < dayOfWeek; w++) {
                                $scope.weeks[$scope.weeks.length - 1].push({});
                            }
                        }
                    }
                    if (dayOfWeek == 7) {
                        dayOfWeek = 0;
                    }
                    $scope.weeks[$scope.weeks.length - 1].push({
                        day: day,
                        dayOfWeek: dayOfWeek
                    });
                    day++;
                    dayOfWeek++;
                }
            };

            $scope.$watch('year', $scope.updateDays);
            $scope.$watch('month', $scope.updateDays);

            $scope.$watch('date', function () {
                if ($scope.date) {
                    var date = $scope.date.split('T')[0];
                    $scope.time = $scope.date.split('T')[1];

                    var y = parseInt((date.split('-')[0]).toString());
                    var m = parseInt((date.split('-')[1]).toString());
                    var d = parseInt((date.split('-')[2]).toString());

                    var persianDate = jd_to_persian(gregorian_to_jd(y, m, d));
                    $scope.year = persianDate[0];
                    $scope.month = persianDate[1];
                    for (var key in Month) {
                        if (Month[key] == $scope.month) {
                            $scope.MonthName = key;
                        }
                    }
                    $scope.activeInfo.day = persianDate[2];
                    $scope.dayOfWeek = PERSIAN_WEEKDAYS[mod(jwday(persian_to_jd($scope.year, $scope.month, $scope.activeInfo.day)), 7)];
                }
            });

            $scope.getTime = function () {
                var now = $filter('date')(new Date(), 'dd/MM/yyyy');
                $scope.dateNow = now.split('/');
                $scope.now = jd_to_persian(gregorian_to_jd($scope.dateNow[2], parseInt($scope.dateNow[1]), parseInt($scope.dateNow[0])));
            }

            $scope.goToday = function (today) {
                $scope.activeInfo.year = today[0];
                $scope.activeInfo.month = today[1];
                $scope.activeInfo.day = today[2];
                $scope.selectDate(null);
            }

            $scope.getTime();

        }]
    };
});