// const FIREBASE_KEYS = ["apiKey", "authDomain", "databaseURL", "projectId", "storageBucket", "messagingSenderId", "appId"];
// const firebaseConfig = process.env.IS_LOCAL
//   ? require(`./config/firebase-${process.env.DB_MODE}.json`)
//   : FIREBASE_KEYS.reduce((acc, key) => Object.assign(acc, { [key]: process.env[key] }), {});
const firebaseConfig = require(`./config/firebase-dev.json`)

const FirebaseApp = require('firebase').initializeApp(firebaseConfig);
const uuid = require('uuid/v4')

module.exports = {
  get: async ({ db_ref }) => (await FirebaseApp.database().ref(db_ref).once('value')).val(),
  multiGet: ({ db_ref }, keys) => Promise.resolve(FirebaseApp.database().ref(db_ref))
    .then(ref => Promise.all(keys.map(k => ref.child(k).once('value').then(snapshot => snapshot.val()))))
    .then(res => keys.reduce((acc, k, i) => Object.assign(acc, { [k]: res[i] }), {})),
  post: async ({ db_ref }, key = uuid(), data) => { console.log(data); return (await FirebaseApp.database().ref(db_ref).child(key)).set(data).then(_ => ({ [key]: data })) }
}
