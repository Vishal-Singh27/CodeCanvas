import re

with open('frontend/client/src/components/Dashboard.jsx', 'r') as f:
    t = f.read()

# Fix individual notification onClick: just mark as read, don't remove from list!
new_onclick = """onClick={() => {
                              readNotificationIds.current.add(notification.id);
                              setNotifications((prev) => ({
                                chats: (prev.chats || []).map(c => c.id === notification.id ? { ...c, unread: false } : c),
                                commits: (prev.commits || []).map(c => c.id === notification.id ? { ...c, unread: false } : c),
                              }));
                            }}"""

t = re.sub(
    r'onClick=\{\(\) => \{[\s\S]*?readNotificationIds\.current\.add\(notification\.id\);[\s\S]*?clearedNotificationIds\.current\.add\(notification\.id\);[\s\S]*?setNotifications\(\(prev\) => \(\{[\s\S]*?chats: \(prev\.chats \|\| \[\]\)\.filter\([\s\S]*?\(c\) => c\.id !== notification\.id,[\s\S]*?\),[\s\S]*?commits: \(prev\.commits \|\| \[\]\)\.filter\([\s\S]*?\(c\) => c\.id !== notification\.id,[\s\S]*?\),[\s\S]*?\}\)\);[\s\S]*?\}\}',
    new_onclick,
    t
)

with open('frontend/client/src/components/Dashboard.jsx', 'w') as f:
    f.write(t)
