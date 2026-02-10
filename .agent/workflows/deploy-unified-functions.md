---
description: How to deploy the unified Sirsi Nexus Cloud Functions
---

1. Ensure you are at the repository root: `/Users/thekryptodragon/Development/SirsiNexusApp`
// turbo
2. Build the functions package:
   `npm --prefix packages/sirsi-auth/functions run build`
// turbo
3. Deploy the unified functions to Firebase:
   `firebase deploy --only functions:sirsi-auth`
4. Verify the deployment in the Firebase Console or via:
   `firebase functions:log --only sirsi-auth`
