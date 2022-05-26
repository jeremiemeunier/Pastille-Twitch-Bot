const tmi = require('tmi.js');
const fs = require('fs');
require('dotenv').config({path: __dirname + '/.env'});

let vigie = JSON.parse(fs.readFileSync('vigie/users.json'));
let discuss = 0;

const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true
  },
  identity: {
    username: 'pastille_bot',
    password: process.env.TWITCH_OAUTH_TOKEN
  },
  channels: [ 'dark_bichon' ]
});
client.connect();

client.on('message', (channel, tags, message, self) => {

  if(!vigie.find(u => u.username === tags.username)) {
    vigie.push({
      username: tags.username,
      level: 1
    });
    fs.writeFileSync('vigie/users.json', JSON.stringify(vigie));
  }

  if(message.length <= 10 || tags.badges.moderator === '1' || tags.badges.admin === '1' || tags.badges.broadcaster === '1' || tags.badges.vip === '1' || self) { return; }
  else {
    var msgMaj; var msgRatio; var msgSpace;
    var msgLength = message.length;

    if(message.match(/[A-Z]/gm) !== null) { msgMaj = message.match(/[A-Z]/gm).length; } else { msgMaj = 0; }
    if(message.match(/\s+/gm) !== null) { msgSpace = message.match(/\s+/gm).length; } else { msgSpace = 0; }
    msgRatio = (msgMaj - msgSpace) / (msgLength - msgSpace);

    if(msgRatio >= 0.65) {
      vigie.forEach(u => {
        if(u.username === tags.username) {
          u.level++;
          if(u.level === 3) { client.say(channel, `/timeout @${tags.username} 60s Spam de majuscule [VIGIE:${vigie[tags.username]}]`); }
          else if(u.level === 6) { client.say(channel, `/timeout @${tags.username} 600s Spam de majuscule [VIGIE:${vigie[tags.username]}]`); }
          else if(u.level >= 9) { client.say(channel, `/ban @${tags.username} Spam de majuscule [VIGIE:${vigie[tags.username]}]`); }
        }
        fs.writeFileSync('vigie/users.json', JSON.stringify(vigie));
      });
      client.say(channel, `📢 @${tags.username}, attention sur les majuscules.`);
    }
  }

});