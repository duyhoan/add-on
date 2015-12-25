try {
    $('#J_regionSellServer').addClass('notranslate')
} catch (err) {}
try {
    $('#choose').addClass('notranslate')
} catch (err) {}! function() {
    'use strict';
    window.addEventListener('load', function() {
        $.get(chrome.extension.getURL('mzContent/toolbar.html'), function(data) {
            $('body').append(data), $('[data-toggle="tooltip"]').tooltip();
            var store = (window.location.href, $.url('hostname')),
                textarea = document.createElement('TEXTAREA');
            textarea.placeholder = chrome.i18n.getMessage('noteTextareaPlaceholder'), textarea.id = 'orderNoteTextarea', textarea.rows = '2';
            var tmpDL = document.createElement('DL');
            tmpDL.id = 'chuyenhang365-dl';
            var tmpDT = document.createElement('DT');
            tmpDT.id = 'chuyenhang365-dt';
            var tmpDD = document.createElement('DD');
            if (tmpDD.id = 'chuyenhang365-dd', tmpDD.appendChild(textarea), tmpDL.appendChild(tmpDT), tmpDL.appendChild(tmpDD), tmpDT.textContent = chrome.i18n.getMessage('noteLabel'), tmpDT.style.transform = 'translateY(-120%)', 'detail.1688.com' === store) {
                var objOrder = document.querySelector('.mod-detail-purchasing').querySelector('.obj-order');
                textarea.cols = '55', tmpDT.style.marginRight = '20px', document.querySelector('.mod-detail-purchasing').querySelector('.d-content').insertBefore(tmpDL, objOrder)
            } else if ('detail.tmall.com' === store || 'world.tmall.com' === store || 'taiwan.tmall.com' === store) {
                var tbAction = document.querySelector('#J_DetailMeta').querySelector('div.tb-action');
                document.querySelector('#J_DetailMeta').querySelector('.tb-sku').insertBefore(tmpDL, tbAction)
            } else if ('item.taobao.com' === store || 'world.taobao.com' === store || 'taiwan.taobao.com' === store) {
                var JBoxBuycart = document.querySelector('#J_box_buycart');
                try {
                    document.querySelector('#J_isSku').insertBefore(tmpDL, JBoxBuycart)
                } catch (err) {
                    JBoxBuycart || (JBoxBuycart = document.querySelector('#J_juValid')), tmpDT.style.transform = 'translateY(50%)', document.querySelector('#J_isku').querySelector('.tb-skin').insertBefore(tmpDL, JBoxBuycart)
                }
            } else if ('item.jd.com' === store) {
                var chooseBtn = document.querySelector('#choose-btns');
                chooseBtn.parentElement.insertBefore(tmpDL, chooseBtn)
            } else if ('www.yougou.com' === store) {
                var qbuy = document.querySelector('p.qbuy');
                tmpDT.style.transform = 'translateY(50%)', tmpDL.style.marginBottom = '10px', qbuy.parentElement.insertBefore(tmpDL, qbuy)
            }
            document.getElementById('addToCart').onclick = function() {
                var callbackFunc, data, url = window.location.href,
                    store = $.url('hostname'),
                    xmlHttp = new XMLHttpRequest;
                'detail.1688.com' === store ? callbackFunc = crawlInfo1688 : 'detail.tmall.com' === store || 'world.tmall.com' === store || 'taiwan.tmall.com' === store ? callbackFunc = crawlInfoTmall : 'item.taobao.com' === store || 'world.taobao.com' === store || 'taiwan.taobao.com' === store ? callbackFunc = crawlInfoTaobao : 'item.jd.com' === store ? callbackFunc = crawlInfoJd : 'www.yougou.com' === store && (callbackFunc = crawInfoYougou), xmlHttp.onreadystatechange = function() {
                    4 === xmlHttp.readyState && 200 === xmlHttp.status && (data = callbackFunc(xmlHttp.responseText), 
                        console.log(data['data'][0]),
                        $.ajax({
                            url: 'http://chuyenhang365.com/api/shop_module/cart/',
                            type: "POST",
                            dataType: "json",
                            data: JSON.stringify(data['data'][0]),
                            contentType: "application/json; charset=UTF-8",
                            //xhrFields: {
                            //  withCredentials: true
                            //},
                            beforeSend: function() {
                                $('#box-confirm-nh-site').remove();
                            },
                            success: function(data_response, textStatus, jqXHR) {
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
                                        console.log(data_response);
                                        chrome.runtime.sendMessage({
                                            type: 'addToCart',
                                            productData: data_response
                                        }); 
                                    },
                                    error: function( jqXHR, textStatus, errorThrown ) {
                                        n.removeDisabledButtonCart();
                                        msg = "Có lỗi xảy ra (cần đăng nhập trước khi đặt hàng):"+textStatus
                                        alert(msg)
                                        //$("body").append(msg)
                                        console.log(jqXHR);
                                    }
                                });
                            },
                            error: function( jqXHR, textStatus, errorThrown ) {
                                n.removeDisabledButtonCart();
                                msg = "Có lỗi xảy ra (cần đăng nhập trước khi đặt hàng):"+textStatus
                                alert(msg)
                                //$("body").append(msg)
                                console.log(jqXHR);
                            }
                        })
                        
                    )
                }, xmlHttp.open('GET', url, !0), xmlHttp.send(null)
            }, document.getElementById('openOrder').onclick = function() {
                var store = $.url('hostname'),
                    website_url = 'http://chuyenhang365.com/#/cart',
                    itemId = '',
                    orderUrl = '';
                // if ('item.taobao.com' === store) itemId = $.url('?id'), orderUrl = website_url + 'shop/products/taobao/' + itemId;
                // else if ('world.taobao.com' === store) itemId = $.url('filename'), orderUrl = website_url + 'shop/products/taobao/' + itemId;
                // else if ('detail.tmall.com' === store) itemId = $.url('?id'), orderUrl = website_url + 'shop/products/tmall/' + itemId;
                // else if ('world.tmall.com' === store) itemId = $.url('filename'), orderUrl = website_url + 'shop/products/tmall/' + itemId;
                // else {
                //     if ('detail.1688.com' !== store) return void alert('Có lỗi xảy ra hoặc website chưa được hỗ trợ!');
                //     itemId = $.url('filename'), orderUrl = website_url + 'shop/products/alibaba/' + itemId
                // }
                window.location.href = website_url
            }, document.getElementById('openCart').onclick = function() {
                var url = chrome.extension.getURL('popup.html#/cart');
                chrome.runtime.sendMessage({
                    type: 'openUrl',
                    url: url
                })
            }, document.getElementById('openCheckout').onclick = function() {
                //var url = chrome.extension.getURL('popup.html#/checkout');
                console.log(vm.cart.getItems);
                // chrome.runtime.sendMessage({
                //     type: 'openUrl',
                //     url: url
                // })
            }, document.getElementById('openInfo').onclick = function() {
                chrome.runtime.sendMessage({
                    type: 'refresh'
                }, function(response) {
                    console.log(response)
                })
            }
        })
    })
}();