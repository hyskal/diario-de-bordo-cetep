// Remover: const IMGBB_API_KEY = 'de77ac8c0ed26c71bbcb0ee71d45c707';

const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const successMessage = document.getElementById('success-message');
const downloadLinkContainer = document.getElementById('download-link-container');
const downloadButton = document.getElementById('download-button');
const addStudentBtn = document.getElementById('add-student-btn');
const removeStudentBtn = document.getElementById('remove-student-btn');
const studentNamesGroup = document.getElementById('student-names-group');
const MAX_IMAGE_WIDTH = 800;
const JPEG_QUALITY = 0.8;

function updateProgressBar(percentage) {
    const roundedPercentage = Math.round(percentage);
    progressBar.style.width = roundedPercentage + '%';
    progressBar.textContent = roundedPercentage + '%';
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// NOVA FUNÇÃO: Processamento local de imagens
function compressImageLocally(file) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            // Calcular dimensões mantendo proporção
            let { width, height } = img;
            
            if (width > MAX_IMAGE_WIDTH) {
                height = (height * MAX_IMAGE_WIDTH) / width;
                width = MAX_IMAGE_WIDTH;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Desenhar imagem redimensionada
            ctx.drawImage(img, 0, 0, width, height);
            
            // Converter para Data URL com qualidade especificada
            const compressedDataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
            
            resolve({ 
                url: compressedDataUrl, 
                width: width, 
                height: height 
            });
        };
        
        img.onerror = () => {
            reject('Erro ao carregar a imagem para processamento.');
        };
        
        img.src = URL.createObjectURL(file);
    });
}

const dropZone = document.getElementById('drop-zone');
const fotosInput = document.getElementById('fotos');
const dropZoneCount = document.getElementById('drop-zone-count');
const dropZonePreview = document.getElementById('drop-zone-preview');

let selectedFiles = [];

function updateDropZone(files) {
    selectedFiles = Array.from(files).slice(0, 6);
    dropZonePreview.innerHTML = '';
    if (selectedFiles.length > 0) {
        dropZoneCount.textContent = `${selectedFiles.length} foto${selectedFiles.length > 1 ? 's' : ''} selecionada${selectedFiles.length > 1 ? 's' : ''}`;
        dropZoneCount.style.display = 'block';
        selectedFiles.forEach(file => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            dropZonePreview.appendChild(img);
        });
    } else {
        dropZoneCount.style.display = 'none';
    }
}

fotosInput.addEventListener('change', function() {
    updateDropZone(this.files);
});

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    updateDropZone(e.dataTransfer.files);
});

document.getElementById('modal-fechar').addEventListener('click', () => {
    document.getElementById('modal-confirmacao').classList.remove('active');
});

document.getElementById('modal-confirmacao').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-confirmacao')) {
        document.getElementById('modal-confirmacao').classList.remove('active');
    }
});

addStudentBtn.addEventListener('click', () => {
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.className = 'input-field student-name-input';
    newInput.placeholder = 'Digite o nome completo do estudante';
    
    studentNamesGroup.appendChild(newInput);
    removeStudentBtn.style.display = 'inline-block';
});

removeStudentBtn.addEventListener('click', () => {
    const studentInputs = studentNamesGroup.querySelectorAll('.student-name-input');
    if (studentInputs.length > 1) {
        studentNamesGroup.removeChild(studentInputs[studentInputs.length - 1]);
    }
    if (studentInputs.length <= 2) {
        removeStudentBtn.style.display = 'none';
    }
});

