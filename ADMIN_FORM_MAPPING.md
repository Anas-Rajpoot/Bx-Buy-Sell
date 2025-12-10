# Admin Dashboard ↔ Form Listing Dashboard Mapping

## Overview
This document maps how admin-created questions in the Admin Dashboard appear dynamically in the Form Listing Dashboard.

---

## Current Mapping Structure

### ✅ **Already Dynamic** (Working as Expected)

| Admin Tab | Form Tab | `answer_for` Value | Status |
|-----------|----------|-------------------|--------|
| **Additional Infos → Statistics** | Statistics | `STATISTIC` | ✅ Dynamic |
| **Additional Infos → Products** | Products | `PRODUCT` | ✅ Dynamic |
| **Additional Infos → Management** | Management | `MANAGEMENT` | ✅ Dynamic |
| **Ad Informations** | Ad Informations | `ADVERTISMENT` | ✅ Dynamic |
| **Handover** | Handover | `HANDOVER` | ✅ Dynamic |

---

### ⚠️ **Needs Update** (Admin Can Create Questions, But Form Uses Static Fields)

| Admin Tab | Form Tab | `answer_for` Value | Current Status | Action Needed |
|-----------|----------|-------------------|----------------|--------------|
| **Brand Information** | Brand Information | `BRAND` | ❌ Static Form | Convert to dynamic questions |

---

### ❌ **Missing** (No Admin Questions Tab Yet)

| Admin Tab | Form Tab | `answer_for` Value | Current Status | Action Needed |
|-----------|----------|-------------------|----------------|--------------|
| **Category** | Category | `CATEGORY` | ❌ Static (Category Selection) | Keep as-is (category selection is different) |
| **Tools** | Tools | `TOOL` | ❌ Static (Tool Selection) | Keep as-is (tool selection is different) |
| **Financials** | Financials | `FINANCIAL` | ❌ Static Form | Add admin questions tab + convert form |
| **Additional Information** | Additional Information | `ADDITIONAL_INFO` | ❌ Static Form | Already covered by Statistics/Products/Management |
| **Accounts** | Accounts | `ACCOUNT` | ❌ Static Form | Add admin questions tab + convert form |
| **Packages** | Packages | `PACKAGE` | ❌ Static (Package Selection) | Keep as-is (package selection is different) |

---

## Detailed Tab-by-Tab Analysis

### 1. **Category Tab**
- **Admin**: Manages categories (CRUD operations)
- **Form**: Category selection (grid of categories)
- **Status**: ✅ **Keep Static** - This is a selection interface, not a question form
- **Note**: Categories are managed separately, users select from available categories

---

### 2. **Brand Information Tab**
- **Admin**: Can create questions with `answer_for: "BRAND"`
- **Form**: Currently uses **static form** (brandName, website, foundedYear, location)
- **Status**: ⚠️ **Needs Update**
- **Action Required**: 
  - Update `BrandInformationStep.tsx` to fetch and display dynamic questions
  - Use `useBrandQuestions()` hook (already exists)
  - Remove static form fields
  - Use same `renderField()` pattern as Statistics/Products/Management steps

---

### 3. **Tools Tab**
- **Admin**: Manages tools (CRUD operations)
- **Form**: Tool selection (grid of tools) + Data Integrations
- **Status**: ✅ **Keep Static** - This is a selection interface, not a question form
- **Note**: Tools are managed separately, users select from available tools

---

### 4. **Financials Tab**
- **Admin**: Currently **NO questions tab** exists
- **Form**: Static form (Monthly/Yearly toggle + financial data table)
- **Status**: ❌ **Needs Implementation**
- **Action Required**:
  1. Add "Financials" questions section in Admin Dashboard
  2. Create hook: `useFinancialQuestions()` filtering by `answer_for: "FINANCIAL"`
  3. Update `FinancialsStep.tsx` to use dynamic questions
  4. Consider keeping the financial data table as additional fields if needed

---

### 5. **Additional Information Tab**
- **Admin**: Has 3 sub-tabs (Statistics, Products, Management)
- **Form**: Has static form with 3 sub-tabs (Statistics, Products, Management)
- **Status**: ⚠️ **Partially Dynamic**
- **Current State**:
  - Statistics sub-tab: ✅ Dynamic (uses questions)
  - Products sub-tab: ✅ Dynamic (uses questions)
  - Management sub-tab: ✅ Dynamic (uses questions)
  - **BUT**: There's also a separate "Additional Information" step with static fields
- **Action Required**: 
  - Remove static "Additional Information" step or merge it
  - The Statistics/Products/Management steps already handle this

---

### 6. **Statistics Tab** (Under Additional Infos)
- **Admin**: Additional Infos → Statistics tab
- **Form**: Statistics step
- **Status**: ✅ **Already Dynamic**
- **Implementation**: Uses `useStatisticQuestions()` hook, filters by `answer_for: "STATISTIC"`

---

### 7. **Products Tab** (Under Additional Infos)
- **Admin**: Additional Infos → Products tab
- **Form**: Products step
- **Status**: ✅ **Already Dynamic**
- **Implementation**: Uses `useProductQuestions()` hook, filters by `answer_for: "PRODUCT"`

---

### 8. **Management Tab** (Under Additional Infos)
- **Admin**: Additional Infos → Management tab
- **Form**: Management step
- **Status**: ✅ **Already Dynamic**
- **Implementation**: Uses `useManagementQuestions()` hook, filters by `answer_for: "MANAGEMENT"`

---

