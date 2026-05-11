# Team Distribution Plan — Code Review & Plagiarism Detection System

## Team Structure & Responsibilities

### **Person 1: Backend Infrastructure & Orchestration Lead**
**Primary Focus**: FastAPI backend, GCP services setup, deployment pipeline, async orchestration

### **Person 2: Frontend & Dashboard Lead**
**Primary Focus**: React/Next.js dashboard, API integration, user experience

### **Person 3: Plagiarism Engine & ML Lead**
**Primary Focus**: Tree-sitter AST parsing, TF-IDF similarity, algorithm optimization

### **Person 4: AI Integration & Data Pipeline Lead**
**Primary Focus**: Vertex AI integration, BigQuery schema, data validation

---

## Integration Contracts (CRITICAL — Read First)

### 🔒 Non-Negotiable Rules
1. **Single Source of Truth**: `contracts/openapi.yaml` — all API changes must update this first
2. **Correlation IDs**: Every request includes `X-Request-Id` header; every response/error returns it
3. **Fixed Response Schemas**: AI and plagiarism results follow frozen JSON schemas (see below)
4. **Weekly Integration Captain**: Rotates weekly, owns staging health and end-to-end demos
5. **No "Component Complete"**: Every stage ends with a working end-to-end flow

### 📋 Frozen JSON Schemas

#### Submission Response
```json
{
  "submission_id": "uuid",
  "assignment_id": "string",
  "student_id": "string",
  "status": "uploaded|analyzing|analyzed|failed",
  "created_at": "ISO8601",
  "error_message": "string|null"
}
```

#### Similarity Pair Response
```json
{
  "assignment_id": "string",
  "submission_a": "uuid",
  "submission_b": "uuid",
  "similarity_score": 0.0-1.0,
  "flagged": boolean,
  "created_at": "ISO8601",
  "evidence_snippets": "string|null"
}
```

#### AI Review Response
```json
{
  "submission_id": "uuid",
  "overall_score": 0-100,
  "complexity_rating": 1-10,
  "bugs": [{"line": int|null, "description": string, "severity": "low|med|high"}],
  "code_smells": [string],
  "suggestions": [string],
  "created_at": "ISO8601"
}
```

---

## Person 1: Backend Infrastructure & Orchestration Lead

### Stage 0: Foundation (Week 1)
**Deliverables**:
- GCP project setup with all services enabled
- Service accounts configured with least privilege
- GCS bucket created: `code-submissions-<project>` with versioning
- FastAPI skeleton with `/health` endpoint
- Dockerfile and Cloud Build pipeline
- Local dev environment documented

**Tasks**:
1. Create GCP project and enable: Cloud Run, Cloud Build, Artifact Registry, GCS, BigQuery, Vertex AI
2. Create service accounts:
   - `cloudrun-runtime-sa`: GCS + BigQuery + Vertex AI access
   - `cloudbuild-deployer-sa`: Cloud Run + Artifact Registry access
3. Create GCS bucket with object versioning enabled
4. Initialize FastAPI project:
   - Add logging with `X-Request-Id` support
   - Add CORS middleware for frontend
   - Implement `/health` endpoint
5. Create `backend/Dockerfile` (python:3.11-slim, port 8080)
6. Create `cloudbuild.yaml` for CI/CD
7. Document local dev setup in `README.md`

**Integration Points**:
- Provide Person 2 with `/health` endpoint URL for testing
- Share GCP project ID and service account details with Person 4

---

### Stage 1: Upload Pipeline (Week 1-2)
**Deliverables**:
- `POST /v1/submissions/upload` endpoint working
- `GET /v1/submissions` endpoint with filtering
- Files stored in GCS at correct paths
- Submission metadata in BigQuery

