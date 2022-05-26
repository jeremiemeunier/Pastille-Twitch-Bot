const tmi = require('tmi.js');
const fs = require('fs');
require('dotenv').config({path: __dirname + '/.env'});

const vigie = {};
let discuss = 0;
let rules = 0;

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
  if(self) { return; }

  const args = message.slice(1).split(' ');
  const command = args.shift().toLowerCase();

  if(!message.startsWith('!') && !self && rules < 9) { rules++; } // Tout les 10 messages hors bot et commandes on envoie ces messages 
  else if(!message.startsWith('!') && !self) {
    client.say(channel, `Quelques règles de bienséance : Tu ne spammera pas  -  Les liens tu enverra au modérawouf d'abord (pour les connaîtres : /mods)  -  Tu n'insultera pas\r\n`);
    rules = 0;
  }

  if(!message.startsWith('!') && !self && discuss < 4) { discuss++; } // Tout les 5 messages hors bot et commandes on envoie ces messages 
  else if(!message.startsWith('!') && !self) {
    let random = Math.floor(Math.random() * 2);

    switch(random) {
      case 0:
        client.say(channel, `/announce Rejoignez nous sur discord --> https://darkbichon.tv/discord`);
        break;
      case 1:
        client.say(channel, `/announce Retrouve les replays et les vidéos sur youtube --> https://darkbichon.tv/youtube`);
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
        case 'social':
          client.say(channel, `Retrouve moi un peu partout : Insta --> https://darkbichon.tv/instagram / Twitter --> https://twitter.com/DarkBichon01 / Youtube --> https://darkbichon.tv/youtube / Discord --> https://darkbichon.tv/discord`);
          break;
      }
    }

    // public command
    switch (command) {
      case 'discord':
        client.say(channel, `Retrouve nous sur le discord de la niche --> https://darkbichon.tv/discord`);
        break;
      case 'youtube':
      case 'ytb':
      case 'yt':
      case 'replay':
          client.say(channel, `Mes bétises sont aussi disponible sur youtube --> https://darkbichon.tv/youtube`);
          break;
      case 'work':
      case 'quoiquonfait':
        client.say(channel, `On design le manoir de votre serviteur`);
        break;
      case 'planning':
        client.say(channel, `Euh... on verra sinon c'est ici --> https://darkbichon.tv/planning`);
        break;
      case 'deniche':
        client.say(channel, `DéNICHE est l'émission ou je code, design ou découvre des sites et des technologies.`);
        break;
      case 'notifs':
        client.say(channel, `Rendez-vous sur le serveur discord de La Niche --> https://darkbichon.tv/discord dans le channel auto-roles et fait : !role list`);
        break;
      case 'owncube':
        client.say(channel, `Own Cube est un serveur Minecraft ⛏️ privé sur invitation en 1.18 - Retrouve tout les paramètres du serveur sur https://owncube.darkbichon.tv`);
        break;
      case 'team':
        client.say(channel, `Je fait partie de la team Pinpindustries (le détails sur : https://owncube.darkbichon.tv/teams)`);
        break;
      case 'projet':
        client.say(channel, `Mon projet est de créer une zone avec différentes usines redstone sur un thème industriel/steampunk`);
        break;
      case 'seed':
        client.say(channel, `La seed est 10532435`);
        break;
      case 'mods':
        client.say(channel, `La liste des mods que j'utilise : InGameStats, Map Tooltip, Shulker Tooltip, Replay Mod, Simple voice Chat, Visible Barriers, Tweakeroo, Sound Physics Remastered et Xaero's World Map`);
        break;
      case 'cmds':
      case 'commands':
      case 'cmd':
      case 'commandes':
      case 'commande':
        client.say(channel, `Voici la liste des commandes, ajoute un "!" devant : discord, notifs, replay, join, planning, youtube, quoiquonfait. Retrouve les aussi sur : https://pastille.pookswebservice.fr/twitch#commands`);
        break;
      case 'relou':
        client.say(channel, `🚨 ALERTE RELOU ! 🚨 Mise en place du place VIGIRELOU !`);
        break;
      case 'pastille':
        client.say(channel, `/me Qui suis-je ? Que fait-je ? Où vais-je ?`);
        break;
      case 'pws':
        client.say(channel, `PWS --> PooksWebService : envie de découvrir mes différents projets de développement : https://github.com/jeremiemeunier`);
        break;
    }
  }
});