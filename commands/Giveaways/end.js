const ms = require("ms");

exports.run = async (client, message, args, lang) => {
    let role = client.db.fetch(`role_${message.guild.id}`);
    if (!role) role = client.config.grole;

    // If the member doesn't have enough permissions
    if (!message.member.hasPermission("MANAGE_GUILD") && !message.member.roles.cache.some((r) => r.name === role)) return message.channel.send(lang.start.perms + "** **" + "`" + role + "`" + ".");
    
    // If no message ID or giveaway name is specified
    if (!args[0]) return message.channel.send(lang.end.msg);

    if(message.member.guild.id != client.giveawaysManager.giveaways.find((g) => g.messageID === args[0]).guildID) return message.channel.send(lang.delete.otherServer);
    if("<@" + message.member.id + ">" != client.giveawaysManager.giveaways.find((g) => g.messageID === args[0]).hostedBy) return message.channel.send(lang.delete.otherUser);

    // try to found the giveaway with prize then with ID
    let giveaway = client.giveawaysManager.giveaways.find((g) => g.prize === args.join(' ')) || client.giveawaysManager.giveaways.find((g) => g.messageID === args[0]);

    // If no giveaway was found
    if (!giveaway) return message.channel.send(lang.end.err + "** **" + "`" + args.join(' ') + "`" + ".");
    

    // Edit the giveaway
    client.giveawaysManager.edit(giveaway.messageID, {
        setEndTimestamp: Date.now()
    })
        // Success message
        .then(() => {
            // Success message
            message.channel.send(lang.end.good + "** **" + "`" + (client.giveawaysManager.options.updateCountdownEvery / 1000) + "`" + "** **" + lang.units.seconds + ".");
        }).catch((e) => {
            if (e.startsWith(`Giveaway with message ID ${giveaway.messageID} is not ended.`)) {
                message.channel.send(lang.end.err + "** **" + "`" + giveaway.messageID + "`" + ".");
            } else {
                console.error(e);
                message.channel.send(lang.end.errmod);
            }
        });
};
