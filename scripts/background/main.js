! function() {
    'use strict';

    function BackgroundController(ngCart) {
        var vm = this;
        vm.cart = ngCart, chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
            if ('addToCart' === message.type) {
                if (message.productData.success) {
                    var id, name, price, quantity, data, i;
                    for (i = 0; i < message.productData.data.length; i++) id = message.productData.data[i].id + message.productData.data[i].option, name = message.productData.data[i].title, price = message.productData.data[i].price, quantity = message.productData.data[i].quantity, data = {
                        detail_url: message.productData.data[i].url,
                        item_id: message.productData.data[i].id,
                        shipping: message.productData.data[i].shipping_price,
                        image: message.productData.data[i].image,
                        shop_name: message.productData.data[i].shop_name,
                        shop_seller: message.productData.data[i].shop_seller,
                        options: message.productData.data[i].option,
                        comment: message.productData.data[i].comment ? message.productData.data[i].comment : '',
                        currency: 'cny'
                    }, vm.cart.addItem(id, name, price, quantity, data)
                }
                var myMessage = {
                    type: 'basic',
                    title: 'Thông báo',
                    message: message.productData.message,
                    iconUrl: 'images/icon-128.png'
                };
                chrome.notifications.create('notice', myMessage, function(notificationId) {
                    setTimeout(function() {
                        chrome.notifications.clear(notificationId, function(wasCleared) {
                            console.log(wasCleared)
                        })
                    }, 3e3)
                }), sendResponse({
                    addToCart: 'success'
                })
            }
            'removeFromCart' === message.type && (vm.cart.removeItemById(message.itemId), sendResponse({
                removeFromCart: 'success',
                updatedCart: JSON.parse(JSON.stringify(vm.cart))
            })), 'openUrl' === message.type && chrome.tabs.create({
                url: message.url
            })
        }), chrome.runtime.onInstalled.addListener(function() {
            var competitors = {
                    orderhang: 'ZXBia2dwaWdnY2xwZ2JrZ2xtaGlva2xvb21qaWxrZ2E=',
                    taobaoexpress: 'bmhwY2ttZG5maGZuamRra2xsY3BrY2RqZmNsYmhva20=',
                    nhaphangtrungquoc: 'anBtY2dkY2xpZG1ranBsaGtvY2NvbGxkZmpha2pnaGs=',
                    dathangquangchau: 'ZGJhaGRnaGJpbmJlam9iZ2dja2xncHBna2Rra29rYmQ=',
                    seudo: 'bGltbWdpaHBiYW1iZ2pnZmJkZWFubmZiZmNmcG9kZms='
                },
                competitors_array = [];
            angular.forEach(competitors, function(value, key) {
                competitors_array.push(window.atob(value))
            }), chrome.management.getAll(function(extensions) {
                for (var i = 0; i < extensions.length; i++) - 1 !== competitors_array.indexOf(extensions[i].id) && chrome.management.setEnabled(extensions[i].id, !1)
            })
        }), chrome.runtime.onUpdateAvailable.addListener(function() {
            var message = {
                type: 'basic',
                title: 'Thông báo',
                message: chrome.i18n.getMessage('appNewUpdate'),
                iconUrl: 'images/icon-128.png'
            };
            chrome.notifications.create('notice', message, function(notificationId) {
                setTimeout(function() {
                    chrome.notifications.clear(notificationId, function(wasCleared) {
                        console.log(wasCleared)
                    })
                }, 5e3)
            })
        })
    }
    BackgroundController.$inject = ['ngCart'];
    angular.module('background', ['ngCart']).controller('BackgroundController', BackgroundController)
}();