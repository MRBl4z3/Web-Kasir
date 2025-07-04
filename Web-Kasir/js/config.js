// =================================================================
// KONFIGURASI FIREBASE
// =================================================================
// PENTING: Ganti nilai di bawah ini dengan konfigurasi Firebase Anda sendiri
// Anda bisa mendapatkannya dari Firebase Console -> Project Settings.
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
  // DAFTAR PRODUK
  // =================================================================
  // Ini adalah satu-satunya tempat Anda perlu mengubah menu.
  const products = [
      { id: 1, name: 'Espresso', category: 'Kopi', price: 15000, image: 'https://placehold.co/200x200/6366f1/ffffff?text=Espresso' },
      { id: 2, name: 'Latte', category: 'Kopi', price: 22000, image: 'https://placehold.co/200x200/6366f1/ffffff?text=Latte' },
      { id: 3, name: 'Cappuccino', category: 'Kopi', price: 22000, image: 'https://placehold.co/200x200/6366f1/ffffff?text=Cappuccino' },
      { id: 4, name: 'Americano', category: 'Kopi', price: 18000, image: 'https://placehold.co/200x200/6366f1/ffffff?text=Americano' },
      { id: 5, name: 'Manual Brew', category: 'Kopi', price: 25000, image: 'https://placehold.co/200x200/6366f1/ffffff?text=V60' },
  
      { id: 6, name: 'Green Tea', category: 'Non-Kopi', price: 20000, image: 'https://placehold.co/200x200/10b981/ffffff?text=Green+Tea' },
      { id: 7, name: 'Chocolate', category: 'Non-Kopi', price: 23000, image: 'https://placehold.co/200x200/10b981/ffffff?text=Chocolate' },
      { id: 8, name: 'Red Velvet', category: 'Non-Kopi', price: 23000, image: 'https://placehold.co/200x200/10b981/ffffff?text=Red+Velvet' },
      
      { id: 9, name: 'Croissant', category: 'Makanan', price: 18000, image: 'https://placehold.co/200x200/f59e0b/ffffff?text=Croissant' },
      { id: 10, name: 'Donat', category: 'Makanan', price: 10000, image: 'https://placehold.co/200x200/f59e0b/ffffff?text=Donat' },
      { id: 11, name: 'Kentang Goreng', category: 'Makanan', price: 15000, image: 'https://placehold.co/200x200/f59e0b/ffffff?text=Fries' },
  ];
  
  // Fungsi untuk memformat angka menjadi format Rupiah
  const formatRupiah = (number) => {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };
