const fs = require('fs');
let content = fs.readFileSync('./client/src/components/Dashboard.jsx', 'utf8');

// The dock code starts with `      {/* GLOBAL CHAT DOCK (Right-To-Left Stacking) */}` and ends before `          return (` ?
// Let's find the dock code exactly.
const dockStart = content.indexOf(`      {/* GLOBAL CHAT DOCK (Right-To-Left Stacking) */}`);
const dockEnd = content.indexOf(`      </div>\n\n  );`); 
const dockCode = content.substring(dockStart, dockEnd + `      </div>\n`.length);

// Replace the misinjected dock code with `  );`
content = content.replace(dockCode + `\n  );`, `  );`);

// Now inject the dockCode at the VERY END of the component return statement.
// The end of the component is:
//       )}
//
//         );
// };
//
// export default Dashboard;

// Let's replace the final `        );` with `\n${dockCode}\n        );`
content = content.replace(/\s*\);\s*\};\s*export default Dashboard;/, `\n${dockCode}\n  );\n};\n\nexport default Dashboard;`);

fs.writeFileSync('./client/src/components/Dashboard.jsx', content);
