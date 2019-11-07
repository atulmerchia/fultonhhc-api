const FIREBASE_KEYS = ["apiKey", "authDomain", "databaseURL", "projectId", "storageBucket", "messagingSenderId", "appId"];
const firebaseConfig = process.env.IS_LOCAL
  ? require(`./config/firebase-${process.env.DB_MODE}.json`)
  : FIREBASE_KEYS.reduce((acc, key) => Object.assign(acc, { [key]: process.env[key] }), {});

const FirebaseApp = require('firebase').initializeApp(firebaseConfig);

module.exports = {
  get: async child => (await FirebaseApp.database().ref(child).once('value')).val()
}
