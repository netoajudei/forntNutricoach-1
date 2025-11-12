export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-40 w-full bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-40 w-full bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-40 w-full bg-gray-200 rounded-2xl animate-pulse" />
        </div>
        <div className="mt-8">
          <div className="h-24 w-full bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}





