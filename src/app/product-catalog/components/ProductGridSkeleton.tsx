const ProductGridSkeleton = () => {
  const skeletons = Array.from({ length: 8 }, (_, i) => `skeleton-${i}`);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {skeletons.map((id) => (
        <div
          key={id}
          className="flex flex-col overflow-hidden rounded-lg bg-card shadow-warm-sm"
        >
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="flex flex-1 flex-col p-4">
            <div className="mb-2 h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="mb-2 h-5 w-full animate-pulse rounded bg-muted" />
            <div className="mb-3 h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-auto flex items-center justify-between">
              <div className="h-6 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGridSkeleton;
