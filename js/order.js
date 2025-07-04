// Impor fungsi yang diperlukan dari Firebase, termasuk getDocs dan query
import { db, collection, addDoc, getDocs, query, orderBy } from './firebase-init.js';

document.addEventListener('DOMContentLoaded', () => {
    // Elemen-elemen dari halaman HTML
    const productListEl = document.getElementById('product-list');
    const tableInfoEl = document.getElementById('table-info');
    const cartContainerEl = document.getElementById('cart-container');
    const cartItemCountEl = document.getElementById('cart-item-count');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const successModal = document.getElementById('success-modal');
    const closeSuccessModalBtn = document.getElementById('close-success-modal-btn');

    // State (data) untuk halaman ini
    let allProducts = []; // Variabel untuk menyimpan produk dari Firestore
    let cart = [];
    let tableNumber = 'N/A';

    // Fungsi untuk mengambil data produk dari Firestore
    const fetchProducts = async () => {
        const productsCollection = collection(db, 'products');
        const q = query(productsCollection, orderBy("name"));
        const snapshot = await getDocs(q);
        
        allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Setelah produk berhasil diambil, tampilkan ke halaman
        renderProducts();
    };

    // Fungsi untuk mendapatkan nomor meja dari parameter URL
    const getTableNumber = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const table = urlParams.get('table');
        if (table) {
            tableNumber = table;
            tableInfoEl.textContent = `Memesan untuk Meja #${tableNumber}`;
        } else {
            tableInfoEl.textContent = 'Nomor meja tidak ditemukan!';
            tableInfoEl.classList.add('text-red-500');
        }
    };

    // Fungsi untuk menampilkan semua produk ke halaman
    const renderProducts = () => {
        productListEl.innerHTML = '';
        if (allProducts.length === 0) {
            productListEl.innerHTML = '<p class="text-center text-gray-500 col-span-full">Memuat menu...</p>';
            return;
        }
        allProducts.forEach(product => {
            const card = `
                <div class="bg-white rounded-lg shadow p-3 flex flex-col items-center cursor-pointer hover:shadow-xl transition-shadow" data-id="${product.id}">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-24 object-cover rounded-md mb-3">
                    <h3 class="font-semibold text-center text-sm text-gray-800">${product.name}</h3>
                    <p class="text-gray-500 text-xs">${formatRupiah(product.price)}</p>
                </div>
            `;
            productListEl.innerHTML += card;
        });
    };

    // Fungsi untuk memperbarui tampilan keranjang belanja
    const updateCartView = () => {
        if (cart.length > 0) {
            cartContainerEl.classList.remove('translate-y-full');
        } else {
            cartContainerEl.classList.add('translate-y-full');
        }

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        cartItemCountEl.textContent = totalItems;
        cartTotalEl.textContent = formatRupiah(totalPrice);
    };

    // Fungsi untuk menambahkan produk ke keranjang
    const addToCart = (productId) => {
        // Menggunakan 'allProducts' yang diambil dari Firestore
        const product = allProducts.find(p => p.id === productId);
        const itemInCart = cart.find(item => item.id === productId);

        if (itemInCart) {
            itemInCart.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartView();
    };

    // Fungsi untuk mengirim pesanan ke Firebase
    const submitOrder = async () => {
        // ... (Fungsi ini tidak perlu diubah)
        if (cart.length === 0) {
            alert("Keranjang Anda kosong.");
            return;
        }
        if (tableNumber === 'N/A') {
            alert("Nomor meja tidak valid. Mohon scan ulang QR code.");
            return;
        }

        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Mengirim...';

        const orderData = {
            tableNumber: tableNumber,
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'Menunggu Pembayaran',
            paymentMethod: 'Cash',
            timestamp: new Date()
        };

        try {
            await addDoc(collection(db, "orders"), orderData);
            successModal.classList.remove('hidden');
            cart = [];
            updateCartView();
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Gagal mengirim pesanan. Silakan coba lagi.");
        } finally {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Pesan Sekarang';
        }
    };
    
    // Event Listeners
    productListEl.addEventListener('click', (e) => {
        const card = e.target.closest('[data-id]');
        if (card) {
            addToCart(card.dataset.id);
        }
    });

    checkoutBtn.addEventListener('click', submitOrder);
    
    closeSuccessModalBtn.addEventListener('click', () => {
        successModal.classList.add('hidden');
    });

    // Menjalankan fungsi-fungsi ini saat halaman pertama kali dimuat
    getTableNumber();
    fetchProducts(); // Mengambil produk dari Firestore saat halaman dimuat
});
