! function() {
    'use strict';
    angular.module('maidzo', ['ngMaterial', 'ngAnimate', 'ui.router', 'satellizer', 'angular-loading-bar', 'ngCart', 'LocalStorageModule'])
}(),
function() {
    'use strict';

    function urlSafe($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/)
    }
    urlSafe.$inject = ['$compileProvider'];

    function authConfig($authProvider) {
        $authProvider.baseUrl = 'http://api.maidzo.xyz/', $authProvider.tokenPrefix = 'maidzo'
    }
    authConfig.$inject = ['$authProvider'];

    function loaderConfig(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = !1
    }
    loaderConfig.$inject = ['cfpLoadingBarProvider'];

    function localStorage(localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('maidzo')
    }
    localStorage.$inject = ['localStorageServiceProvider'];
    angular.module('maidzo').config(urlSafe).config(authConfig).config(loaderConfig).config(localStorage)
}(),
function() {
    'use strict';

    function routeConfig($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/home'), $stateProvider.state('home', {
            url: '/home'
        }).state('auth', {
            'abstract': !0,
            url: '/auth',
            template: '<ui-view/>'
        }).state('auth.login', {
            url: '/login',
            templateUrl: 'maidzo/auth/login/login.html'
        }).state('auth.logout', {
            controller: ['AuthService', function(AuthService) {
                AuthService.logout()
            }]
        }).state('cart', {
            url: '/cart',
            templateUrl: 'maidzo/cart/cart.html'
        }).state('checkout', {
            url: '/checkout',
            templateUrl: 'maidzo/checkout/checkout.html',
            controller: 'CheckoutController as vm',
            data: {
                authenticate: !0
            },
            resolve: {
                userData: ['AuthService', function(AuthService) {
                    return AuthService.getAccount()
                }]
            }
        })
    }
    routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
    angular.module('maidzo').config(routeConfig)
}(),
function() {
    'use strict';
    angular.module('maidzo').constant('ENV', {
        name: 'development',
        API_CONFIG: {
            url: 'http://api.maidzo.xyz/'
        },
        SITE_CONFIG: {
            url: 'http://localhost:3000/'
        },
        BOT_CONFIG: {
            url: 'http://bot.maidzo.xyz/'
        }
    })
}(),
function() {
    'use strict';

    function currency() {
        return function(input, currency) {
            return isNaN(input) ? input : 'usd' === currency ? accounting.formatMoney(input, {
                symbol: '$',
                format: '%s %v',
                precision: 2
            }) : 'cny' === currency ? accounting.formatMoney(input, {
                symbol: '¥',
                format: '%s %v',
                precision: 2
            }) : 'vnd' === currency ? accounting.formatMoney(input, {
                symbol: '₫',
                format: '%v %s',
                precision: 0
            }) : void 0
        }
    }

    function exchange() {
        return function(input, rate) {
            return isNaN(input) ? input : accounting.formatMoney(input * rate, {
                symbol: '₫',
                format: '%v %s',
                precision: 0
            })
        }
    }
    angular.module('maidzo').filter('currency', currency).filter('exchange', exchange)
}(),
function() {
    'use strict';

    function getAuth($rootScope, $state, $location, $auth) {
        $rootScope.$on('$stateChangeStart', function(event, toState) {
            toState.data && toState.data.authenticate && !$auth.isAuthenticated() && ($state.go('auth.login'), event.preventDefault())
        })
    }
    getAuth.$inject = ['$rootScope', '$state', '$location', '$auth'];

    function currencyConfig($http, ENV, localStorageService) {
        $http.get(ENV.API_CONFIG.url + 'config').then(function(response) {
            localStorageService.set('currency', response.data.currency)
        })
    }
    currencyConfig.$inject = ['$http', 'ENV', 'localStorageService'];
    angular.module('maidzo').run(getAuth).run(currencyConfig)
}(),
function() {
    'use strict';

    function navigation() {
        var directive = {
            restrict: 'E',
            templateUrl: 'maidzo/components/navigation/navigation.html'
        };
        return directive
    }
    angular.module('maidzo').directive('navigation', navigation)
}(),
function() {
    'use strict';

    function NavigationController($mdSidenav, $auth) {
        function openSideNav() {
            $mdSidenav('navLeft').open()
        }

        function closeSideNav() {
            $mdSidenav('navLeft').close()
        }
        var vm = this;
        vm.isAuthenticated = $auth.isAuthenticated(), vm.openSideNav = openSideNav, vm.closeSideNav = closeSideNav
    }
    NavigationController.$inject = ['$mdSidenav', '$auth'];
    angular.module('maidzo').controller('NavigationController', NavigationController)
}(),
function() {
    'use strict';

    function AuthService($auth, $http, $q, ENV) {
        return {
            login: function(credentials) {
                return $auth.login(credentials)
            },
            logout: function() {
                return $auth.logout()
            },
            isAuthenticated: function() {
                return $auth.isAuthenticated()
            },
            getAccount: function() {
                return $http.get(ENV.API_CONFIG.url + 'auth/me?include=customer').then(function(response) {
                    return angular.isObject(response.data) ? response.data : void $q.reject(response.data)
                }, function(response) {
                    $q.reject(response.data)
                })
            },
            getUser: function() {
                return $auth.getPayload().user
            },
            getRole: function() {
                return $auth.getPayload().roles
            },
            getEmployee: function() {
                return $auth.getPayload().employee
            }
        }
    }
    AuthService.$inject = ['$auth', '$http', '$q', 'ENV'];
    angular.module('maidzo').factory('AuthService', AuthService)
}(),
function() {
    'use strict';

    function LoginController(AuthService, $mdToast, $state) {
        function submit() {
            AuthService.login(vm.user).then(function() {
                $state.go('home'), $mdToast.showSimple('Đăng nhập thành công!')
            })['catch'](function(response) {
                $mdToast.showSimple(response.data.message)
            })
        }
        var vm = this;
        AuthService.isAuthenticated() && $state.go('home'), vm.submit = submit
    }
    LoginController.$inject = ['AuthService', '$mdToast', '$state'];
    angular.module('maidzo').controller('LoginController', LoginController)
}(),
function() {
    'use strict';

    function CartController(ngCart, localStorageService, $mdToast) {
        var vm = this;
        vm.cart = ngCart, vm.exchangeRate = localStorageService.get('currency').vnd.rate.cny, vm.totalPrice = 0, angular.forEach(vm.cart.getItems(), function(item) {
            vm.totalPrice += item.getPrice() * item.getQuantity() + item.getData().shipping
        }), vm.sendDeleteMsgToBackground = function(id) {
            chrome.runtime.sendMessage({
                type: 'removeFromCart',
                itemId: id
            }, function(response) {
                'success' === response.removeFromCart && $mdToast.showSimple('Xóa sản phẩm thành công!')
            }), vm.cart.removeItemById(id)
        }
    }
    CartController.$inject = ['ngCart', 'localStorageService', '$mdToast'];
    angular.module('maidzo').controller('CartController', CartController)
}(),
function() {
    'use strict';

    function CheckoutController(userData, ngCart, localStorageService, $http, $state, $mdToast, ENV) {
        function submit() {
            $http.post(ENV.API_CONFIG.url + 'shop/checkout', {
                items: vm.cart.getItems(),
                customer: vm.customer
            }).then(function(response) {
                vm.cart.empty(), vm.checkoutSuccess = !0, vm.order = response.data.data
            }, function() {
                $mdToast.showSimple('Có lỗi xảy ra, vui lòng liên hệ bộ phận kỹ thuật!')
            })
        }
        var vm = this;
        vm.cart = ngCart, vm.exchangeRate = localStorageService.get('currency').vnd.rate.cny, vm.totalPrice = 0, angular.forEach(vm.cart.getItems(), function(item) {
            vm.totalPrice += item.getPrice() * item.getQuantity() + item.getData().shipping
        }), vm.customer = userData.data.customer.data, vm.submit = submit
    }
    CheckoutController.$inject = ['userData', 'ngCart', 'localStorageService', '$http', '$state', '$mdToast', 'ENV'];
    angular.module('maidzo').controller('CheckoutController', CheckoutController)
}();