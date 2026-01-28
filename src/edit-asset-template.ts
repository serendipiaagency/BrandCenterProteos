export function generateEditAssetHTML(asset: any, brands: any[], materialTypes: any[], selectedBrandIds: number[], regions: string[]) {
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
  <title>Edit Asset - ${asset.title}</title>
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
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Original Filename
          </label>
          <input 
            type="text" 
            value="${asset.original_filename}"
            disabled
            class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
          />
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
        
        <div class="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Brands (Ctrl/Cmd + Click for multiple)
            </label>
            <select 
              id="brands"
              name="brands"
              multiple
              size="6"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              ${brandsOptions}
            </select>
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
        
        <div class="grid grid-cols-2 gap-6 mb-8">
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
    document.getElementById('edit-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const title = document.getElementById('title').value.trim();
      const description = document.getElementById('description').value.trim();
      
      const brandsSelect = document.getElementById('brands');
      const brand_ids = Array.from(brandsSelect.selectedOptions).map(opt => parseInt(opt.value));
      
      const material_type_id = document.getElementById('material_type').value || null;
      
      const regionsSelect = document.getElementById('regions');
      const regions = Array.from(regionsSelect.selectedOptions).map(opt => opt.value);
      
      const country = document.getElementById('country').value.trim() || null;
      const regulatory = document.getElementById('regulatory').value;
      const language = document.getElementById('language').value;
      
      const updateData = {
        title: title || 'Untitled',
        description: description || null,
        brand_ids: brand_ids,
        material_type_id: material_type_id ? parseInt(material_type_id) : null,
        regions: regions,
        country: country,
        regulatory: regulatory,
        language: language
      };
      
      console.log('📦 Sending update:', updateData);
      
      try {
        const response = await axios.put('/api/assets/${asset.id}', updateData);
        console.log('✅ Update response:', response.data);
        
        const msg = document.getElementById('message');
        msg.className = 'mt-4 p-4 rounded-lg bg-green-100 text-green-800';
        msg.textContent = '✅ Asset updated successfully!';
        msg.classList.remove('hidden');
        
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1000);
        
      } catch (error) {
        console.error('❌ Update error:', error);
        
        const msg = document.getElementById('message');
        msg.className = 'mt-4 p-4 rounded-lg bg-red-100 text-red-800';
        msg.textContent = '❌ Error updating asset: ' + (error.response?.data?.message || error.message);
        msg.classList.remove('hidden');
      }
    });
  </script>
</body>
</html>
  `
}
