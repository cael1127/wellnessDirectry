# Image Upload - 1 Profile + 3 Gallery Photos

## ✅ Implementation Complete

### **Image Limits:**
- **1 Profile Picture** (Required)
- **3 Gallery Photos** (Optional)
- **Max 5MB** per image
- **Formats:** JPEG, PNG, WebP

---

## 📸 **How It Works**

### **Step 4 in Business Onboarding:**

#### **Profile Picture Section:**
```
┌─────────────────────────────────────┐
│  Profile Picture (Required)         │
│  ─────────────────────────────────  │
│  [Upload drag & drop area]          │
│  "Upload Profile Picture"            │
│  "Choose Image" button               │
│                                      │
│  OR if uploaded:                     │
│  [Preview image with "Remove" btn]  │
│  Green badge: "Profile Picture"     │
└─────────────────────────────────────┘
```

#### **Gallery Photos Section:**
```
┌─────────────────────────────────────┐
│  Gallery Photos (Optional - Max 3)  │
│  Add up to 3 photos (0/3)           │
│  ─────────────────────────────────  │
│  [Upload area - if < 3 photos]      │
│  "X slot(s) remaining"               │
│  "Choose Images" button              │
│                                      │
│  Grid of uploaded photos:           │
│  [Photo 1] [Photo 2] [Photo 3]     │
│   Remove     Remove     Remove       │
└─────────────────────────────────────┘
```

---

## 🎯 **User Experience**

### **Uploading Profile Picture:**
1. Click "Choose Image"
2. Select 1 image file
3. Preview appears
4. Can click "Remove" to change it
5. Required to proceed

### **Uploading Gallery Photos:**
1. Click "Choose Images" 
2. Select 1-3 images at once
3. Previews appear in grid
4. Counter shows "X/3"
5. Can remove individual photos
6. Upload button disappears when 3 photos reached
7. Optional - can skip

### **Validation:**
- ✅ File size ≤ 5MB
- ✅ Only image types (JPEG, PNG, WebP)
- ✅ Profile picture required
- ✅ Gallery max 3 photos
- ✅ Toast error if validation fails

---

## 💾 **Storage Logic**

### **When User Submits:**
1. Profile image uploaded first
2. Gallery images uploaded next
3. All stored in Supabase Storage
4. Database updated:
   - `profile_image` = Profile picture URL
   - `images` = Array of all image URLs [profile, ...gallery]

### **Database Fields:**
```sql
profile_image VARCHAR(500)  -- Main profile picture
images TEXT[]               -- Array: [profile_url, gallery1, gallery2, gallery3]
```

---

## 🎨 **Visual Indicators**

### **Profile Picture:**
- Green badge: "Profile Picture"
- Large preview (64px height)
- Remove button (top-right)

### **Gallery Photos:**
- Blue badge: "Photo 1", "Photo 2", "Photo 3"
- 3-column grid
- Individual remove buttons
- Counter: "(2/3 uploaded)"

---

## 📋 **Review Step (Step 6)**

Shows summary:
```
Profile Picture: ✅ Uploaded
Gallery Photos: 2/3 uploaded
```

---

## 🔧 **Files Updated**

- ✅ `components/enhanced-business-onboarding.tsx` - Main form
  - Separate `profileImage` and `galleryImages` state
  - Separate handlers for each
  - Limit to 3 gallery photos
  - Updated UI with 2 cards

- ✅ `lib/image-upload.ts` - Upload utility (already existed)
  - Handles file uploads to Supabase
  - Validates file size & format

---

## ✨ **Key Features**

1. **Separate Upload Areas** - Clear distinction between profile vs gallery
2. **Visual Feedback** - Shows count: "(2/3)"
3. **Image Previews** - See what you're uploading
4. **Easy Removal** - Click X to remove any image
5. **Validation** - Prevents invalid files
6. **Smart Limits** - Upload button disappears at max

---

## 🚀 **Usage**

Business owners can now:
1. Upload 1 profile picture (required)
2. Upload up to 3 additional photos (optional)
3. Preview all images before submitting
4. Remove/change any image
5. See exactly how many slots remain

Perfect for healthcare professionals to showcase their practice! 📸

