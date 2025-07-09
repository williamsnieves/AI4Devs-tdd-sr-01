## initial prompt

# Senior Software Engineer - Testing Strategy & Implementation

## Role & Context
You are a **Senior Software Engineer** with deep expertise in:
- **TypeScript & Node.js** backend development
- **React** frontend development  
- **Jest** testing framework
- **Test-Driven Development (TDD)** methodologies
- **SOLID principles** application in testing

## Project Context
Based on the provided README.md, you're working on the **LTI - Talent Tracking System**, a full-stack application with:
- **Backend**: Express.js + TypeScript + Prisma ORM
- **Frontend**: React + TypeScript
- **Database**: PostgreSQL
- **Architecture**: Clean Architecture (domain, application, presentation layers)

## Chain of Thought Process

### Step 1: Analysis & Understanding
**Think through the following systematically:**

1. **Codebase Analysis**
   - What are the main components/services that need testing?
   - What are the critical business logic flows?
   - What external dependencies exist (database, file system, APIs)?
   - What are the current testing gaps?

2. **Risk Assessment**
   - What are the highest-risk areas that could break?
   - What are the most complex business rules?
   - What integrations are most fragile?

3. **Testing Strategy Questions**
   - What testing levels are needed (unit, integration, e2e)?
   - What should be mocked vs. real implementations?
   - How can we achieve maximum coverage with minimum maintenance?

### Step 2: Solution Proposals

**Provide at least 2 comprehensive testing approaches:**

#### Solution A: [Name and brief description]
- **Backend Testing Strategy**: [Detailed approach]
- **Frontend Testing Strategy**: [Detailed approach]
- **Mocking Strategy**: [Approach to mocks]
- **Pros**: [Benefits]
- **Cons**: [Limitations]

#### Solution B: [Name and brief description]
- **Backend Testing Strategy**: [Detailed approach]
- **Frontend Testing Strategy**: [Detailed approach]
- **Mocking Strategy**: [Approach to mocks]
- **Pros**: [Benefits]
- **Cons**: [Limitations]

### Step 3: Recommendation & Justification

**Choose the best solution and explain why:**
- **Selected Solution**: [A or B]
- **Justification**: [Detailed reasoning based on project needs, maintainability, coverage, etc.]

### Step 4: Implementation Plan

**Create a detailed implementation roadmap:**

#### Backend Testing Implementation
1. **Unit Tests**
   - Domain Models (Candidate, Education, WorkExperience, Resume)
   - Application Services (candidateService, fileUploadService)
   - Validators
   - Controllers

2. **Integration Tests**
   - API endpoints
   - Database operations
   - File upload functionality

3. **Mocking Strategy**
   - Prisma Client mocks
   - File system mocks
   - External service mocks

#### Frontend Testing Implementation
1. **Component Tests**
   - RecruiterDashboard
   - AddCandidateForm
   - FileUploader

2. **Integration Tests**
   - API service integration
   - Form submission flows
   - File upload workflows

3. **Mocking Strategy**
   - API service mocks
   - File system mocks
   - React component mocks

### Step 5: Test Cases Definition

**For each component/service, define:**

#### Base Cases
- Happy path scenarios
- Standard user interactions
- Expected data flows

#### Corner Cases
- Edge cases and boundary conditions
- Error scenarios
- Network failures
- Invalid inputs
- Resource constraints

#### AAA Pattern Implementation
For each test, structure using:
- **Arrange**: Setup test data, mocks, and preconditions
- **Act**: Execute the functionality being tested
- **Assert**: Verify expected outcomes

### Step 6: SOLID Principles in Testing

**Ensure tests follow SOLID principles:**
- **Single Responsibility**: Each test has one clear purpose
- **Open/Closed**: Tests are extensible without modification
- **Liskov Substitution**: Mocks can replace real implementations
- **Interface Segregation**: Test interfaces are focused and minimal
- **Dependency Inversion**: Tests depend on abstractions, not concretions

### Step 7: "Fake It 'Til You Make It" Implementation

**Apply this TDD technique by:**
1. Writing failing tests first
2. Implementing minimal code to make tests pass
3. Refactoring while keeping tests green
4. Gradually building real functionality

## Required Deliverables

### 1. Questions for Clarification
**Ask any necessary questions about:**
- Business requirements
- Technical constraints
- Testing priorities
- Performance requirements
- Security considerations

### 2. Test File Structure

backend/src/tests/
├── unit/
│ ├── domain/
│ ├── application/
│ └── presentation/
├── integration/
└── mocks/
frontend/src/tests/
├── components/
├── services/
├── utils/
└── mocks/


### 3. Mock Implementations
- Database mocks (Prisma)
- API service mocks
- File system mocks
- External dependency mocks

### 4. Change List & Reasoning

**Provide a detailed list of all changes with justification:**

| Component/File | Change Type | Description | Reasoning |
|---------------|-------------|-------------|-----------|
| [filename] | [add/modify/delete] | [description] | [business/technical justification] |

### 5. Testing Configuration
- Jest configuration updates
- Test environment setup
- CI/CD integration considerations

## Success Criteria

**Tests should achieve:**
- [ ] >90% code coverage
- [ ] All critical paths tested
- [ ] Fast execution (<30s total)
- [ ] Maintainable and readable
- [ ] Proper error handling coverage
- [ ] Integration points validated
- [ ] Edge cases covered
- [ ] SOLID principles followed

## Best Practices to Follow

1. **Test Naming**: Descriptive test names that explain the scenario
2. **Test Independence**: Tests don't depend on each other
3. **Mock Strategy**: Mock external dependencies, not internal logic
4. **Data Management**: Use test data builders/factories
5. **Assertion Quality**: Specific, meaningful assertions
6. **Test Maintenance**: Easy to update when requirements change

---

**Now, please analyze the codebase and provide your comprehensive testing strategy following this chain of thought process.**