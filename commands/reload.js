/*
client.api.applications(client.config.applicationID).commands.post({data: {
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

Command.code = async (client, interaction, respondFull, followup) => {
    const respond = text => respondFull({type: 4, data: {content: text}})
    const edit = text => client.api.webhooks(client.config.applicationID, interaction.token).messages('@original').patch({data: {content: text}})
    const arg = interaction.data.options?.[0].value
    if (!arg || arg == "all") {
        await respond("Reloading all files...");
        reloadAll();
        await reloadSearch();
        return edit("Successfully reloaded all files.");
    } else if (arg === "commands") {
        await respond("Reloading all commands...");
        reloadCommands();
        await reloadSearch();
        return edit("Successfully reloaded all commands.");
    } else if (arg === "commandsold") {
        await respond("Reloading all old commands...");
        reloadCommandsOld();
        await reloadSearch();
        return edit("Successfully reloaded all old commands.");
    } else if (arg === "observers") {
        await respond("Reloading all observers...");
        reloadObservers();
        await reloadSearch();
        return edit("Successfully reloaded all observers.");
    } else if (arg === "engines") {
        await respond("Reloading all engines...");
        reloadEngines();
        await reloadSearch();
        return edit("Successfully reloaded engines.");
    } else if (arg === "snippets") {
        await respond("Reloading all snippets...");
        reloadSnippets();
        await reloadSearch();
        return edit("Successfully reloaded all snippets.");
    } else if (arg === "permissions") {
        await respond("Reloading all permission files...");
        reloadPermissions();
        await reloadSearch();
        return edit("Successfully reloaded all permission files.");
    } else if (arg === "events") {
        await respond("Reloading all events...");
        reloadEvents();
        await reloadSearch();
        return edit("Successfully reloaded all events.");
    } else if (![
            "commands",
            "commandsold",
            "observers",
            "engines",
            "snippets",
            "permissions",
            "events"
        ].includes(arg)) {
        return respond("Please enter a valid option! \nChoose between `commands`, `commandsold`, `observers`, `engines`, `snippets`, `permissions`, or `events`.")
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
            followup.send("There was an error while reloading.")
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
