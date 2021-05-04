var admin = require("firebase-admin");
var serviceAccount = require("../src/serviceAccountKey.json");
var reservations = {};
var maxReservationTime = 45;

module.exports = function (app) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://distaurant-fba6e-default-rtdb.europe-west1.firebasedatabase.app"
      });
    
    let database = admin.database()
    
    database.ref("reservations").on('value', (dataSnapshot) => {
        console.log("reservations updated!");
        reservations = dataSnapshot;
    });

    app.get('/api/reservation', async (req, res) => {
        let {tableID, customerName} = req.query;
        database.ref("reservations").orderByChild("tableID").equalTo(tableID)
            .once('value')
            .then((querySnapshot) => {
                if(querySnapshot && querySnapshot.numChildren() >= 1){
                    //masa rezerveli hata ver
                    res.status(200).send({
                        status: 'error',
                        description: 'table_already_reserved'
                    })
                }else{
                    //masa rezerveli değil rezervasyon oluştur
                    database
                        .ref('reservations')
                        .push({
                            tableID: tableID,
                            reservationTime: new Date().toISOString(),
                            totalAmount: 0,
                            customerName: customerName
                        })
                        .then((snapshot) => {
                            database
                                .ref('tables')
                                .child(tableID)
                                .update({
                                    isReserved: true
                                })
                                .then(() => {
                                    res.status(200).send({
                                        status: 'success',
                                        reservationID: snapshot.getKey()
                                    })
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(200).send({
                                        status: 'error',
                                        description: 'table_state_could_not_updated'
                                    });
                                })
                        })
                        .catch((err)=>{ 
                            console.log(err);
                            res.status(200).send({
                                status: 'error',
                                description: 'reservation_could_not_created'
                            });
                        });
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(200).send({
                    status: 'error',
                    description: 'could_not_get_reservations'
                });
            });
    }); 
    app.post('/api/order', async (req, res) => {
        let {orders, reservationID} = req.body;
        let totalAmount, reservationTotalAmount = 0;
        let orderID;
        if(new Date(new Date() - reservations[reservationID].reservationTime).getMinutes() < maxReservationTime){
            Object.entries(orders).forEach(order => {
                totalAmount += order.price;
            });
            database
                .ref('orders')
                .push({
                    orders: orders,
                    orderTime: new Date().toISOString(),
                    reservationID: reservationID,
                    totalAmount: totalAmount
                })
                .then((snapshot) => {
                    orderID = snapshot.getKey();
                    res.status(200).send({
                        status: 'success',
                        orderID: snapshot.getKey()
                    })
                })
                .catch((err)=>{ console.log(err)});
    
            reservationTotalAmount = (reservations[reservationID].totalAmount + totalAmount);
            
            database.ref("reservations")
                .child(reservationID)
                .update({
                    totalAmount: reservationTotalAmount
                })
                .catch(err => console.log(err));
        }else{
            res.status(200).send({
                status: 'error',
                description: 'max_time_reached'
            })
        }
    });
    app.post('/api/closeReservation', async (req, res) => {
        let {reservationID} = req.body;
        reservations[reservationID]["cancelledTime"] = new Date().toISOString();

        database
        .ref('oldReservations'+reservationID)
        .set(
            reservations[reservationID]
        )
        .then((snapshot) => {
            database.ref("reservations")
            .child(reservationID)
            .remove()
            .then(() => {
                res.status(200).send({
                    status: 'success'
                })
            })
            .catch(err => {
                console.log(err);
                res.status(200).send({
                    status: 'error',
                    description: err
                });
            });
        })
        .catch((err)=>{
            console.log(err);
            res.status(200).send({
                status: 'error',
                description: err
            });
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