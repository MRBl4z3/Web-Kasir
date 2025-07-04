// Impor fungsi yang diperlukan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, getDocs, where } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Variabel global untuk database
let db;

try {
  // Inisialisasi Firebase menggunakan konfigurasi dari config.js
  // 'firebaseConfig' diambil dari file /js/config.js yang dimuat lebih dulu
  const app = initializeApp(firebaseConfig);
  
  // Inisialisasi Cloud Firestore dan dapatkan referensi ke layanan
  db = getFirestore(app);
  console.log("Firebase berhasil diinisialisasi.");

} catch (e) {
  console.error("Error initializing Firebase: ", e);
  // Pesan ini akan muncul jika config.js salah atau tidak dimuat
  alert("Gagal menginisialisasi database. Pastikan konfigurasi Firebase di js/config.js sudah benar.");
}

// Ekspor fungsi dan variabel yang diperlukan oleh skrip lain (admin.js, order.js, dll)
export { db, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, getDocs, where };
