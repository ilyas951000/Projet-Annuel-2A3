// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'backend-eco-deli',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        STRIPE_SECRET_KEY: 'sk_test_51RLLMHENhvkcPeq4CdGUewPH0yr8a7egfSf3K8xiZQKIC5iU4My0n8VjUZZ2Ak196vz85tQn7KOoJBDpB2vynWeZ00sE6ppuWO',
        STRIPE_WEBHOOK_SECRET: 'whsec_80deeee6a1f5b8496ac8104ace4e8a97d2bf2080c484420fd633972f809862c',
        STRIPE_PUBLISHABLE_KEY: 'whsec_3w7xcwVgWTpBwIEMEemSqRYjjQcFG2DB',
        APP_URL: 'https://ecodeli.eu/api',
      },
    },
  ],
};
