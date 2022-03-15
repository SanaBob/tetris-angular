import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from  '@angular/fire/firestore';

// import { AngularFireDatabaseModule } from '@angular/fire/database';
// import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TetrisComponent } from './tetris/tetris.component';

@NgModule({
  declarations: [
    AppComponent,
    TetrisComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyCCOIXBE_hECvx_E9qGy6CwJADtJuSUui8",
      authDomain: "tetris-fc499.firebaseapp.com",
      databaseURL: "https://tetris-fc499-default-rtdb.firebaseio.com",
      projectId: "tetris-fc499",
      storageBucket: "tetris-fc499.appspot.com",
      messagingSenderId: "74944565482",
      appId: "1:74944565482:web:ad09a4c5f4a9648bb58793"
    }),
    AngularFirestoreModule
  ],
providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
