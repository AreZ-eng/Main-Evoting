const db = require("../models");
const User = db.user;
const Vote = db.vote;
const Tps = db.tps;
const { Sequelize } = require('sequelize');
const { validationResult } = require("express-validator");
const { decVote, addEncryptedBallots } = require("../tools/keys");
const { dpassword } = require("../configs/auth.config");
const fs = require("fs");
const path = require("path");
const https = require("https");
const axios = require("axios");
const bcrypt = require('bcrypt');
const { response } = require("express");

const VOTE_STATUS = {
    BELUM_MEMILIH: "belum memilih",
    SEDANG_MEMILIH: "sedang memilih",
    SUDAH_MEMILIH: "sudah memilih"
};

// Membuat voter baru
exports.createVoter = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { uuid, nama, alamat, tiket, tps } = req.body;
    const transaction = await db.sequelize.transaction();

    try {
        const userTiket = bcrypt.hashSync(tiket, 8);
        const newUser = await User.create({ id:uuid, nama, alamat, tiket: userTiket, tps }, { transaction });
        await Vote.create({ userId: newUser.id, proses: VOTE_STATUS.BELUM_MEMILIH }, { transaction });

        await transaction.commit();
        return res.status(201).json({
            message: `User ${newUser.id} successfully created`,
            user: newUser
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        return res.status(500).json({ message: "Error creating voter", error });
    }
};

// Memulai proses voting
exports.startVoting = async (req, res, next) => {
    const userId = req.id;

    try {
        const vote = await Vote.findOne({ where: { userId } });

        if (!vote) {
            return res.status(404).json({ message: `Vote record not found for this user (${userId})` });
        }
        if (vote.proses === VOTE_STATUS.SUDAH_MEMILIH) {
            return res.status(400).json({ message: "User has already voted" });
        }

        if (vote.proses === VOTE_STATUS.SEDANG_MEMILIH) {
            return res.status(200).json({ message: `Voting process continued for user ${userId}` });
        } else {
            vote.proses = VOTE_STATUS.SEDANG_MEMILIH;
            await vote.save();
        }

        return res.status(200).json({ message: `Voting process started for user ${userId}` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error starting voting process", error });
    }
};

// Menyelesaikan proses voting
exports.finishVoting = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { hash } = req.body;
    const userId = req.id;
    const transaction = await Vote.sequelize.transaction();

    try {
        const vote = await Vote.findOne({ where: { userId }, transaction });

        if (!vote) {
            await transaction.rollback();
            return res.status(404).json({ message: "Vote record not found for this user" });
        }

        if (vote.proses === VOTE_STATUS.SUDAH_MEMILIH) {
            await transaction.rollback();
            return res.status(400).json({ message: "User has already voted" });
        } else if (vote.proses === VOTE_STATUS.BELUM_MEMILIH) {
            await transaction.rollback();
            return res.status(400).json({ message: "User has not started voting" });
        }

        vote.proses = VOTE_STATUS.SUDAH_MEMILIH;
        vote.hash = hash;
        await vote.save({ transaction });

        await transaction.commit();
        return res.status(200).json({ message: `Voting process completed for user ${userId}` });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        return res.status(500).json({ message: "Error finishing voting process", error });
    }
};

// exports.getBallots = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     const password= req.body.epassword;
//     const thePassword = dpassword;

//     try {
//         const isPasswordValid = await bcrypt.compare(password, thePassword);
//         if (!isPasswordValid) {
//             return res.status(403).json({ message: "Invalid password." });
//         }

//         const agent = new https.Agent({ rejectUnauthorized: false });
//         const token = req.token

//         const response = await axios.post(
//             "http://app_sub_api:7000/api/election/getballots",
//             { password }, 
//             {
//                 httpsAgent: agent,
//                 headers: { Authorization: `Bearer ${token}` },
//                 responseType: "json",
//             }
//         );

//         const filePath = path.join(__dirname, `../downloads/ballots_${Date.now()}.json`);

//         const dir = path.dirname(filePath);
//         if (!fs.existsSync(dir)) {
//             fs.mkdirSync(dir, { recursive: true });
//         }

//         fs.writeFileSync(filePath, JSON.stringify(response.data, null, 2), "utf-8");

//         return res.status(200).json({ message: "File successfully saved", filePath });
//     } catch (error) {
//         console.error("Error get ballots:", error);
//         return res.status(500).json({ message: "Error taking the ballots", error });
//     }
// };

exports.getBallots = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const password = req.body.epassword;
    const thePassword = dpassword;

    try {
        const isPasswordValid = await bcrypt.compare(password, thePassword);
        if (!isPasswordValid) {
            return res.status(403).json({ message: "Invalid password." });
        }

        const token = req.token;
        const agent = new https.Agent({ rejectUnauthorized: false });

        const allTps = await Tps.findAll();
        if (!allTps || allTps.length === 0) {
            return res.status(404).json({ message: "No TPS found." });
        }

        const savedFiles = [];

        for (const tps of allTps) {
            try {
                const response = await axios.post(
                    `${tps.alamat}/api/election/getballots`,
                    { password },
                    {
                        httpsAgent: agent,
                        headers: { Authorization: `Bearer ${token}` },
                        responseType: "json",
                    }
                );

                const fileName = `ballots_tps${tps.id}_${Date.now()}.json`;
                const filePath = path.join(__dirname, `../downloads/${fileName}`);

                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                fs.writeFileSync(filePath, JSON.stringify(response.data, null, 2), "utf-8");
                savedFiles.push({ tps: tps.id, file: fileName });

            } catch (tpsError) {
                console.error(`Gagal mengambil ballot dari TPS ${tps.id}:`, tpsError.message);
                savedFiles.push({ tps: tps.id, error: tpsError.message });
            }
        }

        return res.status(200).json({
            message: "Proses pengambilan ballot selesai.",
            results: savedFiles,
        });
    } catch (error) {
        console.error("Error get ballots:", error);
        return res.status(500).json({ message: "Error taking the ballots", error });
    }
};

// exports.getSumBallotsOnTps = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     const password = req.body.epassword;
//     const tps = req.body.tps;

//     try {
//         const isPasswordValid = await bcrypt.compare(password, dpassword);
//         if (!isPasswordValid) {
//             return res.status(403).json({ message: "Invalid password." });
//         }

//         const downloadsDir = path.join(__dirname, "../downloads");

//         const files = fs.readdirSync(downloadsDir);

//         const ballotFiles = files.filter(file => file.startsWith("ballots_") && file.endsWith(".json"));

//         if (ballotFiles.length === 0) {
//             return res.status(404).json({ message: "No ballots file found." });
//         }

//         const latestFile = ballotFiles.reduce((latest, file) => {
//             const currentTimestamp = parseInt(file.split("_")[1].split(".")[0], 10);
//             const latestTimestamp = parseInt(latest.split("_")[1].split(".")[0], 10);
//             return currentTimestamp > latestTimestamp ? file : latest;
//         });

//         const filePath = path.join(downloadsDir, latestFile);
//         const fileContent = fs.readFileSync(filePath, "utf-8");
//         const ballotsJSON = JSON.parse(fileContent);

//         const encryptedVotesArray = ballotsJSON.data.map(item => ({
//             totalEncryptedVote: item.totalEncryptedVote
//         }));

//         const decryptedVotes = await decVote(encryptedVotesArray);

//         const result = ballotsJSON.data.map((item, index) => ({
//             candidate: item.candidate,
//             totalVotes: decryptedVotes[index]
//         }));
        
//         return res.status(200).json({ result });    
//     } catch (error) {
//         console.error("Error processing the total ballots:", error);
//         return res.status(500).json({ message: "Error processing the total ballots", error });
//     }
// };

exports.checkTpsBallotStatus = async (req, res) => {
    try {
        const downloadsDir = path.join(__dirname, "../downloads");
        const allFiles = fs.existsSync(downloadsDir)
            ? fs.readdirSync(downloadsDir)
            : [];

        const allTps = await Tps.findAll();
        if (!allTps || allTps.length === 0) {
            return res.status(404).json({ message: "No TPS found in database." });
        }

        const results = allTps.map(tps => {
            const matchingFiles = allFiles.filter(file =>
                file.startsWith(`ballots_tps${tps.id}_`) &&
                file.endsWith(".json")
            );

            const status = matchingFiles.length > 0 ? "exists" : "missing";
            const latestFile = matchingFiles.sort().pop() || null;

            return {
                id: tps.id,
                status,
                file: latestFile,
            };
        });

        return res.status(200).json({ results });
    } catch (error) {
        console.error("Error checking TPS ballot status:", error);
        return res.status(500).json({ message: "Internal error", error });
    }
};

exports.getSumBallotsOnTps = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const password = req.body.epassword;
    const tpsId = parseInt(req.body.tps, 10);

    if (isNaN(tpsId)) {
        return res.status(400).json({ message: "Invalid TPS ID format." });
    }

    try {
        const isPasswordValid = await bcrypt.compare(password, dpassword);
        if (!isPasswordValid) {
            return res.status(403).json({ message: "Invalid password." });
        }

        const downloadsDir = path.join(__dirname, "../downloads");
        function parseEncryptedVote(encryptedVoteString) {
            return [BigInt(encryptedVoteString)];
        }

        const files = fs.readdirSync(downloadsDir);

        const tpsFiles = files.filter(file =>
            file.startsWith(`ballots_tps${tpsId}_`) && file.endsWith(".json")
        );

        if (tpsFiles.length === 0) {
            return res.status(404).json({ message: `No ballots file found for TPS ID ${tpsId}.` });
        }

        const latestFile = tpsFiles.reduce((latest, file) => {
            const currentTimestamp = parseInt(file.split("_")[2].split(".")[0], 10);
            const latestTimestamp = parseInt(latest.split("_")[2].split(".")[0], 10);
            return currentTimestamp > latestTimestamp ? file : latest;
        });

        const filePath = path.join(downloadsDir, latestFile);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const ballotsJSON = JSON.parse(fileContent);

        const encryptedVotesArray = ballotsJSON.data.map(item => ({
            totalEncryptedVote: item.totalEncryptedVote
        }));

        const decryptedVotes = await decVote(encryptedVotesArray);

        const result = ballotsJSON.data.map((item, index) => ({
            candidate: item.candidate,
            totalVotes: decryptedVotes[index]
        }));
        
        return res.status(200).json({ tps: tpsId, result });    
    } catch (error) {
        console.error("Error processing the total ballots for TPS:", error);
        return res.status(500).json({ message: "Error processing the total ballots for TPS", error });
    }
};

