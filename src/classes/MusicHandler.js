const ytdl = require('discord-ytdl-core')
class MusicHandler {
    /**
     * @param {import("./MusicClient")} client 
     */
    constructor(client) {
        this.client = client
    }
    /**
     * @param {Object} song 
     * @param {string} song.title
     * @param {string} song.channel
     * @param {string} song.url
     * @param {string} song.playUser
     * @param {any} song.vote
     * @param {import("discord.js").Message} message 
     */
    async play(song, message) {
        const queue = this.client.queue.get(message.guild.id)
        if(!song) {
            queue.channel.leave()
            this.client.queue.delete(message.guild.id)
            return queue.textChannel.send("🚫 Music queue ended.").catch(console.error);
        }
            const stream = await ytdl(song.url, {
                filter: 'audioonly',
                quality: "highestaudio",
                opusEncoded: true,
                seek: 0 / 1000,
                highWaterMark: 1 << 25
            })
       

        const dispatcher = queue.connection
        .play(stream, {type: "opus", bitrate: "auto"})
        .on("finish", () => {
            if(playingMessage && !playingMessage.deleted) playingMessage.delete().catch(console.error);

            if(queue.loop) {
                let lastSong = queue.songs.shift()
                queue.songs.push(lastSong)
                this.play(queue.songs[0], message)
            } else {
                queue.songs.shift()
                this.play(queue.songs[0], message)
            }
        }).on("error", (err) => {
            console.error(err)
            queue.songs.shift()
            this.play(queue.songs[0], message)
        })
        dispatcher.setVolumeLogarithmic(queue.volume / 100)

        try {
            var playingMessage = await queue.textChannel.send(`Now Playing: ${song.title} from ${song.channel}`);
        } catch (err) {
            console.error(err)
        }
    }
}

module.exports = MusicHandler