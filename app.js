require('dotenv').config();
const cors = require('cors');
const express = require('express');
const multer = require('multer')
const app = express();
const MessagingResponse = require("twilio").twiml.MessagingResponse
const bodyParser = require("body-parser")

const QRCode = require('qrcode')

// const port = normalizePort(process.env.PORT || '3000');

app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(bodyParser.json({ limit: "5mb" }))
app.use(cors());
// app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

const dicts = {
  locations: ['lokasi', 'location', 'lks', 'locs', 'tempat', 'venue', 'dimana ya', 'dimana', 'dimananya'],
  tikets: ['tikets', 'tiket', 'ticket', 'tickets', 'tiketnya', 'tiketnya' , 'tikets']
}

// const accountSid = process.env.TWILIO_SID
// const authToken = process.env.TWILIO_AUTH
// const client = require('twilio')(accountSid, authToken);

const gcp = require('./gcp')
const uploadDisk = multer({
  storage: multer.MemoryStorage,
  fileSize: 100 * 1024 * 1024
})

// uploadDisk.single('image'), gcp.upload_single_photos,

app.post('/sms',  async (req, res) => {
  const twiml = new MessagingResponse()
  const msg = req.body.Body.toLowerCase()
  console.log('data: ',req.body)

  // check location
  if (dicts.locations.some(txt => txt.match(msg, "gi"))) {
    twiml.message(`lokasinya disini bro: https://goo.gl/maps/g8aP2bPZkfZBi968A`)
    res.writeHead(200, { "Content-Type": "text/xml" })
    return res.end(twiml.toString())
    
  // tiket
  } else if (dicts.tikets.some(txt => txt.match(msg, "gi"))) {
    const { body } = req
    let message
    // try {
    //   const qr = await QRCode.toDataURL('1312')

    //   console.log("test..", qr)
    // } catch (e) {
    //   console.log('eee::', e)
    // }

    // console.log('tiket here...')
    const goodBoyUrl = `https://awsimages.detik.net.id/community/media/visual/2019/11/26/99569f9e-719b-4712-ba11-6a5044d3e001_169.png?w=700&q=80`
    // const goodBoyUrl = qr
    
    message = new MessagingResponse().message(
      "Berikut tiket anda, silahkan scan qrcode di atas pada hari H."
    )
    message.media(goodBoyUrl)

    res.set("Content-Type", "text/xml")
    res.send(message.toString()).status(200)
  }
  else {
    twiml.message(`
      Maaf kami hanya dapat menjawab pertanyaan terkait lokasi, tiket. \n\nSilahkan ketik *lokasi* atau *tiket* untuk mengetahui hal tersebut. \n\nJika ada pertanyaan diluar dari lokasi dan tiket silahkan hubungi PIC: wa.me/${process.env.PIC_NUMBER} (KEVIN)  \nketuk link di atas untuk langsung terhubung dengan pic kami.
    `)
    res.writeHead(200, { "Content-Type": "text/xml" })
    return res.end(twiml.toString())
  }
})

app.listen('3000', () => console.log(`connected`))