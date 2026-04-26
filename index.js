const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes, PermissionFlagsBits } = require('discord.js');
const BOT_TOKEN = process.env.BOT_TOKEN;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!BOT_TOKEN) {
    console.error('❌ BOT_TOKEN is missing!');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Store active intervals
const activeIntervals = new Map();

// ============================================
// LOGGING FUNCTION
// ============================================
async function sendLog(guild, action, executor, targetChannel, details) {
    try {
        if (!LOG_CHANNEL_ID) return;
        
        const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`📝 ${action}`)
            .addFields(
                { name: '👤 Executor', value: `${executor.tag} (${executor.id})`, inline: true },
                { name: '📍 Channel', value: `${targetChannel} (${targetChannel.id})`, inline: true },
                { name: '📋 Details', value: details, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: `HHHH Bot Log` });
        
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Log error:', error);
    }
}

// ============================================
// STOP FUNCTION
// ============================================
function stopSending(guildId, channelId, messageCount = null) {
    const key = `${guildId}_${channelId}`;
    const intervalData = activeIntervals.get(key);
    
    if (intervalData) {
        clearInterval(intervalData.interval);
        activeIntervals.delete(key);
        
        const logMessage = messageCount 
            ? `Stopped after sending ${messageCount} messages` 
            : 'Manually stopped by command';
        
        console.log(`✅ Stopped sending in channel ${channelId}: ${logMessage}`);
        return true;
    }
    return false;
}

// ============================================
// REGISTER SLASH COMMANDS
// ============================================
const commands = [
    new SlashCommandBuilder()
        .setName('hhhh')
        .setDescription('Send a message multiple times with delay')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message or link to send')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('delay')
                .setDescription('Delay between each message in seconds (1-60)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(60))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to send (1-50)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(50))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('stophhhh')
        .setDescription('Stop the active message sending in this channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
];

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

(async () => {
    try {
        console.log('🔄 Registering slash commands...');
        
        if (GUILD_ID) {
            // Register for specific guild
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, GUILD_ID),
                { body: commands }
            );
            console.log(`✅ Slash commands registered for guild: ${GUILD_ID}`);
        } else {
            // Register globally
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands }
            );
            console.log('✅ Slash commands registered globally');
        }
    } catch (error) {
        console.error('❌ Failed to register commands:', error);
    }
})();

// ============================================
// SLASH COMMAND HANDLER
// ============================================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    
    // Check admin permission
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const errorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ Permission Denied')
            .setDescription('Only administrators can use this command!')
            .setTimestamp();
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
    
    const { commandName, channel, user, guild } = interaction;
    
    // ========== HHHH COMMAND ==========
    if (commandName === 'hhhh') {
        const message = interaction.options.getString('message');
        const delay = interaction.options.getInteger('delay');
        const amount = interaction.options.getInteger('amount');
        
        const key = `${guild.id}_${channel.id}`;
        
        // Check if already sending in this channel
        if (activeIntervals.has(key)) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Already Active')
                .setDescription(`There is already an active message sending in this channel!\nUse </stophhhh:${interaction.commandId}> to stop it first.`)
                .setTimestamp();
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
        
        // Send initial reply
        await interaction.reply({
            content: `🚀 Starting to send **${amount}** message(s) every **${delay}** second(s)`,
            ephemeral: true
        });
        
        // Log start
        await sendLog(guild, 'HHHH Started', user, channel, 
            `**Message:** ${message.substring(0, 100)}\n**Delay:** ${delay}s\n**Amount:** ${amount}\n**Status:** Started`
        );
        
        // Send first message immediately
        let sentCount = 1;
        
        try {
            await channel.send(message);
            console.log(`📨 Message ${sentCount}/${amount} sent in ${channel.name}`);
        } catch (error) {
            console.error(`Failed to send message: ${error.message}`);
            sendLog(guild, 'HHHH Error', user, channel, `Failed to send message: ${error.message}`);
            return;
        }
        
        // Set up interval for remaining messages
        const interval = setInterval(async () => {
            sentCount++;
            
            if (sentCount > amount) {
                // Complete
                clearInterval(interval);
                activeIntervals.delete(key);
                
                const completeEmbed = new EmbedBuilder()
                    .setColor(0x4CAF50)
                    .setTitle('✅ Completed')
                    .setDescription(`Successfully sent all ${amount} message(s)`)
                    .setTimestamp();
                
                await channel.send({ embeds: [completeEmbed] }).catch(() => {});
                
                await sendLog(guild, 'HHHH Completed', user, channel,
                    `**Message:** ${message.substring(0, 100)}\n**Delay:** ${delay}s\n**Amount:** ${amount}\n**Status:** Completed`
                );
                return;
            }
            
            try {
                await channel.send(message);
                console.log(`📨 Message ${sentCount}/${amount} sent in ${channel.name}`);
            } catch (error) {
                console.error(`Failed to send message: ${error.message}`);
                clearInterval(interval);
                activeIntervals.delete(key);
                
                sendLog(guild, 'HHHH Error', user, channel, `Failed to send message: ${error.message}`);
            }
        }, delay * 1000);
        
        // Store interval data
        activeIntervals.set(key, {
            interval: interval,
            userId: user.id,
            totalAmount: amount,
            message: message.substring(0, 100)
        });
    }
    
    // ========== STOPHHHH COMMAND ==========
    else if (commandName === 'stophhhh') {
        const key = `${guild.id}_${channel.id}`;
        
        if (!activeIntervals.has(key)) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Nothing to Stop')
                .setDescription('There is no active message sending in this channel.')
                .setTimestamp();
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
        
        const intervalData = activeIntervals.get(key);
        clearInterval(intervalData.interval);
        activeIntervals.delete(key);
        
        const successEmbed = new EmbedBuilder()
            .setColor(0x4CAF50)
            .setTitle('⏹️ Stopped')
            .setDescription('Successfully stopped the message sending.')
            .setTimestamp();
        
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
        
        // Send notification in channel
        const stopNotification = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('⏹️ Sending Stopped')
            .setDescription(`Message sending was manually stopped by ${user.tag}`)
            .setTimestamp();
        
        await channel.send({ embeds: [stopNotification] });
        
        // Log stop
        await sendLog(guild, 'HHHH Stopped', user, channel,
            `**Message:** ${intervalData.message}\n**Sent:** Partial completion\n**Status:** Manually stopped`
        );
    }
});

// ============================================
// CLEANUP ON BOT SHUTDOWN
// ============================================
process.on('SIGINT', () => {
    console.log('🛑 Shutting down, clearing all intervals...');
    for (const [key, data] of activeIntervals) {
        clearInterval(data.interval);
    }
    activeIntervals.clear();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Shutting down, clearing all intervals...');
    for (const [key, data] of activeIntervals) {
        clearInterval(data.interval);
    }
    activeIntervals.clear();
    process.exit(0);
});

// ============================================
// READY EVENT
// ============================================
client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`📝 Log channel: ${LOG_CHANNEL_ID || 'Not configured'}`);
    console.log(`🎮 Commands registered: /hhhh, /stophhhh`);
    console.log(`🚀 Bot is ready!`);
    
    // Set activity
    client.user.setActivity('/hhhh | Admin only', { type: 3 });
});

// ============================================
// ERROR HANDLING
// ============================================
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
});

// ============================================
// START BOT
// ============================================
client.login(BOT_TOKEN);
