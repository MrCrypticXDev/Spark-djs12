const Spark = require("../")
const Permission = Spark.permission("Owner", {level: 10})
Permission.code = (client, interaction, message) => {
    if (message) {
        if (client.config.ownerID !== message.author.id) {
            return true
        }
        return false;
    } else {
        if (client.config.ownerID !== interaction.user.id) {
            return true
        }
        return false;
    }

}

module.exports = Permission
