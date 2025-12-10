# API Integration Summary - Complete Mapping

## ✅ Completed Implementation

All tabs in the Admin Dashboard and Form Listing Dashboard are now connected through the API.

---

## API Endpoints Used

### Question Admin API (`/question-admin`)
- ✅ `GET /question-admin` - Get all questions
- ✅ `GET /question-admin/type/:type` - Get questions by type (NEW - Optimized)
- ✅ `GET /question-admin/:id` - Get single question
- ✅ `POST /question-admin` - Create question
- ✅ `PATCH /question-admin/:id` - Update question
- ✅ `DELETE /question-admin/:id` - Delete question

**Question Types (`answer_for` field):**
- `BRAND` - Brand Information
- `STATISTIC` - Statistics
- `PRODUCT` - Products
- `MANAGEMENT` - Management
- `ADVERTISMENT` - Ad Informations
- `HANDOVER` - Handover
- `FINANCIAL` - Financials (NEW)
- `ACCOUNT` - Accounts (NEW)

---

## Admin Dashboard ↔ Form Dashboard Mapping

| Admin Tab | Form Tab | `answer_for` | Status |
|-----------|----------|--------------|--------|
| **Category** | Category | N/A | ✅ Static (Selection) |
| **Brand Information** | Brand Information | `BRAND` | ✅ **NOW DYNAMIC** |
| **Tools** | Tools | N/A | ✅ Static (Selection) |
| **Financials** | Financials | `FINANCIAL` | ✅ **NOW DYNAMIC** |
| **Additional Infos → Statistics** | Statistics | `STATISTIC` | ✅ Dynamic |
| **Additional Infos → Products** | Products | `PRODUCT` | ✅ Dynamic |
| **Additional Infos → Management** | Management | `MANAGEMENT` | ✅ Dynamic |
| **Accounts** | Accounts | `ACCOUNT` | ✅ **NOW DYNAMIC** |
| **Ad Informations** | Ad Informations | `ADVERTISMENT` | ✅ Dynamic |
| **Handover** | Handover | `HANDOVER` | ✅ Dynamic |
| **Packages** | Packages | N/A | ✅ Static (Selection) |

---

## Files Created/Updated

### ✅ API Client (`src/lib/api.ts`)
- Added `getAdminQuestionsByType(type: string)` method
- Uses optimized endpoint: `/question-admin/type/:type`

### ✅ New Hooks Created
1. `src/hooks/useFinancialQuestions.ts` - Fetches FINANCIAL questions
2. `src/hooks/useAccountQuestions.ts` - Fetches ACCOUNT questions
3. `src/hooks/useAddFinancialQuestion.ts` - Creates FINANCIAL questions
4. `src/hooks/useAddAccountQuestion.ts` - Creates ACCOUNT questions

### ✅ Updated Hooks (Optimized)
All question hooks now use `/question-admin/type/:type` instead of filtering:
- `src/hooks/useBrandQuestions.ts` ✅
- `src/hooks/useStatisticQuestions.ts` ✅
- `src/hooks/useProductQuestions.ts` ✅
- `src/hooks/useManagementQuestions.ts` ✅
- `src/hooks/useAdInformationQuestions.ts` ✅
- `src/hooks/useHandoverQuestions.ts` ✅

### ✅ Form Steps Updated
1. `src/components/dashboard/steps/BrandInformationStep.tsx` - Now dynamic
2. `src/components/dashboard/steps/FinancialsStep.tsx` - Now dynamic
3. `src/components/dashboard/steps/AccountsStep.tsx` - Now dynamic

### ✅ Admin Dashboard Components
1. `src/components/admin/content/AddFinancialQuestionDialog.tsx` - NEW
2. `src/components/admin/content/AddAccountQuestionDialog.tsx` - NEW
3. `src/pages/admin/AdminContentManagement.tsx` - Updated with Financials & Accounts sections

---

## How It Works

### Flow Diagram
```
Admin Dashboard
    ↓
Creates Question (POST /question-admin)
    {
      question: "What is your revenue?",
      answer_type: "NUMBER",
      answer_for: "FINANCIAL"
    }
    ↓
Stored in Database
    ↓
Form Listing Dashboard
    ↓
Fetches Questions (GET /question-admin/type/FINANCIAL)
    ↓
Renders Dynamic Form Fields
    ↓
User Fills Form
    ↓
Submits with Listing (POST /listing)
```

---

## Supported Field Types

All dynamic question forms support these `answer_type` values:

| Type | Description | Used In |
|------|-------------|---------|
| `TEXT` | Single-line text input | All tabs |
| `NUMBER` | Number input | All tabs |
| `TEXTAREA` | Multi-line text | All tabs |
| `DATE` | Date picker | All tabs |
| `YESNO` | Yes/No dropdown | All tabs |
| `SELECT` | Dropdown with options | All tabs |
| `PHOTO_UPLOAD` | Image upload (max 5MB) | Ad Informations |
| `FILE_UPLOAD` | File upload (max 10MB) | Ad Informations |
| `CHECKBOX_GROUP` | Multi-select checkboxes | Handover |
| `YES_NO` | Yes/No buttons | Handover |
| `TWO_OPTIONS` | Two option buttons | Handover |

---

## Testing Checklist

### Admin Dashboard
- [ ] Create Brand Information question → Should appear in Brand Information tab
- [ ] Create Financial question → Should appear in Financials tab
- [ ] Create Account question → Should appear in Accounts tab
- [ ] Edit/Delete questions → Should work correctly

### Form Listing Dashboard
- [ ] Brand Information step → Should show dynamic questions
- [ ] Financials step → Should show dynamic questions
- [ ] Accounts step → Should show dynamic questions
- [ ] All other steps → Should continue working as before

### API
- [ ] Verify bearer token is being sent correctly
- [ ] Test `/question-admin/type/:type` endpoint
- [ ] Verify question creation with correct `answer_for` values

---

## Next Steps (Optional Enhancements)

1. **Add Edit/Delete for Financial & Account Questions**
   - Create `EditFinancialQuestionDialog.tsx`
   - Create `DeleteFinancialQuestionDialog.tsx`
   - Create `EditAccountQuestionDialog.tsx`
   - Create `DeleteAccountQuestionDialog.tsx`
   - Add corresponding hooks

2. **Add Option Support for SELECT Types**
   - Update dialogs to allow adding options for SELECT type questions
   - Store options in `option` array field

3. **Add Validation**
   - Add required field validation
   - Add format validation (email, URL, etc.)

4. **Add Question Ordering**
   - Allow admins to reorder questions
   - Store order in database

---

## Notes

- All question types use the same API endpoint (`/question-admin`)
- Questions are differentiated by the `answer_for` field
- The optimized `/question-admin/type/:type` endpoint reduces data transfer
- Social Media Accounts (Facebook, Instagram, etc.) remain separate from Account Questions
- Category, Tools, and Packages remain static selection interfaces (not question-based)

---

## API Base URL

Current configuration:
- Base URL: `http://173.212.225.22:1230` (or from `VITE_API_BASE_URL`)
- Proxy: All requests go through Supabase Edge Function `proxy-api`
- Authentication: Bearer token in `Authorization` header

**Note**: If bearer token is needed for testing, please provide it and I can help configure it in the frontend.

