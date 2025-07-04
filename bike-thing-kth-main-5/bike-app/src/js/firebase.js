// This is the javascript file for firebase methods, declarations and initilizations.
// From this file we import the database in other places in the program, and from this file we
// fetch the methods used to update the database or subscribe to a table or row in the database.
// If you feel at all intimidated by this code you can always ask Seb and he'll explain what the things do!

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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
      console.log(
        "User with the following email already exists and was not added to database again:",
        userLoginData.email
      );
      return; //optionally, we can handle this case or notify the user
    }
    await setDoc(userDocRef, {
      //the setDoc method is imported from firebase and just says "at this row, set this data.". there is also updateDoc, addDdoc, getDoc.
      name: userLoginData.name,
      email: userLoginData.email,
      photoURL: userLoginData.photoURL,
      uid: userLoginData.uid,
      //bikecomponents : []
    });
    console.log("User registered with following email: ", userLoginData.email);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

//This is how we subscribe to a table in the database. Each time it changes, the code inside onSnapshot() executes and we can fetch the data.
async function subscribeToUserInDatabase(state) {
  if (state.userDatabaseSubscription) {
    state.userDatabaseSubscription(); //calling the subscription cancels it out!!!
    state.userDatabaseSubscription = null; //clears the stored function
  }

  const userDocRef = doc(db, "users", state.user.email);
  //this sets up the Firestore listener
  const subscription = onSnapshot(
    userDocRef,
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        const rowData = docSnapshot.data();

        if (rowData.bikes) {
          state.bikes = rowData.bikes.map((bike) => ({
            ...bike,
            components:
              bike.components?.map((comp) => ({
                type: comp.type || comp.name || "Unknown",
                brand: comp.brand || "Unknown",
                description: comp.description || "",
                inUse: comp.inUse !== undefined ? comp.inUse : 1,
                health: {
                  mileage: comp.health?.mileage ?? 0,
                  lifespan: comp.health?.lifespan ?? 1000,
                },
              })) || [],
          }));
          
          // Add this line to check for maintenance after bikes are loaded
          if (state.store) {
            state.store.dispatch("checkForMaintenance");
          }
        }

        if (rowData.userSettings) {
          state.userSettings = rowData.userSettings;

          if (!rowData.userSettings.userRegisteredDevices) {
            state.userSettings.userRegisteredDevices = [];
          }
          if (!rowData.userSettings.userActiveDevice) { //there is no registered active device
            state.userSettings.userActiveDevice = "No active device";
          }

          subscribeToDeviceInDatabase(state);

          state.totalDistanceTravelled = rowData.totalDistanceTravelled || 0;
          state.cachedRoutes = rowData.cachedRoutes || [];
        } else {
          console.log(
            "No entry found in database when fetching snapshot for the user setting field of ",
            state.user.email
          );
        }

        console.log("Fetched snapshot of user data in firestore.");
      } else {
        console.error("Row/document does not exist in firestore!");
      }
    },
    (error) => {
      console.error("Error subscribing to user in firestore:", error);
    }
  );

  state.userDatabaseSubscription = subscription;
}

async function updateBikePartInformationInDatabase(state) {
  const userDocRef = doc(db, "users", state.user.email);
  try {
    //the merge:true option ensures that only the bike field is updated,
    await setDoc(
      userDocRef,
      {
        bikes: state.bikes || [],
      },
      { merge: true }
    );
    console.log("User bike updated successfully for", state.user.email);
  } catch (e) {
    console.error("Error updating bike component: ", e);
  }
}

async function updateUserSettingsInDatabase(state) {
  const userDocRef = doc(db, "users", state.user.email);
  try {
    //the merge:true option ensures that only the bike field is updated,
    await setDoc(
      userDocRef,
      {
        userSettings: {
          defaultComponentMileage:
            state.userSettings.defaultComponentMileage || 1000,
          receiveHumidityNotifications:
            state.userSettings.receiveHumidityNotifications,
          receiveTheftNotifications:
            state.userSettings.receiveTheftNotifications,
          receiveTireSwitchNotifications:
            state.userSettings.receiveTireSwitchNotifications,
          userRegisteredDevices: state.userSettings.userRegisteredDevices || [],
          userActiveDevice:
            state.userSettings.userActiveDevice || "No active device",
        },
      },
      { merge: true }
    );
    console.log(
      "User settings updated successfully in database for: ",
      state.user.email
    );
  } catch (e) {
    console.error("Error updating user settings in firestore: ", e);
  }
}

