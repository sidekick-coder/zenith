export default {
    name: 'Sample',
    cron : '* * * * *', // minute
    execute: async () => {
        logger.info('Sample task executed at: ' + new Date().toISOString());
    }
}
