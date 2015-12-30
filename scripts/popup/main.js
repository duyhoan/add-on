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
        $authProvider.baseUrl = 'http://chuyenhang365.com/api/user/', $authProvider.tokenPrefix = 'chuyenhang365'
    }
    authConfig.$inject = ['$authProvider'];

    function loaderConfig(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = !1
    }
    loaderConfig.$inject = ['cfpLoadingBarProvider'];

    function localStorage(localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('maidzo')
    }

    function themeConfig(mdThemingProvider) {
         mdThemingProvider.theme('default')
            .warnPalette('teal');
    }
    themeConfig.$inject = ['$mdThemingProvider']
    localStorage.$inject = ['localStorageServiceProvider'];
    angular.module('maidzo').config(urlSafe).config(authConfig).config(loaderConfig).config(localStorage).config(themeConfig)
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
            url: 'http://chuyenhang365.com/'
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
        $http.get('http://api.maidzo.xyz/' + 'config').then(function(response) {
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

    function CartController(ngCart, localStorageService, $scope, $mdToast) {
        var vm = this;
        vm.cart = ngCart;
        $.ajax({
            url: 'http://chuyenhang365.com/api/shop_module/cart/?page_size=1000',
            type: "GET",
            dataType: "json",
            //data: JSON.stringify(data['data'][0]),
            contentType: "application/json; charset=UTF-8",
            //xhrFields: {
            //  withCredentials: true
            //},
            beforeSend: function() {
                $('#box-confirm-nh-site').remove();
            },
            success: function(data_response, textStatus, jqXHR) {
                var id, name, price, quantity, data, i;
                for (i = 0; i < data_response.results.length; i++) id = data_response.results[i].id + data_response.results[i].options_selected, name = data_response.results[i].name, price = data_response.results[i].price, quantity = data_response.results[i].quantity, data = {
                    detail_url: data_response.results[i].detail_url,
                    cart_id: data_response.results[i].id,
                    item_id: data_response.results[i].sku,
                    shipping: data_response.results[i].shipping,
                    image: data_response.results[i].image_url,
                    //shop_name: message.productData.results[i].shop_name,
                    //shop_seller: message.productData.results[i].shop_seller,
                    options: data_response.results[i].options_selected,
                    comment: data_response.results[i].note ? data_response.results[i].note : '',
                    currency: 'cny'
                }, vm.cart.addItem(id, name, price, quantity, data)
            },
            error: function( jqXHR, textStatus, errorThrown ) {
                n.removeDisabledButtonCart();
                msg = "Có lỗi xảy ra (cần đăng nhập trước khi đặt hàng):"+textStatus
                alert(msg)
                //$("body").append(msg)
                console.log(jqXHR);
            }
        });
        vm.exchangeRate = localStorageService.get('currency').vnd.rate.cny, vm.totalPrice = 0, angular.forEach(vm.cart.getItems(), function(item) {
            vm.totalPrice = parseFloat(vm.totalPrice) + (parseFloat(item.getPrice()) * parseInt(item.getQuantity())) + parseFloat(item.getData().shipping);
        }),
        vm.sendDeleteMsgToBackground = function(id,itemId) {
            $.ajax({
                url: 'http://chuyenhang365.com/api/shop_module/cart/'+id+'/',
                type: "DELETE",
                dataType: "json",
                //data: JSON.stringify(data['data'][0]),
                contentType: "application/json; charset=UTF-8",
                //xhrFields: {
                //  withCredentials: true
                //},
                beforeSend: function() {
                    $('#box-confirm-nh-site').remove();
                },
                success: function(data_response, textStatus, jqXHR) {
                    chrome.runtime.sendMessage({
                        type: 'removeFromCart',
                        itemId: id
                    }, function(response) {
                        'success' === response.removeFromCart && $mdToast.showSimple('Xóa sản phẩm thành công!')
                    });
                    vm.cart.removeItemById(itemId);
                },
                error: function( jqXHR, textStatus, errorThrown ) {
                    n.removeDisabledButtonCart();
                    msg = "Có lỗi xảy ra (cần đăng nhập trước khi đặt hàng):"+textStatus
                    alert(msg)
                    //$("body").append(msg)
                    console.log(jqXHR);
                }
            })
        }
    }
    CartController.$inject = ['ngCart', 'localStorageService', '$scope', '$mdToast'];
    angular.module('maidzo').controller('CartController', CartController)
}();