async function updateUserDevicesInDatabase(state, name) {
  const userDocRef = doc(db, "users", state.user.email);
  try {
    //the merge:true option ensures that only the bike field is updated,
    await setDoc(
      userDocRef,
      {
        userSettings: {
          defaultComponentMileage:
            state.userSettings.defaultComponentMileage || 1000,
          receiveHumidityNotifications:
            state.userSettings.receiveHumidityNotifications,
          receiveTheftNotifications:
            state.userSettings.receiveTheftNotifications,
          receiveTireSwitchNotifications:
            state.userSettings.receiveTireSwitchNotifications,
          userRegisteredDevices:
            [...state.userSettings.userRegisteredDevices, name] || [],
          userActiveDevice:
            state.userSettings.userActiveDevice || "No active device",
        },
      },
      { merge: true }
    );
    console.log(
      "User settings updated successfully in database for: ",
      state.user.email
    );
  } catch (e) {
    console.error("Error updating user settings in firestore: ", e);
  }
}

async function updateUserRoutesAndDistanceInDB(state){
  const userDocRef = doc(db, "users", state.user.email);
  const deviceDocRef = doc(db, "devices", state.userSettings.userActiveDevice);
  try {
    //first update the values in user
    await setDoc(
      userDocRef,
      {
        totalDistanceTravelled: state.totalDistanceTravelled,
        cachedRoutes: state.cachedRoutes,
      },
      { merge: true }
    );
    console.log(
      "User settings updated successfully in database for: ",
      state.user.email
    );
    //then remove the coordinates from device
    await setDoc(
      deviceDocRef,
      {
        coordinates: [],
        startTime: "00:00", //just set to default times
        endTime: "00:00",
      },
      { merge: true }
    );
    console.log(
      "Device coordinates properly cleared after fetching and processing, for device: ",
      state.userSettings.userActiveDevice
    );


  } catch (e) {
    console.error("Error updating user settings in firestore: ", e);
  }
}

async function manualFetchLatestRoute(state){
  const deviceDocRef = doc(db, "devices", state.userSettings.userActiveDevice);
  try {
    const docSnap = await getDoc(deviceDocRef);

    if (docSnap.exists()) {
      const deviceData = docSnap.data(); // This is your device document's data
      console.log("Device document data:", deviceData);
      //converts GNSS data to objects of type {lat: ..., lng: ....}
      const convertedCoordinates = convertCoordinates(deviceData.coordinates);
      //then process the coordinates to a distance covered
      const distanceCovered = processCoordinates(convertedCoordinates);
      //do not proceed if recursive call
      if(distanceCovered !== 0){
          //register new travel distance
          console.log("CHANGE OF TOTAL DISTANCE HERE: FROM ", state.totalDistanceTravelled , " TO: ", state.totalDistanceTravelled + distanceCovered);
          state.totalDistanceTravelled += distanceCovered;
          //register new route
          if (state.cachedRoutes.length >= 10) {
            state.cachedRoutes.shift();//remove oldest item if we already have 10 routes
          }
          state.cachedRoutes.push({coords: convertedCoordinates, distance: distanceCovered, startTime: deviceData.startTime || "00:00", endTime: deviceData.endTime || "00:00", date: deviceData.date ||"1995-09-28"});//add the new route
          updateUserRoutesAndDistanceInDB(state);
      }
    } else {
      console.warn("No such device document exists, when manually fetching latest route: ", state.userSettings.userActiveDevice);
      return null;
    }
  } catch (e) {
    console.error("Error fetching device document:", e);
    return null;
  }
}

