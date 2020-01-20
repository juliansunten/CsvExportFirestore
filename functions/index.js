const functions = require('firebase-functions');
const admin = require('firebase-admin');
const databaseURL = 'https://albrechtkom-retour.firebaseio.com';
const storageBucket = 'gs://albrechtkom-retour.appspot.com';
const fs = require('fs-extra');
const json2csv = require('json2csv');
const path = require('path');
const os = require('os');

admin.initializeApp({
    databaseURL: databaseURL,
    storageBucket: storageBucket
});

const db = admin.firestore();
exports.db = admin.firestore();
const storageRef = admin.storage().bucket();


exports.createCSV = functions.firestore
    .document('returns/{reportId}')
    .onCreate(event => {

        // Step 1. Set main variables
        console.log(event.data());
        const fileName = `export.csv`;
        const tempFilePath = path.join(os.tmpdir(), fileName);

        // Step 2. Query collection
        return db.collection('returns')
            .get()
            .then(querySnapshot => {

                /// Step 3. Creates CSV file from with orders collection
                const returns = [];
                querySnapshot.forEach(doc => {
                    returns.push(doc.data())
                });
                return json2csv.parse(returns);
            })
            .then(csv => {
                return fs.outputFile(tempFilePath, csv);
            })
            .then(() => {
                return storageRef.upload(tempFilePath);
            })
            .catch(err => console.log(err) );

    });



