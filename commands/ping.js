/*
client.api.applications(client.config.applicationID).commands.post({data: {
    name: 'ping',
    description: '🏓 Checks how fast the bot is responding'
}})
*/

const Discord = require('discord.js')
const Spark = require("../app")
const Command = Spark.command("ping")

Command.setLevel(0)
Command.setDescription("Test the latency between Discord's servers and the bot.")

Command.code = async (client, interaction, respond) => {
    await respond({type: 4, data: {content: 'Ping!'}})
    const interactionTimestamp = Discord.SnowflakeUtil.deconstruct(interaction.id).timestamp
    const responseTimestamp = Discord.SnowflakeUtil.deconstruct(client.channels.cache.get(interaction.channel_id).lastMessageID).timestamp
    const edit = text => client.api.webhooks(client.config.applicationID, interaction.token).messages('@original').patch({data: {content: text}})
    edit(`Pong! | Took **${responseTimestamp - interactionTimestamp}**ms.`)
}

module.exports = Command
