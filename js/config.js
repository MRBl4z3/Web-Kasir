// =================================================================
// KONFIGURASI FIREBASE
// =================================================================
// PENTING: Pastikan nilai ini sudah sesuai dengan konfigurasi Firebase Anda.
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "nama-proyek-anda.firebaseapp.com",
    projectId: "nama-proyek-anda",
    storageBucket: "nama-proyek-anda.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef1234567890"
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
  