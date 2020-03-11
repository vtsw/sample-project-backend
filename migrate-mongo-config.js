module.exports = {
  mongodb: {
    url: 'mongodb://simple:simplePassword@mongodb:27017',
    databaseName: 'admin',
    options: {
      useNewUrlParser: true,
    },
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: 'migrations',

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: 'changelog',
};
