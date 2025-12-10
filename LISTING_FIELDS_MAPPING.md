# 📋 Listing Fields Mapping - Admin vs Public View

## 🔍 Fields Shown in Admin Listing Detail Page

### **1. Header Card**
- ✅ Category (from `listing.category`)
- ✅ Title (from `listing.brand` - business name question)
- ✅ Location (from `listing.brand` - country/location question)
- ✅ Business Age (from `listing.brand` or `listing.statistics`)
- ✅ Monthly Profit (from `listing.financials` - calculated)
- ✅ Price (from `listing.brand` - asking price question)
- ✅ Seller Info (from `listing.profile`)

### **2. Main Image**
- ✅ Image (from `listing.brand` - businessPhoto or logo)
- ✅ Managed by EX badge (from `listing.managed_by_ex`)

### **3. Description**
- ✅ Description (from `listing.advertisement` - description field)
- ✅ Intro (from `listing.advertisement` - intro field)
- ✅ USP (from `listing.advertisement` - usp field)

### **4. General Info**
- ✅ Location (from `listing.brand` - country)
- ✅ Business Age (from `listing.brand` or `listing.statistics`)
- ⚠️ Heading (CAC) - **MISSING** (needs to be extracted from statistics)
- ⚠️ Traffic Margin - **MISSING** (needs to be extracted from statistics)
- ⚠️ Stock Margin - **MISSING** (needs to be extracted from statistics)
- ✅ Profit Margin (from `listing.financials` - calculated)

### **5. Profit & Loss Table**
- ✅ Gross Revenue (from `listing.financials` - revenue_amount by period)
- ✅ Net Revenue (from `listing.financials` - revenue_amount by period)
- ✅ Cost of Goods (from `listing.financials` - annual_cost)
- ✅ Net Profit (from `listing.financials` - net_profit by period)

### **6. Statistics**
- ⚠️ Conversion Rate - **MISSING** (needs to be extracted from `listing.statistics`)
- ⚠️ Ref per Know - **MISSING** (needs to be extracted from `listing.statistics`)
- ⚠️ Returning customers - **MISSING** (needs to be extracted from `listing.statistics`)
- ⚠️ E-Mail Subscribers - **MISSING** (needs to be extracted from `listing.statistics`)
- ⚠️ Average order value - **MISSING** (needs to be extracted from `listing.statistics`)
- ⚠️ Customer base - **MISSING** (needs to be extracted from `listing.statistics`)

### **7. Management**
- ⚠️ Team members - **MISSING** (needs to be extracted from `listing.managementQuestion`)
- ⚠️ Time commitment - **MISSING** (needs to be extracted from `listing.managementQuestion`)
- ⚠️ COO commitment over week - **MISSING** (needs to be extracted from `listing.managementQuestion`)

### **8. Products**
- ⚠️ Number Shop products - **MISSING** (needs to be extracted from `listing.productQuestion`)
- ⚠️ Selling Model - **MISSING** (needs to be extracted from `listing.productQuestion`)
- ⚠️ Seller has inventory? - **MISSING** (needs to be extracted from `listing.productQuestion`)
- ⚠️ How much? - **MISSING** (needs to be extracted from `listing.productQuestion`)
- ⚠️ Is it included in the price? - **MISSING** (needs to be extracted from `listing.productQuestion`)

### **9. Handover**
- ⚠️ Assets included in the Sale - **MISSING** (needs to be extracted from `listing.handover`)
- ⚠️ Length of buyer sales - **MISSING** (needs to be extracted from `listing.handover`)
- ⚠️ Seller will hire (how business)? - **MISSING** (needs to be extracted from `listing.handover`)
- ⚠️ Time commitment from!? - **MISSING** (needs to be extracted from `listing.handover`)
- ⚠️ Post sales support - **MISSING** (needs to be extracted from `listing.handover`)
- ⚠️ Post purchase Support duration - **MISSING** (needs to be extracted from `listing.handover`)

### **10. Social Media**
- ⚠️ Instagram - **MISSING** (needs to be extracted from `listing.social_account`)
- ⚠️ X (Twitter) - **MISSING** (needs to be extracted from `listing.social_account`)
- ⚠️ TikTok - **MISSING** (needs to be extracted from `listing.social_account`)
- ⚠️ Facebook - **MISSING** (needs to be extracted from `listing.social_account`)
- ⚠️ Other platforms - **MISSING** (needs to be extracted from `listing.social_account`)

### **11. Attachments**
- ⚠️ Files/Photos - **MISSING** (needs to be extracted from `listing.advertisement` - attachments field)

### **12. Tools**
- ⚠️ Tools used - **MISSING** (needs to be extracted from `listing.tools`)

### **13. Status Sidebar**
- ✅ Current Status (from `listing.status`)
- ✅ Created Date (from `listing.created_at`)
- ✅ Last Updated (from `listing.updated_at`)
- ⚠️ Requests - **MISSING** (needs backend count)
- ⚠️ Unread Messages - **MISSING** (needs backend count)

---

## 📊 Summary

### **Fields Currently Shown in Public View:**
- ✅ Category
- ✅ Title
- ✅ Location
- ✅ Business Age (hardcoded)
- ✅ Price
- ✅ Seller Info
- ✅ Image
- ✅ Description
- ✅ Revenue (basic)
- ✅ Net Profit (basic)

### **Fields Missing in Public View:**
- ❌ Full Financials Table (Profit & Loss by year)
- ❌ Statistics (Conversion Rate, Refund Rate, Returning customers, etc.)
- ❌ Management Details (Team members, Time commitment, etc.)
- ❌ Products Details (Number of products, Selling model, Inventory, etc.)
- ❌ Handover Details (Assets, Support duration, etc.)
- ❌ Social Media Accounts
- ❌ Attachments/Files
- ❌ Tools Used
- ❌ Full Advertisement fields (Intro, USP, etc.)
- ❌ Portfolio Link
- ❌ Requests count
- ❌ Unread Messages count

---

## 🎯 Action Required

Update `src/pages/ListingDetail.tsx` to:
1. Extract all fields from question arrays (statistics, managementQuestion, productQuestion, handover, social_account, advertisement)
2. Display Profit & Loss table with actual financial data
3. Display all Statistics metrics
4. Display Management details
5. Display Products details
6. Display Handover details
7. Display Social Media accounts
8. Display Attachments
9. Display Tools used
10. Match the exact layout and structure of AdminListingDetails

---

**End of Mapping**

