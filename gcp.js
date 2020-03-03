const { Storage } = require("@google-cloud/storage")
const config = {
    bucketName: process.env.BUCKET_NAME,
    projectId: process.env.PROJECT_ID,
}
const storage = new Storage({
    projectId: config.projectId,
    keyFilename: process.env.KEY_FILE_NAME
});

// set which bucket
const bucket = storage.bucket(config.bucketName);

// just a helper to create absolute path to GCS
function getPublicUrl(filename) {
  return `https://storage.googleapis.com/${config.bucketName}/${filename}`;
}


exports.upload_single_photos = async (req, res, next) => {
  console.log(req)
  try {
    if (!req.file) {
      return next()
    } else if (strictImage.indexOf(req.file.mimetype) == -1) {
      return res.status(500).json({
        m: 'Image type should be PNG, JPEG or JPG'
      })
    }

    const gcsname = Date.now() + req.file.originalname
    const file = bucket.file(gcsname)
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype
      }
    })

    stream.on('error', (err) => {
      req.file.cloudStorageError = err
      next(err)
    })

    stream.on('finish', () => {
      req.file.cloudStorageObject = gcsname
      file.makePublic().then(() => {
        req.file.cloudStoragePublicUrl = getPublicUrl(gcsname)
        next()
      })
    })

    stream.end(req.file.buffer)
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      m: e.message
    })
  }
}