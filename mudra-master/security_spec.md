# Security Specification: Mudra Practice and User Progress Database

## 1. Data Invariants
- **User Document (/users/{userId})**:
  - The document ID (`userId`) must exactly match the authenticated user's ID (`request.auth.uid`).
  - There must be no phantom fields beyond the defined schema.
  - The level must be one of 'Beginner (Sadhaka)', 'Practitioner (Sadhaka)', or 'Master (Acharya)', or general level string boundaries.
  - Mastery points must be non-negative integers.
- **MudraProgress Document (/users/{userId}/progress/{mudraId})**:
  - The parent collection user ID must match the document owner's authenticated user ID.
  - The database is relational; any subcollection update must be on behalf of the owner.
  - `highestScore` must be a non-negative integer between 0 and 100 inclusive.
  - `totalPracticeSessions` must be a non-negative integer.

---

## 2. The "Dirty Dozen" Malicious Payloads

We define 12 malicious payloads targeting Identity, Integrity, and State boundaries:

1. **Payload 1: Identity Spoofing (Write to another user's document)**
   - Attempting to write a `User` document under `/users/attacker_uid` using auth details of `victim_uid`.
2. **Payload 2: Shadow Field Injection (Ghost Verification)**
   - Attempting to update profile status or setting `isAdmin: true` in the user document object.
3. **Payload 3: Score Exaggeration (Score > 100)**
   - Setting a mudra progress accuracy to `highestScore: 99999`.
4. **Payload 4: Negative Practice Counter**
   - Injecting `totalPracticeSessions: -100` to corrupt analytics.
5. **Payload 5: ID Poisoning (Massive Size Attack)**
   - Overloading the path parameter with a 500-character malicious string for the `mudraId`.
6. **Payload 6: Unauthenticated Creation**
   - Attempting to initiate or seed user records with `request.auth == null` (with no authenticated uid).
7. **Payload 7: Privilege Escalation**
   - Injecting a boolean `isGuru: true` or `role: 'acharya'` into the user document properties.
8. **Payload 8: Orphaning Child Subcollection Documents**
   - Writing mudra progress inside `/users/victim_uid/progress/pataka` with attacker auth.
9. **Payload 9: State Shortcutting**
   - Updating `tutorialCompleted` directly on a document that contains progress information for high-level unlocked mudras without matching constraints.
10. **Payload 10: Timestamp Spoofing (Client Drift)**
    - Providing static historical Client Timestamps (e.g., `lastBackupAt`) instead of Firestore server timestamps (when `request.time` is mandated).
11. **Payload 11: Value Type Poisoning**
    - Writing a Boolean value `true` for `totalMasteryPoints` instead of an integer.
12. **Payload 12: Blanket Multi-user Query Extraction**
    - Executing wide collection group queries on `/users` or `/progress` seeking private email details of other participants.

---

## 3. Test Cases (TDD)
Below are assertions representing `firestore.rules.test.ts`.

```typescript
// Test suites validating protection barriers on firestore.rules
describe("Firestore Rules security validation suite", () => {
  it("blocks user from writing to another user's document path (Identity Spoofing)", async () => {
    // Assert write to /users/victim_uid with attacker credentials is PERMISSION_DENIED
  });

  it("blocks shadow fields like isAdmin (Interference / Poisoning)", async () => {
    // Assert update set adding isAdmin: true is PERMISSION_DENIED
  });

  it("blocks highestScore above 100 on mudra achievements", async () => {
    // Assert write highestScore: 105 is PERMISSION_DENIED
  });

  it("blocks negative integer sessions counters", async () => {
    // Assert write totalPracticeSessions: -5 is PERMISSION_DENIED
  });
});
```
