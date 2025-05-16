// Using LimeSpot's AddCustomizations for bundle transformation
LimeSpot.Storefront.AddCustomizations({
  // This runs after each box is rendered
  onPostRender: function(box) {
    // Only process bundlegrid boxes on mobile
    if (window.innerWidth < 800 && 
        box.getAttribute('data-box-style') === 'bundlegrid' &&
        !box.hasAttribute('data-transformed')) {
      
      transformBundleGridToRegular(box);
    }
  },
  
  // This runs after DOM changes (if LimeSpot supports it)
  onDomUpdate: function(box) {
    // Handle any dynamic updates
    if (window.innerWidth < 800 && 
        box.getAttribute('data-box-style') === 'bundlegrid' &&
        !box.hasAttribute('data-transformed')) {
      
      transformBundleGridToRegular(box);
    }
  }
});

// Simplified transformation function (receives specific box)
function transformBundleGridToRegular(bundleBox) {
  const bundleContainer = bundleBox.querySelector('.ls-bundle-container');
  const currentUl = bundleBox.querySelector('.ls-ul.limespot-recommendation-box-bundle-products.ls-bundle-list-ul');
  const ctaContainer = bundleBox.querySelector('.ls-bundle-cta-container');
  
  if (!currentUl) return;
  
  // Extract product data
  const products = Array.from(currentUl.querySelectorAll('.ls-bundle-li')).map(li => {
    const productId = li.getAttribute('data-product-identifier');
    const productTitle = li.getAttribute('data-product-title');
    const price = li.getAttribute('data-price');
    const originalPrice = li.getAttribute('data-original-price');
    const displayUrl = li.getAttribute('data-display-url');
    const isSelected = li.querySelector('.ls-bundle-list-item-checkbox')?.checked || false;

    const img = li.querySelector('.ls-image');
    const imageInfo = {
      src: img.src,
      srcset: img.srcset,
      alt: img.alt,
      title: img.title,
      sizes: img.sizes
    };

    const variantContainer = li.querySelector('.ls-bundle-list-item-variant-container');
    const select = variantContainer?.querySelector('select');
    const variants = select ? Array.from(select.options).map(option => ({
      value: option.value,
      text: option.textContent,
      price: option.getAttribute('data-price'),
      originalPrice: option.getAttribute('data-original-price')
    })) : null;

    const currentVariantId = select?.getAttribute('data-variant-id') || variantContainer?.querySelector('a')?.getAttribute('data-variant-id');

    return {
      productId,
      productTitle,
      price,
      originalPrice,
      displayUrl,
      imageInfo,
      variants,
      currentVariantId,
      isSelected,
      isThisItem: li.classList.contains('ls-this-item')
    };
  });
  
  // Create new regular bundle structure
  const newStructure = `
    <div class="ls-ul-container limespot-recommendation-box-bundle v-align">
      <div class="ls-bundle-discount-container" style="display: block;">
        <div class="ls-bundle-discount-header" style="display: none;">
          <div class="ls-discount-tag"></div>
          <div class="ls-discount-text"></div>
        </div>
      </div>
      <div class="limespot-recommendation-box-bundle-top-section">
        <ul class="ls-ul limespot-recommendation-box-bundle-products">
          ${products.map((product, index) => `
            <li class="ls-bundle-li ls-no-overlay"
                data-product-identifier="${product.productId}"
                data-product-title="${product.productTitle}"
                data-price="${product.price}"
                data-original-price="${product.originalPrice || ''}"
                data-display-url="${product.displayUrl}">
              <div class="limespot-recommendation-box-bundle-item-image">
                <a class="ls-link" data-product-identifier="${product.productId}" href="${product.displayUrl}">
                  <div class="ls-image-wrap">
                    <img class="ls-image"
                         alt="${product.imageInfo.alt}"
                         title="${product.imageInfo.title}"
                         sizes="${product.imageInfo.sizes}"
                         srcset="${product.imageInfo.srcset}"
                         src="${product.imageInfo.src}">
                  </div>
                </a>
                ${index < products.length - 1 ? '<div class="ls-plus-sign"> + </div>' : ''}
              </div>
            </li>
          `).join('')}
        </ul>
        ${ctaContainer.outerHTML}
      </div>
      <div class="ls-bundle-list limespot-recommendation-box-bundle-list">
        <ul class="ls-ul ls-bundle-list-ul">
          ${products.map(product => `
            <li class="ls-li ls-bundle-list-li ls-no-overlay ls-no-review ls-no-loyalty ${product.isThisItem ? 'ls-this-item' : ''}"
                data-product-identifier="${product.productId}"
                data-product-title="${product.productTitle}"
                data-price="${product.price}"
                data-original-price="${product.originalPrice || ''}"
                data-display-url="${product.displayUrl}">
              <label class="ls-bundle-list-item limespot-recommendation-box-bundle-list-item" data-item-selected="${product.isSelected}">
                <input type="checkbox" class="ls-bundle-list-item-checkbox" ${product.isSelected ? 'checked' : ''}>
                <div class="limespot-bundle-list-item-info">
                  <a class="ls-link" data-product-identifier="${product.productId}" href="${product.displayUrl}">
                    <span class="ls-title">${product.productTitle}</span>
                  </a>
                  <div class="ls-bundle-list-item-variant-container" data-variants-initialized="true">
                    <div class="ls-bundle-add-to-cart-select-wrap">
                      ${product.variants ? `
                        <select class="ls-bundle-add-to-cart-select" size="1"
                                data-variant-id="${product.currentVariantId}"
                                data-price="${product.price}"
                                data-original-price="${product.originalPrice || 'null'}">
                          ${product.variants.map(variant => `
                            <option data-price="${variant.price}"
                                    data-original-price="${variant.originalPrice || 'null'}"
                                    value="${variant.value}"
                                    ${variant.value === product.currentVariantId ? 'selected' : ''}>
                              ${variant.text}
                            </option>
                          `).join('')}
                        </select>
                      ` : `
                        <a data-variant-id="${product.currentVariantId}"
                           data-price="${product.price}"
                           data-original-price="${product.originalPrice || ''}"
                           class="ls-bundle-add-to-cart-select"
                           style="display: none;">ADD TO CART</a>
                      `}
                    </div>
                  </div>
                  <div class="ls-price-wrap">
                    ${product.originalPrice ? `
                      <span class="ls-original-price money"
                            data-numeric-value="${product.originalPrice}"
                            data-money-convertible=""
                            data-currency="CAD"
                            data-currency-cad="${product.originalPrice}">${product.originalPrice}</span>
                      <span class="ls-price money ls-sale-price"
                            data-numeric-value="${product.price}"
                            data-money-convertible=""
                            data-currency="CAD"
                            data-currency-cad="${product.price}">${product.price}</span>
                    ` : `
                      <span class="ls-original-price" style="display: none;" data-currency="CAD"></span>
                      <span class="ls-price money"
                            data-numeric-value="${product.price}"
                            data-money-convertible=""
                            data-currency="CAD"
                            data-currency-cad="${product.price}">${product.price}</span>
                    `}
                  </div>
                </div>
              </label>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
  
  // Replace content
  bundleContainer.innerHTML = newStructure;
  bundleBox.setAttribute('data-box-style', 'bundle');
  bundleBox.setAttribute('data-transformed', 'true');
  
  // Add bundle attributes
  bundleBox.setAttribute('data-keep-hidden-after-load', 'true');
  bundleBox.setAttribute('data-bypass-standard-appearance', 'true');
  bundleBox.setAttribute('data-bypass-lazy-images', 'true');
  
  // Re-initialize event listeners
  initializeBundleEventListeners(bundleBox);
}

