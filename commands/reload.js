/*
client.api.applications(client.application.id).commands.post({data: {
    name: 'reload',
    description: 'reload things - dev only',
    options: [{
        type: 3,
        name: 'filter',
        description: 'what to reload',
        choices: [
            { name: 'commands', value: 'commands' },
            { name: 'commandsold', value: 'commandsold' },
            { name: 'observers', value: 'observers' },
            { name: 'engines', value: 'engines' },
            { name: 'snippets', value: 'snippets' },
            { name: 'permissions', value: 'permissions' },
            { name: 'events', value: 'events' }
        ]
    }]
}})
*/

const Spark = require("../app")
const Command = Spark.command("reload")

Command.setLevel(10)
Command.setDescription("Reload modules in your bot without restarting it.")

Command.code = async (client, interaction) => {
    const arg = interaction.options.get('filter')?.value
    if (!arg || arg === "all") {
        await interaction.reply("Reloading all files...");
        reloadAll();
        await reloadSearch();
        return interaction.editReply("Successfully reloaded all files.");
    } else if (arg === "commands") {
        await interaction.reply("Reloading all commands...");
        reloadCommands();
        await reloadSearch();
        return interaction.editReply("Successfully reloaded all commands.");
    } else if (arg === "commandsold") {
        await interaction.reply("Reloading all old commands...");
        reloadCommandsOld();
        await reloadSearch();
        return interaction.editReply("Successfully reloaded all old commands.");
    } else if (arg === "observers") {
        await interaction.reply("Reloading all observers...");
        reloadObservers();
        await reloadSearch();
        return interaction.editReply("Successfully reloaded all observers.");
    } else if (arg === "engines") {
        await interaction.reply("Reloading all engines...");
        reloadEngines();
        await reloadSearch();
        return interaction.editReply("Successfully reloaded engines.");
    } else if (arg === "snippets") {
        await interaction.reply("Reloading all snippets...");
        reloadSnippets();
        await reloadSearch();
        return interaction.editReply("Successfully reloaded all snippets.");
    } else if (arg === "permissions") {
        await interaction.reply("Reloading all permission files...");
        reloadPermissions();
        await reloadSearch();
        return interaction.editReply("Successfully reloaded all permission files.");
    } else if (arg === "events") {
        await interaction.reply("Reloading all events...");
        reloadEvents();
        await reloadSearch();
        return interaction.editReply("Successfully reloaded all events.");
    } else if (![
            "commands",
            "commandsold",
            "observers",
            "engines",
            "snippets",
            "permissions",
            "events"
        ].includes(arg)) {
        return interaction.reply("Please enter a valid option! \nChoose between `commands`, `commandsold`, `observers`, `engines`, `snippets`, `permissions`, or `events`.")
    }

    // Reload Functions

    function reloadAll() {
        reloadCommands()
        reloadCommandsOld()
        reloadObservers()
        reloadEngines();
        reloadSnippets();
        reloadPermissions();
        reloadEvents();
    }

    async function reloadSearch() {
        try {
            var temp = await client.search()
            client.dataStore = temp
        } catch (e) {
            console.error(e);
            interaction.followUp("There was an error while reloading.")
        }
    }

    function reloadCommands() {
        client.dataStore.commands.forEach((commands) => {
            delete require.cache[require.resolve(commands.location)];
        })
    }

    function reloadCommandsOld() {
        client.dataStore.commands.forEach((commands) => {
            delete require.cache[require.resolve(commands.location)];
        })
    }

    function reloadObservers() {
        client.dataStore.functions.observer.forEach((observer) => {
            delete require.cache[require.resolve(observer.location)];
        })
    }

    function reloadEngines() {
        client.dataStore.functions.engines.forEach((engine) => {
            delete require.cache[require.resolve(engine.location)];
        })
    }

    function reloadSnippets() {
        client.dataStore.functions.snippet.forEach((snippet) => {
            delete require.cache[require.resolve(snippet.location)];
        })
    }

    function reloadPermissions() {
        client.dataStore.permissions.forEach((permissions) => {
            delete require.cache[require.resolve(permissions.location)];
        })
    }

    function reloadEvents() {
        client.dataStore.events.forEach((events) => {
            delete require.cache[require.resolve(events.location)];
        })
    }
}
module.exports = Command;
