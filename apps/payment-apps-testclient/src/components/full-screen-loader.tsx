export const FullScreenLoader = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="h-3 w-3 animate-bounce rounded-full bg-primary" />
          <div className="animation-delay-200 h-3 w-3 animate-bounce rounded-full bg-primary" />
          <div className="animation-delay-400 h-3 w-3 animate-bounce rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
};
