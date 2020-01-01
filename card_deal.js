require('dotenv').config();
const Twit = require('twit');
const axios = require('axios');
const fs = require('fs');
const Path = require('path');

const T = new Twit({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token: process.env.access_token,
  access_token_secret: process.env.access_token_secret,
  timeout_ms: 60*1000,
})

const card_emoji = {
  'CLUBS': '♣️',
  'DIAMONDS': '♦️',
  'HEARTS': '♥️',
  'SPADES': '♠️'
}

axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
  .then(function (response) {
    const deck_id = response.data.deck_id
    axios.get('https://deckofcardsapi.com/api/deck/' + deck_id + '/draw/?count=1')
      .then(function (response) {
        const cards = response.data.cards
        let card_imgs = ''
        let dealt_cards = ''
        let dealt_cards_str = 'You have been dealt the '
        for(let i=0; i<cards.length; i++) {
          card_imgs = cards[i].image
          dealt_cards = dealt_cards + cards[i].value.toLowerCase() + ' of ' + cards[i].suit.toLowerCase() + card_emoji[cards[i].suit]
        }
        dealt_cards_str = dealt_cards_str + dealt_cards + ' #cards #houseofcards #Suits #spades #hearts #clubs #poker #pokeronline #deckofcards #cardgames'

        downloadImage(card_imgs).then(() => {
          const img_path = Path.resolve(__dirname, 'images', 'card1.jpg')
          const b64content = fs.readFileSync(img_path, { encoding: 'base64' })
    
          T.post('media/upload', { media_data: b64content }, function (err, data, response) {
            var mediaIdStr = data.media_id_string
            var altText = dealt_cards
            var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
          
            T.post('media/metadata/create', meta_params, function (err, data, response) {
              if (!err) {
                var params = { status: dealt_cards_str.substring(0, 240), media_ids: [mediaIdStr] }
          
                T.post('statuses/update', params, function (err, data, response) {
                  // console.log(data)
                })
              }
            })
          })
        })
      })
      .catch(function (error) {
        console.log(error);
      });
  })
  .catch(function (error) {
    console.log(error);
  });

async function downloadImage (image_path) {
    const url = image_path
    const path = Path.resolve(__dirname, 'images', 'card1.jpg')
    const writer = fs.createWriteStream(path)

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}