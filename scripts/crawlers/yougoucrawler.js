function crawInfoYougou(responseHTML) {
    var i, el = document.createElement('html');
    el.innerHTML = responseHTML;
    var pordNoSpans = el.querySelectorAll('#pordNoSpan'),
        id = pordNoSpans[0].textContent.trim();
    id = parseFloat(id.match(/[^\d]+(.*)/m)[1]);
    var shopName = pordNoSpans[1].textContent.trim();
    shopName = shopName.substring(0, shopName.length - 2);
    var shopSeller = shopName,
        title = el.querySelector('.goodsCon.fr > h1').textContent.trim(),
        productImage = document.querySelector('#spec-list').querySelector('.picSmallClass0').getAttribute('picbigurl'),
        price = parseFloat(document.querySelector('#yitianPrice > i').textContent.trim()),
        shippingPrice = 0,
        url = window.location.href;
    url = url.match(/(.*\.shtml).*/m)[1];
    var amount = document.querySelector('.mycartxt').value,
        optionLabels = [],
        optionDataObj = {},
        tmpDataProperties = document.querySelector('.goodsCon.fr').querySelectorAll('p[data-property]:not([data-property=""])');
    for (i = 0; i < tmpDataProperties.length; i++) {
        var tmpLabel = tmpDataProperties[i].getAttribute('data-property');
        optionLabels.push(tmpLabel);
        var selecteda = tmpDataProperties[i].querySelector('a.select');
        if (!selecteda) return {
            success: !1,
            message: chrome.i18n.getMessage('setValueForEveryOption')
        };
        optionDataObj[tmpLabel] = selecteda.getAttribute('data-name')
    }
    var optionJsonStr = '';
    for (i = 0; i < optionLabels.length; i++) optionJsonStr = optionJsonStr + optionLabels[i] + ':' + optionDataObj[optionLabels[i]], i < optionLabels.length - 1 && (optionJsonStr += ';');
    var comment = document.querySelector('#orderNoteTextarea').value;
    return {
        success: !0,
        message: chrome.i18n.getMessage('addToCartSuccess'),
        // data: [{
        //     id: 'yougou_' + id,
        //     title: title,
        //     price: price,
        //     shipping_price: shippingPrice,
        //     image: productImage,
        //     shop_name: shopName,
        //     shop_seller: shopSeller,
        //     option: optionJsonStr,
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
            sku: 'yougou_' + id,
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