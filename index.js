const tmi = require('tmi.js');
const { TWITCH_OAUTH_TOKEN, MONGODB_URL, PORT } = require('./config/secret.json');

// Api
const express = require("express");
const app = express();
const RateLimit = require('express-rate-limit');
const cors = require("cors");
const mongoose = require("mongoose");

const limiter = RateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});

app.use(limiter);
app.use(express.json());
app.use(cors());

// BDD
mongoose.connect(MONGODB_URL);

// Client
const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true
  },
  identity: {
    username: 'pastille_bot',
    password: TWITCH_OAUTH_TOKEN
  },
  channels: [ 'nibiche' ]
});

// ##### FIX ##### \\
if (!String.prototype.endsWith) {
  Object.defineProperty(String.prototype, 'endsWith', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: function (searchString, position) {
          position = position || this.length;
          position = position - searchString.length;
          var lastIndex = this.lastIndexOf(searchString);
          return lastIndex !== -1 && lastIndex === position;
      }
  });
}

try {
  app.get("/", (req, res) => { res.status(200).json({ message: "Bienvenue sur le Backend de Pastille Twitch" }); });
  app.all("*", (req, res) => { res.status(404).json({ message: "This route do not exist" }); });
  app.listen(PORT, () => { console.log(`API Server : 🚀 | Started on port ${PORT}`); });
}
catch(error) { console.log(error); }


