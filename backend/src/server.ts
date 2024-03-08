if (process.env.ENV=='PRODUCTION') require('module-alias/register');
import app from './app';

// Initialize Database
import '#core/database';

// Initialize Web3 Service
import '#services/web3.service';

const {PORT} = process.env;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
  