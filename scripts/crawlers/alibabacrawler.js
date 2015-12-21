function crawlInfo1688(responseHTML) {
    var i, j, tmpObj, dataSkuConfig, tmpCond, el = document.createElement('html');
    el.innerHTML = responseHTML;
    var metas = el.getElementsByTagName('meta'),
        title = null,
        mainImage = null,
        id = null;
    for (i = 0; i < metas.length; i++) 'og:title' === metas[i].getAttribute('property') ? title = metas[i].getAttribute('content') : 'og:image' === metas[i].getAttribute('property') ? (mainImage = metas[i].getAttribute('content'), mainImage = mainImage.replace(/\.(\d+)x(\d+)\.jpg/, '.jpg')) : 'b2c_auction' === metas[i].getAttribute('name') && (id = metas[i].getAttribute('content'));
    var url = 'http://detail.1688.com/offer/' + id + '.html',
        comment = document.querySelector('#orderNoteTextarea').value,
        shopName = el.querySelector('div.company-name').getAttribute('title'),
        shopSeller = null;
    try {
        shopSeller = el.querySelector('div.contactSeller').querySelector('a').textContent.trim()
    } catch (err) {}
    var customerOrderInfo = [],
        optionLabels = [],
        modDetailPurchasing = el.querySelector('div.mod-detail-purchasing'),
        objLeading = modDetailPurchasing.querySelector('div.obj-leading'),
        objSku = modDetailPurchasing.querySelector('div.obj-sku');
    objLeading && optionLabels.push(objLeading.querySelector('span.obj-title').textContent.trim()), objSku && optionLabels.push(objSku.querySelector('span.obj-title').textContent.trim());
    var selectedItemsTable = document.querySelector('div.list-selected').querySelector('table.table-list'),
        tableRows = selectedItemsTable.getElementsByTagName('tr');
    for (i = 0; i < tableRows.length; i++) {
        tmpObj = {}, tmpObj.option = {}, tmpObj.option[optionLabels[0]] = tableRows[i].getAttribute('data-name');
        var tmplis = tableRows[i].querySelector('td.desc').getElementsByTagName('li');
        for (j = 0; j < tmplis.length; j++) {
            if (dataSkuConfig = JSON.parse(tmplis[j].getAttribute('data-sku-config')), tmpObj.amount = parseInt(dataSkuConfig.amount), tmpObj.option[optionLabels[optionLabels.length - 1]] = dataSkuConfig.skuName, tmpCond = !1, optionLabels.length < 2) tmpCond = !0;
            else {
                var tmpa = document.querySelector('div.obj-leading').querySelector('a.selected');
                tmpa.getAttribute('title') === tmpObj.option[optionLabels[0]] && (tmpCond = !0)
            }
            tmpCond && customerOrderInfo.push(JSON.parse(JSON.stringify(tmpObj)))
        }
    }
    if (0 === customerOrderInfo.length) return {
        success: !1,
        message: chrome.i18n.getMessage('chooseAtLeastOneProduct')
    };
    var data = {
        success: !0,
        message: chrome.i18n.getMessage('addToCartSuccess'),
        data: []
    };
    for (tmpObj = {
            id: 'alibaba_' + id,
            title: title,
            shop_name: shopName,
            shop_seller: shopSeller,
            comment: comment,
            shipping_price: 0,
            url: url
        }, i = 0; i < customerOrderInfo.length; i++) {
        tmpObj.option = customerOrderInfo[i].option, tmpObj.image = null;
        var optionKeys = Object.keys(tmpObj.option);
        for (j = 0; j < optionKeys.length; j++) {
            var tmpImg, val = tmpObj.option[optionKeys[j]];
            try {
                tmpImg = objLeading.querySelector('img[alt=\'' + val + '\']'), tmpImg.hasAttribute('data-lazy-src') ? tmpObj.image = tmpImg.getAttribute('data-lazy-src') : tmpObj.image = tmpImg.getAttribute('src')
            } catch (err) {}
            try {
                tmpImg = objSku.querySelector('img[alt=\'' + val + '\']'), tmpImg.hasAttribute('data-lazy-src') ? tmpObj.image = tmpImg.getAttribute('data-lazy-src') : tmpObj.image = tmpImg.getAttribute('src')
            } catch (err) {}
        }
        tmpObj.image ? tmpObj.image = tmpObj.image.replace(/\.(\d+)x(\d+)\.jpg/, '.jpg') : tmpObj.image = mainImage, tmpObj.price = null;
        var tmptrs = document.querySelector('div.mod-detail-purchasing').querySelector('div.obj-sku');
        for (tmptrs = tmptrs.querySelector('.table-sku').getElementsByTagName('tr'), j = 0; j < tmptrs.length; j++)
            if (dataSkuConfig = JSON.parse(tmptrs[j].getAttribute('data-sku-config')), dataSkuConfig.skuName === tmpObj.option[optionLabels[optionLabels.length - 1]]) {
                tmpObj.price = parseFloat(tmptrs[j].querySelector('td.price').querySelector('em.value').textContent.trim());
                break
            }
        tmpObj.quantity = customerOrderInfo[i].amount, data.data.push(JSON.parse(JSON.stringify(tmpObj)))
    }
    var optionJsonStr;
    for (i = 0; i < data.data.length; i++) {
        for (optionJsonStr = '', j = 0; j < optionLabels.length; j++) optionJsonStr = optionJsonStr + optionLabels[j] + ':' + data.data[i].option[optionLabels[j]], j < optionLabels.length - 1 && (optionJsonStr += ';');
        data.data[i].option = optionJsonStr
    }
    return data
}