/*
Small helper that prints a browser console snippet to seed a dev session.
Usage: node scripts/seed-dev-session.js
Copy the printed snippet into the browser console while running the app.
*/

const snippet = `// Dev session snippet - paste into browser console
window.localStorage.setItem('biostack_session_v1', JSON.stringify({ uid: 'dev-user', displayName: 'Dev Tester', isAnonymous: false, ts: Date.now() }));
window.location.reload();
`;

console.log(snippet);
