// Impor fungsi dari Firebase, termasuk 'where' untuk query laporan
import { db, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, query, orderBy, getDocs, where } from './firebase-init.js';

document.addEventListener('DOMContentLoaded', () => {
    // Cek status login
    if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = '/admin/index.html';
        return;
    }

    // Elemen-elemen utama
    const logoutBtn = document.getElementById('logout-btn');
    const tabProducts = document.getElementById('tab-products');
    const tabReports = document.getElementById('tab-reports');
    const contentProducts = document.getElementById('content-products');
    const contentReports = document.getElementById('content-reports');

    // Elemen Manajemen Produk
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

    // Elemen Laporan
    const reportTotalTransactions = document.getElementById('report-total-transactions');
    const reportTotalRevenue = document.getElementById('report-total-revenue');
    const reportBestSeller = document.getElementById('report-best-seller');

    // --- LOGIKA UMUM ---

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        window.location.href = '/admin/index.html';
    });

    const switchTab = (activeTab) => {
        const tabs = [tabProducts, tabReports];
        const contents = [contentProducts, contentReports];

        tabs.forEach((tab, index) => {
            if (tab === activeTab) {
                tab.classList.add('text-indigo-400', 'border-indigo-400');
                tab.classList.remove('text-gray-400', 'hover:text-white', 'border-b-2');
                contents[index].classList.remove('hidden');
            } else {
                tab.classList.remove('text-indigo-400', 'border-indigo-400');
                tab.classList.add('text-gray-400', 'hover:text-white');
                contents[index].classList.add('hidden');
            }
        });
    };

    tabProducts.addEventListener('click', () => switchTab(tabProducts));
    tabReports.addEventListener('click', () => {
        switchTab(tabReports);
        generateReports();
    });

    // --- LOGIKA MANAJEMEN PRODUK ---

    const productsCollectionRef = collection(db, 'products');

    const resetForm = () => {
        productForm.reset();
        productIdInput.value = '';
        formTitle.textContent = 'Tambah Produk Baru';
        saveBtn.textContent = 'Simpan';
        cancelBtn.classList.add('hidden');
    };

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
    
    const qProducts = query(productsCollectionRef, orderBy("name"));
    onSnapshot(qProducts, (snapshot) => {
        const products = snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
        renderProductList(products);
    });

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
            if (id) {
                const productRef = doc(db, 'products', id);
                await updateDoc(productRef, productData);
            } else {
                await addDoc(productsCollectionRef, productData);
            }
            resetForm();
        } catch (error) {
            console.error("Error saving product: ", error);
            alert("Gagal menyimpan produk!");
        }
    });

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

    // --- LOGIKA LAPORAN PENJUALAN ---

    const generateReports = async () => {
        try {
            const ordersCollectionRef = collection(db, 'orders');
            // PERBAIKAN: Menggunakan 'where' yang sudah diimpor
            const qOrders = query(ordersCollectionRef, where("status", "==", "Selesai"));
            const snapshot = await getDocs(qOrders);
            
            const finishedOrders = snapshot.docs.map(doc => doc.data());

            const totalTransactions = finishedOrders.length;
            const totalRevenue = finishedOrders.reduce((sum, order) => sum + order.total, 0);

            reportTotalTransactions.textContent = totalTransactions;
            reportTotalRevenue.textContent = formatRupiah(totalRevenue);

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
            reportTotalTransactions.textContent = "Error";
            reportTotalRevenue.textContent = "Error";
            reportBestSeller.textContent = "Error";
        }
    };
});