exports.getSumBallots = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const password = req.body.epassword;
    const downloadsDir = path.join(__dirname, "../downloads");
    const tpsDataForAggregation = [];
    let candidateNamesList = null;

    try {
        const isPasswordValid = await bcrypt.compare(password, dpassword);
        if (!isPasswordValid) {
            return res.status(403).json({ message: "Invalid password." });
        }
        // 1. Ambil semua data TPS dari database
        const allTpsFromDb = await Tps.findAll({ attributes: ['id'] }); // Hanya ambil ID untuk efisiensi
        if (!allTpsFromDb || allTpsFromDb.length === 0) {
            return res.status(404).json({ message: "Tidak ada data TPS yang ditemukan di database." });
        }

        // 2. Periksa apakah direktori 'downloads' ada
        if (!fs.existsSync(downloadsDir)) {
            return res.status(404).json({ message: "Folder 'downloads' tidak ditemukan." });
        }
        const filesInDir = fs.readdirSync(downloadsDir); // Baca semua file sekali

        // 3. Iterasi setiap TPS dari database
        for (const tps of allTpsFromDb) {
            const tpsId = tps.id; // Asumsi model Tps memiliki atribut 'id'

            // 3a. Cari semua file ballot yang sesuai untuk TPS saat ini
            const tpsBallotFiles = filesInDir.filter(file => {
                // Regex untuk mencocokkan "ballots_tps<ID_TPS>_<timestamp>.json"
                const match = file.match(/^ballots_tps(\d+)_(\d+)\.json$/);
                return match && parseInt(match[1], 10) === tpsId;
            });

            if (tpsBallotFiles.length === 0) {
                console.warn(`Tidak ada file ballot yang ditemukan untuk TPS ID ${tpsId} di folder 'downloads'. TPS ini dilewati.`);
                continue; // Lanjut ke TPS berikutnya
            }

            // 3b. Identifikasi file terbaru berdasarkan timestamp di nama file
            let latestFileName = tpsBallotFiles[0];
            if (tpsBallotFiles.length > 1) {
                latestFileName = tpsBallotFiles.reduce((latestFile, currentFile) => {
                    // Ekstrak timestamp dari nama file (match[2])
                    const latestTimestamp = parseInt(latestFile.match(/^ballots_tps\d+_(\d+)\.json$/)[1], 10);
                    const currentTimestamp = parseInt(currentFile.match(/^ballots_tps\d+_(\d+)\.json$/)[1], 10);
                    return currentTimestamp > latestTimestamp ? currentFile : latestFile;
                });
            }
            console.log(`Untuk TPS ID ${tpsId}, file terbaru yang akan diproses adalah: ${latestFileName}`);

            // 3c. Proses file terbaru yang dipilih
            const filePath = path.join(downloadsDir, latestFileName);
            let fileContent;
            try {
                fileContent = fs.readFileSync(filePath, "utf-8");
            } catch (readError) {
                console.error(`Gagal membaca file terbaru ${latestFileName} untuk TPS ID ${tpsId}: ${readError.message}. TPS ini dilewati.`);
                continue;
            }

            let ballotsJSON;
            try {
                ballotsJSON = JSON.parse(fileContent);
            } catch (parseError) {
                console.error(`Gagal memparsing JSON dari file ${latestFileName} untuk TPS ID ${tpsId}: ${parseError.message}. TPS ini dilewati.`);
                continue;
            }

            // 3d. Validasi struktur ballotsJSON.data
            if (!ballotsJSON || !Array.isArray(ballotsJSON.data) || ballotsJSON.data.length === 0) {
                console.warn(`Struktur data tidak valid atau array 'data' kosong pada file ${latestFileName} untuk TPS ID ${tpsId}. TPS ini dilewati.`);
                continue;
            }
            if (!ballotsJSON.data.every(item =>
                typeof item.candidate === 'string' &&
                (typeof item.totalEncryptedVote === 'string' || typeof item.totalEncryptedVote === 'number'))) {
                console.warn(`Item dalam 'data' pada file ${latestFileName} untuk TPS ID ${tpsId} tidak memiliki properti 'candidate' (string) atau 'totalEncryptedVote' (string/number) yang valid. TPS ini dilewati.`);
                continue;
            }

            // 3e. Tetapkan atau verifikasi daftar dan urutan kandidat
            const currentFileCandidateNames = ballotsJSON.data.map(item => item.candidate);
            if (!candidateNamesList) {
                candidateNamesList = currentFileCandidateNames;
                console.log('Daftar kandidat diinisialisasi dari file:', latestFileName);
            } else {
                if (currentFileCandidateNames.length !== candidateNamesList.length ||
                    !currentFileCandidateNames.every((name, idx) => name === candidateNamesList[idx])) {
                    console.warn(`Urutan atau jumlah kandidat pada file ${latestFileName} (TPS ID ${tpsId}) tidak konsisten dengan file sebelumnya. TPS ini dilewati.`);
                    continue;
                }
            }

            // 3f. Ekstrak suara terenkripsi untuk TPS ini, pastikan semuanya string
            const encryptedVotesForTps = ballotsJSON.data.map(item => item.totalEncryptedVote.toString());
            tpsDataForAggregation.push({
                voteTo: JSON.stringify(encryptedVotesForTps)
            });
            console.log(`Data dari TPS ID ${tpsId} (file: ${latestFileName}) berhasil ditambahkan untuk agregasi.`);
        }

        // 4. Periksa apakah ada data valid yang berhasil dikumpulkan untuk agregasi
        if (tpsDataForAggregation.length === 0) {
            return res.status(404).json({ message: "Tidak ada data ballot yang valid yang dapat diproses dari TPS manapun." });
        }
        if (!candidateNamesList) {
             return res.status(500).json({ message: "Gagal menentukan daftar kandidat dari file ballot manapun." });
        }

        // 5. Agregasi semua suara terenkripsi
        console.log(`Memulai agregasi untuk ${tpsDataForAggregation.length} set data TPS...`);
        const finalEncryptedResultArray = addEncryptedBallots(tpsDataForAggregation);

        // 6. Siapkan respons akhir
        const dataToDecrypt = finalEncryptedResultArray.map(encVote => ({
            totalEncryptedVote: encVote
        }));
        
        console.log(`Memulai dekripsi untuk ${dataToDecrypt.length} hasil agregasi...`);
        const decryptedVoteCounts = await decVote(dataToDecrypt);

        // 7. Siapkan respons akhir dengan hasil dekripsi
        const finalResults = candidateNamesList.map((candidateName, index) => ({
            candidate: candidateName,
            // totalEncryptedVote: finalEncryptedResultArray[index],
            decryptedTotalVotes: decryptedVoteCounts[index]    // Hasil dekripsi
        }));
        
        return res.status(200).json({
            message: "Total suara berhasil diagregasi dan didekripsi dari TPS yang valid.",
            processedTpsCount: tpsDataForAggregation.length,
            data: finalResults // Mengirim hasil yang sudah menyertakan dekripsi
        });
    } catch (error) {
        console.error("Error dalam fungsi getSumBallots:", error);
        if (error.message.includes('Kunci publik tidak ditemukan') || 
            error.message.includes('Gagal memparsing voteTo') || 
            error.message.includes('Jumlah kandidat tidak konsisten')) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Terjadi kesalahan internal saat memproses total suara.", error: error.message });
    }
};

