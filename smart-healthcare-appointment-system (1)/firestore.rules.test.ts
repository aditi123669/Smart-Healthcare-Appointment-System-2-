import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";

let testEnv: RulesTestEnvironment;

describe("Firestore Security Rules", () => {
    beforeAll(async () => {
        testEnv = await initializeTestEnvironment({
            projectId: "smart-healthcare-system-65931",
            firestore: {
                rules: readFileSync("DRAFT_firestore.rules", "utf8"),
            },
        });
    });

    afterAll(async () => {
        await testEnv.cleanup();
    });

    beforeEach(async () => {
        await testEnv.clearFirestore();
    });

    it("denies identity spoofing for appointments", async () => {
        const alice = testEnv.authenticatedContext("alice", { email: "alice@example.com", email_verified: true });
        await assertFails(
            alice.firestore().collection("appointments").add({
                patientId: "bob",
                doctorId: "doc1",
                date: "2023-10-01",
                time: "10:00",
                status: "Upcoming"
            })
        );
    });

    it("allows user to book for themselves", async () => {
        const alice = testEnv.authenticatedContext("alice", { email: "alice@example.com", email_verified: true });
        await assertSucceeds(
            alice.firestore().collection("appointments").add({
                patientId: "alice",
                doctorId: "doc1",
                date: "2023-10-01",
                time: "10:00",
                status: "Upcoming"
            })
        );
    });

    it("denies doctor data access to other users", async () => {
        const alice = testEnv.authenticatedContext("alice", { email: "alice@example.com", email_verified: true });
        await assertFails(
            alice.firestore().collection("doctor_data").doc("doc1").collection("waiting_list").get()
        );
    });

    it("allows doctor to access their own data", async () => {
        const doc1 = testEnv.authenticatedContext("doc1", { email: "doc1@example.com", email_verified: true });
        await assertSucceeds(
            doc1.firestore().collection("doctor_data").doc("doc1").collection("waiting_list").get()
        );
    });

    it("denies unverified email from writing", async () => {
        const unverified = testEnv.authenticatedContext("alice", { email: "alice@example.com", email_verified: false });
        await assertFails(
            unverified.firestore().collection("users").doc("alice").set({
                name: "Alice",
                email: "alice@example.com",
                role: "patient"
            })
        );
    });
});