**Tasks**:
1. Implement upload endpoint:
   - Accept `multipart/form-data` (assignment_id, student_id, files[])
   - Validate file extensions: `py, java, cpp, c, h, js, ts, jsx, tsx`
   - Generate `submission_id = UUID4`
   - Upload to GCS: `submissions/{assignment_id}/{student_id}/{submission_id}/{filename}`
2. Work with Person 4 to write submission metadata to BigQuery
3. Implement `GET /v1/submissions?assignment_id=...` with pagination
4. Add error handling with correlation IDs
5. Update `openapi.yaml` with upload endpoints

**Integration Points**:
- Coordinate with Person 2 on multipart form data format
- Coordinate with Person 4 on BigQuery schema for `submissions` table
- Test upload flow end-to-end with Person 2

---

### Stage 2: Async Orchestration (Week 2-3)
**Deliverables**:
- Pub/Sub topic `submission-uploaded` configured
- Worker service for async processing
- Status tracking endpoints
- Event-driven analysis trigger

**Tasks**:
1. Create Pub/Sub topic `submission-uploaded`
2. Publish message on successful upload: `{submission_id, assignment_id, student_id, gcs_prefix}`
3. Create `plagiarism-worker` Cloud Run service:
   - Configure Pub/Sub push subscription
   - Implement message handler
4. Add status endpoints:
   - `POST /v1/analysis/run?assignment_id=...` (manual trigger)
   - `GET /v1/analysis/status?assignment_id=...`
5. Coordinate with Person 4 on status field updates in BigQuery

**Integration Points**:
- Provide Person 3 with worker invocation interface
- Coordinate with Person 2 on status polling mechanism
- Test async flow: upload → Pub/Sub → worker → status update

---

### Stage 5: Deployment & Production (Week 4-5)
**Deliverables**:
- Production Cloud Run deployment
- CI/CD pipeline fully automated
- Environment variables and secrets configured
- Staging environment for demos

**Tasks**:
1. Configure Cloud Run service:
   - `min-instances=1` (for demo), `max-instances=10`
   - Memory: 512Mi, CPU: 1
   - Environment variables: `GCS_BUCKET`, `BQ_DATASET`, `VERTEX_PROJECT`, `PUBSUB_TOPIC`
2. Set up Artifact Registry repository
3. Automate Cloud Build triggers on main branch
4. Configure FastAPI `/docs` (Swagger UI)
5. Set up budget alerts ($10/$20 thresholds)
6. Create staging deployment script

**Integration Points**:
- Provide Person 2 with production API URL
- Coordinate with all team members on environment variables
- Run end-to-end staging demo with entire team

---

## Person 2: Frontend & Dashboard Lead

### Stage 0: Frontend Foundation (Week 1)
**Deliverables**:
- React/Next.js project initialized
- API client setup with correlation ID support
- Basic layout and navigation
- Health check integration

**Tasks**:
1. Initialize frontend project (React/Next.js)
2. Set up API client:
   - Add `X-Request-Id` header to all requests
   - Add error handling that displays request IDs
3. Create basic layout with navigation
4. Implement health check display
5. Set up local dev environment (proxy to backend)
6. Document frontend setup in `README.md`

**Integration Points**:
- Test `/health` endpoint with Person 1
- Review `openapi.yaml` contract with Person 1

---

### Stage 1: Upload & Submissions Dashboard (Week 1-2)
**Deliverables**:
- Upload screen with drag-and-drop
- Submissions dashboard table
- Error handling with request IDs
- Real-time submission list

**Tasks**:
1. Build Upload Screen:
   - Drag-and-drop file upload
   - Input fields: assignment_id, student_id
   - File validation (extensions)
   - Upload progress indicator
2. Build Submissions Dashboard:
   - Table columns: submission_id, student_id, assignment_id, status, created_at
   - Filter by assignment_id
   - Pagination support
3. Add error UI showing `X-Request-Id` for debugging
4. Style with consistent design system

**Integration Points**:
- Test upload with Person 1's backend endpoint
- Verify files appear in GCS (coordinate with Person 1)
- Validate submission list data format

