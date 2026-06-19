require('dotenv').config({ path: __dirname + '/.env' });

module.exports = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/moneycircle',
    databaseName: process.env.DATABASE_NAME || 'moneycircle',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
};