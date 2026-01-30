---
id: style-hemingway
type: reference
related_ids: [constitution, doc-standard]
---

# Style Hemingway - The Iceberg Principle

> **Philosophy**: Code is the iceberg. Comments are the tip.
> **Mandate**: High signal. Low noise.
> **Enforcement**: Reject verbosity.

## 1. The Iceberg Principle

```typescript
// ❌ WRONG: The iceberg is above water
// This function loops through all users and filters
// out the inactive ones, then maps them to a new
// format that includes only id and name properties
function getActiveUsers(users: User[]): SimplifiedUser[] {
  return users
    .filter(user => user.isActive)
    .map(user => ({ id: user.id, name: user.name }));
}

// ✅ CORRECT: The iceberg is below water
function getActiveUsers(users: User[]): SimplifiedUser[] {
  return users
    .filter(u => u.isActive)
    .map(u => ({ id: u.id, name: u.name }));
}
```

**Rule**: Code explains WHAT. Comments explain WHY (only when non-obvious).

## 2. Type-First Design

```typescript
// ❌ WRONG: Types come after
function fetchUser(id: number) {
  // Fetches user from API and returns user object with id, name, email
  return fetch(`/api/users/${id}`).then(r => r.json());
}

// ✅ CORRECT: Types come first
interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

**Rule**: Type signature IS the documentation.

## 3. No "What" Comments

```typescript
// ❌ WRONG
// Loop through items
items.forEach(item => {
  // Process each item
  processItem(item);
});

// ❌ WRONG
// Check if user exists
if (user) {
  // Show dashboard
  return <Dashboard />;
}

// ✅ CORRECT
items.forEach(processItem);

if (user) {
  return <Dashboard />;
}
```

**Rule**: If comment restates code, DELETE IT.

## 4. Newspaper Structure

```typescript
// ❌ WRONG: Important logic buried at bottom
export default function UserProfile() {
  const handleClick = () => { /* ... */ };
  const handleSubmit = () => { /* ... */ };
  const formatDate = (d: Date) => { /* ... */ };

  // Main logic at bottom
  const { user } = useLoaderData<typeof loader>();
  if (!user) return <NotFound />;

  return <Profile user={user} />;
}

// ✅ CORRECT: Important logic at top
export default function UserProfile() {
  const { user } = useLoaderData<typeof loader>();

  if (!user) return <NotFound />;

  const handleSubmit = () => { /* ... */ };

  return <Profile user={user} onSubmit={handleSubmit} />;
}
```

**Rule**: Critical paths first. Helpers at bottom.

## 5. Early Returns

```typescript
// ❌ WRONG: Nested conditions
function processUser(user?: User) {
  if (user) {
    if (user.isActive) {
      if (user.email) {
        return sendEmail(user.email);
      }
    }
  }
}

// ✅ CORRECT: Guard clauses
function processUser(user?: User) {
  if (!user) return;
  if (!user.isActive) return;
  if (!user.email) return;

  return sendEmail(user.email);
}
```

**Rule**: Fail fast. Exit early.

## 6. Max Nesting: 3 Levels

```typescript
// ❌ WRONG: Depth of 4
if (a) {
  if (b) {
    if (c) {
      if (d) {  // TOO DEEP
        doSomething();
      }
    }
  }
}

// ✅ CORRECT: Flatten with early returns
if (!a) return;
if (!b) return;
if (!c) return;
if (!d) return;

doSomething();

// ✅ CORRECT: Extract function
function shouldProcess() {
  return a && b && c && d;
}

if (shouldProcess()) {
  doSomething();
}
```

**Rule**: If nesting > 3, refactor.

## 7. One Responsibility

```typescript
// ❌ WRONG: Function does too much
function handleUserSubmit(data: FormData) {
  // Validate
  if (!data.email) return;
  if (!data.password) return;

  // Transform
  const user = {
    email: data.email.toLowerCase(),
    password: hashPassword(data.password),
  };

  // Save
  database.save(user);

  // Notify
  sendEmail(user.email);

  // Redirect
  navigate('/dashboard');
}

// ✅ CORRECT: Single responsibility
function handleUserSubmit(data: FormData) {
  const validation = validateUser(data);
  if (!validation.valid) return;

  const user = transformUser(data);
  saveUser(user);
  notifyUser(user);
  redirect('/dashboard');
}
```

**Rule**: Function does ONE thing.

## 8. No Fluff Words

```typescript
// ❌ WRONG
interface IUserData {
  userData: string;
  userInfo: UserInformation;
  userManager: AbstractUserManager;
}

