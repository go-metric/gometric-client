/** Plain-HTML privacy policy for Google OAuth scrapers (and /privacy route). */
export const privacyPolicyHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Privacy Policy — gometric</title>
  <meta name="description" content="gometric privacy policy: how we collect, use, store, share, and delete personal data and Google/YouTube user data under the Google API Services User Data Policy (Limited Use)." />
  <style>
    body { font-family: Georgia, "Times New Roman", serif; line-height: 1.6; color: #1a1a1a; max-width: 44rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    h1 { font-size: 2rem; line-height: 1.2; margin: 0 0 0.5rem; }
    h2 { font-size: 1.25rem; margin: 2rem 0 0.75rem; }
    p, li { font-size: 1rem; }
    ul { padding-left: 1.25rem; }
    a { color: #b33a00; }
    .meta { color: #555; margin-bottom: 2rem; }
    .box { border: 1px solid #ddd; padding: 1rem 1.25rem; margin: 1.5rem 0; background: #fafafa; }
  </style>
</head>
<body>
  <p><a href="https://gometric.social/">← gometric.social homepage</a></p>
  <h1>Privacy Policy for gometric</h1>
  <p class="meta">Effective / last updated: October 23, 2026<br />
  Application / brand: <strong>gometric</strong> (https://gometric.social)<br />
  Contact: <a href="mailto:hello@gometric.io">hello@gometric.io</a></p>

  <div class="box">
    <p><strong>Summary for Google OAuth verification:</strong> gometric is a social media management application. When you connect YouTube, we access Google user data only to provide YouTube features in gometric (channel info, publishing, comments, analytics). We do not sell Google user data, do not use it for ads, credit, or AI training, and we delete it within 30 days after you disconnect or delete your account (except limited legal/security records).</p>
  </div>

  <h2>1. Who we are</h2>
  <p>This Privacy Policy is for the <strong>gometric</strong> application and website operated at <a href="https://gometric.social/">https://gometric.social/</a>. gometric lets you connect your own social accounts to schedule posts, manage inbox messages and comments, view analytics, and download reports.</p>
  <p>Questions or privacy requests: email <a href="mailto:hello@gometric.io">hello@gometric.io</a>.</p>

  <h2>2. Information we collect</h2>
  <p>We may collect, or process on behalf of our customers, the following categories of personal data when you use or interact with our products and services:</p>
  <ul>
    <li>Account details you provide: name, email address, hashed password, brand/workspace name, handle, website, industry, timezone, and settings.</li>
    <li>Billing-related plan status. Full payment card numbers are processed by our payment provider and are not stored in full on our servers.</li>
    <li>Content you create: captions, titles, uploaded media, schedules, drafts, publishing logs, and reports.</li>
    <li>Technical data: IP address, browser/device information, approximate location from IP, pages viewed, and product usage events.</li>
    <li>Support communications you send us.</li>
    <li>Data from social networks you connect (Instagram, TikTok, YouTube/Google, X, LinkedIn, Threads, Pinterest, Facebook, Google Business Profile, as available), limited to the permissions you approve.</li>
  </ul>

  <h2>3. What Google user data is accessed by gometric</h2>
  <p>Our application will access Google user data you authorize through Google’s OAuth consent screen when you connect YouTube. Depending on the scopes you approve, this includes:</p>
  <ul>
    <li>Google account identifiers needed for OAuth.</li>
    <li>YouTube channel id, title, custom URL/handle, and thumbnail.</li>
    <li>Your channel’s video list and video metadata (title, description, privacy status, thumbnails, statistics).</li>
    <li>Video files and metadata you choose to upload or manage through gometric.</li>
    <li>Comment threads on your videos that you choose to view or reply to.</li>
    <li>YouTube Analytics metrics for your channel or videos (for example views and engagement).</li>
  </ul>
  <p>Google OAuth scopes we may request: <code>https://www.googleapis.com/auth/youtube.readonly</code>, <code>https://www.googleapis.com/auth/yt-analytics.readonly</code>, <code>https://www.googleapis.com/auth/youtube.upload</code>, and <code>https://www.googleapis.com/auth/youtube.force-ssl</code>.</p>
  <p>gometric uses the YouTube Data API v3 and YouTube Analytics API.</p>

  <h2>4. How gometric uses Google user data</h2>
  <p>We will use your Google user data to provide you with the services you requested in gometric, specifically:</p>
  <ul>
    <li>Connecting and displaying your YouTube channel in Settings and Analytics.</li>
    <li>Publishing or updating videos you create in Compose.</li>
    <li>Reading and replying to YouTube comments in Inbox when you use that feature.</li>
    <li>Showing YouTube performance metrics and reports.</li>
  </ul>
  <p>We will not sell your Google user data to third parties. We use Google user data only to provide or improve these user-facing features that are prominent in the gometric interface. We do not use Google user data for any other purpose.</p>
  <p>gometric's use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.</p>

  <h2>5. How we share, transfer, or disclose Google user data</h2>
  <p>We do not transfer or disclose your Google user data to third parties for purposes other than the ones provided below:</p>
  <ul>
    <li>Back to Google/YouTube when you publish content or sync data through their APIs.</li>
    <li>Infrastructure service providers who process data for us under contract to host and operate gometric (for example cloud hosting), solely to provide the Service.</li>
    <li>When required for security investigations or to comply with applicable law.</li>
    <li>As part of a merger, acquisition, or sale of assets, with notice or consent where required.</li>
  </ul>
  <p>We do not transfer Google user data for targeted advertising, selling to data brokers, information resellers, credit-worthiness or lending, personalized/retargeted/interest-based ads, or training generalized AI/ML models.</p>

  <h2>6. Data protection mechanisms for Google user data</h2>
  <p>Security procedures are in place to protect the confidentiality of your data. We use encryption to protect your information:</p>
  <ul>
    <li>HTTPS/TLS encryption in transit.</li>
    <li>Encryption at rest for OAuth access and refresh tokens and other sensitive credentials.</li>
    <li>Access controls so only systems needed to operate the Service can use stored tokens.</li>
  </ul>
  <p>No method of transmission or storage is 100% secure, but we work to protect Google user data against unauthorized access.</p>

  <h2>7. Data retention and deletion</h2>
  <p>We store your personal information for a period of time that is consistent with our business purposes — while your account is active and as needed to provide gometric.</p>
  <p>We will retain your personal information for the length of time needed to fulfill the purposes outlined in this privacy policy unless a longer retention period is required or permitted by law.</p>
  <p>When the data retention period expires for a given type of data, we will delete or destroy it, or anonymize it.</p>
  <p>You may request for your data to be deleted by emailing <a href="mailto:hello@gometric.io">hello@gometric.io</a>, or by disconnecting YouTube in Settings → Accounts, or by deleting your gometric account. You may also revoke gometric’s Google access at <a href="https://myaccount.google.com/permissions">https://myaccount.google.com/permissions</a>.</p>
  <p>After you disconnect YouTube or delete your account, we delete or anonymize stored Google user data for that connection within <strong>30 days</strong>, except limited records we must keep for security, dispute resolution, or legal compliance (for example billing records). Backups rotate on a limited schedule.</p>

  <h2>8. Limited Use — prohibited uses</h2>
  <p>gometric does <strong>not</strong> use Google user data for:</p>
  <ul>
    <li>Targeted, personalized, retargeted, or interest-based advertising</li>
    <li>Selling to data brokers or providing to information resellers</li>
    <li>Determining credit-worthiness or lending</li>
    <li>Creating unrelated databases for sale</li>
    <li>Developing, improving, or training generalized / non-personalized AI or ML models</li>
  </ul>
  <p>Humans are not allowed to read Google user data unless you give affirmative permission for support, it is necessary for security, it is required by law, or the data is aggregated for internal operations under applicable law.</p>

  <h2>9. Other social networks</h2>
  <p>When you connect Instagram, TikTok, X, LinkedIn, Threads, Pinterest, Facebook, or Google Business Profile, we receive only the data allowed by that network’s OAuth permissions, and we use it only to provide the corresponding features in gometric (publish, inbox, analytics). Tokens are stored encrypted. You can disconnect any network in Settings → Accounts.</p>

  <h2>10. Cookies</h2>
  <p>We use essential cookies for sign-in and security. We may use analytics cookies (including Google Analytics on the marketing site) where enabled. You can control cookies in your browser. Google Analytics on the website is separate from YouTube API access you grant inside the product.</p>

  <h2>11. Children</h2>
  <p>gometric is not directed to children under 16 (or the minimum age in your country). We do not knowingly collect personal information from children. Contact hello@gometric.io if you believe a child provided us data.</p>

  <h2>12. Changes</h2>
  <p>We may update this Privacy Policy. We will change the “last updated” date above and, for material changes (including how we handle Google user data), provide additional notice as appropriate. Continued use after an update means you accept the revised Policy where allowed by law.</p>

  <h2>13. Contact</h2>
  <p>Privacy and Google user data requests: <a href="mailto:hello@gometric.io">hello@gometric.io</a><br />
  Homepage: <a href="https://gometric.social/">https://gometric.social/</a><br />
  This policy: <a href="https://gometric.social/privacy">https://gometric.social/privacy</a><br />
  Same document (static file): <a href="https://gometric.social/privacy.html">https://gometric.social/privacy.html</a></p>
</body>
</html>
`
