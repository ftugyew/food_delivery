// ===== FRONTEND EXAMPLE: Upload Restaurant Image with Cloudinary =====
// Add this to your restaurant-dashboard.html or similar

async function createRestaurantWithImage() {
  const formData = new FormData();
  
  // Form fields
  formData.append("name", document.getElementById("restaurantName").value);
  formData.append("description", document.getElementById("description").value);
  formData.append("cuisine", document.getElementById("cuisine").value);
  formData.append("phone", document.getElementById("phone").value);
  formData.append("email", document.getElementById("email").value);
  formData.append("address", document.getElementById("address").value);
  formData.append("lat", document.getElementById("lat").value || 0);
  formData.append("lng", document.getElementById("lng").value || 0);
  
  // Image file from input
  const imageFile = document.getElementById("imageInput").files[0];
  if (imageFile) {
    formData.append("image", imageFile); // Must be "image" field name
  }

  try {
    const response = await fetch("https://your-backend.onrender.com/api/restaurants", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: formData // No Content-Type header; browser sets it automatically
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Restaurant created! Image URL:", result.image_url);
      // Image is now on Cloudinary and stored in DB
    } else {
      console.error("❌ Error:", result.error);
    }
  } catch (err) {
    console.error("Network error:", err);
  }
}

// ===== FRONTEND EXAMPLE: Add Menu Item with Image =====

async function addMenuItemWithImage() {
  const formData = new FormData();
  
  formData.append("item_name", document.getElementById("itemName").value);
  formData.append("price", document.getElementById("price").value);
  formData.append("description", document.getElementById("description").value);
  formData.append("category", document.getElementById("category").value);
  formData.append("is_veg", document.getElementById("isVeg").value); // "veg" or "non-veg"
  
  const imageFile = document.getElementById("menuImageInput").files[0];
  if (imageFile) {
    formData.append("image", imageFile); // Must be "image" field name
  }

  try {
    const response = await fetch("https://your-backend.onrender.com/api/menu", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Menu item added! Image URL:", result.image_url);
      // image_url is now a permanent Cloudinary URL
    } else {
      console.error("❌ Error:", result.error);
    }
  } catch (err) {
    console.error("Network error:", err);
  }
}

// ===== HTML INPUT EXAMPLE =====
/*
<form id="restaurantForm">
  <input type="text" id="restaurantName" placeholder="Restaurant Name" required>
  <input type="text" id="description" placeholder="Description">
  <input type="text" id="cuisine" placeholder="Cuisine Type">
  <input type="tel" id="phone" placeholder="Phone">
  <input type="email" id="email" placeholder="Email">
  <input type="text" id="address" placeholder="Address">
  <input type="number" id="lat" placeholder="Latitude" step="0.0001">
  <input type="number" id="lng" placeholder="Longitude" step="0.0001">
  
  <label>Restaurant Image:</label>
  <input type="file" id="imageInput" accept="image/*" required>
  
  <button type="button" onclick="createRestaurantWithImage()">Create Restaurant</button>
</form>

<form id="menuForm">
  <input type="text" id="itemName" placeholder="Dish Name" required>
  <input type="number" id="price" placeholder="Price" step="0.01" required>
  <input type="text" id="description" placeholder="Description">
  <select id="category">
    <option value="Appetizer">Appetizer</option>
    <option value="Main Course">Main Course</option>
    <option value="Dessert">Dessert</option>
  </select>
  
  <select id="isVeg">
    <option value="veg">Vegetarian</option>
    <option value="non-veg">Non-Vegetarian</option>
  </select>
  
  <label>Dish Image:</label>
  <input type="file" id="menuImageInput" accept="image/*" required>
  
  <button type="button" onclick="addMenuItemWithImage()">Add Menu Item</button>
</form>
*/
