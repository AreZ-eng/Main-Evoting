const { body } = require('express-validator');
const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/election.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/election/createvoter", [
        body('nama').isLength({min: 1}),
        body('alamat').isLength({min: 1}),
        body('tiket').isLength({min: 1}),
    ], controller.createVoter)

    app.post("/api/election/startvoting", [
        authJwt.verifyToken,
    ], controller.startVoting)

    app.post("/api/election/finishvoting", [
        authJwt.verifyToken,
        body("hash").isLength({min: 1})
    ], controller.finishVoting)

    app.get("/api/election/getallvoters", [
        authJwt.verifyToken,
    ], controller.getAllVoters)

    app.post('/api/election/resetvotes',[
        authJwt.verifyToken,
        body("ids").isLength({min: 1}),
    ], controller.resetVote);

    app.get('/api/election/checktpsStatus',[
        authJwt.verifyToken,
    ], controller.checkTpsBallotStatus)

    app.post("/api/election/getballots", [
        authJwt.verifyToken,
        body("epassword").isLength({min: 1})
    ], controller.getBallots)

    app.post("/api/election/getballotstps", [
        authJwt.verifyToken,
        body("epassword").isLength({min: 1}),
        body("tps").isLength({min: 1}),
    ], controller.getBallotsTps)

    app.post("/api/election/getsumballotsontps",[
        authJwt.verifyToken,
        body("epassword").isLength({min: 1}),
        body("tps").isLength({min: 1}),
    ], controller.getSumBallotsOnTps)

    app.post("/api/election/getsumballots",[
        authJwt.verifyToken,
        body("epassword").isLength({min: 1}),
    ], controller.getSumBallots)

    app.post("/api/election/insertvoter", [authJwt.verifyToken], controller.autoInsertVotes)
}     
