const Firebase = require('./firebase');
const request = require('request-promise');

module.exports = {
  get: options => Firebase.get(options).then(id => Promise.all([Promise.resolve(id), request({
    uri: `https://www.googleapis.com/calendar/v3/calendars/${id}/events`,
    qs: { key: process.env.GCAL_API_KEY },
    json: true
  })]))
}
