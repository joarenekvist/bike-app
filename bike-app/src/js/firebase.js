// This is the javascript file for firebase methods, declarations and initilizations.
// From this file we import the database in other places in the program, and from this file we
// fetch the methods used to update the database or subscribe to a table or row in the database.
// If you feel at all intimidated by this code you can always ask Seb and he'll explain what the things do!

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { setDoc, getDoc, doc, onSnapshot } from "firebase/firestore"; //addDoc

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
  measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID,
};

//initialize Firebase
const app = initializeApp(firebaseConfig);

//get Firebase Authentication and Firestore
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();


//this is how we add an entry to the database. 
async function addUserToDatabase(userLoginData) {
  const userDocRef = doc(db, "users", userLoginData.email); //second paramter "users" defines the table, third parameter "userloginData.email" defines the title
                                                            //of the new row in the table. Think of it as entry primary key.
  try {
    //we check to see if the entry already exists, so we dont overwrite it:
    const docSnap = await getDoc(userDocRef);
    //if the document exists (the user is already in the database)
    if (docSnap.exists()) {
      console.log("User with the following email already exists and was not added to database again:", userLoginData.email);
      return; //optionally, we can handle this case or notify the user
    }
    await setDoc(userDocRef, { //the setDoc method is imported from firebase and just says "at this row, set this data.". there is also updateDoc, addDdoc, getDoc.
      name: userLoginData.name,
      email: userLoginData.email,
      photoURL: userLoginData.photoURL,
      uid: userLoginData.uid
      //bikecomponents : []
    });
    console.log("User registered with following email: ", userLoginData.email);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

//This is how we subscribe to a table in the database. Each time it changes, the code inside onSnapshot() executes and we can fetch the data.
async function subscribeToUserInDatabase(state){
  if (state.userDatabaseSubscription) {
    state.userDatabaseSubscription(); //calling the subscription cancels it out!!!
    state.userDatabaseSubscription = null; //clears the stored function
  }

  const userDocRef = doc(db, "users", state.user.email);
  //this sets up the Firestore listener
  const subscription = onSnapshot(userDocRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const rowData = docSnapshot.data();

      // Ensure valid data
      if (rowData.bike) {
        const rawComponents = rowData.bike.components || [];

        state.bikeComponents = rawComponents.map(comp => ({
          type: comp.type || comp.name || "Unknown",
          brand: comp.brand || "Unknown",
          description: comp.description || "",
          inUse: comp.inUse !== undefined ? comp.inUse : 1,
          health: {
            mileage: comp.health?.mileage ?? 0,
            lifespan: comp.health?.lifespan ?? 1000
          }
        }));
      }

      console.log("Fetched snapshot of user data in firestore.");
    } else {
      console.error("Row/document does not exist in firestore!");
    }
  }, (error) => {
    console.error("Error subscribing to user in firestore:", error);
  });

  state.userDatabaseSubscription = subscription; //we save the subscription as an object to the model so that we can unsubscribe if we want
}

async function updateBikePartInformationInDatabase(state){
  const userDocRef = doc(db, "users", state.user.email);
  try {
    //the merge:true option ensures that only the bike field is updated,
    await setDoc(userDocRef, {
      bike: {
        components: state.bikeComponents || [],
      }
    }, { merge: true });
    console.log("User bike updated successfully for", state.user.email);
  } catch (e) {
    console.error("Error updating bike component: ", e);
  }
}

export { auth, db, googleProvider, addUserToDatabase, subscribeToUserInDatabase, updateBikePartInformationInDatabase };
