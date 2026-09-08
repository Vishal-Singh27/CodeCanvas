import re

with open('frontend/client/src/components/Dashboard.jsx', 'r') as f:
    t = f.read()

# Replace refs
t = re.sub(
    r'const readNotificationIds = useRef\(new Set\(\)\);\s*const clearedNotificationIds = useRef\(new Set\(\)\);',
    r'''const readNotificationIds = useRef(new Set(JSON.parse(localStorage.getItem("read_notifications") || "[]")));
  const clearedNotificationIds = useRef(new Set(JSON.parse(localStorage.getItem("cleared_notifications") || "[]")));
  const saveNotificationState = () => {
    localStorage.setItem("cleared_notifications", JSON.stringify(Array.from(clearedNotificationIds.current)));
    localStorage.setItem("read_notifications", JSON.stringify(Array.from(readNotificationIds.current)));
  };''',
    t
)

# Add saveNotificationState() to Clear all
t = re.sub(
    r'clearedNotificationIds\.current\.add\(n\.id\);\s*\}\);\s*setNotifications\(\{',
    r'clearedNotificationIds.current.add(n.id);\n                          });\n                          saveNotificationState();\n                          setNotifications({',
    t
)

# Add saveNotificationState() to single click
t = re.sub(
    r'readNotificationIds\.current\.add\(notification\.id\);\s*setNotifications\(\(prev\)',
    r'readNotificationIds.current.add(notification.id);\n                              saveNotificationState();\n                              setNotifications((prev)',
    t
)

with open('frontend/client/src/components/Dashboard.jsx', 'w') as f:
    f.write(t)
