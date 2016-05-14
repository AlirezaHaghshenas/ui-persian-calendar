angular.module('ui.persianDateSelector', ['ui.bootstrap'])
.directive('uiPersianDateSelector', function () {
	return {
		restrict: 'E',
		scope: {
			date: '=',
			time: '=?'
		},
		templateUrl: '../src/persianDateSelector.html',
		controller: ['$scope', '$filter', function ($scope, $filter) {
			$scope.weeks = [];
			$scope.year;
			$scope.month;
			$scope.MonthName;
			$scope.dayOfWeek;
			$scope.time = $scope.time || '00:00:00.000Z';
			$scope.monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

			var leftPad = function (str, len, padChar) {
				str = str.toString();
				while (str.length < len) {
					str = padChar + str;
				}
				return str;
			};

			$scope.today = function () {
				var today = new Date();
				return leftPad(today.getFullYear(), 4, '0') + '-' + leftPad(today.getMonth() + 1, 2, '0') + '-' + leftPad(today.getDate(), 2, '0') + 'T' + $scope.time + 'Z';
			};

			$scope.date = $scope.date || $scope.today();

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
				$scope.date = leftPad(dateParts[0], 4, '0') + '-' + leftPad(dateParts[1], 2, '0') + '-' + leftPad(dateParts[2], 2, '0') + 'T' + $scope.time;
			};

			$scope.nextYear = function (year) {
				$scope.year++;
			};

			$scope.previousYear = function (year) {
				$scope.year--;
			};

			$scope.nextMonth = function (month) {
				$scope.month++;
			};

			$scope.previousMonth = function (month) {
				$scope.month--;
			};

			$scope.updateDays = function () {
				var month = $scope.month;
				var year = $scope.year;
				if (!year || !month) {
					$scope.weeks = [];
					$scope.activeInfo.year = null;
					$scope.activeInfo.month = null;
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
					var parts = $scope.date.split('T');
					var date = parts[0].split('-');
					$scope.time = parts[1];

					var y = parseInt(date[0]);
					var m = parseInt(date[1]);
					var d = parseInt(date[2]);

					var persianDate = jd_to_persian(gregorian_to_jd(y, m, d));
					$scope.year = persianDate[0];
					$scope.month = persianDate[1];
					$scope.MonthName = $scope.monthNames[$scope.month - 1];
					$scope.activeInfo.day = persianDate[2];
					$scope.dayOfWeek = PERSIAN_WEEKDAYS[mod(jwday(persian_to_jd($scope.year, $scope.month, $scope.activeInfo.day)), 7)];
				}
			});

			$scope.getTime = function () {
				var now = $filter('date')(new Date(), 'dd/MM/yyyy');
				$scope.dateNow = now.split('/');
				$scope.now = jd_to_persian(gregorian_to_jd($scope.dateNow[2], parseInt($scope.dateNow[1]), parseInt($scope.dateNow[0])));
			};

			$scope.goToday = function () {
				$scope.activeInfo.year = today[0];
				$scope.activeInfo.month = today[1];
				$scope.activeInfo.day = today[2];
				$scope.selectDate(null);
			}

			$scope.getTime();

		}]
	};
});