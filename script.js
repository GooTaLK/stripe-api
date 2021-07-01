const d = document,
      $products = d.getElementById('products'),
      $prodTemplate = d.getElementById('product-template').content
      $fragment = d.createDocumentFragment();

const strideOptions = {
    headers: {
        Authorization: 'Bearer sk_test_51IPBxaKdtWMnwnSV6mgculXaxWYUv3pjWBD7uSLO69vl4DPDiFRNYzdvPnRb0PIitXbiyaMfVhmqEpmWDSnHwRdz004Jnz1v4h'
    }
};

let products, prices;

// fetch('https://api.stripe.com/v1/products', {
//     headers: {
//         Authorization: 'Bearer sk_test_51IPBxaKdtWMnwnSV6mgculXaxWYUv3pjWBD7uSLO69vl4DPDiFRNYzdvPnRb0PIitXbiyaMfVhmqEpmWDSnHwRdz004Jnz1v4h'
//     }
// })
// .then(res => {
//     console.log(res);
//     return res.json();
// })
// .then(json => console.log(json))
// .catch(err => console.log(err));

// fetch('https://api.stripe.com/v1/prices', {
//     headers: {
//         Authorization: 'Bearer sk_test_51IPBxaKdtWMnwnSV6mgculXaxWYUv3pjWBD7uSLO69vl4DPDiFRNYzdvPnRb0PIitXbiyaMfVhmqEpmWDSnHwRdz004Jnz1v4h'
//     }
// })
// .then(res => {
//     // console.log(res);
//     return res.json();
// })
// .then(json => console.log(json))
// .catch(err => console.log(err));

Promise.all([
    fetch('https://api.stripe.com/v1/products', strideOptions),
    fetch('https://api.stripe.com/v1/prices', strideOptions)
])
.then(responses => Promise.all(responses.map(res => res.json())))
.then(json => {
    console.log(json);
    products = json[0].data;
    prices = json[1].data;

    prices.forEach(el => {
        const productData = products.filter(product => product.id === el.product);

        const moneyFormat = num => `$${num.slice(0, -2)}.${num.slice(-2)}`;

        $prodTemplate.querySelector('.product').setAttribute("data-price_id", el.id);
        $prodTemplate.querySelector('.product__img').src = productData[0].images[0];
        $prodTemplate.querySelector('.product__img').alt = productData[0].name;
        $prodTemplate.querySelector('.product__caption').innerHTML = `
            <p class="product__name"><b>${productData[0].name}</b></p>
            <p class="product__description">${productData[0].description}</p>
            <p class="product__price">${moneyFormat(el.unit_amount_decimal)} ${el.currency.toUpperCase()}<br>COMPRAR</p>
            `;

        const $clone = d.importNode($prodTemplate, true);

        $fragment.appendChild($clone);
        $products.appendChild($fragment);
    })
})
.catch(err => console.log(err));

d.addEventListener('click', e => {
    if (e.target.matches('.product__price')) {
        let priceID = e.target.parentElement.parentElement.dataset.price_id;

        Stripe('pk_test_51IPBxaKdtWMnwnSVuOtwhvuCjP6tRGtThZTSMJ0V8qNX9lhJ5FKyrmD3R6kkNbBYNYPt5Vb1MzpqYhA6aAiPd2if00LwuOJ7V5')
        .redirectToCheckout({
            lineItems: [{ price: priceID, quantity: 1 }],
            mode: 'payment',
            successUrl: 'http://127.0.0.1:5500/aea.html',
            cancelUrl: 'http://127.0.0.1:5500/aea.html'
        })
        .then(res => {
            console.log(res);

            if (res.error) {
                console.log(res.error);
            }
        })
    }
})