---

### Stage 2: Analysis Status & Polling (Week 2-3)
**Deliverables**:
- Analysis status display per submission
- "Trigger Analysis" button for instructors
- Auto-refresh during analysis
- Status transition animations

**Tasks**:
1. Add status badge component (uploaded/analyzing/analyzed/failed)
2. Implement "Trigger Analysis" button:
   - Call `POST /v1/analysis/run?assignment_id=...`
   - Show loading state
3. Add auto-refresh/polling:
   - Poll `GET /v1/analysis/status` every 5 seconds while analyzing
   - Stop polling when status is terminal (analyzed/failed)
4. Add error message display for failed analyses

**Integration Points**:
- Test status transitions with Person 1's orchestration
- Coordinate polling frequency to avoid rate limits

---

### Stage 3: Plagiarism Visualization (Week 3-4)
**Deliverables**:
- Similarity matrix view with color coding
- Ranked pairs table with sorting/filtering
- Side-by-side code comparison view
- Flagged submissions highlight

**Tasks**:
1. Build Similarity Matrix View:
   - Grid layout with student IDs on axes
   - Color coding: red (>0.80), amber (0.60-0.80), green (<0.60)
   - Click cell to view details
2. Build Ranked Pairs Table:
   - Columns: submission_a, submission_b, similarity_score, flagged
   - Sort by score (descending)
   - Filter by flagged status
3. Build Side-by-Side Comparison:
   - Split view with two code panels
   - File selector for multi-file submissions
   - Syntax highlighting
4. Add "Flagged" badge for high-similarity pairs

**Integration Points**:
- Test with Person 3's plagiarism results
- Validate similarity score ranges and flagged logic
- Review evidence snippets format with Person 3

---

### Stage 4: AI Review Panel (Week 4-5)
**Deliverables**:
- AI review display with collapsible sections
- "Generate Review" button
- Overall score and complexity rating display
- Bugs/code smells/suggestions rendering

**Tasks**:
1. Build AI Review Panel:
   - Collapsible sections: Bugs, Code Smells, Suggestions
   - Display `overall_score` (0-100) with progress bar
   - Display `complexity_rating` (1-10) with visual indicator
2. Render bugs with line numbers and severity badges
3. Add "Generate Review" button per submission
4. Add loading state during review generation
5. Cache and display existing reviews

**Integration Points**:
- Test with Person 4's AI review endpoint
- Validate JSON schema rendering
- Handle invalid/missing reviews gracefully

---

### Stage 5: Polish & Demo Readiness (Week 5)
**Deliverables**:
- Responsive design for demos
- Loading states and error boundaries
- Demo script and walkthrough
- Screenshots for report

**Tasks**:
1. Add loading skeletons for all async operations
2. Implement error boundaries for graceful failures
3. Optimize performance (lazy loading, code splitting)
4. Create demo script with test data
5. Take screenshots for project report
6. Test on multiple browsers

**Integration Points**:
- Run full end-to-end demo with entire team
- Coordinate demo data with Person 1

---

## Person 3: Plagiarism Engine & ML Lead

### Stage 0: Research & Setup (Week 1)
**Deliverables**:
- Tree-sitter library evaluation
- Language support plan (Python, JS/TS priority)
- AST normalization strategy document
- Local testing environment

**Tasks**:
1. Research tree-sitter bindings for Python
2. Test AST parsing for Python and JavaScript/TypeScript
3. Document normalization strategy:
   - Identifier replacement
   - Literal normalization
   - Comment/whitespace removal
4. Set up local testing with sample code files
5. Create test dataset with known similar/dissimilar pairs

**Integration Points**:
- Share normalization strategy with team for review
- Coordinate with Person 1 on worker interface

---

