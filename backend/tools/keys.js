require('dotenv').config();
const { PublicKey, PrivateKey } = require('paillier-bigint');

async function encVote(voteArray) {
    const n = process.env.PUB_N;
    const g = process.env.PUB_G;

    if (!n || !g) {
        throw new Error('Kunci publik tidak ditemukan di file .env');
    }

    const publicKey = new PublicKey(BigInt(n), BigInt(g));

    if (!Array.isArray(voteArray)) {
        throw new Error('voteArray harus berupa array.');
    }

    const encryptedArray = await Promise.all(voteArray.map(async (value) => {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Setiap nilai dalam voteArray harus berupa angka.');
        }
        return await publicKey.encrypt(BigInt(value));
    }));

    return encryptedArray;
}

async function decVote(encryptedVotes) {
    // Ambil kunci dari environment variables
    const n = process.env.PUB_N;
    const g = process.env.PUB_G;
    const lambda = process.env.PRI_LAMDA;
    const mu = process.env.PRI_MU;

    // Memeriksa apakah semua kunci diperlukan tersedia
    if (!n || !g || !lambda || !mu) {
        throw new Error('Kunci publik atau privat tidak ditemukan di file .env');
    }

    // Inisialisasi kunci publik dan privat
    const publicKey = new PublicKey(BigInt(n), BigInt(g));
    const privateKey = new PrivateKey(BigInt(lambda), BigInt(mu), publicKey);

    // Memastikan encryptedVotes adalah array
    if (!Array.isArray(encryptedVotes)) {
        throw new Error('encryptedVotes harus berupa array.');
    }

    // Dekripsi setiap suara terenkripsi
    const decryptedArray = await Promise.all(
        encryptedVotes.map(async (encryptedVoteObj) => {
            // Memastikan elemen dalam encryptedVotes adalah objek yang memiliki key "totalEncryptedVote"
            if (typeof encryptedVoteObj !== 'object' || !encryptedVoteObj.totalEncryptedVote) {
                throw new Error('Setiap elemen dalam encryptedVotes harus berupa objek dengan key "totalEncryptedVote".');
            }

            const encryptedVote = encryptedVoteObj.totalEncryptedVote;

            // Memastikan encryptedVote berupa string
            if (typeof encryptedVote !== 'string') {
                throw new Error('Setiap "totalEncryptedVote" harus berupa string.');
            }

            const encryptedBigInt = BigInt(encryptedVote);  // Mengkonversi string ke BigInt

            // Mendekripsi dan mengembalikan hasilnya sebagai string
            const decryptedVote = privateKey.decrypt(encryptedBigInt).toString();
            return decryptedVote;
        })
    );

    return decryptedArray;
}

function addEncryptedBallots(encryptedVotes) {
    const n = process.env.PUB_N;
    const g = process.env.PUB_G;

    if (!n || !g) {
        throw new Error('Kunci publik tidak ditemukan di file .env');
    }

    const publicKey = new PublicKey(BigInt(n), BigInt(g));

    if (!Array.isArray(encryptedVotes) || encryptedVotes.length === 0) {
        throw new Error('encryptedVotes harus berupa array dan tidak boleh kosong.');
    }

    // Mengubah vote yang disimpan dalam format string kembali menjadi BigInt
    const parsedVotes = encryptedVotes.map(vote => {
        try {
            // Parsing voteTo yang berisi string terenkripsi dan mengubahnya menjadi BigInt
            return JSON.parse(vote.voteTo).map(encryptedValue => BigInt(encryptedValue));
        } catch (error) {
            throw new Error('Gagal memparsing voteTo: ' + error.message);
        }
    });

    // Agregasi suara terenkripsi menggunakan penjumlahan homomorfik
    const totalEncryptedVotes = parsedVotes.reduce((total, currentVote) => {
        if (!total) return currentVote; // Inisialisasi total jika null

        // Menjumlahkan suara terenkripsi untuk setiap kandidat
        return total.map((encryptedValue, index) =>
            publicKey.addition(encryptedValue, currentVote[index])
        );
    }, null);

    // Mengembalikan hasil penjumlahan homomorfik sebagai array string
    return totalEncryptedVotes.map(value => value.toString()); // Konversi kembali ke string
}

function addTwoEncryptedVotes(votesA, votesB) {
  const n = process.env.PUB_N;
  const g = process.env.PUB_G;

  if (!n || !g) {
    throw new Error('Kunci publik tidak ditemukan di file .env');
  }

  const publicKey = new PublicKey(BigInt(n), BigInt(g));

  return votesA.map((val, i) => publicKey.addition(val, votesB[i]));
}


module.exports = { encVote, decVote, addEncryptedBallots, addTwoEncryptedVotes };