exports.getAllVoters = async (req, res) => {
    try {
        const voters = await Vote.findAll();

        return res.status(200).json(voters);
    } catch (error) {
        console.error("Error fetching all voters:", error);
        return res.status(500).json({ message: "Error fetching all voters", error });
    }
};

// exports.resetVote = async (req, res) => {
//     const { ids } = req.body;
//     const token = req.token;

//     if (!Array.isArray(ids) || ids.length === 0) {
//         return res.status(400).json({ message: "Array of voter IDs is required." });
//     }

//     const agent = new https.Agent({ rejectUnauthorized: false });

//     try {
//         // Reset semua vote yang id-nya ada di array pada sub API
//         const response = await axios.post(
//             "http://app_sub_api:7000/api/election/resetvotes",
//             { ids },
//             {
//                 headers: { Authorization: `Bearer ${token}` },
//                 httpsAgent: agent,
//             }
//         );

//         if (response.status !== 200) {
//             return res.status(response.status).json({ message: "Failed to reset votes on sub API", detail: response.data });
//         }

//         // Reset di database lokal
//         const updated = await Vote.update(
//             { hash: null, proses: VOTE_STATUS.BELUM_MEMILIH },
//             { where: { userId: ids } }
//         );

//         return res.status(200).json({ message: `${updated[0]} vote(s) have been reset.` });
//     } catch (error) {
//         console.error("Error resetting votes:", error);
//         return res.status(500).json({ message: "Error resetting votes", error });
//     }
// };

