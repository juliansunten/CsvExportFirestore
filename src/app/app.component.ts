import {Component, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {map} from 'rxjs/operators';
import * as firebase from 'firebase';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  returns: Observable<any>;

  reportsRef: AngularFirestoreCollection<any>;
  reports: Observable<any>;
  downloadUrl = '';

  constructor(private afs: AngularFirestore) { }

  ngOnInit() {
    this.returns = this.afs.collection('returns').valueChanges();
    this.reportsRef = this.afs.collection('returns');

    // Map the snapshot to include the document ID
    this.reports = this.afs.collection('returns')
        .snapshotChanges().pipe(
            map(arr => {
          return arr.map(snap => {
            const data = snap.payload.doc.data();
            const id = snap.payload.doc.id;
            return { ...data, id };
          });
        }));
  }

  async generateCsv() {
    if(firebase.storage().ref(`export.csv`)) {
      const reportRef = firebase.storage().ref('export.csv');
      const downloadURL = await reportRef.getDownloadURL();
      if (downloadURL) {
        this.downloadUrl = downloadURL;
      } else {
        return of(null);
      }
    }
  }

}
