require("dotenv").config();
const Twit = require("twit");
const axios = require("axios");
const fs = require("fs");
const Path = require("path");
const tweet = require("./thread.js");
const text_tweet = require("./text_thread.js");

const current_date =
  new Date().getFullYear() +
  "-" +
  (Number(new Date().getMonth()) + 1) +
  "-" +
  new Date().getDate();
const nasa_api_key = process.env.NASA_API_KEY;
let nasa_img = "";
let nasa_img_title = "";
let nasa_explanation = "";
let tweet_status = ""; // @TODO: Figure out a way to display complete discription

const day_based_hashtag = {
  0: "#SundayFunday #weekendvibes #WeekendKaVaar",
  1: "#MondayVibes",
  2: "#TuesdayThoughts",
  3: "#WednesdayWisdom #WallpaperWednesday",
  4: "#ThursdayThoughts",
  5: "#FridayFeeling",
  6: "#SundayFunday #weekendvibes #WeekendKaVaar",
};

const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,
});

axios
  .get(
    "https://api.nasa.gov/planetary/apod?date=" +
      current_date +
      "&api_key=" +
      nasa_api_key
  )
  .then(function (response) {
    if (response.data.media_type === "video") {
      nasa_img = response.data.url ? response.data.url : "";
      nasa_img_title = response.data.title
        ? response.data.title
        : "NASA Astronomy Video of the Day";
      nasa_img_title =
        nasa_img_title +
        " 👨‍🚀👩‍🚀\n\n" +
        nasa_img +
        "\n\n" +
        "#SpaceForce #space #spaceX #astronomy #AstronomyClub #NASASocial #NASA #ISRO #ASTRO #astrology #NASAatHome #Explore #wallpaper " +
        day_based_hashtag[new Date().getDay()];
      nasa_explanation = response.data.explanation
        ? response.data.explanation
        : "";
      text_tweet(nasa_img_title, nasa_explanation.match(/.{1,280}/g));
    } else {
      nasa_img = response.data.hdurl ? response.data.hdurl : response.data.url;
      nasa_img_title = response.data.title
        ? response.data.title
        : "NASA Astronomy Photo of the Day";
      nasa_img_title =
        nasa_img_title +
        " 👨‍🚀👩‍🚀\n\n" +
        " #SpaceForce #space #spaceX #astronomy #AstronomyClub #NASASocial #NASA #ISRO #ASTRO #astrology #NASAatHome #Explore #wallpaper " +
        day_based_hashtag[new Date().getDay()];
      nasa_explanation = response.data.explanation
        ? response.data.explanation
        : "";
      downloadImage(nasa_img).then(() => {
        let img_path = "";
        let b64content = "";
        if (response.data.media_type !== "video") {
          img_path = Path.resolve(__dirname, "images", "img.jpg");
          b64content = fs.readFileSync(img_path, { encoding: "base64" });
        }

        T.post("media/upload", { media_data: b64content }, function (
          err,
          data,
          response
        ) {
          var mediaIdStr = data.media_id_string;
          var altText = nasa_img_title;
          var meta_params = {
            media_id: mediaIdStr,
            alt_text: { text: altText },
          };

          T.post("media/metadata/create", meta_params, function (
            err,
            data,
            response
          ) {
            if (!err) {
              var params = {
                status: nasa_img_title.substring(0, 280),
                media_ids: [mediaIdStr],
              };
              tweet(params, nasa_explanation.match(/.{1,280}/g));
            }
          });
        });
      });
    }
  })
  .catch(function (error) {
    console.log(error);
  });

async function downloadImage(image_path) {
  const url = image_path;
  const path = Path.resolve(__dirname, "images", "img.jpg");
  const writer = fs.createWriteStream(path);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