### Stage 3: Core Algorithm Implementation (Week 2-3)
**Deliverables**:
- Tree-sitter AST parser for Python + JS/TS
- AST normalization pipeline
- TF-IDF vectorization
- Cosine similarity computation
- Threshold-based flagging

**Tasks**:
1. Implement AST parsing:
   - Python parser using tree-sitter
   - JavaScript/TypeScript parser
   - Handle parse errors gracefully
2. Implement normalization:
   - Replace variable/function names with placeholders
   - Normalize string/number literals
   - Strip comments and whitespace
3. Build TF-IDF pipeline:
   - Use scikit-learn for vectorization
   - Compute per-assignment corpus
4. Implement pairwise similarity:
   - Cosine similarity between all pairs in assignment
   - Optimize: only compare within assignment
5. Apply flagging threshold (default: 0.80)
6. Generate evidence snippets (optional but recommended)

**Integration Points**:
- Coordinate with Person 4 on BigQuery schema for results
- Provide Person 1 with worker function interface
- Test with Person 2's UI for visualization

---

### Stage 3: Integration & Optimization (Week 3-4)
**Deliverables**:
- Worker integration with backend
- Performance optimization for large assignments
- Evidence generation for diff view
- Evaluation metrics

**Tasks**:
1. Integrate with Person 1's worker service:
   - Accept `{assignment_id, submission_id, gcs_prefix}` input
   - Fetch files from GCS
   - Return results to Person 4 for BigQuery storage
2. Optimize performance:
   - Cap file size (e.g., 100KB per file)
   - Batch processing for large assignments
   - Cache normalized ASTs
3. Generate evidence snippets:
   - Identify top matching code sections
   - Format for side-by-side display
4. Create evaluation dataset:
   - Known plagiarism cases
   - Known original submissions
   - Measure precision/recall

**Integration Points**:
- Test end-to-end: upload → analysis → results in UI
- Coordinate with Person 2 on evidence format
- Validate results with Person 4's BigQuery queries

---

### Stage 6: Hardening & Documentation (Week 5)
**Deliverables**:
- Algorithm documentation
- Performance benchmarks
- Threshold tuning guide
- False positive analysis

**Tasks**:
1. Document algorithm in detail:
   - AST normalization rules
   - TF-IDF parameters
   - Similarity threshold rationale
2. Run performance benchmarks:
   - Time complexity for N submissions
   - Memory usage
3. Analyze false positives/negatives
4. Create threshold tuning guide for instructors
5. Prepare algorithm section for project report

**Integration Points**:
- Share benchmarks with team for report
- Coordinate with Person 1 on production performance

---

## Person 4: AI Integration & Data Pipeline Lead

### Stage 0: BigQuery Schema Design (Week 1)
**Deliverables**:
- BigQuery dataset created
- All tables with schemas defined
- Partitioning strategy
- Access patterns documented

**Tasks**:
1. Create BigQuery dataset: `code_review`
2. Design and create tables:
   - `submissions`: submission_id (PK), assignment_id, student_id, gcs_prefix, status, created_at, error_message
   - `similarity_pairs`: assignment_id, submission_a, submission_b, similarity_score, flagged, created_at, evidence_snippets
   - `ai_reviews`: submission_id (PK), assignment_id, review_json, overall_score, complexity_rating, created_at, model_version, prompt_version
3. Add partitioning by `created_at` for cost optimization
4. Document query patterns and indexes
5. Set up BigQuery client library in backend

**Integration Points**:
- Share schema with Person 1 for backend integration
- Coordinate with Person 3 on similarity_pairs schema
- Review with entire team for feedback

---

### Stage 1: Submission Data Pipeline (Week 1-2)
**Deliverables**:
- Submission insert/update functions
- Query functions for submissions
- Status update mechanism
- Error handling

**Tasks**:
1. Implement BigQuery operations:
   - Insert submission metadata on upload
   - Update submission status (uploaded → analyzing → analyzed)
   - Query submissions by assignment_id
