/*
client.api.applications(client.application.id).commands.post({data: {
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
    await interaction.defer()
    const responseTimestamp = (await interaction.fetchReply()).createdTimestamp
    interaction.editReply(`Pong! | Took **${responseTimestamp - interaction.createdTimestamp}**ms.`)
}

module.exports = Command
