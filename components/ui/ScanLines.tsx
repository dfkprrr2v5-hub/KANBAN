'use client';

export const ScanLines = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        backgroundImage: `repeating-linear-gradient(
          0deg,
          rgba(255, 107, 53, 0.1) 0px,
          rgba(255, 107, 53, 0.1) 1px,
          transparent 1px,
          transparent 2px
        )`,
        animation: 'scan-line 8s linear infinite',
      }}
    />
  );
};