// exports.getVoterById = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const voter = await User.findOne({
//             where: { id },
//             attributes: ["id", "nama", "alamat", "tps"],
//             include: [
//                 {
//                     model: Vote,
//                     attributes: ["proses", "hash"],
//                 },
//             ],
//         });

//         if (!voter) {
//             return res.status(404).json({ message: "Voter not found" });
//         }

//         return res.status(200).json(voter);
//     } catch (error) {
//         console.error("Error fetching voter by ID:", error);
//         return res.status(500).json({ message: "Error fetching voter by ID", error });
//     }
// };

exports.resetVote = async (req, res) => {
    const { ids } = req.body;
    const token = req.token;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Array of voter IDs is required." });
    }

    const agent = new https.Agent({ rejectUnauthorized: false });
    const transaction = await db.sequelize.transaction();

    try {
        const users = await User.findAll({
            where: { id: ids },
            attributes: ['id', 'tps'],
            raw: true
        });

        if (users.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: "No users found with the given IDs." });
        }

        const groupedByTps = {};
        for (const user of users) {
            if (!groupedByTps[user.tps]) {
                groupedByTps[user.tps] = [];
            }
            groupedByTps[user.tps].push(user.id);
        }

        const tpsList = await Tps.findAll({
            where: { id: Object.keys(groupedByTps) },
            attributes: ['id', 'alamat'],
            raw: true
        });

        const resetResults = [];
        let remoteFailed = false;

        for (const tps of tpsList) {
            const tpsUserIds = groupedByTps[tps.id];

            try {
                const response = await axios.post(
                    `${tps.alamat}/api/election/resetvotes`,
                    { ids: tpsUserIds },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        httpsAgent: agent,
                    }
                );

                if (response.status !== 200) {
                    remoteFailed = true;
                    resetResults.push({ tpsId: tps.id, status: 'failed', detail: response.data });
                    continue;
                }

                resetResults.push({ tpsId: tps.id, status: 'success', count: tpsUserIds.length });

            } catch (tpsError) {
                console.error(`Error resetting votes for TPS ${tps.id}:`, tpsError.message);
                remoteFailed = true;
                resetResults.push({ tpsId: tps.id, status: 'error', error: tpsError.message });
            }
        }

        if (remoteFailed) {
            await transaction.rollback();
            return res.status(500).json({
                message: "Rollback due to failure in sub TPS API.",
                remoteResults: resetResults
            });
        }

        const updated = await Vote.update(
            { hash: null, proses: VOTE_STATUS.BELUM_MEMILIH },
            {
                where: { userId: ids },
                transaction
            }
        );

        await transaction.commit();

        return res.status(200).json({
            message: "Vote reset process completed.",
            updatedLocal: updated[0],
            remoteResults: resetResults
        });

    } catch (error) {
        await transaction.rollback();
        console.error("Error resetting votes:", error);
        return res.status(500).json({ message: "Error resetting votes", error });
    }
};

exports.autoInsertVotes = async (req, res) => {
    try {
        const voteCount = await Vote.count();
        if (voteCount === 0) {
            console.log("Votes table is empty. Adding data...");

            const users = await User.findAll();

            const voteData = users.map(user => ({
                userId: user.id,
                proses: VOTE_STATUS.BELUM_MEMILIH,
                hash: null,
            }));

            await Vote.bulkCreate(voteData);
            console.log("Data successfully inserted into votes table.");
            return res.status(201).json({ message: "Votes table successfully populated." });
        } else {
            console.log("Votes table is not empty. Skipping data insertion.");
            return res.status(200).json({ message: "Votes table is already populated. No action taken." });
        }
    } catch (error) {
        console.error("Error while inserting data into votes table:", error);
        return res.status(500).json({ message: "Error inserting data into votes table.", error });
    }
};
