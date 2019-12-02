const rimraf = require('rimraf')
const Firebase = require('./firebase')

module.exports = {
  post: async (options, req) => {
    let { images } = req.files; const { bucket } = req.params;
    if (!Array.isArray(images)) images = [images];
    return Promise.all(images.map(img => Firebase.upload(img.file, `${bucket}/${img.uuid}.jpg`)))
      .then(img_urls => {
        (async _ => images.forEach(img => rimraf(`./tmp/${img.uuid}`,
          err => console.log(err ? `Failed to delete tmp/${img.uuid}` : `Deleted tmp/${img.uuid}`)
        )))();
        return img_urls;
      })
  }
}
