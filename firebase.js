const STD_CONFIG = process.env.IS_LOCAL ? require(`./config/firebase-${process.env.DB_MODE}.json`) : JSON.parse(process.env.FIREBASE_CONFIG)
const ADM_CONFIG = process.env.IS_LOCAL ? require(`./config/firebase-${process.env.DB_MODE}-admin.json`) : JSON.parse(process.env.FIREBASE_ADMIN_CONFIG)

const FirebaseApp = require('firebase-admin');
const uuid = require('uuid/v4');

FirebaseApp.initializeApp({ ...STD_CONFIG, credential: FirebaseApp.credential.cert(ADM_CONFIG) });

module.exports = {
  authenticate: async token => token && FirebaseApp.auth().verifyIdToken(token).then(_ => true).catch(_ => false),
  delete: async ({ db_ref }, { params }) => (await FirebaseApp.database().ref(db_ref).child(params.id)).remove().then(_ => ({ id: params.id })),
  get: async ({ db_ref }) => (await FirebaseApp.database().ref(db_ref).once('value')).val(),
  multiGet: ({ db_ref }, keys) => Promise.resolve(FirebaseApp.database().ref(db_ref))
    .then(ref => Promise.all(keys.map(k => ref.child(k).once('value').then(snapshot => snapshot.val()))))
    .then(res => keys.reduce((acc, k, i) => Object.assign(acc, { [k]: res[i] }), {})),
  post: async ({ db_ref }, { body, params: { id = uuid() } }) => (await FirebaseApp.database().ref(db_ref).child(id)).set(body).then(_ => ({ [id]: body })),
  put: async ({ db_ref }, { body, params: { id } }) => (await FirebaseApp.database().ref(db_ref + (id ? `/${id}` : ''))).update(body).then(_ => ({ data: body })),
  upload: (local, filename, token = uuid()) => {
    const bucket = FirebaseApp.storage().bucket();
    const options = { destination: bucket.file(filename), metadata: { contentType: 'image/jpeg', metadata: { firebaseStorageDownloadTokens: token }}}
    return new Promise ((resolve, reject) => bucket.upload(local, options, (err, data) => {
      if (err) reject(err);
      else resolve(`https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media&token=${token}`)
    }))
  }
}
