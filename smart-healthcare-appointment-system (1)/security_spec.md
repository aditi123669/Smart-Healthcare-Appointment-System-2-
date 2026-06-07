# Firestore Security Specification

## Data Invariants
- **Appointment Integrity**: `patientId` must match the authenticated user during creation.
- **Doctor Exclusivity**: `/doctor_data/{doctorId}` subcollections are strictly private to the doctor with that ID.
- **User Privacy**: `/users/{userId}` can only be accessed by the user whose ID matches `{userId}`.
- **System Data**: Hospitals, doctors, and medicines are read-only for public/authenticated users.

## The Dirty Dozen Payloads (Rejection Targets)
1. **Identity Spoofing (Appointment)**: Authenticated user A trying to create an appointment with `patientId: "userB"`.
2. **State Shortcutting (Appointment)**: Patient trying to update appointment status to "Completed".
3. **Queue Poisoning**: Non-doctor user trying to write to `/doctor_data/{doctorId}/waiting_list`.
4. **Unauthorized Read (Call History)**: User A trying to read user B's call history.
5. **Role Escalation**: Patient trying to update their role to "doctor" in their profile.
6. **Ghost Appointment**: Creating an appointment with a `patientId` that doesn't exist in `/users`.
7. **Malformed ID**: Creating a document with a 2KB string as an ID.
8. **Shadow Field Injection**: Adding an `isAdmin: true` field to a user profile.
9. **Relational Sync Break**: Creating an appointment for a `doctorId` that doesn't exist in `/doctors`.
10. **Terminal State Lock**: Trying to update a "Cancelled" appointment back to "Upcoming".
11. **PII Leak**: Public user trying to list all user profiles.
12. **Timestamp Fraud**: Providing a `createdAt` value from the past instead of `request.time`.

## Security Rules Test Setup
(Tests will be implemented in `firestore.rules.test.ts` during development)
