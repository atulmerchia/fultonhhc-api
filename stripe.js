const Firebase = require('./firebase');
const Mailer = require('./mailer');
const Stripe = require('stripe')(process.env.STRIPE_API_KEY);

const build_address_object = ({address_line1, address_line2, city, state, zip}) => Object.assign({ address_line1, city, state, zip }, address_line2 ? { address_line2 } : {})
const build_address_string = obj => `${obj.address_line1}, ${obj.address_line2 ? obj.address_line2 + ", " : ""}${obj.city}, ${obj.state} ${obj.zip}`

module.exports = {
  post: (options, { body }) => Firebase.multiGet(options.inventory, Object.keys(body.order))
    .then(inventory => Object.entries(body.order).reduce( (acc, [id, item]) => ({
      total: acc.total + item.count * inventory[id].price,
      order: Object.assign(acc.order, { [id]: item.count }),
      email_content: acc.email_content.concat([{
        count: item.count,
        name: inventory[id].name,
        price: inventory[id].price * item.count
      }])
    }), {
      total: 0,
      order: {},
      email_content: [],
    }))
    .then(data => Object.assign(data, { confirmation: Math.floor(Math.random() * 9e9 + 1e9) }))
    .then( ({ total, order, email_content, confirmation }) => Stripe.charges.create({
      amount: total,
      currency: 'usd',
      source: body.token.id
    })
    .then( ({ payment_method_details: { card } }) => Firebase.post(options.order, { body: {
      customer: {
        name: body.name,
        contact: {
          email: body.email,
          phone: body.phone
        },
        shipping_address: build_address_object(body.shipping_address)
      },
      order: order,
      confirmation: confirmation,
      fulfilled: false,
      createdAt: Date.now(),
      payment: {
        amount: total,
        last4: card.last4,
        card: card.brand,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        billing_address: build_address_object(body.billing_address)
      }
    }}))
    .then(_ => Mailer.post(options.email, {
      body: {
        name: body.name,
        email: body.email,
        subject: `Email confirmation - Invoice #${confirmation}`,
        phone: `${body.phone}`.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3"),
        card: body.token.card.last4,
        shipping_address: build_address_string(body.shipping_address),
        billing_address: build_address_string(body.billing_address),
        confirmation: confirmation,
        total: `$${Number(total/100).toFixed(2)}`,
        body: email_content
      }
    })))
}
