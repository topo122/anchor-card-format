---
id: 01M1AJBZ50NT4RZTVB2WRMH46P
tags: [http, authentication]
---

# 401 and 403

Which of the two invites the client to try again with different credentials?

<!-- back -->
401 Unauthorized. The request lacked valid credentials, and the response must carry a `WWW-Authenticate` header describing the challenge, so retrying with credentials is the expected next step. 403 Forbidden says the server understood the request and refuses to authorize it; different credentials are not what is missing.

<!-- note -->
RFC 9110, section 15.5 (Client Error 4xx).
