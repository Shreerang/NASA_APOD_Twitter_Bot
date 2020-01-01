require('dotenv').config();
const Twit = require('twit');
const axios = require('axios');

const T = new Twit({
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token: process.env.access_token,
    access_token_secret: process.env.access_token_secret,
    timeout_ms: 60*1000,
})

const current_date = (Number(new Date().getMonth())+1) + '/' + new Date().getDate();

axios.get('http://numbersapi.com/' + current_date + '/date')
  .then(function (response) {
    let status_msg = response.data + ' #OnThisDay 📅 #date #Trivia 👌🏻#numbers #interestingfacts 🤔 #Facts 💭'
    T.post('statuses/update', { status: status_msg }, function(err, data, response) {
        // console.log(data)
    })
  })
  .catch(function (error) {
    console.log(error);
  });