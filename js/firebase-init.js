// Impor fungsi yang diperlukan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

let db;

try {
  // Inisialisasi Firebase menggunakan konfigurasi dari config.js
  const app = initializeApp(firebaseConfig);
  // Inisialisasi Cloud Firestore dan dapatkan referensi ke layanan
  db = getFirestore(app);
  console.log("Firebase berhasil diinisialisasi.");
} catch (e) {
  console.error("Error initializing Firebase: ", e);
  alert("Gagal menginisialisasi database. Pastikan konfigurasi Firebase di js/config.js sudah benar.");
}

// Ekspor fungsi dan variabel yang diperlukan oleh skrip lain
export { db, collection, addDoc, onSnapshot, doc, updateDoc, query, orderBy };
