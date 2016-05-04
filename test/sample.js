angular.module('sample', ['ui.persianDateSelector'])
.controller('sample', function ($scope) {
   $scope.model={
       date: null
   };
});