2. Add error handling and retries
3. Create helper functions for Person 1's backend:
   - `insert_submission(submission_data)`
   - `update_submission_status(submission_id, status)`
   - `get_submissions(assignment_id, filters)`
4. Add logging for all BigQuery operations

**Integration Points**:
- Integrate with Person 1's upload endpoint
- Test data flow: upload → BigQuery → query → frontend
- Validate with Person 2's dashboard queries

---

### Stage 3: Plagiarism Results Storage (Week 2-3)
**Deliverables**:
- Similarity pairs insert function
- Query functions for plagiarism results
- Matrix data aggregation
- Flagged pairs filtering

**Tasks**:
1. Implement plagiarism results storage:
   - Batch insert similarity pairs
   - Handle duplicate prevention
2. Create query functions:
   - `get_similarity_pairs(assignment_id, min_score, flagged_only)`
   - `get_similarity_matrix(assignment_id)` (aggregated view)
3. Add indexes for common queries
4. Implement evidence snippets storage

**Integration Points**:
- Coordinate with Person 3 on result format
- Provide query functions to Person 1's backend
- Test with Person 2's visualization components

---

### Stage 4: Vertex AI Integration (Week 3-4)
**Deliverables**:
- Vertex AI client setup
- Frozen JSON schema for reviews
- System prompt optimized for JSON output
- Review validation and storage
- Caching mechanism

**Tasks**:
1. Set up Vertex AI (Gemini Pro):
   - Enable API and configure service account
   - Test basic API calls
2. Design and freeze AI review JSON schema:
   ```json
   {
     "bugs": [{"line": int|null, "description": str, "severity": str}],
     "code_smells": [str],
     "suggestions": [str],
     "complexity_rating": 1-10,
     "overall_score": 0-100
   }
   ```
3. Write system prompt:
   - Force JSON-only output
   - Define review criteria
   - Include examples
4. Implement review generation:
   - Read code from GCS
   - Call Vertex AI with prompt
   - Validate JSON response with Pydantic
   - Handle invalid responses
5. Store reviews in BigQuery `ai_reviews`
6. Implement caching: check if review exists before generating
7. Add quota monitoring and rate limiting

**Integration Points**:
- Provide review function to Person 1's backend
- Test with Person 2's AI review panel
- Coordinate on error handling for invalid JSON

---

### Stage 4: Review Query & Validation (Week 4)
**Deliverables**:
- Review retrieval functions
- JSON schema validation
- Fallback handling for invalid reviews
- Review versioning

**Tasks**:
1. Implement review queries:
   - `get_review(submission_id)`
   - `get_reviews_by_assignment(assignment_id)`
2. Add Pydantic models for strict validation
3. Implement fallback for invalid JSON:
   - Return structured error
   - Log for debugging
4. Add versioning fields:
   - `model_version` (e.g., "gemini-pro-1.0")
   - `prompt_version` (e.g., "v1.2")
5. Create review regeneration function

**Integration Points**:
- Test with Person 2's frontend rendering
- Validate schema stability across prompt changes
- Coordinate with Person 1 on API endpoints

---

### Stage 6: Cost Optimization & Monitoring (Week 5)
**Deliverables**:
- BigQuery cost analysis
- Vertex AI quota monitoring
- Caching strategy
- Budget alerts

**Tasks**:
1. Analyze BigQuery costs:
   - Query cost estimation
   - Partition effectiveness
2. Set up Vertex AI monitoring:
   - Track API usage
   - Monitor quotas
   - Request quota increases if needed
3. Optimize caching:
   - Pre-cache demo submissions
   - Implement TTL for reviews
4. Set up budget alerts ($10/$20 thresholds)
5. Document cost optimization strategies

**Integration Points**:
- Share cost analysis with team for report
- Coordinate with Person 1 on production limits

---

## Weekly Integration Schedule