// Add CSS for transformation
const transformationCSS = `
@media (max-width: 799px) {
  .ls-recommendation-box[data-box-style="bundlegrid"] .ls-bunlde-grid-list-item {
    display: none;
  }
  .ls-recommendation-box[data-box-style="bundle"] {
    display: block !important;
  }
}
`;

if (!document.getElementById('bundle-transformation-css')) {
  const style = document.createElement('style');
  style.id = 'bundle-transformation-css';
  style.textContent = transformationCSS;
  document.head.appendChild(style);
}

// Handle window resize
window.addEventListener('resize', function() {
  // Re-check all boxes on resize
  document.querySelectorAll('.ls-recommendation-box[data-box-style="bundlegrid"]').forEach(box => {
    if (window.innerWidth < 800 && !box.hasAttribute('data-transformed')) {
      transformBundleGridToRegular(box);
    }
  });
});

// Event listeners and updateBundleTotal functions
function initializeBundleEventListeners(bundleBox) {
  // Handle checkbox changes
  const checkboxes = bundleBox.querySelectorAll('.ls-bundle-list-item-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const label = this.closest('label');
      label.setAttribute('data-item-selected', this.checked);
      
      // Update total price
      updateBundleTotal(bundleBox);
    });
  });
  
  // Handle variant selection changes
  const selects = bundleBox.querySelectorAll('.ls-bundle-add-to-cart-select');
  selects.forEach(select => {
    if (select.tagName === 'SELECT') {
      select.addEventListener('change', function() {
        const option = this.options[this.selectedIndex];
        const price = option.getAttribute('data-price');
        const originalPrice = option.getAttribute('data-original-price');
        
        // Update select attributes
        this.setAttribute('data-variant-id', option.value);
        this.setAttribute('data-price', price);
        this.setAttribute('data-original-price', originalPrice || 'null');
        
        // Update price display
        const priceWrap = this.closest('.limespot-bundle-list-item-info').querySelector('.ls-price-wrap');
        const priceSpan = priceWrap.querySelector('.ls-price');
        const originalPriceSpan = priceWrap.querySelector('.ls-original-price');
        
        priceSpan.textContent = `${price}`;
        priceSpan.setAttribute('data-numeric-value', price);
        priceSpan.setAttribute('data-currency-cad', `${price}`);
        
        if (originalPrice && originalPrice !== 'null') {
          originalPriceSpan.textContent = `${originalPrice}`;
          originalPriceSpan.setAttribute('data-numeric-value', originalPrice);
          originalPriceSpan.setAttribute('data-currency-cad', `${originalPrice}`);
          originalPriceSpan.style.display = 'inline';
          priceSpan.classList.add('ls-sale-price');
        } else {
          originalPriceSpan.style.display = 'none';
          priceSpan.classList.remove('ls-sale-price');
        }
        
        // Update list item attributes
        const listItem = this.closest('.ls-bundle-list-li');
        listItem.setAttribute('data-price', price);
        listItem.setAttribute('data-original-price', originalPrice || '');
        
        // Update total price
        updateBundleTotal(bundleBox);
      });
    }
  });
  
  // Initialize total price
  updateBundleTotal(bundleBox);
}

