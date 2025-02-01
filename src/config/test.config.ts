export const testConfig = {
  database: {
    url: process.env.TEST_DATABASE_URL || 'postgresql://koyeb-adm:npg_eBg1RQ9ODFyE@ep-long-meadow-a1awnbil.ap-southeast-1.pg.koyeb.app/koyebdb'
  },

  jwt: {
    secret: 'test-secret',
    expiresIn: '1h'
  }
}; 