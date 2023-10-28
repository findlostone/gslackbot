const { App } = require("@slack/bolt");
require("dotenv").config();
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
});

const fs = require("fs");
let raw = fs.readFileSync("db.json");
let faqs = JSON.parse(raw);

app.command("/knowledge", async ({ command, ack, say }) => {
  try {
    await ack();
    let message = { blocks: [] };
    faqs.data.map((faq) => {
      message.blocks.push(
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Question*",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: faq.question,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Answer*",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: faq.answer,
          },
        }
      );
    });
    say(message);
  } catch (error) {
    console.log("err");
    console.error(error);
  }
});

app.command("/update", async ({ command, ack, say }) => {
  try {
    await ack();
    let message = { blocks: [] };
    faqs.data.map((faq) => {
      const data = command.text.split("|");
      const newFAQ = {
        keyword: data[0].trim(),
        question: data[1].trim(),
        answer: data[2].trim(),
      };
      fs.readFile("db.json", function (err, data) {
        const json = JSON.parse(data);
        json.data.push(newFAQ);
        fs.writeFile("db.json", JSON.stringify(json), function (err) {
          if (err) throw err;
          console.log("Successfully saved to db.json!");
        });
      });
      say(`You've added a new FAQ with the keyword *${newFAQ.keyword}.*`);
    });
    say(message);
  } catch (error) {
    console.log("err");
    console.error(error);
  }
});

(async () => {
  const port = 3000;
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Bolt app is running on port ${port}!`);
})();
