import re

with open('frontend/client/src/components/Dashboard.jsx', 'r') as f:
    t = f.read()

# Add clearedNotificationIds
t = re.sub(
    r'const readNotificationIds = useRef\(new Set\(\)\);',
    'const readNotificationIds = useRef(new Set());\n  const clearedNotificationIds = useRef(new Set());',
    t
)

# Fix fetchNotifications to filter
t = re.sub(
    r'chats: \(data\.chats \|\| \[\]\)\.map\(\(c\) => \(\{([\s\S]*?)\}\)\),',
    r'chats: (data.chats || []).filter((c) => !clearedNotificationIds.current.has(c.id)).map((c) => ({\1})),',
    t
)
t = re.sub(
    r'commits: \(data\.commits \|\| \[\]\)\.map\(\(c\) => \(\{([\s\S]*?)\}\)\),',
    r'commits: (data.commits || []).filter((c) => !clearedNotificationIds.current.has(c.id)).map((c) => ({\1})),',
    t
)

# Fix onClick for single clear
t = re.sub(
    r'readNotificationIds\.current\.add\(notification\.id\);',
    r'readNotificationIds.current.add(notification.id);\n                              clearedNotificationIds.current.add(notification.id);',
    t
)

# Fix Clear all
clear_all_logic = """(notifications.chats || []).forEach((n) => {
                            readNotificationIds.current.add(n.id);
                            clearedNotificationIds.current.add(n.id);
                          });
                          (notifications.commits || []).forEach((n) => {
                            readNotificationIds.current.add(n.id);
                            clearedNotificationIds.current.add(n.id);
                          });"""
t = re.sub(
    r'\(notifications\.chats \|\| \[\]\)\.forEach\(\(n\) =>[\s\S]*?readNotificationIds\.current\.add\(n\.id\),[\s\S]*?\);[\s\S]*?\(notifications\.commits \|\| \[\]\)\.forEach\(\(n\) =>[\s\S]*?readNotificationIds\.current\.add\(n\.id\),[\s\S]*?\);',
    clear_all_logic,
    t
)

with open('frontend/client/src/components/Dashboard.jsx', 'w') as f:
    f.write(t)
