const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'empresa123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash para "empresa123":');
  console.log(hash);
}

generateHash();
