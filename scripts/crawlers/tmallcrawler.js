function crawlInfoTmall(responseHTML) {
    var i, el = document.createElement('html');
    el.innerHTML = responseHTML;
    var id = document.querySelector('#LineZing').getAttribute('itemid'),
        url = 'https://detail.tmall.com/item.htm?id=' + id,
        title = el.querySelector('.tb-detail-hd').querySelector('h1').textContent.trim(),
        mainImage = el.querySelector('#J_ImgBooth').getAttribute('src');
    mainImage = mainImage.replace(/\.jpg_.*/, '.jpg'), mainImage.indexOf('http') < 0 && (mainImage = 'https:' + mainImage);
    var productImage = mainImage,
        shopName = null;
    try {
        shopName = el.querySelector('a.slogo-shopname').querySelector('strong').textContent.trim()
    } catch (err) {}
    var sellerName = el.querySelector('input[name=seller_nickname]').getAttribute('value'),
        optionDataObj = {},
        optionLabels = [],
        optionSelectedValues = [],
        tbPropsOriginal = document.getElementsByClassName('J_TSaleProp'),
        tbProps = el.getElementsByClassName('J_TSaleProp');
    for (i = 0; i < tbProps.length; i++) {
        optionLabels.push(tbProps[i].getAttribute('data-property'));
        var selectedli = tbPropsOriginal[i].querySelector('li.tb-selected');
        if (!selectedli) return {
            success: !1,
            message: chrome.i18n.getMessage('setValueForEveryOption')
        };
        for (var dataValue = selectedli.getAttribute('data-value'), tmplis = tbProps[i].getElementsByTagName('li'), j = 0; j < tmplis.length; j++)
            if (tmplis[j].getAttribute('data-value') === dataValue) {
                optionSelectedValues.push(tmplis[j].textContent.trim());
                var tmpa = tmplis[j].querySelector('a');
                tmpa.hasAttribute('style') && (productImage = tmpa.getAttribute('style'), productImage = productImage.replace(')', ''), productImage = productImage.replace(/.*\(/, ''), productImage = productImage.replace(/\.jpg_.*/, '.jpg'), productImage.indexOf('http') < 0 && (productImage = 'https:' + productImage))
            }
        optionDataObj[optionLabels[i]] = optionSelectedValues[i]
    }
    var amount = document.querySelector('#J_Amount').querySelector('input').value,
        price = null;
    try {
        price = document.querySelector('.tm-promo-price').querySelector('.tm-price').textContent.trim()
    } catch (err) {
        try {
            price = document.querySelector('#J_PromoBox').textContent.trim(), price = parseFloat(price.replace(/[^\d]/, ''))
        } catch (err) {
            price = document.querySelector('#J_StrPriceModBox').querySelector('.tm-price').textContent.trim()
        }
    }
    var jsonData, theUrl = 'https://mdskip.taobao.com/core/changeLocation.htm?queryDelivery=true&areaId=451481&itemId=' + id,
        shippingPrice = 0,
        shippingData = null,
        xmlHttp = new XMLHttpRequest;
    xmlHttp.open('GET', theUrl, !1), xmlHttp.send(null), jsonData = JSON.parse(xmlHttp.responseText), shippingData = jsonData.defaultModel.deliveryDO;
    try {
        if (shippingData.deliverySkuMap['default'][0].postageFree) shippingPrice = 0;
        else {
            shippingData = shippingData.deliverySkuMap['default'][0].postage;
            var myRegexp = /(\d+\.?\d+)/,
                match = myRegexp.exec(shippingData);
            match && (shippingPrice = parseFloat(match[0]))
        }
    } catch (err) {}
    var stock = 0,
        stockData = document.querySelector('#J_EmStock').textContent.trim(),
        tmpRegexp = /(\d+)/,
        tmpMatch = tmpRegexp.exec(stockData);
    if (tmpMatch && (stock = parseInt(tmpMatch[0])), parseInt(amount) > parseInt(stock)) return {
        success: !1,
        message: chrome.i18n.getMessage('stockNotEnough')
    };
    var comment = document.querySelector('#orderNoteTextarea').value,
        optionJsonStr = '';
    for (i = 0; i < optionLabels.length; i++) optionJsonStr = optionJsonStr + optionLabels[i] + ':' + optionDataObj[optionLabels[i]], i < optionLabels.length - 1 && (optionJsonStr += ';');
    try {
        var jRegionSellServer = document.querySelector('#J_regionSellServer'),
            tmpLabel = jRegionSellServer.querySelector('dt').textContent.trim(),
            tmpLiSelected = jRegionSellServer.querySelectorAll('li.tb-selected:not(.tm-MRselect)'),
            tmpStrArr = [];
        for (i = 0; i < tmpLiSelected.length; i++) {
            var tmpStr = tmpLiSelected[i].querySelector('a').textContent.trim();
            tmpStrArr.indexOf(tmpStr) < 0 && (optionJsonStr += ';', optionJsonStr = optionJsonStr + tmpLabel + ':' + tmpStr, tmpStrArr.push(tmpStr))
        }
    } catch (err) {}
    var dataValueStr = '',
        dataValueArrs = [],
        selectedLis = document.querySelector('#J_DetailMeta').querySelectorAll('li.tb-selected'),
        firstTime = !0;
    for (i = 0; i < selectedLis.length; i++) {
        var tmpDataPV = selectedLis[i].getAttribute('data-value');
        null !== tmpDataPV && dataValueArrs.indexOf(tmpDataPV) < 0 && (firstTime ? firstTime = !1 : dataValueStr += ';', dataValueStr += tmpDataPV, dataValueArrs.push(tmpDataPV))
    }
    return {
        success: !0,
        message: chrome.i18n.getMessage('addToCartSuccess'),
        // data: [{
        //     id: 'tmall_' + id,
        //     title: title,
        //     price: price,
        //     shipping_price: shippingPrice,
        //     image: productImage,
        //     shop_name: shopName,
        //     shop_seller: sellerName,
        //     option: optionJsonStr,
        //     data_value: dataValueStr,
        //     quantity: amount,
        //     url: url,
        //     comment: comment
        // }]
        data: [{
            category_list: "",
            currency: "CNY",
            html: "",
            fragile: false,
            insurance: false,
            sku: 'tmall_' + id,
            vendor: "",
            shopping_domain: document.domain,
            name: title,
            short_description: title,
            price: price,
            shipping_price: shippingPrice,
            image_url: productImage,
            shop_name: shopName,
            shop_seller: sellerName,
            options_selected: optionJsonStr,
            options_metadata: "",
            quantity: amount,
            detail_url: url,
            note: comment,
            weight: 0,
            shipping: 0
        }]
    }
}