### Week 1: Foundation
- **Monday**: Kickoff meeting, assign roles, review contracts
- **Wednesday**: Stage 0 checkpoint — backend health check + frontend skeleton
- **Friday**: GCP setup complete, BigQuery schema reviewed

### Week 2: Upload Flow
- **Monday**: Stage 1 start — upload endpoint + frontend upload screen
- **Wednesday**: Upload integration test — files in GCS + BigQuery
- **Friday**: Stage 1 complete — end-to-end upload flow working

### Week 3: Async & Plagiarism
- **Monday**: Stage 2 start — Pub/Sub + worker setup
- **Wednesday**: Stage 3 start — plagiarism algorithm + status polling
- **Friday**: Stage 2+3 checkpoint — async analysis working, results in UI

### Week 4: AI & Visualization
- **Monday**: Stage 4 start — Vertex AI integration + review panel
- **Wednesday**: Plagiarism visualization complete + AI reviews rendering
- **Friday**: Stage 4 complete — full feature set working in staging

### Week 5: Deployment & Polish
- **Monday**: Stage 5 start — production deployment + CI/CD
- **Wednesday**: Stage 6 hardening — performance, cost, security
- **Friday**: Final demo rehearsal + staging validation

---

## Integration Captain Rotation

### Week 1: Person 1 (Backend Lead)
- Owns GCP setup and backend health
- Runs daily standup
- Validates Stage 0 completion

### Week 2: Person 2 (Frontend Lead)
- Owns upload flow integration
- Coordinates frontend-backend testing
- Validates Stage 1 completion

### Week 3: Person 3 (Plagiarism Lead)
- Owns async orchestration + algorithm integration
- Coordinates worker testing
- Validates Stage 2+3 completion

### Week 4: Person 4 (AI/Data Lead)
- Owns AI integration + data pipeline
- Coordinates BigQuery queries
- Validates Stage 4 completion

### Week 5: Person 1 (Backend Lead)
- Owns production deployment
- Coordinates final demo
- Validates Stage 5+6 completion

---

## Daily Standup Format (15 minutes)

Each person answers:
1. **Yesterday**: What did I complete?
2. **Today**: What am I working on?
3. **Blockers**: What's blocking me? (Integration Captain resolves)
4. **Integration needs**: What do I need from others today?

---

## Critical Success Factors

### ✅ Do This
- Update `openapi.yaml` BEFORE implementing endpoints
- Test integration points immediately after implementation
- Use correlation IDs in all requests for debugging
- Commit and push daily to avoid merge conflicts
- Run end-to-end tests before marking stages complete
- Document decisions in shared doc (e.g., Google Doc)

### ❌ Don't Do This
- Don't change response schemas without team agreement
- Don't skip integration checkpoints
- Don't work in isolation for more than 1 day
- Don't deploy to production without staging validation
- Don't add features outside the frozen scope
- Don't ignore errors or warnings in logs

---

## Communication Channels

### Slack/Discord Channels (Recommended)
- `#general`: Team coordination
- `#backend`: Person 1 + Person 4 coordination
- `#frontend`: Person 2 updates
- `#plagiarism`: Person 3 algorithm discussions
- `#integration`: Cross-team blockers and testing
- `#deployments`: Production/staging updates

### Meetings
- **Daily Standup**: 15 min, same time every day
- **Integration Review**: Wednesday + Friday, 30 min
- **Demo Rehearsal**: Friday Week 5, 1 hour

---

## Risk Mitigation

### Risk: Backend/Frontend schema mismatch
- **Mitigation**: Generate TypeScript types from `openapi.yaml` using tools like `openapi-typescript`
- **Owner**: Person 2 + Person 1

### Risk: Vertex AI quota limits
- **Mitigation**: Request quota increase early, implement caching, pre-cache demo data
- **Owner**: Person 4

### Risk: Plagiarism algorithm too slow
- **Mitigation**: Cap file sizes, optimize pairwise comparisons, use async processing
- **Owner**: Person 3

