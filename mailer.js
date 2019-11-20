const Firebase = require('./firebase');
const _sendmail = require('sendmail')({ silent: true });

const sendmail = (target, { email_template }, params) => new Promise((res, rej) => _sendmail({
  from: 'no-reply@fulton-hhc.com',
  to: target,
  cc: params.email,
  subject: `${params.subject}`,
  html: templates[email_template](params)
}, (err, reply) => err ? rej(err) : res({ message: `Email sent to ${target}` })))

const templates = {
  message: params => `
    <div>
      <p>Sender: ${params.name || "none provided"}</p>
      <p>E-Mail: ${params.email || "none provided"}</p>
      <p>Phone: ${params.phone || "none provided"}</p>
      <p>Message: ${params.text || "no message content"}</p>
    </div>
  `,
  purchaseConfirmation: params => `
    <div>
      <p>Name: ${params.name || "ERROR"}</p>
      <p>E-Mail: ${params.email || "ERROR"}</p>
      <p>Phone: ${params.phone || "ERROR"}</p>
      <p>Credit card ending in ${params.card}</p>
      <p>Deliver to ${params.shipping_address}</p>
      <p>Billing Address ${params.billing_address}</p>
      <p>Confirmation # ${params.confirmation || "ERROR"}</p>
      <hr/>
      <p>Total: ${params.total}</p>
      <table>
        ${params.body.map(x => (
          `<tr>
            <td>${x.count} x </td>
            <td>${x.name} - </td>
            <td>${Number(x.price/100).toFixed(2)}</td>
          </tr>`
        )).join()}
      </table>
    </div>
  `
}

module.exports = {
  post: (options, { body }) => Firebase.get(options).then(target => sendmail(target, options, body))
}