// ✅ CORRECT
interface User {
  name: string;
  profile: Profile;
  repository: UserRepository;
}
```

**Rule**: Delete prefixes (I, Abstract, Base). Delete suffixes (Data, Info, Manager).

## 9. Variable Naming

```typescript
// ❌ WRONG: Verbose
const listOfActiveUsers = users.filter(u => u.isActive);
const numberOfItems = items.length;

// ✅ CORRECT: Concise
const activeUsers = users.filter(u => u.isActive);
const itemCount = items.length;

// ❌ WRONG: Abbreviations (except common ones)
const usr = getUser();
const btn = document.querySelector('button');

// ✅ CORRECT
const user = getUser();
const button = document.querySelector('button');

// ✅ ACCEPTABLE: i, j, k for loops
for (let i = 0; i < items.length; i++) {
  // ...
}
```

**Rule**: Clear > Clever. Short > Verbose.

## 10. Boolean Naming

```typescript
// ❌ WRONG
const active = user.status === 'active';
const data = hasData();

// ✅ CORRECT
const isActive = user.status === 'active';
const hasData = checkData();
```

**Rule**: Booleans start with is/has/can/should.

## 11. Constants

```typescript
// ❌ WRONG: Magic numbers
setTimeout(callback, 3600000);

// ✅ CORRECT: Named constant
const ONE_HOUR_MS = 3600000;
setTimeout(callback, ONE_HOUR_MS);

// ❌ WRONG: String repeated
if (role === 'admin') { /* ... */ }
if (role === 'admin') { /* ... */ }

// ✅ CORRECT: Enum or const
const ROLE = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

if (role === ROLE.ADMIN) { /* ... */ }
```

**Rule**: Name magic values. Use once.

## 12. Function Length

```typescript
// ❌ WRONG: 50+ lines in one function
function processOrder(order: Order) {
  // Validation (10 lines)
  // Transformation (15 lines)
  // Business logic (20 lines)
  // Side effects (10 lines)
}

// ✅ CORRECT: Extract sub-functions
function processOrder(order: Order) {
  const validation = validateOrder(order);
  if (!validation.valid) return validation;

  const transformed = transformOrder(order);
  const result = applyBusinessLogic(transformed);

  notifyStakeholders(result);
  return result;
}
```

**Rule**: If function > 30 lines, consider splitting.

## 13. Comments (Rare Exceptions)

```typescript
// ✅ CORRECT: Comment explains WHY
// API requires ISO 8601 format despite docs saying Unix timestamp
const timestamp = date.toISOString();

// ✅ CORRECT: Comment explains non-obvious business rule
// Trial users get 7 days, but weekends don't count
const trialDays = calculateBusinessDays(7);

// ✅ CORRECT: TODO with context
// TODO: Replace with WebSocket after API v2 launches (Q2 2026)
const data = await pollEndpoint();

// ❌ WRONG: Comment explains WHAT
// Get user from database
const user = await db.getUser(id);
```

**Rule**: Comment WHY, not WHAT.

## 14. TypeScript Over Comments

```typescript
// ❌ WRONG
type Status = string;  // Can be 'pending', 'active', 'completed'

// ✅ CORRECT
type Status = 'pending' | 'active' | 'completed';

// ❌ WRONG
interface User {
  age: number;  // Must be >= 18
}

// ✅ CORRECT
interface User {
  age: AdultAge;
}

type AdultAge = number & { readonly __brand: 'AdultAge' };

function validateAge(age: number): age is AdultAge {
  return age >= 18;
}
```

**Rule**: Encode constraints in types.

## 15. Import Organization

```typescript
// ✅ CORRECT: Auto-sorted by prettier-plugin-organize-imports
import type { LoaderFunctionArgs } from 'react-router';
import { json, useLoaderData } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button';
import { formatDate } from '@/utils/date';
```

**Rule**: Type imports first. Tool handles sorting.

## ⛔ Anti-Patterns

```typescript
// 🚫 Meta-talk in docs
"In this section, we will explore..." // ❌
"The section covers..." // ✅

// 🚫 Redundant variable names
getUserData()  // ❌
getUser()      // ✅

// 🚫 Hungarian notation
strName: string;  // ❌
name: string;     // ✅

// 🚫 Commented-out code
// const oldImplementation = () => { /* ... */ };  // ❌
// USE git history

// 🚫 Noise words
interface IUserData { /* ... */ }           // ❌
interface User { /* ... */ }                // ✅

class AbstractBaseManager { /* ... */ }     // ❌
class UserRepository { /* ... */ }          // ✅
```

## Related Docs

- Constitution: [constitution.md](./constitution.md)
- Doc Standard: [doc-standard.md](../guides/doc-standard.md)
