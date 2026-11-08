KANIFNATH KSK RATE BOOK - STARTER APP
=====================================

WHAT THIS APP DOES
- Opens on a phone like an app (Progressive Web App / PWA).
- Searches items by name.
- Shows exact text values from your Google Sheet for PurRet and SalesRet.
- Shows all other filled columns under each item.
- Everyone with the published app link can view rates.

IMPORTANT: YOUR GOOGLE SHEET
The spreadsheet link was supplied, but its contents could not be read automatically here.
This starter app expects the FIRST ROW to contain column headings, including:
  Item Name | PurRet | SalesRet
Other columns can have any names and will also appear in the item details.
If your headings are different, edit the three alias lists near the top of app.js.
Do not put two different values in one column. Keep one item per row.

STEP 1 - PREPARE THE GOOGLE SHEET
1. Open your Google Sheet.
2. Keep the column headings in row 1. Recommended:
   Item Name | PurRet | SalesRet | Company | Packing | GST | Stock | ...
3. Make sure each product is one row.
4. To let everyone view it: click Share -> General access -> Anyone with the link -> Viewer -> Done.
   OR use File -> Share -> Publish to web, choose the required sheet/tab, and publish.
5. Never give the public app Editor access to your sheet. Viewer is enough.
6. If you do not want all prices public, do not publish this sheet publicly; use a private login/backend instead.

STEP 2 - CREATE A GITHUB ACCOUNT AND REPOSITORY
1. Visit https://github.com and create/sign in to your account.
2. Click the + button -> New repository.
3. Repository name: kanifnath-ksk
4. Choose Public (GitHub Pages needs a public repo on free accounts in the usual setup).
5. Click Create repository.

STEP 3 - UPLOAD THESE FILES
1. Unzip the downloaded ZIP on your computer.
2. Open the new GitHub repository.
3. Click Add file -> Upload files.
4. Upload everything INSIDE the kanifnath-ksk-app folder (index.html, app.js, styles.css,
   manifest.webmanifest, service-worker.js, README-MR-EN.txt and the assets folder).
5. Click Commit changes.

STEP 4 - PUBLISH THE APP
1. In the repository, open Settings -> Pages.
2. Under Build and deployment choose "Deploy from a branch".
3. Branch: main; Folder: /(root); click Save.
4. Wait a few minutes. GitHub will show your website address, usually:
   https://YOUR-GITHUB-USERNAME.github.io/kanifnath-ksk/
5. Open that address on your phone.

STEP 5 - INSTALL ON PHONE
Android Chrome: open the app link -> menu (three dots) -> Install app / Add to Home screen.
iPhone Safari: open the app link -> Share -> Add to Home Screen.

IF RATES DO NOT LOAD
- Check the sheet is shared as Anyone with the link / Viewer, or published to web.
- Confirm the tab ID (GID) is 0. It is already set to 0 in app.js.
- Confirm the first row includes Item Name, PurRet and SalesRet.
- Open app.js on GitHub and edit SHEET_ID / GID if using another spreadsheet/tab.
- Wait a minute, then press Refresh in the app.
- If the sheet uses different headings, add the exact heading text to ITEM_HEADERS,
  PUR_HEADERS or SALES_HEADERS at the top of app.js.

SECURITY / PRICE ACCURACY
- Anyone who can access a public app can see the prices. Do not store private customer data.
- The app displays the cell values as received; it does not calculate or round rates.
- Always verify the rate in the original sheet before billing.
- GitHub Pages hosts the app files; Google Sheets remains the data source.

CUSTOMISING
- Change app title/name in index.html and manifest.webmanifest.
- Replace assets/logo.png to change the logo.
- Change colours at the top of styles.css.
