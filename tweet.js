require("dotenv").config();
const Twit = require("twit");
// const config = require("./config");
const util = require("util");
// const bot = new Twit(config);

const bot = new Twit({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token: process.env.access_token,
  access_token_secret: process.env.access_token_secret,
  timeout_ms: 60 * 1000
});

// Wrapping my code in a promise wrapper...
let post_promise = require("util").promisify(
  // Wrap post function w/ promisify to allow for sequential posting.
  (options, data, cb) =>
    bot.post(options, data, (err, ...results) => cb(err, results))
);

// Async/await for the results of the previous post, get the id...
const tweet_crafter = async (array, id) => {
  for (let i = 0; i < array.length; i++) {
    let content = await post_promise("statuses/update", {
      status: array[i],
      in_reply_to_status_id: id
    });
    id = content[0].id_str;
  }
};

const tweet = (first, subsequent) => {
  post_promise("statuses/update", { status: `${first}` })
    .then(top_tweet => {
      console.log(`${top_tweet[0].text} tweeted!`);
      let starting_id = top_tweet[0].id_str; // Get top-line tweet ID...
      tweet_crafter(subsequent, starting_id);
    })
    .catch(err => console.log(err));
};

module.exports = tweet;
