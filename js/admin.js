// Impor fungsi yang diperlukan dari Firebase
import { db, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, query, orderBy, getDocs } from './firebase-init.js';

document.addEventListener('DOMContentLoaded', () => {
    // Memeriksa apakah admin sudah login
    if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = '/admin/index.html'; // Jika belum, alihkan ke halaman login
        return;
    }

    // Mengambil semua elemen yang diperlukan dari halaman HTML
    const logoutBtn = document.getElementById('logout-btn');
    const tabProducts = document.getElementById('tab-products');
    const tabReports = document.getElementById('tab-reports');
    const contentProducts = document.getElementById('content-products');
    const contentReports = document.getElementById('content-reports');

    // Elemen untuk form manajemen produk
    const productListAdminEl = document.getElementById('product-list-admin');
    const productForm = document.getElementById('product-form');
    const formTitle = document.getElementById('form-title');
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productCategoryInput = document.getElementById('product-category');
    const productPriceInput = document.getElementById('product-price');
    const productImageInput = document.getElementById('product-image');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    // Elemen untuk laporan penjualan
    const reportTotalTransactions = document.getElementById('report-total-transactions');
    const reportTotalRevenue = document.getElementById('report-total-revenue');
    const reportBestSeller = document.getElementById('report-best-seller');

    // --- LOGIKA UTAMA & NAVIGASI TAB ---

    // Fungsi untuk logout
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        window.location.href = '/admin/index.html';
    });

    // Fungsi untuk berpindah antar tab
    const switchTab = (activeTab) => {
        const tabs = {
            products: { btn: tabProducts, content: contentProducts },
            reports: { btn: tabReports, content: contentReports }
        };

        for (const key in tabs) {
            const tab = tabs[key];
            if (tab.btn === activeTab) {
                tab.btn.classList.add('text-indigo-400', 'border-indigo-400');
                tab.btn.classList.remove('text-gray-400', 'hover:text-white');
                tab.content.classList.remove('hidden');
            } else {
                tab.btn.classList.remove('text-indigo-400', 'border-indigo-400');
                tab.btn.classList.add('text-gray-400', 'hover:text-white');
                tab.content.classList.add('hidden');
            }
        }
    };

    tabProducts.addEventListener('click', () => switchTab(tabProducts));
    tabReports.addEventListener('click', () => {
        switchTab(tabReports);
        generateReports(); // Panggil fungsi laporan saat tab diklik
    });

    // --- LOGIKA MANAJEMEN PRODUK ---

    const productsCollectionRef = collection(db, 'products');

    // Fungsi untuk membersihkan form setelah submit
    const resetForm = () => {
        productForm.reset();
        productIdInput.value = '';
        formTitle.textContent = 'Tambah Produk Baru';
        saveBtn.textContent = 'Simpan';
        cancelBtn.classList.add('hidden');
    };

    // Fungsi untuk menampilkan daftar produk
    const renderProductList = (products) => {
        productListAdminEl.innerHTML = '';
        if (products.length === 0) {
            productListAdminEl.innerHTML = '<p class="text-gray-400 text-center">Belum ada produk. Silakan tambahkan produk baru.</p>';
            return;
        }
        products.forEach(product => {
            const item = `
                <div class="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                    <div>
                        <p class="font-semibold">${product.data.name} <span class="text-xs text-gray-400">(${product.data.category})</span></p>
                        <p class="text-sm text-indigo-400">${formatRupiah(product.data.price)}</p>
                    </div>
                    <div class="space-x-2">
                        <button class="edit-btn text-yellow-400 hover:text-yellow-300" data-id="${product.id}">Edit</button>
                        <button class="delete-btn text-red-500 hover:text-red-400" data-id="${product.id}">Hapus</button>
                    </div>
                </div>
            `;
            productListAdminEl.innerHTML += item;
        });
    };
    
    // Mendengarkan perubahan pada koleksi produk secara real-time
    const qProducts = query(productsCollectionRef, orderBy("name"));
    onSnapshot(qProducts, (snapshot) => {
        const products = snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
        renderProductList(products);
    });

    // Event listener untuk form submit (tambah/update produk)
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = productIdInput.value;
        const productData = {
            name: productNameInput.value,
            category: productCategoryInput.value,
            price: Number(productPriceInput.value),
            image: productImageInput.value,
        };

        try {
            if (id) { // Jika ada ID, berarti update
                const productRef = doc(db, 'products', id);
                await updateDoc(productRef, productData);
            } else { // Jika tidak ada ID, berarti tambah baru
                await addDoc(productsCollectionRef, productData);
            }
            resetForm();
        } catch (error) {
            console.error("Error saving product: ", error);
            alert("Gagal menyimpan produk!");
        }
    });

    // Event listener untuk tombol edit dan hapus
    productListAdminEl.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (target.classList.contains('edit-btn')) {
            const productRef = doc(db, 'products', id);
            onSnapshot(productRef, (doc) => {
                const data = doc.data();
                productIdInput.value = doc.id;
                productNameInput.value = data.name;
                productCategoryInput.value = data.category;
                productPriceInput.value = data.price;
                productImageInput.value = data.image;
                
                formTitle.textContent = 'Edit Produk';
                saveBtn.textContent = 'Update';
                cancelBtn.classList.remove('hidden');
            });
        }

        if (target.classList.contains('delete-btn')) {
            if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
                deleteDoc(doc(db, 'products', id));
            }
        }
    });

    cancelBtn.addEventListener('click', resetForm);

    // --- LOGIKA LAPORAN PENJUALAN (VERSI DIPERBAIKI) ---

    const generateReports = async () => {
        try {
            const ordersCollectionRef = collection(db, 'orders');
            const snapshot = await getDocs(ordersCollectionRef);
            
            // Ambil semua pesanan, lalu saring yang sudah "Selesai" di browser
            const allOrders = snapshot.docs.map(doc => doc.data());
            const finishedOrders = allOrders.filter(order => order.status === "Selesai");

            // Kalkulasi dasar
            const totalTransactions = finishedOrders.length;
            const totalRevenue = finishedOrders.reduce((sum, order) => sum + order.total, 0);

            reportTotalTransactions.textContent = totalTransactions;
            reportTotalRevenue.textContent = formatRupiah(totalRevenue);

            // Kalkulasi produk terlaris
            const itemCounts = {};
            finishedOrders.forEach(order => {
                order.items.forEach(item => {
                    itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
                });
            });

            let bestSeller = '-';
            let maxCount = 0;
            for (const itemName in itemCounts) {
                if (itemCounts[itemName] > maxCount) {
                    maxCount = itemCounts[itemName];
                    bestSeller = itemName;
                }
            }
            reportBestSeller.textContent = bestSeller;
        } catch (error) {
            console.error("Error generating reports: ", error);
            alert("Gagal membuat laporan!");
        }
    };
});
