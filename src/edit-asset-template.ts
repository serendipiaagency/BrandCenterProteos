export function generateEditAssetHTML(asset: any, brands: any[], materialTypes: any[], selectedBrandIds: number[], regions: string[], allLabels: any[] = [], selectedLabelIds: number[] = []) {
  const brandsOptions = brands.map(brand => `
    <option value="${brand.id}" ${selectedBrandIds.includes(brand.id) ? 'selected' : ''}>
      ${brand.display_name}
    </option>
  `).join('')
  
  const materialTypesOptions = materialTypes.map(type => `
    <option value="${type.id}" ${asset.material_type_id == type.id ? 'selected' : ''}>
      ${type.display_name_en}
    </option>
  `).join('')
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Edit Asset - ${asset.title}</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
</head>
<body class="bg-gray-50">
  <div class="min-h-screen p-8">
    <div class="max-w-4xl mx-auto">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Edit Asset</h1>
          <p class="text-gray-600 mt-1">Asset ID: ${asset.id}</p>
        </div>
        <a href="/admin" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
          <i class="fas fa-arrow-left mr-2"></i>
          Back to Admin
        </a>
      </div>
      
      <form id="edit-form" class="bg-white rounded-lg shadow-md p-8">
        <!-- File Replacement Section -->
        <div class="mb-6 p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg">
          <div class="flex items-center mb-4">
            <i class="fas fa-file-archive text-orange-600 text-2xl mr-3"></i>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Archivo Principal</h3>
              <p class="text-sm text-gray-600">Reemplaza el archivo vinculado a este asset</p>
            </div>
          </div>

          <!-- Current file info -->
          <div class="mb-4 p-4 bg-white rounded-lg border border-gray-300">
            <div class="flex items-center gap-3">
              <i class="fas fa-file text-gray-400 text-2xl"></i>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">${asset.original_filename}</p>
                <p class="text-xs text-gray-500">${asset.file_size ? (asset.file_size < 1024*1024 ? (asset.file_size/1024).toFixed(1)+' KB' : (asset.file_size/(1024*1024)).toFixed(1)+' MB') : 'Tamaño desconocido'}${asset.file_type ? ' · ' + String(asset.file_type).toUpperCase() : ''}</p>
              </div>
              <a href="${asset.file_url}" target="_blank" class="flex-shrink-0 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
                <i class="fas fa-download mr-1"></i>Ver archivo
              </a>
            </div>
          </div>

          <!-- New file info (shown after upload) -->
          <div id="new-file-info" class="hidden mb-4 p-4 bg-green-50 rounded-lg border border-green-300">
            <div class="flex items-center gap-3">
              <i class="fas fa-check-circle text-green-500 text-2xl"></i>
              <div class="flex-1 min-w-0">
                <p id="new-file-name" class="text-sm font-medium text-green-900 truncate"></p>
                <p id="new-file-meta" class="text-xs text-green-700"></p>
              </div>
            </div>
            <p class="text-xs text-green-700 mt-2"><i class="fas fa-info-circle mr-1"></i>El archivo se actualizará al hacer clic en <strong>Save Changes</strong>.</p>
          </div>

          <!-- Upload progress -->
          <div id="file-upload-progress" class="hidden mb-4">
            <div class="flex items-center gap-3 mb-2">
              <i class="fas fa-spinner fa-spin text-orange-500"></i>
              <span id="file-upload-status" class="text-sm text-gray-700">Subiendo archivo...</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div id="file-upload-bar" class="bg-orange-500 h-2 rounded-full transition-all duration-300" style="width:0%"></div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <input type="file" id="replace-file-input" class="hidden" />
            <button
              type="button"
              onclick="document.getElementById('replace-file-input').click()"
              class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              <i class="fas fa-exchange-alt mr-2"></i>
              Reemplazar archivo
            </button>
            <p class="text-xs text-gray-500">El archivo actual se eliminará al guardar el nuevo.</p>
          </div>
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input 
            type="text" 
            id="title"
            name="title"
            value="${asset.title || ''}"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea 
            id="description"
            name="description"
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >${asset.description || ''}</textarea>
        </div>
        
        <!-- Thumbnail Upload Section -->
        <div class="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg">
          <div class="flex items-center mb-4">
            <i class="fas fa-image text-blue-600 text-2xl mr-3"></i>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Imagen Destacada (opcional)</h3>
              <p class="text-sm text-gray-600">Sube una imagen de preview para el catálogo público</p>
            </div>
          </div>
          
          ${asset.thumbnail_url ? `
          <div class="mb-4 p-4 bg-white rounded-lg border border-gray-300">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-medium text-gray-700">Vista previa actual:</p>
              <button 
                type="button"
                onclick="deleteThumbnail()"
                class="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
              >
                <i class="fas fa-trash mr-1"></i>
                Eliminar
              </button>
            </div>
            <img src="${asset.thumbnail_url}" alt="Current thumbnail" class="w-48 h-36 object-cover rounded-lg border border-gray-300" />
          </div>
          ` : ''}
          
          <div class="flex items-start gap-4">
            <input 
              type="file" 
              id="thumbnail"
              accept="image/jpeg,image/png,image/webp"
              class="hidden"
            />
            <button 
              type="button"
              onclick="document.getElementById('thumbnail').click()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <i class="fas fa-cloud-upload-alt mr-2"></i>
              ${asset.thumbnail_url ? 'Cambiar Imagen' : 'Subir Imagen'}
            </button>
            <div class="flex-1">
              <p class="text-xs text-gray-600 mb-1">
                <strong>Recomendado:</strong> 400x300px (ratio 4:3)
              </p>
              <p class="text-xs text-gray-600">
                <strong>Formatos:</strong> JPG, PNG, WebP | <strong>Tamaño máximo:</strong> 500 KB
              </p>
            </div>
          </div>
          
          <div id="thumbnail-preview" class="mt-4 hidden">
            <p class="text-sm font-medium text-gray-700 mb-2">Nueva imagen:</p>
            <img id="thumbnail-image" class="w-48 h-36 object-cover rounded-lg border border-gray-300" />
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Líneas de producto
            </label>
            <div class="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
              ${brands.map(brand => `
                <label class="flex items-center gap-2 py-1 px-1 rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="brand_checkbox"
                    value="${brand.id}"
                    ${selectedBrandIds.includes(brand.id) ? 'checked' : ''}
                    class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-700">${brand.display_name}</span>
                </label>
              `).join('')}
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Material Type
            </label>
            <select 
              id="material_type"
              name="material_type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No type</option>
              ${materialTypesOptions}
            </select>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Regions (Ctrl/Cmd + Click for multiple)
            </label>
            <select 
              id="regions"
              name="regions"
              multiple
              size="6"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="GLOBAL" ${regions.includes('GLOBAL') ? 'selected' : ''}>GLOBAL</option>
              <option value="USA" ${regions.includes('USA') ? 'selected' : ''}>USA</option>
              <option value="LATAM" ${regions.includes('LATAM') ? 'selected' : ''}>LATAM</option>
              <option value="EUROPA" ${regions.includes('EUROPA') ? 'selected' : ''}>EUROPA</option>
              <option value="MENA" ${regions.includes('MENA') ? 'selected' : ''}>MENA</option>
              <option value="ASIA" ${regions.includes('ASIA') ? 'selected' : ''}>ASIA</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Country (Optional)
            </label>
            <input 
              type="text" 
              id="country"
              name="country"
              value="${asset.country || ''}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Regulatory
            </label>
            <select
              id="regulatory"
              name="regulatory"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="GLOBAL" ${asset.regulatory === 'GLOBAL' ? 'selected' : ''}>GLOBAL</option>
              <option value="EU" ${asset.regulatory === 'EU' ? 'selected' : ''}>EU</option>
              <option value="FDA" ${asset.regulatory === 'FDA' ? 'selected' : ''}>FDA</option>
              <option value="COFEPRIS" ${asset.regulatory === 'COFEPRIS' ? 'selected' : ''}>COFEPRIS</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              id="language"
              name="language"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ENG" ${asset.language === 'ENG' ? 'selected' : ''}>English</option>
              <option value="ESP" ${asset.language === 'ESP' ? 'selected' : ''}>Spanish</option>
              <option value="FRA" ${asset.language === 'FRA' ? 'selected' : ''}>French</option>
              <option value="DEU" ${asset.language === 'DEU' ? 'selected' : ''}>German</option>
              <option value="ITA" ${asset.language === 'ITA' ? 'selected' : ''}>Italian</option>
              <option value="POR" ${asset.language === 'POR' ? 'selected' : ''}>Portuguese</option>
            </select>
          </div>
        </div>

        <!-- Labels -->
        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-800 mb-3">
            <i class="fas fa-tag text-blue-500 mr-2"></i>
            Etiquetas
          </label>
          ${allLabels.length === 0 ? `
          <p class="text-sm text-gray-500 italic">No hay etiquetas creadas. Ve al gestor de etiquetas para crearlas.</p>
          ` : `
          <div class="flex flex-wrap gap-2">
            ${allLabels.map(label => `
            <label class="cursor-pointer select-none">
              <input type="checkbox" name="label_ids" value="${label.id}" ${selectedLabelIds.includes(label.id) ? 'checked' : ''} class="sr-only peer" />
              <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all peer-checked:opacity-100 opacity-40 peer-checked:scale-105"
                style="background-color: ${label.color}; color: ${label.text_color}; border-color: ${label.color};">
                <i class="fas fa-tag text-xs"></i>
                ${label.name}
              </span>
            </label>
            `).join('')}
          </div>
          `}
        </div>

        <!-- Status -->
        <div class="mb-8 p-4 border-2 rounded-lg ${asset.status === 'draft' ? 'border-amber-400 bg-amber-50' : 'border-green-300 bg-green-50'}">
          <label class="block text-sm font-semibold text-gray-800 mb-2">
            <i class="fas ${asset.status === 'draft' ? 'fa-eye-slash text-amber-500' : 'fa-eye text-green-600'} mr-2"></i>
            Estado / Status
          </label>
          <select
            id="status"
            name="status"
            onchange="this.closest('.mb-8').className = 'mb-8 p-4 border-2 rounded-lg ' + (this.value === 'draft' ? 'border-amber-400 bg-amber-50' : 'border-green-300 bg-green-50')"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="published" ${!asset.status || asset.status === 'published' ? 'selected' : ''}>Publicado — visible para todos los usuarios</option>
            <option value="draft" ${asset.status === 'draft' ? 'selected' : ''}>Borrador — solo visible para Admin y Marketing</option>
          </select>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg mb-8">
          <div class="grid grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span class="font-medium">File Type:</span> ${asset.file_type}
            </div>
            <div>
              <span class="font-medium">File Size:</span> ${Math.round(asset.file_size / 1024)} KB
            </div>
            <div>
              <span class="font-medium">Created:</span> ${new Date(asset.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-4">
          <a 
            href="/admin" 
            class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </a>
          <button 
            type="submit"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <i class="fas fa-save mr-2"></i>
            Save Changes
          </button>
        </div>
      </form>
      
      <div id="message" class="hidden mt-4 p-4 rounded-lg"></div>
    </div>
  </div>
  
  <script>
    // ── File replacement ──────────────────────────────────────────
    let pendingFileReplacement = null;

    function formatBytes(bytes) {
      if (!bytes) return 'Tamaño desconocido';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    document.getElementById('replace-file-input').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const progressEl = document.getElementById('file-upload-progress');
      const statusEl  = document.getElementById('file-upload-status');
      const barEl     = document.getElementById('file-upload-bar');
      const newInfoEl = document.getElementById('new-file-info');

      progressEl.classList.remove('hidden');
      newInfoEl.classList.add('hidden');
      barEl.style.width = '5%';
      barEl.className = 'bg-orange-500 h-2 rounded-full transition-all duration-300';
      statusEl.textContent = 'Subiendo archivo...';

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (ev) => {
            const pct = ev.total ? Math.round((ev.loaded / ev.total) * 90) + 5 : 50;
            barEl.style.width = pct + '%';
          }
        });

        barEl.style.width = '100%';
        statusEl.textContent = '¡Archivo listo! Se guardará al hacer clic en Save Changes.';

        pendingFileReplacement = {
          filename: response.data.filename,
          file_url: response.data.fileUrl,
          original_filename: file.name,
          file_size: file.size,
          file_type: response.data.fileType,
          old_filename: '${asset.filename}'
        };

        document.getElementById('new-file-name').textContent = file.name;
        document.getElementById('new-file-meta').textContent = formatBytes(file.size) + (response.data.fileType ? ' · ' + response.data.fileType.toUpperCase() : '');
        newInfoEl.classList.remove('hidden');

        setTimeout(() => progressEl.classList.add('hidden'), 2000);

      } catch (err) {
        console.error('❌ File upload error:', err);
        barEl.className = 'bg-red-500 h-2 rounded-full';
        barEl.style.width = '100%';
        statusEl.textContent = 'Error: ' + (err.response?.data?.error || err.message);
      }
    });
    // ─────────────────────────────────────────────────────────────

    // Thumbnail preview
    document.getElementById('thumbnail').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file size (500KB)
        if (file.size > 500 * 1024) {
          alert('El archivo es demasiado grande. Máximo 500 KB');
          e.target.value = '';
          return;
        }
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (event) => {
          document.getElementById('thumbnail-image').src = event.target.result;
          document.getElementById('thumbnail-preview').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Delete thumbnail function
    window.deleteThumbnail = async function() {
      if (!confirm('¿Estás seguro de que quieres eliminar la imagen destacada?')) {
        return;
      }
      
      try {
        console.log('🗑️ Deleting thumbnail for asset ${asset.id}');
        
        const response = await axios.delete('/api/assets/${asset.id}/thumbnail');
        console.log('✅ Thumbnail deleted:', response.data);
        
        // Show success message
        alert('Imagen destacada eliminada exitosamente');
        
        // Reload page to show updated state
        window.location.reload();
      } catch (error) {
        console.error('❌ Delete error:', error);
        alert('Error al eliminar la imagen: ' + (error.response?.data?.error || error.message));
      }
    };
    
    document.getElementById('edit-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const title = document.getElementById('title').value.trim();
      const description = document.getElementById('description').value.trim();
      
      const brand_ids = Array.from(document.querySelectorAll('input[name="brand_checkbox"]:checked')).map(el => parseInt((el as HTMLInputElement).value));
      
      const material_type_id = document.getElementById('material_type').value || null;
      
      const regionsSelect = document.getElementById('regions');
      const regions = Array.from(regionsSelect.selectedOptions).map(opt => opt.value);
      
      const country = document.getElementById('country').value.trim() || null;
      const regulatory = document.getElementById('regulatory').value;
      const language = document.getElementById('language').value;
      const status = document.getElementById('status').value;

      const labelCheckboxes = document.querySelectorAll('input[name="label_ids"]:checked');
      const label_ids = Array.from(labelCheckboxes).map(cb => parseInt(cb.value));

      const updateData = {
        title: title || 'Untitled',
        description: description || null,
        brand_ids: brand_ids,
        material_type_id: material_type_id ? parseInt(material_type_id) : null,
        regions: regions,
        country: country,
        regulatory: regulatory,
        language: language,
        status: status
      };
      
      console.log('📦 Sending update:', updateData);
      
      // Disable submit button
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...';
      
      try {
        const [response] = await Promise.all([
          axios.put('/api/assets/${asset.id}', updateData),
          axios.put('/api/assets/${asset.id}/labels', { label_ids })
        ]);
        console.log('✅ Update response:', response.data);

        // Replace main file if a new one was uploaded
        if (pendingFileReplacement) {
          try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Actualizando archivo...';
            await axios.put('/api/assets/${asset.id}/file', pendingFileReplacement);
            console.log('✅ File replaced successfully');
          } catch (fileError) {
            console.error('❌ File replace error:', fileError);
            alert('Error al actualizar el archivo: ' + (fileError.response?.data?.error || fileError.message));
          }
        }

        // Upload thumbnail if selected
        const thumbnailFile = document.getElementById('thumbnail').files[0];
        if (thumbnailFile) {
          try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Subiendo imagen...';
            
            const formData = new FormData();
            formData.append('thumbnail', thumbnailFile);
            
            console.log('📤 Uploading thumbnail:', {
              name: thumbnailFile.name,
              type: thumbnailFile.type,
              size: thumbnailFile.size
            });
            
            const thumbnailResponse = await axios.post('/api/assets/${asset.id}/thumbnail', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            
            console.log('✅ Thumbnail response:', thumbnailResponse.data);
          } catch (thumbnailError) {
            console.error('❌ Thumbnail upload error:', thumbnailError);
            console.error('❌ Error details:', thumbnailError.response?.data);
            
            // Show error but don't stop the process
            alert('Error al subir la imagen destacada: ' + (thumbnailError.response?.data?.error || thumbnailError.message));
          }
        }
        
        // Show success message
        const msg = document.getElementById('message');
        msg.className = 'fixed top-4 right-4 z-50 p-6 rounded-lg bg-green-500 text-white shadow-2xl border-2 border-green-600 animate-bounce';
        msg.innerHTML = '<div class="flex items-center gap-3"><i class="fas fa-check-circle text-3xl"></i><div><div class="font-bold text-lg">¡Cambios guardados exitosamente!</div><div class="text-sm opacity-90">Redirigiendo al panel de administración...</div></div></div>';
        msg.classList.remove('hidden');
        
        // Re-enable button with success state
        submitBtn.disabled = false;
        submitBtn.className = 'px-6 py-2 bg-green-600 text-white rounded-lg transition';
        submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>¡Guardado!';
        
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/admin';
        }, 2000);
        
      } catch (error) {
        console.error('❌ Update error:', error);
        
        // Show error message
        const msg = document.getElementById('message');
        msg.className = 'fixed top-4 right-4 z-50 p-6 rounded-lg bg-red-500 text-white shadow-2xl border-2 border-red-600';
        msg.innerHTML = '<div class="flex items-center gap-3"><i class="fas fa-exclamation-circle text-3xl"></i><div><div class="font-bold text-lg">Error al guardar</div><div class="text-sm opacity-90">' + (error.response?.data?.message || error.message) + '</div></div></div>';
        msg.classList.remove('hidden');
        
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.className = 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition';
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Save Changes';
      }
    });
  </script>
</body>
</html>
  `
}
