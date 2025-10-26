interface LoadingAbsoluteProps {
  show?: boolean
  blurAmount?: 'sm' | 'md' | 'lg' | 'xl'
  label?: string
}

export const LoadingAbsolute = ({
  show,
  blurAmount = 'xl',
  label = 'Loading...'
}: LoadingAbsoluteProps) => {
  if (!show) return null

  const blurClass = `backdrop-blur-${blurAmount}`

  return (
    <div
      className={`absolute flex items-center justify-center z-50 bg-orange-50 ${blurClass} top-0 bottom-0 right-0 left-0 dark:bg-slate-900/50`}
      style={{
        position: 'fixed',
        top: -32,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}
    >
      <div className="flex flex-col items-center">
        {/* Party SVG with animations */}
        <div className="relative mb-6">
          {/* Main party icon */}
          <div className="relative">
            <svg
              className="w-16 h-16 text-orange-500 animate-bounce"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Party hat */}
              <path
                d="M50 10 L35 45 L65 45 Z"
                fill="currentColor"
                className="animate-pulse"
              />
              <circle
                cx="50"
                cy="15"
                r="3"
                fill="#ef4444"
                className="animate-ping"
              />

              {/* Confetti pieces */}
              <rect
                x="20"
                y="25"
                width="3"
                height="3"
                fill="#f59e0b"
                className="animate-pulse"
                style={{ animationDelay: '0.2s' }}
              />
              <rect
                x="75"
                y="30"
                width="3"
                height="3"
                fill="#10b981"
                className="animate-pulse"
                style={{ animationDelay: '0.4s' }}
              />
              <circle
                cx="25"
                cy="35"
                r="1.5"
                fill="#3b82f6"
                className="animate-ping"
                style={{ animationDelay: '0.6s' }}
              />
              <circle
                cx="80"
                cy="20"
                r="1.5"
                fill="#ef4444"
                className="animate-ping"
                style={{ animationDelay: '0.3s' }}
              />
              <rect
                x="15"
                y="40"
                width="2"
                height="2"
                fill="#8b5cf6"
                className="animate-pulse"
                style={{ animationDelay: '0.8s' }}
              />
              <rect
                x="85"
                y="35"
                width="2"
                height="2"
                fill="#ec4899"
                className="animate-pulse"
                style={{ animationDelay: '0.1s' }}
              />
            </svg>
          </div>

          {/* Floating confetti around the main icon */}
          <div
            className="absolute -top-2 -left-2 w-2 h-2 bg-yellow-400 rounded animate-float"
            style={{ animationDelay: '0s' }}
          ></div>
          <div
            className="absolute -top-1 right-0 w-1.5 h-1.5 bg-pink-400 rounded animate-float"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute top-2 -right-3 w-2 h-2 bg-blue-400 rounded animate-float"
            style={{ animationDelay: '2s' }}
          ></div>
          <div
            className="absolute bottom-0 -left-3 w-1.5 h-1.5 bg-green-400 rounded animate-float"
            style={{ animationDelay: '1.5s' }}
          ></div>
          <div
            className="absolute -bottom-2 right-1 w-2 h-2 bg-purple-400 rounded animate-float"
            style={{ animationDelay: '0.5s' }}
          ></div>
        </div>

        {/* Enhanced loading text */}
        <div className="text-center">
          <span className="text-orange-600 font-semibold text-xl tracking-wide animate-pulse">
            {label}
          </span>
          <div className="flex justify-center mt-3 space-x-1">
            <div
              className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
            opacity: 1;
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
