const {db} = require('../configs/firebase/firebaseConfig')

async function seedData() {
  await db.collection("owners").doc("+84962442723").set({
    email: "baolpb5197@gmail.com",
    name: "Luu Bao Owner",
    phoneNumber: "+84962442723"
  });

  console.log("Sample data inserted!");
}

seedData();
