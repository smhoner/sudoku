// Sudoku tahtasını seç ve varsayılan boyutları belirle
const board = document.getElementById('sudoku-board');
const difficultySelector = document.getElementById('difficulty');
const submitButton = document.getElementById('submit-button');
const hintButton = document.getElementById('hint-button'); // İpucu butonu
const modal = document.getElementById('modal');
const modalText = document.getElementById('modal-text');
const nextButton = document.getElementById('next-button');
const replayButton = document.getElementById('replay-button');
let gridSize = 4; // Varsayılan kolay (4x4)
let blockSize = 2; // Varsayılan blok boyutu (2x2)
let grid = [];
let currentDifficulty = 4; // Varsayılan kolay mod

// Tahtayı oluşturma fonksiyonu
function createBoard(size, block) {
    board.innerHTML = '';
    submitButton.disabled = true; // Submit başlangıçta devre dışı
    gridSize = size;
    blockSize = block;
    grid = Array.from({ length: size }, () => Array(size).fill(0));

    board.style.gridTemplateColumns = `repeat(${size}, 50px)`;
    board.style.gridTemplateRows = `repeat(${size}, 50px)`;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (i % block === 0) cell.classList.add('block-top');
            if (j % block === 0) cell.classList.add('block-left');

            const input = document.createElement('input');
            input.type = 'number';
            input.min = '1';
            input.max = '9';

            input.addEventListener('keydown', (event) => {
                const key = event.key;
                if (!/^[1-9]$/.test(key) && key !== "Backspace" && key !== "Delete") {
                    event.preventDefault();
                }
            });

            input.addEventListener('input', () => {
                const value = input.value;
                grid[i][j] = value ? Number(value) : 0; // Boş hücreleri sıfır yap
                clearAllErrorHighlights(); // Oyuncu değişiklik yaptığında hataları temizle
                checkIfAllCellsFilled(); // Tüm hücrelerin dolu olup olmadığını kontrol et
            });

            cell.appendChild(input);
            board.appendChild(cell);
        }
    }
}

// Tüm hücrelerin dolu olup olmadığını kontrol et
function checkIfAllCellsFilled() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (!grid[i][j]) {
                submitButton.disabled = true; // Bir hücre bile boşsa buton devre dışı
                return;
            }
        }
    }
    submitButton.disabled = false; // Tüm hücreler doluysa buton etkin
}


// Yeni oyun başlatan fonksiyon
function startNewGame(size, block, difficulty) {
    modal.style.display = 'none'; // Modal'ı gizle
    currentDifficulty = difficulty;
    createBoard(size, block);
}
// İpucu butonuna basıldığında kurallara uygun rastgele sayılar ekleme
hintButton.addEventListener('click', () => {
    const emptyCells = [];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 0) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }

    if (emptyCells.length === 0) {
        alert("Boş hücre kalmadı!");
        return;
    }

    // Rastgele bir boş hücre seç ve kurallara uygun bir sayı yerleştir
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const { row, col } = randomCell;

    const possibleNumbers = shuffleArray([...Array(9).keys()].map((x) => x + 1)); // 1 ile 9 arası sayılar

    for (let num of possibleNumbers) {
        if (isValidMove(row, col, num)) {
            grid[row][col] = num;
            const input = board.children[row * gridSize + col].querySelector('input');
            input.value = num;
            return; // Sadece bir hücreyi doldur
        }
    }

    alert("Bu hücreye uygun bir ipucu bulunamadı!");
});

// Geçerli bir hareket olup olmadığını kontrol eden fonksiyon
function isValidMove(row, col, num) {
    for (let c = 0; c < gridSize; c++) {
        if (grid[row][c] === num) return false;
    }

    for (let r = 0; r < gridSize; r++) {
        if (grid[r][col] === num) return false;
    }

    const startRow = Math.floor(row / blockSize) * blockSize;
    const startCol = Math.floor(col / blockSize) * blockSize;
    for (let r = startRow; r < startRow + blockSize; r++) {
        for (let c = startCol; c < startCol + blockSize; c++) {
            if (grid[r][c] === num) return false;
        }
    }

    return true;
}

// Rastgele bir diziyi döndürme fonksiyonu
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Tüm boyalı hücrelerin boyasını kaldıran fonksiyon
function clearAllErrorHighlights() {
    const inputs = board.querySelectorAll('input');
    inputs.forEach((input) => {
        input.classList.remove('error');
    });
}

// Zorluk seviyesi değiştiğinde tahtayı yeniden oluştur
difficultySelector.addEventListener('change', (event) => {
    const value = parseInt(event.target.value, 10);
    if (value === 4) createBoard(4, 2);
    else if (value === 6) createBoard(6, 2);
    else if (value === 9) createBoard(9, 3);
});

// Sayfa yüklendiğinde varsayılan tahtayı oluştur
createBoard(4, 2);

// Submit butonuna basıldığında Sudoku kurallarını kontrol et
submitButton.addEventListener('click', () => {
    const hasError = checkAndPaintErrors(); // Hataları kontrol et ve işaretle

    if (hasError) {
        modalText.textContent = "Kolay mod tamamlandı! Orta moda geçmek ister misiniz?";

    } 
    else {
        modal.style.display = 'block'; // Modal'ı göster
        modalText.textContent = "Kolay mod tamamlandı! Orta moda geçmek ister misiniz?";
        nextButton.style.display = 'inline-block';
        nextButton.onclick = () => startNewGame(6, 2, 5); // Orta mod
    }
    replayButton.onclick = () => startNewGame(gridSize, blockSize, currentDifficulty);

});

// Submit butonunda hataları kontrol eden ve işaretleyen fonksiyon
function checkAndPaintErrors() {
    let hasError = false; // Hatalı hücre var mı?
    clearAllErrorHighlights(); // Tüm önceki hata işaretlerini temizle

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const input = board.children[i * gridSize + j].querySelector('input');

            if (!isValid(grid, i, j, gridSize)) {
                input.classList.add('error'); // Hatalı hücreleri kırmızıya boya
                hasError = true;
            }
        }
    }

    return hasError; // Hata olup olmadığını döndür
}

// Hücrenin kurallara uygun olup olmadığını kontrol eden fonksiyon
function isValid(grid, row, col, size) {
    const value = grid[row][col];
    if (!value) return true; // Boş hücre kontrol edilmiyor

    // Satırda aynı sayı var mı?
    for (let c = 0; c < size; c++) {
        if (c !== col && grid[row][c] === value) return false;
    }

    // Sütunda aynı sayı var mı?
    for (let r = 0; r < size; r++) {
        if (r !== row && grid[r][col] === value) return false;
    }

    // Aynı blokta aynı sayı var mı?
    const startRow = Math.floor(row / blockSize) * blockSize;
    const startCol = Math.floor(col / blockSize) * blockSize;
    for (let r = startRow; r < startRow + blockSize; r++) {
        for (let c = startCol; c < startCol + blockSize; c++) {
            if ((r !== row || c !== col) && grid[r][c] === value) return false;
        }
    }

    return true; // Eğer kurallar uygunsa true döndür
}

// Tüm boyalı hücrelerin boyasını kaldıran fonksiyon
function clearAllErrorHighlights() {
    const inputs = board.querySelectorAll('input');
    inputs.forEach((input) => {
        input.classList.remove('error'); // Hataları temizle
    });
}