client.connect();
client.on('message', (channel, tags, message, self) => {
  if(self) { return; }

  const args = message.slice(1).split(' ');
  const command = args.shift().toLowerCase();

  let discuss = 0;
  let rules = 0;

  if(!message.startsWith('!') && !self && rules < 9) { rules++; } // Tout les 10 messages hors bot et commandes on envoie ces messages 
  else if(!message.startsWith('!') && !self) {
    client.say(channel, `Quelques règles de bienséance : Tu ne spammera point  –  Les liens tu enverra aux vigiles d'abord (pour les connaîtres : /mods)  –  Tu n'insultera point\r\n`);
    rules = 0;
  }

  if(!message.startsWith('!') && !self && discuss < 4) { discuss++; } // Tout les 5 messages hors bot et commandes on envoie ces messages 
  else if(!message.startsWith('!') && !self) {
    let random = Math.floor(Math.random() * 2);

    switch(random) {
      case 0:
        client.say(channel, `/announce Rejoignez nous sur discord --> https://p.ws/discord`);
        break;
      case 1:
        client.say(channel, `/announce Retrouve les replays et les vidéos sur youtube --> https://p.ws/youtube`);
        break;
    }

    discuss = 0;
  }

  if(!message.startsWith('!')) {
    if(message.length <= 10 || tags.badges.moderator === '1' || tags.badges.admin === '1' || tags.badges.broadcaster === '1' || tags.badges.vip === '1' || self) { return; }
    else {
      if(!(tags.username in vigie)) {
        vigie[tags.username] = 0;
      }

      var msgMaj; var msgRatio; var msgSpace;
      var msgLength = message.length;
      
      if(message.match(/[A-Z]/gm) !== null) { msgMaj = message.match(/[A-Z]/gm).length; } else { msgMaj = 0; }
      if(message.match(/\s+/gm) !== null) { msgSpace = message.match(/\s+/gm).length; } else { msgSpace = 0; }

      msgRatio = (msgMaj - msgSpace) / (msgLength - msgSpace);

      if(msgRatio >= 0.65) {
        client.say(channel, `📢 @${tags.username}, attention sur les majuscules.`);
        vigie[tags.username]++;

        if(vigie[tags.username] === 3) { client.say(channel, `/timeout @${tags.username} 60s Spam de majuscule [VIGIE:${vigie[tags.username]}]`); }
        else if(vigie[tags.username] === 6) { client.say(channel, `/timeout @${tags.username} 600s Spam de majuscule [VIGIE:${vigie[tags.username]}]`); }
        else if(vigie[tags.username] >= 9) { client.say(channel, `/ban @${tags.username} Spam de majuscule [VIGIE:${vigie[tags.username]}]`); }
      }
    }
  }

  if(message.startsWith('!')) {
    // command moderator, admin or broadcaster
    if(tags.badges.moderator === '1' || tags.badges.admin === '1' || tags.badges.broadcaster === '1') {
      switch (command) {
        case 'join':
          if(args.join(' ')) {
            client.say(channel, `${args.join(' ')}, ce n'est pas la peine de demander à rejoindre la partie. Si il y a une possibilitée ce sera indiqué dans le titre du live.`);
          }
          else {
            client.say(channel, `Ce n'est pas la peine de demander à rejoindre la partie. Si il y a une possibilitée ce sera indiqué dans le titre du live.`);
          }
          break;
        case 'wyzzeur':
        case 'wyzzou':
          client.say(channel, `File découvrir WyZzeur --> https://twitch.tv/wyzzeur <-- il n'y a que des personnes INCROYAUX`);
          break;
        case 'loly':
        case 'lolyprime':
        case 'troly':
        case 'lolytroly':
          client.say(channel, `File découvrir lolytroly --> https://twitch.tv/lolytroly`);
          break;
        case 'social':
          client.say(channel, `Retrouve moi un peu partout : Insta --> https://instagram.com/meunierjeremie / Youtube --> https://www.youtube.com/channel/UCBoJiAGFyd7xg5YcVCoxDHA / Discord --> https://discord.gg/invite/QsUbmCBQ4N`);
          break;
      }
    }

    // public command
    switch (command) {
      case 'discord':
        client.say(channel, `Retrouve nous sur le discord de BichonWood --> https://discord.gg/invite/QsUbmCBQ4N`);
        break;
      case 'youtube':
      case 'ytb':
      case 'yt':
      case 'replay':
          client.say(channel, `Mes bétises sont aussi disponible sur youtube --> https://www.youtube.com/channel/UCBoJiAGFyd7xg5YcVCoxDHA`);
          break;
      case 'work':
      case 'quoiquonfait':
        client.say(channel, `On design le manoir de votre serviteur`);
        break;
      case 'planning':
        client.say(channel, `Euh... on verra 😊`);
        break;
      case 'deniche':
        client.say(channel, `DéNICHE est l'émission où je code, design ou découvre des sites et des technologies.`);
        break;
      case 'notifs':
        client.say(channel, `Rendez-vous sur le serveur discord de La Niche --> https://pooks.fr/l/discord dans le channel #commandes et fait : /notifs`);
        break;
      //case 'owncube':
      //  client.say(channel, `Own Cube est un serveur Minecraft ⛏️ privé sur invitation en 1.18 - Retrouve tout les paramètres du serveur sur https://owncube.darkbichon.tv`);
      //  break;
      //case 'team':
      //  client.say(channel, `Je fait partie de la team Pinpindustries (le détails sur : https://owncube.darkbichon.tv/teams)`);
      //  break;
      //case 'projet':
      //  client.say(channel, `Mon projet est de créer une zone avec différentes usines redstone sur un thème industriel/steampunk`);
      //  break;
      //case 'seed':
      //  client.say(channel, `La seed est 10532435`);
      //  break;
      // case 'mods':
      //   client.say(channel, `La liste des mods que j'utilise : InGameStats, Map Tooltip, Shulker Tooltip, Replay Mod, Simple voice Chat, Visible Barriers, Tweakeroo, Sound Physics Remastered et Xaero's World Map`);
      //   break;
      // case 'cmds':
      // case 'commands':
      // case 'cmd':
      // case 'commandes':
      // case 'commande':
      //   client.say(channel, `Voici la liste des commandes, ajoute un "!" devant : discord, notifs, replay, join, planning, youtube, quoiquonfait. Retrouve les aussi sur : https://pastille.jeremiemeunier.fr/twitch#commands`);
      //   break;
      case 'relou':
        client.say(channel, `🚨 ALERTE RELOU ! 🚨 Mise en place du place VIGIRELOU !`);
        break;
      case 'pastille':
        client.say(channel, `/me Qui suis-je ? Que fait-je ? Où vais-je ?`);
        break;
      case 'git':
      case 'github':
      case 'hub':
          client.say(channel, `Envie de voir mon code ? C'est ici --> https://github.com/jeremiemeunier`);
          break;
          
      case 'satisfactory':
        client.say(channel, `Satisfactory est un jeu de construction d’usines en vue à la première personne dans un monde ouvert avec une touche d’exploration et de combats. Jouez seul ou entre amis, explorez une planète inconnue, construisez des usines à plusieurs niveaux et des tapis roulants à l’infini !`);
        client.say(channel, `--> https://store.steampowered.com/app/526870/Satisfactory/`);
        client.say(channel, `--> https://store.epicgames.com/fr/p/satisfactory`);
        break;
    }
  }
});