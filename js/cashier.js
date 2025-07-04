import { db, collection, onSnapshot, doc, updateDoc, query, orderBy } from './firebase-init.js';

document.addEventListener('DOMContentLoaded', () => {
    const incomingOrdersEl = document.getElementById('incoming-orders');
    const noOrdersMsg = document.getElementById('no-orders-msg');
    const orderDetailsContentEl = document.getElementById('order-details-content');
    const orderDetailsFooterEl = document.getElementById('order-details-footer');
    
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    const processPaymentBtn = document.getElementById('process-payment-btn');
    const cancelOrderBtn = document.getElementById('cancel-order-btn');
    
    let allOrders = [];
    let selectedOrderId = null;

    // Fungsi untuk merender daftar pesanan masuk
    const renderOrderList = (orders) => {
        incomingOrdersEl.innerHTML = '';
        const pendingOrders = orders.filter(o => o.data.status === 'Menunggu Pembayaran');

        if (pendingOrders.length === 0) {
            noOrdersMsg.classList.remove('hidden');
        } else {
            noOrdersMsg.classList.add('hidden');
            pendingOrders.forEach(order => {
                const orderData = order.data;
                const orderId = order.id;
                const card = `
                    <div class="bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors" data-id="${orderId}">
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-lg">Meja #${orderData.tableNumber}</span>
                            <span class="text-indigo-400 font-semibold">${formatRupiah(orderData.total)}</span>
                        </div>
                        <p class="text-sm text-gray-400">${orderData.items.length} item</p>
                    </div>
                `;
                incomingOrdersEl.innerHTML += card;
            });
        }
    };

    // Fungsi untuk menampilkan detail pesanan yang dipilih
    const renderOrderDetails = (orderId) => {
        selectedOrderId = orderId;
        const order = allOrders.find(o => o.id === orderId);
        if (!order) {
            orderDetailsContentEl.innerHTML = '<p class="text-gray-400 text-center mt-10">Pesanan tidak ditemukan.</p>';
            orderDetailsFooterEl.classList.add('hidden');
            return;
        }

        const orderData = order.data;
        let itemsHtml = '<div class="space-y-3 pr-2 overflow-y-auto" style="max-height: calc(100vh - 400px);">';
        orderData.items.forEach(item => {
            itemsHtml += `
                <div class="flex items-center gap-3">
                    <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded-md">
                    <div class="flex-1">
                        <p class="font-semibold text-sm">${item.name}</p>
                        <p class="text-gray-400 text-xs">${item.quantity} x ${formatRupiah(item.price)}</p>
                    </div>
                    <p class="font-medium">${formatRupiah(item.price * item.quantity)}</p>
                </div>
            `;
        });
        itemsHtml += '</div>';
        
        orderDetailsContentEl.innerHTML = itemsHtml;
        
        const subtotal = orderData.total;
        const tax = subtotal * 0.10; // Asumsi pajak 10% dari subtotal (jika total di pelanggan belum termasuk pajak)
        const total = subtotal + tax;
        
        subtotalEl.textContent = formatRupiah(subtotal);
        taxEl.textContent = formatRupiah(tax);
        totalEl.textContent = formatRupiah(total);
        
        orderDetailsFooterEl.classList.remove('hidden');
    };
    
    // Fungsi untuk mencetak struk
    const printReceipt = () => {
        const order = allOrders.find(o => o.id === selectedOrderId);
        if (!order) return;
        
        const orderData = order.data;
        const receiptContentEl = document.getElementById('receipt-content');
        const now = new Date();
        
        let itemsHtml = '';
        orderData.items.forEach(item => {
            itemsHtml += `
                <div style="display: flex; justify-content: space-between;">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>${formatRupiah(item.price * item.quantity)}</span>
                </div>
            `;
        });
        
        const subtotal = orderData.total;
        const tax = subtotal * 0.10;
        const total = subtotal + tax;

        receiptContentEl.innerHTML = `
            <h3 style="text-align: center; font-size: 1.2em; margin-bottom: 10px;">SNC Coffee Shop</h3>
            <p style="text-align: center; font-size: 0.8em; margin-bottom: 15px;">
                Meja: ${orderData.tableNumber}<br>
                Tgl: ${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')}
            </p>
            <hr style="border-top: 1px dashed black; margin: 10px 0;">
            ${itemsHtml}
            <hr style="border-top: 1px dashed black; margin: 10px 0;">
            <div style="display: flex; justify-content: space-between;"><strong>Subtotal</strong> <strong>${formatRupiah(subtotal)}</strong></div>
            <div style="display: flex; justify-content: space-between;"><strong>Pajak (10%)</strong> <strong>${formatRupiah(tax)}</strong></div>
            <div style="display: flex; justify-content: space-between; font-size: 1.1em;"><strong>TOTAL</strong> <strong>${formatRupiah(total)}</strong></div>
            <hr style="border-top: 1px dashed black; margin: 10px 0;">
            <p style="text-align: center; margin-top: 20px;">Terima Kasih!</p>
        `;
        
        window.print();
    };

    // Fungsi untuk memproses pembayaran
    const processPayment = async () => {
        if (!selectedOrderId) return;
        
        const orderRef = doc(db, "orders", selectedOrderId);
        try {
            await updateDoc(orderRef, {
                status: "Selesai"
            });
            printReceipt();
            // Tampilan akan update otomatis karena onSnapshot
            orderDetailsContentEl.innerHTML = '<p class="text-gray-400 text-center mt-10">Pilih pesanan di sebelah kiri untuk melihat detail.</p>';
            orderDetailsFooterEl.classList.add('hidden');
        } catch (e) {
            console.error("Error updating document: ", e);
            alert("Gagal memproses pembayaran.");
        }
    };

    // Event Listeners
    incomingOrdersEl.addEventListener('click', (e) => {
        const card = e.target.closest('[data-id]');
        if (card) {
            renderOrderDetails(card.dataset.id);
        }
    });
    
    processPaymentBtn.addEventListener('click', processPayment);

    // Setup listener real-time ke Firestore
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    onSnapshot(q, (querySnapshot) => {
        allOrders = [];
        querySnapshot.forEach((doc) => {
            allOrders.push({ id: doc.id, data: doc.data() });
        });
        renderOrderList(allOrders);
    });
});