function updateBundleTotal(bundleBox) {
  const checkedItems = bundleBox.querySelectorAll('.ls-bundle-list-item-checkbox:checked');
  let total = 0;
  let originalTotal = 0;
  
  checkedItems.forEach(checkbox => {
    const listItem = checkbox.closest('.ls-bundle-list-li');
    const price = parseFloat(listItem.getAttribute('data-price')) || 0;
    const originalPrice = parseFloat(listItem.getAttribute('data-original-price')) || price;
    
    total += price;
    originalTotal += originalPrice;
  });
  
  // Update total price display
  const totalPriceSpan = bundleBox.querySelector('.ls-bundle-price-total');
  const originalTotalSpan = bundleBox.querySelector('.ls-bundle-original-price-total');
  
  if (totalPriceSpan) {
    totalPriceSpan.textContent = `${total.toFixed(2)}`;
    totalPriceSpan.setAttribute('data-numeric-value', total);
    totalPriceSpan.setAttribute('data-currency-cad', `${total.toFixed(2)}`);
  }
  
  if (originalTotalSpan) {
    originalTotalSpan.textContent = `${originalTotal.toFixed(2)}`;
    originalTotalSpan.setAttribute('data-numeric-value', originalTotal);
    originalTotalSpan.setAttribute('data-currency-cad', `${originalTotal.toFixed(2)}`);
    
    // Show/hide original total based on whether there's a discount
    if (originalTotal > total) {
      originalTotalSpan.style.display = 'inline';
      totalPriceSpan.classList.add('ls-sale-price');
    } else {
      originalTotalSpan.style.display = 'none';
      totalPriceSpan.classList.remove('ls-sale-price');
    }
  }
}
