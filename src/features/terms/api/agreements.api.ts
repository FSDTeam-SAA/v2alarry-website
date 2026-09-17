import { api } from "@/lib/api";

import { CURRENT_AGREEMENT_VERSION } from "../agreement";

export async function acceptCurrentAgreement(): Promise<void> {
  await api.post("/users/me/agreements", {
    agreement_version: CURRENT_AGREEMENT_VERSION,
    source: "consent-gate",
  });
}
