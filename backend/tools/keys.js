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
    const n = process.env.PUB_N;
    const g = process.env.PUB_G;
    const lambda = process.env.PRI_LAMDA;
    const mu = process.env.PRI_MU;

    if (!n || !g || !lambda || !mu) {
        throw new Error('Kunci publik atau privat tidak ditemukan di file .env');
    }

    const publicKey = new PublicKey(BigInt(n), BigInt(g));
    const privateKey = new PrivateKey(BigInt(lambda), BigInt(mu), publicKey);

    if (!Array.isArray(encryptedVotes)) {
        throw new Error('encryptedVotes harus berupa array.');
    }

    const decryptedArray = await Promise.all(
        encryptedVotes.map(async (encryptedVoteObj) => {
            if (typeof encryptedVoteObj !== 'object' || !encryptedVoteObj.totalEncryptedVote) {
                throw new Error('Setiap elemen dalam encryptedVotes harus berupa objek dengan key "totalEncryptedVote".');
            }

            const encryptedVote = encryptedVoteObj.totalEncryptedVote;

            if (typeof encryptedVote !== 'string') {
                throw new Error('Setiap "totalEncryptedVote" harus berupa string.');
            }

            const encryptedBigInt = BigInt(encryptedVote);

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

    const parsedVotes = encryptedVotes.map(vote => {
        try {
            return JSON.parse(vote.voteTo).map(encryptedValue => BigInt(encryptedValue));
        } catch (error) {
            throw new Error('Gagal memparsing voteTo: ' + error.message);
        }
    });

    const totalEncryptedVotes = parsedVotes.reduce((total, currentVote) => {
        if (!total) return currentVote;

        return total.map((encryptedValue, index) =>
            publicKey.addition(encryptedValue, currentVote[index])
        );
    }, null);

    return totalEncryptedVotes.map(value => value.toString());
}

module.exports = { encVote, decVote, addEncryptedBallots };
