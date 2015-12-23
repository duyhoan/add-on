function crawlInfoTaobao(responseHTML) {
    var i, el = document.createElement('html');
    el.innerHTML = responseHTML;
    var id = document.querySelector('input[name=item_id_num]').getAttribute('value'),
        url = 'https://item.taobao.com/item.htm?id=' + id,
        title = null;
    try {
        title = el.querySelector('#J_Title').querySelector('span.t-title').textContent.trim()
    } catch (err) {
        title = el.querySelector('#J_Title').querySelector('h3.tb-main-title').getAttribute('data-title')
    }
    var mainImage = null;
    try {
        mainImage = document.querySelector('#J_ThumbView').getAttribute('src')
    } catch (err) {
        mainImage = document.querySelector('#J_ImgBooth').getAttribute('src')
    }
    mainImage = mainImage.replace(/\.jpg_.*/, '.jpg'), mainImage.indexOf('http') < 0 && (mainImage = 'https:' + mainImage);
    var productImage = mainImage,
        shopName = null;
    try {
        shopName = el.querySelector('div.tb-shop-name').querySelector('a').textContent.trim()
    } catch (err) {}
    var shopSeller = null;
    try {
        shopSeller = el.querySelector('a.tb-seller-name').textContent.trim()
    } catch (err) {}
    var optionDataObj = {},
        optionLabels = [],
        optionSelectedValues = [],
        tbPropsOriginal = [],
        tbProps = [];
    try {
        tbPropsOriginal = document.querySelector('#J_SKU').getElementsByTagName('dl'), tbProps = el.querySelector('#J_SKU').getElementsByTagName('dl')
    } catch (err) {
        tbPropsOriginal = document.querySelector('#J_isku').querySelectorAll('dl.J_Prop'), tbProps = el.querySelector('#J_isku').querySelectorAll('dl.J_Prop')
    }
    for (i = 0; i < tbProps.length; i++) {
        optionLabels.push(tbProps[i].querySelector('dt').textContent.trim());
        var selectedli = tbPropsOriginal[i].querySelector('li.tb-selected');
        if (!selectedli) return {
            success: !1,
            message: chrome.i18n.getMessage('setValueForEveryOption')
        };
        var dataValue = selectedli.getAttribute('data-pv');
        dataValue || (dataValue = selectedli.getAttribute('data-value'));
        for (var tmplis = tbProps[i].getElementsByTagName('li'), j = 0; j < tmplis.length; j++)
            if (tmplis[j].getAttribute('data-pv') === dataValue || tmplis[j].getAttribute('data-value') === dataValue) {
                var tmpa = tmplis[j].querySelector('a');
                optionSelectedValues.push(tmpa.getAttribute('title')), optionSelectedValues[i] || (optionSelectedValues[i] = tmpa.querySelector('span').textContent.trim()), tmpa.hasAttribute('style') && (productImage = tmpa.getAttribute('style'), productImage = productImage.replace(')', ''), productImage = productImage.replace(/.*\(/, ''), productImage = productImage.replace(/\.jpg_.*/, '.jpg'), productImage.indexOf('http') < 0 && (productImage = 'https:' + productImage))
            }
        optionDataObj[optionLabels[i]] = optionSelectedValues[i]
    }
    var amount = document.querySelector('#J_IptAmount').value,
        price = null;
    try {
        price = parseFloat(document.querySelector('#J_PromoPriceNum').textContent.trim())
    } catch (err) {
        try {
            price = document.querySelector('#J_PromoPrice').querySelector('.tb-rmb-num').textContent.trim(), price = parseFloat(price.replace(/[^\d]/, ''))
        } catch (err) {
            try {
                price = parseFloat(document.querySelector('#J_StrPrice').querySelector('.tb-rmb-num').textContent.trim())
            } catch (err) {
                price = parseFloat(document.querySelector('#J_priceStd').querySelector('[itemprop=price]').getAttribute('content'))
            }
        }
    }
    var optionJsonStr = '';
    for (i = 0; i < optionLabels.length; i++) optionJsonStr = optionJsonStr + optionLabels[i] + ':' + optionDataObj[optionLabels[i]], i < optionLabels.length - 1 && (optionJsonStr += ';');
    var theUrl = 'https://detailskip.taobao.com/json/deliveryFee.htm?areaId=451481&itemId=' + id,
        shippingPrice = 0,
        shippingData = null,
        xmlHttp = new XMLHttpRequest;
    for (xmlHttp.open('GET', theUrl, !1), xmlHttp.send(null), shippingData = xmlHttp.responseText, shippingData = shippingData.replace('callback(', ''), shippingData = JSON.parse(shippingData.replace('});', '}')).data.serviceInfo.list, i = 0; i < shippingData.length; i++)
        if (shippingData[i].isDefault) {
            shippingData = shippingData[i].info;
            break
        }
    try {
        var myRegexp = /(\d+\.?\d+)/,
            match = myRegexp.exec(shippingData);
        match && (shippingPrice = parseFloat(match[0]))
    } catch (err) {
        shippingPrice = 0
    }
    var dataValueStr = '',
        jSkusSelected = document.querySelectorAll('.J_SKU.tb-selected');
    for (i = 0; i < jSkusSelected.length; i++) dataValueStr += jSkusSelected[i].getAttribute('data-pv'), i < jSkusSelected.length - 1 && (dataValueStr += ';');
    var stock = parseInt(document.querySelector('#J_SpanStock').textContent.trim());
    if (parseInt(amount) > parseInt(stock)) return {
        success: !1,
        message: chrome.i18n.getMessage('stockNotEnough')
    };
    var comment = document.querySelector('#orderNoteTextarea').value;
    return {
        success: !0,
        message: chrome.i18n.getMessage('addToCartSuccess'),
        // data: [{
        //     id: 'taobao_' + id,
        //     title: title,
        //     price: price,
        //     shipping_price: shippingPrice,
        //     image: productImage,
        //     shop_name: shopName,
        //     shop_seller: shopSeller,
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
            sku: 'taobao_' + id,
            vendor: "",
            shopping_domain: document.domain,
            name: title,
            short_description: title,
            price: price,
            shipping_price: shippingPrice,
            image_url: productImage,
            shop_name: shopName,
            shop_seller: shopSeller,
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