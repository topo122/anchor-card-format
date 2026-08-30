---
id: 01M1AJ7SBRANT19WMPBCED32KH
tags: [http, redirects]
---

# 302 and 307 in reply to a POST

What may the client do with the request method when it follows each of them?

<!-- hint -->
One of the two was specified to put an end to a long-standing user agent habit.

<!-- back -->
After 302 Found the user agent is allowed to change the method to GET, which is what browsers have historically done. 307 Temporary Redirect requires the method and the body to be preserved, so the POST is repeated against the new URI.

<!-- note -->
RFC 9110, section 15.4 (Redirection 3xx).
