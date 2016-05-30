function leftPad(str, len, padChar) {
	str = str.toString();
	while (str.length < len) {
		str = padChar + str;
	}
	return str;
};

angular.module('ui.persianDateSelector', ['ui.bootstrap'])
.directive('persianDate', function () {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, element, attr, ngModel) {
			ngModel.$parsers.push(function (text) {
				if (text == null) {
					return null;
				}
				var parts = text.split('/');
				if (parts.length != 3) {
					return null;
				}
				var y = parseInt(parts[0]);
				var m = parseInt(parts[1]);
				var d = parseInt(parts[2]);
				if (m < 1 || m > 12 || d < 1 || d > 31) {
					return null;
				}
				var greg = jd_to_gregorian(persian_to_jd(y, m, d));
				return leftPad(greg[0], 4, '0') + '-' + leftPad(greg[1], 2, '0') + '-' + leftPad(greg[2], 2, '0') + 'T00:00:00.000Z';
			});

			ngModel.$formatters.push(function (date) {
				if (date == null) {
					return null;
				}
				var parts = date.split('T');
				if (parts.length != 2) {
					return null;
				}
				parts = parts[0].split('-');
				if (parts.length != 3) {
					return null;
				}
				var y = parseInt(parts[0]);
				var m = parseInt(parts[1]);
				var d = parseInt(parts[2]);
				if (m < 1 || m > 12 || d < 1 || d > 31) {
					return null;
				}
				var pers = jd_to_persian(gregorian_to_jd(y, m, d));
				return leftPad(pers[0], 4, '0') + '/' + leftPad(pers[1], 2, '0') + '/' + leftPad(pers[2], 2, '0');
			});
		}
	};
})
.directive('uiPersianDateSelector', function () {
	return {
		restrict: 'E',
		scope: {
			date: '=',
			time: '=?',
			dateSelected: '=?'
		},
		templateUrl: '../src/persianDateSelector.html',
		controller: ['$scope', '$filter', function ($scope, $filter) {
			$scope.weeks = [];
			$scope.year;
			$scope.month;
			$scope.MonthName;
			$scope.dayOfWeek;
			$scope.time = ($scope.time || '00:00:00.000').replace('Z', '');
			$scope.monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
			$scope.dayNames = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

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
					$scope.dayOfWeek = $scope.dayNames[parseInt(day.dayOfWeek) - 1];
				}

				var dateParts = jd_to_gregorian(persian_to_jd($scope.activeInfo.year, $scope.activeInfo.month, $scope.activeInfo.day));
				$scope.date = leftPad(dateParts[0], 4, '0') + '-' + leftPad(dateParts[1], 2, '0') + '-' + leftPad(dateParts[2], 2, '0') + 'T' + $scope.time + 'Z';
				if ($scope.dateSelected) {
					$scope.dateSelected($scope.date);
				}
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
				$scope.MonthName = $scope.monthNames[$scope.month - 1];
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
					$scope.time = (parts[1] || '00:00:00.000').replace('Z', '');

					var y = parseInt(date[0]);
					var m = parseInt(date[1]);
					var d = parseInt(date[2]);

					var persianDate = jd_to_persian(gregorian_to_jd(y, m, d));
					$scope.year = persianDate[0];
					$scope.month = persianDate[1];
					$scope.activeInfo.day = persianDate[2];
					$scope.dayOfWeek = $scope.dayNames[mod(jwday(persian_to_jd($scope.year, $scope.month, $scope.activeInfo.day)) + 1, 7)];
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
})
.directive('uiPersianDateEntryField', function () {
	return {
		restrict: 'E',
		scope: {
			date: '='
		},
		template: '<span><input type="text" persian-date ng-model="date" ui-mask="1399/99/99" ui-mask-placeholder ui-mask-placeholder-char="_" /><button type="button" class="glyphicon" ng-click="showPopup();"></button></span>',
		controller: ['$scope', '$uibModal', function ($scope, $uibModal) {
			$scope.showPopup = function () {
				$uibModal.open({
					animation: true,
					template: '<ui-persian-date-selector date="date" date-selected="dateSelected" />',
					controller: 'uibPersianDateModalController',
					resolve: {
						'currentDate': function () {
							return $scope.date;
						}
					}
				}).result.then(function (date) {
					$scope.date = date;
				});
			};
		}]
	};
})
.controller('uibPersianDateModalController', ['$scope', 'currentDate', '$uibModalInstance', function ($scope, currentDate, $uibModalInstance) {
	$scope.date = currentDate;
	$scope.dateSelected = function (date) {
		$uibModalInstance.close(date);
	};
}]);