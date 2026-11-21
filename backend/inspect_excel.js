const XLSX = require('xlsx');

try {
    const filePath = 'c:\\Users\\Marshal Borad\\OneDrive\\Desktop\\stockomni\\Vegetable_Inventory_Data.xlsx';
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Get array of arrays

    if (data.length > 0) {
        console.log('Excel Headers:', data[0]);
        console.log('First Row Sample:', data[1]);
    } else {
        console.log('Excel file is empty.');
    }
} catch (error) {
    console.error('Error reading Excel:', error.message);
}
