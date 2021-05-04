var admin = require("firebase-admin");
var serviceAccount = require("../src/serviceAccountKey.json");

module.exports = function (app) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://distaurant-fba6e-default-rtdb.europe-west1.firebasedatabase.app"
      });
    
    let database = admin.database()

    // Koordinatör listesini döner *
    app.get('/api/reservation', async (req, res) => {
        let {tableID, customerName} = req.query;
        database.ref("reservations").orderByChild("tableID").equalTo(tableID)
            .once('value')
            .then((querySnapshot) => {
                if(querySnapshot && querySnapshot.numChildren() >= 1){
                    //masa rezerveli hata ver
                    res.status(200).send({
                        status: 'error'
                    })
                }else{
                    //masa rezerveli değil rezervasyon oluştur
                    database
                        .ref('reservations/')
                        .push({
                            tableID: tableID,
                            reservationTime: new Date().toISOString(),
                            totalAmount: 0,
                            customerName: customerName
                        })
                        .then((snapshot) => {
                            res.status(200).send({
                                status: 'success',
                                reservationID: snapshot.getKey()
                            })
                        })
                        .catch((err)=>{ console.log(err)});
                }
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
    }); 
    // Seçili koordinatöre göre direklerin listesini döner *
    /*app.post('/kocasinan/poles_list', async (req, res) => { // serial : 
        if (req.body.serial != null) {
            var getPolesList = await kocasinanDB.getPolesList(req.body.serial)
            if (getPolesList != -1) {
                for (const key in getPolesList) {
                    if (Object.hasOwnProperty.call(getPolesList, key)) {
                        const element = getPolesList[key];
                        element.laststatus = func.byteToStatus(element.laststatus)
                    }
                }
                res.status(200).send({
                    status: "success",
                    result: getPolesList
                })
            } else {
                res.status(404).send({
                    status: "poles_not_found",
                })
            }
        } else {
            res.status(404).send({
                status: "incorrect_data",
            })
        }
    })
*/

}