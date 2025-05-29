const bcrypt = require('bcrypt');
const readline = require('readline');

// Daftar password yang ingin di-hash
const newPassword = ['admin'];
const hashedPasswords = [];

// Hash setiap password
newPassword.forEach(password => {
    const hashedPassword = bcrypt.hashSync(password, 8);
    hashedPasswords.push(hashedPassword);
});

// Tampilkan hash (opsional, untuk debugging)
console.log('Hashed Passwords:', hashedPasswords);

// Setup readline untuk input dari user
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Minta user memasukkan password
rl.question('Masukkan password untuk verifikasi: ', (inputPassword) => {
    // Bandingkan input user dengan hash
    const isMatch = bcrypt.compareSync(inputPassword, hashedPasswords[0]);

    if (isMatch) {
        console.log('Password cocok!');
    } else {
        console.log('Password tidak cocok.');
    }

    rl.close();
});
