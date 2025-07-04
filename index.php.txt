<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Penawaran Jasa Pembuatan Sistem Kasir Online Lokal</title>
    
    <!-- Tailwind CSS for styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <style>
        /* Menggunakan font Inter sebagai default */
        body {
            font-family: 'Inter', sans-serif;
        }
        /* Style tambahan untuk gradien dan efek hover */
        .gradient-bg {
            background: linear-gradient(90deg, #1e3a8a, #3b82f6);
        }
        .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
    </style>
</head>
<body class="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 antialiased">

    <!-- Container Utama -->
    <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">

        <!-- Header / Judul Utama -->
        <header class="text-center mb-12">
            <h1 class="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400">
                Penawaran Sistem Kasir Online Lokal
            </h1>
            <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Solusi modern untuk digitalisasi pemesanan dan pembayaran di tempat Anda.
            </p>
        </header>

        <!-- Deskripsi Paket -->
        <section id="deskripsi" class="mb-12">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
                <h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Deskripsi Paket</h2>
                <p class="text-gray-600 dark:text-gray-300 mb-6">
                    Kami menyediakan pembuatan sistem kasir online berbasis jaringan lokal (offline) yang memungkinkan pelanggan melakukan pemesanan praktis melalui QR code dari meja masing-masing. Sistem ini dirancang untuk fleksibilitas dan efisiensi, mendukung berbagai metode pembayaran modern.
                </p>
                <h3 class="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Metode Pembayaran yang Didukung:</h3>
                <ul class="space-y-2 list-inside">
                    <?php
                        $payment_methods = [
                            "QRIS (e-wallet)" => "Menerima pembayaran digital dari semua e-wallet.",
                            "Cash di kasir" => "Opsi pembayaran tunai konvensional.",
                            "Transfer ke rekening biasa" => "Transfer manual ke rekening bank bisnis Anda.",
                            "Virtual Account (VA)" => "Pembayaran mudah dengan nomor VA unik."
                        ];

                        foreach ($payment_methods as $method => $description) {
                            echo '<li class="flex items-start">';
                            echo '<svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
                            echo '<span><span class="font-semibold">' . htmlspecialchars($method) . ':</span> ' . htmlspecialchars($description) . '</span>';
                            echo '</li>';
                        }
                    ?>
                </ul>
                <p class="mt-6 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 p-4 rounded-lg">
                    Pelanggan bebas memilih metode pembayaran saat checkout. Sistem akan menyesuaikan alur pembayaran dan status pesanan secara otomatis, termasuk cetak struk langsung ke printer kasir atau dapur.
                </p>
            </div>
        </section>

        <!-- Rincian Paket -->
        <section id="rincian" class="mb-12">
            <h2 class="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">Rincian Layanan</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <?php
                    $details = [
                        "Instalasi Server Lokal", "Desain Web Pemesanan (QR Menu)", "Backend & Database",
                        "Cetak Otomatis ke Printer LAN", "Admin Panel Kasir & Dapur", "Integrasi Pembayaran Ganda (QRIS & Tunai)",
                        "QR Code Tiap Meja", "Training Karyawan & Panduan", "Uji Coba & Debugging Sistem"
                    ];

                    foreach ($details as $detail) {
                        echo '<div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md card-hover transition-all duration-300">';
                        echo '<h3 class="font-semibold text-lg text-blue-600 dark:text-blue-400">' . htmlspecialchars($detail) . '</h3>';
                        echo '</div>';
                    }
                ?>
            </div>
        </section>

        <!-- Fitur Tambahan & Total -->
        <section id="tambahan" class="mb-12">
             <div class="grid md:grid-cols-2 gap-8">
                <!-- Fitur Tambahan -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
                    <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Fitur Tambahan Opsional</h2>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">
                        Tingkatkan kapabilitas sistem Anda dengan integrasi payment gateway.
                    </p>
                    <div class="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg">
                        <h3 class="font-semibold text-green-800 dark:text-green-200">Integrasi QRIS Dinamis (Midtrans/Xendit)</h3>
                        <p class="text-sm text-green-700 dark:text-green-300">Membuat QRIS unik untuk setiap transaksi, nominal akan terisi otomatis.</p>
                    </div>
                </div>

                <!-- Total / Call to Action -->
                <div class="gradient-bg text-white rounded-xl shadow-lg p-6 md:p-8 flex flex-col justify-center items-center text-center">
                    <h2 class="text-2xl font-bold mb-2">Tertarik dengan Penawaran Ini?</h2>
                    <p class="mb-6">
                        Hubungi kami untuk konsultasi gratis dan dapatkan penawaran harga terbaik sesuai kebutuhan Anda.
                    </p>
                    <a href="mailto:sales@example.com?subject=Penawaran Sistem Kasir" class="bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors duration-300">
                        Hubungi Kami
                    </a>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="text-center text-gray-500 dark:text-gray-400 mt-12">
            <p>&copy; <?php echo date("Y"); ?> Nama Bisnis Anda. All rights reserved.</p>
        </footer>

    </div>

</body>
</html>

