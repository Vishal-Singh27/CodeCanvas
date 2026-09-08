import re

with open('frontend/client/src/components/Dashboard.jsx', 'r') as f:
    t = f.read()

t = t.replace(
    '<div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-transparent overflow-y-auto p-6 md:p-8">',
    '<div className="w-full h-full flex flex-col items-center text-gray-500 bg-transparent overflow-y-auto p-6 md:p-8">'
)

t = t.replace(
    '<div className="max-w-3xl w-full flex flex-col items-center">',
    '<div className="max-w-3xl w-full flex flex-col items-center m-auto py-8">'
)

with open('frontend/client/src/components/Dashboard.jsx', 'w') as f:
    f.write(t)
