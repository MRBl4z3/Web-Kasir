import { db, collection, addDoc, getDocs, query, orderBy } from './firebase-init.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DEKLARASI ELEMEN ---
    const productListEl = document.getElementById('product-list');
    const categoryTabsEl = document.getElementById('category-tabs');
    const tableInfoEl = document.getElementById('table-info');
    // Elemen Keranjang
    const cartItemsEl = document.getElementById('cart-items');
    const emptyCartMessageEl = document.getElementById('empty-cart-message');
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkout-btn');
    // Elemen Modal
    const successModal = document.getElementById('success-modal');
    const closeSuccessModalBtn = document.getElementById('close-success-modal-btn');

    // --- STATE APLIKASI ---
    let allProducts = [];
    let currentCategory = '';
    let cart = [];
    let tableNumber = 'N/A';

    // --- FUNGSI-FUNGSI ---

    // Mengambil produk dari Firestore
    const fetchProducts = async () => {
        productListEl.innerHTML = '<p class="text-center text-gray-400 col-span-full">Memuat menu...</p>';
        try {
            const productsCollection = collection(db, 'products');
            const q = query(productsCollection, orderBy("category"), orderBy("name"));
            const snapshot = await getDocs(q);
            
            allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            renderCategories();
            renderProducts();
        } catch (error) {
            console.error("Error fetching products: ", error);
            productListEl.innerHTML = '<p class="text-center text-red-500 col-span-full">Gagal memuat menu.</p>';
        }
    };

    // Menampilkan kategori sebagai tab
    const renderCategories = () => {
        const categories = [...new Set(allProducts.map(p => p.category))];
        if (categories.length > 0 && !currentCategory) {
            currentCategory = categories[0];
        }
        categoryTabsEl.innerHTML = '';
        categories.forEach(category => {
            const isActive = category === currentCategory;
            const tabClass = isActive 
                ? 'text-[#6C5ECF] border-b-2 border-[#6C5ECF] font-semibold' 
                : 'text-gray-400 hover:text-white';
            const tab = `<button class="py-2 px-1 transition-colors ${tabClass}" data-category="${category}">${category}</button>`;
            categoryTabsEl.innerHTML += tab;
        });
    };

    // Menampilkan produk berdasarkan kategori yang aktif
    const renderProducts = () => {
        productListEl.innerHTML = '';
        const filteredProducts = allProducts.filter(p => p.category === currentCategory);
        
        filteredProducts.forEach(product => {
            const card = `
                <div class="bg-[#252836] rounded-lg p-4 flex flex-col items-center text-center cursor-pointer hover:ring-2 ring-[#6C5ECF] transition-all" data-id="${product.id}">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-32 object-cover rounded-md mb-4">
                    <h3 class="font-semibold flex-grow">${product.name}</h3>
                    <p class="text-gray-400 mt-2">${formatRupiah(product.price)}</p>
                </div>
            `;
            productListEl.innerHTML += card;
        });
    };

    // Menampilkan item di dalam keranjang
    const renderCart = () => {
        cartItemsEl.innerHTML = '';
        if (cart.length === 0) {
            emptyCartMessageEl.classList.remove('hidden');
        } else {
            emptyCartMessageEl.classList.add('hidden');
            cart.forEach(item => {
                const cartItemHTML = `
                    <div class="flex items-center gap-4">
                        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md">
                        <div class="flex-1">
                            <p class="font-semibold text-sm">${item.name}</p>
                            <p class="text-gray-400 text-xs">${formatRupiah(item.price)}</p>
                        </div>
                        <div class="flex items-center gap-3 bg-[#1F1D2B] rounded-md p-1">
                            <button class="quantity-change w-6 h-6 font-bold" data-id="${item.id}" data-change="-1">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-change w-6 h-6 font-bold" data-id="${item.id}" data-change="1">+</button>
                        </div>
                        <p class="w-24 text-right font-medium">${formatRupiah(item.price * item.quantity)}</p>
                    </div>
                `;
                cartItemsEl.innerHTML += cartItemHTML;
            });
        }
        updateCartSummary();
    };

    // Mengupdate total, pajak, dan subtotal
    const updateCartSummary = () => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.10;
        const total = subtotal + tax;

        subtotalEl.textContent = formatRupiah(subtotal);
        taxEl.textContent = formatRupiah(tax);
        totalEl.textContent = formatRupiah(total);
        checkoutBtn.disabled = cart.length === 0;
    };

    // Fungsi untuk menambah, mengurangi, atau menghapus item
    const updateQuantity = (productId, change) => {
        const cartItem = cart.find(item => item.id === productId);
        if (!cartItem) return;

        cartItem.quantity += change;
        if (cartItem.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
        renderCart();
    };

    // Fungsi untuk menambahkan produk ke keranjang saat diklik
    const addToCart = (productId) => {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        renderCart();
    };

    // --- INISIALISASI & EVENT LISTENERS ---

    // Mengambil nomor meja dari URL
    const getTableNumber = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const table = urlParams.get('table');
        if (table) {
            tableNumber = table;
            tableInfoEl.textContent = `Memesan untuk Meja #${tableNumber}`;
        } else {
            tableInfoEl.textContent = 'Nomor meja tidak valid!';
            tableInfoEl.classList.add('text-red-500');
        }
    };

    // Event listener untuk klik produk
    productListEl.addEventListener('click', (e) => {
        const card = e.target.closest('[data-id]');
        if (card) addToCart(card.dataset.id);
    });

    // Event listener untuk klik tab kategori
    categoryTabsEl.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            currentCategory = e.target.dataset.category;
            renderCategories();
            renderProducts();
        }
    });

    // Event listener untuk tombol +/- di keranjang
    cartItemsEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('quantity-change')) {
            const id = e.target.dataset.id;
            const change = parseInt(e.target.dataset.change);
            updateQuantity(id, change);
        }
    });

    // Fungsi submit order (tidak berubah)
    const submitOrder = async () => {
        if (cart.length === 0) return;
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
            renderCart();
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Gagal mengirim pesanan.");
        } finally {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Pesan Sekarang';
        }
    };
    
    checkoutBtn.addEventListener('click', submitOrder);
    closeSuccessModalBtn.addEventListener('click', () => successModal.classList.add('hidden'));

    // Inisialisasi halaman
    getTableNumber();
    fetchProducts();
    renderCart();
});
