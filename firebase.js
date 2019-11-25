const STD_CONFIG = process.env.IS_LOCAL ? require(`./config/firebase-${process.env.DB_MODE}.json`) : JSON.parse(process.env.FIREBASE_CONFIG)
const ADM_CONFIG = process.env.IS_LOCAL ? require(`./config/firebase-${process.env.DB_MODE}-admin.json`) : JSON.parse(process.env.FIREBASE_ADMIN_CONFIG)

const FirebaseApp = require('firebase-admin');
const uuid = require('uuid/v4');

FirebaseApp.initializeApp({ ...STD_CONFIG, credential: FirebaseApp.credential.cert(ADM_CONFIG) });

module.exports = {
  get: async ({ db_ref }) => (await FirebaseApp.database().ref(db_ref).once('value')).val(),
  multiGet: ({ db_ref }, keys) => Promise.resolve(FirebaseApp.database().ref(db_ref))
    .then(ref => Promise.all(keys.map(k => ref.child(k).once('value').then(snapshot => snapshot.val()))))
    .then(res => keys.reduce((acc, k, i) => Object.assign(acc, { [k]: res[i] }), {})),
  post: async ({ db_ref }, key = uuid(), data) => (await FirebaseApp.database().ref(db_ref).child(key)).set(data).then(_ => ({ [key]: data })),
  authenticate: async token => token && FirebaseApp.auth().verifyIdToken(token).then(_ => true).catch(_ => false)
}