### Risk: Merge conflicts
- **Mitigation**: Work in separate directories, commit daily, use feature branches
- **Owner**: All

### Risk: GCP costs exceed budget
- **Mitigation**: Set budget alerts, monitor daily, optimize queries, use partitioning
- **Owner**: Person 1 + Person 4

---

## Final Deliverables Checklist

### Code & Deployment
- [ ] Backend deployed to Cloud Run with public URL
- [ ] Frontend deployed (Firebase Hosting or Cloud Run)
- [ ] CI/CD pipeline automated via Cloud Build
- [ ] All endpoints in `openapi.yaml` implemented
- [ ] Swagger UI accessible at `/docs`

### Features
- [ ] Upload flow: multi-file upload → GCS → BigQuery
- [ ] Plagiarism detection: AST + TF-IDF + similarity matrix
- [ ] AI code review: Vertex AI → structured JSON → UI
- [ ] Dashboard: submissions list, status, matrix, side-by-side, review panel

### Documentation
- [ ] Architecture diagram (GCP services + data flow)
- [ ] Sequence diagrams (upload, analysis, review)
- [ ] API documentation (Swagger + README)
- [ ] Algorithm documentation (plagiarism + AI)
- [ ] Cost analysis and budget report
- [ ] Demo script with screenshots

### Testing
- [ ] End-to-end demo flow working in staging
- [ ] Contract tests (FE/BE schema validation)
- [ ] Plagiarism algorithm evaluation (precision/recall)
- [ ] AI review schema validation
- [ ] Load testing (basic, 10+ concurrent uploads)

### Presentation
- [ ] Demo video or live demo ready
- [ ] Slides with architecture, features, results
- [ ] Cost breakdown and optimization strategies
- [ ] Rubric mapping (4+ GCP services, cloud-native, etc.)

---

## Emergency Contacts

- **GCP Issues**: Person 1 (Backend Lead)
- **Frontend Bugs**: Person 2 (Frontend Lead)
- **Algorithm Problems**: Person 3 (Plagiarism Lead)
- **Data/AI Issues**: Person 4 (AI/Data Lead)
- **Integration Blockers**: Current Integration Captain

---

## Success Metrics

- **Stage Completion**: All 6 stages completed on schedule
- **Integration Health**: Zero breaking changes after Stage 1
- **Demo Readiness**: Full end-to-end flow working 3 days before deadline
- **Code Quality**: All endpoints return valid JSON, no 500 errors in staging
- **Cost Control**: Total GCP spend under $50 for semester
- **Team Velocity**: Daily commits from all team members

---

## Appendix: Quick Reference

### GCP Services Used
- **Cloud Storage**: File uploads
- **BigQuery**: Metadata + results storage
- **Vertex AI**: AI code reviews
- **Cloud Run**: Backend + frontend hosting
- **Cloud Build**: CI/CD pipeline
- **Artifact Registry**: Docker images
- **Pub/Sub**: Async orchestration

### Key Endpoints
- `POST /v1/submissions/upload`
- `GET /v1/submissions?assignment_id=...`
- `POST /v1/analysis/run?assignment_id=...`
- `GET /v1/plagiarism/pairs?assignment_id=...`
- `POST /v1/review/{submission_id}`
- `GET /v1/review/{submission_id}`

### BigQuery Tables
- `submissions`: Upload metadata + status
- `similarity_pairs`: Plagiarism results
- `ai_reviews`: AI review JSON

### File Paths
- GCS: `submissions/{assignment_id}/{student_id}/{submission_id}/{filename}`
- Contracts: `contracts/openapi.yaml`
- Backend: `backend/` (FastAPI)
- Frontend: `frontend/` (React/Next)
- Infra: `infra/` (Cloud Build, Terraform)

---

**Good luck! Remember: integration early and often. 🚀**
