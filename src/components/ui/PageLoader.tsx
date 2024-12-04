import { LoadingSpinner } from './LoadingSpinner';

export function PageLoader() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-[#105283] font-medium">Loading...</p>
      </div>
    </div>
  );
}