// Impor fungsi yang diperlukan dari Firebase
import { db, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, query, orderBy, getDocs } from './firebase-init.js';

document.addEventListener('DOMContentLoaded', () => {
    // Cek status login
    if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = '/admin/index.html';
        return;
    }

    // --- DEKLARASI ELEMEN ---
    const logoutBtn = document.getElementById('logout-btn');
    const tabProducts = document.getElementById('tab-products');
    const tabReports = document.getElementById('tab-reports');
    const contentProducts = document.getElementById('content-products');
    const contentReports = document.getElementById('content-reports');
    // Elemen Manajemen Produk... (sama seperti sebelumnya)
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
    const reportTitle = document.getElementById('report-title');
    const reportTotalTransactions = document.getElementById('report-total-transactions');
    const reportTotalRevenue = document.getElementById('report-total-revenue');
    const reportBestSeller = document.getElementById('report-best-seller');
    const printReportBtn = document.getElementById('print-report-btn');
    const downloadCsvBtn = document.getElementById('download-csv-btn');
    const reportTableContainer = document.getElementById('report-table-container');
    const printableReportEl = document.getElementById('printable-report');

    let monthlyReportData = []; // Variabel untuk menyimpan data laporan bulan ini

    // --- LOGIKA UTAMA & NAVIGASI TAB ---
    // ... (Fungsi logout dan switchTab sama seperti sebelumnya) ...
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        window.location.href = '/admin/index.html';
    });
    const switchTab = (activeTab) => {
        const tabs = { products: { btn: tabProducts, content: contentProducts }, reports: { btn: tabReports, content: contentReports } };
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
        generateReports();
    });

    // --- LOGIKA MANAJEMEN PRODUK ---
    // ... (Semua fungsi manajemen produk sama seperti sebelumnya) ...
    const productsCollectionRef = collection(db, 'products');
    const resetForm = () => { productForm.reset(); productIdInput.value = ''; formTitle.textContent = 'Tambah Produk Baru'; saveBtn.textContent = 'Simpan'; cancelBtn.classList.add('hidden'); };
    const renderProductList = (products) => {
        productListAdminEl.innerHTML = '';
        if (products.length === 0) { productListAdminEl.innerHTML = '<p class="text-gray-400 text-center">Belum ada produk.</p>'; return; }
        products.forEach(product => {
            const item = `<div class="flex items-center justify-between bg-gray-700 p-3 rounded-md"><div><p class="font-semibold">${product.data.name} <span class="text-xs text-gray-400">(${product.data.category})</span></p><p class="text-sm text-indigo-400">${formatRupiah(product.data.price)}</p></div><div class="space-x-2"><button class="edit-btn text-yellow-400 hover:text-yellow-300" data-id="${product.id}">Edit</button><button class="delete-btn text-red-500 hover:text-red-400" data-id="${product.id}">Hapus</button></div></div>`;
            productListAdminEl.innerHTML += item;
        });
    };
    const qProducts = query(productsCollectionRef, orderBy("name"));
    onSnapshot(qProducts, (snapshot) => { renderProductList(snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))); });
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = productIdInput.value;
        const productData = { name: productNameInput.value, category: productCategoryInput.value, price: Number(productPriceInput.value), image: productImageInput.value };
        try {
            if (id) { await updateDoc(doc(db, 'products', id), productData); } else { await addDoc(productsCollectionRef, productData); }
            resetForm();
        } catch (error) { console.error("Error saving product: ", error); alert("Gagal menyimpan produk!"); }
    });
    productListAdminEl.addEventListener('click', (e) => {
        const target = e.target; const id = target.dataset.id;
        if (target.classList.contains('edit-btn')) {
            onSnapshot(doc(db, 'products', id), (doc) => {
                const data = doc.data(); productIdInput.value = doc.id; productNameInput.value = data.name; productCategoryInput.value = data.category; productPriceInput.value = data.price; productImageInput.value = data.image;
                formTitle.textContent = 'Edit Produk'; saveBtn.textContent = 'Update'; cancelBtn.classList.remove('hidden');
            });
        }
        if (target.classList.contains('delete-btn')) { if (confirm('Yakin ingin hapus?')) { deleteDoc(doc(db, 'products', id)); } }
    });
    cancelBtn.addEventListener('click', resetForm);

    // --- LOGIKA LAPORAN PENJUALAN (VERSI BARU) ---

    const generateReports = async () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        reportTitle.textContent = `Laporan Penjualan - ${monthNames[currentMonth]} ${currentYear}`;

        try {
            const ordersCollectionRef = collection(db, 'orders');
            const snapshot = await getDocs(ordersCollectionRef);
            
            const allOrders = snapshot.docs.map(doc => doc.data());
            
            // Filter pesanan hanya untuk bulan dan tahun ini, dan yang statusnya "Selesai"
            monthlyReportData = allOrders.filter(order => {
                const orderDate = order.timestamp.toDate(); // Konversi timestamp Firebase ke objek Date JS
                return order.status === "Selesai" &&
                       orderDate.getMonth() === currentMonth &&
                       orderDate.getFullYear() === currentYear;
            });

            // Update ringkasan
            const totalTransactions = monthlyReportData.length;
            const totalRevenue = monthlyReportData.reduce((sum, order) => sum + order.total, 0);
            reportTotalTransactions.textContent = totalTransactions;
            reportTotalRevenue.textContent = formatRupiah(totalRevenue);

            // Kalkulasi produk terlaris
            const itemCounts = {};
            monthlyReportData.forEach(order => {
                order.items.forEach(item => {
                    itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
                });
            });
            let bestSeller = '-';
            let maxCount = 0;
            for (const itemName in itemCounts) {
                if (itemCounts[itemName] > maxCount) { maxCount = itemCounts[itemName]; bestSeller = itemName; }
            }
            reportBestSeller.textContent = bestSeller;

            // Tampilkan detail transaksi dalam tabel
            renderReportTable(monthlyReportData);

            // Aktifkan/Nonaktifkan tombol
            if (monthlyReportData.length > 0) {
                printReportBtn.disabled = false;
                downloadCsvBtn.disabled = false;
            } else {
                printReportBtn.disabled = true;
                downloadCsvBtn.disabled = true;
            }

        } catch (error) {
            console.error("Error generating reports: ", error);
            alert("Gagal membuat laporan!");
        }
    };

    const renderReportTable = (data) => {
        if (data.length === 0) {
            reportTableContainer.innerHTML = '<p class="text-gray-400 text-center">Tidak ada transaksi untuk bulan ini.</p>';
            return;
        }

        let tableHTML = `
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-700">
                    <tr>
                        <th class="p-3">Tanggal</th>
                        <th class="p-3">Meja</th>
                        <th class="p-3">Item</th>
                        <th class="p-3 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(order => {
            tableHTML += `
                <tr class="border-b border-gray-700">
                    <td class="p-3">${order.timestamp.toDate().toLocaleDateString('id-ID')}</td>
                    <td class="p-3">${order.tableNumber}</td>
                    <td class="p-3">${order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}</td>
                    <td class="p-3 text-right">${formatRupiah(order.total)}</td>
                </tr>
            `;
        });
        tableHTML += '</tbody></table>';
        reportTableContainer.innerHTML = tableHTML;
    };
    
    // Fungsi untuk mencetak laporan ke PDF
    const printReport = () => {
        const now = new Date();
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        let printableHTML = `
            <div style="font-family: Arial, sans-serif; margin: 20px;">
                <h1 style="text-align: center;">Laporan Penjualan SNC Coffee Shop</h1>
                <h2 style="text-align: center; font-weight: normal;">${monthNames[now.getMonth()]} ${now.getFullYear()}</h2>
                <hr style="margin: 20px 0;">
                <h3>Ringkasan</h3>
                <p>Total Transaksi: ${reportTotalTransactions.textContent}</p>
                <p>Total Pendapatan: ${reportTotalRevenue.textContent}</p>
                <p>Produk Terlaris: ${reportBestSeller.textContent}</p>
                <hr style="margin: 20px 0;">
                <h3>Detail Transaksi</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="background-color: #f2f2f2;">
                        <tr>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Tanggal</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Item</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        monthlyReportData.forEach(order => {
            printableHTML += `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${order.timestamp.toDate().toLocaleDateString('id-ID')}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatRupiah(order.total)}</td>
                </tr>
            `;
        });
        printableHTML += '</tbody></table></div>';
        printableReportEl.innerHTML = printableHTML;
        window.print();
    };

    // Fungsi untuk mengunduh laporan sebagai file .csv (Excel)
    const downloadCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Tanggal,Meja,Item,Kuantitas,Harga Satuan,Total Item\n"; // Header CSV

        monthlyReportData.forEach(order => {
            const date = order.timestamp.toDate().toLocaleDateString('id-ID');
            order.items.forEach(item => {
                const row = [date, order.tableNumber, `"${item.name}"`, item.quantity, item.price, item.price * item.quantity].join(",");
                csvContent += row + "\n";
            });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const now = new Date();
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        link.setAttribute("download", `Laporan-SNC-${monthNames[now.getMonth()]}-${now.getFullYear()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    printReportBtn.addEventListener('click', printReport);
    downloadCsvBtn.addEventListener('click', downloadCSV);

});
