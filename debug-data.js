// Script untuk debugging dummy data
// Jalankan di browser console

// 1. Cek data di localStorage
console.log('Current localStorage data:', localStorage.getItem('campaignDatabase'));

// 2. Clear localStorage dan reload dummy data
localStorage.removeItem('campaignDatabase');
console.log('localStorage cleared');

// 3. Re-import dan check
// Setelah refresh halaman, dummy data harus muncul

// Alternatif: Gunakan campaignDB.reloadDummyData() di console browser