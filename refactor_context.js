const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'context', 'MockDataContext.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace hardcoded states with empty arrays
content = content.replace(/const \[departments, setDepartments\] = useState\(\[[\s\S]*?\]\);/, 'const [departments, setDepartments] = useState([]);');
content = content.replace(/const \[categories, setCategories\] = useState\(\[[\s\S]*?\]\);/, 'const [categories, setCategories] = useState([]);');
content = content.replace(/const \[employees, setEmployees\] = useState\(\[[\s\S]*?\]\);/, 'const [employees, setEmployees] = useState([]);');
content = content.replace(/const \[assets, setAssets\] = useState\(\[[\s\S]*?\]\);/, 'const [assets, setAssets] = useState([]);');
content = content.replace(/const \[allocations, setAllocations\] = useState\(\[[\s\S]*?\]\);/, 'const [allocations, setAllocations] = useState([]);');
content = content.replace(/const \[transferRequests, setTransferRequests\] = useState\(\[[\s\S]*?\]\);/, 'const [transferRequests, setTransferRequests] = useState([]);');
content = content.replace(/const \[bookings, setBookings\] = useState\(\[[\s\S]*?\]\);/, 'const [bookings, setBookings] = useState([]);');
content = content.replace(/const \[maintenanceRequests, setMaintenanceRequests\] = useState\(\[[\s\S]*?\]\);/, 'const [maintenanceRequests, setMaintenanceRequests] = useState([]);');
content = content.replace(/const \[auditCycles, setAuditCycles\] = useState\(\[[\s\S]*?\]\);/, 'const [auditCycles, setAuditCycles] = useState([]);');
content = content.replace(/const \[notifications, setNotifications\] = useState\(\[[\s\S]*?\]\);/, 'const [notifications, setNotifications] = useState([]);');
content = content.replace(/const \[activityLogs, setActivityLogs\] = useState\(\[[\s\S]*?\]\);/, 'const [activityLogs, setActivityLogs] = useState([]);');

// Also remove the fallback logic in loginUser
content = content.replace(/\} catch \(error\) \{[\s\S]*?return \{ ok: true, user: loggedInUser, message: error.message \};\s*\}/, 
`} catch (error) {
      return { ok: false, message: error.message || 'Login failed' };
    }`);

// Also remove fallback in signupUser
content = content.replace(/\} catch \(error\) \{[\s\S]*?return \{ ok: true, user: fallbackUser, message: error.message \};\s*\}/,
`} catch (error) {
      return { ok: false, message: error.message || 'Signup failed' };
    }`);

// For addAsset
content = content.replace(/\} catch \(error\) \{[\s\S]*?return \{ ok: true, asset: newAsset, message: error.message \};\s*\}/,
`} catch (error) {
      return { ok: false, message: error.message || 'Failed to add asset' };
    }`);

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('Refactored MockDataContext.jsx');
