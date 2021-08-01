const Discord = require('discord.js')
const Chalk = require("chalk")

/** @param {Discord.Client} client */
module.exports = (client) => {
    function engine() {
        client.dataStore.functions.engines.forEach(i => {
            if (client.config.disabled.has("engines", i.engine.name)) {
                return
            }
            setTimeout(() => {
                if (i.engine.time == 0) {
                    i.engine.code(client)
                } else {
                    i.engine.code(client)
                    setInterval(() => {
                        i.engine.code(client)
                    }, i.engine.time)
                }
            }, i.engine.delay)
        })
    }

    client.dataStore.events.forEach(i => {
        if (client.config.disabled.has("events", i.event.name)) {
            return
        }
        client.on(i.event.event, (one, two, three) => {
            i.event.code(client, one, two, three)
        })
    })


    client.on("guildCreate", guild => {
        guild.customConfig = new client.CustomConfig()
        client.customConfig.set(guild.id, guild.customConfig)
    })
    engine()

    client.on("messageCreate", (message) => {
        var p = client.config.prefix
        if (message.guild && client.customConfig.has(message.guild.id) && client.customConfig.get(message.guild.id).prefix) {
            p = client.customConfig.get(message.guild.id).prefix
        }
        if (typeof p == "string") {
            p = [p]
        }
        var prefixMatched = false;
        p.forEach(async (i, n) => {
            if (message.content.startsWith(i)) {
                var command = await isValidCommandOld(client, message, message.content.split(" ")[0].replace(i, "").toLowerCase())
                if (client.config.disabled.has("commands", command.name)) {
                    return
                }
                if (message.guild) {
                    if (client.customConfig.get(message.guild.id).disabled.has("commands", command.name)) {
                        return
                    }
                }
                if (command.value == true) {
                    prefixMatched = true
                    if (await observer(client, message, command.value)) {
                        executeCommandOld(client, message, command.name)
                    }
                }

            } else if ((n + 1) == p.length && prefixMatched == false) {
                await observer(client, message)
            }
        })
    })

    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return

        const command = await isValidCommand(client, interaction)
        if (client.config.disabled.has("commands", command.name)) return

        if (interaction.guildID && client.customConfig.get(interaction.guildID).disabled.has("commands", command.name)) return

        if (command.value == true)
            executeCommand(client, interaction)
    })
}

async function observer(client, message, command) {
    var results = null;
    var {ignoreBots} = client.config
    if (message.guild) {
        if (message.guild.customConfig.ignoreBots) {
            ignoreBots = message.guild.customConfig;
        }
    }
    if (command) {
        if (ignoreBots >= 3 && message.author.bot == true) {
            return
        }
        try {
            results = await client.dataStore.functions.observer.filter(i => {
                    return (i.observer.type == "all" || i.observer.type == "command")
                })
                .filter(i => (client.config.disabled.has("observers", i.observer.name) == false))
            if (message.guild) {
                results = results.filter(i => client.customConfig.get(message.guild.id).disabled.has("observers", i.observer.name) == false)
            }
            results = results.map(i => (i.observer.code(client, message)))
        } catch (e) {
            console.log(e)
        }
        try {
            if (results.includes(true)) {
                return false;
            }
            return true;
        } catch (e) {
            console.log(e)
            return false
        }
    } else {
        if (ignoreBots == 2 || ignoreBots == 4) {
            if (message.author.bot == true) {
                return
            }
        }
        try {
            results = await client.dataStore.functions.observer.filter(i => {
                    return (i.observer.type == "all" || i.observer.type == "message")
                })
                .filter(i => (client.config.disabled.has("observers", i.observer.name) == false))
            if (message.guild) {
                results = results.filter(i => client.customConfig.get(message.guild.id).disabled.has("observers", i.observer.name) == false)
            }

            results = results.map(i => (i.observer.code(client, message)))
        } catch (e) {
            console.log(e)
        }
    }
}