document.getElementById('gerar-pdf').addEventListener('click', function() {
    const studentNameInputs = document.querySelectorAll('.student-name-input');
    let studentNames = [];
    studentNameInputs.forEach(input => {
        if (input.value.trim() !== '') {
            studentNames.push(input.value.trim());
        }
    });
    const titulo = studentNames.join(', ');
    const turma = document.getElementById('turma').value;
    const email = document.getElementById('email').value;

    if (!titulo.trim() || !turma.trim()) {
        alert('Por favor, preencha o nome do(s) estudante(s) e a turma.');
        return;
    }
    if (!isValidEmail(email)) {
        alert('Por favor, insira um e-mail válido.');
        return;
    }

    progressContainer.style.display = 'block';
    successMessage.style.display = 'none';
    downloadLinkContainer.style.display = 'none';
    updateProgressBar(0);
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const dataHora = new Date();
    const logoImg = new Image();
    logoImg.src = '/logo-cetep-lnab.png';
    
    logoImg.onload = function() {
        const pageWidth = doc.internal.pageSize.getWidth();
        const logoWidthMm = 25;
        const logoHeightMm = 25;
        const logoMargin = 10;
        
        function addLogo(doc) {
            doc.addImage(logoImg, 'PNG', pageWidth - logoWidthMm - logoMargin, logoMargin, logoWidthMm, logoHeightMm);
        }
        
        addLogo(doc);
        const headerText = `${titulo} - ${turma} - ${email} - Gerado em: ${dataHora.toLocaleString()}`;
        
        doc.setFontSize(10);
        const headerTextX = 20;
        const headerTextY = 20;
        const textWidth = pageWidth - (logoWidthMm + logoMargin) - headerTextX - 10;
        const splitText = doc.splitTextToSize(headerText, textWidth);
        doc.text(splitText, headerTextX, headerTextY, { align: 'left' });
        
        const files = selectedFiles.slice(0, 6);
        
        if (files.length > 0) {
            let processedCount = 0;
            
            // SUBSTITUIR: uploadImageToImgbb por compressImageLocally
            const processPromises = files.map(file => compressImageLocally(file).then(imageData => {
                processedCount++;
                updateProgressBar((processedCount / files.length) * 100 * 0.7);
                return imageData;
            }));
            
            Promise.all(processPromises)
                .then(imageDatas => {
                    let y = 35;
                    let cellWidth = 85; 
                    let cellHeight;
                    let margin;
                    
                    if (files.length <= 4) {
                        cellHeight = 110;
                        margin = 10;
                    } else {
                        cellHeight = 76.5;
                        margin = 5;
                    }
                    
                    let x = 20; 
                    const cellPadding = 2;
                    
                    imageDatas.forEach((imageData, index) => {
                        if (doc.internal.pageSize.height < y + cellHeight + margin) {
                            doc.addPage();
                            addLogo(doc);
                            y = 20;
                        }
                        
                        let finalWidth = cellWidth;
                        let finalHeight = (imageData.height * finalWidth) / imageData.width;
                        if (finalHeight > cellHeight) {
                            finalHeight = cellHeight;
                            finalWidth = (imageData.width * finalHeight) / imageData.height;
                        }
                        if (index % 2 === 0 && index !== 0) {
                            y += cellHeight + margin; 
                            x = 20; 
                        }
                        
                        const imgX = x + (cellWidth - finalWidth) / 2;
                        const imgY = y + (cellHeight - finalHeight) / 2;
                        doc.rect(x - cellPadding, y - cellPadding, cellWidth + 2 * cellPadding, cellHeight + 2 * cellPadding);
                        
                        // USAR: Data URL diretamente no PDF
                        doc.addImage(imageData.url, 'JPEG', imgX, imgY, finalWidth, finalHeight);
                        x += cellWidth + margin;
                    });
                    
                    updateProgressBar(75);
                    
                    const pdfBlob = doc.output('blob');
                    
                    const dia = String(dataHora.getDate()).padStart(2, '0');
                    const mes = String(dataHora.getMonth() + 1).padStart(2, '0');
                    const ano = dataHora.getFullYear();
                    const dataFormatada = `${dia}${mes}${ano}`;
                    const turmaSanitizada = turma.replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                    const tituloSanitizado = titulo.replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                    
                    const pdfFileName = `${dataFormatada}-${turmaSanitizada}-${tituloSanitizado}.pdf`;

                    // Upload paralelo para SML Storage (fire-and-forget)
                    pdfBlob.arrayBuffer().then(buffer => {
                        const bytes = new Uint8Array(buffer);
                        let binary = '';
                        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
                        const base64 = btoa(binary);
                        fetch('https://us-central1-diario-de-bordo-cetep.cloudfunctions.net/smlUpload', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ filename: pdfFileName, turma, aluno: titulo, fileBase64: base64 })
                        })
                        .then(r => r.json())
                        .then(d => console.log('[SML]', d.success ? d.url : d.error))
                        .catch(e => console.warn('[SML] falhou silenciosamente:', e));
                    });

                    const storageRef = storage.ref(`diarios/${pdfFileName}`);
                    const uploadTask = storageRef.put(pdfBlob);
                    
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            updateProgressBar(75 + (progress * 0.25));
                        },
                        (error) => {
                            console.error("Erro no upload do PDF:", error);
                            alert('Erro ao fazer o upload do PDF. Tente novamente.');
                            progressContainer.style.display = 'none';
                        },
                        () => {
                            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                                updateProgressBar(100);
                                progressContainer.style.display = 'none';
                                document.getElementById('modal-download-btn').href = downloadURL;
                                document.getElementById('modal-confirmacao').classList.add('active');
                            });
                        }
                    );
                })
                .catch(error => {
                    console.error('Erro ao processar as imagens:', error);
                    alert('Ocorreu um erro ao processar as imagens. Tente novamente.');
                    progressContainer.style.display = 'none';
                });
        } else {
            alert('Por favor, selecione pelo menos uma foto.');
            progressContainer.style.display = 'none';
        }
    };
});