async function switchParking(state, newValue){
  const deviceDocRef = doc(db, "devices", state.userSettings.userActiveDevice);
  try {
    const docSnap = await getDoc(deviceDocRef);

    if (docSnap.exists()) {
      const deviceData = docSnap.data(); // This is your device document's data
      console.log("Device document data:", deviceData);
      if(deviceData.parked !== newValue){
        const currentTime = new Date();
        const hours = currentTime.getHours().toString().padStart(2, '0');  // Get hours and pad with leading zero if needed
        const minutes = currentTime.getMinutes().toString().padStart(2, '0');  // Get minutes and pad with leading zero if needed
        const formattedTime = `${hours}:${minutes}`;  // Format as HH:mm
        if(newValue=="Moving"){
          await setDoc(
            deviceDocRef,
            {
              parked: false,
              startTime: formattedTime, //just set to current time
            },
            { merge: true }
          );
        }else if(newValue =="Parked"){
          await setDoc(
            deviceDocRef,
            {
              parked: true,
              endTime: formattedTime, //just set to current time
            },
            { merge: true }
          );
          manualFetchLatestRoute(state);
        }

      }
    } else {
      console.warn("No such device document exists, when manually fetching latest route: ", state.userSettings.userActiveDevice);
      return null;
    }
  } catch (e) {
    console.error("Error fetching device document:", e);
    return null;
  }
}


//uses the haversine formula
function processCoordinates(inputCoords) {
  //will take in a parameter listOfCoordinates in the future (aka dataRow)
  if(inputCoords.length==0 || inputCoords==null){
    console.log("When checking subscription to device GPS-data, found no new coordinates. Skipped adding total distance.")
    return 0;
  }
  const coords = inputCoords;
  if (!Array.isArray(coords) || coords.length < 2) return 0;

  const toRadians = (deg) => deg * (Math.PI / 180);
  const R = 6371e3; // Earth radius in meters

  let totalDistance = 0;

  for (let i = 0; i < coords.length - 1; i++) {
    const { lat: lat1, lng: lon1 } = coords[i];
    const { lat: lat2, lng: lon2 } = coords[i + 1];

    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    totalDistance += distance;
  }

  return totalDistance; // in meters
}

//process GNSS data from firestore row to object form {lat: ...., lng: ....}
function convertCoordinates(coords){
  return coords || null;
}

//Function for listening to the GPS device uploading data to its associated field.
async function subscribeToDeviceInDatabase(state) {
  if (state.userDeviceSubscription) {
    state.userDeviceSubscription(); //calling the subscription cancels it out!!!
    state.userDeviceSubscription = null; //clears the stored function
  }

  const deviceNameInDB = state.userSettings.userActiveDevice || "PROTOTYPE";
  console.log("checking if we can subscribe to...", deviceNameInDB);
  const deviceDocRef = doc(db, "devices", deviceNameInDB);
  //this sets up the Firestore listener
  const subscription = onSnapshot(
    deviceDocRef,
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        const rowData = docSnapshot.data(); //get the entry for the device
        console.log("SEE HERE: this is the data row for the device", rowData);
        // Ensure valid data
        if(rowData.parked == true){
          state.parked = "Parked";
          console.log("Set the user's parked state to: ", "Parked");
        }else if(rowData.parked == false){
          state.parked = "Moving";
          console.log("Set the user's parked state to: ", "Moving");
        }
        console.log("Finished fetching snapshot of GPS data in firestore.");
      } else {
        console.error("Row/document does not exist in firestore for GPS data!");
      }
    },
    (error) => {
      console.error("Error subscribing to user in firestore:", error);
    }
  );
  console.log(
    "Properly subscribed to GPS data relation associated with device:  ",
    deviceNameInDB
  );
  state.userDeviceSubscription = subscription; //we save the subscription as an object to the model so that we can unsubscribe if we want
}

export {
  auth,
  db,
  googleProvider,
  addUserToDatabase,
  subscribeToUserInDatabase,
  updateBikePartInformationInDatabase,
  updateUserSettingsInDatabase,
  subscribeToDeviceInDatabase,
  updateUserDevicesInDatabase,
  manualFetchLatestRoute,
  switchParking
};