async function isValidCommandOld(client, message, commandName) {
    if (client.dataStore.commandsOld.has(commandName)) {
        var {command} = client.dataStore.commandsOld.get(commandName)
        var permissions = client.dataStore.permissions.filter(i => {
                return i.permission.level == command.level
            })
            .filter(i => client.config.disabled.has("permissions", i.permission.name) == false)
        if (message.guild) {
            permissions = permissions.filter(i => client.customConfig.get(message.guild.id).disabled.has("permissions", i.permission.name) == false)
        }
        if (permissions.size == 0) {
            return {
                value: false,
                name: commandName
            }
        }
        var results = permissions.map(async i => {
            var {permission} = i
            var result = await permission.code(client, null, message)
            if (typeof result != "boolean") {
                console.log(Chalk.red("Error | ") + "Permission " + Chalk.yellow(permission.name) + " is not returning the correct value, please read " + Chalk.blue("https://discordspark.com/docs/permissions") + " for more information.")
                return {
                    value: true,
                    name: commandName
                };
            }
            return result;

        })
        results = await Promise.all(results)
        if (results.includes(true)) {
            return {
                value: false,
                name: commandName
            };
        }
        return {
            value: true,
            name: commandName
        };
    }
    if (client.dataStore.aliases.has(commandName)) {
        return isValidCommandOld(client, message, client.dataStore.aliases.get(commandName))

    }
    return {
        value: false,
        name: commandName
    };


}

/**
 * @param {Discord.Client} client 
 * @param {Discord.CommandInteraction} interaction 
 */
async function isValidCommand(client, interaction) {
    const {commandName} = interaction
    if (client.dataStore.commands.has(commandName)) {
        var {command} = client.dataStore.commands.get(commandName)
        var permissions = client.dataStore.permissions.filter(i => {
                return i.permission.level == command.level
            })
            .filter(i => client.config.disabled.has("permissions", i.permission.name) == false)
        if (interaction.guildID) {
            permissions = permissions.filter(i => client.customConfig.get(interaction.guildID).disabled.has("permissions", i.permission.name) == false)
        }
        if (permissions.size == 0) {
            return {
                value: false,
                name: commandName
            }
        }
        var results = permissions.map(async i => {
            var {permission} = i
            var result = await permission.code(client, interaction)
            if (typeof result != "boolean") {
                console.log(Chalk.red("Error | ") + "Permission " + Chalk.yellow(permission.name) + " is not returning the correct value, please read " + Chalk.blue("https://discordspark.com/docs/permissions") + " for more information.")
                return {
                    value: true,
                    name: commandName
                };
            }
            return result;

        })
        results = await Promise.all(results)
        if (results.includes(true)) {
            return {
                value: false,
                name: commandName
            };
        }
        return {
            value: true,
            name: commandName
        };
    }
    if (client.dataStore.aliases.has(commandName)) {
        return isValidCommand(client, interaction, client.dataStore.aliases.get(commandName))

    }
    return {
        value: false,
        name: commandName
    };


}

function executeCommandOld(client, message, commandName) {
    var {
        command,
        location
    } = client.dataStore.commandsOld.get(commandName)
    try {
        if (message.guild || message.channel.type === "dm" && command.dms) {
            command.code(client, message)?.catch(e => {
                console.error(`${location} | An error occurred while executing the command.`)
                console.error(e)
                message.channel.send(`An error occurred while executing the command.\n${e}`)
            })
        }
    } catch (e) {
        console.error(`${location} | An error occurred while executing the command.`)
        console.error(e)
    }

}

/**
 * @param {Discord.Client} client 
 * @param {Discord.CommandInteraction} interaction 
 */
function executeCommand(client, interaction) {
    var {
        command,
        location
    } = client.dataStore.commands.get(interaction.commandName)
    try {
        command.code(client, interaction)?.catch(e => {
            console.error(`${location} | An error occurred while executing the command.`)
            console.error(e)
            const msg = {content: `An error occurred while executing the command.\n${e}`, allowedMentions: {parse: []}}
            interaction.deferred || interaction.replied ? interaction.followUp(msg) : interaction.reply(msg)
                
        })
    } catch (e) {
        console.error(`${location} | An error occurred while executing the command.`)
        console.error(e)
    }

}
