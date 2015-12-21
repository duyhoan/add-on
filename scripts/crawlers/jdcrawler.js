function crawlInfoJd(responseHTML) {
    var i, el = document.createElement('html');
    el.innerHTML = responseHTML;
    var price = null;
    try {
        price = document.querySelector('#jd-price').textContent.trim(), price = parseFloat(price.match(/[^\d]+(.*)/m)[1])
    } catch (err) {}
    var shippingPrice = 0,
        url = el.querySelector('link[rel=canonical]').getAttribute('href');
    0 !== url.indexOf('http') && (url = 'http:' + url);
    var id = url.match(/jd\.com\/(\d*?)\.html/m)[1],
        title = el.querySelector('#name').querySelector('h1').textContent.trim(),
        productImage = el.querySelector('#preview').querySelector('img').getAttribute('src');
    0 !== productImage.indexOf('http') && (productImage = 'http:' + productImage);
    var shopName = null;
    try {
        shopName = el.querySelector('.seller-infor').querySelector('a.name').textContent.trim()
    } catch (err) {
        shopName = 'jd'
    }
    var tmpStr, shopSeller = shopName,
        tmpCount = 0,
        optionLabels = [],
        optionDataObj = {},
        itemSelectedDivs = document.querySelector('#product-intro').querySelectorAll('.item.selected');
    for (i = 0; i < itemSelectedDivs.length; i++)
        if (tmpStr = itemSelectedDivs[i].className, tmpStr += itemSelectedDivs[i].parentElement.className, tmpStr += itemSelectedDivs[i].parentElement.parentElement.className, tmpStr += itemSelectedDivs[i].parentElement.parentElement.parentElement.className, tmpStr.indexOf('hide') < 0) {
            var tmpLabel = itemSelectedDivs[i].parentElement.parentElement.querySelector('.dt').textContent.trim();
            optionLabels.push(tmpLabel), optionDataObj[tmpCount + '_' + tmpLabel] = itemSelectedDivs[i].textContent.trim(), tmpCount += 1
        }
    var optionJsonStr = '';
    for (i = 0; i < optionLabels.length; i++) optionJsonStr = optionJsonStr + optionLabels[i] + optionDataObj[i + '_' + optionLabels[i]], i < optionLabels.length - 1 && (optionJsonStr += ';');
    var amount = parseInt(document.querySelector('#buy-num').value),
        comment = document.querySelector('#orderNoteTextarea').value;
    return {
        success: !0,
        message: chrome.i18n.getMessage('addToCartSuccess'),
        data: [{
            id: 'jd_' + id,
            title: title,
            price: price,
            shipping_price: shippingPrice,
            image: productImage,
            shop_name: shopName,
            shop_seller: shopSeller,
            option: optionJsonStr,
            quantity: amount,
            url: url,
            comment: comment
        }]
    }
}