### 9. **Accounts Tab**
- **Admin**: Currently **NO questions tab** exists (only manages social_accounts table)
- **Form**: Static form (Facebook, Instagram, Twitter, Pinterest, TikTok with URL + Followers)
- **Status**: ❌ **Needs Implementation**
- **Action Required**:
  1. Add "Accounts" questions section in Admin Dashboard
  2. Create hook: `useAccountQuestions()` filtering by `answer_for: "ACCOUNT"`
  3. Update `AccountsStep.tsx` to use dynamic questions
  4. Consider keeping social media fields as additional fields if needed

---

### 10. **Ad Informations Tab**
- **Admin**: Can create questions with `answer_for: "ADVERTISMENT"`
- **Form**: Dynamic questions with special field types (PHOTO_UPLOAD, FILE_UPLOAD)
- **Status**: ✅ **Already Dynamic**
- **Implementation**: Uses `useAdInformationQuestions()` hook, supports special upload types

---

### 11. **Handover Tab**
- **Admin**: Can create questions with `answer_for: "HANDOVER"`
- **Form**: Dynamic questions with special field types (CHECKBOX_GROUP, YES_NO, TWO_OPTIONS)
- **Status**: ✅ **Already Dynamic**
- **Implementation**: Uses `useHandoverQuestions()` hook, supports special field types

---

### 12. **Packages Tab**
- **Admin**: Currently **NO questions tab** exists
- **Form**: Package selection (Premium $299, Standard $99)
- **Status**: ✅ **Keep Static** - This is a selection interface, not a question form
- **Note**: Package selection is a pricing/feature choice, not a question form

---

## Implementation Priority

### High Priority (Core Functionality)
1. ✅ **Brand Information** - Convert to dynamic questions (admin already has questions tab)
2. ✅ **Financials** - Add admin questions tab + convert form to dynamic
3. ✅ **Accounts** - Add admin questions tab + convert form to dynamic

### Medium Priority (Cleanup)
4. ✅ **Additional Information** - Remove duplicate static form (already handled by Statistics/Products/Management)

### Low Priority (Keep Static)
- Category - Selection interface
- Tools - Selection interface  
- Packages - Selection interface

---

## Question Field Types Supported

The dynamic question system supports these `answer_type` values:

| Field Type | Description | Used In |
|------------|-------------|---------|
| `TEXT` | Text input | Statistics, Products, Management, Ad Informations |
| `NUMBER` | Number input | Statistics, Products, Management, Ad Informations, Handover |
| `TEXTAREA` | Multi-line text | Statistics, Products, Management, Ad Informations, Handover |
| `DATE` | Date picker | Statistics, Products, Management |
| `YESNO` | Yes/No dropdown | Statistics, Products, Management |
| `YES_NO` | Yes/No buttons | Handover |
| `SELECT` | Dropdown with options | Statistics, Products, Management |
| `CHECKBOX_GROUP` | Multi-select checkboxes | Handover |
| `TWO_OPTIONS` | Two option buttons | Handover |
| `PHOTO_UPLOAD` | Image upload (max 5MB) | Ad Informations |
| `FILE_UPLOAD` | Multiple file uploads (max 10MB) | Ad Informations |

---

## Data Flow

```
Admin Dashboard
    ↓ (Creates Question)
    POST /question-admin
    {
      question: "What is your brand name?",
      answer_type: "TEXT",
      answer_for: "BRAND",
      option: []
    }
    ↓ (Stored in Database)
    
Form Listing Dashboard
    ↓ (Fetches Questions)
    GET /question-admin
    ↓ (Filters by answer_for)
    useBrandQuestions() → filters answer_for === "BRAND"
    ↓ (Renders Dynamic Form)
    BrandInformationStep → renders questions dynamically
    ↓ (User Fills Form)
    { [questionId]: answer }
    ↓ (Submits with Listing)
    POST /listing → includes all question answers
```

---

## Files That Need Updates

### 1. Brand Information (High Priority)
- ✅ Hook exists: `src/hooks/useBrandQuestions.ts`
- ❌ Update: `src/components/dashboard/steps/BrandInformationStep.tsx`
  - Remove static form
  - Add dynamic question rendering (similar to StatisticsStep)

### 2. Financials (High Priority)
- ❌ Create hook: `src/hooks/useFinancialQuestions.ts`
- ❌ Add admin tab: `src/pages/admin/AdminContentManagement.tsx` (add Financials questions section)
- ❌ Update: `src/components/dashboard/steps/FinancialsStep.tsx`
  - Convert to dynamic questions

### 3. Accounts (High Priority)
- ❌ Create hook: `src/hooks/useAccountQuestions.ts`
- ❌ Add admin tab: `src/pages/admin/AdminContentManagement.tsx` (add Accounts questions section)
- ❌ Update: `src/components/dashboard/steps/AccountsStep.tsx`
  - Convert to dynamic questions

### 4. Additional Information (Cleanup)
- ❌ Review: `src/components/dashboard/steps/AdditionalInformationStep.tsx`
  - Consider removing or merging with Statistics/Products/Management steps

---

## Summary

**Current State:**
- ✅ 5 tabs already dynamic (Statistics, Products, Management, Ad Informations, Handover)
- ⚠️ 1 tab has admin questions but form is static (Brand Information)
- ❌ 2 tabs need admin questions + form conversion (Financials, Accounts)
- ✅ 3 tabs should stay static (Category, Tools, Packages - selection interfaces)

**Target State:**
- All question-based tabs should be dynamic
- Selection-based tabs (Category, Tools, Packages) remain static
- Admin can fully control all question forms through admin dashboard

