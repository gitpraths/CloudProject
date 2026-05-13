# Frontend API Integration Changes

## Summary
Added two new API functions to integrate the plagiarism detection backend with the frontend.

## Changes Made

### File: `frontend/src/lib/api.ts`

Added two new functions after the existing `reviewCode()` function:

#### 1. `analyzePlagiarism(assignmentId: string)`
- **Purpose**: Fetch similarity matrix and flagged pairs for an assignment
- **Endpoint**: `GET /api/plagiarism/analyze/{assignment_id}`
- **Returns**: 
  ```typescript
  {
    success: boolean,
    assignment_id: string,
    similarity_matrix: {
      [studentId: string]: {
        [studentId: string]: number  // 0-100
      }
    },
    flagged_pairs: Array<{
      id: string,
      studentA: string,
      studentB: string,
      similarity: number,  // 0-100
      filesMatched: number
    }>,
    statistics: {...},
    total_submissions: number
  }
  ```

#### 2. `getDetailedComparison(fileId1: string, fileId2: string)`
- **Purpose**: Get side-by-side code comparison with highlighted matching lines
- **Endpoint**: `GET /api/plagiarism/compare-detailed/{file_id_1}/{file_id_2}`
- **Returns**:
  ```typescript
  {
    success: boolean,
    studentA: string,
    studentB: string,
    similarity: number,  // 0-100
    codeA: Array<{
      lineNumber: number,
      content: string,
      isMatched: boolean
    }>,
    codeB: Array<{...}>,
    fileA: {
      name: string,
      path: string
    },
    fileB: {
      name: string,
      path: string
    }
  }
  ```

## How Frontend Pages Should Use These

### Plagiarism Matrix Page (`/assignments/[id]/plagiarism/page.tsx`)

Replace mock data with real API calls:

```typescript
// At component mount or when assignment loads
const [similarityData, setSimilarityData] = useState<SimilarityData>({});
const [flaggedPairs, setFlaggedPairs] = useState<FlaggedPair[]>([]);

useEffect(() => {
  async function loadPlagiarismData() {
    try {
      const result = await analyzePlagiarism(params.id);
      setSimilarityData(result.similarity_matrix);
      setFlaggedPairs(result.flagged_pairs);
    } catch (error) {
      console.error('Failed to load plagiarism data:', error);
    }
  }
  loadPlagiarismData();
}, [params.id]);
```

### Detailed Comparison Page (`/assignments/[id]/plagiarism/[pairId]/page.tsx`)

Replace mock code with real API calls:

```typescript
const [codeA, setCodeA] = useState<CodeLine[]>([]);
const [codeB, setCodeB] = useState<CodeLine[]>([]);
const [similarity, setSimilarity] = useState(0);

useEffect(() => {
  async function loadComparison() {
    try {
      const [studentA, studentB] = params.pairId.split('-vs-');
      const result = await getDetailedComparison(studentA, studentB);
      setCodeA(result.codeA);
      setCodeB(result.codeB);
      setSimilarity(result.similarity);
    } catch (error) {
      console.error('Failed to load comparison:', error);
    }
  }
  loadComparison();
}, [params.pairId]);
```

## Testing Checklist

- [ ] Backend server running on `http://localhost:8000`
- [ ] Frontend can fetch plagiarism analysis for an assignment
- [ ] Similarity matrix displays correctly with real data
- [ ] Flagged pairs table shows real flagged submissions
- [ ] Clicking on a high-similarity cell navigates to detailed comparison
- [ ] Detailed comparison page shows highlighted matching lines
- [ ] Error handling works when backend is unavailable

## Notes

- **No breaking changes**: All existing API functions remain unchanged
- **Backward compatible**: Old `compareFiles()` function still works
- **Mock data**: Frontend pages currently use mock data - they need to be updated to call these new functions
- **Error handling**: Both functions throw errors that can be caught with try/catch
- **Base URL**: Uses `http://localhost:8000` - update if backend runs on different port

## Next Steps

The frontend pages (`page.tsx` files) still use mock data. To complete the integration:

1. Update `/assignments/[id]/plagiarism/page.tsx` to call `analyzePlagiarism()`
2. Update `/assignments/[id]/plagiarism/[pairId]/page.tsx` to call `getDetailedComparison()`
3. Add loading states and error handling
4. Test end-to-end flow: upload → analyze → view matrix → click pair → see diff
