// =================================================================
// KONFIGURASI FIREBASE
// =================================================================
// PENTING: Pastikan nilai ini sudah sesuai dengan konfigurasi Firebase Anda.
const firebaseConfig = {
  apiKey: "AIzaSyCMkqQj4MeRpV3dbopUmWS7xsQesW_jm_A",
  authDomain: "snc-coffee-shop.firebaseapp.com",
  projectId: "snc-coffee-shop",
  storageBucket: "snc-coffee-shop.firebasestorage.app",
  messagingSenderId: "653373485984",
  appId: "1:653373485984:web:817802b1fd47a1ab5e2ac5",
  measurementId: "G-T2YM55Z6NE"
};

  
  
  // =================================================================
  // FUNGSI BANTUAN
  // =================================================================
  // Fungsi untuk memformat angka menjadi format Rupiah
  const formatRupiah = (number) => {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };
  
  // NOTE: Daftar produk (array 'products') telah dihapus dari file ini
  // karena sekarang dikelola melalui Admin Panel dan disimpan di Firestore.
  
