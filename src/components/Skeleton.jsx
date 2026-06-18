import React from 'react';

export function CardSkeleton() {
  return (
    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse">
      <div className="w-full h-44 bg-gray-200 rounded-xl mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-1/3"></div>
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="px-6 py-4"><div className="h-6 bg-gray-200 roundedw-16"></div></td>
      <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-14"></div></td>
    </tr>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="w-64 bg-gray-50 h-screen p-6 border-r border-gray-100 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-10"></div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-11 bg-gray-200 rounded-xl w-full"></div>
        ))}
      </div>
    </div>
  );
}
